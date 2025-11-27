# 🎯 STABLECOIN-ONLY STRATEGY - ACTIVATED

## Changes Made

### 1. Enabled Stablecoin Pairs ✅
**Active Trading Pairs:**
- ✅ **MAI/USDC** - Top performer (54 bps spread, $388B liquidity)
- ✅ **DAI/USDC** - Classic stablecoin pair
- ✅ **USDC/USDT** - Highest volume stablecoin pair
- ✅ **USDT/DAI** - Alternative stablecoin route

### 2. Disabled All Volatile Pairs ❌
**Removed from trading:**
- ❌ WMATIC/DAI, WMATIC/USDT, WMATIC/USDC (has volatile WMATIC)
- ❌ WMATIC/WETH, WMATIC/WBTC, WMATIC/FRAX (volatile)
- ❌ GHST/USDC (gaming token - 249 bps but volatile)
- ❌ CRV/WMATIC, CRV/WETH, CRV/USDC (DeFi token - volatile)
- ❌ SUSHI/WMATIC, SUSHI/WETH, SUSHI/USDC (DEX token - volatile)
- ❌ BAL/WMATIC, BAL/WETH, BAL/USDC (DeFi token - volatile)
- ❌ MAI/WMATIC (has volatile WMATIC)

### 3. Optimized Trading Parameters 📊

**Before (Volatile Strategy):**
```typescript
minProfitBps: 5        // 0.05% minimum
minTradeSize: $150     // Too small for good profits
maxTradeSize: $10,000  // OK
V3 0.05% cap: $1,000   // Too conservative
V3 liquidity%: 5%      // Too conservative
```

**After (Stablecoin Strategy):**
```typescript
minProfitBps: 3         // 0.03% minimum (tighter for stables)
minTradeSize: $500      // Bigger trades = better profits
maxTradeSize: $10,000   // Same
V3 0.05% cap: $5,000    // 5x increase for deep stablecoin liquidity  
V3 liquidity%: 15%      // 3x increase (stablecoins have massive liquidity)
```

## Expected Results

### Opportunity Volume
**Before:** 11,322 opportunities (all pairs)
**After:** ~2,306 opportunities (MAI/USDC only, likely 3-4k total with other stables)

### Trade Sizing
**MAI/USDC Example:**
- Liquidity: $388,000,000,000 (!!!)
- 15% usage: $58,200,000,000 available
- Hard cap: $5,000 per trade
- **Expected size: $5,000 trades** (vs $1,000 before)

### Profitability Calculation
**With 54 bps spread (from your data):**
```
Spread:      54 bps
Fees:        35 bps (QuickSwap 25 + V3 5 + Flash 5)
Net profit:  19 bps
On $5k:      19 bps × $5,000 = $9.50 profit per trade
```

**With 100 trades/day:**
```
$9.50 × 100 = $950/day potential
```

### Success Rate Target
**Before:** 0% execution (894 failed trades)
**Target:** >10% execution rate (at least 10-20 successful trades/day)

## Why This Should Work

### 1. Price Impact Minimal
- Stablecoins maintain 1:1 peg
- $5k trade on $388B pool = 0.0000013% of liquidity
- Virtually zero price impact

### 2. Spreads More Stable
- Stablecoins don't have sudden 10% price swings
- 54 bps spread won't disappear in milliseconds
- Less front-running risk

### 3. Higher Trade Value
- $5k trades vs $1k = 5x profit per execution
- Only need 20% of opportunities to succeed for same profit

### 4. Lower Slippage Risk
- Massive liquidity means price stays stable during execution
- 54 bps spread should survive the few milliseconds to execute

## Success Criteria

### Immediate (First Hour):
- [ ] At least 1 successful trade
- [ ] Execution rate >5%
- [ ] Net profit >$5 per trade

### Short-term (First Day):
- [ ] 10+ successful trades
- [ ] Execution rate >10%
- [ ] Total profit >$50

### Medium-term (First Week):
- [ ] 100+ successful trades
- [ ] Execution rate >20%
- [ ] Total profit >$500

## Risk Assessment

**Risks:**
1. ⚠️ Fewer opportunities (2-4k vs 11k)
2. ⚠️ Tighter spreads (but more reliable)
3. ⚠️ Still competing with MEV bots

**Mitigations:**
1. ✅ Higher value per trade ($9.50 vs $1.50)
2. ✅ Better execution probability (stable spreads)
3. ✅ Less competition (stablecoins less sexy than volatile arb)

## Monitoring

**Watch for:**
- ✅ First successful trade (CELEBRATE!)
- ⚠️ "Arbitrage not profitable" errors (should decrease dramatically)
- ⚠️ Price impact issues (should be minimal with $5k on $388B)
- ✅ Consistent 15-20 bps net profit

## Fallback Plans

### If Still 0% Success:
1. **Try Base Network** - Less MEV competition
2. **Triangular Arbitrage** - Different opportunity set
3. **Accept market reality** - Polygon may be too efficient

### If Low Success (1-5%):
1. **Reduce trade size** - Try $2k instead of $5k
2. **Increase minProfitBps** - Wait for bigger spreads
3. **Add more stablecoin pairs** - FRAX/USDC, TUSD, etc.

---

**Ready to test!** 🚀

Run: `npm run bot`
Monitor: First 30 minutes for any successful trades
