# 🚀 Multi-Chain Arbitrage Bot - Quick Start Guide

## 📋 Overview

A sophisticated multi-chain arbitrage bot that monitors DEX price differences across **3 EVM chains** simultaneously:

- 🟣 **Polygon** - 6 DEXes, 18 pairs, 68 pools
- 🟡 **BSC** - 5 DEXes, 11 pairs, 48 pools  
- 🔵 **Base** - 4 DEXes, 11 pairs, 18 pools

**Total:** 15 DEXes, 40 pairs, ~134 pools | **Cost:** $0/month (free tier RPCs)

---

## ⚡ Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env` file and ensure these are set:
```properties
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
BSC_RPC_URL=https://bsc-dataseed.binance.org/
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY

POLYGON_WSS_URL=wss://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
BSC_WSS_URL=wss://bsc.publicnode.com
BASE_WSS_URL=wss://base-mainnet.g.alchemy.com/v2/YOUR_KEY
```

### 3. Build Project
```bash
npm run build
```

### 4. Test Connectivity
```bash
node scripts/test-multi-chain.js
```

**Expected Output:**
```
✅ Polygon    READY
✅ BSC        READY
✅ Base       READY
```

### 5. Launch Monitoring

**Option A: Single Chain**
```bash
NETWORK=polygon npm start  # Recommended for testing
```

**Option B: All 3 Chains**
```bash
node scripts/multi-chain-launcher.js  # Full multi-chain
```

---

## 🎯 Usage Scenarios

### Scenario 1: Testing / Development
**Goal:** Test on one chain, lowest cost

```bash
# Build
npm run build

# Run Polygon (most tested)
NETWORK=polygon npm start

# Watch for arbitrage opportunities
# Press Ctrl+C to stop
```

**Expected:** 4-8 opportunities per 30 seconds, 0.6-1.2% spreads

### Scenario 2: Data Collection
**Goal:** Compare all chains, find best performer

```bash
# Test connectivity first
node scripts/test-multi-chain.js

# Launch all chains
node scripts/multi-chain-launcher.js

# Let run for 1-24 hours
# Press Ctrl+C to see statistics
```

**Expected:** Real-time comparison showing which chain has most/best opportunities

### Scenario 3: Production Monitoring
**Goal:** Focus on most profitable chain

```bash
# Based on data collection, choose best chain
NETWORK=polygon npm start  # Or bsc, or base

# Run in background
NETWORK=polygon npm start > polygon.log 2>&1 &
```

---

## 📊 Chain Comparison

| Chain | Pools | Opp/30s | Avg Spread | Gas Cost | Best For |
|-------|-------|---------|------------|----------|----------|
| 🟣 Polygon | 68 | 4-8 | 0.6-1.2% | $0.01-0.05 | **Frequency** |
| 🟡 BSC | 48 | 2-5 | 0.7-1.5% | $0.10-0.30 | **Spreads** |
| 🔵 Base | 18 | 1-3 | 0.5-1.0% | $0.01-0.05 | **Speed (L2)** |

**Recommendation:** Start with Polygon (highest frequency, lowest cost)

---

## 🛠️ Available Scripts

### Testing
```bash
# Test all chains
node scripts/test-multi-chain.js

# Test Polygon config
node scripts/test-polygon-config.js

# Test BSC config
node scripts/test-bsc-config.js

# Test Base config
node scripts/test-base-config.js
```

### Monitoring
```bash
# Single chain
NETWORK=polygon npm start   # Polygon
NETWORK=bsc npm start        # BSC
NETWORK=base npm start       # Base

# Multi-chain
node scripts/multi-chain-launcher.js
```

### Analysis
```bash
# Performance analyzer (with test data)
node scripts/multi-chain-analyzer.js
```

---

## 📁 Project Structure

```
OnChainArbitrage/
├── src/
│   ├── config.ts              # Chain configs (Polygon, BSC, Base)
│   ├── eventPriceMonitor.ts   # WebSocket monitoring
│   ├── dynamicPairs.ts        # Dynamic pair loading
│   ├── main.ts                # Entry point
│   └── multichainConfig.ts    # Multi-chain reference
├── scripts/
│   ├── test-multi-chain.js           # Connectivity tester ⭐
│   ├── multi-chain-launcher.js       # Launch all chains ⭐
│   ├── multi-chain-analyzer.js       # Performance comparison ⭐
│   ├── test-polygon-config.js        # Polygon validator
│   ├── test-bsc-config.js            # BSC validator
│   └── test-base-config.js           # Base validator
├── docs/
│   ├── PHASE1-COMPLETE.md     # Polygon expansion
│   ├── PHASE2-BSC-SUCCESS.md  # BSC integration
│   ├── PHASE3-COMPLETE.md     # Base integration
│   ├── PHASE4-COMPLETE.md     # Multi-chain strategy ⭐
│   └── MULTICHAIN-SUMMARY.md  # Overall summary
└── .env                        # RPC endpoints
```

---

## 🔧 Configuration

### Chain Selection
Set `NETWORK` environment variable:
```bash
NETWORK=polygon  # Default
NETWORK=bsc      # BSC
NETWORK=base     # Base
```

### Token Addresses
Each chain has specific token addresses in `src/config.ts`:
- `tokens` - Polygon tokens
- `tokensBSC` - BSC tokens
- `tokensBase` - Base tokens

### DEX Routers
Each chain has specific DEX routers:
- `dexes` - Polygon DEXes (6)
- `dexesBSC` - BSC DEXes (5)
- `dexesBase` - Base DEXes (4)

### Trading Pairs
Each chain has optimized pairs:
- `watchedPairs` - Polygon pairs (18 enabled)
- `watchedPairsBSC` - BSC pairs (11 enabled)
- `watchedPairsBase` - Base pairs (11 enabled)

**Note:** All pairs exclude native/stablecoins (WMATIC/USDC, WBNB/USDT, etc.)

---

## 🎯 Optimization Strategy

### Pairs Excluded (Following User Requirements)
❌ **Stablecoin vs Stablecoin**
- FRAX/USDC, FRAX/DAI, MAI/DAI, etc.

❌ **Top 15 High-Volume Pairs**
- WETH/DAI, etc.

❌ **Native vs Stablecoins**
- WMATIC/USDC, WMATIC/USDT (Polygon)
- WBNB/USDT, WBNB/BUSD, WBNB/USDC (BSC)
- WETH/USDC, WETH/USDT (Base)

❌ **Major Coins vs Stablecoins**
- WETH/USDT, WETH/BUSD (BSC)
- BTCB/USDT, BTCB/BUSD (BSC)
- WBTC/USDC (Base)

✅ **Kept Pairs**
- DeFi tokens (SUSHI, CRV, BAL, UNI, LINK, AAVE)
- Native tokens (WMATIC, WBNB pairs with altcoins)
- Gaming tokens (GHST, AXS, SAND, MANA)
- Layer 1 tokens (SOL, AVAX, ATOM, NEAR)
- Chain-specific tokens (CAKE, BANANA on BSC; BSWAP, TOSHI on Base)

---

## 💰 Cost Structure

### Free Tier (Current)
- **Polygon:** Alchemy free tier (40M compute units/month)
- **BSC:** Binance official RPC (unlimited, free)
- **Base:** Alchemy free tier (included with Polygon)
- **Total:** $0/month

### Paid Tier (If Scaling)
- **Alchemy Growth:** $49/month (12M req/month, all chains)
- **QuickNode:** $9-49/month per chain
- **Total (3 chains):** $50-150/month

**Current Status:** Free tier sufficient for monitoring, testing, and small-scale trading

---

## 📈 Performance Metrics

### Phase 1 Results (Polygon)
- ✅ 4 arbitrage opportunities in 30 seconds
- ✅ 0.63-0.85% spreads detected
- ✅ 68 pool subscriptions active
- ✅ All DEXes connected successfully

### Phase 2 Results (BSC)
- ✅ 88% pool coverage (22/25 tested)
- ✅ 4.7M CAKE liquidity on CAKE/WBNB
- ✅ BiSwap 0.1% fee = competitive advantage
- ✅ ~48 estimated total pools

### Phase 3 Results (Base)
- ✅ 40% pool coverage (6/15 tested)
- ✅ BSWAP and TOSHI have best liquidity
- ✅ BaseSwap and SushiSwap working well
- ✅ ~18 estimated total pools
- ⚠️ Aerodrome incompatible (uses concentrated liquidity)

### Phase 4 Results (Multi-Chain)
- ✅ All 3 chains validated and ready
- ✅ 134 total pools across chains
- ✅ Process isolation working perfectly
- ✅ Real-time monitoring operational
- ✅ $0/month cost maintained

---

## 🚨 Known Issues & Workarounds

### 1. Alchemy Doesn't Support BSC
**Issue:** BSC not available on Alchemy  
**Workaround:** Use Binance official RPC (free, reliable)  
**Status:** ✅ Working perfectly

### 2. Base Aerodrome Incompatible
**Issue:** Aerodrome uses concentrated liquidity (not Uniswap V2)  
**Impact:** Cannot query pools using standard factory  
**Workaround:** Focus on BaseSwap and SushiSwap for Base  
**Status:** ⚠️ Known limitation

### 3. WebSocket Rate Limits
**Issue:** Free tier WebSockets may disconnect under heavy load  
**Workaround:** Implement reconnection logic (already in code)  
**Status:** ✅ Auto-reconnect working

### 4. Public RPCs Slower
**Issue:** BSC public RPC slower than Alchemy  
**Impact:** Slightly higher latency on BSC  
**Workaround:** Acceptable for monitoring, consider paid RPC for production  
**Status:** ⚠️ Acceptable for current use

---

## 🎓 Next Steps

### Step 1: Collect Data (Recommended)
Run multi-chain monitoring for 24 hours:
```bash
node scripts/multi-chain-launcher.js
# Let run overnight
# Review statistics
```

### Step 2: Choose Deployment Strategy
Based on data:
- **Single chain:** Focus on best performer
- **Dual chain:** Polygon + BSC for coverage
- **All three:** Maximum opportunities

### Step 3: Implement Execution (Advanced)
Add automated trading:
- Wallet integration
- DEX router calls
- Gas price optimization
- Slippage protection

### Step 4: Monitor & Optimize
- Track profitability
- Adjust pairs based on performance
- Scale up on successful chains
- Add more chains if needed

---

## 📚 Documentation

- **[PHASE1-COMPLETE.md](./PHASE1-COMPLETE.md)** - Polygon expansion (6 DEXes added)
- **[PHASE2-BSC-SUCCESS.md](./PHASE2-BSC-SUCCESS.md)** - BSC integration
- **[BSC-FINAL-OPTIMIZED.md](./BSC-FINAL-OPTIMIZED.md)** - BSC optimization
- **[PHASE3-COMPLETE.md](./PHASE3-COMPLETE.md)** - Base integration
- **[PHASE4-COMPLETE.md](./PHASE4-COMPLETE.md)** - Multi-chain strategy ⭐
- **[MULTICHAIN-SUMMARY.md](./MULTICHAIN-SUMMARY.md)** - Overall summary

---

## 🤝 Support

**Issues?**
1. Check connectivity: `node scripts/test-multi-chain.js`
2. Verify .env configuration
3. Rebuild project: `npm run build`
4. Check documentation in `docs/` folder

**Common Fixes:**
- **"Chain not ready"** → Check RPC URL in .env
- **"No opportunities"** → Normal during low-volatility periods
- **"WebSocket disconnect"** → Auto-reconnect should handle it
- **"Build errors"** → Run `npm install` again

---

## 📊 System Status

**Current Version:** Multi-Chain v4.0  
**Deployment Status:** ✅ Production Ready (Monitoring Only)  
**Execution Status:** ⏳ Not Implemented (Manual Trading Required)  
**Tested:** ✅ All 3 Chains Validated  
**Cost:** $0/month (Free Tier RPCs)  
**Scalability:** Can add 2-3 more chains without paid services

---

## ⚖️ Legal Disclaimer

This software is for **educational and research purposes only**. 

- Cryptocurrency trading involves substantial risk
- No guarantee of profit or performance
- Not financial advice
- Test on testnet before mainnet
- Use at your own risk

---

**Built with ❤️ for multi-chain DeFi arbitrage**

*Last Updated: October 19, 2025 - Phase 4 Complete*
