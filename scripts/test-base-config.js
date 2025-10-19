/**
 * 🧪 Base Configuration Test (HTTP-based)
 * 
 * Tests Base chain configuration and pool availability
 * Uses HTTP for reliability (Base has good Alchemy support)
 */

const { ethers } = require('ethers');
require('dotenv').config();

// Override NETWORK environment variable to Base
process.env.NETWORK = 'base';

const config = require('../dist/src/config').config;

// Uniswap V2 Pair ABI
const PAIR_ABI = [
  'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function token0() external view returns (address)',
  'function token1() external view returns (address)',
];

// Uniswap V2 Factory ABI
const FACTORY_ABI = [
  'function getPair(address tokenA, address tokenB) external view returns (address pair)',
];

// Base DEXes with factory addresses
const DEXES = [
  { 
    name: 'BaseSwap', 
    router: config.dexesBase.baseswap,
    factory: '0xFDa619b6d20975be80A10332cD39b9a4b0FAa8BB', // BaseSwap factory
    volume: '$40M+',
  },
  { 
    name: 'SushiSwap', 
    router: config.dexesBase.sushiswap,
    factory: '0x71524B4f93c58fcbF659783284E38825f0622859', // SushiSwap factory on Base
    volume: '$15M+',
  },
  { 
    name: 'SwapBased', 
    router: config.dexesBase.swapbased,
    factory: '0x04C9f118d21e8B767D2e50C946f0cC9F6C367300', // SwapBased factory
    volume: '$5M+',
  },
  { 
    name: 'Aerodrome', 
    router: config.dexesBase.aerodrome,
    factory: '0x420DD381b31aEf6683db6B902084cB0FFECe40Da', // Aerodrome factory
    volume: '$100M+',
  },
];

// Base Pairs from config
const PAIRS = config.monitoring.watchedPairsBase;

async function testBaseConfiguration() {
  console.log('\n✅ Base Configuration Test');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Setup HTTP provider
  const baseRpcUrl = config.network.rpcUrl;
  console.log(`📡 Connecting to Base via HTTP: ${baseRpcUrl}\n`);

  try {
    const provider = new ethers.JsonRpcProvider(baseRpcUrl);

    // Test connection
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    
    console.log('✅ Connected to Base!\n');
    console.log(`📊 Network Information:`);
    console.log(`   Chain ID: ${network.chainId} (Expected: 8453)`);
    console.log(`   Chain Name: ${network.name}`);
    console.log(`   Current Block: ${blockNumber}`);
    
    if (network.chainId !== 8453n) {
      console.error(`\n❌ Wrong chain! Expected Base (8453), got ${network.chainId}`);
      process.exit(1);
    }
    
    console.log('\n✅ Confirmed Base mainnet (Chain ID: 8453)');

    // Test token addresses
    console.log('\n\n📋 Base Token Configuration:');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    const tokenCount = Object.keys(config.tokensBase).length;
    console.log(`Total tokens configured: ${tokenCount}\n`);
    
    for (const [symbol, address] of Object.entries(config.tokensBase)) {
      console.log(`   ${symbol}: ${address}`);
    }

    // Test DEX configuration
    console.log('\n\n🏦 Base DEX Configuration:');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    console.log(`Total DEXes configured: ${DEXES.length}\n`);
    
    for (const dex of DEXES) {
      console.log(`✅ ${dex.name}`);
      console.log(`   Router: ${dex.router}`);
      console.log(`   Factory: ${dex.factory}`);
      console.log(`   Daily Volume: ${dex.volume}\n`);
    }

    // Test trading pairs
    console.log('\n📊 Base Trading Pairs:');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    const enabledPairs = PAIRS.filter(p => p.enabled);
    console.log(`Total pairs configured: ${PAIRS.length}`);
    console.log(`Enabled pairs: ${enabledPairs.length}\n`);
    
    console.log('Enabled Pairs:');
    enabledPairs.forEach((pair, i) => {
      console.log(`   ${i + 1}. ${pair.name}`);
    });

    // Test pool availability
    console.log('\n\n🔍 Testing Pool Availability (Sample):');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const poolsFound = {};
    let totalChecked = 0;
    let totalFound = 0;

    // Test first 5 pairs across all DEXes
    const samplePairs = enabledPairs.slice(0, Math.min(5, enabledPairs.length));
    
    for (const pair of samplePairs) {
      const token0Address = config.tokensBase[pair.token0];
      const token1Address = config.tokensBase[pair.token1];

      if (!token0Address || !token1Address) {
        console.warn(`⚠️  Skipping ${pair.name} - missing token addresses`);
        continue;
      }

      console.log(`\n📊 ${pair.name}:`);
      poolsFound[pair.name] = 0;

      for (const dex of DEXES) {
        try {
          const factory = new ethers.Contract(dex.factory, FACTORY_ABI, provider);
          const pairAddress = await factory.getPair(token0Address, token1Address);

          totalChecked++;

          if (pairAddress === ethers.ZeroAddress) {
            console.log(`   ❌ ${dex.name}: No pool`);
            continue;
          }

          // Verify pool has liquidity
          const pairContract = new ethers.Contract(pairAddress, PAIR_ABI, provider);
          const reserves = await pairContract.getReserves();

          if (reserves.reserve0 > 0n && reserves.reserve1 > 0n) {
            const reserve0Formatted = ethers.formatUnits(reserves.reserve0, 18);
            const reserve1Formatted = ethers.formatUnits(reserves.reserve1, 18);
            console.log(`   ✅ ${dex.name}: Found (Reserves: ${parseFloat(reserve0Formatted).toFixed(2)} / ${parseFloat(reserve1Formatted).toFixed(2)})`);
            poolsFound[pair.name]++;
            totalFound++;
          } else {
            console.log(`   ⚠️  ${dex.name}: Pool exists but no liquidity`);
          }
        } catch (error) {
          console.log(`   ❌ ${dex.name}: Error - ${error.message.slice(0, 50)}`);
        }
      }
    }

    // Summary
    console.log('\n\n📈 Summary:');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log(`✅ Configuration Valid: Base Chain ID 8453`);
    console.log(`✅ DEXes Configured: ${DEXES.length} (BaseSwap, SushiSwap, SwapBased, RocketSwap)`);
    console.log(`✅ Tokens Configured: ${tokenCount}`);
    console.log(`✅ Trading Pairs: ${enabledPairs.length} enabled`);
    console.log(`\n📊 Sample Pool Test (${samplePairs.length} pairs × ${DEXES.length} DEXes):`);
    console.log(`   Pools Checked: ${totalChecked}`);
    console.log(`   Pools Found: ${totalFound}`);
    
    if (totalChecked > 0) {
      console.log(`   Coverage: ${((totalFound / totalChecked) * 100).toFixed(1)}%`);
    }
    
    console.log('\n💡 Pool Distribution:');
    for (const [pairName, count] of Object.entries(poolsFound)) {
      console.log(`   ${pairName}: ${count}/${DEXES.length} DEXes`);
    }

    // Estimate total pools
    if (totalChecked > 0) {
      const estimatedTotal = Math.round((totalFound / totalChecked) * enabledPairs.length * DEXES.length);
      console.log(`\n🎯 Estimated Total Pools: ${estimatedTotal} (${enabledPairs.length} pairs × ${DEXES.length} DEXes × ${((totalFound / totalChecked) * 100).toFixed(0)}% coverage)`);
    }
    
    console.log(`\n✅ Base Configuration Test Complete!`);
    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run test
testBaseConfiguration().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
