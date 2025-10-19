/**
 * 🧪 Multi-Chain Quick Test
 * 
 * Tests connectivity and basic functionality across all 3 chains
 * Quick validation before running full monitoring
 */

const { ethers } = require('ethers');
require('dotenv').config();

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

const CHAINS = [
  {
    name: 'Polygon',
    network: 'polygon',
    rpc: process.env.POLYGON_RPC_URL,
    wss: process.env.POLYGON_WSS_URL,
    chainId: 137,
    icon: '🟣',
    color: colors.magenta,
  },
  {
    name: 'BSC',
    network: 'bsc',
    rpc: process.env.BSC_RPC_URL,
    wss: process.env.BSC_WSS_URL,
    chainId: 56,
    icon: '🟡',
    color: colors.yellow,
  },
  {
    name: 'Base',
    network: 'base',
    rpc: process.env.BASE_RPC_URL,
    wss: process.env.BASE_WSS_URL,
    chainId: 8453,
    icon: '🔵',
    color: colors.cyan,
  },
];

async function testChain(chain) {
  console.log(`\n${chain.color}${chain.icon} Testing ${chain.name}...${colors.reset}`);
  console.log(`${'─'.repeat(60)}`);
  
  const results = {
    http: false,
    wss: false,
    chainId: false,
    block: false,
  };
  
  // Test HTTP RPC
  try {
    console.log(`  📡 HTTP RPC: ${chain.rpc?.substring(0, 50)}...`);
    const httpProvider = new ethers.JsonRpcProvider(chain.rpc);
    const network = await httpProvider.getNetwork();
    const chainId = Number(network.chainId);
    
    if (chainId === chain.chainId) {
      console.log(`     ${colors.green}✅ Connected - Chain ID ${chainId}${colors.reset}`);
      results.http = true;
      results.chainId = true;
      
      // Get current block
      const blockNumber = await httpProvider.getBlockNumber();
      console.log(`     ${colors.green}✅ Current Block: ${blockNumber.toLocaleString()}${colors.reset}`);
      results.block = true;
    } else {
      console.log(`     ${colors.red}❌ Wrong Chain ID: ${chainId} (expected ${chain.chainId})${colors.reset}`);
    }
  } catch (error) {
    console.log(`     ${colors.red}❌ HTTP Failed: ${error.message}${colors.reset}`);
  }
  
  // Test WebSocket
  try {
    if (chain.wss) {
      console.log(`  🔌 WebSocket: ${chain.wss?.substring(0, 50)}...`);
      const wssProvider = new ethers.WebSocketProvider(chain.wss);
      
      // Try to get block number
      const blockNumber = await Promise.race([
        wssProvider.getBlockNumber(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]);
      
      console.log(`     ${colors.green}✅ Connected - Block ${blockNumber.toLocaleString()}${colors.reset}`);
      results.wss = true;
      
      // Clean up
      await wssProvider.destroy();
    } else {
      console.log(`  🔌 WebSocket: ${colors.yellow}Not configured${colors.reset}`);
    }
  } catch (error) {
    console.log(`     ${colors.yellow}⚠️  WebSocket: ${error.message}${colors.reset}`);
  }
  
  // Summary
  const allPassed = results.http && results.chainId && results.block;
  const status = allPassed ? `${colors.green}✅ READY${colors.reset}` : `${colors.red}❌ ISSUES${colors.reset}`;
  console.log(`\n  Status: ${status}`);
  
  return { chain: chain.name, ...results, ready: allPassed };
}

async function main() {
  console.log(`
${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}
${colors.bright}        🧪 MULTI-CHAIN CONNECTIVITY TEST 🧪${colors.reset}
${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}
`);
  
  const results = [];
  
  for (const chain of CHAINS) {
    const result = await testChain(chain);
    results.push(result);
  }
  
  // Summary
  console.log(`\n${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}                    📊 SUMMARY${colors.reset}`);
  console.log(`${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}\n`);
  
  results.forEach(result => {
    const icon = result.ready ? '✅' : '❌';
    const status = result.ready ? colors.green + 'READY' : colors.red + 'NOT READY';
    console.log(`  ${icon} ${result.chain.padEnd(10)} ${status}${colors.reset}`);
    console.log(`     HTTP: ${result.http ? '✅' : '❌'} | WSS: ${result.wss ? '✅' : '⚠️'} | Chain ID: ${result.chainId ? '✅' : '❌'}`);
  });
  
  const allReady = results.every(r => r.ready);
  
  console.log(`\n${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}\n`);
  
  if (allReady) {
    console.log(`${colors.green}${colors.bright}🎉 All chains are ready for monitoring!${colors.reset}\n`);
    console.log(`${colors.blue}Next steps:${colors.reset}`);
    console.log(`  1. Run: ${colors.bright}node scripts/multi-chain-launcher.js${colors.reset}`);
    console.log(`  2. Monitor output for arbitrage opportunities`);
    console.log(`  3. Press Ctrl+C to stop and view statistics\n`);
  } else {
    console.log(`${colors.red}${colors.bright}⚠️  Some chains have issues. Please fix before proceeding.${colors.reset}\n`);
    console.log(`${colors.yellow}Common fixes:${colors.reset}`);
    console.log(`  • Check .env file for correct RPC URLs`);
    console.log(`  • Verify Alchemy account has chains enabled`);
    console.log(`  • Test RPC endpoints manually in browser\n`);
  }
  
  process.exit(allReady ? 0 : 1);
}

main().catch(err => {
  console.error(`${colors.red}Fatal error: ${err.message}${colors.reset}`);
  process.exit(1);
});
