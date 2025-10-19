# 🔄 Dynamic Pair Management System

## Overview

The bot now has **fully dynamic pair management** with automatic updates every 4 hours! 

**No more hardcoded pairs in config.ts** - pairs are loaded from an external JSON file that gets automatically refreshed.

---

## 📁 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    ARBITRAGE BOT                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │  src/bot.ts                                        │ │
│  │  ├─ Starts pairScheduler (every 4h)                │ │
│  │  └─ Loads pairs from dynamicPairs.ts               │ │
│  └────────────────────────────────────────────────────┘ │
│                          │                               │
│                          ▼                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │  src/pairScheduler.ts                              │ │
│  │  ├─ Runs auto-update-pairs.js every 4 hours        │ │
│  │  ├─ Hot-reloads pairs without bot restart          │ │
│  │  └─ Logs all updates                               │ │
│  └────────────────────────────────────────────────────┘ │
│                          │                               │
│                          ▼                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │  scripts/auto-update-pairs.js                      │ │
│  │  ├─ Queries QuickSwap + SushiSwap                  │ │
│  │  ├─ Verifies liquidity for each pair               │ │
│  │  ├─ Filters fake pools (> 2% spread)               │ │
│  │  ├─ Excludes top 15 tokens                         │ │
│  │  ├─ Respects user exclusion list                   │ │
│  │  └─ Updates trading-pairs.json                     │ │
│  └────────────────────────────────────────────────────┘ │
│                          │                               │
│                          ▼                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │  data/trading-pairs.json                           │ │
│  │  {                                                  │ │
│  │    "lastUpdated": "2025-10-18T14:00:00Z",         │ │
│  │    "pairs": [                                      │ │
│  │      { "name": "WMATIC/USDC", "enabled": true },  │ │
│  │      ...                                           │ │
│  │    ]                                               │ │
│  │  }                                                  │ │
│  └────────────────────────────────────────────────────┘ │
│                          │                               │
│                          ▼                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │  src/dynamicPairs.ts                               │ │
│  │  ├─ Loads pairs from JSON                          │ │
│  │  ├─ Maps token symbols to addresses                │ │
│  │  ├─ Filters enabled pairs only                     │ │
│  │  └─ Falls back to config.ts if file missing        │ │
│  └────────────────────────────────────────────────────┘ │
│                          │                               │
│                          ▼                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │  src/priceMonitor.ts                               │ │
│  │  └─ Uses dynamic pairs for price monitoring        │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Usage

### Option 1: Automatic (Integrated into Bot)

**Default behavior** - scheduler runs automatically when bot starts:

```bash
npm run bot
```

Output:
```
✅ Bot started successfully!
⏰ Starting pair update scheduler (every 4 hours)...
[SCHEDULER] 🔄 Running pair update #1...
[SCHEDULER] ✅ Update complete! 6 pairs loaded
```

The bot will:
1. Run pair update immediately on startup
2. Refresh pairs every 4 hours automatically
3. Hot-reload pairs without restart
4. Continue trading with updated pairs

### Option 2: Standalone Continuous Updater

Run the updater as a separate process:

```bash
node scripts/run-pair-updater.js
```

This will:
- Run updates every 4 hours continuously
- Log to `logs/pair-updater.log`
- Survive bot restarts
- Can run as Windows service

### Option 3: Manual One-Time Update

Run the update script manually anytime:

```bash
node scripts/auto-update-pairs.js
```

This will:
- Verify all candidate pairs immediately
- Update `data/trading-pairs.json`
- Exit after completion
- Bot will auto-reload on next price check

---

## 📋 File Structure

### Core Files

| File | Purpose | Auto-Generated |
|------|---------|----------------|
| `data/trading-pairs.json` | Dynamic pair configuration | ✅ Yes (every 4h) |
| `src/dynamicPairs.ts` | Pair loader module | ❌ No |
| `src/pairScheduler.ts` | 4-hour scheduler | ❌ No |
| `scripts/auto-update-pairs.js` | Verification script | ❌ No |
| `scripts/run-pair-updater.js` | Standalone updater | ❌ No |

### Configuration

**data/trading-pairs.json** (auto-generated):
```json
{
  "lastUpdated": "2025-10-18T14:00:00Z",
  "updateFrequency": "daily",
  "source": "auto_verification",
  "criteria": {
    "excludeTop15": true,
    "maxSpread": 2.0,
    "minLiquidity": 300000,
    "verifiedDEXes": ["quickswap", "sushiswap"]
  },
  "pairs": [
    {
      "name": "WMATIC/USDC",
      "token0": "WMATIC",
      "token1": "USDC",
      "enabled": true,
      "verifiedSpread": 0.06,
      "reason": "Verified liquidity, realistic spread"
    }
  ],
  "excludedPairs": [
    {
      "name": "WETH/USDT",
      "reason": "User exclusion list"
    }
  ]
}
```

---

## ⚙️ Customization

### Change Update Frequency

**Method 1: In Bot (src/bot.ts)**
```typescript
// Change from 4 hours to 6 hours
const scheduler = new PairUpdateScheduler(6);
```

**Method 2: In Standalone Updater (scripts/run-pair-updater.js)**
```javascript
// Change UPDATE_INTERVAL_HOURS
const UPDATE_INTERVAL_HOURS = 6; // Was 4
```

### Add/Remove Candidate Pairs

Edit `scripts/auto-update-pairs.js`:

```javascript
const CANDIDATE_PAIRS = [
  { name: 'WMATIC/DAI', token0: 'WMATIC', token1: 'DAI' },
  { name: 'WMATIC/USDC', token0: 'WMATIC', token1: 'USDC' },
  // Add your pairs here:
  { name: 'CRV/USDC', token0: 'CRV', token1: 'USDC' },
];
```

Don't forget to add token addresses if missing:

```javascript
const TOKENS = {
  // ... existing tokens
  CRV: '0x172370d5Cd63279eFa6d502DAB29171933a610AF',
};
```

### Modify User Exclusion List

Edit `scripts/auto-update-pairs.js`:

```javascript
const USER_EXCLUSIONS = [
  'WETH/USDT',
  'WETH/USDC',
  'DAI/USDC',
  // Add more exclusions:
  'GHST/USDC',
];
```

### Adjust Fake Pool Filter

Edit `scripts/auto-update-pairs.js`:

```javascript
// Change spread threshold (currently 2%)
if (spread > 5) { // More lenient
  console.log(`   ❌ FAKE POOL! Spread: ${spread.toFixed(2)}%`);
  return { ... };
}
```

---

## 🔍 Monitoring

### Check Scheduler Status

The bot logs scheduler activity:

```
[SCHEDULER] ⏰ Pair update scheduler initialized (every 4 hours)
[SCHEDULER] 🚀 Starting pair update scheduler...
[SCHEDULER] 🔄 Running pair update #1 at 2025-10-18T14:00:00.000Z
[SCHEDULER] ✅ Update complete! 6 pairs loaded
```

### View Update History

Check the standalone updater log:

```bash
cat logs/pair-updater.log
```

### Check Last Update Time

```bash
# On Windows (PowerShell)
Get-Content data\trading-pairs.json | Select-String "lastUpdated"

# Output:
#   "lastUpdated": "2025-10-18T14:00:00.000Z",
```

### Force Manual Update

While bot is running:

```typescript
import { getScheduler } from './pairScheduler';

const scheduler = getScheduler();
await scheduler.forceUpdate();
```

---

## 🪟 Windows Task Scheduler (Alternative)

If you want system-level scheduling instead of in-bot scheduling:

### Create Scheduled Task

1. Open **Task Scheduler** (search in Start menu)
2. Click **Create Basic Task**
3. Name: "Arbitrage Pair Updater"
4. Trigger: **Daily** at 2:00 AM
5. Action: **Start a program**
   - Program: `node.exe`
   - Arguments: `C:\Users\YourUser\Documents\Git\DanywayGit\OnChainArbitrage\scripts\auto-update-pairs.js`
   - Start in: `C:\Users\YourUser\Documents\Git\DanywayGit\OnChainArbitrage`
6. Click **Finish**

### Make it Run Every 4 Hours

After creating:
1. Right-click task → **Properties**
2. **Triggers** tab → Edit trigger
3. Check **Repeat task every: 4 hours**
4. Check **for a duration of: Indefinitely**
5. Click **OK**

---

## 📊 Expected Behavior

### On Bot Startup

```
Bot started successfully!
⏰ Starting pair update scheduler (every 4 hours)...
[DYNAMIC] ✅ Loaded 6 pairs from trading-pairs.json
[SCHEDULER] 🔄 Running pair update #1...

🔍 Testing WMATIC/DAI...
   ✅ VALID! Spread: 0.0200%
🔍 Testing WMATIC/USDC...
   ✅ VALID! Spread: 0.0600%
...

✅ Enabled pairs: 6
[SCHEDULER] ✅ Update complete! 6 pairs loaded
Monitoring for arbitrage opportunities...
```

### Every 4 Hours

```
[SCHEDULER] 🔄 Running pair update #2 at 2025-10-18T18:00:00.000Z
[SCHEDULER] 📜 Executing: scripts/auto-update-pairs.js
...
[SCHEDULER] ✅ Update complete! 6 pairs loaded
[DYNAMIC] 🔃 Reloading trading pairs...
[DYNAMIC] ✅ Loaded 6 pairs from trading-pairs.json
```

### If Update Fails

```
[SCHEDULER] ❌ Update script failed with code 1
[SCHEDULER] Error output: Connection timeout...
[SCHEDULER] ⚠️  Will retry in 4 hours
```

Bot continues running with existing pairs - no interruption!

---

## 🛠️ Troubleshooting

### Pairs Not Updating

**Check scheduler is running:**
```bash
# Look for this in bot output:
⏰ Starting pair update scheduler (every 4 hours)...
```

**If not running**, check `src/bot.ts` has:
```typescript
import { startScheduler } from "./pairScheduler";
// ...
startScheduler();
```

### Update Script Fails

**Common causes:**
1. **RPC rate limiting** - Add delay between requests
2. **Network timeout** - Check internet connection
3. **Missing token addresses** - Add them to `TOKENS` object

**Debug with manual run:**
```bash
node scripts/auto-update-pairs.js
```

### Pairs Not Loading

**Check file exists:**
```bash
ls data/trading-pairs.json
```

**If missing**, run manual update:
```bash
node scripts/auto-update-pairs.js
```

**Check file is valid JSON:**
```bash
# On PowerShell
Get-Content data\trading-pairs.json | ConvertFrom-Json
```

### Bot Using Old Pairs

**Force reload** by restarting bot:
```bash
# Stop bot (Ctrl+C)
npm run bot
```

Or wait for next 4-hour update cycle.

---

## 🎯 Best Practices

### 1. Monitor Update Success Rate
```bash
# Check logs for failures
grep "❌" logs/pair-updater.log
```

### 2. Adjust Update Frequency Based on Conditions

- **High volatility:** Update every 2 hours
- **Stable markets:** Update every 6-8 hours
- **Testing:** Update every 30 minutes

### 3. Keep Token List Updated

When adding new pairs, add token addresses:

```javascript
// scripts/auto-update-pairs.js
const TOKENS = {
  // ... existing
  NEWTOKEN: '0x...', // Add here!
};
```

### 4. Review Exclusion Lists Regularly

```bash
# Check what's currently excluded
cat data/trading-pairs.json | grep "excludedPairs" -A 20
```

### 5. Backup Configuration

```bash
# Backup before major changes
cp data/trading-pairs.json data/trading-pairs.backup.json
```

---

## 🚦 Summary

✅ **Automatic Updates:** Every 4 hours by default  
✅ **Hot Reload:** No bot restart needed  
✅ **Fake Pool Filter:** Rejects > 2% spreads  
✅ **Top 15 Exclusion:** Avoids MEV competition  
✅ **User Exclusions:** Respects manual exclusions  
✅ **Fallback:** Uses config.ts if JSON missing  
✅ **Logging:** Full audit trail of all updates  
✅ **Error Recovery:** Continues on failures  

**Result:** Fully dynamic, self-maintaining pair selection! 🎉
