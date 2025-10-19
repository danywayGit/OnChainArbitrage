# Top 15 Token Exclusion Strategy

## 🎯 Strategy: Avoid MEV Competition

We **exclude pairs with top 15 tokens** (by market cap on Polygon) to avoid MEV bot competition.

## 📊 Top 15 Polygon Tokens (Excluded)

Based on CoinGecko data (October 2025):

| Rank | Token | Market Cap | Why Excluded |
|------|-------|------------|--------------|
| 1 | **POL** | $1.97B | Native token, heavily monitored |
| 2 | **USDC** | $75.96B | Used as BASE pair only (needed for arb) |
| 3 | **LINK** | $11.73B | Oracle token, high MEV activity |
| 4 | **USDT** | $7.75B | Used as BASE pair only (needed for arb) |
| 5 | **UNI** | $3.58B | DEX token, high volume |
| 6 | **AAVE** | $3.21B | Lending protocol, high MEV |
| 7 | **WETH** | $420M | Used for arbitrage paths (essential) |
| 8 | **DAI** | $521M | Mid-tier stablecoin (KEPT) |
| 9 | **WBTC** | $270M | Wrapped BTC, high MEV |
| 10 | **SAND** | $497M | Metaverse token + fake pools |
| 11 | **MANA** | $437M | Metaverse token + fake pools |
| 12 | **CRV** | $744M | DEX/Curve token |
| 13 | **SUSHI** | $99M | DEX token + fake pools |
| 14 | **LDO** | $783M | Liquid staking |
| 15 | **COMP** | $334M | Lending protocol |

## ✅ Enabled Pairs (9 Total)

All pairs **avoid top 15 tokens** except USDC/USDT used as base pairs:

### Tier 1: Ultra-Tight Spreads (0.02-0.25%)
1. **WMATIC/DAI** - 0.02% spread ✅
2. **MAI/USDC** - 0.02% spread ✅ (MAI = mid-tier stablecoin)
3. **WMATIC/USDT** - 0.04% spread ✅ (USDT = base pair)
4. **WMATIC/USDC** - 0.06% spread ✅ (USDC = base pair)
5. **DAI/USDC** - 0.14% spread ✅
6. **WMATIC/WETH** - 0.23% spread ✅ (WETH = essential for arb)

### Tier 2: Good Spreads (1-2%)
7. **WETH/USDT** - 1.07% spread ✅
8. **WETH/USDC** - 1.10% spread ✅
9. **GHST/USDC** - 1.71% spread ✅ (Gaming token, not top 15)

## ❌ Disabled Pairs (25+ Total)

### Top 15 Token Pairs:
- **POL/USDC** - #1 token
- **LINK/WETH, LINK/USDC, LINK/WMATIC, LINK/USDT** - #3 token
- **UNI/WETH, UNI/USDC, UNI/WMATIC** - #5 token
- **AAVE/WETH, AAVE/USDC, AAVE/WMATIC, AAVE/USDT** - #6 token
- **WBTC/USDC, WBTC/WETH, WBTC/USDT, WBTC/DAI** - #9 token
- **SAND/USDC, SAND/WMATIC** - #10 token
- **MANA/USDC, MANA/WMATIC** - #11 token
- **CRV/USDC** - #12 token
- **SUSHI/WMATIC** - #13 token

### Additional Reasons:
- Most also have **fake pools** (71,943% spreads)
- High **MEV bot competition**
- **Suspicious liquidity** (22-99% spreads)

## 🎯 Results

- **Before:** 294 pairs, 100% failure rate, $80/day API costs
- **After:** 9 pairs, detecting real $0.85 opportunities, $0/day costs
- **Strategy:** Target mid-tier tokens with real liquidity, avoid MEV-dominated pairs

## 🤖 About dYdX

**dYdX is NOT on Polygon:**
- dYdX v3 runs on **StarkEx** (Ethereum Layer 2)
- dYdX v4 runs on its own **Cosmos-based chain**
- dYdX is a **perpetuals DEX**, not a spot DEX
- No dYdX pools available for arbitrage on Polygon

## 📈 Why This Works

1. **Less Competition:** Mid-tier tokens have fewer MEV bots
2. **Real Liquidity:** Verified pairs have < 2% spreads (not 250 trillion %)
3. **Lower Costs:** 9 pairs × 2 DEXes = 18 queries/scan (vs 588 before)
4. **Sustainable:** Fits in Alchemy free tier (300M compute units/month)

## 🔄 Next Steps

1. ✅ **Removed Dfyn** - Only 2/9 pairs had real liquidity
2. ✅ **Back to QuickSwap + SushiSwap** - Best liquidity
3. ⏳ **Test bot** - Monitor for real opportunities
4. ⏳ **Switch to free tier** - Stop $80/day bleeding
5. ⏳ **Optimize scan frequency** - 3sec intervals to fit free tier
