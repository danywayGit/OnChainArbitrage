/**
 * Verify which trading pairs have REAL liquidity on multiple DEXes
 * This prevents querying fake pools that return garbage data
 */

const { ethers } = require('ethers');
require('dotenv').config();

// Polygon RPC
const RPC_URL = process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com';
console.log('🔗 Using RPC:', RPC_URL);

const provider = new ethers.JsonRpcProvider(RPC_URL, {
  name: 'polygon',
  chainId: 137
});

// Low-fee DEX routers on Polygon
const DEXES = {
  quickswap: {
    name: 'QuickSwap',
    router: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
    fee: '0.3%',
    type: 'UniswapV2'
  },
  sushiswap: {
    name: 'SushiSwap',
    router: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
    fee: '0.3%',
    type: 'UniswapV2'
  },
  uniswapv3: {
    name: 'Uniswap V3',
    router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    quoter: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
    fee: '0.05%/0.3%/1%',
    type: 'UniswapV3'
  },
  dfyn: {
    name: 'Dfyn',
    router: '0xA102072A4C07F06EC3B4900FDC4C7B80b6c57429',
    fee: '0.3%',
    type: 'UniswapV2'
  },
  // Curve has custom pools, handle separately
};

// Token addresses on Polygon
const TOKENS = {
  // Major tokens (top 15)
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
  
  // Mid-tier tokens
  POL: '0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6', // New Polygon token
  SAND: '0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683',
  MANA: '0xA1c57f48F0Deb89f569dFbE6E2B7f46D33606fD4',
  SUSHI: '0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a',
  QUICK: '0xB5C064F955D8e7F38fE0460C556a72987494eE17',
  GHST: '0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7',
  MAI: '0xa3Fa99A148fA48D14Ed51d610c367C61876997F1',
  BAL: '0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3',
};

// UniswapV2 Router ABI (minimal)
const ROUTER_ABI = [
  'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
  'function factory() external view returns (address)'
];

// UniswapV2 Factory ABI (minimal)
const FACTORY_ABI = [
  'function getPair(address tokenA, address tokenB) external view returns (address pair)'
];

// Pair ABI (minimal)
const PAIR_ABI = [
  'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function token0() external view returns (address)',
  'function token1() external view returns (address)'
];

// Uniswap V3 Quoter ABI (minimal)
const QUOTER_V3_ABI = [
  'function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)'
];

/**
 * Check if a pair exists and has liquidity on a UniswapV2-style DEX
 */
async function checkV2Pair(dexKey, tokenA, tokenB, tokenASymbol, tokenBSymbol) {
  try {
    const dex = DEXES[dexKey];
    const router = new ethers.Contract(dex.router, ROUTER_ABI, provider);
    
    // Get factory address
    const factoryAddress = await router.factory();
    const factory = new ethers.Contract(factoryAddress, FACTORY_ABI, provider);
    
    // Get pair address
    const pairAddress = await factory.getPair(tokenA, tokenB);
    
    // Check if pair exists
    if (pairAddress === ethers.ZeroAddress) {
      return { exists: false, liquidity: 0, price: 0 };
    }
    
    // Get reserves
    const pair = new ethers.Contract(pairAddress, PAIR_ABI, provider);
    const [reserve0, reserve1] = await pair.getReserves();
    const token0 = await pair.token0();
    
    // Determine which reserve corresponds to which token
    const [reserveA, reserveB] = token0.toLowerCase() === tokenA.toLowerCase() 
      ? [reserve0, reserve1] 
      : [reserve1, reserve0];
    
    // Calculate liquidity in USD (rough estimate using USDC/USDT value)
    const liquidityA = Number(ethers.formatUnits(reserveA, 18)); // Approximation
    const liquidityB = Number(ethers.formatUnits(reserveB, 6)); // For stablecoins
    
    // Try to get price quote (1 token)
    try {
      const amountIn = ethers.parseUnits('1', 18);
      const path = [tokenA, tokenB];
      const amounts = await router.getAmountsOut(amountIn, path);
      const price = Number(ethers.formatUnits(amounts[1], 6)); // Assuming output is 6 decimals
      
      return {
        exists: true,
        pairAddress,
        reserveA: liquidityA,
        reserveB: liquidityB,
        totalLiquidity: liquidityA + liquidityB,
        price
      };
    } catch (error) {
      return {
        exists: true,
        pairAddress,
        reserveA: liquidityA,
        reserveB: liquidityB,
        totalLiquidity: liquidityA + liquidityB,
        price: 0,
        error: 'Price query failed'
      };
    }
  } catch (error) {
    return { exists: false, liquidity: 0, price: 0, error: error.message };
  }
}

/**
 * Main verification function
 */
async function verifyAllPairs() {
  console.log('🔍 POLYGON DEX LIQUIDITY VERIFICATION');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  // Test pairs (top volume + mid-tier)
  const testPairs = [
    // Top 15 (should exist)
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
    
    // Mid-tier (might not exist on all DEXes)
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
    ['CRV', 'WMATIC'],
    ['BAL', 'WMATIC'],
    ['SAND', 'WMATIC'],
    ['MANA', 'WMATIC'],
    ['MAI', 'WMATIC'],
  ];
  
  const results = [];
  
  for (const [symbolA, symbolB] of testPairs) {
    const tokenA = TOKENS[symbolA];
    const tokenB = TOKENS[symbolB];
    const pairName = `${symbolA}/${symbolB}`;
    
    console.log(`\n📊 Checking ${pairName}...`);
    
    const pairResult = {
      pair: pairName,
      dexes: {}
    };
    
    // Check QuickSwap
    console.log('   QuickSwap: ', { end: '' });
    const quickResult = await checkV2Pair('quickswap', tokenA, tokenB, symbolA, symbolB);
    pairResult.dexes.quickswap = quickResult;
    if (quickResult.exists) {
      console.log(`✅ Liquidity: $${quickResult.totalLiquidity.toFixed(0)}`);
    } else {
      console.log('❌ No pool');
    }
    
    // Check SushiSwap
    console.log('   SushiSwap: ', { end: '' });
    const sushiResult = await checkV2Pair('sushiswap', tokenA, tokenB, symbolA, symbolB);
    pairResult.dexes.sushiswap = sushiResult;
    if (sushiResult.exists) {
      console.log(`✅ Liquidity: $${sushiResult.totalLiquidity.toFixed(0)}`);
    } else {
      console.log('❌ No pool');
    }
    
    // Check Dfyn
    console.log('   Dfyn:      ', { end: '' });
    const dfynResult = await checkV2Pair('dfyn', tokenA, tokenB, symbolA, symbolB);
    pairResult.dexes.dfyn = dfynResult;
    if (dfynResult.exists) {
      console.log(`✅ Liquidity: $${dfynResult.totalLiquidity.toFixed(0)}`);
    } else {
      console.log('❌ No pool');
    }
    
    // Count how many DEXes have this pair
    const dexCount = Object.values(pairResult.dexes).filter(d => d.exists).length;
    pairResult.dexCount = dexCount;
    
    if (dexCount >= 2) {
      console.log(`   ✅ VALID FOR ARBITRAGE (${dexCount} DEXes)`);
    } else {
      console.log(`   ⚠️  INSUFFICIENT (only ${dexCount} DEX)`);
    }
    
    results.push(pairResult);
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('📈 SUMMARY - PAIRS VALID FOR ARBITRAGE (2+ DEXes)');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const validPairs = results.filter(r => r.dexCount >= 2);
  const invalidPairs = results.filter(r => r.dexCount < 2);
  
  console.log(`✅ Valid Pairs (${validPairs.length}):\n`);
  validPairs.forEach(p => {
    const dexList = Object.entries(p.dexes)
      .filter(([_, data]) => data.exists)
      .map(([name, _]) => name)
      .join(', ');
    console.log(`   ${p.pair.padEnd(20)} | DEXes: ${dexList}`);
  });
  
  console.log(`\n❌ Invalid Pairs (${invalidPairs.length}):\n`);
  invalidPairs.forEach(p => {
    const dexList = Object.entries(p.dexes)
      .filter(([_, data]) => data.exists)
      .map(([name, _]) => name)
      .join(', ');
    console.log(`   ${p.pair.padEnd(20)} | Only on: ${dexList || 'none'}`);
  });
  
  // Generate config recommendations
  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('⚙️  RECOMMENDED CONFIG UPDATES');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log('Add these DEXes to src/config.ts:\n');
  console.log('export const DEX_CONFIGS = {');
  console.log('  quickswap: {');
  console.log('    name: "QuickSwap",');
  console.log('    router: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",');
  console.log('    fee: 0.003 // 0.3%');
  console.log('  },');
  console.log('  sushiswap: {');
  console.log('    name: "SushiSwap",');
  console.log('    router: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",');
  console.log('    fee: 0.003 // 0.3%');
  console.log('  },');
  console.log('  dfyn: {');
  console.log('    name: "Dfyn",');
  console.log('    router: "0xA102072A4C07F06EC3B4900FDC4C7B80b6c57429",');
  console.log('    fee: 0.003 // 0.3%');
  console.log('  }');
  console.log('};\n');
  
  console.log(`Enable these ${validPairs.length} pairs in src/config.ts:\n`);
  validPairs.slice(0, 15).forEach(p => {
    const [base, quote] = p.pair.split('/');
    console.log(`  '${p.pair}': { enabled: true, baseToken: '${base}', quoteToken: '${quote}' },`);
  });
  
  console.log('\n═══════════════════════════════════════════════════════════\n');
  
  // Save results to JSON
  const fs = require('fs');
  fs.writeFileSync(
    'liquidity-verification-results.json',
    JSON.stringify(results, null, 2)
  );
  console.log('💾 Full results saved to: liquidity-verification-results.json\n');
}

// Run verification
verifyAllPairs().catch(console.error);
