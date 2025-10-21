# Stablecoin-Only Arbitrage Strategy

## Why Stablecoins?

**Current Problem:**
- Volatile pairs (CRV, WMATIC, GHST) have spreads that close too fast
- Price impact kills profitability on execution
- 0% success rate across 894 trade attempts

**Stablecoin Advantages:**
1. **Massive Liquidity**: MAI/USDC V3 pool has $388B+ TVL
2. **Stable Spreads**: Don't move as fast (0.02-0.54% range)
3. **Lower Price Impact**: Can trade $5k-$10k with minimal slippage
4. **Predictable**: 1:1 peg means less volatility risk

## Target Pairs

### Tier 1: Ultra-Low Fee V3 Pools
- **MAI/USDC** (V3 0.05% tier) - $388B liquidity - 54 bps average spread
- **USDC/USDT** (V3 0.05% tier) - High volume
- **DAI/USDC** (V3 0.05% tier) - Established pair

### Fee Structure
- QuickSwap: 25 bps
- Uniswap V3 (0.05%): 5 bps
- Flash Loan: 5 bps
- **Total**: 35 bps break-even

## Configuration Changes

### 1. Disable All Non-Stablecoin Pairs
```typescript
// Keep ONLY these in watchedPairs:
{
  name: "MAI/USDC",
  token0: "MAI",
  token1: "USDC",
  enabled: true,
},
{
  name: "USDC/USDT", // Enable this
  token0: "USDC",
  token1: "USDT",
  enabled: true,
},
{
  name: "DAI/USDC", // Enable this
  token0: "DAI",
  token1: "USDC",
  enabled: true,
},
```

### 2. Increase Trade Sizes
```typescript
minTradeSize: 1000,  // $1,000 minimum
maxTradeSize: 10000, // $10,000 maximum
```

### 3. Adjust Profit Threshold
```typescript
minProfitBps: 3, // 0.03% = 3 bps minimum (very tight for stables)
```

### 4. Increase V3 0.05% Tier Caps
```typescript
// In tradeExecutor.ts
if (isV3LowFeeTier) {
  liquidityPercentage = 0.10; // 10% instead of 5%
  configMaxSize = Math.min(configMaxSize, 5000); // $5k cap instead of $1k
}
```

## Expected Results

**With $5k trades on MAI/USDC:**
- Spread: ~54 bps (from data)
- Fees: 35 bps
- Net: ~19 bps = $9.50 profit per trade
- With 100 opportunities/day = $950/day potential

**Success Criteria:**
- Execution success rate >10% (vs current 0%)
- At least 1-2 successful trades in first hour
- Net profit >$10 per successful trade

## Implementation Steps

1. ✅ Update config.ts - disable all volatile pairs
2. ✅ Enable stablecoin pairs only
3. ✅ Increase trade size limits
4. ✅ Adjust V3 sizing for stablecoins
5. ✅ Run bot for 1 hour
6. ✅ Analyze results

## Risk Assessment

**Low Risk:**
- Stablecoins maintain 1:1 peg (minimal volatility)
- Massive liquidity (low price impact)
- Can exit positions quickly

**Potential Issues:**
- Fewer opportunities (2,306 vs 11,322)
- Tighter spreads (but more reliable)
- May still face MEV competition

## Fallback Plan

If stablecoins still fail → Try **Triangular Arbitrage** or **Base Network**
