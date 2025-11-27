/**
 * 🧪 BSC WebSocket Event Monitor Test
 * 
 * Tests BSC chain with PancakeSwap V2, ApeSwap, BiSwap, BakerySwap, and MDEX
 * Expected: 100+ pool subscriptions across 5 DEXes and 20 BSC pairs
 */

const { ethers } = require('ethers');
require('dotenv').config();

// Override NETWORK environment variable to BSC
process.env.NETWORK = 'bsc';

const config = require('../dist/src/config').config;
const logger = require('../dist/src/logger').default;

// Uniswap V2 Pair ABI
const PAIR_ABI = [
  'event Sync(uint112 reserve0, uint112 reserve1)',
  'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function token0() external view returns (address)',
  'function token1() external view returns (address)',
  'function factory() external view returns (address)',
];

// Uniswap V2 Factory ABI
const FACTORY_ABI = [
  'function getPair(address tokenA, address tokenB) external view returns (address pair)',
];

// BSC DEXes
const DEXES = [
  { 
    name: 'PancakeSwap', 
    router: config.dexesBSC.pancakeswap,
    factory: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
  },
  { 
    name: 'ApeSwap', 
    router: config.dexesBSC.apeswap,
    factory: '0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6',
  },
  { 
    name: 'BiSwap', 
    router: config.dexesBSC.biswap,
    factory: '0x858E3312ed3A876947EA49d572A7C42DE08af7EE',
  },
  { 
    name: 'BakerySwap', 
    router: config.dexesBSC.bakeryswap,
    factory: '0x01bF7C66c6BD861915CdaaE475042d3c4BaE16A7',
  },
  { 
    name: 'MDEX', 
    router: config.dexesBSC.mdex,
    factory: '0x3CD1C46068dAEa5Ebb0d3f55F6915B10648062B8',
  },
];

// BSC Pairs from config
const PAIRS = config.monitoring.watchedPairsBSC;

async function testBSCWebSocket() {
  console.log('\n🧪 BSC WebSocket Event Monitor Test');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Setup WebSocket provider
  const bscWssUrl = process.env.BSC_WSS_URL || 'wss://bsc-ws-node.nariox.org:443';
  console.log(`📡 Connecting to BSC WebSocket: ${bscWssUrl}\n`);

  let wssProvider;
  let httpProvider;

  try {
    wssProvider = new ethers.WebSocketProvider(bscWssUrl);
    httpProvider = new ethers.JsonRpcProvider(config.network.rpcUrl);

    // Wait for connection
    await wssProvider.getNetwork();
    console.log('✅ WebSocket connected to BSC!\n');
    
    // Verify chain ID
    const chainId = (await wssProvider.getNetwork()).chainId;
    console.log(`Chain ID: ${chainId} (Expected: 56)`);
    
    if (chainId !== 56n) {
      console.error(`❌ Wrong chain! Expected BSC (56), got ${chainId}`);
      process.exit(1);
    }
    
    console.log('✅ Confirmed BSC mainnet (Chain ID: 56)\n');

    // Get pair addresses for all DEXes
    console.log('🔍 Finding pool addresses...');
    console.log(`Total pairs to check: ${PAIRS.length}`);
    console.log(`Total DEXes: ${DEXES.length}\n`);

    const poolData = [];
    let totalPools = 0;
    let successfulPools = 0;

    for (const pair of PAIRS) {
      if (!pair.enabled) continue;

      const token0Address = config.tokensBSC[pair.token0];
      const token1Address = config.tokensBSC[pair.token1];

      if (!token0Address || !token1Address) {
        console.warn(`⚠️  Missing token addresses for ${pair.name}`);
        continue;
      }

      console.log(`\n📊 ${pair.name}:`);
      console.log(`   ${pair.token0}: ${token0Address}`);
      console.log(`   ${pair.token1}: ${token1Address}`);

      for (const dex of DEXES) {
        try {
          const factory = new ethers.Contract(dex.factory, FACTORY_ABI, httpProvider);
          const pairAddress = await factory.getPair(token0Address, token1Address);

          totalPools++;

          if (pairAddress === ethers.ZeroAddress) {
            console.log(`   ❌ ${dex.name}: No pool`);
            continue;
          }

          // Verify pool has liquidity
          const pairContract = new ethers.Contract(pairAddress, PAIR_ABI, httpProvider);
          const reserves = await pairContract.getReserves();

          if (reserves.reserve0 > 0n && reserves.reserve1 > 0n) {
            console.log(`   ✅ ${dex.name}: ${pairAddress.slice(0, 10)}... (Reserves: ${ethers.formatUnits(reserves.reserve0, 18).slice(0, 8)} / ${ethers.formatUnits(reserves.reserve1, 18).slice(0, 8)})`);
            poolData.push({
              pair: pair.name,
              dex: dex.name,
              address: pairAddress,
              token0Address,
              token1Address,
            });
            successfulPools++;
          } else {
            console.log(`   ⚠️  ${dex.name}: Pool exists but no liquidity`);
          }
        } catch (error) {
          console.log(`   ❌ ${dex.name}: Error - ${error.message.slice(0, 50)}`);
        }
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(`\n✅ Found ${successfulPools} pools with liquidity out of ${totalPools} checked`);
    console.log(`📈 Pool coverage: ${((successfulPools / totalPools) * 100).toFixed(1)}%\n`);

    // Subscribe to Sync events for all pools
    console.log('🎧 Subscribing to Sync events...\n');

    let subscriptionCount = 0;
    const opportunitiesDetected = [];

    for (const pool of poolData) {
      try {
        const pairContract = new ethers.Contract(pool.address, PAIR_ABI, wssProvider);
        
        pairContract.on('Sync', (reserve0, reserve1, event) => {
          const price = Number(reserve1) / Number(reserve0);
          console.log(`\n💰 Price Update Detected!`);
          console.log(`   Pair: ${pool.pair}`);
          console.log(`   DEX: ${pool.dex}`);
          console.log(`   Pool: ${pool.address.slice(0, 10)}...`);
          console.log(`   Reserve0: ${ethers.formatUnits(reserve0, 18).slice(0, 10)}`);
          console.log(`   Reserve1: ${ethers.formatUnits(reserve1, 18).slice(0, 10)}`);
          console.log(`   Price: ${price.toFixed(8)}`);
          console.log(`   Block: ${event.log.blockNumber}`);
          console.log(`   Time: ${new Date().toLocaleTimeString()}`);

          // Check for arbitrage opportunity (simplified)
          opportunitiesDetected.push({
            pair: pool.pair,
            dex: pool.dex,
            price,
            time: new Date(),
          });
        });

        subscriptionCount++;
        console.log(`✅ Subscribed to ${pool.dex} - ${pool.pair} (${subscriptionCount}/${poolData.length})`);
      } catch (error) {
        console.error(`❌ Failed to subscribe to ${pool.dex} - ${pool.pair}:`, error.message);
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(`\n✅ Subscribed to ${subscriptionCount} pools!`);
    console.log('\n🎧 Listening for price updates...');
    console.log('   (Events will appear above as they happen)');
    console.log('\n💡 Press Ctrl+C to stop\n');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Report stats every 30 seconds
    let eventCount = 0;
    setInterval(() => {
      console.log('\n📊 Status Update:');
      console.log(`   Subscriptions: ${subscriptionCount} pools`);
      console.log(`   Events detected: ${eventCount}`);
      console.log(`   Opportunities: ${opportunitiesDetected.length}`);
      console.log(`   Runtime: ${Math.floor(process.uptime())} seconds\n`);
    }, 30000);

    // Keep alive
    wssProvider.on('error', (error) => {
      console.error('\n❌ WebSocket error:', error.message);
    });

    wssProvider.on('close', () => {
      console.log('\n⚠️  WebSocket connection closed');
      process.exit(0);
    });

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    if (wssProvider) {
      wssProvider.destroy();
    }
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Test stopped by user');
  process.exit(0);
});

// Run test
testBSCWebSocket().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
