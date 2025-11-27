/**
 * 🔬 Advanced WebSocket URL Testing
 * 
 * Testing different URL formats based on common provider patterns
 */

require('dotenv').config();
const WebSocket = require('ws');

const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY || '5z1t0IOirVugLoPi0wSHv';

// Different URL formats to test
const TEST_URLS = [
  // === ALCHEMY FORMATS ===
  {
    name: 'Alchemy - Standard Format',
    url: `wss://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    provider: 'alchemy'
  },
  {
    name: 'Alchemy - With /ws Suffix',
    url: `wss://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}/ws`,
    provider: 'alchemy'
  },
  {
    name: 'Alchemy - ws Subdomain',
    url: `wss://polygon-mainnet.ws.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    provider: 'alchemy'
  },
  {
    name: 'Alchemy - Without g subdomain',
    url: `wss://polygon-mainnet.alchemy.com/v2/${ALCHEMY_KEY}`,
    provider: 'alchemy'
  },
  
  // === ANKR FORMATS ===
  {
    name: 'Ankr - Standard Format',
    url: 'wss://rpc.ankr.com/polygon/ws',
    provider: 'ankr'
  },
  {
    name: 'Ankr - Without /ws',
    url: 'wss://rpc.ankr.com/polygon',
    provider: 'ankr'
  },
  {
    name: 'Ankr - ws Subdomain',
    url: 'wss://ws.rpc.ankr.com/polygon',
    provider: 'ankr'
  },
  
  // === OTHER PROVIDERS ===
  {
    name: 'Blast API - Public Polygon',
    url: 'wss://polygon-mainnet.public.blastapi.io',
    provider: 'blast'
  },
  {
    name: 'Polygon Official',
    url: 'wss://rpc-mainnet.matic.network',
    provider: 'polygon'
  },
  {
    name: 'Polygon Official Alt',
    url: 'wss://ws-mainnet.matic.network',
    provider: 'polygon'
  },
  {
    name: 'OnFinality Public',
    url: 'wss://polygon.api.onfinality.io/public-ws',
    provider: 'onfinality'
  },
];

function testWebSocketConnection(url, name, provider) {
  return new Promise((resolve) => {
    console.log(`\n🔌 Testing: ${name}`);
    console.log(`   URL: ${url}`);
    
    const timeout = setTimeout(() => {
      ws.close();
      resolve({ name, url, provider, success: false, error: 'Timeout (10s)' });
    }, 10000);
    
    const ws = new WebSocket(url);
    
    ws.on('open', () => {
      console.log('   ✅ CONNECTION OPENED!');
      
      // Try to send a JSON-RPC request
      const request = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_blockNumber',
        params: []
      });
      
      console.log('   📤 Sending eth_blockNumber request...');
      ws.send(request);
    });
    
    ws.on('message', (data) => {
      console.log('   ✅ RECEIVED RESPONSE!');
      try {
        const response = JSON.parse(data.toString());
        console.log('   📦 Block:', parseInt(response.result, 16));
        clearTimeout(timeout);
        ws.close();
        resolve({ name, url, provider, success: true, error: null, response });
      } catch (e) {
        console.log('   ⚠️  Response:', data.toString().substring(0, 100));
        clearTimeout(timeout);
        ws.close();
        resolve({ name, url, provider, success: true, error: 'Unexpected response format', response: data.toString() });
      }
    });
    
    ws.on('error', (error) => {
      console.log(`   ❌ ERROR: ${error.message}`);
      clearTimeout(timeout);
      resolve({ name, url, provider, success: false, error: error.message });
    });
    
    ws.on('close', (code, reason) => {
      console.log(`   🔌 Connection closed: ${code} ${reason || ''}`);
      clearTimeout(timeout);
    });
  });
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('         🔬 COMPREHENSIVE WEBSOCKET URL TESTING');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\nTesting ${TEST_URLS.length} different WebSocket URL formats...\n`);
  
  const results = [];
  
  // Test each URL sequentially (to avoid overwhelming connections)
  for (const test of TEST_URLS) {
    const result = await testWebSocketConnection(test.url, test.name, test.provider);
    results.push(result);
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                        📊 RESULTS SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  if (successful.length > 0) {
    console.log('✅ WORKING URLS:\n');
    successful.forEach(r => {
      console.log(`   ✓ ${r.name}`);
      console.log(`     URL: ${r.url}`);
      console.log(`     Provider: ${r.provider}\n`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ FAILED URLS:\n');
    
    // Group by error type
    const errorGroups = {};
    failed.forEach(r => {
      const errorKey = r.error || 'Unknown';
      if (!errorGroups[errorKey]) errorGroups[errorKey] = [];
      errorGroups[errorKey].push(r);
    });
    
    Object.entries(errorGroups).forEach(([error, urls]) => {
      console.log(`   Error: ${error}`);
      urls.forEach(r => console.log(`      - ${r.name}`));
      console.log('');
    });
  }
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Total: ${results.length} | Success: ${successful.length} | Failed: ${failed.length}`);
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  // Save working URL to .env suggestion
  if (successful.length > 0) {
    console.log('💡 RECOMMENDATION:\n');
    console.log('Add this to your .env file:\n');
    const best = successful.find(r => r.provider === 'alchemy') || successful[0];
    console.log(`WEBSOCKET_RPC_URL=${best.url}\n`);
  } else {
    console.log('⚠️  NO WORKING WEBSOCKET URLS FOUND!\n');
    console.log('Possible reasons:');
    console.log('1. Alchemy free tier may not support WebSocket');
    console.log('2. Need to enable WebSocket in Alchemy dashboard');
    console.log('3. Public endpoints may have been deprecated');
    console.log('4. May need to use paid provider (Infura, QuickNode, etc.)\n');
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});

runTests().catch(console.error);
