/**
 * 🎨 Logger Utility
 * 
 * Provides colored console output with timestamps and log levels.
 * Makes it easy to track what your bot is doing in real-time.
 */

import chalk from "chalk";

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  SUCCESS = "SUCCESS",
  WARNING = "WARNING",
  ERROR = "ERROR",
}

class Logger {
  private debugMode: boolean;

  constructor(debugMode: boolean = false) {
    this.debugMode = debugMode;
  }

  /**
   * Get current timestamp for logs
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Format log message with timestamp and level
   */
  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = chalk.gray(this.getTimestamp());
    const levelStr = this.formatLevel(level);
    return `${timestamp} ${levelStr} ${message}`;
  }

  /**
   * Format log level with colors
   */
  private formatLevel(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return chalk.magenta("[DEBUG]");
      case LogLevel.INFO:
        return chalk.blue("[INFO] ");
      case LogLevel.SUCCESS:
        return chalk.green("[OK]   ");
      case LogLevel.WARNING:
        return chalk.yellow("[WARN] ");
      case LogLevel.ERROR:
        return chalk.red("[ERROR]");
      default:
        return `[${level}]`;
    }
  }

  /**
   * Debug logs (only shown when debug mode is enabled)
   */
  debug(message: string, data?: any): void {
    if (!this.debugMode) return;
    console.log(this.formatMessage(LogLevel.DEBUG, message));
    if (data) {
      console.log(chalk.gray(JSON.stringify(data, null, 2)));
    }
  }

  /**
   * Info logs (general information)
   */
  info(message: string, data?: any): void {
    console.log(this.formatMessage(LogLevel.INFO, message));
    if (data) {
      console.log(chalk.blue(JSON.stringify(data, null, 2)));
    }
  }

  /**
   * Success logs (operations completed successfully)
   */
  success(message: string, data?: any): void {
    console.log(this.formatMessage(LogLevel.SUCCESS, message));
    if (data) {
      console.log(chalk.green(JSON.stringify(data, null, 2)));
    }
  }

  /**
   * Warning logs (potential issues)
   */
  warning(message: string, data?: any): void {
    console.log(this.formatMessage(LogLevel.WARNING, message));
    if (data) {
      console.log(chalk.yellow(JSON.stringify(data, null, 2)));
    }
  }

  /**
   * Error logs (something went wrong)
   */
  error(message: string, error?: any): void {
    console.error(this.formatMessage(LogLevel.ERROR, message));
    if (error) {
      if (error instanceof Error) {
        console.error(chalk.red(error.message));
        if (this.debugMode && error.stack) {
          console.error(chalk.gray(error.stack));
        }
      } else {
        console.error(chalk.red(JSON.stringify(error, null, 2)));
      }
    }
  }

  /**
   * Log a separator line
   */
  separator(): void {
    console.log(chalk.gray("─".repeat(80)));
  }

  /**
   * Log bot startup banner
   */
  banner(): void {
    console.log(chalk.cyan("\n" + "=".repeat(80)));
    console.log(
      chalk.cyan.bold("    [BOT] ARBITRAGE BOT STARTED - Flash Loan Edition")
    );
    console.log(chalk.cyan("=".repeat(80) + "\n"));
  }

  /**
   * Log arbitrage opportunity found
   */
  opportunity(pair: string, profit: number, profitPercent: number): void {
    const profitStr = chalk.green(`$${profit.toFixed(2)}`);
    const percentStr = chalk.green(`${profitPercent.toFixed(2)}%`);
    console.log(
      chalk.bold(
        `\n[OPPORTUNITY] ${pair} - Profit: ${profitStr} (${percentStr})`
      )
    );
  }

  /**
   * Log trade execution
   */
  trade(type: "START" | "SUCCESS" | "FAILED", txHash?: string): void {
    if (type === "START") {
      console.log(chalk.yellow("[EXECUTING] Arbitrage trade..."));
    } else if (type === "SUCCESS") {
      console.log(
        chalk.green(`[SUCCESS] Trade executed successfully! TX: ${txHash}`)
      );
    } else {
      console.log(chalk.red(`[FAILED] Trade failed! TX: ${txHash}`));
    }
  }

  /**
   * Log price check
   */
  priceCheck(pair: string, dex1Price: number, dex2Price: number): void {
    if (!this.debugMode) return;
    const diff = Math.abs(dex1Price - dex2Price);
    const diffPercent = (diff / dex1Price) * 100;
    console.log(
      chalk.gray(
        `[PRICE] ${pair}: DEX1=${dex1Price.toFixed(4)} | DEX2=${dex2Price.toFixed(
          4
        )} | Diff=${diffPercent.toFixed(3)}%`
      )
    );
  }

  /**
   * Enable/disable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }
}

// Export singleton instance
export const logger = new Logger(process.env.ENABLE_DEBUG === "true");

export default logger;
