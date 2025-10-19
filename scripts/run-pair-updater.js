#!/usr/bin/env node

/**
 * 🔄 Continuous Pair Updater
 * 
 * Runs auto-update-pairs.js every 4 hours continuously
 * Can be used standalone or as a Windows service
 * 
 * Usage:
 *   node scripts/run-pair-updater.js
 * 
 * Features:
 *   - Runs updates every 4 hours
 *   - Logs to console and file
 *   - Graceful shutdown on Ctrl+C
 *   - Error recovery (continues on failures)
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const UPDATE_INTERVAL_HOURS = 4;
const UPDATE_INTERVAL_MS = UPDATE_INTERVAL_HOURS * 60 * 60 * 1000;
const LOG_FILE = path.join(__dirname, '..', 'logs', 'pair-updater.log');
const SCRIPT_PATH = path.join(__dirname, 'auto-update-pairs.js');

let updateCount = 0;
let intervalId = null;
let isUpdating = false;

/**
 * Log to console and file
 */
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  
  console.log(logMessage);
  
  // Append to log file
  try {
    const logDir = path.dirname(LOG_FILE);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(LOG_FILE, logMessage + '\n');
  } catch (error) {
    console.error('Failed to write to log file:', error.message);
  }
}

/**
 * Run the update script
 */
function runUpdate() {
  if (isUpdating) {
    log('⚠️  Update already in progress, skipping...');
    return;
  }

  isUpdating = true;
  updateCount++;
  
  log('═══════════════════════════════════════════════════════');
  log(`🔄 Running pair update #${updateCount}`);
  log('═══════════════════════════════════════════════════════');

  return new Promise((resolve) => {
    const child = spawn('node', [SCRIPT_PATH], {
      cwd: path.join(__dirname, '..'),
      env: process.env,
      stdio: 'inherit' // Show script output in console
    });

    child.on('close', (code) => {
      if (code === 0) {
        log('✅ Update completed successfully');
        log(`📊 Total updates: ${updateCount}`);
        log(`⏰ Next update in ${UPDATE_INTERVAL_HOURS} hours`);
      } else {
        log(`❌ Update failed with code ${code}`);
        log('⚠️  Will retry on next scheduled run');
      }
      
      isUpdating = false;
      resolve();
    });

    child.on('error', (error) => {
      log(`❌ Failed to execute update script: ${error.message}`);
      isUpdating = false;
      resolve();
    });
  });
}

/**
 * Start the scheduler
 */
async function start() {
  log('');
  log('╔═══════════════════════════════════════════════════════╗');
  log('║        🔄 CONTINUOUS PAIR UPDATER STARTED            ║');
  log('╚═══════════════════════════════════════════════════════╝');
  log('');
  log(`⏰ Update interval: Every ${UPDATE_INTERVAL_HOURS} hours`);
  log(`📜 Script: ${SCRIPT_PATH}`);
  log(`📝 Log file: ${LOG_FILE}`);
  log('');
  log('💡 Press Ctrl+C to stop');
  log('');

  // Run immediately on start
  await runUpdate();

  // Schedule recurring updates
  intervalId = setInterval(async () => {
    await runUpdate();
  }, UPDATE_INTERVAL_MS);
}

/**
 * Graceful shutdown
 */
function shutdown() {
  log('');
  log('⏹️  Shutting down pair updater...');
  
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  
  log(`📊 Total updates completed: ${updateCount}`);
  log('✅ Pair updater stopped');
  log('');
  
  process.exit(0);
}

// Handle Ctrl+C
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  log(`❌ Uncaught exception: ${error.message}`);
  log('⚠️  Continuing to run...');
});

process.on('unhandledRejection', (reason) => {
  log(`❌ Unhandled rejection: ${reason}`);
  log('⚠️  Continuing to run...');
});

// Start the scheduler
start().catch((error) => {
  log(`❌ Failed to start: ${error.message}`);
  process.exit(1);
});
