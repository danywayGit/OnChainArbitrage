# 🚀 Quick Start: Polygon Mainnet

## ⚡ Fast Track to Live Trading

### 1️⃣ Get MATIC (5-10 MATIC ≈ $3-6)

```bash
# Buy on exchange
Binance → Withdraw → Polygon Network → Your wallet address

# Your wallet: Check PRIVATE_KEY in .env
```

### 2️⃣ Check Balance

```bash
npx hardhat run scripts/check-balance.ts --network polygon
```

### 3️⃣ Deploy Contract

```bash
npx hardhat run scripts/deploy.ts --network polygon
```

**Copy the deployed address!**

### 4️⃣ Update .env

```env
CONTRACT_ADDRESS=0xYourDeployedAddress
```

### 5️⃣ Start Bot (DRY RUN)

```bash
npm run bot
```

Watch for 24 hours. Look for:
- Opportunities found ✅
- Profit calculations correct ✅
- No errors ✅
- Gas costs low ✅

### 6️⃣ Go Live (Carefully!)

```env
ENABLE_DRY_RUN=false
```

Start with **$50-100 max** per trade!

---

## 📊 Polygon vs Ethereum

| Feature | Ethereum | Polygon |
|---------|----------|---------|
| Gas per trade | $30-100 ❌ | **$0.01-0.05** ✅ |
| Flash loan fee | 0.05% | 0.05% |
| Total cost ($1000 trade) | $30.50+ | **$0.51** ✅ |
| Profit needed to break even | 3%+ | **0.05%** ✅ |

**Polygon is 600-2000x cheaper!** 🚀

---

## 💰 Quick Math

```
Trade: $500
Profit: 0.5% = $2.50
Flash loan fee: 0.05% = $0.25
Gas: $0.03
Net profit: $2.22 ✅

Daily (10 trades): $22
Monthly: $666
Annual: $8,000+

Capital needed: $0 (flash loans!)
```

---

## ⚠️ Safety First

- [ ] Start with DRY RUN ✅
- [ ] Test for 24 hours ✅
- [ ] First live trades: $50-100 max ✅
- [ ] Monitor actively ✅
- [ ] Keep emergency stops enabled ✅
- [ ] Set daily loss limits ✅

---

## 🎯 Configuration Summary

**Already configured for you:**
- ✅ Network: Polygon (chainId: 137)
- ✅ Aave V3: Polygon address
- ✅ Tokens: WMATIC, WETH, USDC, USDT, DAI
- ✅ DEXes: QuickSwap, Uniswap V3, SushiSwap
- ✅ Min profit: 0.3%
- ✅ Max trade: $1000
- ✅ Safety limits: Conservative

---

## 📚 Files to Read

1. **POLYGON_DEPLOYMENT_GUIDE.md** - Complete guide
2. **src/config.ts** - All configuration
3. **.env** - Environment variables

---

## 🔧 Useful Commands

```bash
# Check balance
npx hardhat run scripts/check-balance.ts --network polygon

# Deploy
npx hardhat run scripts/deploy.ts --network polygon

# Verify contract
npx hardhat verify --network polygon ADDRESS AAVE_ADDRESS

# Start bot
npm run bot

# Check gas prices
curl https://gasstation.polygon.technology/v2
```

---

## 🎉 You're Ready!

**Timeline:**
- **Today:** Get MATIC + Deploy
- **Day 1-7:** Dry run testing
- **Week 2:** First live trades ($50-100)
- **Week 3+:** Scale up to $500-1000

**Expected results:**
- Week 1: $0 (dry run)
- Week 2: $50-100 (learning)
- Week 3-4: $200-500 (scaling)
- Month 2+: $500-1000+ (optimized)

Good luck! 🚀💰
