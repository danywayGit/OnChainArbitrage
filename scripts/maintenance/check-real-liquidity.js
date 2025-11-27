/**
 * Simple script to check which pairs have REAL liquidity on QuickSwap + SushiSwap
 * Uses the bot's existing price monitoring to detect fake vs real pools
 */

const { ethers } = require('ethers');
require('dotenv').config();

const RPC_URL = process.env.POLYGON_RPC_URL;
const provider = new ethers.JsonRpcProvider(RPC_URL, 137);

// DEX Routers
const QUICKSWAP_ROUTER = '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff';
const SUSHISWAP_ROUTER = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506';

const ROUTER_ABI = [
  'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)'
];

// Tokens
const TOKENS = {
  WMATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  WETH: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
  WBTC: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
  USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
  LINK: '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39',
  AAVE: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B',
  UNI: '0xb33EaAd8d922B1083446DC23f610c2567fB5180f',
  CRV: '0x172370d5Cd63279eFa6d502DAB29171933a610AF',
  POL: '0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6',
  SAND: '0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683',
  MANA: '0xA1c57f48F0Deb89f569dFbE6E2B7f46D33606fD4',
  SUSHI: '0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a',
  QUICK: '0xB5C064F955D8e7F38fE0460C556a72987494eE17',
  GHST: '0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7',
  MAI: '0xa3Fa99A148fA48D14Ed51d610c367C61876997F1',
  BAL: '0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3',
};

async function checkPrice(router, tokenIn, tokenOut, amountIn = '1') {
  try {
    const routerContract = new ethers.Contract(router, ROUTER_ABI, provider);
    const path = [tokenIn, tokenOut];
    const amounts = await routerContract.getAmountsOut(
      ethers.parseUnits(amountIn, 18),
      path
    );
    return Number(ethers.formatUnits(amounts[1], 6)); // Assuming 6 decimals for output
  } catch (error) {
    return null;
  }
}

async function verifyPair(symbolA, symbolB) {
  const tokenA = TOKENS[symbolA];
  const tokenB = TOKENS[symbolB];
  
  if (!tokenA || !tokenB) {
    return { valid: false, reason: 'Token not found' };
  }
  
  // Check QuickSwap
  const quickPrice = await checkPrice(QUICKSWAP_ROUTER, tokenA, tokenB);
  
  // Check SushiSwap
  const sushiPrice = await checkPrice(SUSHISWAP_ROUTER, tokenA, tokenB);
  
  if (!quickPrice && !sushiPrice) {
    return { valid: false, reason: 'No pools on either DEX', quickPrice, sushiPrice };
  }
  
  if (!quickPrice) {
    return { valid: false, reason: 'No QuickSwap pool', quickPrice, sushiPrice };
  }
  
  if (!sushiPrice) {
    return { valid: false, reason: 'No SushiSwap pool', quickPrice, sushiPrice };
  }
  
  // Check if prices are realistic (difference < 50%)
  const spread = Math.abs(quickPrice - sushiPrice) / Math.min(quickPrice, sushiPrice) * 100;
  
  if (spread > 50) {
    return { 
      valid: false, 
      reason: `Unrealistic spread: ${spread.toFixed(2)}%`,
      quickPrice, 
      sushiPrice,
      spread
    };
  }
  
  return { 
    valid: true, 
    quickPrice, 
    sushiPrice, 
    spread: spread.toFixed(4) + '%'
  };
}

async function main() {
  console.log('🔍 LIQUIDITY VERIFICATION FOR POLYGON ARBITRAGE\n');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const pairs = [
    // Top 15 (should work)
    ['WMATIC', 'USDC'],
    ['WETH', 'USDC'],
    ['WBTC', 'USDC'],
    ['WMATIC', 'WETH'],
    ['USDC', 'USDT'],
    ['WETH', 'USDT'],
    ['WBTC', 'WETH'],
    ['DAI', 'USDC'],
    ['WMATIC', 'USDT'],
    ['WMATIC', 'DAI'],
    ['LINK', 'USDC'],
    ['AAVE', 'USDC'],
    ['UNI', 'USDC'],
    ['POL', 'WMATIC'],
    ['CRV', 'USDC'],
    
    // Mid-tier (testing)
    ['LINK', 'WMATIC'],
    ['POL', 'USDC'],
    ['SAND', 'USDC'],
    ['SUSHI', 'WMATIC'],
    ['MANA', 'USDC'],
    ['MAI', 'USDC'],
    ['AAVE', 'WMATIC'],
    ['UNI', 'WMATIC'],
    ['QUICK', 'WMATIC'],
    ['GHST', 'USDC'],
  ];
  
  const validPairs = [];
  const invalidPairs = [];
  
  for (const [symbolA, symbolB] of pairs) {
    const pairName = `${symbolA}/${symbolB}`;
    process.stdout.write(`Checking ${pairName.padEnd(20)}... `);
    
    const result = await verifyPair(symbolA, symbolB);
    
    if (result.valid) {
      console.log(`✅ VALID | Quick: $${result.quickPrice?.toFixed(6)} | Sushi: $${result.sushiPrice?.toFixed(6)} | Spread: ${result.spread}`);
      validPairs.push({ pair: pairName, ...result });
    } else {
      console.log(`❌ ${result.reason}`);
      invalidPairs.push({ pair: pairName, ...result });
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`\n✅ VALID PAIRS FOR ARBITRAGE: ${validPairs.length}\n`);
  
  if (validPairs.length > 0) {
    validPairs.forEach(p => {
      console.log(`   ${p.pair.padEnd(20)} | Spread: ${p.spread.padEnd(10)} | Prices: $${p.quickPrice.toFixed(4)} / $${p.sushiPrice.toFixed(4)}`);
    });
  }
  
  console.log(`\n❌ INVALID PAIRS: ${invalidPairs.length}\n`);
  
  if (invalidPairs.length > 0) {
    invalidPairs.forEach(p => {
      console.log(`   ${p.pair.padEnd(20)} | ${p.reason}`);
    });
  }
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('\n💡 RECOMMENDATIONS:\n');
  
  if (validPairs.length === 0) {
    console.log('   ⚠️  NO VALID PAIRS FOUND!');
    console.log('   This likely means:');
    console.log('   1. RPC connection issues');
    console.log('   2. Token addresses are incorrect');
    console.log('   3. DEX routers have changed\n');
  } else if (validPairs.length < 5) {
    console.log(`   ⚠️  Only ${validPairs.length} valid pairs found.`);
    console.log('   Consider adding more DEXes (Dfyn, Curve, Balancer)');
    console.log('   Or use only top-tier pairs with proven liquidity\n');
  } else {
    console.log(`   ✅ Found ${validPairs.length} valid pairs!`);
    console.log('   Update src/config.ts to enable only these pairs.\n');
    console.log('   Recommended: Focus on top 10 with lowest spreads\n');
  }
  
  // Save results
  const fs = require('fs');
  fs.writeFileSync(
    'verified-pairs.json',
    JSON.stringify({ validPairs, invalidPairs }, null, 2)
  );
  console.log('💾 Results saved to: verified-pairs.json\n');
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
