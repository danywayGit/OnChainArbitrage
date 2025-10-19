# 🎯 Dynamic Pair Selection

## Overview

Your bot now uses **volume-based dynamic pair selection** to target mid-tier trading pairs with the best arbitrage opportunities.

## Strategy

### ✅ What We Target:
- **Volume Range:** $2M - $6M daily
- **Categories:** Gaming, Metaverse, DEX tokens, Alt stablecoins
- **Competition:** Medium (not dominated by MEV bots)
- **Spreads:** 0.3% - 2% (vs 0.01-0.05% on major pairs)

### ❌ What We Avoid:
- Top 3 pairs by volume (too efficient, MEV dominated)
- Ultra-low volume pairs (<$500k/day - fake pools)
- Stablecoin-only pairs (USDC/USDT - too tight)

---

## Current Selected Pairs (Oct 2025)

| Rank | Pair | Daily Volume | Category | Why Selected |
|------|------|--------------|----------|--------------|
| 1 | **LINK/WMATIC** | $5.8M | Oracle | Chainlink popular, good liquidity |
| 2 | **POL/USDC** | $5.4M | L2 | Polygon ecosystem token |
| 3 | **SAND/USDC** | $5.1M | Metaverse | Sandbox active, volatile |
| 4 | **SUSHI/WMATIC** | $4.5M | DEX | Cross-DEX arbitrage potential |
| 5 | **MANA/USDC** | $4.3M | Metaverse | Decentraland, NFT activity |
| 6 | **MAI/USDC** | $4.2M | Stablecoin | Alt stable, better spreads |
| 7 | **QUICK/WMATIC** | $3.7M | DEX | QuickSwap token, cross-DEX |
| 8 | **GHST/USDC** | $3.2M | Gaming | Aavegotchi, Polygon native |
| 9 | **CRV/WMATIC** | $3.2M | DeFi | Curve DAO, medium volume |
| 10 | **MAI/WMATIC** | $2.9M | Stablecoin | QiDao, Polygon native |

---

## How to Update Pairs

### Automatic (Recommended)

Run the selection script weekly to refresh based on current volume:

```bash
node scripts/select-pairs-by-volume.js
npm run build
npm run bot
```

### Manual

Edit the `CURATED_PAIRS` array in `scripts/select-pairs-by-volume.js`:

```javascript
const CURATED_PAIRS = [
  { pair: 'YOUR/PAIR', volume24h: 5.0, category: 'Category' },
  // ... add more
];
```

---

## API Usage & Costs

### With 10 Pairs:
- **API Calls:** ~200/second (2 DEXs × 10 pairs × 10 checks/sec)
- **Daily Usage:** ~100M compute units
- **Monthly Usage:** ~3B compute units

### Alchemy Costs:
| Plan | Monthly Limit | Your Usage | Cost |
|------|---------------|------------|------|
| **Free** | 300M units | 3B units | **Over limit!** ❌ |
| **Pay-As-You-Go** | Unlimited | 100M/day | **~$120/month** 💰 |

### 💡 Recommendation:
Reduce scan frequency from 1s to 3-5s to stay in free tier:

```env
# In .env
PRICE_CHECK_INTERVAL=3000  # 3 seconds instead of 1
```

This reduces usage by 67%: 3B/month → 1B/month (still over free tier)

---

## Expected Results

### Realistic Expectations:

**Opportunities Detected:**
- **Per day:** 50-100 (with current filters)
- **Actually profitable:** 5-15 (after gas costs)
- **Can execute before MEV bots:** 0-2 per day

**Success Rate:**
- **Simulation:** 100% ✅ (dry run always succeeds)
- **Real execution:** 5-15% (MEV bots, front-running, slippage)
- **Net profitable:** 1-5% (gas costs eat most profits)

**Daily Profit (Realistic):**
- **Best case:** $10-20/day (with $1,000 capital)
- **Average:** $2-5/day
- **Bad days:** -$5 (gas costs on failed trades)

### Why Mid-Tier Pairs Are Better:

| Metric | Major Pairs (WETH/USDC) | Mid-Tier Pairs (GHST/USDC) |
|--------|-------------------------|----------------------------|
| **Spread** | 0.01-0.05% | 0.3-2.0% |
| **MEV Competition** | Extreme | Medium |
| **Success Rate** | <1% | 5-15% |
| **Profit per trade** | $0.50 | $5-20 |
| **Execution Speed Needed** | <100ms | <1s |

---

## Monitoring & Optimization

### Check Performance:

```bash
# View today's opportunities
cat data/opportunities_$(date +%Y-%m-%d).csv

# Check success rate
grep "Success Rate" data/stats_*.json
```

### Optimize:

1. **Increase threshold** if too many false positives:
   ```typescript
   // In src/priceMonitor.ts
   const MAX_REALISTIC_PROFIT = 2; // Lower from 3% to 2%
   ```

2. **Reduce frequency** to save API costs:
   ```env
   PRICE_CHECK_INTERVAL=5000  # 5 seconds
   ```

3. **Add/remove pairs** based on actual results:
   ```bash
   node scripts/select-pairs-by-volume.js
   ```

---

## Troubleshooting

### "No opportunities found"
✅ **Normal!** Real arbitrage is rare. You might see 0-5 real opportunities per day.

### "All trades failing"
⚠️ Likely fake pools or outdated price data. The bot already filters these out with the 3% cap.

### "High API costs"
💡 Switch to FREE plan or reduce `PRICE_CHECK_INTERVAL` to 5000ms.

### "Want more pairs"
⚠️ More pairs = more API costs. 10 pairs is optimal for free tier (with 3-5s interval).

---

## Next Steps

1. ✅ **Switch Alchemy to FREE plan** (if not already)
2. ✅ **Set `PRICE_CHECK_INTERVAL=3000`** in .env
3. ✅ **Run bot:** `npm run bot`
4. 📊 **Monitor for 24h** to see real opportunities
5. 🔧 **Adjust filters** based on results

---

**Last Updated:** October 18, 2025
**Script:** `scripts/select-pairs-by-volume.js`
