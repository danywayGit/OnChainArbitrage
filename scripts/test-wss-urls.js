/**
 * Test different WebSocket URLs
 */

require('dotenv').config();
const { WebSocketProvider } = require('ethers');

const URLs_TO_TEST = [
  // Ankr public
  'wss://rpc.ankr.com/polygon/ws',
  'wss://rpc.ankr.com/polygon',
  
  // Alchemy (need to replace https:// with wss://)
  process.env.POLYGON_RPC_URL?.replace('https://', 'wss://'),
  
  // Try adding /ws to Alchemy
  process.env.POLYGON_RPC_URL?.replace('https://', 'wss://') + '/ws',
];

async function testUrl(url) {
  if (!url || !url.startsWith('wss://')) {
    console.log(`⏭️  Skipping invalid URL: ${url}\n`);
    return false;
  }
  
  console.log(`🔌 Testing: ${url}`);
  
  try {
    const provider = new WebSocketProvider(url, undefined, { timeout: 5000 });
    
    const blockNumber = await Promise.race([
      provider.getBlockNumber(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
    ]);
    
    console.log(`✅ SUCCESS! Block: ${blockNumber}\n`);
    
    await provider.destroy();
    return true;
    
  } catch (error) {
    console.log(`❌ Failed: ${error.message}\n`);
    return false;
  }
}

async function testAll() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('         🧪 WEBSOCKET URL TESTER');
  console.log('═══════════════════════════════════════════════════════\n');
  
  let workingUrl = null;
  
  for (const url of URLs_TO_TEST) {
    const success = await testUrl(url);
    if (success && !workingUrl) {
      workingUrl = url;
    }
  }
  
  console.log('═══════════════════════════════════════════════════════');
  if (workingUrl) {
    console.log(`✅ WORKING URL FOUND: ${workingUrl}`);
  } else {
    console.log('❌ No working WebSocket URLs found!');
    console.log('\n💡 Suggestions:');
    console.log('1. Check if your network blocks WebSockets');
    console.log('2. Try from a different network');
    console.log('3. Contact Alchemy support to confirm WSS URL format');
  }
  console.log('═══════════════════════════════════════════════════════');
}

testAll();
