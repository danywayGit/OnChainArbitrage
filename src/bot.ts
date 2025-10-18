/**
 * 🤖 Arbitrage Bot - Main Entry Point
 * 
 * This is the heart of your arbitrage bot. It orchestrates:
 * 1. Price monitoring across multiple DEXes
 * 2. Opportunity detection
 * 3. Trade execution
 * 4. Performance tracking
 * 5. Safety checks
 * 
 * ARCHITECTURE:
 * - PriceMonitor: Fetches prices and finds opportunities
 * - TradeExecutor: Executes trades on profitable opportunities
 * - Logger: Provides colored console output
 * - Config: Centralized settings
 */

import { ethers } from "ethers";
import { config, validateConfig } from "./config";
import { logger } from "./logger";
import { PriceMonitor } from "./priceMonitor";
import { TradeExecutor } from "./tradeExecutor";
import type { ArbitrageOpportunity } from "./priceMonitor";
import { getLogger, stopLogger } from "./dataLogger";

// ============================================================================
// BOT STATISTICS
// ============================================================================

interface BotStats {
  startTime: number;
  opportunitiesFound: number;
  tradesExecuted: number;
  successfulTrades: number;
  failedTrades: number;
  totalProfit: number;
  totalGasCost: number;
  netProfit: number;
}

// ============================================================================
// ARBITRAGE BOT CLASS
// ============================================================================

class ArbitrageBot {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private priceMonitor: PriceMonitor;
  private tradeExecutor: TradeExecutor;
  private isRunning: boolean = false;
  private stats: BotStats;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Initialize provider
    this.provider = new ethers.JsonRpcProvider(config.network.rpcUrl);

    // Initialize wallet
    this.wallet = new ethers.Wallet(config.wallet.privateKey, this.provider);

    // Initialize modules
    this.priceMonitor = new PriceMonitor(this.provider);
    this.tradeExecutor = new TradeExecutor(this.provider, this.wallet);

    // Initialize statistics
    this.stats = {
      startTime: Date.now(),
      opportunitiesFound: 0,
      tradesExecuted: 0,
      successfulTrades: 0,
      failedTrades: 0,
      totalProfit: 0,
      totalGasCost: 0,
      netProfit: 0,
    };
  }

  /**
   * Initialize and validate bot setup
   */
  private async initialize(): Promise<void> {
    logger.banner();
    logger.info("Initializing Arbitrage Bot...");
    logger.separator();
    
    // Initialize data logger
    const dataLogger = getLogger();
    logger.info(`Data logging enabled: ./logs/`);

    // Validate configuration
    validateConfig();

    // Check network connection
    const network = await this.provider.getNetwork();
    logger.info(`Connected to ${network.name} (Chain ID: ${network.chainId})`);

    // Check wallet
    const balance = await this.tradeExecutor.getBalance();
    logger.info(`Wallet: ${this.wallet.address}`);
    logger.info(`Balance: ${balance} ETH`);

    // Check authorization
    const isAuthorized = await this.tradeExecutor.isAuthorized();
    if (!isAuthorized) {
      logger.warning(
        "⚠️  Wallet is not authorized to execute trades on the contract!"
      );
      logger.warning(
        "   Run the following command to authorize your wallet:"
      );
      logger.warning(
        `   contract.setAuthorizedExecutor("${this.wallet.address}", true)`
      );
    } else {
      logger.success("✓ Wallet is authorized to execute trades");
    }

    // Check minimum balance
    const hasSufficientBalance =
      await this.tradeExecutor.hasSufficientBalance();
    if (!hasSufficientBalance) {
      logger.warning(
        `⚠️  Wallet balance below minimum (${config.safety.minWalletBalance} ETH)`
      );
    }

    // Get contract stats
    const contractStats = await this.tradeExecutor.getContractStats();
    logger.info("Contract Statistics:");
    logger.info(
      `  - Total Trades: ${contractStats.totalTrades.toString()}`
    );
    logger.info(
      `  - Total Profit: ${ethers.formatEther(contractStats.totalProfit)} ETH`
    );
    logger.info(
      `  - Status: ${contractStats.isPaused ? "PAUSED" : "ACTIVE"}`
    );

    // Display monitoring configuration
    logger.separator();
    logger.info("Monitoring Configuration:");
    logger.info(
      `  - Pairs: ${this.priceMonitor.getPairs().map((p) => p.name).join(", ")}`
    );
    logger.info(
      `  - Check Interval: ${config.monitoring.priceCheckInterval}ms`
    );
    logger.info(
      `  - Min Profit: ${config.trading.minProfitBps / 100}%`
    );
    logger.info(`  - Max Gas Price: ${config.trading.maxGasPrice} Gwei`);
    logger.info(
      `  - Mode: ${config.monitoring.dryRun ? "DRY RUN" : "LIVE TRADING"}`
    );
    logger.separator();
  }

  /**
   * Main monitoring loop
   * Continuously scans for arbitrage opportunities
   */
  private async monitoringLoop(): Promise<void> {
    if (!this.isRunning) return;

    try {
      // Scan for opportunities
      const opportunities = await this.priceMonitor.scanForOpportunities();

      // Process each opportunity
      for (const opportunity of opportunities) {
        if (!this.isRunning) break;

        this.stats.opportunitiesFound++;

        // Log opportunity
        logger.opportunity(
          opportunity.pair.name,
          opportunity.netProfit,
          opportunity.profitPercent
        );

        logger.info("Opportunity Details:", {
          buyOn: opportunity.buyDex.dexName,
          buyPrice: opportunity.buyDex.price.toFixed(4),
          sellOn: opportunity.sellDex.dexName,
          sellPrice: opportunity.sellDex.price.toFixed(4),
          profitPercent: `${opportunity.profitPercent.toFixed(3)}%`,
          estimatedProfit: `$${opportunity.profitUsd.toFixed(2)}`,
          estimatedGas: `$${opportunity.estimatedGasCost.toFixed(2)}`,
          netProfit: `$${opportunity.netProfit.toFixed(2)}`,
        });

        // Execute trade
        await this.executeTrade(opportunity);
      }
    } catch (error) {
      logger.error("Error in monitoring loop", error);
    }
  }

  /**
   * Execute an arbitrage trade
   */
  private async executeTrade(
    opportunity: ArbitrageOpportunity
  ): Promise<void> {
    try {
      // Safety checks before executing
      const canTrade = await this.performSafetyChecks();
      if (!canTrade) {
        logger.warning("Safety checks failed - skipping trade");
        return;
      }

      // Execute trade
      const result = await this.tradeExecutor.executeTrade(opportunity);

      // Update statistics
      this.stats.tradesExecuted++;

      if (result.success) {
        this.stats.successfulTrades++;
        this.stats.totalProfit += result.profit || 0;
        this.stats.totalGasCost += result.gasCost || 0;
        this.stats.netProfit =
          this.stats.totalProfit - this.stats.totalGasCost;

        logger.success("Trade Statistics Updated:", {
          totalTrades: this.stats.tradesExecuted,
          successRate: `${((this.stats.successfulTrades / this.stats.tradesExecuted) * 100).toFixed(1)}%`,
          totalProfit: `$${this.stats.totalProfit.toFixed(2)}`,
          totalGasCost: `$${this.stats.totalGasCost.toFixed(2)}`,
          netProfit: `$${this.stats.netProfit.toFixed(2)}`,
        });
      } else {
        this.stats.failedTrades++;
        logger.error("Trade failed:", { error: result.error });
      }
    } catch (error) {
      logger.error("Failed to execute trade", error);
    }
  }

  /**
   * Perform safety checks before executing trades
   */
  private async performSafetyChecks(): Promise<boolean> {
    // Check if wallet has sufficient balance
    const hasSufficientBalance =
      await this.tradeExecutor.hasSufficientBalance();
    if (!hasSufficientBalance) {
      logger.warning("Insufficient wallet balance for gas");
      return false;
    }

    // Check gas price
    const feeData = await this.provider.getFeeData();
    const currentGasPrice = feeData.gasPrice || 0n;
    const maxGasPrice = ethers.parseUnits(
      config.trading.maxGasPrice.toString(),
      "gwei"
    );

    if (currentGasPrice > maxGasPrice) {
      logger.warning(
        `Gas price too high: ${ethers.formatUnits(currentGasPrice, "gwei")} Gwei`
      );
      return false;
    }

    // Check emergency gas price stop
    const emergencyGasPrice = ethers.parseUnits(
      config.safety.emergencyGasPriceStop.toString(),
      "gwei"
    );

    if (currentGasPrice > emergencyGasPrice) {
      logger.error("EMERGENCY STOP: Gas price exceeded safety limit!");
      this.stop();
      return false;
    }

    // Check daily loss limit
    if (
      this.stats.netProfit < 0 &&
      Math.abs(this.stats.netProfit) >= config.safety.maxDailyLoss
    ) {
      logger.error("EMERGENCY STOP: Daily loss limit reached!");
      this.stop();
      return false;
    }

    return true;
  }

  /**
   * Start the bot
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warning("Bot is already running");
      return;
    }

    try {
      // Initialize
      await this.initialize();

      // Start monitoring
      this.isRunning = true;
      logger.success("🚀 Bot started successfully!");
      logger.info("Monitoring for arbitrage opportunities...");
      logger.separator();

      // Start monitoring loop
      this.monitoringInterval = setInterval(
        () => this.monitoringLoop(),
        config.monitoring.priceCheckInterval
      );

      // Also run immediately
      this.monitoringLoop();
    } catch (error) {
      logger.error("Failed to start bot", error);
      this.stop();
    }
  }

  /**
   * Stop the bot
   */
  stop(): void {
    if (!this.isRunning) return;

    logger.info("Stopping bot...");

    this.isRunning = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    // Stop data logger and generate final report
    stopLogger();

    // Display final statistics
    this.displayFinalStats();

    logger.success("Bot stopped successfully");
  }

  /**
   * Display final statistics
   */
  private displayFinalStats(): void {
    const runtime = Date.now() - this.stats.startTime;
    const runtimeHours = (runtime / (1000 * 60 * 60)).toFixed(2);

    logger.separator();
    logger.info("📊 Final Statistics:");
    logger.separator();
    logger.info(`Runtime: ${runtimeHours} hours`);
    logger.info(`Opportunities Found: ${this.stats.opportunitiesFound}`);
    logger.info(`Trades Executed: ${this.stats.tradesExecuted}`);
    logger.info(`Successful Trades: ${this.stats.successfulTrades}`);
    logger.info(`Failed Trades: ${this.stats.failedTrades}`);

    if (this.stats.tradesExecuted > 0) {
      const successRate =
        (this.stats.successfulTrades / this.stats.tradesExecuted) * 100;
      logger.info(`Success Rate: ${successRate.toFixed(1)}%`);
    }

    logger.info(`Total Profit: $${this.stats.totalProfit.toFixed(2)}`);
    logger.info(`Total Gas Cost: $${this.stats.totalGasCost.toFixed(2)}`);
    logger.info(`Net Profit: $${this.stats.netProfit.toFixed(2)}`);
    logger.separator();
  }

  /**
   * Get current statistics
   */
  getStats(): BotStats {
    return { ...this.stats };
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  // Create bot instance
  const bot = new ArbitrageBot();

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    logger.info("\nReceived SIGINT signal");
    bot.stop();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    logger.info("\nReceived SIGTERM signal");
    bot.stop();
    process.exit(0);
  });

  // Handle uncaught errors
  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception:", error);
    bot.stop();
    process.exit(1);
  });

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:", promise);
    logger.error("Reason:", reason);
    bot.stop();
    process.exit(1);
  });

  // Start the bot
  try {
    await bot.start();

    // Keep the process running
    // The bot will run until SIGINT (Ctrl+C) or an error occurs
  } catch (error) {
    logger.error("Fatal error:", error);
    process.exit(1);
  }
}

// Run the bot
if (require.main === module) {
  main();
}

export default ArbitrageBot;
export { ArbitrageBot };
