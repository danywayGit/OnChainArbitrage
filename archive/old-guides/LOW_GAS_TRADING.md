# ⚡ Low Gas Trading - Quick Reference

## 🎯 Gas Cost Limits

**Maximum Total Gas Cost:** $10 per arbitrage trade

**Per DEX Limits:**
- ✅ Curve: ~$0.50 - $1.50 (stablecoin specialist)
- ✅ QuickSwap: ~$0.50 - $2.00 (most popular)
- ✅ SushiSwap: ~$0.50 - $2.00 (good alternative)
- ⚠️ Uniswap V3: ~$1.00 - $4.00 (complex)
- ❌ Balancer: ~$2.00 - $5.00 (too expensive)

---

## 🔍 Recommended DEX Combinations

### **Best for Low Gas:**
1. **Curve ↔ QuickSwap** (stablecoins only)
   - Total gas: ~$1.50 - $3.50
   - Best for: USDC/USDT/DAI pairs

2. **QuickSwap ↔ SushiSwap**
   - Total gas: ~$1.00 - $4.00
   - Best for: All token pairs

3. **Curve ↔ SushiSwap** (stablecoins)
   - Total gas: ~$1.50 - $3.50
   - Best for: USDC/USDT/DAI pairs

### **Avoid for Arbitrage:**
- ❌ Balancer ↔ Anything (gas too high)
- ❌ Uniswap V3 ↔ Uniswap V3 (complex positions)

---

## 💰 Profitability Checklist

For a trade to execute, ALL must be true:

✅ **Spread > Total Fees**
```
Price spread: 2.0%
Total fees: 0.69% (DEX 0.6% + Flash 0.09%)
✅ 2.0% > 0.69% ✓
```

✅ **Gas Cost < Gross Profit**
```
Gross profit: $8.00
Gas cost: $2.50
✅ $8.00 > $2.50 ✓
```

✅ **Net Profit > $1.00**
```
Gross profit: $8.00
- Gas cost: $2.50
= Net: $5.50
✅ $5.50 > $1.00 ✓
```

---

## 📊 Gas Cost by Network

### **Polygon (Current Network)** ⭐ BEST
- Gas price: 50-300 Gwei
- Trade cost: $0.50 - $5.00
- Flash loan + 2 swaps: ~500k gas units
- **Status:** ✅ Optimal for arbitrage

### **Ethereum Mainnet** ❌ EXPENSIVE
- Gas price: 20-100 Gwei
- Trade cost: $20 - $200+
- **Status:** ❌ Not profitable for small arbitrage

### **BSC** ✅ Cheap Alternative
- Gas price: 3-5 Gwei
- Trade cost: $0.20 - $1.00
- **Status:** ✅ Good alternative

### **Arbitrum** ✅ Good Option
- Gas price: 0.1-1 Gwei
- Trade cost: $0.10 - $2.00
- **Status:** ✅ Very cheap, good for testing

---

## 🚀 Running the Bot

```bash
# Test with gas filtering enabled
npm run bot
```

**What you'll see:**

### ✅ Accepted Trades
```
💱 WMATIC/USDC: DEX1=0.1886 | DEX2=0.1916 | Diff=1.555%
✅ DEX pair efficient! Estimated gas cost: $1.89
🔀 Buy DEX: QuickSwap → Router: 0xa5E0...
🔀 Sell DEX: SushiSwap → Router: 0x1b02...
📊 Profitability Analysis:
   spread: 155 bps
   totalFees: 69 bps
   netProfitBps: 86 bps
   netProfit: $3.21
✅ Trade IS profitable! Estimated net profit: $3.21
```

### ❌ Rejected Trades (Normal!)
```
💱 WETH/USDC: DEX1=3846.60 | DEX2=3858.67 | Diff=0.314%
❌ DEX pair rejected: Balancer gas cost ($4.50) too high
   Estimated total gas: $8.90
```

```
💱 LINK/WMATIC: DEX1=83.18 | DEX2=84.60 | Diff=1.71%
✅ DEX pair efficient! Estimated gas cost: $1.45
❌ Trade NOT profitable: Gas cost ($1.45) > Gross profit ($1.20)
```

---

## ⚙️ Adjusting Gas Limits

Edit `src/dexRouter.ts`:

```typescript
// Line ~95: Change maximum gas cost
export function isDexAcceptable(
  dexName: string, 
  currentGasPrice: bigint,
  maxGasCostUsd: number = 10.0  // ← Change this
)
```

**Options:**
- `5.0` - Very strict (fewer opportunities, higher quality)
- `10.0` - Current setting (balanced)
- `15.0` - Relaxed (more opportunities, lower profit margin)

---

## 🎯 Best Practices

### **1. Start Conservative**
- Gas limit: $10
- Min profit: $1
- Trade size: $100-500
- **Watch for 24 hours to see opportunity frequency**

### **2. Focus on High-Volume Pairs**
```typescript
// In src/config.ts, enable only:
WMATIC/USDC  ← Highest volume
WETH/USDC
USDC/USDT    ← Use Curve!
DAI/USDC     ← Use Curve!
```

### **3. Monitor Gas Prices**
```bash
# Check Polygon gas tracker
https://polygonscan.com/gastracker
```

**If gas > 300 Gwei:**
- Most arbitrage becomes unprofitable
- Consider pausing bot
- Wait for gas to drop

### **4. Optimize Trade Size**
```
Small trade ($100): Gas eats 50-100% of profit
Medium trade ($500): Gas eats 10-30% of profit  ← Sweet spot
Large trade ($2000): Slippage eats profit
```

---

## 📈 Expected Results

### **After 24 Hours:**

**Opportunities Detected:** 50-200
**Gas Cost Filtered Out:** 40-180 (80-90%)
**Profit Check Failed:** 5-15 (10-15%)
**Potentially Profitable:** 1-5 (1-3%)

**Why so few?**
- MEV bots front-run most opportunities
- Price updates faster than detection
- Real slippage > estimated slippage
- Competition is FIERCE

### **Realistic Profits:**

**Daily (Polygon):**
- Trades executed: 1-3
- Avg profit per trade: $2-8
- Daily profit: $2-24
- Gas costs: $3-9
- **Net daily: -$1 to +$15**

**Monthly (if profitable):**
- Good days: $50-150
- Break-even days: $0
- Loss days: -$10 to -$50
- **Net monthly: $0-500** (before considering time investment)

---

## 💡 When Gas Costs Are Too High

### **Signs to Stop/Pause:**

1. **Polygon gas > 500 Gwei**
   - Most trades unprofitable
   - Wait for network congestion to clear

2. **All opportunities rejected for gas**
   - Network too expensive
   - Switch to cheaper network (BSC, Arbitrum)

3. **Net profit consistently < $2**
   - Not worth the risk
   - Consider other strategies

### **Alternatives When Gas Is High:**

1. **Manual Statistical Arbitrage**
   - Wait for spread > 3%
   - Execute manually
   - Lower frequency, higher quality

2. **Cross-Chain Arbitrage**
   - Polygon → BSC via bridge
   - Higher spreads (2-5%)
   - Lower competition

3. **Liquidation Bot**
   - Monitor Aave positions
   - Liquidate when health factor < 1.0
   - 5-10% profit per liquidation
   - Less gas sensitive

---

## 🔧 Troubleshooting

### **"All trades rejected for gas"**
✅ **Normal if Polygon gas > 300 Gwei**
- Check: https://polygonscan.com/gastracker
- Solution: Wait for gas to drop or increase limit

### **"No opportunities found"**
✅ **Normal during low volatility**
- Market is efficient
- Spreads too small
- Wait for market movement

### **"Trade profitable but still rejected"**
⚠️ **Check logs for reason:**
```
❌ DEX pair rejected: Total gas cost ($12.34) exceeds $10 limit
```
- Solution: Increase gas limit or wait for cheaper gas

---

## 📞 Quick Commands

```bash
# Run bot
npm run bot

# Check compilation
npm run build

# View recent logs
cat logs/opportunities_$(date +%Y-%m-%d).json

# Monitor gas prices
curl -s https://api.polygonscan.com/api?module=gastracker
```

---

## 🎯 Success Metrics

**Bot is working correctly if:**
- ✅ Rejects 80-95% of opportunities (this is GOOD!)
- ✅ Only executes when net profit > $1
- ✅ Uses different DEXes for buy/sell
- ✅ Total gas < $10 per trade

**Bot needs tuning if:**
- ❌ Rejects 100% of opportunities (too strict)
- ❌ Executes losing trades (not strict enough)
- ❌ Gas costs > $10 frequently (wrong DEXes)

---

Remember: **Fewer, profitable trades > Many losing trades!** 🎯
