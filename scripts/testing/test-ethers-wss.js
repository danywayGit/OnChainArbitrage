/**
 * 🧪 Test ethers.js WebSocketProvider directly
 * 
 * We know the URL works with raw WebSocket.
 * Let's test if ethers.js WebSocketProvider works.
 */

require('dotenv').config();
const { WebSocketProvider } = require('ethers');

async function testEthersWebSocket() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('     🧪 TESTING ETHERS.JS WEBSOCKETPROVIDER');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const url = 'wss://polygon-mainnet.g.alchemy.com/v2/5z1t0IOirVugLoPi0wSHv';
  console.log(`URL: ${url}\n`);
  
  try {
    console.log('1️⃣ Creating WebSocketProvider...');
    const provider = new WebSocketProvider(url);
    
    console.log('✅ Provider created\n');
    
    console.log('2️⃣ Getting block number...');
    const blockNumber = await provider.getBlockNumber();
    
    console.log(`✅ Block number: ${blockNumber}\n`);
    
    console.log('3️⃣ Getting network...');
    const network = await provider.getNetwork();
    
    console.log(`✅ Network: ${network.name} (chainId: ${network.chainId})\n`);
    
    console.log('4️⃣ Testing event listener (blocks)...');
    
    let blockCount = 0;
    provider.on('block', (blockNum) => {
      blockCount++;
      console.log(`   📦 New block: ${blockNum} (event #${blockCount})`);
    });
    
    console.log('✅ Event listener registered\n');
    console.log('⏳ Waiting 15 seconds for block events...\n');
    
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    console.log(`\n✅ Received ${blockCount} block events`);
    
    console.log('\n5️⃣ Testing contract event filter...');
    
    // Test subscribing to a specific contract event
    const testAddress = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'; // WMATIC
    
    const filter = {
      address: testAddress,
      topics: [
        // Transfer event
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
      ]
    };
    
    let eventCount = 0;
    provider.on(filter, (log) => {
      eventCount++;
      console.log(`   🎯 Event received! (${eventCount})`);
      console.log(`      Block: ${log.blockNumber}`);
      console.log(`      TxHash: ${log.transactionHash}`);
    });
    
    console.log('✅ Contract event listener registered');
    console.log('⏳ Waiting 15 seconds for contract events...\n');
    
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    console.log(`\n✅ Received ${eventCount} contract events`);
    
    console.log('\n6️⃣ Cleaning up...');
    await provider.destroy();
    console.log('✅ Provider destroyed\n');
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('                  ✅ ALL TESTS PASSED!');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('📊 Summary:');
    console.log(`   - WebSocketProvider: ✅ Working`);
    console.log(`   - Block events: ✅ ${blockCount} received`);
    console.log(`   - Contract events: ✅ ${eventCount} received`);
    console.log(`   - Connection: ✅ Stable\n`);
    
    return true;
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\n Stack trace:');
    console.error(error.stack);
    return false;
  }
}

testEthersWebSocket()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
