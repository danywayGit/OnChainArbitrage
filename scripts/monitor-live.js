/**
 * Real-Time Monitor
 * 
 * Displays live statistics while the bot is running
 * Shows opportunities found in the last hour, profit trends, etc.
 * 
 * Usage:
 *   node scripts/monitor-live.js
 */

const fs = require('fs');
const path = require('path');

const REFRESH_INTERVAL = 5000; // 5 seconds
const LOGS_DIR = path.join(__dirname, '..', 'logs');

function getDateStr() {
  return new Date().toISOString().split('T')[0];
}

function loadLatestData() {
  const dateStr = getDateStr();
  const filePath = path.join(LOGS_DIR, `opportunities_${dateStr}.json`);
  
  if (!fs.existsSync(filePath)) {
    return [];
  }
  
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function getLastHourData(opportunities) {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  return opportunities.filter(opp => opp.timestamp >= oneHourAgo);
}

function calculateStats(opportunities) {
  if (opportunities.length === 0) {
    return {
      total: 0,
      profitable: 0,
      totalProfit: 0,
      avgProfit: 0,
      avgSpread: 0,
      bestOpp: null,
      topPairs: {},
      opportunitiesPerMinute: 0,
    };
  }
  
  const profitable = opportunities.filter(opp => opp.netProfitUSD > 0);
  const totalProfit = profitable.reduce((sum, opp) => sum + opp.netProfitUSD, 0);
  const avgProfit = profitable.length > 0 ? totalProfit / profitable.length : 0;
  const avgSpread = opportunities.reduce((sum, opp) => sum + opp.spreadPercent, 0) / opportunities.length;
  
  const bestOpp = profitable.length > 0
    ? profitable.reduce((best, opp) => opp.netProfitUSD > best.netProfitUSD ? opp : best)
    : null;
  
  // Count by pair
  const topPairs = {};
  opportunities.forEach(opp => {
    topPairs[opp.pair] = (topPairs[opp.pair] || 0) + 1;
  });
  
  // Calculate opportunities per minute
  const timeSpan = opportunities.length > 1
    ? (opportunities[opportunities.length - 1].timestamp - opportunities[0].timestamp) / 1000 / 60
    : 1;
  const opportunitiesPerMinute = opportunities.length / timeSpan;
  
  return {
    total: opportunities.length,
    profitable: profitable.length,
    totalProfit,
    avgProfit,
    avgSpread,
    bestOpp,
    topPairs,
    opportunitiesPerMinute,
  };
}

function displayDashboard(allData, lastHourData) {
  console.clear();
  
  const now = new Date();
  const allStats = calculateStats(allData);
  const hourStats = calculateStats(lastHourData);
  
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║              🤖 ARBITRAGE BOT - LIVE MONITOR 📊                   ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`⏰ ${now.toLocaleString()}                   🔄 Refreshing every 5 seconds`);
  console.log('');
  
  // All-time stats
  console.log('📈 TODAY\'S STATISTICS');
  console.log('─'.repeat(70));
  console.log(`   Total Opportunities: ${allStats.total}`);
  console.log(`   Profitable: ${allStats.profitable} (${allStats.total > 0 ? (allStats.profitable / allStats.total * 100).toFixed(1) : 0}%)`);
  console.log(`   Total Profit: $${allStats.totalProfit.toFixed(2)}`);
  console.log(`   Avg Profit: $${allStats.avgProfit.toFixed(2)}`);
  console.log(`   Avg Spread: ${allStats.avgSpread.toFixed(4)}%`);
  console.log('');
  
  // Last hour stats
  console.log('⚡ LAST HOUR');
  console.log('─'.repeat(70));
  console.log(`   Opportunities: ${hourStats.total}`);
  console.log(`   Profitable: ${hourStats.profitable} (${hourStats.total > 0 ? (hourStats.profitable / hourStats.total * 100).toFixed(1) : 0}%)`);
  console.log(`   Profit: $${hourStats.totalProfit.toFixed(2)}`);
  console.log(`   Rate: ${hourStats.opportunitiesPerMinute.toFixed(1)} opps/min`);
  console.log('');
  
  // Best opportunity
  if (allStats.bestOpp) {
    const best = allStats.bestOpp;
    console.log('🏆 BEST OPPORTUNITY TODAY');
    console.log('─'.repeat(70));
    console.log(`   Pair: ${best.pair}`);
    console.log(`   DEXes: ${best.dex1} → ${best.dex2}`);
    console.log(`   Spread: ${best.spreadPercent.toFixed(4)}%`);
    console.log(`   Profit: $${best.netProfitUSD.toFixed(2)} (${best.netProfitPercent.toFixed(2)}%)`);
    console.log(`   Time: ${best.time}`);
    console.log('');
  }
  
  // Top pairs
  const topPairs = Object.entries(allStats.topPairs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  if (topPairs.length > 0) {
    console.log('🔝 TOP PAIRS TODAY');
    console.log('─'.repeat(70));
    topPairs.forEach(([pair, count], index) => {
      console.log(`   ${index + 1}. ${pair.padEnd(25, ' ')} ${String(count).padStart(4, ' ')} opportunities`);
    });
    console.log('');
  }
  
  // Top pairs last hour
  const hourTopPairs = Object.entries(hourStats.topPairs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  if (hourTopPairs.length > 0) {
    console.log('⚡ TOP PAIRS (Last Hour)');
    console.log('─'.repeat(70));
    hourTopPairs.forEach(([pair, count], index) => {
      console.log(`   ${index + 1}. ${pair.padEnd(25, ' ')} ${String(count).padStart(4, ' ')} opportunities`);
    });
    console.log('');
  }
  
  // Projections
  if (allStats.total > 10) {
    const hoursRunning = allStats.total > 0 && allData.length > 1
      ? (allData[allData.length - 1].timestamp - allData[0].timestamp) / 1000 / 60 / 60
      : 1;
    const oppsPerHour = allStats.total / hoursRunning;
    const profitPerHour = allStats.totalProfit / hoursRunning;
    
    const projected24h = profitPerHour * 24;
    const projectedWeek = profitPerHour * 24 * 7;
    const projectedMonth = profitPerHour * 24 * 30;
    
    console.log('💡 PROJECTIONS (based on current rate)');
    console.log('─'.repeat(70));
    console.log(`   Opportunities/Hour: ${oppsPerHour.toFixed(1)}`);
    console.log(`   Profit/Hour: $${profitPerHour.toFixed(2)}`);
    console.log(`   24-Hour Projection: $${projected24h.toFixed(2)}`);
    console.log(`   Weekly Projection: $${projectedWeek.toFixed(2)}`);
    console.log(`   Monthly Projection: $${projectedMonth.toFixed(2)}`);
    console.log('');
  }
  
  // Status
  console.log('═'.repeat(70));
  console.log(`📁 Data file: logs/opportunities_${getDateStr()}.json`);
  console.log('💡 Press Ctrl+C to stop monitoring');
  console.log('');
}

function main() {
  console.log('\n🚀 Starting live monitor...\n');
  console.log('Waiting for data...\n');
  
  // Start monitoring loop
  const interval = setInterval(() => {
    const allData = loadLatestData();
    const lastHourData = getLastHourData(allData);
    
    if (allData.length === 0) {
      console.clear();
      console.log('\n⏳ Waiting for bot to log opportunities...');
      console.log('   Make sure the bot is running: npm run bot\n');
      return;
    }
    
    displayDashboard(allData, lastHourData);
  }, REFRESH_INTERVAL);
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    clearInterval(interval);
    console.log('\n👋 Live monitor stopped\n');
    process.exit(0);
  });
}

if (require.main === module) {
  main();
}
