# ✅ Realistic Trading Pairs for Polygon Arbitrage

## Current Problem

Your bot is detecting **fake arbitrage opportunities** with impossible profit percentages (100,000%+). 

**Why?** Most token pairs don't have liquidity pools on all 3 DEXes (QuickSwap, SushiSwap, ApeSwap).

## Solution

**Focus on pairs that ACTUALLY have good liquidity on multiple DEXes:**

### ✅ TIER 1: High Liquidity Pairs (Best for Arbitrage)

These pairs exist on QuickSwap, SushiSwap, and usually ApeSwap:

```typescript
// Stablecoin pairs (highest volume, smallest spreads)
USDC/USDT   // ~0.01-0.1% spread
DAI/USDC    // ~0.01-0.1% spread  
DAI/USDT    // ~0.01-0.1% spread

// Major token/stablecoin pairs
WMATIC/USDC // ⭐ BEST - Huge volume
WET H/USDC   // ⭐ BEST - Huge volume
WBTC/USDC   // ⭐ Good volume
WBTC/WETH   // ⭐ Good volume

// MATIC pairs (native token = high liquidity)
WETH/WMATIC
WBTC/WMATIC
USDC/WMATIC
USDT/WMATIC
```

### ✅ TIER 2: Medium Liquidity (Good for testing)

```typescript
// Major DeFi tokens
LINK/WMATIC
LINK/USDC
AAVE/WMATIC
AAVE/USDC
UNI/WMATIC
SUSHI/WMATIC
CRV/WMATIC
```

### ❌ TIER 3: Low/No Liquidity (AVOID!)

These pairs DON'T exist on all DEXes - causing fake opportunities:

```typescript
// Most exotic pairs fail:
COMP/WETH   // ❌ Fake 1768% profit
MKR/WETH    // ❌ Fake 6,010,473% profit
SNX/WMATIC  // ❌ Fake 364,465% profit
YFI/WETH    // ❌ Fake 19,056% profit
GHST/USDT   // ❌ Fake 144% profit
```

## Recommended Configuration

**Option 1: Conservative (Start Here)**
```typescript
watchedPairs: [
  // Only trade the most liquid pairs
  { name: "WMATIC/USDC", ... },  // Native token
  { name: "WETH/USDC", ... },    // ETH always liquid
  { name: "WBTC/USDC", ... },    // BTC always liquid
  { name: "DAI/USDC", ... },     // Stablecoin arb
  { name: "USDC/USDT", ... },    // Stablecoin arb
]
```

**Option 2: Balanced (Recommended)**
```typescript
watchedPairs: [
  // Tier 1: Stablecoins + Native
  { name: "WMATIC/USDC", ... },
  { name: "WETH/USDC", ... },
  { name: "WBTC/USDC", ... },
  { name: "DAI/USDC", ... },
  
  // Tier 2: Major DeFi
  { name: "LINK/WMATIC", ... },
  { name: "AAVE/WMATIC", ... },
  { name: "UNI/WMATIC", ... },
  { name: "SUSHI/WMATIC", ... },
]
```

## How to Fix Your Bot NOW

**Quick Fix:** Reduce the `price > 1000000` threshold to something more realistic:

```typescript
// In priceMonitor.ts - line ~170
if (price <= 0 || price > 10000) {  // Changed from 1000000
  return { price: 0, ... };
}
```

**Better Fix:** Only monitor pairs that have confirmed liquidity on QuickSwap + SushiSwap.

## Expected Results

With curated pairs, you should see:

**Good Opportunities:**
```
💱 WMATIC/USDC: QuickSwap=$0.51 | SushiSwap=$0.52 | Diff=1.96%
💱 DAI/USDC: QuickSwap=$1.001 | SushiSwap=$0.999 | Diff=0.2%
💱 WETH/USDC: QuickSwap=$2,015 | SushiSwap=$2,018 | Diff=0.15%
```

**Bad Opportunities (filtered out):**
```
❌ COMP/WETH: 1768% - POOL DOESN'T EXIST
❌ MKR/WETH: 6M% - POOL DOESN'T EXIST  
❌ SNX/WMATIC: 364K% - POOL DOESN'T EXIST
```

## Next Steps

1. **Stop the bot** (Ctrl+C)
2. **Edit `src/config.ts`** - Comment out low-liquidity pairs
3. **Lower price threshold** to 10,000 instead of 1,000,000
4. **Restart bot** - Should see realistic 0.1-5% opportunities
5. **Monitor for 1 hour** - Check if opportunities are real

## Reality Check

On Polygon mainnet with efficient markets:
- **Realistic spread:** 0.1% - 2% on major pairs
- **After fees:** Most opportunities net 0% - 0.5% profit
- **Actually profitable:** Maybe 1-3 per day
- **Bot competition:** MEV bots execute in milliseconds

**Don't expect:**
- ❌ 1000%+ profit opportunities (these are fake/errors)
- ❌ Hundreds of profitable trades per day
- ❌ Easy money

**Do expect:**
- ✅ Occasional small (0.3-1%) profit opportunities
- ✅ Most opportunities taken by faster bots
- ✅ Need for optimization to compete

---

**Bottom Line:** Focus on the top 10 most liquid pairs. Quality over quantity!
