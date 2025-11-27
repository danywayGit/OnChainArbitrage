const https = require('https');

// Test Uniswap V3 API with WMATIC/USDC pair
const query = JSON.stringify({
  query: `{
    pools(
      first: 5
      where: {
        token0: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"
        token1: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"
      }
      orderBy: totalValueLockedUSD
      orderDirection: desc
    ) {
      id
      feeTier
      totalValueLockedUSD
      volumeUSD
      token0 { symbol }
      token1 { symbol }
    }
  }`
});

const options = {
  hostname: 'gateway.thegraph.com',
  path: '/api/5133a139a00ce6b3d5e92fb4c8ac3da4/subgraphs/id/3hCPRGf4z88VC5rsBKU5AA9FBBq5nF3jbKJG7VZCbhjm',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': query.length
  }
};

console.log('Testing Uniswap V3 API for WMATIC/USDC...\n');

const req = https.request(options, (res) => {
  let data = '';
  
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}\n`);
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('Response:');
      console.log(JSON.stringify(result, null, 2));
      
      if (result.errors) {
        console.log('\n❌ ERRORS FOUND:');
        result.errors.forEach(err => {
          console.log(`  - ${err.message}`);
        });
      }
      
      if (result.data?.pools) {
        console.log(`\n✅ Found ${result.data.pools.length} pools`);
        result.data.pools.forEach(pool => {
          console.log(`  - Pool: ${pool.id}`);
          console.log(`    Fee: ${pool.feeTier / 10000}%`);
          console.log(`    TVL: $${parseFloat(pool.totalValueLockedUSD).toLocaleString()}`);
          console.log(`    Volume: $${parseFloat(pool.volumeUSD).toLocaleString()}`);
        });
      }
    } catch (error) {
      console.log('\n❌ Failed to parse JSON response:');
      console.log(error.message);
      console.log('\nRaw response:');
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.log('\n❌ Request error:');
  console.log(error.message);
});

req.write(query);
req.end();
