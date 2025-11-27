/**
 * 🚀 Multi-Chain Launcher
 * 
 * Launches arbitrage monitoring on multiple chains simultaneously
 * Each chain runs in a separate process for isolation and performance
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  
  // Chain-specific colors
  polygon: '\x1b[35m',  // Magenta
  bsc: '\x1b[33m',      // Yellow
  base: '\x1b[36m',     // Cyan
  
  // Status colors
  success: '\x1b[32m',  // Green
  error: '\x1b[31m',    // Red
  info: '\x1b[34m',     // Blue
};

// Chain configurations
const CHAINS = [
  {
    name: 'polygon',
    displayName: 'Polygon',
    color: colors.polygon,
    dexes: 6,
    pairs: 18,
    pools: 68,
    icon: '🟣',
  },
  {
    name: 'bsc',
    displayName: 'BSC',
    color: colors.bsc,
    dexes: 5,
    pairs: 11,
    pools: 48,
    icon: '🟡',
  },
  {
    name: 'base',
    displayName: 'Base',
    color: colors.base,
    dexes: 4,
    pairs: 11,
    pools: 18,
    icon: '🔵',
  },
];

// Track running processes
const processes = new Map();
const chainStats = new Map();

// Initialize stats for each chain
CHAINS.forEach(chain => {
  chainStats.set(chain.name, {
    startTime: null,
    opportunities: 0,
    lastOpportunity: null,
    errors: 0,
    status: 'stopped',
  });
});

/**
 * Format timestamp
 */
function timestamp() {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour12: false });
}

/**
 * Print colored message
 */
function log(chain, message, type = 'info') {
  const chainConfig = CHAINS.find(c => c.name === chain);
  const color = chainConfig ? chainConfig.color : colors.info;
  const icon = chainConfig ? chainConfig.icon : '⚪';
  
  const prefix = `${colors.bright}[${timestamp()}]${colors.reset} ${icon} ${color}${chainConfig?.displayName || chain}${colors.reset}`;
  console.log(`${prefix} ${message}`);
}

/**
 * Print header
 */
function printHeader() {
  console.clear();
  console.log(`
${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}
${colors.bright}          🚀 MULTI-CHAIN ARBITRAGE MONITORING 🚀${colors.reset}
${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}

${colors.info}Launching monitoring across 3 chains:${colors.reset}

  ${colors.polygon}🟣 Polygon${colors.reset}  - 6 DEXes, 18 pairs, ~68 pools
  ${colors.bsc}🟡 BSC${colors.reset}      - 5 DEXes, 11 pairs, ~48 pools  
  ${colors.base}🔵 Base${colors.reset}     - 4 DEXes, 11 pairs, ~18 pools

${colors.bright}Total: 15 DEXes, 40 pairs, ~134 pools${colors.reset}

${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}
`);
}

/**
 * Launch monitoring for a specific chain
 */
function launchChain(chain) {
  log(chain.name, `Starting ${chain.displayName} monitoring...`);
  
  const monitorScript = path.join(__dirname, '..', 'src', 'eventPriceMonitor.ts');
  
  // Check if script exists
  if (!fs.existsSync(monitorScript)) {
    log(chain.name, `${colors.error}Error: eventPriceMonitor.ts not found${colors.reset}`, 'error');
    return false;
  }
  
  // Spawn process with chain-specific environment using ts-node
  const childProcess = spawn('npx', ['ts-node', monitorScript], {
    env: {
      ...process.env,
      NETWORK: chain.name,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true, // Required for Windows
  });
  
  // Update stats
  const stats = chainStats.get(chain.name);
  stats.startTime = Date.now();
  stats.status = 'running';
  
  // Handle stdout
  childProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    
    // Parse output for arbitrage opportunities
    if (output.includes('🎯') || output.includes('Arbitrage') || output.includes('spread')) {
      stats.opportunities++;
      stats.lastOpportunity = Date.now();
      log(chain.name, `${colors.success}Opportunity detected! Total: ${stats.opportunities}${colors.reset}`);
    }
    
    // Display other relevant messages
    if (output.includes('✅') || output.includes('Connected') || output.includes('Subscribed')) {
      log(chain.name, output);
    }
  });
  
  // Handle stderr
  childProcess.stderr.on('data', (data) => {
    const error = data.toString().trim();
    stats.errors++;
    log(chain.name, `${colors.error}Error: ${error}${colors.reset}`, 'error');
  });
  
  // Handle process exit
  childProcess.on('exit', (code, signal) => {
    stats.status = 'stopped';
    processes.delete(chain.name);
    
    if (code === 0) {
      log(chain.name, `${colors.success}Stopped gracefully${colors.reset}`);
    } else {
      log(chain.name, `${colors.error}Exited with code ${code}${colors.reset}`, 'error');
    }
  });
  
  // Handle errors
  childProcess.on('error', (err) => {
    stats.status = 'error';
    stats.errors++;
    log(chain.name, `${colors.error}Failed to start: ${err.message}${colors.reset}`, 'error');
  });
  
  processes.set(chain.name, childProcess);
  log(chain.name, `${colors.success}✅ Started (PID: ${childProcess.pid})${colors.reset}`);
  
  return true;
}

/**
 * Print status summary
 */
function printStatus() {
  console.log(`\n${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}                    📊 LIVE STATUS${colors.reset}`);
  console.log(`${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}\n`);
  
  CHAINS.forEach(chain => {
    const stats = chainStats.get(chain.name);
    const runtime = stats.startTime 
      ? Math.floor((Date.now() - stats.startTime) / 1000) 
      : 0;
    const lastOpp = stats.lastOpportunity
      ? Math.floor((Date.now() - stats.lastOpportunity) / 1000)
      : null;
    
    const statusIcon = stats.status === 'running' ? '🟢' : '🔴';
    const statusText = stats.status === 'running' ? 'RUNNING' : 'STOPPED';
    
    console.log(`${chain.color}${chain.icon} ${chain.displayName.padEnd(10)}${colors.reset} ${statusIcon} ${statusText}`);
    console.log(`   Runtime: ${runtime}s | Opportunities: ${stats.opportunities} | Errors: ${stats.errors}`);
    if (lastOpp !== null) {
      console.log(`   Last opportunity: ${lastOpp}s ago`);
    }
    console.log('');
  });
  
  // Calculate totals
  const totalOpportunities = Array.from(chainStats.values()).reduce((sum, s) => sum + s.opportunities, 0);
  const totalErrors = Array.from(chainStats.values()).reduce((sum, s) => sum + s.errors, 0);
  const activeChains = Array.from(chainStats.values()).filter(s => s.status === 'running').length;
  
  console.log(`${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}Total Opportunities: ${totalOpportunities} | Total Errors: ${totalErrors} | Active: ${activeChains}/3${colors.reset}`);
  console.log(`${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}\n`);
}

/**
 * Stop all chains
 */
function stopAll() {
  console.log(`\n${colors.info}Stopping all chains...${colors.reset}\n`);
  
  processes.forEach((proc, chainName) => {
    log(chainName, 'Stopping...');
    proc.kill('SIGTERM');
  });
  
  // Wait for processes to exit
  setTimeout(() => {
    printStatus();
    console.log(`\n${colors.success}All chains stopped.${colors.reset}\n`);
    process.exit(0);
  }, 2000);
}

/**
 * Main execution
 */
async function main() {
  printHeader();
  
  console.log(`${colors.info}Starting all chains...${colors.reset}\n`);
  
  // Launch all chains with delays
  for (let i = 0; i < CHAINS.length; i++) {
    const chain = CHAINS[i];
    launchChain(chain);
    
    // Delay between launches to avoid overwhelming the system
    if (i < CHAINS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log(`\n${colors.success}All chains launched!${colors.reset}\n`);
  console.log(`${colors.info}Press Ctrl+C to stop all chains and view final stats.${colors.reset}\n`);
  
  // Print status every 30 seconds
  const statusInterval = setInterval(() => {
    printStatus();
  }, 30000);
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    clearInterval(statusInterval);
    stopAll();
  });
  
  // Handle uncaught errors
  process.on('uncaughtException', (err) => {
    console.error(`${colors.error}Uncaught exception: ${err.message}${colors.reset}`);
    stopAll();
  });
}

// Run
main().catch(err => {
  console.error(`${colors.error}Fatal error: ${err.message}${colors.reset}`);
  process.exit(1);
});
