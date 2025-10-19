# ⏰ 4-Hour Auto-Update Quick Reference

## 🚀 How It Works

Your bot now **automatically updates trading pairs every 4 hours**!

```
Bot Start → Immediate Update → Wait 4h → Update → Wait 4h → Update → ...
```

## 📝 What Happens Every 4 Hours

1. ✅ Queries QuickSwap + SushiSwap for live prices
2. ✅ Calculates spreads for all candidate pairs
3. ✅ Filters out fake pools (> 2% spread)
4. ✅ Excludes top 15 tokens (WBTC, LINK, AAVE, UNI)
5. ✅ Respects user exclusions (WETH/USDT, WETH/USDC, DAI/USDC)
6. ✅ Updates `data/trading-pairs.json`
7. ✅ Bot hot-reloads pairs (no restart needed!)

## 🎮 Commands

```bash
# Start bot (auto-updates enabled)
npm run bot

# Run manual update anytime
node scripts/auto-update-pairs.js

# Run standalone continuous updater
node scripts/run-pair-updater.js

# Check last update time
cat data/trading-pairs.json | grep lastUpdated
```

## 📊 Monitoring

### Check Scheduler Status
Look for these logs when bot starts:
```
⏰ Starting pair update scheduler (every 4 hours)...
[SCHEDULER] 🔄 Running pair update #1...
[SCHEDULER] ✅ Update complete! 6 pairs loaded
```

### Check Current Pairs
```bash
cat data/trading-pairs.json
```

### View Update History
```bash
cat logs/pair-updater.log  # If using standalone updater
```

## ⚙️ Configuration

### Change Update Frequency

**Option 1:** Edit `src/pairScheduler.ts` (line 165)
```typescript
schedulerInstance = new PairUpdateScheduler(6); // 6 hours instead of 4
```

**Option 2:** Edit `scripts/run-pair-updater.js` (line 25)
```javascript
const UPDATE_INTERVAL_HOURS = 6; // 6 hours instead of 4
```

Then rebuild:
```bash
npm run build
```

### Add More Candidate Pairs

Edit `scripts/auto-update-pairs.js` (lines 47-56):
```javascript
const CANDIDATE_PAIRS = [
  { name: 'WMATIC/DAI', token0: 'WMATIC', token1: 'DAI' },
  // Add more here:
  { name: 'CRV/USDC', token0: 'CRV', token1: 'USDC' },
];
```

Don't forget to add token addresses (lines 32-43):
```javascript
const TOKENS = {
  // ... existing tokens
  CRV: '0x172370d5Cd63279eFa6d502DAB29171933a610AF',
};
```

### Modify Exclusion List

Edit `scripts/auto-update-pairs.js` (lines 26-30):
```javascript
const USER_EXCLUSIONS = [
  'WETH/USDT',
  'WETH/USDC',
  'DAI/USDC',
  // Add more:
  'GHST/USDC',
];
```

## 🔧 Troubleshooting

### Pairs Not Updating?
```bash
# 1. Check file exists
ls data/trading-pairs.json

# 2. Run manual update
node scripts/auto-update-pairs.js

# 3. Check for errors in bot logs
```

### Want to Force Update Now?
```bash
# While bot is running, in another terminal:
node scripts/auto-update-pairs.js

# Bot will auto-reload within 1-2 seconds!
```

### Update Script Failing?
```bash
# Test with verbose output
node scripts/auto-update-pairs.js

# Common issues:
# - RPC rate limiting → Add delays
# - Missing token addresses → Add to TOKENS object
# - Network timeout → Check internet
```

## 📈 Expected Results

### On Bot Startup
```
[DYNAMIC] ✅ Loaded 6 pairs from trading-pairs.json
[SCHEDULER] 🔄 Running pair update #1...
✅ Enabled pairs: 6
```

### Every 4 Hours
```
[SCHEDULER] 🔄 Running pair update #2 at 2025-10-18T18:00:00.000Z
[SCHEDULER] ✅ Update complete! 6 pairs loaded
[DYNAMIC] 🔃 Reloading trading pairs...
```

### Current Pairs (After Verification)
- ✅ WMATIC/DAI (0.02% spread)
- ✅ MAI/USDC (0.02% spread)
- ✅ WMATIC/USDT (0.04% spread)
- ✅ WMATIC/USDC (0.06% spread)
- ✅ WMATIC/WETH (0.23% spread)
- ✅ GHST/USDC (1.71% spread)

### Excluded Pairs
- ❌ WETH/USDT (user exclusion)
- ❌ WETH/USDC (user exclusion)
- ❌ DAI/USDC (user exclusion)
- ❌ WBTC/USDC (top 15 + fake pool)
- ❌ LINK/USDC (top 15 + fake pool)
- ❌ AAVE/USDC (top 15 + fake pool)
- ❌ UNI/USDC (top 15 + fake pool)

## 🎯 Benefits

✅ **Always Fresh:** Pairs verified every 4 hours  
✅ **No Restart:** Bot hot-reloads automatically  
✅ **Fake Pool Filter:** Auto-removes suspicious pairs  
✅ **MEV Avoidance:** Auto-excludes top 15 tokens  
✅ **User Control:** Respects manual exclusions  
✅ **Audit Trail:** All updates logged  
✅ **Error Recovery:** Continues on failures  

## 📞 Need Help?

See full documentation: `DYNAMIC-PAIRS-GUIDE.md`

---

**Status:** ✅ Auto-updates enabled!  
**Frequency:** Every 4 hours  
**Last update:** Check `data/trading-pairs.json`
