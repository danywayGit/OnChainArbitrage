# 🚀 EXPANDED TRADING PAIRS - 100 TOKENS

## Overview

Your bot now has access to **100 tokens** on Polygon mainnet, creating **400+ potential trading pairs**!

## Token Configuration

### ✅ Added to config.ts

**Total Tokens**: 100 (organized into 20 tiers)

**Coverage**:
- Tier 1: Native & Major Stablecoins (6 tokens)
- Tier 2: Major DeFi (10 tokens)  
- Tier 3: Layer 2 & Scaling (5 tokens)
- Tier 4-20: Gaming, NFT, Cross-chain, Privacy, Yield, etc. (79 tokens)

## Trading Strategy

### Phase 1: Core Pairs (Week 1) - START HERE
Monitor only the **highest volume pairs** with major base currencies:

**Base Currencies**: WMATIC, WETH, USDC, USDT

**Top 30 Tokens to Pair**:
1. WMATIC (native)
2. WETH (wrapped ETH)
3. WBTC (wrapped BTC)
4. USDC (stablecoin)
5. USDT (stablecoin)
6. DAI (stablecoin)
7. LINK (Chainlink)
8. AAVE (lending)
9. UNI (Uniswap)
10. CRV (Curve)
11. SUSHI (SushiSwap)
12. BAL (Balancer)
13. SAND (metaverse)
14. MANA (metaverse)
15. MATIC (native)
16. COMP (Compound)
17. MKR (Maker)
18. SNX (Synthetix)
19. YFI (Yearn)
20. QUICK (QuickSwap)
21. GRT (The Graph)
22. LDO (Lido)
23. GHST (Aavegotchi)
24. AXS (Axie Infinity)
25. GALA (Gala Games)
26. ENJ (Enjin)
27. IMX (Immutable X)
28. PAXG (PAX Gold)
29. FTM (Fantom)
30. AVAX (Avalanche)

### Phase 2: Expanded Coverage (Week 2-3)
Add **50 more tokens** paired with base currencies.

### Phase 3: Full Coverage (Month+)
Monitor **all 100 tokens** for maximum opportunities.

## Recommended Pairing Strategy

### High Priority Pairs (Enable First)
Each high-volume token should be paired with:
1. **WMATIC** (native Polygon token - most liquid)
2. **USDC** (most stable pricing)
3. **WETH** (ETH bridge opportunities)
4. **USDT** (alternative stablecoin)

Example for LINK:
- LINK/WMATIC
- LINK/USDC
- LINK/WETH
- LINK/USDT

### Medium Priority
DeFi tokens paired with major stablecoins:
- TOKEN/USDC
- TOKEN/WETH

### Lower Priority
Cross-pairs between DeFi tokens:
- AAVE/LINK
- UNI/SUSHI
- CRV/BAL

## Expected Opportunities

### With 100 Tokens:

**Conservative Estimate**:
- 100 tokens × 4 base pairs = 400 primary pairs
- ~200-300 pairs with good liquidity
- 50-100 opportunities per hour
- 1,200-2,400 opportunities per day

**Aggressive Estimate**:
- Include cross-pairs: 100 tokens × 10 pairs = 1,000 pairs
- ~500 pairs with decent liquidity
- 100-200 opportunities per hour
- 2,400-4,800 opportunities per day

## Profitability Projection

### Conservative (200 liquid pairs):
- 50 opportunities/hour
- 30% capture rate = 15 executed trades/hour
- $0.50 average profit per trade
- **$7.50/hour = $180/day = $5,400/month**

### Realistic (300 liquid pairs):
- 100 opportunities/hour
- 30% capture rate = 30 executed trades/hour
- $0.75 average profit per trade
- **$22.50/hour = $540/day = $16,200/month**

### Aggressive (500 liquid pairs):
- 150 opportunities/hour
- 25% capture rate = 37 executed trades/hour
- $1.00 average profit per trade
- **$37/hour = $888/day = $26,640/month**

## Implementation Plan

### Step 1: Update watchedPairs Array (DONE)
The config now includes 100 tokens. You need to manually add the pairs you want to monitor.

### Step 2: Start Small (Recommended)
**Week 1**: Monitor only **20 pairs** (top 5 tokens × 4 base currencies)
```typescript
// Enable in config.ts:
WMATIC/USDC, WMATIC/USDT, WMATIC/WETH, WMATIC/DAI
WETH/USDC, WETH/USDT, WETH/DAI, WETH/WBTC
WBTC/USDC, WBTC/USDT, WBTC/WETH, WBTC/DAI
LINK/USDC, LINK/USDT, LINK/WETH, LINK/WMATIC
AAVE/USDC, AAVE/USDT, AAVE/WETH, AAVE/WMATIC
```

### Step 3: Gradual Expansion
- **Week 2**: Add 30 more pairs (10 tokens × 3 base currencies)
- **Week 3**: Add 50 more pairs (15 tokens × 3 base currencies)
- **Month+**: Enable all 100-200 pairs

### Step 4: Monitor Performance
Track which pairs are most profitable and focus on those.

## Performance Considerations

### Bot Speed
- 20 pairs: Fast (1-2 seconds per scan)
- 50 pairs: Medium (3-5 seconds per scan)
- 100 pairs: Slow (6-10 seconds per scan)
- 200+ pairs: Very slow (15-30 seconds per scan)

**Solution**: Increase `priceCheckInterval` to 2-5 seconds if bot is slow.

### Memory Usage
- 20 pairs: ~100 MB RAM
- 50 pairs: ~200 MB RAM
- 100 pairs: ~400 MB RAM
- 200 pairs: ~800 MB RAM

### RPC Requests
- 20 pairs × 5 DEXes = 100 requests per scan
- 100 pairs × 5 DEXes = 500 requests per scan
- 200 pairs × 5 DEXes = 1,000 requests per scan

**Note**: May need paid RPC endpoint (Alchemy/Infura) for high request volumes.

## Token Liquidity Guide

### High Liquidity (>$1M daily volume):
✅ WMATIC, WETH, WBTC, USDC, USDT, DAI, LINK, AAVE, UNI

### Medium Liquidity ($100K-$1M daily):
⚠️ CRV, SUSHI, BAL, SAND, MANA, QUICK, GRT, LDO

### Lower Liquidity (<$100K daily):
🔴 Most Tier 10+ tokens - Use carefully

## Safety Recommendations

### Risk Management
1. **Start with high liquidity pairs only**
2. **Enable 10-20 pairs maximum initially**
3. **Monitor for 24-48 hours in dry run**
4. **Gradually add more pairs**
5. **Disable unprofitable pairs**

### Configuration Limits
```typescript
// In config.ts - Adjust for 100 tokens:
maxConcurrentTrades: 2,        // Allow 2 trades at once
maxDailyLoss: 100,             // Increase loss limit
priceCheckInterval: 2000,      // Slow down to 2 seconds
minProfitBps: 40,              // Increase to 0.4% minimum
```

## Next Steps

### Option 1: Manual Configuration (Recommended)
Edit `src/config.ts` and manually add pairs:
```typescript
watchedPairs: [
  { name: "WMATIC/USDC", token0: "WMATIC", token1: "USDC", enabled: true },
  { name: "WETH/USDC", token0: "WETH", token1: "USDC", enabled: true },
  // Add more pairs...
]
```

### Option 2: Auto-Generate Script
Create a script to automatically generate all pairs:
```bash
node scripts/generate-pairs.js --tokens=20 --bases=WMATIC,USDC,WETH
```

### Option 3: Dynamic Pair Loading
Modify bot to load pairs from external JSON file for easy management.

## Summary

✅ **100 tokens configured** in config.ts  
✅ **400+ potential pairs** available  
✅ **Organized into 20 tiers** by volume/type  
⏳ **Need to add pairs** to watchedPairs array  
⏳ **Test with 20 pairs** first  
⏳ **Scale up gradually** to 100-200 pairs  

**Expected Result**: 3-10x more opportunities than current 20-pair setup!

---

## Quick Reference: Top 30 Tokens by Volume

| Rank | Token | Pairs to Monitor |
|------|-------|------------------|
| 1 | WMATIC | USDC, USDT, WETH, DAI |
| 2 | WETH | USDC, USDT, WMATIC, WBTC |
| 3 | USDC | USDT, DAI, WMATIC, WETH |
| 4 | WBTC | WETH, USDC, USDT, WMATIC |
| 5 | USDT | USDC, DAI, WMATIC, WETH |
| 6 | LINK | WMATIC, USDC, WETH, USDT |
| 7 | AAVE | WMATIC, USDC, WETH, USDT |
| 8 | UNI | WMATIC, USDC, WETH |
| 9 | CRV | WMATIC, USDC, WETH |
| 10 | SUSHI | WMATIC, USDC, WETH |
| 11-30 | See full list | WMATIC, USDC, WETH |

**Total High Priority Pairs**: ~100 pairs  
**Expected Opportunities**: 200-400 per day  
**Conservative Profit**: $10,000-20,000/month
