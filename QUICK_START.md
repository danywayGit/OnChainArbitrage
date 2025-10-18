# ⚡ QUICK START GUIDE

**Goal:** Get the bot running in under 5 minutes.

---

## 🚀 FASTEST PATH TO RUNNING

### 1. Check Prerequisites ✅

You should already have:
- ✅ Node.js installed
- ✅ Dependencies installed (`npm install`)
- ✅ `.env` file configured
- ✅ Contract deployed on Polygon: `0x671A158DA6248e965698726ebb5e3512AF171Af3`
- ✅ 39.90 MATIC in wallet for gas

### 2. Validate Configuration (30 seconds)

```powershell
# Validate 83 tokens
node scripts/validate-tokens.js

# Check TypeScript compilation
npx tsc --noEmit
```

Both should pass with ✅ no errors.

### 3. Start the Bot (DRY RUN) 🤖

```powershell
npm run bot
```

**What you'll see:**
```
🤖 Arbitrage Bot Starting...
📊 Configuration:
   Network: Polygon (chainId: 137)
   Contract: 0x671A158DA6248e965698726ebb5e3512AF171Af3
   Dry Run: true ✅
   Tokens: 83
   Pairs: 24

🔍 Monitoring prices...
💰 Opportunity found: WETH/USDC
   Buy: QuickSwap @ $2500.00
   Sell: SushiSwap @ $2512.00
   Spread: 0.48%
   Profit: $12.00
   ⚠️  DRY RUN - Simulated only
```

### 4. Monitor in Real-Time (Optional) 📊

Open a **second terminal**:

```powershell
node scripts/monitor-live.js
```

Refreshes every 5 seconds with live stats.

---

## 📝 WHAT HAPPENS NEXT

### During 24-Hour Test:
- Bot monitors prices continuously
- Logs every opportunity to `logs/` folder
- Auto-saves every 5 minutes
- No real trades (dry run mode)
- Zero cost, zero risk

### After 24 Hours:

```powershell
# Analyze collected data
node scripts/analyze-data.js
```

**You'll see:**
- Total opportunities found
- Best trading pairs
- Profit potential
- Best times to trade
- Recommendations

---

## 🎯 BASED ON RESULTS

### If Profitable ✅
1. Add slippage protection to contract
2. Set `ENABLE_DRY_RUN=false` in `.env`
3. Start with small trades ($50-100)
4. Monitor closely
5. Scale up gradually

### If Not Profitable ❌
1. Adjust `minProfitBps` in config
2. Enable more trading pairs
3. Try different DEX combinations
4. Test another 24 hours

---

## ⚙️ QUICK COMMANDS

```powershell
# Start bot (dry run)
npm run bot

# Real-time monitor
node scripts/monitor-live.js

# Analyze data
node scripts/analyze-data.js

# Generate more pairs
node scripts/generate-pairs.js --top=50

# Validate tokens
node scripts/validate-tokens.js

# Check build
npm run build
```

---

## 🆘 TROUBLESHOOTING

### Bot won't start
```powershell
# Rebuild
npm run build

# Check errors
npx tsc --noEmit
```

### No opportunities found
- **Normal!** Polygon is efficient
- Wait longer (12-24 hours)
- Try more pairs
- Lower `minProfitBps` threshold

### RPC errors
- Check `.env` has correct Alchemy API key
- Verify internet connection
- Try restarting bot

---

## 📚 NEED MORE DETAIL?

- **Full Status:** Read `PROJECT_STATUS.md`
- **Configuration:** See `src/config.ts`
- **Data Logging:** Check `DATA_COLLECTION_GUIDE.md`
- **Pair Setup:** Review `PAIR_GENERATION_GUIDE.md`

---

## 🎯 TL;DR

```powershell
# Validate
node scripts/validate-tokens.js

# Start bot
npm run bot

# Wait 24 hours

# Analyze
node scripts/analyze-data.js

# Decide: Go live or optimize
```

**That's it!** 🚀

---

**Current Status:** ✅ Ready to start 24-hour test

**Next Action:** `npm run bot`
