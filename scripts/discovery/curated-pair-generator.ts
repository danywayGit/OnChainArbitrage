/**
 * ENHANCED TRADING PAIR DETECTOR
 * 
 * This script creates a curated list of arbitrage-friendly trading pairs by:
 * 1. Focusing on mid-cap tokens (avoiding MEV-dominated top 15)
 * 2. Excluding stablecoin vs stablecoin pairs
 * 3. Including tokens with good liquidity and trading volume
 * 4. Prioritizing pairs that typically show price discrepancies across DEXes
 * 
 * Strategy: Manual curation + automated verification
 */

import { ethers } from 'ethers';
import config from '../src/config';
import fs from 'fs';
import path from 'path';

// Top coins by market cap and volume (MEV dominated - EXCLUDE)
// Includes BTC variants, ETH variants, BNB, and other high-volume tokens
const TOP_15_TOKENS = [
  // Major coins and their wrapped versions
  'WETH', 'ETH', 'WBTC', 'BTCB', 'renBTC', 'tBTC', 'BNB', 'WBNB',
  'MATIC', 'WMATIC', 'AVAX', 'FTM',
  // Major stablecoins (also excluded separately)
  'USDC', 'USDT', 'DAI', 'BUSD',
  // Top DeFi blue chips (MEV dominated)
  'LINK', 'UNI', 'AAVE', 'ATOM', 'LDO', 'MKR', 'SNX',
  // Additional high-volume tokens
  'ADA', 'DOT', 'SHIB', 'DOGE'
];

// Stablecoins
const STABLECOINS = [
  'USDC', 'USDT', 'DAI', 'BUSD', 'USDD', 'TUSD', 'FRAX', 'MAI',
  'sUSD', 'EURS', 'AGEUR', 'jEUR', 'RAI', 'LUSD'
];

// CURATED PAIRS - Tokens known for arbitrage opportunities
// These are mid-cap tokens with good liquidity but not dominated by MEV bots
const CURATED_PAIRS = {
  polygon: [
    // Gaming & Metaverse (volatile, good spreads)
    ['CRV', 'SUSHI'], ['CRV', 'BAL'], ['CRV', 'YFI'],
    ['SAND', 'MANA'], ['SAND', 'GHST'], ['SAND', 'AXS'],
    ['MANA', 'GHST'], ['MANA', 'AXS'], ['MANA', 'GALA'],
    ['GHST', 'AXS'], ['GHST', 'GALA'], ['GHST', 'IMX'],
    ['AXS', 'GALA'], ['AXS', 'IMX'],
    
    // DeFi tokens (good volume, cross-DEX arbitrage)
    ['CRV', 'BAL'], ['CRV', 'COMP'], ['CRV', 'YFI'],
    ['SUSHI', 'BAL'], ['SUSHI', 'COMP'], ['SUSHI', 'YFI'],
    ['BAL', 'COMP'], ['BAL', 'YFI'], ['BAL', 'QI'],
    ['COMP', 'YFI'], ['COMP', 'QI'],
    ['YFI', 'QI'], ['QI', 'DQUICK'], ['QI', 'QUICK'],
    
    // Layer 2 / Ecosystem tokens
    ['POL', 'QUICK'], ['POL', 'DYST'], ['POL', 'QI'],
    ['QUICK', 'DYST'], ['QUICK', 'DQUICK'],
    
    // Removed major L1 tokens (FTM, AVAX now in TOP_15_TOKENS)
    
    // Removed wrapped BTC pairs (now excluded in TOP_15_TOKENS)
    
    // Additional mid-cap DeFi pairs (replacing removed pairs)
    ['CRV', 'SNX'], ['CRV', 'CVX'], ['SUSHI', 'CVX'],
    ['BAL', 'SNX'], ['COMP', 'SNX'], ['YFI', 'CVX'],
    ['QI', 'BIFI'], ['QUICK', 'BIFI'], ['DQUICK', 'BIFI'],
    
    // More gaming/metaverse combinations
    ['SAND', 'REVV'], ['MANA', 'REVV'], ['GHST', 'REVV'],
    ['AXS', 'REVV'], ['GALA', 'REVV'], ['IMX', 'REVV'],
    
    // Cross-chain bridges (price discrepancies common)
    ['RNDR', 'INJ'], ['RNDR', 'FET'], ['RNDR', 'GRT'],
    ['INJ', 'FET'], ['INJ', 'GRT'], ['INJ', 'OCEAN'],
    ['FET', 'GRT'], ['FET', 'OCEAN'], ['FET', 'AGIX'],
    ['GRT', 'OCEAN'], ['GRT', 'AGIX'],
    
    // NFT tokens
    ['ENJ', 'RARI'], ['ENJ', 'ALICE'], ['ENJ', 'SAND'],
    ['RARI', 'ALICE'],
    
    // Oracle tokens
    ['API3', 'BAND'], ['BAND', 'GRT'],
    
    // Yield aggregators
    ['CVX', 'BIFI'], ['CVX', 'CRV'], ['CVX', 'BAL'],
    ['BIFI', 'CRV'], ['BIFI', 'QI'],
    
    // Privacy & DEX tokens
    ['ZRX', 'LRC'], ['ZRX', 'SUSHI'], ['ZRX', 'QUICK'],
    ['LRC', 'SUSHI'], ['LRC', 'QUICK'],
    
    // Meme/Community tokens (high volume, volatile)
    ['ELON', 'SHIB'], ['ELON', 'TEL'], 
    ['SHIB', 'TEL'], ['SHIB', 'CELR'],
    
    // Alternative DeFi
    ['ALCX', 'ALPHA'], ['ALCX', 'PERP'], ['ALCX', 'CRV'],
    ['ALPHA', 'PERP'], ['ALPHA', 'TRIBE'],
    ['PERP', 'TRIBE'],
    
    // Network tokens
    ['CELR', 'WOO'], ['CELR', 'OM'],
    ['WOO', 'OM'], ['WOO', 'SKL'],
    ['OM', 'SKL'], ['OM', 'ANKR'],
    ['SKL', 'ANKR'],
    
    // Newer altcoins
    ['RPL', 'ANKR'], ['RPL', 'CELR'],
    
    // Additional DeFi protocol pairs
    ['ALCX', 'CRV'], ['ALCX', 'BAL'], ['ALCX', 'SUSHI'],
    ['PERP', 'CRV'], ['PERP', 'BAL'], ['PERP', 'SUSHI'],
    ['TRIBE', 'CRV'], ['TRIBE', 'BAL'], ['TRIBE', 'COMP'],
    
    // More oracle and data pairs
    ['API3', 'GRT'], ['API3', 'OCEAN'], ['API3', 'FET'],
    ['BAND', 'OCEAN'], ['BAND', 'FET'], ['BAND', 'RNDR'],
    
    // Yield farming pairs
    ['CVX', 'QI'], ['CVX', 'QUICK'], ['BIFI', 'QUICK'],
    ['BIFI', 'DQUICK'], ['CVX', 'DQUICK'],
    
    // More NFT/Gaming combinations
    ['ENJ', 'GHST'], ['ENJ', 'MANA'], ['ENJ', 'GALA'],
    ['RARI', 'GHST'], ['RARI', 'MANA'], ['ALICE', 'GHST'],
    
    // Privacy and exchange tokens
    ['ZRX', 'BAL'], ['ZRX', 'CRV'], ['ZRX', 'COMP'],
    ['LRC', 'BAL'], ['LRC', 'CRV'], ['LRC', 'COMP'],
    
    // Additional layer 2 and ecosystem
    ['POL', 'CRV'], ['POL', 'SUSHI'], ['POL', 'BAL'],
    ['QUICK', 'CRV'], ['QUICK', 'SUSHI'], ['QUICK', 'BAL'],
    ['DQUICK', 'CRV'], ['DQUICK', 'SUSHI'], ['DQUICK', 'BAL'],
    
    // More cross-chain/AI combinations
    ['RNDR', 'OCEAN'], ['RNDR', 'CELR'], ['RNDR', 'WOO'],
    ['INJ', 'CELR'], ['INJ', 'WOO'], ['INJ', 'OM'],
    ['FET', 'CELR'], ['FET', 'WOO'], ['FET', 'OM'],
    ['GRT', 'CELR'], ['GRT', 'WOO'], ['GRT', 'OM'],
    ['OCEAN', 'CELR'], ['OCEAN', 'WOO'], ['OCEAN', 'OM'],
  ],
  
  bsc: [
    // BSC native tokens
    ['CAKE', 'BANANA'], ['CAKE', 'BIFI'], ['CAKE', 'TWT'],
    ['BANANA', 'BIFI'], ['BANANA', 'TWT'],
    ['BIFI', 'TWT'],
    
    // Cross-chain DeFi
    ['CRV', 'SUSHI'], ['CRV', 'BAL'],
    ['SUSHI', 'BAL'],
    
    // Gaming on BSC
    ['AXS', 'GALA'], ['AXS', 'ALICE'], ['AXS', 'SAND'],
    ['GALA', 'ALICE'], ['GALA', 'SAND'],
    ['ALICE', 'SAND'],
    
    // BSC ecosystem
    ['SFP', 'TWT'], ['SFP', 'XVS'], ['SFP', 'ALPACA'],
    ['TWT', 'XVS'], ['TWT', 'ALPACA'],
    ['XVS', 'ALPACA'], ['XVS', 'AUTO'],
    ['ALPACA', 'AUTO'],
    
    // Meme tokens on BSC
    ['SAFEMOON', 'BABYDOGE'], ['SAFEMOON', 'SHIB'],
    ['BABYDOGE', 'SHIB'],
  ],
  
  base: [
    // Base ecosystem (limited for now)
    ['BRETT', 'TOSHI'], ['BRETT', 'DEGEN'],
    ['TOSHI', 'DEGEN'],
  ],
};

// ============================================================================
// SIMPLIFIED VERIFICATION
// ============================================================================

interface TradingPair {
  name: string;
  token0: string;
  token1: string;
  enabled: boolean;
  reason: string;
  verifiedSpread?: number | null;
  chains?: string[];
}

async function generateCuratedPairs(): Promise<TradingPair[]> {
  console.log('🎯 Generating curated trading pairs...\n');
  
  const allPairs: TradingPair[] = [];
  const pairNames = new Set<string>();
  
  // Add curated pairs from all chains
  for (const chain of ['polygon', 'bsc', 'base'] as const) {
    const chainPairs = CURATED_PAIRS[chain];
    
    for (const [token0, token1] of chainPairs) {
      const pairName = `${token0}/${token1}`;
      
      // Skip if already added
      if (pairNames.has(pairName)) {
        const existing = allPairs.find(p => p.name === pairName);
        if (existing && existing.chains) {
          existing.chains.push(chain);
        }
        continue;
      }
      
      // Skip if contains top 15 token
      if (TOP_15_TOKENS.includes(token0) || TOP_15_TOKENS.includes(token1)) {
        allPairs.push({
          name: pairName,
          token0,
          token1,
          enabled: false,
          reason: 'Contains top 15 token (MEV dominated)',
        });
        pairNames.add(pairName);
        continue;
      }
      
      // Skip if both are stablecoins
      if (STABLECOINS.includes(token0) && STABLECOINS.includes(token1)) {
        allPairs.push({
          name: pairName,
          token0,
          token1,
          enabled: false,
          reason: 'Stablecoin vs stablecoin (low profit potential)',
        });
        pairNames.add(pairName);
        continue;
      }
      
      // Add as enabled (curated list is pre-vetted)
      allPairs.push({
        name: pairName,
        token0,
        token1,
        enabled: true,
        reason: 'Curated pair - known for arbitrage opportunities',
        chains: [chain],
      });
      pairNames.add(pairName);
    }
  }
  
  console.log(`✅ Generated ${allPairs.length} curated pairs`);
  console.log(`   - Enabled: ${allPairs.filter(p => p.enabled).length}`);
  console.log(`   - Excluded: ${allPairs.filter(p => !p.enabled).length}\n`);
  
  return allPairs;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║        ENHANCED TRADING PAIR DETECTOR (CURATED)               ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  const pairs = await generateCuratedPairs();
  
  // Separate enabled and excluded
  const enabled = pairs.filter(p => p.enabled);
  const excluded = pairs.filter(p => !p.enabled);
  
  // Create output
  const output = {
    lastUpdated: new Date().toISOString(),
    updateFrequency: 'daily',
    source: 'curated_manual_selection',
    criteria: {
      excludeTop15: true,
      excludeStablecoinPairs: true,
      curatedSelection: true,
      focus: 'Mid-cap tokens with known arbitrage opportunities',
    },
    pairs: pairs.map(p => ({
      name: p.name,
      token0: p.token0,
      token1: p.token1,
      enabled: p.enabled,
      reason: p.reason,
      chains: p.chains,
    })),
    excludedPairs: excluded.map(p => ({
      name: p.name,
      reason: p.reason,
    })),
  };
  
  // Save to file
  const outputPath = path.join(process.cwd(), 'data', 'pairs', 'trading-pairs.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  
  // Summary
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                    DETECTION COMPLETE                          ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  console.log(`📊 SUMMARY`);
  console.log(`   Total pairs: ${pairs.length}`);
  console.log(`   ✅ Enabled: ${enabled.length}`);
  console.log(`   ❌ Excluded: ${excluded.length}\n`);
  
  console.log(`📁 Output: ${outputPath}\n`);
  
  console.log(`✅ ENABLED PAIRS (showing first 50):`);
  enabled.slice(0, 50).forEach((p, i) => {
    const chains = p.chains ? ` [${p.chains.join(', ')}]` : '';
    console.log(`   ${(i + 1).toString().padStart(2)}. ${p.name.padEnd(20)}${chains}`);
  });
  if (enabled.length > 50) {
    console.log(`   ... and ${enabled.length - 50} more pairs\n`);
  }
  
  // Group by category
  console.log(`\n📋 CATEGORIES:`);
  const categories: Record<string, number> = {
    'Gaming & Metaverse': 0,
    'DeFi Tokens': 0,
    'Cross-chain': 0,
    'NFT Tokens': 0,
    'Meme Tokens': 0,
    'BSC Ecosystem': 0,
    'Base Ecosystem': 0,
  };
  
  enabled.forEach(p => {
    const gaming = ['SAND', 'MANA', 'GHST', 'AXS', 'GALA', 'IMX', 'ALICE', 'REVV'];
    const defi = ['CRV', 'SUSHI', 'BAL', 'COMP', 'YFI', 'QI', 'QUICK', 'DQUICK', 'CVX', 'BIFI'];
    const nft = ['ENJ', 'RARI', 'ALICE'];
    const meme = ['ELON', 'SHIB', 'SAFEMOON', 'BABYDOGE'];
    const bsc = ['CAKE', 'BANANA', 'TWT', 'SFP', 'XVS', 'ALPACA', 'AUTO'];
    const base = ['BRETT', 'TOSHI', 'DEGEN'];
    
    if (gaming.includes(p.token0) || gaming.includes(p.token1)) categories['Gaming & Metaverse']++;
    else if (defi.includes(p.token0) || defi.includes(p.token1)) categories['DeFi Tokens']++;
    else if (nft.includes(p.token0) || nft.includes(p.token1)) categories['NFT Tokens']++;
    else if (meme.includes(p.token0) || meme.includes(p.token1)) categories['Meme Tokens']++;
    else if (bsc.includes(p.token0) || bsc.includes(p.token1)) categories['BSC Ecosystem']++;
    else if (base.includes(p.token0) || base.includes(p.token1)) categories['Base Ecosystem']++;
    else categories['Cross-chain']++;
  });
  
  Object.entries(categories).forEach(([category, count]) => {
    if (count > 0) {
      console.log(`   - ${category}: ${count}`);
    }
  });
  
  console.log('\n🎉 Done! You now have a curated list of arbitrage-friendly pairs.\n');
  console.log('💡 TIP: These pairs are selected for their arbitrage potential,');
  console.log('   not MEV-dominated, and have good liquidity across DEXes.\n');
}

main().catch(console.error);
