# 📊 Trading Pair Generation Guide

## Overview

The `generate-pairs.js` script creates optimized trading pair configurations based on token volume and liquidity. It outputs TypeScript configuration that you manually copy into `src/config.ts`.

---

## 🚀 Quick Start

### 1. Generate Pairs (Choose One)

```powershell
# Conservative (22 pairs) - Good for testing
node scripts/generate-pairs.js --top=10

# Balanced (62 pairs) - Recommended for production
node scripts/generate-pairs.js --top=20

# Aggressive (150+ pairs) - Maximum opportunities
node scripts/generate-pairs.js --top=50

# All tokens (300+ pairs) - For high-performance systems
node scripts/generate-pairs.js --top=100
```

### 2. Copy the Output

The script will print a `watchedPairs` array like this:

```
💡 Copy this configuration to src/config.ts:

────────────────────────────────────────────────────────────────────────────────
    watchedPairs: [
      // === TIER 1: CORE PAIRS (Highest Priority) ===
      {
        name: "WBTC/WMATIC",
        token0: "WBTC",
        token1: "WMATIC",
        enabled: true, // ⭐⭐⭐
      },
      ...
    ],
────────────────────────────────────────────────────────────────────────────────
```

**➡️ Copy everything between the dashed lines**

### 3. Update `src/config.ts`

Open `src/config.ts` and find the `monitoring` section:

```typescript
monitoring: {
  priceCheckInterval: 1000,

  // === REPLACE THIS SECTION ===
  watchedPairs: [
    // Paste the copied configuration here
  ],

  debugMode: process.env.ENABLE_DEBUG === "true",
  dryRun: process.env.ENABLE_DRY_RUN === "true",
},
```

**➡️ Replace the entire `watchedPairs` array with your copied configuration**

### 4. Validate Configuration

```powershell
# Check for TypeScript errors
npx tsc --noEmit

# Validate token addresses (recommended)
node scripts/validate-tokens.js
```

### 5. Start the Bot

```powershell
# Start in dry run mode (recommended first)
npm run bot

# Optional: Monitor in real-time (separate terminal)
node scripts/monitor-live.js
```

---

## 📊 Configuration Options Explained

### --top=10 (Conservative)
- **Pairs Generated:** ~22 pairs
- **Tokens Used:** Top 10 by volume
- **Estimated Profit:** $180-270/day
- **Best For:** Testing, low-resource systems
- **Risk Level:** Low
- **CPU Usage:** Minimal

### --top=20 (Balanced) ⭐ RECOMMENDED
- **Pairs Generated:** ~62 pairs
- **Tokens Used:** Top 20 by volume
- **Estimated Profit:** $360-450/day
- **Best For:** Production environments
- **Risk Level:** Medium
- **CPU Usage:** Moderate

### --top=50 (Aggressive)
- **Pairs Generated:** ~150+ pairs
- **Tokens Used:** Top 50 by volume
- **Estimated Profit:** $540-720/day
- **Best For:** High-performance systems
- **Risk Level:** Medium-High
- **CPU Usage:** High

### --top=100 (Maximum)
- **Pairs Generated:** ~300+ pairs
- **Tokens Used:** All 100 tokens
- **Estimated Profit:** $900-1200/day
- **Best For:** Dedicated servers, advanced users
- **Risk Level:** High
- **CPU Usage:** Very High

---

## 🎯 How Pairs Are Generated

### Priority 1: Base Currency Pairs (Always Enabled)
Each token is paired with the 4 most liquid base currencies:
- **WMATIC** - Native token, highest volume
- **USDC** - Largest stablecoin on Polygon
- **WETH** - Wrapped ETH, major asset
- **USDT** - Tether, high liquidity

Example: If token is LINK, generates:
- LINK/WMATIC ⭐⭐⭐
- LINK/USDC ⭐⭐⭐
- LINK/WETH ⭐⭐⭐
- LINK/USDT ⭐⭐⭐

### Priority 2: Cross Pairs (Disabled by Default)
For `--top=50+`, also generates cross-pairs between major tokens:
- WBTC/WETH
- LINK/AAVE
- UNI/SUSHI

**Note:** These are disabled by default due to lower liquidity.

### Tier System
- **Tier 1:** Core tokens (WMATIC, WETH, WBTC, etc.) - ⭐⭐⭐ Highest priority
- **Tier 2:** Major DeFi (LINK, AAVE, UNI, etc.) - ⭐⭐ High priority
- **Tier 3:** Additional tokens - ⭐ Medium priority
- **Tier 4:** Cross pairs - Disabled by default

---

## 🔄 Complete Workflow Example

```powershell
# 1. Validate tokens first
node scripts/validate-tokens.js

# 2. Generate pairs for top 20 tokens
node scripts/generate-pairs.js --top=20

# 3. Copy the output (select and Ctrl+C)
#    Look for the section between the dashed lines

# 4. Open config.ts
code src/config.ts

# 5. Find the watchedPairs section (around line 250)
#    Replace the entire array with your copied configuration

# 6. Save the file (Ctrl+S)

# 7. Validate TypeScript
npx tsc --noEmit

# 8. Start the bot
npm run bot
```

---

## ⚠️ Important Notes

### Stablecoin Pairs (Disabled by Default)
Pairs like USDC/USDT, USDC/DAI are **intentionally disabled** because:
- Very tight profit margins (0.01-0.05%)
- High risk of loss from gas fees
- Require advanced strategies

**Enable only after mastering regular pairs!**

### Enabling/Disabling Pairs
To disable a pair, change `enabled: true` to `enabled: false`:

```typescript
{
  name: "LINK/WMATIC",
  token0: "LINK",
  token1: "WMATIC",
  enabled: false, // ⭐⭐⭐ Disabled for testing
},
```

### Resource Considerations
- More pairs = More API calls = Higher CPU/Network usage
- Polygon RPC rate limits: ~500 requests/second
- Each pair checks ~2 DEXes = 4 RPC calls per check
- 100 pairs × 4 calls/pair = 400 calls per check cycle

**Recommended:**
- Start with `--top=20` (62 pairs)
- Monitor for 24 hours
- Scale up gradually

---

## 📈 Profit Estimates

### How Estimates Are Calculated
```
Profit/Day = Pairs × Opportunities/Hour × Avg Profit × Hours
           = 62 × 2 × $3 × 24
           = ~$360-450/day
```

**Assumptions:**
- 2 opportunities per hour per pair (conservative)
- $3 average profit per opportunity
- 24/7 operation
- Polygon mainnet liquidity

**Reality:**
- Actual profits vary based on:
  - Market volatility
  - Gas prices
  - Competition from other bots
  - DEX liquidity
  - Execution speed

**Start in DRY RUN mode to measure actual opportunities!**

---

## 🛠️ Advanced Customization

### Custom Base Currencies
Edit the script to change base currencies:

```javascript
// In scripts/generate-pairs.js
const baseCurrencies = ["WMATIC", "USDC", "WETH", "DAI"]; // Add/remove
```

### Custom Token Priority
Reorder tokens in `topTokens` array to change priority.

### Generate Specific Pairs
Manually add pairs to `config.ts`:

```typescript
{
  name: "CUSTOM/PAIR",
  token0: "TOKEN1",
  token1: "TOKEN2",
  enabled: true,
},
```

---

## 🐛 Troubleshooting

### "Token not found in configuration"
- Ensure all tokens in pairs exist in `config.tokens`
- Run `node scripts/validate-tokens.js`

### "Too many RPC calls"
- Reduce number of pairs
- Increase `priceCheckInterval` in config.ts
- Use a premium RPC provider (Infura, Alchemy)

### Bot runs but finds no opportunities
- Normal on testnets (low liquidity)
- On mainnet: Wait 24 hours, increase pairs
- Check `minProfitBps` setting (lower = more opportunities)

### TypeScript compilation errors
- Run `npx tsc --noEmit` to see errors
- Ensure proper syntax in config.ts
- Check for missing commas

---

## 📚 Related Scripts

- `scripts/validate-tokens.js` - Validate token addresses
- `scripts/monitor-live.js` - Real-time dashboard
- `scripts/analyze-data.js` - Analyze collected data
- `npm run bot` - Start the arbitrage bot

---

## 💡 Best Practices

1. **Always start with `--top=10` or `--top=20`**
2. **Run in dry run mode first** (`ENABLE_DRY_RUN=true`)
3. **Monitor for 24 hours** before enabling live trading
4. **Validate configuration** with `npx tsc --noEmit`
5. **Gradually scale up** pair count based on results
6. **Use premium RPC** for production (faster, more reliable)
7. **Monitor gas prices** on Polygon (should be <100 Gwei)
8. **Review logs daily** to optimize pair selection

---

## 🎓 Next Steps After Generation

1. ✅ Generate pairs → `node scripts/generate-pairs.js --top=20`
2. ✅ Copy output
3. ✅ Update `src/config.ts`
4. ✅ Validate → `npx tsc --noEmit`
5. ✅ Start bot → `npm run bot`
6. ⏰ Wait 24 hours
7. 📊 Analyze data → `node scripts/analyze-data.js`
8. 🎯 Optimize pairs based on results
9. 🚀 Enable live trading when confident

---

**Happy Trading! 🤖💰**
