/**
 * Data Analysis Script
 * 
 * Analyzes collected arbitrage opportunity data
 * Generates insights about:
 * - Best trading hours
 * - Most profitable pairs
 * - DEX combinations
 * - Profitability patterns
 * 
 * Usage:
 *   node scripts/analyze-data.js [date]
 *   node scripts/analyze-data.js 2025-10-18
 *   node scripts/analyze-data.js  # Uses today's date
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// DATA LOADING
// ============================================================================

function loadData(date) {
  const logsDir = path.join(__dirname, '..', 'logs');
  const opportunitiesFile = path.join(logsDir, `opportunities_${date}.json`);
  
  if (!fs.existsSync(opportunitiesFile)) {
    console.error(`❌ No data found for ${date}`);
    console.error(`   Expected file: ${opportunitiesFile}`);
    process.exit(1);
  }
  
  const data = fs.readFileSync(opportunitiesFile, 'utf8');
  return JSON.parse(data);
}

// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

function analyzeByHour(opportunities) {
  const hourlyStats = {};
  
  for (let hour = 0; hour < 24; hour++) {
    hourlyStats[hour] = {
      count: 0,
      totalProfit: 0,
      avgProfit: 0,
      avgSpread: 0,
      bestOpportunity: null,
    };
  }
  
  opportunities.forEach(opp => {
    const stats = hourlyStats[opp.hour];
    stats.count++;
    stats.totalProfit += opp.netProfitUSD;
    stats.avgSpread += opp.spreadPercent;
    
    if (!stats.bestOpportunity || opp.netProfitUSD > stats.bestOpportunity.netProfitUSD) {
      stats.bestOpportunity = opp;
    }
  });
  
  // Calculate averages
  for (let hour = 0; hour < 24; hour++) {
    const stats = hourlyStats[hour];
    if (stats.count > 0) {
      stats.avgProfit = stats.totalProfit / stats.count;
      stats.avgSpread = stats.avgSpread / stats.count;
    }
  }
  
  return hourlyStats;
}

function analyzeByPair(opportunities) {
  const pairStats = {};
  
  opportunities.forEach(opp => {
    if (!pairStats[opp.pair]) {
      pairStats[opp.pair] = {
        count: 0,
        totalProfit: 0,
        avgProfit: 0,
        avgSpread: 0,
        bestOpportunity: null,
        profitable: 0,
      };
    }
    
    const stats = pairStats[opp.pair];
    stats.count++;
    stats.totalProfit += opp.netProfitUSD;
    stats.avgSpread += opp.spreadPercent;
    
    if (opp.netProfitUSD > 0) {
      stats.profitable++;
    }
    
    if (!stats.bestOpportunity || opp.netProfitUSD > stats.bestOpportunity.netProfitUSD) {
      stats.bestOpportunity = opp;
    }
  });
  
  // Calculate averages
  Object.values(pairStats).forEach(stats => {
    if (stats.count > 0) {
      stats.avgProfit = stats.totalProfit / stats.count;
      stats.avgSpread = stats.avgSpread / stats.count;
    }
  });
  
  return pairStats;
}

function analyzeByDex(opportunities) {
  const dexStats = {};
  
  opportunities.forEach(opp => {
    const dexPair = `${opp.dex1}/${opp.dex2}`;
    
    if (!dexStats[dexPair]) {
      dexStats[dexPair] = {
        count: 0,
        totalProfit: 0,
        avgProfit: 0,
        avgSpread: 0,
        profitable: 0,
      };
    }
    
    const stats = dexStats[dexPair];
    stats.count++;
    stats.totalProfit += opp.netProfitUSD;
    stats.avgSpread += opp.spreadPercent;
    
    if (opp.netProfitUSD > 0) {
      stats.profitable++;
    }
  });
  
  // Calculate averages
  Object.values(dexStats).forEach(stats => {
    if (stats.count > 0) {
      stats.avgProfit = stats.totalProfit / stats.count;
      stats.avgSpread = stats.avgSpread / stats.count;
    }
  });
  
  return dexStats;
}

function analyzeByDayOfWeek(opportunities) {
  const weekdayStats = {
    Monday: { count: 0, totalProfit: 0, avgProfit: 0 },
    Tuesday: { count: 0, totalProfit: 0, avgProfit: 0 },
    Wednesday: { count: 0, totalProfit: 0, avgProfit: 0 },
    Thursday: { count: 0, totalProfit: 0, avgProfit: 0 },
    Friday: { count: 0, totalProfit: 0, avgProfit: 0 },
    Saturday: { count: 0, totalProfit: 0, avgProfit: 0 },
    Sunday: { count: 0, totalProfit: 0, avgProfit: 0 },
  };
  
  opportunities.forEach(opp => {
    const stats = weekdayStats[opp.dayOfWeek];
    if (stats) {
      stats.count++;
      stats.totalProfit += opp.netProfitUSD;
    }
  });
  
  // Calculate averages
  Object.values(weekdayStats).forEach(stats => {
    if (stats.count > 0) {
      stats.avgProfit = stats.totalProfit / stats.count;
    }
  });
  
  return weekdayStats;
}

// ============================================================================
// REPORTING
// ============================================================================

function generateReport(opportunities, date) {
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║              ARBITRAGE OPPORTUNITY ANALYSIS REPORT                ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');
  
  console.log(`📅 Date: ${date}`);
  console.log(`📊 Total Opportunities: ${opportunities.length}\n`);
  
  if (opportunities.length === 0) {
    console.log('⚠️  No opportunities found for this date.\n');
    return;
  }
  
  // Overall statistics
  const profitable = opportunities.filter(opp => opp.netProfitUSD > 0);
  const totalProfit = profitable.reduce((sum, opp) => sum + opp.netProfitUSD, 0);
  const avgProfit = profitable.length > 0 ? totalProfit / profitable.length : 0;
  const avgSpread = opportunities.reduce((sum, opp) => sum + opp.spreadPercent, 0) / opportunities.length;
  
  console.log('💰 PROFITABILITY OVERVIEW');
  console.log('─'.repeat(70));
  console.log(`   Profitable Opportunities: ${profitable.length} (${((profitable.length / opportunities.length) * 100).toFixed(1)}%)`);
  console.log(`   Total Potential Profit: $${totalProfit.toFixed(2)}`);
  console.log(`   Average Profit per Opp: $${avgProfit.toFixed(2)}`);
  console.log(`   Average Spread: ${avgSpread.toFixed(4)}%\n`);
  
  // Best opportunity
  const best = profitable.reduce((best, opp) => opp.netProfitUSD > best.netProfitUSD ? opp : best, profitable[0]);
  if (best) {
    console.log('🏆 BEST OPPORTUNITY');
    console.log('─'.repeat(70));
    console.log(`   Pair: ${best.pair}`);
    console.log(`   DEXes: ${best.dex1} → ${best.dex2}`);
    console.log(`   Spread: ${best.spreadPercent.toFixed(4)}%`);
    console.log(`   Profit: $${best.netProfitUSD.toFixed(2)} (${best.netProfitPercent.toFixed(2)}%)`);
    console.log(`   Time: ${best.time}\n`);
  }
  
  // Hourly analysis
  console.log('⏰ OPPORTUNITIES BY HOUR (UTC)');
  console.log('─'.repeat(70));
  const hourlyStats = analyzeByHour(opportunities);
  
  // Find best hours
  const bestHours = Object.entries(hourlyStats)
    .filter(([_, stats]) => stats.count > 0)
    .sort((a, b) => b[1].totalProfit - a[1].totalProfit)
    .slice(0, 5);
  
  console.log('   Top 5 Most Profitable Hours:');
  bestHours.forEach(([hour, stats], index) => {
    console.log(`   ${index + 1}. ${String(hour).padStart(2, '0')}:00 - ${stats.count} opps, $${stats.totalProfit.toFixed(2)} profit`);
  });
  console.log('');
  
  // Visualization
  console.log('   Hourly Distribution:');
  for (let i = 0; i < 24; i += 6) {
    const row = [];
    for (let j = i; j < i + 6; j++) {
      const count = hourlyStats[j].count;
      const bar = count > 0 ? '█'.repeat(Math.min(count, 20)) : '·';
      row.push(`${String(j).padStart(2, '0')}:${bar.padEnd(20, ' ')}(${count})`);
    }
    console.log(`   ${row.join(' ')}`);
  }
  console.log('');
  
  // Pair analysis
  console.log('🔝 TOP TRADING PAIRS');
  console.log('─'.repeat(70));
  const pairStats = analyzeByPair(opportunities);
  const topPairs = Object.entries(pairStats)
    .sort((a, b) => b[1].totalProfit - a[1].totalProfit)
    .slice(0, 10);
  
  console.log('   By Total Profit:');
  topPairs.forEach(([pair, stats], index) => {
    const profitRate = (stats.profitable / stats.count * 100).toFixed(0);
    console.log(`   ${String(index + 1).padStart(2, ' ')}. ${pair.padEnd(20, ' ')} - ${String(stats.count).padStart(3, ' ')} opps, $${stats.totalProfit.toFixed(2).padStart(8, ' ')}, ${profitRate}% profitable`);
  });
  console.log('');
  
  // DEX analysis
  console.log('🔄 TOP DEX COMBINATIONS');
  console.log('─'.repeat(70));
  const dexStats = analyzeByDex(opportunities);
  const topDexes = Object.entries(dexStats)
    .sort((a, b) => b[1].totalProfit - a[1].totalProfit)
    .slice(0, 10);
  
  topDexes.forEach(([dex, stats], index) => {
    const profitRate = (stats.profitable / stats.count * 100).toFixed(0);
    console.log(`   ${String(index + 1).padStart(2, ' ')}. ${dex.padEnd(35, ' ')} - ${String(stats.count).padStart(3, ' ')} opps, $${stats.totalProfit.toFixed(2).padStart(8, ' ')}, ${profitRate}% profitable`);
  });
  console.log('');
  
  // Day of week (if multiple days)
  const uniqueDays = [...new Set(opportunities.map(opp => opp.dayOfWeek))];
  if (uniqueDays.length > 1) {
    console.log('📅 OPPORTUNITIES BY DAY OF WEEK');
    console.log('─'.repeat(70));
    const weekdayStats = analyzeByDayOfWeek(opportunities);
    Object.entries(weekdayStats)
      .sort((a, b) => b[1].totalProfit - a[1].totalProfit)
      .forEach(([day, stats]) => {
        if (stats.count > 0) {
          console.log(`   ${day.padEnd(12, ' ')} - ${String(stats.count).padStart(3, ' ')} opps, $${stats.totalProfit.toFixed(2).padStart(8, ' ')} total, $${stats.avgProfit.toFixed(2).padStart(6, ' ')} avg`);
        }
      });
    console.log('');
  }
  
  // Recommendations
  console.log('💡 RECOMMENDATIONS');
  console.log('─'.repeat(70));
  
  const topPair = topPairs[0];
  const topHour = bestHours[0];
  
  console.log(`   1. Focus on ${topPair[0]} pair (${topPair[1].count} opportunities, $${topPair[1].totalProfit.toFixed(2)} profit)`);
  console.log(`   2. Best trading time: ${topHour[0]}:00 UTC (${topHour[1].count} opportunities)`);
  console.log(`   3. Top DEX combination: ${topDexes[0][0]} (${topDexes[0][1].count} opportunities)`);
  
  const profitableRate = (profitable.length / opportunities.length * 100);
  if (profitableRate < 50) {
    console.log(`   4. ⚠️  Only ${profitableRate.toFixed(1)}% of opportunities are profitable - consider:`);
    console.log(`      - Lowering minProfitBps threshold`);
    console.log(`      - Reducing trade sizes to lower gas impact`);
    console.log(`      - Focusing on high-volume pairs only`);
  } else {
    console.log(`   4. ✅ Good profitability rate (${profitableRate.toFixed(1)}%)`);
  }
  
  console.log('');
  console.log('═'.repeat(70));
  console.log('');
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main() {
  const args = process.argv.slice(2);
  const date = args[0] || new Date().toISOString().split('T')[0];
  
  console.log(`\n🔍 Analyzing data for ${date}...\n`);
  
  try {
    const opportunities = loadData(date);
    generateReport(opportunities, date);
    
    console.log(`📁 Data files:`);
    console.log(`   JSON: logs/opportunities_${date}.json`);
    console.log(`   CSV:  logs/opportunities_${date}.csv`);
    console.log(`   Stats: logs/stats_${date}.json\n`);
  } catch (error) {
    console.error('❌ Error analyzing data:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { loadData, analyzeByHour, analyzeByPair, analyzeByDex, generateReport };
