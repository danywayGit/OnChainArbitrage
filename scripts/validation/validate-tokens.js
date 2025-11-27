/**
 * Validate Token Configuration
 * 
 * This script validates all token addresses in config.ts
 * to ensure they are correct Polygon mainnet addresses.
 * 
 * Checks:
 * - Valid Ethereum address format
 * - No duplicate addresses
 * - Warns about potentially incorrect addresses
 * 
 * Usage:
 *   node scripts/validate-tokens.js
 */

const fs = require('fs');
const path = require('path');

// Read config.ts
const configPath = path.join(__dirname, '..', 'src', 'config.ts');
const configContent = fs.readFileSync(configPath, 'utf8');

// Extract tokens section
const tokensMatch = configContent.match(/tokens:\s*{([^}]+)}/s);
if (!tokensMatch) {
  console.error('❌ Could not find tokens section in config.ts');
  process.exit(1);
}

const tokensSection = tokensMatch[1];

// Parse tokens
const tokenRegex = /(\w+):\s*['"]0x([a-fA-F0-9]{40})['"]/g;
const tokens = [];
const addresses = new Set();
const duplicates = [];
let match;

while ((match = tokenRegex.exec(tokensSection)) !== null) {
  const symbol = match[1];
  const address = '0x' + match[2];
  
  if (addresses.has(address.toLowerCase())) {
    duplicates.push({ symbol, address });
  } else {
    addresses.add(address.toLowerCase());
  }
  
  tokens.push({ symbol, address });
}

console.log('\n🔍 Token Configuration Validation\n');
console.log(`📊 Found ${tokens.length} tokens in config.ts\n`);

// Check for duplicates
if (duplicates.length > 0) {
  console.error('❌ DUPLICATE ADDRESSES FOUND:\n');
  for (const dup of duplicates) {
    console.error(`   ${dup.symbol}: ${dup.address}`);
  }
  console.error('');
} else {
  console.log('✅ No duplicate addresses found\n');
}

// Validate address format
let invalidCount = 0;
for (const token of tokens) {
  if (!/^0x[a-fA-F0-9]{40}$/.test(token.address)) {
    console.error(`❌ Invalid address format: ${token.symbol} - ${token.address}`);
    invalidCount++;
  }
}

if (invalidCount === 0) {
  console.log('✅ All addresses have valid format\n');
} else {
  console.error(`\n❌ Found ${invalidCount} invalid addresses\n`);
}

// Known Polygon addresses (for validation)
const knownAddresses = {
  'WMATIC': '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
  'WETH': '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
  'USDC': '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
  'USDT': '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
  'DAI': '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
  'WBTC': '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
  'LINK': '0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39',
  'AAVE': '0xd6df932a45c0f255f85145f286ea0b292b21c90b',
};

// Verify known addresses
console.log('🔍 Verifying known token addresses:\n');
let mismatchCount = 0;
for (const [symbol, expectedAddress] of Object.entries(knownAddresses)) {
  const token = tokens.find(t => t.symbol === symbol);
  if (token) {
    if (token.address.toLowerCase() === expectedAddress.toLowerCase()) {
      console.log(`   ✅ ${symbol}: ${token.address}`);
    } else {
      console.error(`   ❌ ${symbol}: ${token.address}`);
      console.error(`      Expected: ${expectedAddress}`);
      mismatchCount++;
    }
  } else {
    console.warn(`   ⚠️  ${symbol}: Not found in config`);
  }
}

if (mismatchCount > 0) {
  console.error(`\n❌ Found ${mismatchCount} address mismatches\n`);
} else {
  console.log('\n✅ All known addresses are correct\n');
}

// Summary
console.log('━'.repeat(80));
console.log('\n📋 Summary:\n');
console.log(`   Total tokens: ${tokens.length}`);
console.log(`   Unique addresses: ${addresses.size}`);
console.log(`   Duplicates: ${duplicates.length}`);
console.log(`   Invalid format: ${invalidCount}`);
console.log(`   Address mismatches: ${mismatchCount}`);

if (duplicates.length === 0 && invalidCount === 0 && mismatchCount === 0) {
  console.log('\n✅ All validation checks passed! Configuration is ready to use.\n');
  process.exit(0);
} else {
  console.log('\n❌ Validation failed! Please fix the issues above.\n');
  process.exit(1);
}
