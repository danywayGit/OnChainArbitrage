# The Graph API Endpoint Investigation

**Date**: October 29, 2025  
**Issue**: Uniswap V3 subgraph queries failing with HTML error

## Problem Summary

All Uniswap V3 pool queries in `discover-high-liquidity-pairs-v2.js` are returning HTML errors instead of JSON data. This prevents the bot from discovering V3 pairs with high liquidity.

## Root Cause

**The Graph Hosted Service has been deprecated and removed.**

Testing results:
```bash
# Original endpoint - REMOVED
https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon
Error: "This endpoint has been removed. If you have any questions, reach out to support@thegraph.zendesk.com"

# Regenesis endpoint - REMOVED
https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon-regenesis
Error: Same removal message

# Messari endpoint - REMOVED
https://api.thegraph.com/subgraphs/name/messari/uniswap-v3-polygon
Error: Same removal message
```

## Alternative Solutions

### Option 1: The Graph Decentralized Network (REQUIRES API KEY) ⭐ RECOMMENDED

**Endpoint**: `https://gateway.thegraph.com/api/subgraphs/id/3hCPRGf4z88VC5rsBKU5AA9FBBq5nF3jbKJG7VZCbhjm`

**Subgraph ID**: `3hCPRGf4z88VC5rsBKU5AA9FBBq5nF3jbKJG7VZCbhjm` (Uniswap V3 Polygon)

**Requirements**:
- Free API key from [The Graph Studio](https://thegraph.com/studio/)
- Add `Authorization: Bearer {api-key}` header to all requests
- Free tier: 100,000 queries/month (sufficient for discovery script)

**Example Request**:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -d '{"query": "{ pools(first: 5) { id totalValueLockedUSD } }"}' \
  https://gateway.thegraph.com/api/subgraphs/id/3hCPRGf4z88VC5rsBKU5AA9FBBq5nF3jbKJG7VZCbhjm
```

**Pros**:
- ✅ Official migration path from hosted service
- ✅ Maintained by The Graph Protocol
- ✅ Free tier available (100k queries/month)
- ✅ Most up-to-date data

**Cons**:
- ❌ Requires API key (environment variable setup)
- ❌ Rate limited on free tier

**Implementation Steps**:
1. Sign up at https://thegraph.com/studio/
2. Create API key
3. Update script to use new endpoint + API key
4. Store API key in `.env` file (don't commit!)

---

### Option 2: Direct RPC Queries (NO API KEY NEEDED) ⚡ FALLBACK

Instead of using The Graph, query Uniswap V3 contracts directly via RPC.

**Approach**: Use Uniswap V3 Factory contract to enumerate pools

**Uniswap V3 Factory on Polygon**: `0x1F98431c8aD98523631AE4a59f267346ea31F984`

**Method**:
1. Call `getPool(token0, token1, feeTier)` for each fee tier (500, 3000, 10000)
2. If pool exists, query pool contract for `liquidity()` and `slot0()` (price)
3. Calculate TVL using on-chain data

**Pros**:
- ✅ No API key needed
- ✅ No rate limits (use public RPC)
- ✅ Most accurate (on-chain data)
- ✅ Works offline/air-gapped

**Cons**:
- ❌ Slower (multiple RPC calls per pair)
- ❌ More complex code
- ❌ No historical volume data (would need to estimate)
- ❌ Higher RPC usage

**Example Code**:
```javascript
const V3_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const V3_FACTORY_ABI = [
  "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)"
];

async function getV3PoolAddress(token0, token1, feeTier, provider) {
  const factory = new ethers.Contract(V3_FACTORY, V3_FACTORY_ABI, provider);
  return await factory.getPool(token0, token1, feeTier);
}
```

---

### Option 3: Alternative Subgraphs (MIXED RESULTS)

**Goldsky**: Some alternative subgraphs host on Goldsky infrastructure
- Status: Need to research specific endpoints
- May require API key

**QuickNode**: Offers hosted subgraph services
- Status: Requires paid plan
- Not suitable for free usage

---

## Recommended Solution: Option 1 (The Graph Decentralized Network)

**Reasoning**:
1. Official migration path - most reliable long-term
2. Free tier sufficient for our needs (script runs ~1x/day)
3. Provides volume data (not available on-chain without events)
4. Faster than RPC queries

**Estimated queries per discovery run**:
- ~70 token pairs × 1 query each = 70 queries
- Well under 100k/month limit
- Could run script 1,428 times per month

## Implementation Plan

### Step 1: Get API Key
1. Visit https://thegraph.com/studio/
2. Sign in with wallet or email (create account if you don't have one)
3. Click **"API Keys"** tab in the left sidebar (NOT "My Subgraphs")
4. Click **"Create API Key"** button
5. Enter a name (e.g., "Arbitrage Bot Key")
6. Click "Create API Key"
7. Copy the API key (32+ character string like: `5133a139a00ce6b3d5e92fb4c8ac3da4`)

### Step 2: Store API Key in .env File
Add the following line to your `.env` file:
```bash
GRAPH_API_KEY=your_api_key_here
```

**Example:**
```bash
GRAPH_API_KEY=5133a139a00ce6b3d5e92fb4c8ac3da4
```

**Important:** Make sure `.env` is in your `.gitignore` to avoid committing your API key!

### Step 3: Run Discovery Script
The script will automatically load the API key from `.env`:
```bash
node scripts/discover-high-liquidity-pairs-v2.js
```

---

## Fallback Plan: Direct RPC Queries

If The Graph API fails or rate limits are hit, implement Option 2 (direct RPC queries). This ensures the bot can always discover pools without external dependencies.

**Priority**: Implement after Option 1 is tested and working.

---

## Impact on Bot Performance

**Current State**:
- ✅ V2 discovery working (QuickSwap, SushiSwap)
- ❌ V3 discovery broken (The Graph deprecated)
- 📊 Result: Missing 10-20x more liquidity from V3 pools

**After Fix**:
- ✅ V2 discovery working
- ✅ V3 discovery working
- 📊 Expected: 10-20 additional pairs with $50M+ liquidity each
- 🎯 Target: WMATIC/USDC on V3 (~$50M), WETH/USDC (~$30M)

**Example V3 Liquidity** (from previous bot runs):
```
WMATIC/USDC V3: $543M (0.05% tier) + $4.3B (0.3% tier) = $4.8B total
WETH/WBTC V3: $22.4M (0.05% tier) + $987k (0.3% tier) = $23.4M total
```

Compare to V2:
```
WMATIC/USDC QuickSwap: $2M
WETH/WBTC QuickSwap: $3
```

**V3 has 2,400x more liquidity on WMATIC/USDC pair!**

---

## Timeline

- **Immediate**: Document findings ✅ DONE
- **Next**: Get The Graph API key (5 minutes)
- **Then**: Update script with new endpoint (10 minutes)
- **Test**: Run discovery script (15 minutes)
- **Deploy**: Add 10-20 V3 pairs to config (5 minutes)
- **Verify**: Test bot with V3 pairs (30 minutes)

**Total time**: ~1 hour to full V3 support

---

## Additional Resources

- [The Graph Studio](https://thegraph.com/studio/)
- [The Graph Docs - Querying](https://thegraph.com/docs/en/querying/querying-the-graph/)
- [Uniswap V3 Subgraph](https://thegraph.com/explorer/subgraphs/3hCPRGf4z88VC5rsBKU5AA9FBBq5nF3jbKJG7VZCbhjm)
- [Uniswap V3 Factory Contract](https://polygonscan.com/address/0x1F98431c8aD98523631AE4a59f267346ea31F984)
