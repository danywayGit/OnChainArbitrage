/**
 * Generate Trading Pairs Configuration
 * 
 * This script generates watchedPairs array for config.ts
 * based on the 100 tokens available on Polygon.
 * 
 * Usage:
 *   node scripts/generate-pairs.js --top=20 --bases=WMATIC,USDC,WETH,USDT
 */

// Top tokens by volume (priority order)
const topTokens = [
  // Tier 1: Core (always include)
  "WMATIC", "WETH", "WBTC", "USDC", "USDT", "DAI",
  
  // Tier 2: Major DeFi (high priority)
  "LINK", "AAVE", "UNI", "CRV", "SUSHI", "BAL", "COMP", "MKR", "SNX", "YFI",
  
  // Tier 3: Layer 2 & Metaverse
  "SAND", "MANA", "GHST", "POL",
  
  // Tier 4: Exchange tokens
  "BNB", "FTM", "AVAX",
  
  // Tier 5: DEX tokens
  "QUICK", "DYST",
  
  // Tier 6: Gaming
  "AXS", "GALA", "IMX", "REVV", "ENJ", "ALICE",
  
  // Tier 7: Oracles & Data
  "API3", "BAND", "GRT",
  
  // Tier 8: Stablecoins (alternative)
  "USDD", "TUSD", "FRAX", "MAI",
  
  // Tier 9: Lending
  "QI", "DQUICK", "CEL",
  
  // Tier 10: Synthetic
  "sUSD", "sBTC", "sETH",
  
  // Tier 11: Privacy
  "ZRX", "LRC",
  
  // Tier 12: Yield
  "CVX", "BIFI",
  
  // Tier 13: Cross-chain
  "RNDR", "INJ",
  
  // Tier 14: NFT
  "RARI",
  
  // Tier 15: Real World Assets
  "PAXG", "DPI",
  
  // Tier 16: Algorithmic Stablecoins
  "AMPL", "RAI",
  
  // Tier 17: Insurance
  "NEXO", "COVER",
  
  // Tier 18: Miscellaneous
  "TEL", "CELR", "WOO", "OM", "ELON", "SHIB", "FET", "OCEAN", "LDO", "RPL",
  "EURS", "AGEUR", "jEUR", "MIMATIC", "ANKR", "ALCX", "ALPHA", "PERP", "TRIBE", "RUNE",
  
  // Tier 19: Wrapped assets
  "WBNB", "WFTM", "renBTC",
];

// Base currencies to pair with (most liquid)
const baseCurrencies = ["WMATIC", "USDC", "WETH", "USDT"];

// Stablecoins (for cross-stable pairs)
const stablecoins = ["USDC", "USDT", "DAI", "USDD", "TUSD", "FRAX", "MAI"];

/**
 * Generate pairs for given tokens
 */
function generatePairs(tokens, limit = 20) {
  const pairs = [];
  const addedPairs = new Set();
  
  // Priority 1: Pair each token with base currencies
  for (let i = 0; i < Math.min(tokens.length, limit); i++) {
    const token = tokens[i];
    
    // Skip if token is already a base currency
    if (baseCurrencies.includes(token)) continue;
    
    for (const base of baseCurrencies) {
      const pairName = `${token}/${base}`;
      const reversePair = `${base}/${token}`;
      
      // Avoid duplicates
      if (addedPairs.has(pairName) || addedPairs.has(reversePair)) continue;
      
      // Skip stable-to-stable pairs (too tight margins)
      if (stablecoins.includes(token) && stablecoins.includes(base)) continue;
      
      pairs.push({
        name: pairName,
        token0: token,
        token1: base,
        enabled: true,
        tier: i < 6 ? 1 : (i < 20 ? 2 : 3),
      });
      
      addedPairs.add(pairName);
    }
  }
  
  // Priority 2: Cross pairs between major tokens (optional)
  if (limit > 50) {
    for (let i = 0; i < Math.min(10, tokens.length); i++) {
      for (let j = i + 1; j < Math.min(10, tokens.length); j++) {
        const token0 = tokens[i];
        const token1 = tokens[j];
        
        // Skip base currencies and stablecoins
        if (baseCurrencies.includes(token0) || baseCurrencies.includes(token1)) continue;
        if (stablecoins.includes(token0) && stablecoins.includes(token1)) continue;
        
        const pairName = `${token0}/${token1}`;
        if (addedPairs.has(pairName)) continue;
        
        pairs.push({
          name: pairName,
          token0: token0,
          token1: token1,
          enabled: false, // Disable cross-pairs by default
          tier: 4,
        });
        
        addedPairs.add(pairName);
        
        if (pairs.length >= limit * 1.5) break;
      }
      if (pairs.length >= limit * 1.5) break;
    }
  }
  
  return pairs;
}

/**
 * Format pairs as TypeScript config
 */
function formatPairsConfig(pairs) {
  let config = "    watchedPairs: [\n";
  
  let currentTier = 1;
  for (const pair of pairs) {
    // Add tier separator
    if (pair.tier !== currentTier) {
      currentTier = pair.tier;
      config += "\n";
      const tierName = currentTier === 1 ? "TIER 1: CORE PAIRS (Highest Priority)" :
                       currentTier === 2 ? "TIER 2: MAJOR DEFI (High Priority)" :
                       currentTier === 3 ? "TIER 3: ADDITIONAL TOKENS (Medium Priority)" :
                       "TIER 4: CROSS PAIRS (Low Priority)";
      config += `      // === ${tierName} ===\n`;
    }
    
    const enabledStr = pair.enabled ? "true " : "false";
    const priority = pair.tier === 1 ? "⭐⭐⭐" : pair.tier === 2 ? "⭐⭐" : pair.tier === 3 ? "⭐" : "";
    
    config += `      {\n`;
    config += `        name: "${pair.name}",\n`;
    config += `        token0: "${pair.token0}",\n`;
    config += `        token1: "${pair.token1}",\n`;
    config += `        enabled: ${enabledStr}, // ${priority}\n`;
    config += `      },\n`;
  }
  
  config += "    ],\n";
  return config;
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  let limit = 20; // Default: top 20 tokens
  
  // Parse command line arguments
  for (const arg of args) {
    if (arg.startsWith("--top=")) {
      limit = parseInt(arg.split("=")[1]);
    } else if (arg.startsWith("--limit=")) {
      limit = parseInt(arg.split("=")[1]);
    }
  }
  
  console.log(`\n🚀 Generating trading pairs for top ${limit} tokens...`);
  console.log(`📊 Base currencies: ${baseCurrencies.join(", ")}\n`);
  
  const pairs = generatePairs(topTokens, limit);
  
  console.log(`✅ Generated ${pairs.length} trading pairs\n`);
  console.log("📋 Summary by tier:");
  const tier1 = pairs.filter(p => p.tier === 1).length;
  const tier2 = pairs.filter(p => p.tier === 2).length;
  const tier3 = pairs.filter(p => p.tier === 3).length;
  const tier4 = pairs.filter(p => p.tier === 4).length;
  console.log(`   - Tier 1 (Core):       ${tier1} pairs`);
  console.log(`   - Tier 2 (Major DeFi): ${tier2} pairs`);
  console.log(`   - Tier 3 (Additional): ${tier3} pairs`);
  console.log(`   - Tier 4 (Cross):      ${tier4} pairs`);
  console.log(`   - Total enabled:       ${pairs.filter(p => p.enabled).length} pairs\n`);
  
  console.log("💡 Copy this configuration to src/config.ts:\n");
  console.log("─".repeat(80));
  console.log(formatPairsConfig(pairs));
  console.log("─".repeat(80));
  
  console.log("\n📝 Next steps:");
  console.log("   1. Copy the watchedPairs array above");
  console.log("   2. Replace the watchedPairs in src/config.ts");
  console.log("   3. Run: npm run bot (dry run mode)");
  console.log("   4. Monitor for 24 hours");
  console.log("   5. Enable live trading when ready\n");
  
  console.log("⚙️  Options:");
  console.log("   --top=50    Generate pairs for top 50 tokens");
  console.log("   --top=100   Generate pairs for all 100 tokens");
  console.log("");
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { generatePairs, formatPairsConfig, topTokens };
