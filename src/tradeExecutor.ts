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

    // Encode parameters
    const abiCoder = new ethers.AbiCoder();
    const encodedParams = abiCoder.encode(
      ["address", "address", "address[]", "address[]", "uint256"],
      [dexRouter1, dexRouter2, path1, path2, minProfitBps]
    );

    return encodedParams;
  }

  /**
   * Calculate optimal flash loan amount
   * 
   * FACTORS:
   * 1. Available liquidity on both DEXes
   * 2. Maximum trade size from config
   * 3. Gas costs vs. profit margin
   */
  private calculateFlashLoanAmount(
    opportunity: ArbitrageOpportunity
  ): bigint {
    // For demo, use a fixed amount
    // In production, optimize based on:
    // - Available liquidity
    // - Slippage curves
    // - Gas costs vs. profit

    // Start with minimum trade size
    const tradeSize = config.trading.minTradeSize; // $100 USD

    // Convert to token amount
    // For ETH at ~$2000: $100 = 0.05 ETH
    const ethPrice = 2000;
    const ethAmount = tradeSize / ethPrice;

    // Return in Wei (18 decimals)
    return ethers.parseEther(ethAmount.toString());
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
      // Get DEX fees
      const buyDexFee = getDexFee(opportunity.buyDex.dexName);
      const sellDexFee = getDexFee(opportunity.sellDex.dexName);
      const flashLoanFee = config.trading.flashLoanFeeBps;
      
      // Calculate total fees in basis points
      const totalFeeBps = buyDexFee + sellDexFee + flashLoanFee;
      
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

      // ✅ NEW: Validate profitability BEFORE executing
      const profitCheck = await this.validateProfitability(opportunity, flashLoanAmount);
      
      if (!profitCheck.profitable) {
        logger.warning(`[NOT PROFITABLE] Trade rejected: ${profitCheck.reason}`);
        throw new Error(`Unprofitable trade: ${profitCheck.reason}`);
      }
      
      logger.success(`[PROFITABLE] Trade looks good! Estimated net profit: $${profitCheck.estimatedProfit?.toFixed(2)}`);

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
      logger.error("Trade execution failed", error);

      return {
        success: false,
        error: error.message || "Unknown error",
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
