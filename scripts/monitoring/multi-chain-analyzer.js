/**
 * 📊 Multi-Chain Performance Analyzer
 * 
 * Analyzes and compares arbitrage opportunities across chains
 * Generates comprehensive performance reports
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  polygon: '\x1b[35m',
  bsc: '\x1b[33m',
  base: '\x1b[36m',
  
  success: '\x1b[32m',
  error: '\x1b[31m',
  warning: '\x1b[33m',
  info: '\x1b[34m',
};

class ChainPerformance {
  constructor(name, displayName, color, icon) {
    this.name = name;
    this.displayName = displayName;
    this.color = color;
    this.icon = icon;
    
    // Metrics
    this.startTime = null;
    this.endTime = null;
    this.opportunities = [];
    this.errors = [];
    this.pools = { total: 0, active: 0 };
    this.gasEstimates = [];
  }
  
  addOpportunity(pair, dex1, dex2, spread, timestamp) {
    this.opportunities.push({
      pair,
      dex1,
      dex2,
      spread,
      timestamp,
    });
  }
  
  addError(message, timestamp) {
    this.errors.push({ message, timestamp });
  }
  
  getRuntime() {
    if (!this.startTime) return 0;
    const end = this.endTime || Date.now();
    return Math.floor((end - this.startTime) / 1000);
  }
  
  getOpportunitiesPerMinute() {
    const runtime = this.getRuntime();
    if (runtime === 0) return 0;
    return (this.opportunities.length / runtime) * 60;
  }
  
  getAverageSpread() {
    if (this.opportunities.length === 0) return 0;
    const sum = this.opportunities.reduce((acc, opp) => acc + opp.spread, 0);
    return sum / this.opportunities.length;
  }
  
  getBestOpportunity() {
    if (this.opportunities.length === 0) return null;
    return this.opportunities.reduce((best, opp) => 
      opp.spread > best.spread ? opp : best
    );
  }
  
  getTopPairs() {
    const pairCounts = {};
    this.opportunities.forEach(opp => {
      pairCounts[opp.pair] = (pairCounts[opp.pair] || 0) + 1;
    });
    
    return Object.entries(pairCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pair, count]) => ({ pair, count }));
  }
  
  getTopDEXPairs() {
    const dexPairs = {};
    this.opportunities.forEach(opp => {
      const key = `${opp.dex1} ↔ ${opp.dex2}`;
      dexPairs[key] = (dexPairs[key] || 0) + 1;
    });
    
    return Object.entries(dexPairs)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([pair, count]) => ({ pair, count }));
  }
}

class MultiChainAnalyzer {
  constructor() {
    this.chains = new Map();
    
    // Initialize chains
    this.addChain('polygon', 'Polygon', colors.polygon, '🟣');
    this.addChain('bsc', 'BSC', colors.bsc, '🟡');
    this.addChain('base', 'Base', colors.base, '🔵');
  }
  
  addChain(name, displayName, color, icon) {
    this.chains.set(name, new ChainPerformance(name, displayName, color, icon));
  }
  
  getChain(name) {
    return this.chains.get(name);
  }
  
  printHeader() {
    console.log(`
${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}
${colors.bright}     📊 MULTI-CHAIN PERFORMANCE ANALYSIS 📊${colors.reset}
${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}
`);
  }
  
  printChainSummary(chain) {
    const runtime = chain.getRuntime();
    const oppPerMin = chain.getOpportunitiesPerMinute().toFixed(2);
    const avgSpread = chain.getAverageSpread().toFixed(2);
    const best = chain.getBestOpportunity();
    
    console.log(`${chain.color}${chain.icon} ${chain.displayName}${colors.reset}`);
    console.log(`${'─'.repeat(63)}`);
    console.log(`  Runtime:              ${runtime}s (${(runtime / 60).toFixed(1)} minutes)`);
    console.log(`  Total Opportunities:  ${chain.opportunities.length}`);
    console.log(`  Opportunities/Minute: ${oppPerMin}`);
    console.log(`  Average Spread:       ${avgSpread}%`);
    console.log(`  Errors:               ${chain.errors.length}`);
    
    if (best) {
      console.log(`  Best Opportunity:     ${best.spread.toFixed(2)}% (${best.pair} on ${best.dex1}/${best.dex2})`);
    }
    
    // Top pairs
    const topPairs = chain.getTopPairs();
    if (topPairs.length > 0) {
      console.log(`\n  🔥 Top Active Pairs:`);
      topPairs.forEach((p, i) => {
        console.log(`     ${i + 1}. ${p.pair.padEnd(20)} ${p.count} opportunities`);
      });
    }
    
    // Top DEX pairs
    const topDEXPairs = chain.getTopDEXPairs();
    if (topDEXPairs.length > 0) {
      console.log(`\n  🏦 Top DEX Pairs:`);
      topDEXPairs.forEach((p, i) => {
        console.log(`     ${i + 1}. ${p.pair.padEnd(30)} ${p.count} opportunities`);
      });
    }
    
    console.log('');
  }
  
  printComparison() {
    console.log(`${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}                  🏆 CHAIN COMPARISON${colors.reset}`);
    console.log(`${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}\n`);
    
    // Create comparison table
    const chains = Array.from(this.chains.values());
    
    console.log(`${'Metric'.padEnd(30)} ${'Polygon'.padEnd(15)} ${'BSC'.padEnd(15)} ${'Base'.padEnd(15)}`);
    console.log(`${'═'.repeat(75)}`);
    
    // Total opportunities
    console.log(`${'Total Opportunities'.padEnd(30)} ${
      String(chains[0].opportunities.length).padEnd(15)
    } ${
      String(chains[1].opportunities.length).padEnd(15)
    } ${
      String(chains[2].opportunities.length).padEnd(15)
    }`);
    
    // Opportunities per minute
    console.log(`${'Opportunities/Minute'.padEnd(30)} ${
      chains[0].getOpportunitiesPerMinute().toFixed(2).padEnd(15)
    } ${
      chains[1].getOpportunitiesPerMinute().toFixed(2).padEnd(15)
    } ${
      chains[2].getOpportunitiesPerMinute().toFixed(2).padEnd(15)
    }`);
    
    // Average spread
    console.log(`${'Average Spread (%)'.padEnd(30)} ${
      chains[0].getAverageSpread().toFixed(2).padEnd(15)
    } ${
      chains[1].getAverageSpread().toFixed(2).padEnd(15)
    } ${
      chains[2].getAverageSpread().toFixed(2).padEnd(15)
    }`);
    
    // Best spread
    console.log(`${'Best Spread (%)'.padEnd(30)} ${
      (chains[0].getBestOpportunity()?.spread || 0).toFixed(2).padEnd(15)
    } ${
      (chains[1].getBestOpportunity()?.spread || 0).toFixed(2).padEnd(15)
    } ${
      (chains[2].getBestOpportunity()?.spread || 0).toFixed(2).padEnd(15)
    }`);
    
    // Errors
    console.log(`${'Errors'.padEnd(30)} ${
      String(chains[0].errors.length).padEnd(15)
    } ${
      String(chains[1].errors.length).padEnd(15)
    } ${
      String(chains[2].errors.length).padEnd(15)
    }`);
    
    console.log('');
  }
  
  printRecommendation() {
    console.log(`${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}                  💡 RECOMMENDATIONS${colors.reset}`);
    console.log(`${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}\n`);
    
    const chains = Array.from(this.chains.values());
    
    // Find best chain by opportunities per minute
    const bestByFrequency = chains.reduce((best, chain) => 
      chain.getOpportunitiesPerMinute() > best.getOpportunitiesPerMinute() ? chain : best
    );
    
    // Find best chain by average spread
    const bestBySpread = chains.reduce((best, chain) => 
      chain.getAverageSpread() > best.getAverageSpread() ? chain : best
    );
    
    // Find best overall (weighted score)
    const bestOverall = chains.reduce((best, chain) => {
      const bestScore = best.getOpportunitiesPerMinute() * best.getAverageSpread();
      const chainScore = chain.getOpportunitiesPerMinute() * chain.getAverageSpread();
      return chainScore > bestScore ? chain : best;
    });
    
    console.log(`🔥 ${colors.success}Most Frequent Opportunities:${colors.reset} ${bestByFrequency.color}${bestByFrequency.displayName}${colors.reset}`);
    console.log(`   ${bestByFrequency.getOpportunitiesPerMinute().toFixed(2)} opportunities/minute\n`);
    
    console.log(`💰 ${colors.success}Highest Average Spread:${colors.reset} ${bestBySpread.color}${bestBySpread.displayName}${colors.reset}`);
    console.log(`   ${bestBySpread.getAverageSpread().toFixed(2)}% average spread\n`);
    
    console.log(`🏆 ${colors.success}Best Overall (Frequency × Spread):${colors.reset} ${bestOverall.color}${bestOverall.displayName}${colors.reset}`);
    console.log(`   Score: ${(bestOverall.getOpportunitiesPerMinute() * bestOverall.getAverageSpread()).toFixed(2)}\n`);
    
    // Deployment recommendations
    console.log(`${colors.info}Deployment Strategy:${colors.reset}`);
    
    if (bestOverall.name === 'polygon') {
      console.log(`   ✅ Focus on ${bestOverall.color}Polygon${colors.reset} - highest frequency & good spreads`);
      console.log(`   ✅ Low gas costs (~$0.01-0.05 per tx)`);
      console.log(`   ✅ 68 pools providing diverse opportunities`);
    } else if (bestOverall.name === 'bsc') {
      console.log(`   ✅ Focus on ${bestOverall.color}BSC${colors.reset} - excellent liquidity & spreads`);
      console.log(`   ⚠️  Moderate gas costs (~$0.10-0.30 per tx)`);
      console.log(`   ✅ BiSwap's 0.1% fee = competitive edge`);
    } else if (bestOverall.name === 'base') {
      console.log(`   ✅ Focus on ${bestOverall.color}Base${colors.reset} - L2 benefits & growing ecosystem`);
      console.log(`   ✅ Ultra-low gas costs (~$0.01-0.05 per tx)`);
      console.log(`   ✅ Fast 2-second blocks = quick execution`);
    }
    
    console.log(`\n   ${colors.dim}Consider running all 3 chains if sufficient capital & automation${colors.reset}`);
    console.log('');
  }
  
  generateReport() {
    this.printHeader();
    
    // Individual chain summaries
    this.chains.forEach(chain => {
      this.printChainSummary(chain);
    });
    
    // Comparison table
    this.printComparison();
    
    // Recommendations
    this.printRecommendation();
    
    console.log(`${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}\n`);
  }
  
  saveReport(filename) {
    const report = {
      timestamp: new Date().toISOString(),
      chains: {},
    };
    
    this.chains.forEach((chain, name) => {
      report.chains[name] = {
        displayName: chain.displayName,
        runtime: chain.getRuntime(),
        totalOpportunities: chain.opportunities.length,
        opportunitiesPerMinute: chain.getOpportunitiesPerMinute(),
        averageSpread: chain.getAverageSpread(),
        bestOpportunity: chain.getBestOpportunity(),
        topPairs: chain.getTopPairs(),
        topDEXPairs: chain.getTopDEXPairs(),
        errors: chain.errors.length,
        opportunities: chain.opportunities,
      };
    });
    
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`${colors.success}Report saved to: ${filename}${colors.reset}\n`);
  }
}

// Example usage
if (require.main === module) {
  const analyzer = new MultiChainAnalyzer();
  
  // Simulate some test data
  const polygon = analyzer.getChain('polygon');
  polygon.startTime = Date.now() - 300000; // 5 minutes ago
  polygon.addOpportunity('WMATIC/USDC', 'QuickSwap', 'SushiSwap', 0.85, Date.now());
  polygon.addOpportunity('WMATIC/USDT', 'QuickSwap', 'ApeSwap', 0.68, Date.now());
  polygon.addOpportunity('SUSHI/WMATIC', 'SushiSwap', 'Dfyn', 1.20, Date.now());
  polygon.addOpportunity('WMATIC/USDC', 'QuickSwap', 'Polycat', 0.75, Date.now());
  
  const bsc = analyzer.getChain('bsc');
  bsc.startTime = Date.now() - 300000;
  bsc.addOpportunity('CAKE/WBNB', 'PancakeSwap', 'BiSwap', 0.92, Date.now());
  bsc.addOpportunity('BANANA/WBNB', 'ApeSwap', 'MDEX', 1.15, Date.now());
  
  const base = analyzer.getChain('base');
  base.startTime = Date.now() - 300000;
  base.addOpportunity('BSWAP/WETH', 'BaseSwap', 'SushiSwap', 0.65, Date.now());
  
  // Generate report
  analyzer.generateReport();
  
  // Save to file
  const reportPath = path.join(__dirname, '..', 'multichain-report.json');
  analyzer.saveReport(reportPath);
}

module.exports = { MultiChainAnalyzer, ChainPerformance };
