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
   * Initialize trading pairs from config
   */
  private initializePairs(): TokenPair[] {
    return config.monitoring.watchedPairs
      .filter((pair) => pair.enabled)
      .map((pair) => ({
        ...pair,
        token0Address: getTokenAddress(pair.token0),
        token1Address: getTokenAddress(pair.token1),
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
      // For demonstration: we'll use a single router and simulate price differences
      // In production, you'd query multiple actual DEX routers

      const router = new ethers.Contract(
        routerAddress,
        UNISWAP_V2_ROUTER_ABI,
        this.provider
      );

      // Get token decimals
      const token0 = new ethers.Contract(token0Address, ERC20_ABI, this.provider);
      const decimals0 = await token0.decimals();

      // Amount: 1 token (scaled by decimals)
      const amountIn = ethers.parseUnits("1", decimals0);

      // Trading path: token0 -> token1
      const path = [token0Address, token1Address];

      // Get amounts out
      const amounts = await router.getAmountsOut(amountIn, path);
      
      // Price = how many token1 per 1 token0
      const amountOut = amounts[1];
      const token1 = new ethers.Contract(token1Address, ERC20_ABI, this.provider);
      const decimals1 = await token1.decimals();
      
      const price = parseFloat(ethers.formatUnits(amountOut, decimals1));

      // Simulate different prices for different DEXes
      // In production, each DEX would have its own router address
      let adjustedPrice = price;
      if (dexName === "Sushiswap") {
        // Simulate Sushiswap having slightly different prices
        adjustedPrice = price * (1 + (Math.random() * 0.02 - 0.01)); // ±1% variance
      } else if (dexName === "Curve") {
        adjustedPrice = price * (1 + (Math.random() * 0.015 - 0.0075)); // ±0.75% variance
      }

      return {
        dexName,
        price: adjustedPrice,
        liquidity: 1000000, // Simulated liquidity - in production, calculate from reserves
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error(`Failed to get price from ${dexName}`, error);
      // Return a fallback price to keep the bot running
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

    // In production, you'd query multiple DEX routers
    // For demo, we simulate multiple DEXes with price variations
    const prices = await Promise.all([
      this.getPriceFromDex(
        "Uniswap",
        config.dexes.uniswapV2Router,
        pair.token0Address,
        pair.token1Address
      ),
      this.getPriceFromDex(
        "Sushiswap",
        config.dexes.uniswapV2Router, // Using same router but simulating different prices
        pair.token0Address,
        pair.token1Address
      ),
      this.getPriceFromDex(
        "Curve",
        config.dexes.uniswapV2Router,
        pair.token0Address,
        pair.token1Address
      ),
    ]);

    // Filter out failed price fetches
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

      // Estimate profit in USD (assuming $1000 trade size)
      const tradeSize = 1000; // $1000 trade
      const profitUsd = (tradeSize * profitPercent) / 100;

      // Estimate gas costs
      // Flash loan + 2 swaps ≈ 300,000 gas
      const gasLimit = 300000n;
      const gasPrice = await this.provider.getFeeData();
      const gasCostWei = gasLimit * (gasPrice.gasPrice || 0n);
      const gasCostEth = parseFloat(ethers.formatEther(gasCostWei));
      
      // Assume ETH = $2000 for gas cost calculation
      const ethPriceUsd = 2000;
      const estimatedGasCost = gasCostEth * ethPriceUsd;

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
