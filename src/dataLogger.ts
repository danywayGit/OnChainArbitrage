/**
 * Data Logger for Arbitrage Opportunities
 * 
 * Stores all opportunities to JSON/CSV files for analysis
 * Tracks: prices, spreads, gas costs, profitability over time
 */

import * as fs from "fs";
import * as path from "path";
import { parseUnits, formatUnits } from "ethers";

// ============================================================================
// TYPES
// ============================================================================

export interface OpportunityData {
  // Timing
  timestamp: number;
  date: string;
  time: string;
  hour: number;
  dayOfWeek: string;
  
  // Trading Pair
  pair: string;
  token0: string;
  token1: string;
  
  // Prices & Spread
  dex1: string;
  dex2: string;
  price1: string;
  price2: string;
  spreadPercent: number;
  
  // Trade Details
  tradeAmount: string;
  tradeAmountUSD: number;
  expectedProfit: string;
  expectedProfitUSD: number;
  profitPercent: number;
  
  // Gas & Fees
  gasPrice: string;
  gasCostUSD: number;
  flashLoanFee: string;
  flashLoanFeeUSD: number;
  
  // Net Profit
  netProfit: string;
  netProfitUSD: number;
  netProfitPercent: number;
  
  // Execution
  executed: boolean;
  executionStatus?: "simulated" | "success" | "failed" | "skipped";
  failureReason?: string;
  txHash?: string;
  
  // Market Conditions
  blockNumber: number;
  network: string;
}

export interface DailyStats {
  date: string;
  totalOpportunities: number;
  profitableOpportunities: number;
  totalPotentialProfit: number;
  averageSpread: number;
  averageProfit: number;
  bestOpportunity: OpportunityData | null;
  hourlyDistribution: Record<number, number>;
  pairDistribution: Record<string, number>;
  dexDistribution: Record<string, number>;
}

// ============================================================================
// DATA LOGGER CLASS
// ============================================================================

export class DataLogger {
  private logsDir: string;
  private opportunitiesFile: string;
  private statsFile: string;
  private csvFile: string;
  private opportunities: OpportunityData[] = [];
  private autoSaveInterval: NodeJS.Timeout | null = null;

  constructor(logsDir: string = "./logs") {
    this.logsDir = logsDir;
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // File paths
    const date = new Date().toISOString().split("T")[0];
    this.opportunitiesFile = path.join(logsDir, `opportunities_${date}.json`);
    this.statsFile = path.join(logsDir, `stats_${date}.json`);
    this.csvFile = path.join(logsDir, `opportunities_${date}.csv`);
    
    // Load existing data if available
    this.loadExistingData();
    
    // Auto-save every 5 minutes
    this.startAutoSave(5 * 60 * 1000);
    
    console.log(`📊 Data logger initialized`);
    console.log(`   Logs directory: ${logsDir}`);
    console.log(`   Opportunities file: ${path.basename(this.opportunitiesFile)}`);
  }

  /**
   * Load existing data from today's file
   */
  private loadExistingData(): void {
    try {
      if (fs.existsSync(this.opportunitiesFile)) {
        const data = fs.readFileSync(this.opportunitiesFile, "utf8");
        this.opportunities = JSON.parse(data);
        console.log(`✅ Loaded ${this.opportunities.length} existing opportunities from today`);
      }
    } catch (error) {
      console.error("⚠️  Error loading existing data:", error);
    }
  }

  /**
   * Log a new arbitrage opportunity
   */
  logOpportunity(data: Partial<OpportunityData>): void {
    const now = new Date();
    
    const opportunity: OpportunityData = {
      // Timing
      timestamp: now.getTime(),
      date: now.toISOString().split("T")[0],
      time: now.toTimeString().split(" ")[0],
      hour: now.getHours(),
      dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][now.getDay()],
      
      // Trading Pair
      pair: data.pair || "",
      token0: data.token0 || "",
      token1: data.token1 || "",
      
      // Prices & Spread
      dex1: data.dex1 || "",
      dex2: data.dex2 || "",
      price1: data.price1 || "0",
      price2: data.price2 || "0",
      spreadPercent: data.spreadPercent || 0,
      
      // Trade Details
      tradeAmount: data.tradeAmount || "0",
      tradeAmountUSD: data.tradeAmountUSD || 0,
      expectedProfit: data.expectedProfit || "0",
      expectedProfitUSD: data.expectedProfitUSD || 0,
      profitPercent: data.profitPercent || 0,
      
      // Gas & Fees
      gasPrice: data.gasPrice || "0",
      gasCostUSD: data.gasCostUSD || 0,
      flashLoanFee: data.flashLoanFee || "0",
      flashLoanFeeUSD: data.flashLoanFeeUSD || 0,
      
      // Net Profit
      netProfit: data.netProfit || "0",
      netProfitUSD: data.netProfitUSD || 0,
      netProfitPercent: data.netProfitPercent || 0,
      
      // Execution
      executed: data.executed || false,
      executionStatus: data.executionStatus || "simulated",
      failureReason: data.failureReason,
      txHash: data.txHash,
      
      // Market Conditions
      blockNumber: data.blockNumber || 0,
      network: data.network || "polygon",
    };
    
    this.opportunities.push(opportunity);
  }

  /**
   * Save all data to files
   */
  save(): void {
    try {
      // Save JSON (full data)
      fs.writeFileSync(
        this.opportunitiesFile,
        JSON.stringify(this.opportunities, null, 2),
        "utf8"
      );
      
      // Save CSV (for Excel/analysis)
      this.saveCSV();
      
      // Save statistics
      this.saveStats();
      
      console.log(`💾 Saved ${this.opportunities.length} opportunities to disk`);
    } catch (error) {
      console.error("❌ Error saving data:", error);
    }
  }

  /**
   * Save data to CSV format
   */
  private saveCSV(): void {
    if (this.opportunities.length === 0) return;
    
    // CSV header
    const header = [
      "Timestamp",
      "Date",
      "Time",
      "Hour",
      "Day",
      "Pair",
      "Token0",
      "Token1",
      "DEX1",
      "DEX2",
      "Price1",
      "Price2",
      "Spread%",
      "TradeAmount",
      "TradeUSD",
      "ExpectedProfit",
      "ExpectedProfitUSD",
      "Profit%",
      "GasPrice",
      "GasCostUSD",
      "FlashLoanFee",
      "FlashLoanFeeUSD",
      "NetProfit",
      "NetProfitUSD",
      "NetProfit%",
      "Executed",
      "Status",
      "FailureReason",
      "TxHash",
      "BlockNumber",
      "Network",
    ].join(",");
    
    // CSV rows
    const rows = this.opportunities.map((opp) => {
      return [
        opp.timestamp,
        opp.date,
        opp.time,
        opp.hour,
        opp.dayOfWeek,
        opp.pair,
        opp.token0,
        opp.token1,
        opp.dex1,
        opp.dex2,
        opp.price1,
        opp.price2,
        opp.spreadPercent.toFixed(4),
        opp.tradeAmount,
        opp.tradeAmountUSD.toFixed(2),
        opp.expectedProfit,
        opp.expectedProfitUSD.toFixed(2),
        opp.profitPercent.toFixed(4),
        opp.gasPrice,
        opp.gasCostUSD.toFixed(4),
        opp.flashLoanFee,
        opp.flashLoanFeeUSD.toFixed(4),
        opp.netProfit,
        opp.netProfitUSD.toFixed(2),
        opp.netProfitPercent.toFixed(4),
        opp.executed,
        opp.executionStatus || "",
        opp.failureReason || "",
        opp.txHash || "",
        opp.blockNumber,
        opp.network,
      ].join(",");
    });
    
    const csv = [header, ...rows].join("\n");
    fs.writeFileSync(this.csvFile, csv, "utf8");
  }

  /**
   * Calculate and save daily statistics
   */
  private saveStats(): void {
    const stats = this.calculateDailyStats();
    fs.writeFileSync(this.statsFile, JSON.stringify(stats, null, 2), "utf8");
  }

  /**
   * Calculate daily statistics
   */
  calculateDailyStats(): DailyStats {
    const date = new Date().toISOString().split("T")[0];
    
    if (this.opportunities.length === 0) {
      return {
        date,
        totalOpportunities: 0,
        profitableOpportunities: 0,
        totalPotentialProfit: 0,
        averageSpread: 0,
        averageProfit: 0,
        bestOpportunity: null,
        hourlyDistribution: {},
        pairDistribution: {},
        dexDistribution: {},
      };
    }
    
    // Filter profitable opportunities (positive net profit)
    const profitable = this.opportunities.filter((opp) => opp.netProfitUSD > 0);
    
    // Calculate totals
    const totalPotentialProfit = profitable.reduce(
      (sum, opp) => sum + opp.netProfitUSD,
      0
    );
    
    const averageSpread =
      this.opportunities.reduce((sum, opp) => sum + opp.spreadPercent, 0) /
      this.opportunities.length;
    
    const averageProfit = profitable.length > 0
      ? totalPotentialProfit / profitable.length
      : 0;
    
    // Find best opportunity
    const bestOpportunity = profitable.length > 0
      ? profitable.reduce((best, opp) =>
          opp.netProfitUSD > best.netProfitUSD ? opp : best
        )
      : null;
    
    // Hourly distribution
    const hourlyDistribution: Record<number, number> = {};
    for (let i = 0; i < 24; i++) {
      hourlyDistribution[i] = 0;
    }
    this.opportunities.forEach((opp) => {
      hourlyDistribution[opp.hour]++;
    });
    
    // Pair distribution
    const pairDistribution: Record<string, number> = {};
    this.opportunities.forEach((opp) => {
      pairDistribution[opp.pair] = (pairDistribution[opp.pair] || 0) + 1;
    });
    
    // DEX distribution
    const dexDistribution: Record<string, number> = {};
    this.opportunities.forEach((opp) => {
      const dexPair = `${opp.dex1}/${opp.dex2}`;
      dexDistribution[dexPair] = (dexDistribution[dexPair] || 0) + 1;
    });
    
    return {
      date,
      totalOpportunities: this.opportunities.length,
      profitableOpportunities: profitable.length,
      totalPotentialProfit,
      averageSpread,
      averageProfit,
      bestOpportunity,
      hourlyDistribution,
      pairDistribution,
      dexDistribution,
    };
  }

  /**
   * Generate a human-readable report
   */
  generateReport(): string {
    const stats = this.calculateDailyStats();
    
    let report = "\n";
    report += "╔═══════════════════════════════════════════════════════════════════╗\n";
    report += "║                     ARBITRAGE BOT DAILY REPORT                    ║\n";
    report += "╚═══════════════════════════════════════════════════════════════════╝\n";
    report += "\n";
    
    // Summary
    report += `📅 Date: ${stats.date}\n`;
    report += `⏱️  Runtime: ${this.getRuntime()}\n`;
    report += `\n`;
    
    // Opportunities
    report += `📊 OPPORTUNITIES FOUND\n`;
    report += `   Total: ${stats.totalOpportunities}\n`;
    report += `   Profitable: ${stats.profitableOpportunities} (${((stats.profitableOpportunities / stats.totalOpportunities) * 100).toFixed(1)}%)\n`;
    report += `   Unprofitable: ${stats.totalOpportunities - stats.profitableOpportunities}\n`;
    report += `\n`;
    
    // Profitability
    report += `💰 PROFITABILITY\n`;
    report += `   Total Potential Profit: $${stats.totalPotentialProfit.toFixed(2)}\n`;
    report += `   Average Profit: $${stats.averageProfit.toFixed(2)}\n`;
    report += `   Average Spread: ${stats.averageSpread.toFixed(4)}%\n`;
    report += `\n`;
    
    // Best opportunity
    if (stats.bestOpportunity) {
      const best = stats.bestOpportunity;
      report += `🏆 BEST OPPORTUNITY\n`;
      report += `   Pair: ${best.pair}\n`;
      report += `   DEXes: ${best.dex1} → ${best.dex2}\n`;
      report += `   Spread: ${best.spreadPercent.toFixed(4)}%\n`;
      report += `   Profit: $${best.netProfitUSD.toFixed(2)} (${best.netProfitPercent.toFixed(2)}%)\n`;
      report += `   Time: ${best.time}\n`;
      report += `\n`;
    }
    
    // Top pairs
    report += `🔝 TOP PAIRS (by opportunities)\n`;
    const topPairs = Object.entries(stats.pairDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    topPairs.forEach(([pair, count], index) => {
      report += `   ${index + 1}. ${pair}: ${count} opportunities\n`;
    });
    report += `\n`;
    
    // Top DEX pairs
    report += `🔄 TOP DEX COMBINATIONS\n`;
    const topDexes = Object.entries(stats.dexDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    topDexes.forEach(([dex, count], index) => {
      report += `   ${index + 1}. ${dex}: ${count} opportunities\n`;
    });
    report += `\n`;
    
    // Hourly distribution
    report += `⏰ OPPORTUNITIES BY HOUR (UTC)\n`;
    const hourlyData = Object.entries(stats.hourlyDistribution)
      .sort((a, b) => Number(a[0]) - Number(b[0]));
    
    // Group by 4-hour blocks
    for (let i = 0; i < 24; i += 6) {
      const hours = hourlyData.slice(i, i + 6);
      const counts = hours.map(([h, count]) => `${h}:${String(count).padStart(2, "0")}`);
      report += `   ${counts.join("  ")}\n`;
    }
    report += `\n`;
    
    // Files
    report += `📁 DATA FILES\n`;
    report += `   JSON: ${path.basename(this.opportunitiesFile)}\n`;
    report += `   CSV: ${path.basename(this.csvFile)}\n`;
    report += `   Stats: ${path.basename(this.statsFile)}\n`;
    report += `\n`;
    
    report += "═══════════════════════════════════════════════════════════════════\n";
    
    return report;
  }

  /**
   * Get runtime duration
   */
  private getRuntime(): string {
    if (this.opportunities.length === 0) return "0 minutes";
    
    const first = this.opportunities[0].timestamp;
    const last = this.opportunities[this.opportunities.length - 1].timestamp;
    const durationMs = last - first;
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  /**
   * Start auto-save timer
   */
  private startAutoSave(intervalMs: number): void {
    this.autoSaveInterval = setInterval(() => {
      if (this.opportunities.length > 0) {
        this.save();
      }
    }, intervalMs);
  }

  /**
   * Stop auto-save and save final data
   */
  stop(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
    
    this.save();
    console.log("\n" + this.generateReport());
  }

  /**
   * Get total opportunities count
   */
  getOpportunitiesCount(): number {
    return this.opportunities.length;
  }

  /**
   * Get opportunities for a specific hour
   */
  getOpportunitiesByHour(hour: number): OpportunityData[] {
    return this.opportunities.filter((opp) => opp.hour === hour);
  }

  /**
   * Get opportunities for a specific pair
   */
  getOpportunitiesByPair(pair: string): OpportunityData[] {
    return this.opportunities.filter((opp) => opp.pair === pair);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let loggerInstance: DataLogger | null = null;

export function getLogger(): DataLogger {
  if (!loggerInstance) {
    loggerInstance = new DataLogger();
  }
  return loggerInstance;
}

export function stopLogger(): void {
  if (loggerInstance) {
    loggerInstance.stop();
    loggerInstance = null;
  }
}
