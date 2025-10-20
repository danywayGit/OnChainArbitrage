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
// PRICE MONITOR CLASS
// ============================================================================

export class PriceMonitor {
  private provider: ethers.JsonRpcProvider;
  private pairs: TokenPair[];
  private routerContract: ethers.Contract;

  constructor(provider: ethers.JsonRpcProvider) {
    this.provider = provider;
    this.pairs = this.initializePairs();
    this.routerContract = new ethers.Contract(
      config.dexes.uniswapV2Router,
      UNISWAP_V2_ROUTER_ABI,
      provider
    );
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
   * Get price from a DEX using Uniswap V2 formula
   * 
   * HOW IT WORKS:
   * 1. Calls getAmountsOut on the DEX router
   * 2. Passes in 1 token (scaled by decimals) and the trading path
   * 3. Returns how many of token1 you'd get for 1 token0
   */
  private async getPriceFromDex(
    dexName: string,
    routerAddress: string,
    token0Address: string,
    token1Address: string
  ): Promise<DexPrice> {
    try {
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

      // Each DEX has its own liquidity pools, so prices naturally differ
      return {
        dexName,
        price: price,
        liquidity: 1000000, // Simulated liquidity - in production, calculate from reserves
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

    // Query multiple LOW-FEE Uniswap V2-compatible DEX routers on Polygon
    // All have 0.3% fees - focusing on verified pairs with real liquidity
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
      // Dfyn removed - only 2/9 pairs had real liquidity, rest were fake pools
      // this.getPriceFromDex(
      //   "dfyn",
      //   config.dexes.dfyn,
      //   pair.token0Address,
      //   pair.token1Address
      // ),
      // ApeSwap removed - limited pool coverage on Polygon
      // this.getPriceFromDex(
      //   "apeswap",
      //   config.dexes.apeswap,
      //   pair.token0Address,
      //   pair.token1Address
      // ),
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
