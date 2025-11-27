# 🤖 OnChainArbitrage

> Multi-chain flash loan arbitrage bot for Polygon, BSC, and Base networks

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-orange)](https://soliditylang.org/)
[![Node](https://img.shields.io/badge/Node-18%2B-green)](https://nodejs.org/)

---

## 🎯 What Is This?

A fully automated arbitrage bot that:
- 🔍 **Monitors** 20+ trading pairs across multiple DEXes
- 💰 **Executes** profitable trades using Aave V3 flash loans
- ⚡ **Operates** on low-gas networks (Polygon, BSC, Base)
- 📊 **Logs** all opportunities for analysis
- 🛡️ **Protects** against slippage and MEV attacks

**No upfront capital needed** - uses flash loans to borrow trading capital!

---

## ⚡ Quick Start

```powershell
# 1. Clone and install
git clone https://github.com/danywayGit/OnChainArbitrage.git
cd OnChainArbitrage
npm install

# 2. Configure
cp .env.example .env
# Edit .env: Add your Alchemy RPC URL and private key

# 3. Build
npm run build

# 4. Run (dry run mode - no real trades)
$env:DRY_RUN="true"; npm run bot
```

**📚 [Full Setup Guide](docs/guides/QUICK-START.md)** | **🎥 [Video Tutorial](#)**

---

## 📊 How It Works

```
1. Bot detects price difference between DEXes
   Example: WMATIC/USDC = $0.19 on QuickSwap, $0.195 on Uniswap (2.6% spread)

2. Request flash loan from Aave V3
   Borrow $10,000 USDC (no upfront capital!)

3. Execute arbitrage trade
   Buy WMATIC on QuickSwap → Sell on Uniswap

4. Repay flash loan + 0.05% fee
   Return $10,005 to Aave

5. Keep profit
   Net profit: ~$245 - gas (~$0.02) = ~$245 ✅
```

**All in one atomic transaction** - if any step fails, everything reverts (zero loss risk from trade failure).

---

## 🚀 Features

### Core Functionality
- ✅ **Flash Loans** - Zero upfront capital using Aave V3
- ✅ **Multi-Chain** - Polygon, BSC, Base support
- ✅ **V2 + V3 DEXes** - QuickSwap, Uniswap V3, SushiSwap, BaseSwap, PancakeSwap
- ✅ **Smart Filtering** - Excludes fake pools and low liquidity
- ✅ **Real-time Monitoring** - 1-second polling interval

### Safety & Analysis
- ✅ **Dry Run Mode** - Test without financial risk
- ✅ **Data Logging** - JSON/CSV export for analysis
- ✅ **Gas Price Cap** - Reject trades when gas too high
- ✅ **Liquidity Checks** - Minimum $5K pool size
- ✅ **Slippage Protection** - Configurable tolerance

### Advanced
- 🔄 **V3 Optimization** - Fee tier selection, concentrated liquidity
- 🔄 **MEV Protection** - Flashbots integration (coming soon)
- 🔄 **Telegram Alerts** - Real-time notifications (coming soon)

---

## 📈 Expected Performance

| Metric | Estimate | Notes |
|--------|----------|-------|
| **Opportunities/Day** | 5-20 | Market dependent |
| **Success Rate** | 10-40% | Highly competitive |
| **Profit/Trade** | $2-$20 | After all fees |
| **Gas Cost** | $0.01-$0.05 | Polygon mainnet |
| **Flash Loan Fee** | 0.05% | Aave standard |

**Example Trade:**
```
Opportunity: WETH/USDC spread = 0.5%
Borrow: $10,000 USDC
Profit: $50 (0.5% of $10k)
Flash Loan Fee: -$5 (0.05%)
Gas: -$0.02
Net Profit: $44.98 ✅
```

**⚠️ Reality Check:** Many arbitrage bots struggle due to MEV competition, gas costs, and market efficiency. Start small and test thoroughly.

---

## 🛠️ Installation

### Prerequisites
```powershell
# Check versions
node --version   # Should be 18+
npm --version    # Should be 9+
```

**Need to install Node.js?** [Download here](https://nodejs.org/)

### Step-by-Step Setup

#### 1. Clone Repository
```powershell
git clone https://github.com/danywayGit/OnChainArbitrage.git
cd OnChainArbitrage
```

#### 2. Install Dependencies
```powershell
npm install
```

#### 3. Get Free RPC API Key
1. Visit [Alchemy](https://www.alchemy.com/) (recommended) or [Infura](https://www.infura.io/)
2. Sign up (free, no credit card)
3. Create app for **Polygon** (or your chosen network)
4. Copy API key

#### 4. Configure Environment
```powershell
# Copy template
cp .env.example .env

# Edit .env
notepad .env  # Windows
# or
code .env     # VS Code
```

**Minimum required in .env:**
```bash
# RPC URL (get from Alchemy)
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY_HERE

# Your wallet private key (KEEP SECRET!)
PRIVATE_KEY=0x...

# Optional: The Graph API for V3 support
GRAPH_API_KEY=...

# Optional: For contract verification
POLYGONSCAN_API_KEY=...
```

#### 5. Build Project
```powershell
npm run compile  # Compile smart contracts
npm run build    # Build TypeScript
```

#### 6. Verify Setup
```powershell
# Type check
npx tsc --noEmit

# Check wallet balance
npx ts-node scripts/check-balance.ts
```

**📚 [Detailed Installation Guide](docs/guides/INSTALLATION.md)**

---

## 🎮 Usage

### Run Bot
```powershell
# Dry run (simulation only - recommended for first time)
$env:DRY_RUN="true"; npm run bot

# Live trading on Polygon (default)
npm run bot

# Specific network
$env:NETWORK="bsc"; npm run bot
$env:NETWORK="base"; npm run bot
```

### Monitor Performance
```powershell
# Real-time dashboard
node scripts/monitor-live.js

# Analyze collected data
node scripts/analyze-data.js
```

### Discover New Pairs
```powershell
# Find high-liquidity pairs (requires GRAPH_API_KEY in .env)
node scripts/discover-high-liquidity-pairs-v2.js
```

### Check Balances
```powershell
# Wallet balance
npx ts-node scripts/check-balance.ts

# Contract balance
npx ts-node scripts/check-contract-balance.ts
```

**📚 [Full Usage Guide](docs/guides/CONFIGURATION.md)**

---

## ⚙️ Configuration

### Key Settings (src/config.ts)

```typescript
trading: {
  minProfitBps: 30,                    // 0.3% minimum profit
  maxGasPrice: 500n * 10n ** 9n,       // 500 Gwei max
  minPoolLiquidity: 5000,              // $5K minimum pool size
  pollingInterval: 1000,               // Check every 1 second
  maxTradeSize: 1000,                  // $1K max per trade
}
```

### Supported Networks
| Network | Chain ID | Gas Cost | Status |
|---------|----------|----------|--------|
| **Polygon** | 137 | $0.01-$0.05 | ✅ Recommended |
| **BSC** | 56 | $0.10-$0.50 | ✅ Working |
| **Base** | 8453 | $0.02-$0.10 | ✅ Working |

### Supported DEXes
| DEX | Networks | Type | Status |
|-----|----------|------|--------|
| QuickSwap | Polygon | V2 | ✅ |
| Uniswap V3 | Polygon, Base | V3 | ✅ |
| SushiSwap | Polygon, BSC, Base | V2 | ✅ |
| PancakeSwap | BSC | V2 | ✅ |
| BaseSwap | Base | V2 | ✅ |

**📚 [Configuration Guide](docs/guides/CONFIGURATION.md)**

---

## 📁 Project Structure

```
OnChainArbitrage/
├── contracts/           # Solidity smart contracts
│   ├── FlashLoanArbitrage.sol
│   └── interfaces/
├── src/                 # TypeScript bot source
│   ├── bot.ts           # Main bot orchestrator
│   ├── priceMonitor.ts  # Price monitoring
│   ├── tradeExecutor.ts # Trade execution
│   ├── config.ts        # Configuration
│   └── logger.ts        # Logging utilities
├── scripts/             # Utility scripts
│   ├── deploy-*.ts      # Deployment
│   ├── discover-*.js    # Pair discovery
│   └── check-*.ts       # Balance checks
├── test/                # Test files
├── docs/                # Documentation
├── data/                # Trading pair data
└── logs/                # Runtime logs (auto-generated)
```

**📚 [Full Structure Guide](PROJECT_STRUCTURE_PROPOSAL.md)**

---

## 🧪 Testing

```powershell
# Run all tests
npm test

# Run specific test file
npx hardhat test test/FlashLoanArbitrage.test.ts

# Test with coverage
npm run test:coverage

# Mainnet fork testing (safe, no real funds)
npx hardhat node --fork $env:POLYGON_RPC_URL
# In another terminal:
npm run bot
```

**📚 [Testing Guide](test/README.md)**

---

## 🚢 Deployment

### Deploy to Polygon
```powershell
# 1. Deploy contract
npx hardhat run scripts/deploy-v3-upgrade.ts --network polygon

# 2. Copy contract address from output
# Example: 0x671A158DA6248e965698726ebb5e3512AF171Af3

# 3. Update .env
CONTRACT_ADDRESS=0x671A158DA6248e965698726ebb5e3512AF171Af3

# 4. Fund contract with gas (optional)
npx ts-node scripts/fund-new-contract.ts

# 5. Verify on PolygonScan (optional)
npx hardhat verify --network polygon <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

### Deploy to Other Networks
```powershell
# Base
npx hardhat run scripts/deploy-to-base.ts --network base

# BSC (similar process)
npx hardhat run scripts/deploy.ts --network bsc
```

**📚 [Deployment Guide](docs/guides/DEPLOYMENT.md)**

---

## 💰 Economics

### Initial Investment
| Item | Cost | Notes |
|------|------|-------|
| **Gas Wallet** | $10-20 | ~40 MATIC for gas |
| **Trading Capital** | $0 | Flash loans provide capital |
| **RPC Access** | $0 | Alchemy free tier OK |
| **Total** | **$10-20** | |

### Monthly Costs
| Item | Cost | Notes |
|------|------|-------|
| **Gas** | $10-50 | Depends on trade frequency |
| **RPC** | $0 | Free tier sufficient |
| **Total** | **$10-50** | |

### Potential Returns (Optimistic)
| Timeframe | Profit | Assumptions |
|-----------|--------|-------------|
| **Per Trade** | $2-20 | After all fees |
| **Per Day** | $10-200 | 5-20 successful trades |
| **Per Month** | $300-6K | 30 days |

**⚠️ Disclaimer:** These are optimistic estimates. Actual returns highly variable due to:
- Market competition (MEV bots)
- Gas price volatility
- Market efficiency
- Execution speed

Many arbitrage bots struggle to profit consistently.

---

## 🔐 Security

### Built-in Safety Features
- ✅ **Atomic Transactions** - All or nothing, no partial losses
- ✅ **Reentrancy Protection** - Smart contract security
- ✅ **SafeERC20** - Safe token transfers
- ✅ **Emergency Pause** - Owner can stop trading
- ✅ **Gas Price Cap** - Reject expensive trades
- ✅ **Daily Loss Limit** - Auto-pause if losses exceed threshold

### Risk Management
```typescript
// Example: src/config.ts
trading: {
  maxTradeSize: 1000,           // Limit exposure per trade
  maxGasPrice: 500n * 10n ** 9n, // Don't overpay for gas
  minProfitBps: 30,             // Only profitable trades
  maxDailyLoss: 25,             // Stop if losing too much
}
```

### Known Risks
- ⚠️ **Smart Contract Risk** - Unaudited contracts
- ⚠️ **MEV Risk** - Vulnerable to frontrunning
- ⚠️ **Slippage Risk** - Price movement during trade
- ⚠️ **Gas Cost Risk** - High gas can eliminate profit
- ⚠️ **Market Risk** - Competition from other bots

**Mitigation:**
1. Start with small trade sizes
2. Use dry run mode extensively
3. Test on testnet first
4. Monitor actively
5. Enable all safety features

**📚 [Security Best Practices](docs/technical/SECURITY.md)**

---

## 📊 Data & Logging

### Log Files (auto-generated in `logs/`)
```
logs/
├── bot-2025-11-27.log                    # Daily bot logs
├── opportunities_2025-11-27.json         # Detected opportunities
├── opportunities_2025-11-27.csv          # CSV format
└── stats_2025-11-27.json                 # Daily statistics
```

### Log Levels
```typescript
logger.info("Starting bot...")       // General info
logger.success("Trade executed!")    // Successful operations
logger.warning("Gas too high")       // Warnings
logger.error("Trade failed")         // Errors
logger.debug("Pool liquidity: $5K")  // Debug (only if DEBUG=true)
```

### Analyze Data
```powershell
# View opportunities
node scripts/analyze-data.js

# Real-time dashboard
node scripts/monitor-live.js

# Export to CSV
# Files already exported automatically to logs/ directory
```

**📚 [Data Logging Guide](docs/technical/DATA-LOGGING.md)**

---

## 🐛 Troubleshooting

### Bot Won't Start
```powershell
# Check for errors
npx tsc --noEmit

# Rebuild
npm run build

# Verify config
node scripts/validate-tokens.js
```

### No Opportunities Found
**This is normal!** Arbitrage opportunities are rare. Try:
- Run for 24+ hours
- Add more trading pairs
- Lower `minProfitBps` (risky - may not cover gas)
- Try different networks

### "Insufficient liquidity" Errors
**Problem:** V3 pools showing $0 liquidity  
**Solution:** V3 calculation uses placeholder. Pools are actually liquid. Adjust `minPoolLiquidity` if needed.

### RPC Rate Limiting
**Problem:** "429 Too Many Requests"  
**Solution:**
- Upgrade to Alchemy paid tier
- Increase `pollingInterval` in config
- Enable caching (check `priceMonitor.ts`)

### High Gas Costs
**Problem:** All trades rejected as unprofitable  
**Solution:**
- Wait for lower gas periods (night/weekend)
- Increase `minProfitBps`
- Trade larger amounts (better profit:gas ratio)

**📚 [Full Troubleshooting Guide](docs/guides/TROUBLESHOOTING.md)**

---

## 📚 Documentation

### Getting Started
- [Quick Start](docs/guides/QUICK-START.md) - 5-minute setup
- [Installation](docs/guides/INSTALLATION.md) - Detailed setup
- [Configuration](docs/guides/CONFIGURATION.md) - Customize settings
- [Deployment](docs/guides/DEPLOYMENT.md) - Deploy contracts

### Technical Documentation
- [Architecture](docs/technical/ARCHITECTURE.md) - System design
- [Smart Contracts](docs/technical/CONTRACT-EXPLANATION.md) - Solidity deep dive
- [Bot Logic](docs/technical/BOT-LOGIC.md) - TypeScript internals
- [Data Logging](docs/technical/DATA-LOGGING.md) - Logging system

### Advanced Topics
- [Liquidity Strategy](docs/strategies/LIQUIDITY_STRATEGY_UPDATE.md) - Pool selection
- [V3 Optimization](docs/strategies/UNISWAP_V3_OPTIMIZATION.md) - V3 best practices
- [Cache Optimization](docs/performance/CACHE_OPTIMIZATION.md) - Performance tuning

### Network Guides
- [Polygon](docs/network-guides/POLYGON.md) - Polygon setup
- [BSC](docs/network-guides/BSC.md) - BSC setup
- [Base](docs/network-guides/BASE.md) - Base setup

**📚 [Documentation Index](docs/README.md)**

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Start for Contributors
```powershell
# 1. Fork repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/OnChainArbitrage.git

# 3. Create feature branch
git checkout -b feature/amazing-feature

# 4. Make changes and test
npm run build
npm test

# 5. Commit and push
git commit -m 'Add amazing feature'
git push origin feature/amazing-feature

# 6. Open Pull Request on GitHub
```

### Areas We Need Help
- [ ] Unit test coverage
- [ ] MEV protection integration
- [ ] Telegram notification bot
- [ ] Multi-pair simultaneous execution
- [ ] Advanced analytics dashboard
- [ ] Documentation improvements

---

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

---

## ⚠️ Disclaimer

**FOR EDUCATIONAL PURPOSES ONLY**

This software is experimental and provided "as is". Cryptocurrency trading involves substantial risk of loss. Flash loan arbitrage is highly competitive and may not be profitable. The authors assume no responsibility for financial losses.

**Before using real funds:**
- ✅ Test thoroughly on testnet
- ✅ Start with small amounts you can afford to lose
- ✅ Understand all risks
- ✅ Monitor actively
- ✅ Consider this experimental software

**Not financial advice. Use at your own risk.**

---

## 🙏 Acknowledgments

- **[Aave](https://aave.com/)** - Flash loan infrastructure
- **[Uniswap](https://uniswap.org/)** - DEX protocols (V2/V3)
- **[OpenZeppelin](https://openzeppelin.com/)** - Secure smart contract libraries
- **[Hardhat](https://hardhat.org/)** - Ethereum development environment
- **[Alchemy](https://www.alchemy.com/)** - RPC infrastructure
- **[The Graph](https://thegraph.com/)** - Blockchain indexing

---

## 📧 Support

- **Issues:** [GitHub Issues](https://github.com/danywayGit/OnChainArbitrage/issues)
- **Discussions:** [GitHub Discussions](https://github.com/danywayGit/OnChainArbitrage/discussions)
- **Documentation:** [docs/](docs/)

---

## 🔗 Links

- **GitHub:** [github.com/danywayGit/OnChainArbitrage](https://github.com/danywayGit/OnChainArbitrage)
- **Author:** [@danywayGit](https://github.com/danywayGit)

---

<div align="center">

**Built with ❤️ by [@danywayGit](https://github.com/danywayGit)**

**⭐ Star this repo if you find it useful!**

</div>
