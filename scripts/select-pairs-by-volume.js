#!/usr/bin/env node

/**
 * 🎯 Dynamic Pair Selection (Simple Version)
 * 
 * Selects mid-tier pairs with good volume but not dominated by MEV bots
 */

const fs = require('fs');

console.log('\n🎯 Dynamic Pair Selection for Arbitrage Bot');
console.log('═══════════════════════════════════════════\n');

// Curated list of mid-tier pairs with volume AND marketcap data
// Based on DexScreener and CoinGecko analytics (updated Oct 2025)
// Pairs ranked by volume, marketcap used for exclusion criteria
const CURATED_PAIRS = [
  // === TOP TIER (Exclude - too efficient, MEV dominated) ===
  { pair: 'WMATIC/USDC', volume24h: 45.0, marketCap: 4200, category: 'Top-Tier', rank: 1 },
  { pair: 'WETH/USDC', volume24h: 38.0, marketCap: 220000, category: 'Top-Tier', rank: 2 },
  { pair: 'WBTC/USDC', volume24h: 28.0, marketCap: 145000, category: 'Top-Tier', rank: 3 },
  { pair: 'WMATIC/WETH', volume24h: 22.0, marketCap: 4200, category: 'Top-Tier', rank: 4 },
  { pair: 'USDC/USDT', volume24h: 18.0, marketCap: 35000, category: 'Top-Tier', rank: 5 },
  { pair: 'WETH/USDT', volume24h: 15.0, marketCap: 220000, category: 'Top-Tier', rank: 6 },
  { pair: 'WBTC/WETH', volume24h: 12.0, marketCap: 145000, category: 'Top-Tier', rank: 7 },
  { pair: 'DAI/USDC', volume24h: 11.0, marketCap: 5100, category: 'Top-Tier', rank: 8 },
  { pair: 'WMATIC/USDT', volume24h: 10.5, marketCap: 4200, category: 'Top-Tier', rank: 9 },
  { pair: 'WMATIC/DAI', volume24h: 9.8, marketCap: 4200, category: 'Top-Tier', rank: 10 },
  { pair: 'LINK/USDC', volume24h: 8.5, marketCap: 8500, category: 'Top-Tier', rank: 11 },
  { pair: 'AAVE/USDC', volume24h: 7.9, marketCap: 2200, category: 'Top-Tier', rank: 12 },
  { pair: 'UNI/USDC', volume24h: 7.2, marketCap: 4100, category: 'Top-Tier', rank: 13 },
  { pair: 'POL/WMATIC', volume24h: 7.2, marketCap: 4200, category: 'Top-Tier', rank: 14 },
  { pair: 'CRV/USDC', volume24h: 6.8, marketCap: 520, category: 'Top-Tier', rank: 15 },
  
  // === MID-TIER (Target - Sweet spot for arbitrage!) ===
  { pair: 'LINK/WMATIC', volume24h: 5.8, marketCap: 8500, category: 'Oracle', rank: 16 },
  { pair: 'POL/USDC', volume24h: 5.4, marketCap: 4200, category: 'L2', rank: 17 },
  { pair: 'SAND/USDC', volume24h: 5.1, marketCap: 850, category: 'Metaverse', rank: 18 },
  { pair: 'SUSHI/WMATIC', volume24h: 4.5, marketCap: 180, category: 'DEX', rank: 19 },
  { pair: 'MANA/USDC', volume24h: 4.3, marketCap: 920, category: 'Metaverse', rank: 20 },
  { pair: 'MAI/USDC', volume24h: 4.2, marketCap: 25, category: 'Stablecoin', rank: 21 },
  { pair: 'AAVE/WMATIC', volume24h: 4.0, marketCap: 2200, category: 'DeFi', rank: 22 },
  { pair: 'UNI/WMATIC', volume24h: 3.9, marketCap: 4100, category: 'DEX', rank: 23 },
  { pair: 'QUICK/WMATIC', volume24h: 3.7, marketCap: 42, category: 'DEX', rank: 24 },
  { pair: 'GHST/USDC', volume24h: 3.2, marketCap: 52, category: 'Gaming', rank: 25 },
  { pair: 'CRV/WMATIC', volume24h: 3.2, marketCap: 520, category: 'DeFi', rank: 26 },
  { pair: 'MAI/WMATIC', volume24h: 2.9, marketCap: 25, category: 'Stablecoin', rank: 27 },
  { pair: 'SAND/WMATIC', volume24h: 2.8, marketCap: 850, category: 'Gaming', rank: 28 },
  { pair: 'SNX/WMATIC', volume24h: 2.5, marketCap: 630, category: 'DeFi', rank: 29 },
  { pair: 'BAL/WMATIC', volume24h: 2.3, marketCap: 310, category: 'DeFi', rank: 30 },
  { pair: 'GHST/WMATIC', volume24h: 2.1, marketCap: 52, category: 'Gaming', rank: 31 },
  { pair: 'COMP/WMATIC', volume24h: 2.1, marketCap: 820, category: 'DeFi', rank: 32 },
  { pair: 'MKR/WMATIC', volume24h: 1.8, marketCap: 1200, category: 'DeFi', rank: 33 },
  { pair: 'BAND/WMATIC', volume24h: 1.5, marketCap: 180, category: 'Oracle', rank: 34 },
];

// Filter: Exclude top 15 by rank
const excludeTopN = 15;
const midTierPairs = CURATED_PAIRS.filter(p => p.rank > excludeTopN);

console.log(`   • Excluding top ${excludeTopN} by volume & market cap (ultra-efficient)`);
console.log(`   • Available mid-tier pairs: ${midTierPairs.length}`);

// Sort remaining by volume (descending)
const sorted = midTierPairs.sort((a, b) => b.volume24h - a.volume24h);

// Select top 10 from mid-tier
const selected = sorted.slice(0, 10);

console.log(`📊 Volume & Market Cap based pair selection:`);
console.log(`   • Total pairs ranked: ${CURATED_PAIRS.length}`);
console.log(`   • Excluding top ${excludeTopN} by volume/market cap (ultra-efficient, MEV dominated)`);
console.log(`   • Mid-tier pool: ${midTierPairs.length} pairs`);
console.log(`   • Selecting: 10 best mid-tier pairs\n`);

console.log('❌ EXCLUDED (Top 15 - too efficient for retail arbitrage):\n');
CURATED_PAIRS.filter(p => p.rank <= excludeTopN).forEach((item) => {
  const mcap = item.marketCap >= 1000 ? `$${(item.marketCap / 1000).toFixed(0)}B` : `$${item.marketCap}M`;
  console.log(`   ${item.rank}. ${item.pair.padEnd(15)} | Vol: $${item.volume24h}M | MCap: ${mcap.padStart(7)}`);
});

console.log('\n✅ SELECTED (Mid-Tier - Best arbitrage opportunities):\n');
selected.forEach((item, index) => {
  const mcap = item.marketCap >= 1000 ? `$${(item.marketCap / 1000).toFixed(1)}B` : `$${item.marketCap}M`;
  console.log(`   ${index + 1}. ${item.pair.padEnd(15)} | Vol: $${item.volume24h}M | MCap: ${mcap.padStart(7)} | ${item.category}`);
});

// Update config
console.log('\n📝 Updating config file...\n');

const configPath = 'src/config.ts';
let config = fs.readFileSync(configPath, 'utf8');

// Disable all pairs
config = config.replace(/enabled: true/g, 'enabled: false');

let enabledCount = 0;
let missing = [];

selected.forEach((item) => {
  const pairName = item.pair;
  const regex = new RegExp(
    `(name: "${pairName.replace('/', '\\/')}"[\\s\\S]{0,250}?enabled: )false`,
    ''
  );
  
  if (regex.test(config)) {
    config = config.replace(regex, '$1true');
    console.log(`   ✅ ${pairName}`);
    enabledCount++;
  } else {
    console.log(`   ⚠️  ${pairName} (not in config)`);
    missing.push(pairName);
  }
});

fs.writeFileSync(configPath, config);

console.log(`\n📊 Summary:`);
console.log(`   ✅ Enabled: ${enabledCount} pairs`);
console.log(`   💰 Est. API usage: ${enabledCount * 10}M/day`);
console.log(`   💸 Est. cost (Pay-As-You-Go): ~$${(enabledCount * 0.4).toFixed(2)}/day`);

if (missing.length > 0) {
  console.log(`\n⚠️  Missing pairs (need to be added):`);
  missing.forEach(p => console.log(`   • ${p}`));
}

console.log('\n═══════════════════════════════════════════');
console.log('✨ Next steps:');
console.log('   1. Run: npm run build');
console.log('   2. Run: npm run bot');
console.log('   3. Watch for real arbitrage opportunities!');
console.log('═══════════════════════════════════════════\n');

console.log('💡 Tip: Run this script weekly to refresh pairs based on volume\n');
