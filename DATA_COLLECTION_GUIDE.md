# 📊 Data Collection & Analysis Guide

## Overview

Your arbitrage bot now includes **comprehensive data logging** to track every opportunity over time. This allows you to:

- ✅ Analyze profitability patterns by hour, day, and week
- ✅ Identify the most profitable trading pairs
- ✅ Optimize DEX combinations
- ✅ Determine best trading times
- ✅ Make data-driven decisions

---

## 🎯 How It Works

### Automatic Data Logging

When you run the bot, it **automatically logs** every arbitrage opportunity to:

1. **JSON file** (`logs/opportunities_YYYY-MM-DD.json`)
   - Full structured data
   - Easy to parse programmatically
   - Includes all opportunity details

2. **CSV file** (`logs/opportunities_YYYY-MM-DD.csv`)
   - Spreadsheet format
   - Open in Excel/Google Sheets
   - Easy sorting and filtering

3. **Stats file** (`logs/stats_YYYY-MM-DD.json`)
   - Daily summary statistics
   - Hourly/pair/DEX distributions
   - Best opportunities

### Data Collected for Each Opportunity

```typescript
{
  // Timing
  timestamp: 1729267200000,
  date: "2025-10-18",
  time: "14:23:45",
  hour: 14,
  dayOfWeek: "Saturday",
  
  // Trading Pair
  pair: "WETH/USDC",
  token0: "WETH",
  token1: "USDC",
  
  // Prices & Spread
  dex1: "QuickSwap",
  dex2: "Uniswap V3",
  price1: "2000.50",
  price2: "2015.30",
  spreadPercent: 0.74,
  
  // Trade Details
  tradeAmount: "1000",
  tradeAmountUSD: 1000,
  expectedProfit: "7.40",
  expectedProfitUSD: 7.40,
  profitPercent: 0.74,
  
  // Gas & Fees
  gasPrice: "30000000000",
  gasCostUSD: 0.05,
  flashLoanFee: "0.50",
  flashLoanFeeUSD: 0.50,
  
  // Net Profit
  netProfit: "6.85",
  netProfitUSD: 6.85,
  netProfitPercent: 0.685,
  
  // Execution
  executed: false,
  executionStatus: "simulated",
  
  // Market Conditions
  blockNumber: 52418900,
  network: "polygon"
}
```

---

## 🚀 Running the Bot with Data Collection

### Start Bot (Dry Run Mode)
```bash
npm run bot
```

The bot will:
- ✅ Monitor for opportunities
- ✅ Log every opportunity to `./logs/`
- ✅ Auto-save every 5 minutes
- ✅ Generate final report on shutdown (Ctrl+C)

### What You'll See

**During Operation:**
```
📊 Data logger initialized
   Logs directory: ./logs/
   Opportunities file: opportunities_2025-10-18.json

⏱️  Checking prices... (Scan 1)
💰 Opportunity found! WETH/USDC (QuickSwap → Uniswap V3)
   Spread: 0.74% | Est. Profit: $7.40 | Net Profit: $6.85
   
💾 Saved 15 opportunities to disk  # Auto-save every 5 min

⏱️  Checking prices... (Scan 2)
...
```

**On Shutdown (Ctrl+C):**
```
╔═══════════════════════════════════════════════════════════════════╗
║                     ARBITRAGE BOT DAILY REPORT                    ║
╚═══════════════════════════════════════════════════════════════════╝

📅 Date: 2025-10-18
⏱️  Runtime: 24h 0m

📊 OPPORTUNITIES FOUND
   Total: 1,247
   Profitable: 823 (66.0%)
   Unprofitable: 424

💰 PROFITABILITY
   Total Potential Profit: $4,127.50
   Average Profit: $5.02
   Average Spread: 0.45%

🏆 BEST OPPORTUNITY
   Pair: AAVE/WETH
   DEXes: QuickSwap → SushiSwap
   Spread: 2.34%
   Profit: $23.50 (2.35%)
   Time: 14:23:45

🔝 TOP PAIRS (by opportunities)
   1. WETH/USDC: 234 opportunities
   2. WMATIC/USDC: 187 opportunities
   3. AAVE/WETH: 156 opportunities
   4. LINK/USDC: 143 opportunities
   5. UNI/WETH: 127 opportunities

🔄 TOP DEX COMBINATIONS
   1. QuickSwap/Uniswap V3: 412 opportunities
   2. SushiSwap/QuickSwap: 289 opportunities
   3. Uniswap V3/SushiSwap: 234 opportunities
   
⏰ OPPORTUNITIES BY HOUR (UTC)
   00:█████████(42)  01:███████(35)   02:████(18)    ...
   
📁 DATA FILES
   JSON: opportunities_2025-10-18.json
   CSV: opportunities_2025-10-18.csv
   Stats: stats_2025-10-18.json
```

---

## 📈 Analyzing Your Data

### Method 1: Quick Analysis Script

```bash
# Analyze today's data
node scripts/analyze-data.js

# Analyze specific date
node scripts/analyze-data.js 2025-10-18
```

**Output:**
```
╔═══════════════════════════════════════════════════════════════════╗
║              ARBITRAGE OPPORTUNITY ANALYSIS REPORT                ║
╚═══════════════════════════════════════════════════════════════════╝

📅 Date: 2025-10-18
📊 Total Opportunities: 1,247

💰 PROFITABILITY OVERVIEW
─────────────────────────────────────────────────────────────────────
   Profitable Opportunities: 823 (66.0%)
   Total Potential Profit: $4,127.50
   Average Profit per Opp: $5.02
   Average Spread: 0.45%

🏆 BEST OPPORTUNITY
─────────────────────────────────────────────────────────────────────
   Pair: AAVE/WETH
   DEXes: QuickSwap → SushiSwap
   Spread: 2.34%
   Profit: $23.50 (2.35%)
   Time: 14:23:45

⏰ OPPORTUNITIES BY HOUR (UTC)
─────────────────────────────────────────────────────────────────────
   Top 5 Most Profitable Hours:
   1. 14:00 - 87 opps, $523.40 profit
   2. 09:00 - 73 opps, $412.80 profit
   3. 16:00 - 68 opps, $387.20 profit
   4. 11:00 - 64 opps, $356.90 profit
   5. 13:00 - 59 opps, $334.10 profit

   Hourly Distribution:
   00:████████████(42) 01:██████████(35) 02:█████(18) ...

🔝 TOP TRADING PAIRS
─────────────────────────────────────────────────────────────────────
   By Total Profit:
    1. WETH/USDC          - 234 opps, $ 1245.80, 72% profitable
    2. WMATIC/USDC        - 187 opps, $  823.40, 65% profitable
    3. AAVE/WETH          - 156 opps, $  712.30, 68% profitable
    4. LINK/USDC          - 143 opps, $  534.20, 58% profitable
    5. UNI/WETH           - 127 opps, $  456.70, 61% profitable

🔄 TOP DEX COMBINATIONS
─────────────────────────────────────────────────────────────────────
    1. QuickSwap/Uniswap V3       - 412 opps, $ 2134.50, 68% profitable
    2. SushiSwap/QuickSwap        - 289 opps, $ 1245.80, 64% profitable
    3. Uniswap V3/SushiSwap       - 234 opps, $  876.30, 62% profitable

💡 RECOMMENDATIONS
─────────────────────────────────────────────────────────────────────
   1. Focus on WETH/USDC pair (234 opportunities, $1245.80 profit)
   2. Best trading time: 14:00 UTC (87 opportunities)
   3. Top DEX combination: QuickSwap/Uniswap V3 (412 opportunities)
   4. ✅ Good profitability rate (66.0%)
```

### Method 2: Excel/Google Sheets Analysis

1. **Open CSV file:**
   ```
   logs/opportunities_2025-10-18.csv
   ```

2. **Import into Excel/Sheets**

3. **Use pivot tables to analyze:**
   - Opportunities by hour
   - Profitability by pair
   - Spread distribution
   - DEX performance

4. **Create charts:**
   - Line chart: Opportunities over time
   - Bar chart: Top profitable pairs
   - Heatmap: Hourly distribution

### Method 3: Custom Analysis

Load JSON data in any language:

**Python Example:**
```python
import json
import pandas as pd

# Load data
with open('logs/opportunities_2025-10-18.json') as f:
    data = json.load(f)

# Convert to DataFrame
df = pd.DataFrame(data)

# Analyze by hour
hourly = df.groupby('hour').agg({
    'netProfitUSD': ['count', 'sum', 'mean'],
    'spreadPercent': 'mean'
})

print(hourly)

# Find best pairs
best_pairs = df.groupby('pair')['netProfitUSD'].sum().sort_values(ascending=False)
print(best_pairs.head(10))
```

**JavaScript Example:**
```javascript
const fs = require('fs');

// Load data
const data = JSON.parse(
  fs.readFileSync('logs/opportunities_2025-10-18.json', 'utf8')
);

// Analyze by pair
const byPair = {};
data.forEach(opp => {
  if (!byPair[opp.pair]) {
    byPair[opp.pair] = { count: 0, profit: 0 };
  }
  byPair[opp.pair].count++;
  byPair[opp.pair].profit += opp.netProfitUSD;
});

// Sort by profit
const sorted = Object.entries(byPair)
  .sort((a, b) => b[1].profit - a[1].profit);

console.log('Top pairs:', sorted.slice(0, 10));
```

---

## 📊 Key Metrics to Track

### 1. Hourly Patterns
- **Best hours for trading** (most opportunities)
- **Most profitable hours** (highest total profit)
- **Peak activity times** (market volatility)

**Action:** Schedule bot to run during peak hours to maximize opportunities

### 2. Trading Pairs
- **Most frequent pairs** (high opportunity count)
- **Most profitable pairs** (highest total profit)
- **Success rate per pair** (% profitable)

**Action:** Focus configuration on top 10-20 pairs, disable unprofitable ones

### 3. DEX Combinations
- **Best DEX routes** (QuickSwap → Uniswap, etc.)
- **Most reliable combinations** (high success rate)
- **Fastest execution** (lowest slippage)

**Action:** Prioritize checking top DEX combinations first

### 4. Profitability Metrics
- **Average profit per opportunity** (should be >$2-5)
- **Profitable opportunity rate** (should be >50%)
- **Net profit after gas** (must be positive)

**Action:** Adjust `minProfitBps` and trade sizes based on data

### 5. Time-Based Trends
- **Day of week patterns** (weekday vs weekend)
- **Time-of-day patterns** (UTC hours)
- **Seasonal patterns** (over weeks/months)

**Action:** Optimize bot schedule based on historical patterns

---

## 🎯 Optimizing Based on Data

### After 24 Hours

1. **Run analysis:**
   ```bash
   node scripts/analyze-data.js
   ```

2. **Check profitability rate:**
   - If <50%: Increase `minProfitBps` or lower trade sizes
   - If >70%: Consider lowering `minProfitBps` to catch more

3. **Identify top 10 pairs:**
   - Disable pairs with <10 opportunities in 24h
   - Focus on pairs with >50 opportunities

4. **Optimize timing:**
   - Note top 3 hourly peaks
   - Consider running bot only during peak hours

### After 1 Week

1. **Compare daily reports:**
   ```bash
   node scripts/analyze-data.js 2025-10-18
   node scripts/analyze-data.js 2025-10-19
   node scripts/analyze-data.js 2025-10-20
   ```

2. **Identify consistent patterns:**
   - Which pairs are always profitable?
   - Which hours always have opportunities?
   - Which DEX combinations work best?

3. **Update configuration:**
   - Add more pairs if top pairs are saturated
   - Remove consistently unprofitable pairs
   - Adjust `minProfitBps` based on average spreads

4. **Scale up:**
   - If profitable consistently, increase trade sizes
   - Add more pairs from the 83-token list
   - Consider enabling live trading

### After 1 Month

1. **Long-term analysis:**
   - Monthly profit potential
   - Best/worst days
   - Seasonal patterns

2. **Performance optimization:**
   - A/B test different configurations
   - Optimize gas usage
   - Fine-tune profit thresholds

3. **Scaling decisions:**
   - Increase to 50-100 pairs if system can handle
   - Add more DEX integrations
   - Consider multiple instances

---

## 📁 File Structure

```
OnChainArbitrage/
├── logs/
│   ├── opportunities_2025-10-18.json  # Full data (JSON)
│   ├── opportunities_2025-10-18.csv   # Spreadsheet format
│   ├── stats_2025-10-18.json          # Daily summary
│   ├── opportunities_2025-10-19.json
│   ├── opportunities_2025-10-19.csv
│   └── ...
├── src/
│   └── dataLogger.ts                   # Data logging module
└── scripts/
    └── analyze-data.js                 # Analysis script
```

---

## 💡 Pro Tips

### 1. Backup Your Data
```bash
# Create weekly backups
tar -czf logs_backup_$(date +%Y%m%d).tar.gz logs/
```

### 2. Compare Multiple Days
```bash
# Quick comparison
for date in 2025-10-18 2025-10-19 2025-10-20; do
  echo "=== $date ==="
  node scripts/analyze-data.js $date | grep "Total Potential Profit"
done
```

### 3. Export to Google Sheets
1. Open Google Sheets
2. File → Import → Upload
3. Select `opportunities_YYYY-MM-DD.csv`
4. Create pivot tables and charts

### 4. Set Alerts
Create a script to alert you when certain conditions are met:
```javascript
// Alert if daily profit > $500
const data = JSON.parse(fs.readFileSync('logs/opportunities_2025-10-18.json'));
const totalProfit = data.reduce((sum, opp) => sum + opp.netProfitUSD, 0);
if (totalProfit > 500) {
  // Send notification (email, Telegram, etc.)
}
```

---

## 🎯 Expected Results

### 24-Hour Test Run (22 pairs)
- **Opportunities**: 500-1,000
- **Profitable**: 300-700 (50-70%)
- **Potential Profit**: $150-300
- **Files**: 3 (JSON, CSV, stats)
- **Size**: ~500KB-2MB

### 1-Week Run (22 pairs)
- **Opportunities**: 3,500-7,000
- **Profitable**: 2,100-4,900
- **Potential Profit**: $1,050-2,100
- **Files**: 21 (7 days × 3 formats)
- **Size**: ~3.5MB-14MB

### 1-Month Run (62 pairs)
- **Opportunities**: 50,000-150,000
- **Profitable**: 30,000-105,000
- **Potential Profit**: $15,000-52,500
- **Files**: 90 (30 days × 3 formats)
- **Size**: ~50MB-150MB

---

## ✅ Data Collection Checklist

### Before Starting
- [ ] Ensure `logs/` directory is writable
- [ ] Check disk space (1GB minimum recommended)
- [ ] Set correct timezone or use UTC
- [ ] Test analysis script: `node scripts/analyze-data.js`

### During Operation
- [ ] Bot runs uninterrupted for full 24 hours
- [ ] Monitor console for "💾 Saved X opportunities" messages
- [ ] Check `logs/` folder periodically to verify files are created
- [ ] Note any error messages or crashes

### After 24 Hours
- [ ] Stop bot with Ctrl+C (generates final report)
- [ ] Run analysis: `node scripts/analyze-data.js`
- [ ] Review CSV in Excel/Sheets
- [ ] Document insights in a text file
- [ ] Update `src/config.ts` based on findings

### Weekly Review
- [ ] Compare all daily reports
- [ ] Identify consistent patterns
- [ ] Update pair configuration
- [ ] Adjust profitability thresholds
- [ ] Decide on scaling strategy

---

## 🚀 Next Steps

1. **Start 24h test run:**
   ```bash
   npm run bot
   # Let it run for 24 hours
   # Press Ctrl+C after 24 hours
   ```

2. **Analyze the data:**
   ```bash
   node scripts/analyze-data.js
   ```

3. **Share your findings** and I'll help you optimize based on the data!

4. **Scale gradually:**
   - 24h test → Review → Adjust config
   - 1 week → Review → Add more pairs
   - 1 month → Review → Enable live trading

---

**Good luck with your 24-hour data collection! 🎉**

I'm looking forward to analyzing the results with you!
