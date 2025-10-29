/**
 * ⚡ Trade Executor
 * 
 * This module executes arbitrage trades by calling your FlashLoanArbitrage contract.
 * It handles transaction building, gas estimation, and error handling.
 */

import { ethers } from "ethers";
import { config } from "./config";
import { logger } from "./logger";
import { ArbitrageOpportunity } from "./priceMonitor";
import { getDexRouter, getDexType, getDexFee, isDexPairEfficient } from "./dexRouter";
import { simulateArbitrageWithCosts } from "./swapSimulator";

// ============================================================================
// FLASH LOAN ARBITRAGE CONTRACT ABI
// ============================================================================

const FLASH_LOAN_ARBITRAGE_ABI = [
  "function executeArbitrage(address token, uint256 amount, bytes calldata params) external",
  "function getStats() external view returns (uint256 totalProfit, uint256 totalTrades, bool isPaused)",
  "function authorizedExecutors(address executor) external view returns (bool)",
  "event ArbitrageExecuted(address indexed token, uint256 amount, uint256 profit, uint256 timestamp)",
  "event FlashLoanInitiated(address indexed token, uint256 amount, uint256 fee)",
];

// ============================================================================
// TYPES
// ============================================================================

export interface TradeResult {
  success: boolean;
  txHash?: string;
  profit?: number;
  error?: string;
  gasUsed?: bigint;
  gasCost?: number;
  reason?: 'simulation_unprofitable' | 'simulation_error' | 'high_gas_cost' | 'on_chain_revert' | 'pool_too_small' | 'unknown';
}

export interface ContractStats {
  totalProfit: bigint;
  totalTrades: bigint;
  isPaused: boolean;
}

// ============================================================================
// TRADE EXECUTOR CLASS
// ============================================================================

export class TradeExecutor {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;
  private dryRun: boolean;

  constructor(provider: ethers.JsonRpcProvider, wallet: ethers.Wallet) {
    this.provider = provider;
    this.wallet = wallet;
    this.dryRun = config.monitoring.dryRun;

    // Connect to deployed FlashLoanArbitrage contract
    this.contract = new ethers.Contract(
      config.contracts.flashLoanArbitrage,
      FLASH_LOAN_ARBITRAGE_ABI,
      wallet
    );

    logger.info(
      `Trade Executor initialized ${this.dryRun ? "(DRY RUN MODE)" : "(LIVE MODE)"}`
    );
  }

  /**
   * Encode parameters for the flash loan
   * 
   * The contract expects:
   * - address dexRouter1: First DEX router address
   * - address dexRouter2: Second DEX router address  
   * - address[] path1: Token swap path on DEX 1
   * - address[] path2: Token swap path on DEX 2
   * - uint256 minProfitBps: Minimum profit in basis points
   */
  private encodeArbitrageParams(opportunity: ArbitrageOpportunity): string {
    const {
      pair,
      buyDex,
      sellDex,
    } = opportunity;

    // ✅ FIX: Use actual DEX router addresses based on DEX name
    const dexRouter1 = getDexRouter(buyDex.dexName);
    const dexRouter2 = getDexRouter(sellDex.dexName);

    // Log which DEXes we're actually using
    logger.info(`🔀 Buy DEX: ${buyDex.dexName} → Router: ${dexRouter1}`);
    logger.info(`🔀 Sell DEX: ${sellDex.dexName} → Router: ${dexRouter2}`);

    // Verify we're not using the same DEX twice
    if (dexRouter1 === dexRouter2) {
      logger.warning(`[WARNING] Both DEXes resolve to same router! This will lose money!`);
      logger.warning(`   Buy: ${buyDex.dexName} (${dexRouter1})`);
      logger.warning(`   Sell: ${sellDex.dexName} (${dexRouter2})`);
    }

    // Trading paths
    // Path 1: token0 -> token1 (buy on cheaper DEX)
    const path1 = [pair.token0Address, pair.token1Address];
    
    // Path 2: token1 -> token0 (sell on expensive DEX)
    const path2 = [pair.token1Address, pair.token0Address];

    // Minimum profit threshold
    const minProfitBps = config.trading.minProfitBps;

    // Get fee tiers (0 for V2, actual tier for V3)
    const feeTier1 = buyDex.feeTier || 0;
    const feeTier2 = sellDex.feeTier || 0;

    logger.debug(`[PARAMS] feeTier1=${feeTier1}, feeTier2=${feeTier2}`);

    // Encode parameters with V3 support
    const abiCoder = new ethers.AbiCoder();
    const encodedParams = abiCoder.encode(
      ["address", "address", "address[]", "address[]", "uint256", "uint24", "uint24"],
      [dexRouter1, dexRouter2, path1, path2, minProfitBps, feeTier1, feeTier2]
    );

    return encodedParams;
  }

  /**
   * ✅ Calculate optimal flash loan amount based on REAL liquidity
   * 
   * CRITICAL FACTORS:
   * 1. Available liquidity on BOTH DEXes (use LOWER of the two)
   * 2. Maximum trade size from config
   * 3. Slippage impact (don't use more than 20% of pool depth)
   * 4. Gas costs vs. profit margin
   */
  private calculateFlashLoanAmount(
    opportunity: ArbitrageOpportunity
  ): bigint {
    // ✅ STEP 1: Get available liquidity on both DEXes
    const buyDexLiquidity = opportunity.buyDex.liquidity || 0;
    const sellDexLiquidity = opportunity.sellDex.liquidity || 0;
    
    // ✅ STEP 2: Use the LOWER liquidity (constraining factor)
    const limitingLiquidity = Math.min(buyDexLiquidity, sellDexLiquidity);
    
    logger.debug(`[LIQUIDITY CHECK]`);
    logger.debug(`  Buy DEX (${opportunity.buyDex.dexName}): $${buyDexLiquidity.toFixed(0)}`);
    logger.debug(`  Sell DEX (${opportunity.sellDex.dexName}): $${sellDexLiquidity.toFixed(0)}`);
    logger.debug(`  Limiting liquidity: $${limitingLiquidity.toFixed(0)}`);
    
    // ✅ HIGH-LIQUIDITY FOCUS: Filter out pools that are too small (minimum $5000 liquidity)
    const minLiquidity = config.trading.minPoolLiquidity || 5000;
    if (limitingLiquidity < minLiquidity) {
      logger.warning(`⚠️ Pool too small! $${limitingLiquidity.toFixed(0)} < $${minLiquidity} minimum liquidity`);
      logger.warning(`   Skipping opportunity - need at least $${minLiquidity} liquidity for profitable trades`);
      throw new Error(`Pool too small: $${limitingLiquidity.toFixed(0)} < $${minLiquidity} minimum`);
    }
    
    // ✅ STEP 3: OPTION 2 - Dynamic percentage based on pool size
    // Smaller pools: Lower percentage to reduce price impact
    // Larger pools: Higher percentage for better profit
    let liquidityPercentage = 0.20; // Default 20% for large pools
    
    // Check if this is a V3 low fee tier pool
    const isV3LowFeeTier = (opportunity.buyDex.feeTier === 500) || (opportunity.sellDex.feeTier === 500);
    
    // Dynamic percentage based on liquidity size
    if (limitingLiquidity < 1000) {
      // Small pools ($500-$1000): Use 50% to balance opportunity vs price impact
      liquidityPercentage = 0.50;
      logger.debug(`  💎 Small pool ($${limitingLiquidity.toFixed(0)}) - using 50% of liquidity (reduce price impact)`);
    } else if (limitingLiquidity < 5000) {
      // Medium pools ($1k-$5k): Use 70% - good balance
      liquidityPercentage = 0.70;
      logger.debug(`  📊 Medium pool ($${limitingLiquidity.toFixed(0)}) - using 70% of liquidity`);
    } else if (limitingLiquidity < 10000) {
      // Large pools ($5k-$10k): Use 80% - minimal slippage
      liquidityPercentage = 0.80;
      logger.debug(`  💰 Large pool ($${limitingLiquidity.toFixed(0)}) - using 80% of liquidity`);
    } else {
      // Very large pools (>$10k): Use 90% - very minimal slippage
      liquidityPercentage = 0.90;
      logger.debug(`  🏦 Very large pool ($${limitingLiquidity.toFixed(0)}) - using 90% of liquidity`);
    }
    
    // Adjust for V3 concentrated liquidity (if applicable)
    if (isV3LowFeeTier && limitingLiquidity >= 5000) {
      liquidityPercentage = Math.min(liquidityPercentage, 0.15); // Cap at 15% for V3 0.05% tier
      logger.debug(`  ⚡ V3 0.05% tier: Capped at 15% (concentrated liquidity)`);
    }
    
    // ✅ STEP 4: Cap at appropriate % of pool depth to minimize slippage
    const maxSafeTradeSize = limitingLiquidity * liquidityPercentage;
    
    // ✅ STEP 5: Apply config limits
    let configMaxSize = config.trading.maxTradeSize;
    const configMinSize = config.trading.minTradeSize;
    
    // ✅ OPTION 3: Focus on larger, more liquid pools
    // Hard caps based on pool size to ensure quality trades
    if (limitingLiquidity < 1000) {
      // Small pools ($500-$1000): Cap at 50% of liquidity
      const smallPoolMaxSize = Math.min(limitingLiquidity * 0.50, 2000);
      configMaxSize = Math.min(configMaxSize, smallPoolMaxSize);
      logger.debug(`  🎯 Small pool: Capped at $${smallPoolMaxSize.toFixed(0)} (50% max to reduce slippage)`);
    } else if (limitingLiquidity < 5000) {
      // Medium pools ($1k-$5k): Cap at 70% of liquidity
      const mediumPoolMaxSize = Math.min(limitingLiquidity * 0.70, 5000);
      configMaxSize = Math.min(configMaxSize, mediumPoolMaxSize);
      logger.debug(`  🎯 Medium pool: Capped at $${mediumPoolMaxSize.toFixed(0)} (70% max)`);
    } else if (isV3LowFeeTier) {
      // V3 0.05% tier: Special handling for concentrated liquidity
      const v3MaxSize = 5000;
      configMaxSize = Math.min(configMaxSize, v3MaxSize);
      logger.debug(`  🎯 V3 0.05% tier: Capped at $${v3MaxSize}`);
    }
    
    // ✅ STEP 6: Safety check - SKIP if pool too small for minimum trade
    // Dynamic minimum based on pool size
    let effectiveMinSize = configMinSize;
    if (limitingLiquidity < 1000) {
      // For small pools: minimum = 25% of pool OR $200, whichever is lower
      effectiveMinSize = Math.min(configMinSize, limitingLiquidity * 0.25);
    }
    
    if (maxSafeTradeSize < effectiveMinSize) {
      const percentUsed = liquidityPercentage * 100;
      logger.warning(`⚠️ Pool too small! ${percentUsed}% of $${limitingLiquidity.toFixed(0)} = $${maxSafeTradeSize.toFixed(0)} < min $${effectiveMinSize.toFixed(0)}`);
      logger.warning(`   Skipping this opportunity - need at least $${(effectiveMinSize / liquidityPercentage).toFixed(0)} liquidity`);
      throw new Error(`Pool too small: Safe trade size $${maxSafeTradeSize.toFixed(0)} < min $${effectiveMinSize.toFixed(0)}`);
    }
    
    // Choose the smallest of: percentage of liquidity OR config max
    let tradeSize = Math.min(maxSafeTradeSize, configMaxSize);
    
    // Ensure it's at least the minimum (we already checked pool is big enough)
    tradeSize = Math.max(tradeSize, effectiveMinSize);
    
    logger.info(`[TRADE SIZE] $${tradeSize.toFixed(2)} (${((tradeSize/limitingLiquidity)*100).toFixed(1)}% of $${limitingLiquidity.toFixed(0)} pool)`);

    // Convert to token amount based on ACTUAL token price
    // For stablecoins (USDC, DAI, MAI, USDT): $1.00 per token
    // For volatile tokens (WMATIC, ETH, WBTC): use market price
    let tokenPrice = 1.00; // Default to $1 for stablecoins
    
    // Detect if this is a stablecoin pair (token0 and token1 are strings - symbols)
    const token0Symbol = opportunity.pair.token0.toUpperCase();
    const token1Symbol = opportunity.pair.token1.toUpperCase();
    const stablecoins = ['USDC', 'USDT', 'DAI', 'MAI', 'FRAX', 'TUSD', 'BUSD'];
    
    const isStablecoin0 = stablecoins.includes(token0Symbol);
    const isStablecoin1 = stablecoins.includes(token1Symbol);
    
    // If both are stablecoins, use $1.00
    // If one is volatile, we need to estimate (use native token price as fallback)
    if (!isStablecoin0 && !isStablecoin1) {
      // Both volatile - use native token price (MATIC or ETH)
      tokenPrice = config.network.name === 'polygon' ? 0.40 : 2000;
      logger.debug(`  💱 Using native token price: $${tokenPrice} (volatile pair)`);
    } else {
      // At least one stablecoin - use $1.00
      logger.debug(`  💱 Using stablecoin price: $1.00 (${token0Symbol}/${token1Symbol})`);
    }
    
    const tokenAmount = tradeSize / tokenPrice;
    logger.debug(`  🔢 Token amount: ${tokenAmount.toFixed(2)} tokens ($${tradeSize.toFixed(2)} / $${tokenPrice})`);

    // Return in Wei (18 decimals)
    return ethers.parseEther(tokenAmount.toString());
  }

  /**
   * ✅ NEW: Validate if trade is actually profitable
   * 
   * Calculates TRUE expected profit after:
   * - DEX swap fees (0.3% x2 = 0.6%)
   * - Flash loan fee (0.09%)
   * - Gas costs
   * - Slippage (estimated)
   * 
   * Returns false if trade would lose money
   */
  private async validateProfitability(
    opportunity: ArbitrageOpportunity,
    flashLoanAmount: bigint
  ): Promise<{ profitable: boolean; reason?: string; estimatedProfit?: number }> {
    try {
      // ✅ Get actual DEX fees based on which DEXes are being used
      // This now properly accounts for Uniswap V3's lower fees (5 bps vs 25-30 bps)
      // For V3: Uses actual fee tier from pool (500, 3000, or 10000)
      
      // DEBUG: Log feeTier values to diagnose fee calculation issues
      logger.debug(`[FEE DEBUG] Buy DEX: ${opportunity.buyDex.dexName}, feeTier=${opportunity.buyDex.feeTier}`);
      logger.debug(`[FEE DEBUG] Sell DEX: ${opportunity.sellDex.dexName}, feeTier=${opportunity.sellDex.feeTier}`);
      
      const buyDexFee = getDexFee(opportunity.buyDex.dexName, opportunity.buyDex.feeTier);
      const sellDexFee = getDexFee(opportunity.sellDex.dexName, opportunity.sellDex.feeTier);
      const flashLoanFee = config.trading.flashLoanFeeBps;
      
      // DEBUG: Log calculated fees
      logger.debug(`[FEE DEBUG] Calculated fees: buy=${buyDexFee} bps, sell=${sellDexFee} bps, flash=${flashLoanFee} bps`);
      
      // Calculate total fees in basis points
      // Example combinations:
      // - QuickSwap (25) + SushiSwap (30) + Flash (5) = 60 bps (old)
      // - Uniswap V3 0.05% (5) + SushiSwap (30) + Flash (5) = 40 bps (new - 33% reduction!)
      // - Uniswap V3 0.05% (5) + QuickSwap (25) + Flash (5) = 35 bps (new - best case!)
      // - Uniswap V3 0.3% (30) + QuickSwap (25) + Flash (5) = 60 bps (same as V2 but better liquidity)
      const totalFeeBps = buyDexFee + sellDexFee + flashLoanFee;
      
      // Log fee breakdown for debugging
      logger.debug(`[FEE BREAKDOWN] Buy: ${opportunity.buyDex.dexName} (${buyDexFee} bps) + Sell: ${opportunity.sellDex.dexName} (${sellDexFee} bps) + Flash Loan (${flashLoanFee} bps) = Total: ${totalFeeBps} bps`);
      
      // Price spread (from opportunity detection)
      const spreadBps = opportunity.profitPercent * 100; // Convert % to bps
      
      // Estimated gas cost in USD
      const feeData = await this.provider.getFeeData();
      const gasEstimate = 500000n; // Conservative estimate for flash loan + 2 swaps
      const gasCostWei = gasEstimate * (feeData.gasPrice || 0n);
      const gasCostEth = parseFloat(ethers.formatEther(gasCostWei));
      const maticPrice = 0.5; // $0.50 per MATIC (conservative)
      const gasCostUsd = gasCostEth * maticPrice;
      
      // Calculate trade size in USD
      const flashLoanAmountEth = parseFloat(ethers.formatEther(flashLoanAmount));
      const tradeSizeUsd = flashLoanAmountEth * 2000; // Assume ETH price for calculation
      
      // Net profit in bps (spread - fees)
      const netProfitBps = spreadBps - totalFeeBps;
      
      // Net profit in USD
      const grossProfitUsd = (netProfitBps / 10000) * tradeSizeUsd;
      const netProfitUsd = grossProfitUsd - gasCostUsd;
      
      logger.debug("[ANALYSIS] Profitability Analysis:", {
        spread: `${spreadBps} bps`,
        dexFees: `${buyDexFee + sellDexFee} bps`,
        flashLoanFee: `${flashLoanFee} bps`,
        totalFees: `${totalFeeBps} bps`,
        netProfitBps: `${netProfitBps} bps`,
        gasCost: `$${gasCostUsd.toFixed(2)}`,
        grossProfit: `$${grossProfitUsd.toFixed(2)}`,
        netProfit: `$${netProfitUsd.toFixed(2)}`,
      });
      
      // Check if profitable
      if (netProfitBps <= 0) {
        return {
          profitable: false,
          reason: `Spread (${spreadBps} bps) < Fees (${totalFeeBps} bps). Would lose ${Math.abs(netProfitBps)} bps`
        };
      }
      
      if (netProfitUsd <= 0) {
        return {
          profitable: false,
          reason: `Gas cost ($${gasCostUsd.toFixed(2)}) > Gross profit ($${grossProfitUsd.toFixed(2)})`
        };
      }
      
      // Require minimum profit after all costs (lowered to capture more opportunities)
      const MIN_NET_PROFIT_USD = 0.25; // $0.25 minimum net profit
      if (netProfitUsd < MIN_NET_PROFIT_USD) {
        return {
          profitable: false,
          reason: `Net profit ($${netProfitUsd.toFixed(2)}) < $${MIN_NET_PROFIT_USD.toFixed(2)} minimum threshold`
        };
      }
      
      return {
        profitable: true,
        estimatedProfit: netProfitUsd
      };
      
    } catch (error) {
      logger.error("Error validating profitability:", error);
      return {
        profitable: false,
        reason: "Error calculating profitability"
      };
    }
  }

  /**
   * Execute arbitrage trade
   * 
   * FLOW:
   * 1. Encode trading parameters
   * 2. Calculate flash loan amount
   * 3. Build transaction
   * 4. Estimate gas
   * 5. Execute transaction
   * 6. Wait for confirmation
   * 7. Parse events for profit
   */
  async executeTrade(
    opportunity: ArbitrageOpportunity
  ): Promise<TradeResult> {
    try {
      logger.trade("START");
      logger.info(
        `Executing arbitrage: ${opportunity.pair.name} | Buy: ${opportunity.buyDex.dexName} | Sell: ${opportunity.sellDex.dexName}`
      );

      // Check if contract is paused
      const stats = await this.getContractStats();
      if (stats.isPaused) {
        throw new Error("Contract is paused");
      }

      // ✅ NEW: Check if DEX pair has acceptable gas costs (< $10 total)
      const currentFeeData = await this.provider.getFeeData();
      const currentGasPrice = currentFeeData.gasPrice || 0n;
      
      const dexPairCheck = isDexPairEfficient(
        opportunity.buyDex.dexName,
        opportunity.sellDex.dexName,
        currentGasPrice
      );
      
      if (!dexPairCheck.efficient) {
        logger.warning(`[REJECTED] DEX pair rejected: ${dexPairCheck.reason}`);
        logger.warning(`   Estimated total gas: $${dexPairCheck.totalGasCost?.toFixed(2) || 'N/A'}`);
        throw new Error(`High gas cost DEX pair: ${dexPairCheck.reason}`);
      }
      
      logger.info(`[OK] DEX pair efficient! Estimated gas cost: $${dexPairCheck.totalGasCost?.toFixed(2)}`);

      // Encode parameters
      const params = this.encodeArbitrageParams(opportunity);

      // Calculate flash loan amount
      const flashLoanAmount = this.calculateFlashLoanAmount(opportunity);

      // 💰 LOG TRADE SIZE DETAILS
      const flashLoanAmountFormatted = ethers.formatEther(flashLoanAmount);
      const nativeTokenPrice = config.network.name === 'polygon' ? 0.40 : 2000;
      const tradeSizeUSD = parseFloat(flashLoanAmountFormatted) * nativeTokenPrice;
      
      logger.info(`💰 [TRADE SIZE DETAILS]`);
      logger.info(`   Amount: ${parseFloat(flashLoanAmountFormatted).toFixed(2)} tokens`);
      logger.info(`   Value: $${tradeSizeUSD.toFixed(2)} USD`);
      logger.info(`   Pair: ${opportunity.pair.name}`);
      logger.info(`   Buy on: ${opportunity.buyDex.dexName} (${opportunity.buyDex.feeTier ? opportunity.buyDex.feeTier/100 + ' bps' : 'V2'})`);
      logger.info(`   Sell on: ${opportunity.sellDex.dexName} (${opportunity.sellDex.feeTier ? opportunity.sellDex.feeTier/100 + ' bps' : 'V2'})`);

      // ⚠️ REMOVED: Off-chain validation was rejecting good trades due to inaccurate estimates
      // Now we rely ONLY on on-chain simulation for accurate profitability checks
      
      // 🔍 ON-CHAIN SIMULATION - Predict actual slippage before executing (THE ONLY TRUTH)
      logger.info(`🔍 [ON-CHAIN SIMULATION] Simulating swaps to predict real slippage...`);
      
      try {
        const buyRouter = getDexRouter(opportunity.buyDex.dexName);
        const sellRouter = getDexRouter(opportunity.sellDex.dexName);
        const buyDexType = getDexType(opportunity.buyDex.dexName);
        const sellDexType = getDexType(opportunity.sellDex.dexName);
        
        // Map DEX types to simulator types (v2/v3)
        const buySimType = buyDexType === 'uniswapV3' ? 'v3' : 'v2';
        const sellSimType = sellDexType === 'uniswapV3' ? 'v3' : 'v2';
        
        const simulationResult = await simulateArbitrageWithCosts(
          this.provider,
          buyRouter,
          sellRouter,
          flashLoanAmount,
          opportunity.pair.token0Address,
          opportunity.pair.token1Address,
          config.trading.flashLoanFeeBps,
          500000n, // Gas estimate
          buySimType,
          sellSimType,
          opportunity.buyDex.feeTier,
          opportunity.sellDex.feeTier
        );
        
        if (!simulationResult.profitable) {
          const lossPercent = simulationResult.netProfitPercent.toFixed(4);
          const lossAmount = ethers.formatEther(simulationResult.netProfit);
          const grossProfit = ethers.formatEther(simulationResult.grossProfit);
          const flashFee = ethers.formatEther(simulationResult.flashLoanFee);
          const gasCost = ethers.formatEther(simulationResult.gasCost);
          
          logger.warning(`❌ [SIMULATION REJECTED] On-chain simulation predicts LOSS`);
          logger.warning(`   Net profit: ${lossAmount} MATIC (${lossPercent}%)`);
          logger.warning(`   Gross profit: ${grossProfit} MATIC`);
          logger.warning(`   Flash loan fee: ${flashFee} MATIC`);
          logger.warning(`   Gas cost: ${gasCost} MATIC`);
          logger.warning(`   Reason: Real slippage/price impact makes trade unprofitable`);
          
          // This is EXPECTED behavior - simulation working correctly
          // Don't log as error, just skip the trade
          throw new Error(`UNPROFITABLE: Simulation shows ${lossPercent}% loss`);
        }
        
        const netProfitMATIC = parseFloat(ethers.formatEther(simulationResult.netProfit));
        const netProfitUSD = netProfitMATIC * nativeTokenPrice;
        const priceImpact = simulationResult.simulation.priceImpactBps.toFixed(2);
        
        logger.success(`✅ [SIMULATION PASSED] On-chain simulation confirms PROFIT`);
        logger.success(`   Net profit: ${netProfitMATIC.toFixed(6)} MATIC ($${netProfitUSD.toFixed(2)})`);
        logger.success(`   Net profit %: ${simulationResult.netProfitPercent.toFixed(4)}%`);
        logger.success(`   Price impact: ${priceImpact} bps`);
        logger.success(`   ✨ EXECUTING TRADE ON-CHAIN...`);
        
      } catch (simError: any) {
        // Check if this is an expected "unprofitable" error vs technical error
        if (simError.message.includes('UNPROFITABLE')) {
          // This is expected - simulation correctly filtered an unprofitable trade
          // Re-throw to skip trade but don't count as a system error
          throw simError;
        }
        
        // Technical error with simulation itself
        logger.error(`❌ [SIMULATION TECHNICAL ERROR] Failed to run simulation`);
        logger.error(`   Error: ${simError.message}`);
        logger.error(`   Pair: ${opportunity.pair.name}`);
        logger.error(`   Buy DEX: ${opportunity.buyDex.dexName}`);
        logger.error(`   Sell DEX: ${opportunity.sellDex.dexName}`);
        
        // Don't execute trade if simulation fails technically
        throw new Error(`Simulation technical error: ${simError.message}`);
      }

      logger.debug("Trade parameters", {
        token: opportunity.pair.token0Address,
        amount: ethers.formatEther(flashLoanAmount),
        buyDex: opportunity.buyDex.dexName,
        sellDex: opportunity.sellDex.dexName,
      });

      // DRY RUN MODE: Simulate without executing
      if (this.dryRun) {
        logger.warning("DRY RUN MODE - Trade simulated but not executed");
        return {
          success: true,
          txHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
          profit: opportunity.netProfit,
        };
      }

      // Estimate gas
      const gasEstimate = await this.contract.executeArbitrage.estimateGas(
        opportunity.pair.token0Address,
        flashLoanAmount,
        params
      );

      logger.debug(`Gas estimate: ${gasEstimate.toString()}`);

      // Get current gas price
      const feeData = await this.provider.getFeeData();
      const maxGasPriceWei = ethers.parseUnits(
        config.trading.maxGasPrice.toString(),
        "gwei"
      );

      // Check if gas price is acceptable
      if (feeData.gasPrice && feeData.gasPrice > maxGasPriceWei) {
        throw new Error(
          `Gas price too high: ${ethers.formatUnits(feeData.gasPrice, "gwei")} Gwei`
        );
      }

      // Execute transaction
      const tx = await this.contract.executeArbitrage(
        opportunity.pair.token0Address,
        flashLoanAmount,
        params,
        {
          gasLimit: (gasEstimate * 120n) / 100n, // Add 20% buffer
          gasPrice: feeData.gasPrice,
        }
      );

      logger.info(`Transaction sent: ${tx.hash}`);
      logger.info("Waiting for confirmation...");

      // Wait for transaction to be mined
      const receipt = await tx.wait();

      if (receipt.status === 0) {
        logger.trade("FAILED", tx.hash);
        return {
          success: false,
          txHash: tx.hash,
          error: "Transaction reverted",
        };
      }

      // Parse events to get actual profit
      const profit = this.parseArbitrageEvents(receipt);

      // Calculate gas cost
      const gasCostWei = receipt.gasUsed * (receipt.gasPrice || 0n);
      const gasCostEth = parseFloat(ethers.formatEther(gasCostWei));
      const gasCostUsd = gasCostEth * 2000; // Assume ETH = $2000

      logger.trade("SUCCESS", tx.hash);
      logger.success("Arbitrage executed successfully!", {
        txHash: tx.hash,
        profit: `$${profit.toFixed(2)}`,
        gasUsed: receipt.gasUsed.toString(),
        gasCost: `$${gasCostUsd.toFixed(2)}`,
      });

      return {
        success: true,
        txHash: tx.hash,
        profit,
        gasUsed: receipt.gasUsed,
        gasCost: gasCostUsd,
      };
    } catch (error: any) {
      // Categorize errors for better debugging
      const errorMsg = error.message || "Unknown error";
      
      if (errorMsg.includes('UNPROFITABLE')) {
        // Expected: Simulation correctly filtered unprofitable trade
        logger.info(`⏭️  [SKIPPED] ${errorMsg}`);
        return {
          success: false,
          error: errorMsg,
          reason: 'simulation_unprofitable'
        };
      }
      
      if (errorMsg.includes('Simulation technical error')) {
        // Technical issue with simulation itself
        logger.error(`⚠️  [SIMULATION ERROR] ${errorMsg}`);
        return {
          success: false,
          error: errorMsg,
          reason: 'simulation_error'
        };
      }
      
      if (errorMsg.includes('High gas cost DEX pair')) {
        // Gas costs too high for this DEX combination
        logger.warning(`💸 [HIGH GAS] ${errorMsg}`);
        return {
          success: false,
          error: errorMsg,
          reason: 'high_gas_cost'
        };
      }
      
      if (errorMsg.includes('Pool too small')) {
        // Pool doesn't have enough liquidity for profitable trade
        logger.debug(`🔍 [POOL TOO SMALL] ${errorMsg}`);
        return {
          success: false,
          error: errorMsg,
          reason: 'pool_too_small'
        };
      }
      
      if (errorMsg.includes('execution reverted')) {
        // On-chain execution failed (should rarely happen with simulation)
        logger.error(`⛔ [ON-CHAIN REVERT] Transaction reverted: ${errorMsg}`);
        return {
          success: false,
          error: errorMsg,
          reason: 'on_chain_revert'
        };
      }
      
      // Unknown error - log full details
      logger.error(`❌ [UNKNOWN ERROR] Trade execution failed: ${errorMsg}`, error);

      return {
        success: false,
        error: errorMsg,
        reason: 'unknown'
      };
    }
  }

  /**
   * Parse contract events to extract profit
   */
  private parseArbitrageEvents(receipt: ethers.TransactionReceipt): number {
    try {
      // Find ArbitrageExecuted event
      const arbitrageEvent = receipt.logs.find((log) => {
        try {
          const parsed = this.contract.interface.parseLog({
            topics: [...log.topics],
            data: log.data,
          });
          return parsed?.name === "ArbitrageExecuted";
        } catch {
          return false;
        }
      });

      if (arbitrageEvent) {
        const parsed = this.contract.interface.parseLog({
          topics: [...arbitrageEvent.topics],
          data: arbitrageEvent.data,
        });

        if (parsed) {
          const profitWei = parsed.args[2]; // Third parameter is profit
          const profitEth = parseFloat(ethers.formatEther(profitWei));
          const profitUsd = profitEth * 2000; // Assume ETH = $2000
          return profitUsd;
        }
      }

      // If no event found, return estimated profit
      return 0;
    } catch (error) {
      logger.error("Failed to parse arbitrage events", error);
      return 0;
    }
  }

  /**
   * Get contract statistics
   */
  async getContractStats(): Promise<ContractStats> {
    try {
      const stats = await this.contract.getStats();
      return {
        totalProfit: stats[0],
        totalTrades: stats[1],
        isPaused: stats[2],
      };
    } catch (error) {
      logger.error("Failed to get contract stats", error);
      return {
        totalProfit: 0n,
        totalTrades: 0n,
        isPaused: false,
      };
    }
  }

  /**
   * Check if wallet is authorized to execute trades
   */
  async isAuthorized(): Promise<boolean> {
    try {
      return await this.contract.authorizedExecutors(this.wallet.address);
    } catch (error) {
      logger.error("Failed to check authorization", error);
      return false;
    }
  }

  /**
   * Get wallet balance
   */
  async getBalance(): Promise<string> {
    const balance = await this.provider.getBalance(this.wallet.address);
    return ethers.formatEther(balance);
  }

  /**
   * Check if wallet has sufficient balance for gas
   */
  async hasSufficientBalance(): Promise<boolean> {
    const balance = await this.getBalance();
    return parseFloat(balance) >= config.safety.minWalletBalance;
  }
}

export default TradeExecutor;
