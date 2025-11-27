# 📊 Pair Discovery Script Comparison

## **🆕 New: `discover-high-liquidity-pairs-v2.js`**

### **⚙️ Prerequisites:**

#### **1. Create The Graph API Key** (Required for Uniswap V3)
To query Uniswap V3 pools, you need a free API key from The Graph:

**Steps:**
1. Visit https://thegraph.com/studio/
2. **Create an account** (sign in with wallet or email)
3. Click **"API Keys"** tab in left sidebar (NOT "My Subgraphs")
4. Click **"Create API Key"** button
5. Enter a name (e.g., "Arbitrage Bot Key")
6. Click "Create API Key"
7. **Copy the API key** (looks like: `5133a139a00ce6b3d5e92fb4c8ac3da4`)

#### **2. Store API Key in .env File**
Add to your `.env` file:
```bash
GRAPH_API_KEY=your_api_key_here
```

**Example:**
```bash
GRAPH_API_KEY=5133a139a00ce6b3d5e92fb4c8ac3da4
```

**⚠️ Important:** Make sure `.env` is in your `.gitignore`!

---

### **✨ Key Improvements:**

#### **1. ✅ Preserves Disabled Pairs**
```javascript
// OLD: Simple Set of pair names
existingPairs.add(p.name);

// NEW: Map with full pair objects (preserves enabled/disabled state)
existingPairsMap.set(p.name, p);

// Result: Disabled pairs stay disabled, won't be re-enabled
```

**Your manually disabled pairs (stablecoins, low liquidity) will stay disabled!**

---

#### **2. ✅ Real Price Fetching (CoinGecko API)**
```javascript
// OLD: Rough estimate
const estimatedLiquidityUSD = reserve1Formatted * 2; // ❌ Inaccurate

// NEW: Real prices from CoinGecko
const liquidityUSD = (reserve0 * price0) + (reserve1 * price1); // ✅ Accurate
```

**Fetches live prices for:**
- USDC, USDT, DAI: $1.00
- WMATIC: $0.80
- WETH: $2,500
- WBTC: $45,000
- AAVE, UNI, LINK, CRV, BAL, etc.

**Falls back to hardcoded prices if CoinGecko API fails**

---

#### **3. ✅ Volume Filtering**
```javascript
// NEW: Checks both liquidity AND volume
if (pairInfo.liquidityUSD >= MIN_LIQUIDITY_USD && 
    pairInfo.volumeUSD >= MIN_VOLUME_24H_USD) {
  // Qualified!
}
```

**Criteria:**
- Min liquidity: **$50,000** per DEX
- Min volume: **$50,000** daily per DEX
- Must be on **2+ DEXes**

**Volume estimation:** `liquidity × 0.5` (50% turnover/day is typical for active pools)

---

#### **4. ✅ More DEXes Support**

| DEX | Status | Notes |
|-----|--------|-------|
| **QuickSwap** | ✅ Active | V2, fully supported |
| **SushiSwap** | ✅ Active | V2, fully supported |
| **Uniswap V3** | 🚧 Partial | Needs special pool manager (subgraph) |
| **Balancer** | 🚧 Planned | Weighted pools, needs vault integration |
| **Curve** | 🚧 Planned | Stable pools, needs registry integration |

**Note:** V3/Balancer/Curve require more complex implementation. Currently checking only V2 DEXes (QuickSwap, SushiSwap).

---

## **📋 Usage:**

### **Run the new script:**
```bash
node scripts/discover-high-liquidity-pairs-v2.js
```

### **What it does:**
1. ✅ Fetches real-time prices from CoinGecko
2. ✅ Checks all token pair combinations
3. ✅ **SKIPS existing pairs** (preserves your manual config)
4. ✅ Verifies liquidity on QuickSwap + SushiSwap
5. ✅ Filters by liquidity ($50k+) AND volume ($50k+)
6. ✅ Requires presence on 2+ DEXes
7. ✅ Appends NEW pairs to `data/trading-pairs.json`
8. ✅ **PRESERVES disabled pairs** (won't re-enable)

---

## **🔐 Safety Features:**

### **1. Disabled Pairs Stay Disabled**
```
⏭️  USDC/USDT - already exists (DISABLED, preserving state)
⏭️  WMATIC/DAI - already exists (DISABLED, preserving state)
```

### **2. Existing Enabled Pairs Stay Enabled**
```
⏭️  WMATIC/USDC - already exists (enabled, preserving state)
⏭️  WMATIC/WETH - already exists (enabled, preserving state)
```

### **3. Only NEW Pairs Are Added**
```
✅ QUALIFIED! WETH/USDC
   Avg Liquidity: $1,200,000
   Avg Volume: $600,000
   DEXes: quickswap, sushiswap
```

---

## **📊 Output Example:**

```json
{
  "pairs": [
    {
      "name": "WMATIC/USDC",
      "enabled": true,
      "estimatedLiquidity": {
        "quickswap": 2500000,
        "sushiswap": 1800000
      },
      "averageLiquidity": 2150000,
      "estimatedVolume24h": 1075000
    },
    {
      "name": "USDC/USDT",
      "enabled": false,
      "reason": "Stablecoin pair - manually disabled"
    }
  ],
  "stats": {
    "totalPairs": 45,
    "enabledPairs": 2,
    "disabledPairs": 43,
    "newPairsAdded": 5,
    "criteria": {
      "minLiquidityPerDex": "$50,000",
      "minVolume24hPerDex": "$50,000",
      "minDexesRequired": 2
    }
  }
}
```

---

## **🎯 Next Steps:**

### **Option 1: Test with current token list (15 tokens)**
```bash
node scripts/discover-high-liquidity-pairs-v2.js
```
Will check ~105 pairs, take ~5 minutes

### **Option 2: Add more tokens to search**
Edit `HIGH_LIQUIDITY_TOKENS` in the script:
```javascript
const HIGH_LIQUIDITY_TOKENS = {
  // Add more tokens here
  MATIC: "0x0000000000000000000000000000000000001010",
  // etc...
};
```

### **Option 3: Implement Uniswap V3 support**
Would need to query The Graph subgraph:
```
https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3-polygon
```

---

## **🔧 TODO: Future Enhancements**

- [ ] **Uniswap V3 liquidity** (needs subgraph integration)
- [ ] **Balancer weighted pools** (needs vault queries)
- [ ] **Curve stable pools** (needs registry queries)
- [ ] **Real-time volume** from The Graph (instead of estimation)
- [ ] **Price impact calculation** (simulate $1000 trade)
- [ ] **Historical performance** (arbitrage success rate)

---

## **⚠️ Known Limitations:**

1. **Volume is estimated** (not real-time) - uses `liquidity × 0.5` formula
2. **Uniswap V3 not fully implemented** - needs pool iteration logic
3. **CoinGecko API rate limits** - 50 calls/minute (free tier)
4. **No market cap filtering** - could add to exclude micro-cap tokens

---

## **💡 Tips:**

### **To find even MORE pairs:**
1. Add more tokens to `HIGH_LIQUIDITY_TOKENS`
2. Lower thresholds: `MIN_LIQUIDITY_USD = 30000` (instead of 50k)
3. Check other chains: BSC, Arbitrum, Base

### **To be MORE selective:**
1. Raise thresholds: `MIN_LIQUIDITY_USD = 100000` 
2. Require 3+ DEXes: `MIN_DEXES_REQUIRED = 3`
3. Add market cap filter (exclude <$100M market cap)

---

## **🎉 Summary:**

**Old script:** Simple, fast, but inaccurate liquidity calculation

**New script (v2):**
- ✅ Real prices (CoinGecko API)
- ✅ Accurate liquidity calculation
- ✅ Volume filtering
- ✅ Preserves disabled pairs
- ✅ More selective (higher quality pairs)
- ✅ Better reporting

**Use v2 for production!**
