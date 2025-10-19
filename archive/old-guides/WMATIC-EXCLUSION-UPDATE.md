# ✅ UPDATED CONFIGURATION - WMATIC/MATIC EXCLUDED

**Last Updated:** October 18, 2025 @ 18:26 UTC  
**Status:** ✅ All WMATIC and MATIC pairs excluded per user request

---

## 🚫 MAJOR EXCLUSION UPDATE

### User Requested Exclusion:
**ALL pairs containing WMATIC or MATIC are now excluded!**

**Reason:** User wants to avoid the native Polygon token (WMATIC/MATIC) for all trading pairs.

---

## ✅ CURRENTLY ENABLED PAIRS (3 Total)

All pairs verified with real liquidity on QuickSwap + SushiSwap:

1. **MAI/USDC** - 0.0184% spread
   - Alt stablecoin pair
   - Very tight spread
   - Good liquidity

2. **DAI/USDT** - 0.3854% spread  
   - Stablecoin pair
   - Reasonable spread
   - Verified liquidity

3. **WETH/DAI** - 0.6281% spread
   - ETH/stablecoin pair
   - Sub-1% spread
   - Good volume

---

## 🚫 EXCLUDED PAIRS

### User Exclusions:
- ❌ **ALL WMATIC/MATIC pairs** (native token exclusion)
  - WMATIC/DAI (was 0.0076%)
  - WMATIC/USDC (was 0.0798%)
  - WMATIC/USDT (was 0.0341%)
  - WMATIC/WETH (was 0.0027%)
  - WMATIC/WBTC
  - WMATIC/LINK
  - WMATIC/AAVE
  - WMATIC/UNI
  - WMATIC/MAI
  - WMATIC/GHST
  - WMATIC/CRV
  - WMATIC/SUSHI
  - ... (all other WMATIC/MATIC combinations)

- ❌ **WETH/USDT** (user exclusion list)
- ❌ **WETH/USDC** (user exclusion list)
- ❌ **DAI/USDC** (user exclusion list)

### Fake Pools (Auto-Excluded):
- ❌ **MAI/USDT** - 120,735% spread! (EXTREME fake pool)
- ❌ **GHST/DAI** - 29,846% spread! (EXTREME fake pool)
- ❌ **USDC/USDT** - 78.17% spread (fake pool)
- ❌ **GHST/USDT** - 141.28% spread (fake pool)
- ❌ **MAI/DAI** - 17.36% spread (suspicious)
- ❌ **GHST/USDC** - 2.38% spread (above 2% threshold)

### Top 15 Tokens (Auto-Excluded):
- ❌ WBTC, LINK, AAVE, UNI pairs

---

## 📊 CONFIGURATION DETAILS

### Exclusion Rules Applied:
1. ✅ **WMATIC/MATIC Exclusion** - ANY pair with WMATIC or MATIC token
2. ✅ **User Exclusion List** - Manually specified pairs
3. ✅ **Fake Pool Filter** - Spreads > 2% rejected
4. ✅ **Top 15 Filter** - High market cap tokens excluded
5. ✅ **Liquidity Check** - Must have pools on BOTH DEXes

### Verification Process:
```
Query QuickSwap → Get Price
Query SushiSwap → Get Price
Calculate Spread → If < 2% ✅ VALID
Check WMATIC → If contains ❌ EXCLUDE
Check User List → If in list ❌ EXCLUDE
Check Top 15 → If top token ❌ EXCLUDE
```

---

## 🔄 AUTO-UPDATE SCHEDULE

**Frequency:** Every 4 hours  
**Next Update:** Check bot logs for "[SCHEDULER]" messages

**What happens every 4 hours:**
1. Queries live prices from QuickSwap + SushiSwap
2. Tests all candidate pairs (currently 12 pairs tested)
3. Filters out fake pools (> 2% spread)
4. Applies WMATIC/MATIC exclusion
5. Applies user exclusion list
6. Excludes top 15 tokens
7. Updates `data/trading-pairs.json`
8. Bot hot-reloads pairs automatically

---

## 📈 EXPECTED PERFORMANCE

### With 3 Enabled Pairs:

**API Usage:**
- Pairs: 3
- DEXes: 2 (QuickSwap + SushiSwap)
- Queries per scan: 3 × 2 = 6 queries
- Scans per second: 1
- Daily queries: 6 × 86,400 = 518,400
- Monthly: ~15.5M queries ✅ **Well within free tier (300M/month)**

**Opportunity Expectations:**
- **Very tight spreads:** 0.02%-0.6% natural spreads
- **Opportunities per day:** 5-15 (realistic estimate)
- **Success rate:** 2-5% (after MEV, gas costs)
- **Successful trades/day:** 0.1-0.75 (1 every 1-10 days)
- **Profit per trade:** $2-$10
- **Daily profit estimate:** $0.20-$7.50

**Note:** With only 3 pairs and such tight spreads, opportunities will be rare but potentially profitable. The tight spreads (< 1%) are good for avoiding fake pools but may not leave much room for profit after gas costs.

---

## 💡 RECOMMENDATIONS

### Option 1: Keep Current Configuration
✅ **Pros:**
- Very safe (only verified pairs)
- No WMATIC exposure
- Low API usage
- Tight spreads = less fake pools

❌ **Cons:**
- Very few opportunities (5-15/day)
- Low success rate (tight spreads)
- May need days/weeks to see profit

### Option 2: Add More Non-WMATIC Pairs
Consider testing:
- CRV/USDC (Curve token)
- SUSHI/USDC (SushiSwap token)
- LDO/USDC (Lido token)
- SAND/USDC (Sandbox token)
- MANA/USDC (Decentraland token)

**To add:** Edit `scripts/auto-update-pairs.js` CANDIDATE_PAIRS array

### Option 3: Relax Some Restrictions
If opportunities are too rare, consider:
- Remove WETH/USDC and WETH/USDT from exclusion list (both had ~1.1% spreads)
- This would add 2 more pairs with good liquidity
- Would increase opportunities to 15-30/day

---

## 🛠️ HOW TO MODIFY

### Add More Candidate Pairs

Edit `scripts/auto-update-pairs.js`:

```javascript
const CANDIDATE_PAIRS = [
  // Current pairs
  { name: 'MAI/USDC', token0: 'MAI', token1: 'USDC' },
  { name: 'DAI/USDT', token0: 'DAI', token1: 'USDT' },
  { name: 'WETH/DAI', token0: 'WETH', token1: 'DAI' },
  
  // Add new pairs here (must add token addresses below)
  { name: 'CRV/USDC', token0: 'CRV', token1: 'USDC' },
  { name: 'SUSHI/USDC', token0: 'SUSHI', token1: 'USDC' },
];

// Don't forget to add token addresses!
const TOKENS = {
  // ... existing tokens
  CRV: '0x172370d5Cd63279eFa6d502DAB29171933a610AF',
  SUSHI: '0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a',
};
```

### Remove WETH Exclusions

Edit `scripts/auto-update-pairs.js`:

```javascript
const USER_EXCLUSIONS = [
  // 'WETH/USDT',  // Comment out to re-enable
  // 'WETH/USDC',  // Comment out to re-enable
  'DAI/USDC',
  // ... WMATIC exclusions remain
];
```

### Change Fake Pool Threshold

Edit `scripts/auto-update-pairs.js` (line ~166):

```javascript
// Change from 2% to 5% to be more lenient
if (spread > 5) {  // Was: if (spread > 2)
  console.log(`   ❌ FAKE POOL! Spread: ${spread.toFixed(2)}%`);
  // ...
}
```

Then run:
```bash
node scripts/auto-update-pairs.js
npm run bot  # Restart bot
```

---

## 🔍 MONITORING

### Check Current Pairs
```bash
cat data/trading-pairs.json
```

### Check Bot Output
Look for:
```
[DYNAMIC] ✅ Loaded 3 pairs from trading-pairs.json
[SCHEDULER] 🔄 Running pair update #N...
[SCHEDULER] ✅ Update complete! 3 pairs loaded
```

### Force Manual Update
```bash
node scripts/auto-update-pairs.js
```

Bot will auto-reload within 1-2 seconds!

---

## ⚠️ IMPORTANT NOTES

1. **WMATIC Exclusion Impact:**
   - Excluded 4-5 pairs that had BEST spreads (0.0027%-0.0798%)
   - WMATIC pairs typically have highest volume on Polygon
   - May significantly reduce opportunities

2. **API Usage:**
   - 3 pairs = Very low API usage (~15M/month)
   - Well within free tier (300M/month)
   - Could add 10-15 more pairs safely

3. **Fake Pools:**
   - Many non-WMATIC pairs have fake pools
   - MAI/USDT: 120,735% spread (ridiculous!)
   - GHST/DAI: 29,846% spread (absurd!)
   - Filter is working correctly!

4. **Spread Reality:**
   - Natural spreads on real pools: 0.02%-2%
   - Fake pools: 10%-120,000% spreads
   - Current enabled pairs: 0.02%-0.6% ✅ REALISTIC

---

## 📞 TROUBLESHOOTING

### No Opportunities Found?
**Normal!** With only 3 pairs and tight spreads (< 1%), expect:
- 5-15 opportunities per day
- Most will be < $1 profit (rejected by threshold)
- May take hours between real opportunities

**Solutions:**
1. Add more pairs (see recommendations above)
2. Lower minimum profit threshold in `src/config.ts`
3. Remove WETH exclusions to add 2 more pairs

### Want to Re-Enable WMATIC Pairs?
1. Edit `scripts/auto-update-pairs.js`
2. Comment out the WMATIC check:
```javascript
// Check if pair contains WMATIC or MATIC (user exclusion)
// if (hasWMATIC) {  // Comment out entire block
//   console.log(`   ❌ Contains WMATIC/MATIC (user exclusion)`);
//   return { ... };
// }
```
3. Remove WMATIC pairs from USER_EXCLUSIONS list
4. Run: `node scripts/auto-update-pairs.js`
5. Restart bot

---

**Configuration Status:** ✅ UPDATED  
**WMATIC/MATIC Pairs:** ❌ ALL EXCLUDED  
**Enabled Pairs:** 3  
**Auto-Update:** ✅ Every 4 hours  
**API Usage:** ✅ 15M/month (5% of free tier)
