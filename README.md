# 🤖 On-Chain Arbitrage Bot with Flash Loans

**Flash loan arbitrage bot for Polygon network using Aave V3.**

---

## 📊 Current Status

| Component | Status |
|-----------|--------|
| **Smart Contract** | ✅ Deployed to Polygon: `0x671A158DA6248e965698726ebb5e3512AF171Af3` |
| **Bot Code** | ✅ TypeScript, fully functional |
| **Token Config** | ✅ 83 tokens across 20 tiers |
| **Build System** | ✅ Zero compilation errors |
| **Testing** | 🔄 Ready for 24-hour data collection |

**👉 [See Full Status](PROJECT_STATUS.md)**

---

## ⚡ Quick Start

```powershell
# 1. Validate configuration
node scripts/validate-tokens.js

# 2. Start bot (dry run mode)
npm run bot

# 3. Monitor real-time (optional - separate terminal)
node scripts/monitor-live.js

# 4. After 24 hours, analyze
node scripts/analyze-data.js
```

**👉 [Complete Quick Start Guide](QUICK_START.md)**

---

## 🎯 What This Bot Does

1. **Monitors Prices** across multiple DEXes (QuickSwap, Uniswap V3, SushiSwap)
2. **Detects Arbitrage** opportunities when price differences exist
3. **Executes Trades** using Aave V3 flash loans (zero upfront capital)
4. **Keeps Profit** after repaying loan + fees

### How It Works

```
1. Bot finds: WETH cheaper on QuickSwap vs SushiSwap
2. Borrow USDC via flash loan (e.g., $10,000)
3. Buy WETH on QuickSwap (cheaper)
4. Sell WETH on SushiSwap (higher price)
5. Repay flash loan + 0.05% fee
6. Keep the profit! 💰
```

**All in one atomic transaction** - if any step fails, everything reverts (no loss!)

---

## 🌐 Network: Polygon

**Why Polygon?**
- ⚡ **Ultra-Low Gas:** $0.01-0.05 per trade (vs $30-100 on Ethereum)
- 🚀 **Fast Blocks:** 2-second confirmation
- 💧 **Good Liquidity:** Active DEX ecosystem
- ✅ **Aave V3 Support:** Flash loans available
- 🔄 **High DEX Activity:** QuickSwap, Uniswap, SushiSwap, Curve

| Network | Gas Cost | Profit Needed | Viability |
|---------|----------|---------------|-----------|
| Ethereum | $30-100 | 3%+ | ❌ Too expensive |
| Polygon | $0.01-0.05 | 0.05%+ | ✅ **IDEAL** |
| Arbitrum | $0.10-0.50 | 0.2%+ | 🟡 Good alternative |

---

## 📦 Tech Stack

- **Smart Contract:** Solidity 0.8.20 (Aave V3 + Uniswap V2)
- **Bot:** TypeScript + Node.js + ethers.js v6
- **Data:** JSON/CSV logging with auto-save
- **Network:** Polygon (chainId: 137)
- **RPC:** Alchemy free tier

---

## 🚀 Features

- ✅ **Flash Loans** - Borrow capital from Aave V3 (zero upfront capital needed)
- ✅ **Multi-DEX** - QuickSwap, Uniswap V3, SushiSwap support
- ✅ **83 Tokens** - Organized in 20 tiers by volume
- ✅ **Data Logging** - Auto-save every 5 minutes (JSON/CSV)
- ✅ **Dry Run Mode** - Test without risk
- ✅ **Real-time Monitor** - Live dashboard of opportunities
- ✅ **Analytics** - Post-run analysis and recommendations
- ✅ **Safety Controls** - Max loss limits, gas price caps, emergency pause

---

## 📚 Documentation

### **Start Here** ⭐
- **[PROJECT_STATUS.md](PROJECT_STATUS.md)** - Complete current status, what's working, what's pending
- **[QUICK_START.md](QUICK_START.md)** - Get running in 5 minutes

### **Configuration**
- **[src/config.ts](src/config.ts)** - All settings (tokens, DEXes, trading params)
- **[PAIR_GENERATION_GUIDE.md](PAIR_GENERATION_GUIDE.md)** - Generate trading pairs
- **[DATA_COLLECTION_GUIDE.md](DATA_COLLECTION_GUIDE.md)** - Data logging system

### **Technical Details**
- **[CONTRACT_EXPLANATION.md](CONTRACT_EXPLANATION.md)** - Smart contract deep dive
- **[BOT_GUIDE.md](BOT_GUIDE.md)** - Bot architecture and usage
- **[BUILD_FIXED.md](BUILD_FIXED.md)** - TypeScript compilation notes

### **Deployment**
- **[POLYGON_DEPLOYMENT_GUIDE.md](POLYGON_DEPLOYMENT_GUIDE.md)** - Polygon deployment
- **.env** - Environment configuration (API keys, private key)

---

## ⚙️ Configuration Highlights

### Tokens (83 total)
- **Tier 1:** WMATIC, WETH, WBTC, USDC, USDT, DAI (highest volume)
- **Tier 2:** LINK, AAVE, UNI, CRV, SUSHI, etc. (major DeFi)
- **Tier 3-20:** Gaming, metaverse, stablecoins, wrapped assets, etc.

### DEXes
- **QuickSwap** - Polygon's largest DEX (primary)
- **Uniswap V3** - High efficiency, concentrated liquidity
- **SushiSwap** - Good volume, wide token support

### Trading Parameters
- **Min Profit:** 30 bps (0.3%) - covers gas + flash loan fee
- **Max Gas:** 500 Gwei (Polygon rarely exceeds 100)
- **Max Trade:** $1000 (start conservative)
- **Slippage:** 50 bps (0.5%)
- **Flash Loan Fee:** 5 bps (0.05% - Aave standard)

---

## 📊 Expected Performance

### Polygon Mainnet Estimates
- **Opportunities:** 5-20 per day (market dependent)
- **Success Rate:** 40-70% (competition, slippage)
- **Profit per Trade:** $2-20 (after all fees)
- **Gas Cost:** $0.01-0.05 per trade
- **Flash Loan Fee:** 0.05% of borrowed amount

### Example Trade
```
Opportunity: WETH/USDC spread of 0.5%
Borrow: $10,000 USDC
Buy WETH: QuickSwap @ $2500.00
Sell WETH: SushiSwap @ $2512.50
Repay Flash Loan: $10,005 (0.05% fee)
Gas Cost: $0.03
Net Profit: $7.47 ✅
```

---

## 🔒 Security & Risk Management

### Built-in Safety
- ✅ **Dry Run Mode** - Test without financial risk
- ✅ **Max Trade Size** - Limit exposure ($1000 default)
- ✅ **Gas Price Cap** - Refuse trades when gas too high
- ✅ **Daily Loss Limit** - Auto-pause if losses exceed threshold
- ✅ **Emergency Pause** - Owner can stop all trading instantly
- ✅ **Minimum Wallet Balance** - Keep gas reserve (1 MATIC)

### Known Risks
- ⚠️ **No Slippage Protection** (yet) - Vulnerable to price movement
- ⚠️ **No MEV Protection** - Vulnerable to frontrunning
- ⚠️ **Unaudited Contract** - Use at your own risk
- ⚠️ **Market Competition** - Other bots compete for same opportunities

**Mitigation:** Start with small amounts, monitor closely, add protections before scaling.

---

## 📈 Development Roadmap

### ✅ Completed
- [x] Research networks and flash loan providers
- [x] Develop smart contract with flash loans
- [x] Deploy to Polygon mainnet (`0x671A158DA6248e965698726ebb5e3512AF171Af3`)
- [x] Build TypeScript bot with price monitoring
- [x] Configure 83 tokens across 20 tiers
- [x] Add data logging system (JSON/CSV)
- [x] Create analysis tools
- [x] Fix all compilation errors
- [x] Validate entire configuration

### 🔄 In Progress
- [ ] **24-hour data collection test** ← **CURRENT STEP**
- [ ] Analyze profitability and optimize pairs

### ⏳ Planned
- [ ] Add slippage protection to contract
- [ ] Implement MEV protection (Flashbots)
- [ ] Add real-time alerts (Telegram)
- [ ] Enable live trading (small amounts)
- [ ] Scale up based on performance
- [ ] Multi-network expansion

---

## 💰 Economics

### Initial Investment
- **Gas Wallet:** ~$20 (39.90 MATIC for gas)
- **No Capital Needed:** Flash loans provide liquidity

### Monthly Costs
- **Gas:** $10-50 (depends on trade frequency)
- **RPC:** $0 (Alchemy free tier sufficient)
- **Total:** $10-50/month

### Potential Returns (Optimistic)
- **Per Trade:** $2-20 profit
- **Per Day:** $10-200 (5-20 trades)
- **Per Month:** $300-6000
- **Break-even:** Within first week

**Reality Check:** Actual returns depend heavily on market conditions, competition, and execution speed. Many arbitrage bots struggle to profit consistently.

---

## 🛠️ Useful Commands

```powershell
# Validation
node scripts/validate-tokens.js        # Check token addresses
npx tsc --noEmit                       # Type check

# Bot Operations  
npm run build                          # Compile TypeScript
npm run bot                            # Start arbitrage bot

# Monitoring & Analysis
node scripts/monitor-live.js           # Real-time dashboard
node scripts/analyze-data.js           # Analyze logged data
node scripts/generate-pairs.js --top=20 # Generate trading pairs

# Development
npm test                               # Run tests (if any)
npm run compile                        # Compile Hardhat contracts
```

---

## ⚠️ Important Warnings

1. **Start with Dry Run** - Always test in simulation mode first
2. **Use Small Amounts** - Start with $50-100 trades maximum
3. **Monitor Actively** - Watch every trade at the beginning
4. **Understand Risks** - Flash loan failures, slippage, MEV, gas costs
5. **No Guarantees** - Arbitrage opportunities are rare and competitive
6. **Test Extensively** - 24+ hours of data before going live
7. **Never Share Keys** - Keep your private key secure

---

## 📧 Support

- **GitHub:** [@danywayGit](https://github.com/danywayGit)
- **Repo:** [OnChainArbitrage](https://github.com/danywayGit/OnChainArbitrage)
- **Issues:** Open a GitHub issue for bugs/questions

---

## 📜 License

MIT License - See [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Aave V3** - Flash loan infrastructure
- **QuickSwap** - Primary DEX on Polygon
- **Alchemy** - RPC provider
- **OpenZeppelin** - Secure smart contract libraries
- **Hardhat** - Development framework

---

## ⚠️ Disclaimer

**This software is provided for educational purposes only.**

Cryptocurrency trading involves substantial risk of loss. Flash loan arbitrage is highly competitive and may not be profitable. The authors are not responsible for any financial losses incurred through the use of this software.

**Always:**
- Test thoroughly on testnets first
- Start with amounts you can afford to lose
- Understand the risks before deploying
- Consider this experimental software

---

## 🎯 Next Steps

### **Right Now:**

1. **Read:** [PROJECT_STATUS.md](PROJECT_STATUS.md) - Understand current state
2. **Start:** [QUICK_START.md](QUICK_START.md) - Get bot running
3. **Test:** Run 24-hour data collection
4. **Analyze:** Review opportunities and profitability
5. **Decide:** Go live (carefully) or optimize further

---

**🚀 Ready to start? Run:** `npm run bot`

**💡 Questions? Check:** [PROJECT_STATUS.md](PROJECT_STATUS.md)

---

**Good luck with your arbitrage trading! May the spreads be in your favor! 🤖💰**
