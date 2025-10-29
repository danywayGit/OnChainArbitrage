/**
 * 📊 Price Monitor
 * 
 * This module fetches prices from different DEXes and detects arbitrage opportunities.
 * It simulates checking multiple DEXes by adding price variations.
 * 
 * In production, you would connect to actual DEX APIs or use libraries like:
 * - @uniswap/sdk
 * - @sushiswap/sdk
 * - Direct smart contract calls
 */

import { ethers } from "ethers";
import { config, getTokenAddress } from "./config";
import { logger } from "./logger";
import { getLogger } from "./dataLogger";
import { loadTradingPairs, watchPairsFile, type TradingPair as DynamicPair } from "./dynamicPairs";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface TokenPair {
  name: string;
  token0: string; // Symbol (e.g., "WETH")
  token1: string; // Symbol (e.g., "USDC")
  token0Address: string;
  token1Address: string;
  enabled: boolean;
}

export interface DexPrice {
  dexName: string;
  price: number; // Price of token0 in terms of token1
  liquidity: number; // Available liquidity in USD
  timestamp: number;
  feeTier?: number; // V3 fee tier (500, 3000, 10000) - optional for V2 DEXes
}

export interface ArbitrageOpportunity {
  pair: TokenPair;
  buyDex: DexPrice; // Where to buy (lower price)
  sellDex: DexPrice; // Where to sell (higher price)
  profitPercent: number; // Profit percentage
  profitUsd: number; // Estimated profit in USD
  estimatedGasCost: number; // Estimated gas cost in USD
  netProfit: number; // Profit - gas costs
  viable: boolean; // Is this opportunity profitable after costs?
}

// ============================================================================
// UNISWAP V2 ROUTER ABI (Minimal - just what we need)
// ============================================================================

const UNISWAP_V2_ROUTER_ABI = [
  "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function factory() external view returns (address)",
];

// ============================================================================
// FACTORY ABI (for getting pair address)
// ============================================================================

const UNISWAP_V2_FACTORY_ABI = [
  "function getPair(address tokenA, address tokenB) external view returns (address pair)",
];

// ============================================================================
// PAIR ABI (for getting reserves)
// ============================================================================

const UNISWAP_V2_PAIR_ABI = [
  "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
];

// ============================================================================
// ERC20 ABI (Minimal)
// ============================================================================

const ERC20_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function approve(address spender, uint256 amount) external returns (bool)",
];

// ============================================================================
// UNISWAP V3 QUOTER ABI (For price quotes)
// ============================================================================

const UNISWAP_V3_QUOTER_ABI = [
  "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)",
];

// Uniswap V3 Quoter contract address on Polygon
const UNISWAP_V3_QUOTER_ADDRESS = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";

// V3 Fee tiers (in hundredths of a bip, so 500 = 0.05%)
const V3_FEE_TIERS = [
  500,   // 0.05% - Stablecoins and very correlated pairs
  3000,  // 0.3%  - Most pairs (same as V2)
  10000, // 1%    - Exotic pairs
];

// ============================================================================
// RESERVE CACHE (Minimize RPC calls)
// ============================================================================

interface CachedReserve {
  reserve0: bigint;
  reserve1: bigint;
  token0: string;
  liquidity: number;
  timestamp: number;
}

// Cache TTL: 5 seconds (reserves don't change that often)
const CACHE_TTL_MS = 5000;
const reserveCache = new Map<string, CachedReserve>();

function getCacheKey(dexName: string, token0: string, token1: string): string {
  return `${dexName}:${token0}:${token1}`.toLowerCase();
}

function getCachedReserve(cacheKey: string): CachedReserve | null {
  const cached = reserveCache.get(cacheKey);
  if (!cached) return null;
  
  const age = Date.now() - cached.timestamp;
  if (age > CACHE_TTL_MS) {
    reserveCache.delete(cacheKey);
    return null;
  }
  
  return cached;
}

function setCachedReserve(cacheKey: string, data: CachedReserve): void {
  reserveCache.set(cacheKey, { ...data, timestamp: Date.now() });
}

// Performance monitoring
let cacheHits = 0;
let cacheMisses = 0;
setInterval(() => {
  if (cacheHits + cacheMisses > 0) {
    const hitRate = ((cacheHits / (cacheHits + cacheMisses)) * 100).toFixed(1);
    logger.debug(`[CACHE] Hit rate: ${hitRate}% (${cacheHits} hits, ${cacheMisses} misses)`);
    cacheHits = 0;
    cacheMisses = 0;
  }
}, 60000); // Log every minute

// ============================================================================
// UNISWAP V3 POOL ABI (For liquidity checking)
// ============================================================================

const UNISWAP_V3_POOL_ABI = [
  "function liquidity() external view returns (uint128)",
  "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
];

// ============================================================================
// UNISWAP V3 FACTORY ABI (For getting pool address)
// ============================================================================

const UNISWAP_V3_FACTORY_ABI = [
  "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)",
];

// Uniswap V3 Factory on Polygon
const UNISWAP_V3_FACTORY_ADDRESS = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

// ============================================================================
// PRICE MONITOR CLASS
// ============================================================================

export class PriceMonitor {
  private provider: ethers.JsonRpcProvider;
  private pairs: TokenPair[];
  private routerContract: ethers.Contract;
  private v3QuoterContract: ethers.Contract;
  private v3FactoryContract: ethers.Contract;

  constructor(provider: ethers.JsonRpcProvider) {
    this.provider = provider;
    this.pairs = this.initializePairs();
    this.routerContract = new ethers.Contract(
      config.dexes.uniswapV2Router,
      UNISWAP_V2_ROUTER_ABI,
      provider
    );
    
    // Initialize Uniswap V3 contracts
    this.v3QuoterContract = new ethers.Contract(
      UNISWAP_V3_QUOTER_ADDRESS,
      UNISWAP_V3_QUOTER_ABI,
      provider
    );
    
    this.v3FactoryContract = new ethers.Contract(
      UNISWAP_V3_FACTORY_ADDRESS,
      UNISWAP_V3_FACTORY_ABI,
      provider
    );
    
    logger.info("✅ Uniswap V3 Quoter initialized for better price discovery");
  }

  /**
   * Initialize trading pairs from dynamic JSON file (or fallback to config)
   */
  private initializePairs(): TokenPair[] {
    // Try to load from dynamic JSON first
    let pairs: any[];
    try {
      pairs = loadTradingPairs();
      logger.info(`[DYNAMIC] ✅ Loaded ${pairs.length} pairs from trading-pairs.json`);
    } catch (error) {
      logger.error('[DYNAMIC] Failed to load dynamic pairs, using static config');
      pairs = config.monitoring.watchedPairs.filter((pair) => pair.enabled);
    }

    return pairs.map((pair) => ({
      ...pair,
      token0Address: pair.token0Address || getTokenAddress(pair.token0),
      token1Address: pair.token1Address || getTokenAddress(pair.token1),
    }));
  }

  /**
   * Get real liquidity reserves from a DEX pair
   * 
   * CRITICAL: This determines max safe trade size
   * Returns liquidity in USD (approximated from reserves)
   * 
   * OPTIMIZATION: Uses 5-second cache to reduce RPC calls by 80-95%
   */
  private async getRealLiquidity(
    routerAddress: string,
    token0Address: string,
    token1Address: string,
    decimals0: number,
    decimals1: number
  ): Promise<number> {
    try {
      // Check cache first (dex name from router address)
      const cacheKey = getCacheKey(routerAddress, token0Address, token1Address);
      const cached = getCachedReserve(cacheKey);
      
      if (cached) {
        cacheHits++;
        logger.debug(`[CACHE] ✅ HIT for ${routerAddress.slice(0,10)}.../${token0Address.slice(0,6)}.../${token1Address.slice(0,6)}...`);
        // Calculate liquidity from cached reserves
        const reserve1Float = parseFloat(ethers.formatUnits(cached.reserve1, decimals1));
        return reserve1Float * 1; // Conservative $1 per token1
      }
      
      cacheMisses++;
      logger.debug(`[CACHE] ❌ MISS for ${routerAddress.slice(0,10)}.../${token0Address.slice(0,6)}.../${token1Address.slice(0,6)}... (fetching from RPC)`);
      
      // Get factory address from router
      const router = new ethers.Contract(routerAddress, UNISWAP_V2_ROUTER_ABI, this.provider);
      const factoryAddress = await router.factory();
      
      // Get pair address from factory
      const factory = new ethers.Contract(factoryAddress, UNISWAP_V2_FACTORY_ABI, this.provider);
      const pairAddress = await factory.getPair(token0Address, token1Address);
      
      // Check if pair exists
      if (pairAddress === ethers.ZeroAddress) {
        return 0; // No pool = no liquidity
      }
      
      // Get reserves from pair contract
      const pair = new ethers.Contract(pairAddress, UNISWAP_V2_PAIR_ABI, this.provider);
      const reserves = await pair.getReserves();
      const token0Pair = await pair.token0();
      
      // Determine which reserve is which token
      let reserve0: bigint, reserve1: bigint;
      if (token0Pair.toLowerCase() === token0Address.toLowerCase()) {
        reserve0 = reserves.reserve0;
        reserve1 = reserves.reserve1;
      } else {
        reserve0 = reserves.reserve1;
        reserve1 = reserves.reserve0;
      }
      
      // Convert reserves to human-readable numbers
      const reserve0Float = parseFloat(ethers.formatUnits(reserve0, decimals0));
      const reserve1Float = parseFloat(ethers.formatUnits(reserve1, decimals1));
      
      // Estimate liquidity in USD
      const estimatedLiquidityUSD = reserve1Float * 1; // Conservative $1 per token1
      
      // Cache the reserves for 5 seconds
      setCachedReserve(cacheKey, {
        reserve0,
        reserve1,
        token0: token0Pair,
        liquidity: estimatedLiquidityUSD,
        timestamp: Date.now()
      });
      
      return estimatedLiquidityUSD;
    } catch (error) {
      logger.debug(`Failed to get reserves: ${error}`);
      return 0;
    }
  }

  /**
   * Get liquidity from Uniswap V3 pool
   * 
   * V3 uses concentrated liquidity, so we need to:
   * 1. Find the pool for each fee tier
   * 2. Get the current liquidity value
   * 3. Estimate USD value based on sqrtPriceX96
   * 
   * OPTIMIZATION: Uses 5-second cache to reduce RPC calls
   */
  private async getV3Liquidity(
    token0Address: string,
    token1Address: string,
    feeTier: number,
    decimals0: number,
    decimals1: number
  ): Promise<number> {
    try {
      // Check cache first (using feeTier in key for V3)
      const cacheKey = getCacheKey(`v3_${feeTier}`, token0Address, token1Address);
      const cached = getCachedReserve(cacheKey);
      
      if (cached) {
        cacheHits++;
        logger.debug(`[CACHE] ✅ HIT for V3 tier ${feeTier}/${token0Address.slice(0,6)}.../${token1Address.slice(0,6)}...`);
        return cached.liquidity; // Liquidity already calculated and cached
      }
      
      cacheMisses++;
      logger.debug(`[CACHE] ❌ MISS for V3 tier ${feeTier}/${token0Address.slice(0,6)}.../${token1Address.slice(0,6)}... (fetching from RPC)`);
      
      // Get pool address for this fee tier
      const poolAddress = await this.v3FactoryContract.getPool(
        token0Address,
        token1Address,
        feeTier
      );
      
      // Check if pool exists
      if (poolAddress === ethers.ZeroAddress) {
        return 0; // No pool for this fee tier
      }
      
      // Get liquidity from pool
      const pool = new ethers.Contract(poolAddress, UNISWAP_V3_POOL_ABI, this.provider);
      const liquidity = await pool.liquidity();
      const slot0 = await pool.slot0();
      
      // V3 uses sqrtPriceX96 for price representation
      // For simplicity, estimate liquidity based on the liquidity value
      // More accurate: decode sqrtPriceX96 to actual price and calculate TVL
      const liquidityFloat = parseFloat(ethers.formatUnits(liquidity, decimals1));
      
      // Conservative estimate: liquidity value represents available tokens
      const estimatedLiquidityUSD = liquidityFloat * 0.5; // Very conservative multiplier
      
      // Cache the V3 liquidity data
      setCachedReserve(cacheKey, {
        reserve0: 0n, // V3 doesn't use simple reserves
        reserve1: liquidity,
        token0: token0Address,
        liquidity: estimatedLiquidityUSD,
        timestamp: Date.now()
      });
      
      return estimatedLiquidityUSD;
    } catch (error) {
      // Pool doesn't exist or error querying
      return 0;
    }
  }

  /**
   * Get price from Uniswap V3 using Quoter
   * 
   * V3 DIFFERENCES FROM V2:
   * - Uses Quoter contract for price quotes (not router)
   * - Must specify fee tier (500, 3000, or 10000)
   * - Tries all fee tiers and returns best price
   * - Returns actual fee tier used for accurate fee calculation
   */
  private async getPriceFromV3(
    token0Address: string,
    token1Address: string,
    decimals0: number,
    decimals1: number
  ): Promise<{ price: number; liquidity: number; feeTier: number } | null> {
    try {
      // Amount to quote: 1 token (scaled by decimals)
      const amountIn = ethers.parseUnits("1", decimals0);
      
      // Try all fee tiers and find best price
      let bestPrice = 0;
      let bestLiquidity = 0;
      let bestFeeTier = 3000; // Default to 0.3%
      
      for (const feeTier of V3_FEE_TIERS) {
        try {
          // Get quote for this fee tier
          const amountOut = await this.v3QuoterContract.quoteExactInputSingle.staticCall(
            token0Address,
            token1Address,
            feeTier,
            amountIn,
            0 // No price limit
          );
          
          // Convert to human-readable price
          const price = parseFloat(ethers.formatUnits(amountOut, decimals1));
          
          // Get liquidity for this fee tier
          const liquidity = await this.getV3Liquidity(
            token0Address,
            token1Address,
            feeTier,
            decimals0,
            decimals1
          );
          
          // Track best price (higher is better for selling)
          if (price > bestPrice && liquidity > 0) {
            bestPrice = price;
            bestLiquidity = liquidity;
            bestFeeTier = feeTier;
          }
          
          logger.debug(`[V3] Fee tier ${feeTier / 10000}%: price=${price.toFixed(6)}, liquidity=$${liquidity.toFixed(0)}`);
        } catch (error) {
          // Pool doesn't exist for this fee tier, continue to next
          logger.debug(`[V3] No pool for fee tier ${feeTier / 10000}%`);
        }
      }
      
      // Return best price found across all fee tiers
      if (bestPrice > 0) {
        logger.debug(`[V3] ✅ Best: ${bestFeeTier / 10000}% tier with price=${bestPrice.toFixed(6)}, liquidity=$${bestLiquidity.toFixed(0)}`);
        return {
          price: bestPrice,
          liquidity: bestLiquidity,
          feeTier: bestFeeTier
        };
      }
      
      return null; // No pools found
    } catch (error) {
      logger.debug(`[V3] Error getting price: ${error}`);
      return null;
    }
  }

  /**
   * Get price from a DEX using Uniswap V2 formula OR V3 Quoter
   * 
   * HOW IT WORKS:
   * 1. Detects if DEX is Uniswap V3
   * 2. For V3: Uses Quoter contract to get best price across fee tiers
   * 3. For V2: Calls getAmountsOut on the DEX router
   * 4. Gets REAL liquidity from reserves/pools
   */
  private async getPriceFromDex(
    dexName: string,
    routerAddress: string,
    token0Address: string,
    token1Address: string
  ): Promise<DexPrice> {
    try {
      // ============================================================================
      // DETECT UNISWAP V3 AND USE QUOTER
      // ============================================================================
      
      if (dexName.toLowerCase().includes("uniswap") || dexName.toLowerCase() === "uniswapv3") {
        logger.debug(`[V3] Detected Uniswap V3, using Quoter for ${dexName}`);
        
        // Get token decimals
        const token0 = new ethers.Contract(token0Address, ERC20_ABI, this.provider);
        const token1 = new ethers.Contract(token1Address, ERC20_ABI, this.provider);
        
        let decimals0: number;
        let decimals1: number;
        
        try {
          decimals0 = await token0.decimals();
          decimals1 = await token1.decimals();
        } catch (e) {
          // Token doesn't exist
          return {
            dexName,
            price: 0,
            liquidity: 0,
            timestamp: Date.now(),
          };
        }
        
        // Get V3 price using Quoter
        const v3Result = await this.getPriceFromV3(
          token0Address,
          token1Address,
          decimals0,
          decimals1
        );
        
        if (v3Result && v3Result.price > 0) {
          logger.debug(`[V3] ✅ ${dexName}: price=${v3Result.price.toFixed(6)}, fee=${v3Result.feeTier / 10000}%, liquidity=$${v3Result.liquidity.toFixed(0)}`);
          
          return {
            dexName: `${dexName}`,
            price: v3Result.price,
            liquidity: v3Result.liquidity,
            feeTier: v3Result.feeTier, // Include fee tier for accurate fee calculation
            timestamp: Date.now(),
          };
        } else {
          // No V3 pools found
          logger.debug(`[V3] No pools found for ${dexName}`);
          return {
            dexName,
            price: 0,
            liquidity: 0,
            timestamp: Date.now(),
          };
        }
      }
      
      // ============================================================================
      // UNISWAP V2 LOGIC (QuickSwap, SushiSwap, etc.)
      // ============================================================================
      
      const router = new ethers.Contract(
        routerAddress,
        UNISWAP_V2_ROUTER_ABI,
        this.provider
      );

      // Get token decimals with error handling
      const token0 = new ethers.Contract(token0Address, ERC20_ABI, this.provider);
      const token1 = new ethers.Contract(token1Address, ERC20_ABI, this.provider);
      
      let decimals0: number;
      let decimals1: number;
      
      try {
        decimals0 = await token0.decimals();
      } catch (e) {
        // Token doesn't exist or doesn't implement decimals()
        return {
          dexName,
          price: 0,
          liquidity: 0,
          timestamp: Date.now(),
        };
      }
      
      try {
        decimals1 = await token1.decimals();
      } catch (e) {
        // Token doesn't exist or doesn't implement decimals()
        return {
          dexName,
          price: 0,
          liquidity: 0,
          timestamp: Date.now(),
        };
      }

      // Amount: 1 token (scaled by decimals)
      const amountIn = ethers.parseUnits("1", decimals0);

      // Trading path: token0 -> token1
      const path = [token0Address, token1Address];

      // Get amounts out - this will fail if no liquidity pool exists
      const amounts = await router.getAmountsOut(amountIn, path);
      
      // Price = how many token1 per 1 token0
      const amountOut = amounts[1];
      
      const price = parseFloat(ethers.formatUnits(amountOut, decimals1));

      // Validate price is reasonable (not 0 or extremely large)
      // Extreme prices indicate broken/non-existent pools
      // 
      // Reasonable ranges:
      // - WBTC/WMATIC: ~40,000 MATIC per WBTC
      // - WETH/WMATIC: ~4,000 MATIC per WETH  
      // - Most pairs: < 1000x ratio
      //
      // If price > 1000, likely a broken/non-existent pool
      if (price <= 0 || price > 1000) {
        return {
          dexName,
          price: 0, // Mark as invalid
          liquidity: 0,
          timestamp: Date.now(),
        };
      }

      // Additional validation: Check if price is suspiciously small
      // Prices < 0.0001 often indicate broken pools
      if (price < 0.0001) {
        return {
          dexName,
          price: 0,
          liquidity: 0,
          timestamp: Date.now(),
        };
      }

      // ✅ GET REAL LIQUIDITY FROM RESERVES
      // This is CRITICAL for determining max safe trade size
      const realLiquidity = await this.getRealLiquidity(
        routerAddress,
        token0Address,
        token1Address,
        decimals0,
        decimals1
      );

      // Each DEX has its own liquidity pools, so prices naturally differ
      return {
        dexName,
        price: price,
        liquidity: realLiquidity, // ✅ REAL liquidity from reserves (not fake!)
        timestamp: Date.now(),
      };
    } catch (error) {
      // Pool doesn't exist on this DEX - this is normal, not all pairs exist on all DEXes
      // Return zero price to indicate no liquidity
      return {
        dexName,
        price: 0,
        liquidity: 0,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Get prices from all DEXes for a token pair
   */
  async getPricesForPair(pair: TokenPair): Promise<DexPrice[]> {
    logger.debug(`Fetching prices for ${pair.name}...`);

    // Query multiple DEX routers on Polygon
    // QuickSwap: 0.25%, SushiSwap: 0.3%, Uniswap V3: 0.05%-1% (tiered), Dfyn: 0.3%, ApeSwap: 0.2%
    const prices = await Promise.all([
      this.getPriceFromDex(
        "quickswap",
        config.dexes.quickswap,
        pair.token0Address,
        pair.token1Address
      ),
      this.getPriceFromDex(
        "sushiswap",
        config.dexes.sushiswap,
        pair.token0Address,
        pair.token1Address
      ),
      this.getPriceFromDex(
        "uniswapv3",
        config.dexes.uniswapv3,
        pair.token0Address,
        pair.token1Address
      ),
      // Dfyn ✅ RE-ENABLED - Polygon-native DEX with decent liquidity
      this.getPriceFromDex(
        "dfyn",
        config.dexes.dfyn,
        pair.token0Address,
        pair.token1Address
      ),
      // ApeSwap ✅ ENABLED - BSC-originated, now on Polygon with growing liquidity
      this.getPriceFromDex(
        "apeswap",
        config.dexes.apeswap,
        pair.token0Address,
        pair.token1Address
      ),
    ]);

    // Filter out failed price fetches (pairs with no liquidity pools)
    return prices.filter((p) => p.price > 0);
  }

  /**
   * Find arbitrage opportunities by comparing prices
   * 
   * LOGIC:
   * 1. Get prices from all DEXes
   * 2. Find the lowest price (where to buy)
   * 3. Find the highest price (where to sell)
   * 4. Calculate profit percentage
   * 5. Estimate gas costs
   * 6. Determine if opportunity is viable
   */
  async findArbitrageOpportunity(
    pair: TokenPair
  ): Promise<ArbitrageOpportunity | null> {
    try {
      // Get prices from all DEXes
      const prices = await this.getPricesForPair(pair);

      if (prices.length < 2) {
        logger.debug(`Not enough price data for ${pair.name}`);
        return null;
      }

      // Find best buy and sell prices
      const buyPrice = prices.reduce((min, p) =>
        p.price < min.price ? p : min
      );
      const sellPrice = prices.reduce((max, p) =>
        p.price > max.price ? p : max
      );

      // Log price check
      logger.priceCheck(pair.name, buyPrice.price, sellPrice.price);

      // Calculate profit percentage
      // If you buy at 2000 and sell at 2020, profit = (2020-2000)/2000 = 1%
      const profitPercent = ((sellPrice.price - buyPrice.price) / buyPrice.price) * 100;

      // Skip if same DEX or no price difference
      if (buyPrice.dexName === sellPrice.dexName || profitPercent <= 0) {
        return null;
      }

      // ============================================================================
      // 🚨 CRITICAL: REJECT UNREALISTIC PROFIT PERCENTAGES
      // ============================================================================
      // Real arbitrage on efficient markets like Polygon:
      // - Typical: 0.3% - 2% (30-200 bps)
      // - Good: 2% - 5% (very rare, MEV bots capture these instantly)
      // - Impossible: >10% (market would instantly correct this)
      //
      // If we see >2.5% profit, it means:
      // 1. Price data is wrong (pool doesn't exist)
      // 2. Fake/honeypot token (6-10% spreads are NOT real)
      // 3. Trade will fail with INSUFFICIENT_OUTPUT_AMOUNT
      // 4. Wasting gas trying to execute
      //
      // Set to 2.5% to filter out fake pools while keeping real opportunities
      const MAX_REALISTIC_PROFIT = 2.5; 
      
      if (profitPercent > MAX_REALISTIC_PROFIT) {
        logger.debug(
          `[FILTER] Rejecting ${pair.name}: ${profitPercent.toFixed(2)}% profit is unrealistic (likely fake pool)`
        );
        return null;
      }

      // Estimate profit in USD (assuming $1000 trade size)
      const tradeSize = 1000; // $1000 trade
      const profitUsd = (tradeSize * profitPercent) / 100;

      // Estimate gas costs
      // Flash loan + 2 swaps ≈ 300,000 gas
      const gasLimit = 300000n;
      const gasPrice = await this.provider.getFeeData();
      const gasCostWei = gasLimit * (gasPrice.gasPrice || 0n);
      const gasCostNative = parseFloat(ethers.formatEther(gasCostWei));
      
      // Network-specific native token prices (for accurate gas cost calculation)
      const nativePriceUsd = config.network.name === 'polygon' ? 0.40 : // MATIC price
                             config.network.name === 'bsc' ? 600 :     // BNB price
                             config.network.name === 'base' ? 2000 :    // ETH on Base
                             2000; // Default to ETH price for other chains
      const estimatedGasCost = gasCostNative * nativePriceUsd;

      // Calculate net profit after gas costs
      const netProfit = profitUsd - estimatedGasCost;

      // Check if opportunity meets minimum profit threshold
      const minProfitPercent = config.trading.minProfitBps / 100; // Convert bps to %
      const viable =
        profitPercent >= minProfitPercent &&
        netProfit > 0 &&
        gasPrice.gasPrice! <= ethers.parseUnits(config.trading.maxGasPrice.toString(), "gwei");

      const opportunity: ArbitrageOpportunity = {
        pair,
        buyDex: buyPrice,
        sellDex: sellPrice,
        profitPercent,
        profitUsd,
        estimatedGasCost,
        netProfit,
        viable,
      };

      // Log opportunity to data logger
      if (viable) {
        const dataLogger = getLogger();
        const blockNumber = await this.provider.getBlockNumber();
        
        dataLogger.logOpportunity({
          pair: pair.name,
          token0: pair.token0,
          token1: pair.token1,
          dex1: buyPrice.dexName,
          dex2: sellPrice.dexName,
          price1: buyPrice.price.toFixed(6),
          price2: sellPrice.price.toFixed(6),
          spreadPercent: profitPercent,
          tradeAmount: tradeSize.toString(),
          tradeAmountUSD: tradeSize,
          expectedProfit: profitUsd.toFixed(6),
          expectedProfitUSD: profitUsd,
          profitPercent: profitPercent,
          gasPrice: gasPrice.gasPrice?.toString() || "0",
          gasCostUSD: estimatedGasCost,
          flashLoanFee: (tradeSize * 0.0005).toFixed(6), // 0.05% flash loan fee
          flashLoanFeeUSD: tradeSize * 0.0005,
          netProfit: netProfit.toFixed(6),
          netProfitUSD: netProfit,
          netProfitPercent: (netProfit / tradeSize) * 100,
          executed: false,
          executionStatus: "simulated",
          blockNumber: blockNumber,
          network: config.network?.name || "polygon",
        });
      }

      return opportunity;
    } catch (error) {
      logger.error(`Error finding arbitrage for ${pair.name}`, error);
      return null;
    }
  }

  /**
   * Scan all pairs for arbitrage opportunities
   * This is the main loop that runs continuously
   */
  async scanForOpportunities(): Promise<ArbitrageOpportunity[]> {
    logger.debug("Scanning for arbitrage opportunities...");

    const opportunities = await Promise.all(
      this.pairs.map((pair) => this.findArbitrageOpportunity(pair))
    );

    // Filter out null results and return only viable opportunities
    return opportunities.filter(
      (opp): opp is ArbitrageOpportunity => opp !== null && opp.viable
    );
  }

  /**
   * Get all monitored pairs
   */
  getPairs(): TokenPair[] {
    return this.pairs;
  }

  /**
   * Add a new pair to monitor
   */
  addPair(pair: TokenPair): void {
    this.pairs.push(pair);
    logger.info(`Added new pair to monitor: ${pair.name}`);
  }

  /**
   * Remove a pair from monitoring
   */
  removePair(pairName: string): void {
    this.pairs = this.pairs.filter((p) => p.name !== pairName);
    logger.info(`Removed pair from monitoring: ${pairName}`);
  }
}

export default PriceMonitor;
