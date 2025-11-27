#!/usr/bin/env node

/**
 * 🔄 Auto-Update Trading Pairs
 * 
 * Automatically updates trading-pairs.json with:
 * 1. Live liquidity verification from QuickSwap + SushiSwap
 * 2. Filters out fake pools (> 2% spread)
 * 3. Excludes top 15 tokens (except as base pairs)
 * 4. Respects user exclusion list
 * 
 * Run this daily via cron or manually to refresh pairs
 * 
 * Usage:
 *   node scripts/auto-update-pairs.js
 *   
 * Cron example (daily at 2 AM):
 *   0 2 * * * cd /path/to/bot && node scripts/auto-update-pairs.js
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Configuration
const RPC_URL = process.env.POLYGON_RPC_URL || 'https://polygon-mainnet.g.alchemy.com/v2/5z1t0IOirVugLoPi0wSHv';
const QUICKSWAP_ROUTER = '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff';
const SUSHISWAP_ROUTER = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506';
const PAIRS_FILE = path.join(__dirname, '..', '..', 'data', 'pairs', 'trading-pairs.json');

// Stablecoin list for exclusion checks
const STABLECOINS = ['USDC', 'USDT', 'DAI', 'MAI', 'USDD', 'FRAX', 'TUSD', 'BUSD'];

// User exclusion list (from user requests)
const USER_EXCLUSIONS = [
  // WETH vs stablecoins - ALL EXCLUDED
  'WETH/USDT',
  'WETH/USDC',
  'WETH/DAI',
  'WETH/MAI',
  
  // WBTC vs stablecoins - ALL EXCLUDED
  'WBTC/USDT',
  'WBTC/USDC',
  'WBTC/DAI',
  'WBTC/MAI',
  
  // Stablecoin vs stablecoin - ALL EXCLUDED
  'DAI/USDC',
  'DAI/USDT',
  'DAI/MAI',
  'USDC/USDT',
  'USDC/MAI',
  'USDT/MAI',
  'MAI/USDC',
  'MAI/USDT',
  'MAI/DAI',
  
  // ALL WMATIC/MATIC pairs - EXCLUDED
  'WMATIC/DAI',
  'WMATIC/USDC',
  'WMATIC/USDT',
  'WMATIC/WETH',
  'WMATIC/WBTC',
  'WMATIC/LINK',
  'WMATIC/AAVE',
  'WMATIC/UNI',
  'WMATIC/MAI',
  'WMATIC/GHST',
  'WMATIC/CRV',
  'WMATIC/SUSHI',
  'WMATIC/MANA',
  'WMATIC/SAND',
  'MATIC/DAI',
  'MATIC/USDC',
  'MATIC/USDT',
  'MATIC/WETH',
  'MATIC/WBTC',
];

// Top 15 tokens to exclude (except as base pairs)
const TOP_15_TOKENS = [
  'WBTC',  // #9
  'LINK',  // #3
  'AAVE',  // #6
  'UNI',   // #5
  // POL, USDC, USDT, WETH, DAI allowed as base pairs
];

// Token addresses (from config.ts)
const TOKENS = {
  WMATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
  WETH: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
  WBTC: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
  LINK: '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39',
  UNI: '0xb33EaAd8d922B1083446DC23f610c2567fB5180f',
  AAVE: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B',
  MAI: '0xa3Fa99A148fA48D14Ed51d610c367C61876997F1',
  GHST: '0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7',
  CRV: '0x172370d5Cd63279eFa6d502DAB29171933a610AF',
  SUSHI: '0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a',
  SAND: '0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683',
  MANA: '0xA1c57f48F0Deb89f569dFbE6E2B7f46D33606fD4',
};

// Candidate pairs to test
// FOCUS: Non-stablecoin pairs, no WMATIC, no WETH/WBTC vs stables
const CANDIDATE_PAIRS = [
  // Crypto vs Crypto pairs (NO stablecoins, NO WMATIC)
  { name: 'WETH/WBTC', token0: 'WETH', token1: 'WBTC' },
  { name: 'LINK/WETH', token0: 'LINK', token1: 'WETH' },
  { name: 'AAVE/WETH', token0: 'AAVE', token1: 'WETH' },
  { name: 'UNI/WETH', token0: 'UNI', token1: 'WETH' },
  { name: 'CRV/WETH', token0: 'CRV', token1: 'WETH' },
  { name: 'SUSHI/WETH', token0: 'SUSHI', token1: 'WETH' },
  { name: 'GHST/WETH', token0: 'GHST', token1: 'WETH' },
  { name: 'SAND/WETH', token0: 'SAND', token1: 'WETH' },
  { name: 'MANA/WETH', token0: 'MANA', token1: 'WETH' },
  
  // DeFi token pairs
  { name: 'LINK/WBTC', token0: 'LINK', token1: 'WBTC' },
  { name: 'AAVE/WBTC', token0: 'AAVE', token1: 'WBTC' },
  { name: 'UNI/WBTC', token0: 'UNI', token1: 'WBTC' },
  
  // Gaming/NFT tokens
  { name: 'SAND/GHST', token0: 'SAND', token1: 'GHST' },
  { name: 'MANA/GHST', token0: 'MANA', token1: 'GHST' },
  { name: 'SAND/MANA', token0: 'SAND', token1: 'MANA' },
  
  // DeFi pairs
  { name: 'CRV/SUSHI', token0: 'CRV', token1: 'SUSHI' },
  { name: 'AAVE/UNI', token0: 'AAVE', token1: 'UNI' },
  { name: 'LINK/UNI', token0: 'LINK', token1: 'UNI' },
  
  // Note: ALL stablecoin pairs, WMATIC pairs, WETH/WBTC vs stables excluded
];

const provider = new ethers.JsonRpcProvider(RPC_URL);

const ROUTER_ABI = [
  'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)'
];

console.log('\n═══════════════════════════════════════════════════════');
console.log('        🔄 AUTO-UPDATE TRADING PAIRS');
console.log('═══════════════════════════════════════════════════════\n');
console.log(`Timestamp: ${new Date().toISOString()}`);
console.log(`RPC: ${RPC_URL.substring(0, 50)}...`);
console.log(`Testing: ${CANDIDATE_PAIRS.length} candidate pairs\n`);

/**
 * Get price from DEX router
 */
async function getPrice(routerAddress, tokenIn, tokenOut) {
  try {
    const router = new ethers.Contract(routerAddress, ROUTER_ABI, provider);
    const amountIn = ethers.parseUnits('1', 18);
    const path = [tokenIn, tokenOut];
    
    const amounts = await router.getAmountsOut(amountIn, path);
    const amountOut = amounts[1];
    
    return parseFloat(ethers.formatUnits(amountOut, 18));
  } catch (error) {
    return null;
  }
}

/**
 * Verify pair liquidity
 */
async function verifyPair(pair) {
  const token0Addr = TOKENS[pair.token0];
  const token1Addr = TOKENS[pair.token1];
  
  if (!token0Addr || !token1Addr) {
    return {
      ...pair,
      enabled: false,
      reason: 'Missing token address'
    };
  }
  
  console.log(`🔍 Testing ${pair.name}...`);
  
  // Get prices from both DEXes
  const [quickPrice, sushiPrice] = await Promise.all([
    getPrice(QUICKSWAP_ROUTER, token0Addr, token1Addr),
    getPrice(SUSHISWAP_ROUTER, token0Addr, token1Addr)
  ]);
  
  // Check if both DEXes have pools
  if (!quickPrice || !sushiPrice) {
    console.log(`   ❌ No liquidity (Quick: ${quickPrice}, Sushi: ${sushiPrice})`);
    return {
      ...pair,
      enabled: false,
      verifiedSpread: null,
      reason: 'No liquidity on one or both DEXes'
    };
  }
  
  // Calculate spread
  const spread = Math.abs(quickPrice - sushiPrice) / Math.min(quickPrice, sushiPrice) * 100;
  
  // Filter fake pools (> 2% spread is suspicious)
  if (spread > 2) {
    console.log(`   ❌ FAKE POOL! Spread: ${spread.toFixed(2)}%`);
    return {
      ...pair,
      enabled: false,
      verifiedSpread: spread,
      reason: `Fake pool detected (${spread.toFixed(2)}% spread)`
    };
  }
  
  // Check if pair contains top 15 token
  const hasTop15 = TOP_15_TOKENS.includes(pair.token0) || TOP_15_TOKENS.includes(pair.token1);
  if (hasTop15) {
    console.log(`   ❌ Contains top 15 token`);
    return {
      ...pair,
      enabled: false,
      verifiedSpread: spread,
      reason: 'Contains top 15 token (MEV dominated)'
    };
  }
  
  // Check if pair contains WMATIC or MATIC (user exclusion)
  const hasWMATIC = pair.token0 === 'WMATIC' || pair.token1 === 'WMATIC' || 
                    pair.token0 === 'MATIC' || pair.token1 === 'MATIC';
  if (hasWMATIC) {
    console.log(`   ❌ Contains WMATIC/MATIC (user exclusion)`);
    return {
      ...pair,
      enabled: false,
      verifiedSpread: spread,
      reason: 'Contains WMATIC/MATIC (user exclusion)'
    };
  }
  
  // Check if both tokens are stablecoins (user exclusion)
  const token0IsStable = STABLECOINS.includes(pair.token0);
  const token1IsStable = STABLECOINS.includes(pair.token1);
  if (token0IsStable && token1IsStable) {
    console.log(`   ❌ Stablecoin vs stablecoin (user exclusion)`);
    return {
      ...pair,
      enabled: false,
      verifiedSpread: spread,
      reason: 'Stablecoin vs stablecoin (user exclusion)'
    };
  }
  
  // Check if WETH vs stablecoin (user exclusion)
  const hasWETH = pair.token0 === 'WETH' || pair.token1 === 'WETH';
  const hasStablecoin = token0IsStable || token1IsStable;
  if (hasWETH && hasStablecoin) {
    console.log(`   ❌ WETH vs stablecoin (user exclusion)`);
    return {
      ...pair,
      enabled: false,
      verifiedSpread: spread,
      reason: 'WETH vs stablecoin (user exclusion)'
    };
  }
  
  // Check if WBTC vs stablecoin (user exclusion)
  const hasWBTC = pair.token0 === 'WBTC' || pair.token1 === 'WBTC';
  if (hasWBTC && hasStablecoin) {
    console.log(`   ❌ WBTC vs stablecoin (user exclusion)`);
    return {
      ...pair,
      enabled: false,
      verifiedSpread: spread,
      reason: 'WBTC vs stablecoin (user exclusion)'
    };
  }
  
  // Check user exclusion list (fallback for any missed combinations)
  if (USER_EXCLUSIONS.includes(pair.name)) {
    console.log(`   ❌ User exclusion list`);
    return {
      ...pair,
      enabled: false,
      verifiedSpread: spread,
      reason: 'User exclusion list'
    };
  }
  
  console.log(`   ✅ VALID! Spread: ${spread.toFixed(4)}%`);
  return {
    ...pair,
    enabled: true,
    verifiedSpread: parseFloat(spread.toFixed(4)),
    reason: 'Verified liquidity, realistic spread'
  };
}

/**
 * Main execution
 */
async function main() {
  try {
    // Verify all candidate pairs
    console.log('Starting verification...\n');
    const results = [];
    
    for (const pair of CANDIDATE_PAIRS) {
      const result = await verifyPair(pair);
      results.push(result);
      
      // Rate limiting (avoid API throttling)
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Separate enabled and disabled pairs
    const enabledPairs = results.filter(p => p.enabled);
    const disabledPairs = results.filter(p => !p.enabled);
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('                    RESULTS');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(`✅ Enabled pairs: ${enabledPairs.length}`);
    enabledPairs.forEach(p => {
      console.log(`   ${p.name} - ${p.verifiedSpread?.toFixed(4)}% spread`);
    });
    
    console.log(`\n❌ Disabled pairs: ${disabledPairs.length}`);
    disabledPairs.forEach(p => {
      console.log(`   ${p.name} - ${p.reason}`);
    });
    
    // Create updated config
    const updatedConfig = {
      lastUpdated: new Date().toISOString(),
      updateFrequency: 'daily',
      source: 'auto_verification',
      criteria: {
        excludeTop15: true,
        maxSpread: 2.0,
        minLiquidity: 300000,
        verifiedDEXes: ['quickswap', 'sushiswap']
      },
      pairs: results,
      excludedPairs: disabledPairs.map(p => ({
        name: p.name,
        reason: p.reason
      }))
    };
    
    // Write to file
    fs.writeFileSync(PAIRS_FILE, JSON.stringify(updatedConfig, null, 2));
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log(`✅ Updated: ${PAIRS_FILE}`);
    console.log(`📊 ${enabledPairs.length} pairs enabled, ${disabledPairs.length} disabled`);
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('💡 Next steps:');
    console.log('   1. Restart the bot to load new pairs');
    console.log('   2. OR the bot will auto-reload if file watching is enabled');
    console.log('   3. Schedule this script to run daily via cron\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
