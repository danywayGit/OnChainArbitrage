/**
 * Simple WebSocket Test - Just connect and keep alive
 */

require('dotenv').config();
const { WebSocketProvider } = require('ethers');

async function testWebSocket() {
  console.log('🔌 Testing Ankr WebSocket connection...\n');
  
  const wssUrl = 'wss://rpc.ankr.com/polygon/ws';
  console.log(`Connecting to: ${wssUrl}`);
  
  try {
    const provider = new WebSocketProvider(wssUrl);
    
    console.log('✅ WebSocket provider created');
    
    // Get block number to test if it works
    const blockNumber = await provider.getBlockNumber();
    console.log(`✅ Connected! Current block: ${blockNumber}`);
    
    // Keep alive for 10 seconds to test stability
    console.log('\n⏳ Keeping connection alive for 10 seconds...\n');
    
    let eventCount = 0;
    
    // Try to listen to newHeads (new blocks)
    provider.on('block', (blockNum) => {
      console.log(`📦 New block: ${blockNum}`);
      eventCount++;
    });
    
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log(`\n✅ Test complete! Received ${eventCount} block events`);
    console.log('✅ WebSocket is working!');
    
    await provider.destroy();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

testWebSocket();
