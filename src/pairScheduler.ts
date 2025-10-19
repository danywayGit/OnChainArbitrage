/**
 * ⏰ Pair Update Scheduler
 * 
 * Automatically runs pair verification every 4 hours to keep pairs fresh
 * Runs inside the bot process - no need for external cron/task scheduler
 * 
 * Features:
 * - Auto-updates trading-pairs.json every 4 hours
 * - Hot-reloads pairs without bot restart
 * - Logs all updates with timestamps
 */

import { spawn } from 'child_process';
import * as path from 'path';
import { logger } from './logger';
import { reloadTradingPairs } from './dynamicPairs';

export class PairUpdateScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private updateIntervalMs: number;
  private isUpdating: boolean = false;
  private lastUpdateTime: Date | null = null;
  private updateCount: number = 0;

  constructor(updateIntervalHours: number = 4) {
    this.updateIntervalMs = updateIntervalHours * 60 * 60 * 1000; // Convert to milliseconds
    logger.info(`[SCHEDULER] ⏰ Pair update scheduler initialized (every ${updateIntervalHours} hours)`);
  }

  /**
   * Start the scheduler
   */
  public start(): void {
    if (this.intervalId) {
      logger.error('[SCHEDULER] Already running!');
      return;
    }

    logger.info('[SCHEDULER] 🚀 Starting pair update scheduler...');
    
    // Run immediately on start
    this.runUpdate();
    
    // Schedule recurring updates
    this.intervalId = setInterval(() => {
      this.runUpdate();
    }, this.updateIntervalMs);

    logger.info(`[SCHEDULER] ✅ Scheduled to run every ${this.updateIntervalMs / (60 * 60 * 1000)} hours`);
  }

  /**
   * Stop the scheduler
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('[SCHEDULER] ⏹️  Stopped pair update scheduler');
    }
  }

  /**
   * Run the update script
   */
  private async runUpdate(): Promise<void> {
    if (this.isUpdating) {
      logger.info('[SCHEDULER] ⚠️  Update already in progress, skipping...');
      return;
    }

    this.isUpdating = true;
    this.lastUpdateTime = new Date();
    this.updateCount++;

    logger.info(`[SCHEDULER] 🔄 Running pair update #${this.updateCount} at ${this.lastUpdateTime.toISOString()}`);

    try {
      await this.executeUpdateScript();
      
      // Reload pairs in the bot after successful update
      logger.info('[SCHEDULER] 🔃 Reloading trading pairs...');
      const pairs = reloadTradingPairs();
      logger.info(`[SCHEDULER] ✅ Update complete! ${pairs.length} pairs loaded`);
      
    } catch (error: any) {
      logger.error(`[SCHEDULER] ❌ Update failed: ${error.message}`);
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Execute the auto-update-pairs.js script
   */
  private executeUpdateScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, '..', 'scripts', 'auto-update-pairs.js');
      
      logger.info(`[SCHEDULER] 📜 Executing: ${scriptPath}`);
      
      const child = spawn('node', [scriptPath], {
        cwd: path.join(__dirname, '..'),
        env: process.env,
        stdio: 'pipe'
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          logger.info('[SCHEDULER] ✅ Update script completed successfully');
          
          // Log key output lines
          const lines = stdout.split('\n').filter(line => 
            line.includes('✅') || line.includes('❌') || line.includes('Enabled pairs:')
          );
          
          if (lines.length > 0) {
            logger.info('[SCHEDULER] Script output:');
            lines.forEach(line => logger.info(`  ${line.trim()}`));
          }
          
          resolve();
        } else {
          logger.error(`[SCHEDULER] ❌ Update script failed with code ${code}`);
          if (stderr) {
            logger.error(`[SCHEDULER] Error output: ${stderr}`);
          }
          reject(new Error(`Update script exited with code ${code}`));
        }
      });

      child.on('error', (error) => {
        logger.error(`[SCHEDULER] ❌ Failed to execute update script: ${error.message}`);
        reject(error);
      });
    });
  }

  /**
   * Get scheduler status
   */
  public getStatus(): {
    isRunning: boolean;
    isUpdating: boolean;
    lastUpdateTime: Date | null;
    updateCount: number;
    nextUpdateTime: Date | null;
  } {
    const nextUpdateTime = this.lastUpdateTime
      ? new Date(this.lastUpdateTime.getTime() + this.updateIntervalMs)
      : null;

    return {
      isRunning: this.intervalId !== null,
      isUpdating: this.isUpdating,
      lastUpdateTime: this.lastUpdateTime,
      updateCount: this.updateCount,
      nextUpdateTime,
    };
  }

  /**
   * Force an immediate update (useful for testing)
   */
  public async forceUpdate(): Promise<void> {
    logger.info('[SCHEDULER] 🔨 Force update requested');
    await this.runUpdate();
  }
}

// Singleton instance
let schedulerInstance: PairUpdateScheduler | null = null;

/**
 * Get the scheduler instance
 */
export function getScheduler(): PairUpdateScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new PairUpdateScheduler(4); // 4 hours
  }
  return schedulerInstance;
}

/**
 * Start the scheduler
 */
export function startScheduler(): void {
  const scheduler = getScheduler();
  scheduler.start();
}

/**
 * Stop the scheduler
 */
export function stopScheduler(): void {
  if (schedulerInstance) {
    schedulerInstance.stop();
  }
}

export default {
  PairUpdateScheduler,
  getScheduler,
  startScheduler,
  stopScheduler,
};
