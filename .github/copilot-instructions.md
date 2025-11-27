# GitHub Copilot Instructions for OnChainArbitrage

## 🎯 Project Overview

**OnChainArbitrage** is a flash loan arbitrage bot that monitors trading opportunities across multiple DEXes (QuickSwap, Uniswap V3, SushiSwap) on Polygon, BSC, and Base networks. The bot detects price differences, simulates trades, and executes profitable arbitrage transactions using Aave V3 flash loans.

**Tech Stack:**
- **Smart Contracts:** Solidity 0.8.20 (Aave V3 + Uniswap V2/V3)
- **Bot:** TypeScript + Node.js 18+ + ethers.js v6
- **Build:** Hardhat + TypeScript
- **Data:** JSON/CSV logging with auto-save
- **Networks:** Polygon (primary), BSC, Base

---

## 📁 Project Structure

```
OnChainArbitrage/
├── contracts/              # Solidity smart contracts
│   ├── FlashLoanArbitrage.sol  # Main arbitrage contract
│   ├── FundWithdrawer.sol      # Utility for fund management
│   └── interfaces/             # Uniswap V2/V3 interfaces
├── src/                    # TypeScript bot source code
│   ├── bot.ts              # Main bot entry point
│   ├── priceMonitor.ts     # Price fetching & opportunity detection
│   ├── tradeExecutor.ts    # Trade execution logic
│   ├── config.ts           # Centralized configuration
│   ├── logger.ts           # Colored console logging
│   ├── dataLogger.ts       # JSON/CSV data persistence
│   └── config/             # Network configurations
├── scripts/                # Utility scripts (JS/TS)
│   ├── deploy*.ts          # Deployment scripts
│   ├── discover-*.js       # Pair discovery tools
│   ├── check-*.ts          # Balance checking utilities
│   └── test-*.js           # Testing utilities
├── data/                   # Data files
│   └── trading-pairs.json  # Discovered trading pairs
├── docs/                   # Technical documentation
├── test/                   # Hardhat tests
├── logs/                   # Bot runtime logs (auto-generated)
├── archive/                # Historical documentation
├── .env                    # Environment variables (NEVER commit!)
├── .env.example            # Environment template
├── hardhat.config.ts       # Hardhat configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies & scripts
```

---

## 🐍 Python Development Guidelines

### **CRITICAL: Always Use Python Virtual Environment**

**For ANY Python-related work in this project, you MUST:**

1. **Create/activate virtual environment:**
   ```powershell
   # Create venv (first time only)
   python -m venv venv
   
   # Activate venv (EVERY TIME before Python work)
   .\venv\Scripts\Activate.ps1  # PowerShell
   # or
   venv\Scripts\activate.bat     # CMD
   ```

2. **Install dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```

3. **Add new dependencies:**
   ```powershell
   pip install <package>
   pip freeze > requirements.txt  # Update requirements
   ```

4. **Deactivate when done:**
   ```powershell
   deactivate
   ```

**⚠️ NEVER install packages globally. ALWAYS use venv.**

**Note:** Currently, this project is TypeScript/JavaScript-based. If Python scripts are added in the future, follow these guidelines strictly.

---

## 💻 Development Guidelines

### Code Style & Standards

1. **TypeScript:**
   - Use strict type checking (`tsconfig.json` has `strict: true`)
   - Prefer interfaces over types for object shapes
   - Use async/await over promises chains
   - Always handle errors with try-catch blocks
   - Use ethers.js v6 syntax (NOT v5)

2. **Solidity:**
   - Use Solidity 0.8.20
   - Follow OpenZeppelin standards
   - Include NatSpec comments (`@notice`, `@dev`, `@param`, `@return`)
   - Emit events for all state changes
   - Use SafeERC20 for token transfers

3. **Naming Conventions:**
   - Smart contracts: PascalCase (e.g., `FlashLoanArbitrage`)
   - TypeScript classes: PascalCase (e.g., `PriceMonitor`)
   - Functions/methods: camelCase (e.g., `executeArbitrage`)
   - Constants: UPPER_SNAKE_CASE (e.g., `MIN_PROFIT_BPS`)
   - Files: kebab-case (e.g., `price-monitor.ts`)

4. **Comments:**
   - Use `//` for single-line comments
   - Use `/** ... */` for JSDoc/TSDoc documentation
   - Explain WHY, not WHAT (code should be self-documenting)
   - Add context for complex logic or business rules

### Error Handling

```typescript
// ✅ Good: Specific error handling with logging
try {
  const result = await executeArbitrage(opportunity);
  logger.success(`Trade executed: ${result}`);
} catch (error: any) {
  logger.error(`Trade failed: ${error.message}`);
  stats.failureReasons.on_chain_revert++;
  throw error;
}

// ❌ Bad: Silent failures
try {
  await executeArbitrage(opportunity);
} catch (error) {
  // Empty catch - never do this!
}
```

### Ethers.js v6 Best Practices

```typescript
// ✅ Good: v6 syntax
const provider = new ethers.JsonRpcProvider(rpcUrl);
const balance = await provider.getBalance(address);
const formatted = ethers.formatEther(balance);

// ❌ Bad: v5 syntax (outdated)
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const formatted = ethers.utils.formatEther(balance);
```

---

## 🔧 Common Tasks & Commands

### Setup & Installation
```powershell
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Compile contracts
npm run compile

# Build TypeScript
npm run build

# Type check (no emit)
npx tsc --noEmit
```

### Running the Bot
```powershell
# Start bot on Polygon (default)
npm run bot

# Start on specific network
$env:NETWORK="polygon"; npm run bot
$env:NETWORK="bsc"; npm run bot
$env:NETWORK="base"; npm run bot

# Dry run mode (simulation only)
$env:DRY_RUN="true"; npm run bot
```

### Deployment
```powershell
# Deploy to Polygon
npx hardhat run scripts/deploy-v3-upgrade.ts --network polygon

# Deploy to Base
npx hardhat run scripts/deploy-to-base.ts --network base

# Verify contract
npx hardhat verify --network polygon <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

### Testing & Analysis
```powershell
# Run Hardhat tests
npm test

# Analyze collected data
node scripts/analyze-data.js

# Monitor live (real-time dashboard)
node scripts/monitor-live.js

# Discover high-liquidity pairs
node scripts/discover-high-liquidity-pairs-v2.js

# Validate token addresses
node scripts/validate-tokens.js
```

### Debugging
```powershell
# Check wallet balance
npx ts-node scripts/check-balance.ts

# Check contract balance
npx ts-node scripts/check-contract-balance.ts

# Test RPC connection
node scripts/test-multi-chain.js

# Verify deployment
npx ts-node scripts/verify-deployment.ts
```

---

## 🏗️ Architecture Overview

### Smart Contract Flow
```
1. User calls executeArbitrage()
2. Contract requests flash loan from Aave V3
3. Receive loaned tokens
4. Buy token on DEX1 (cheaper)
5. Sell token on DEX2 (higher price)
6. Repay flash loan + 0.05% fee
7. Keep profit (if any)
8. Emit ArbitrageExecuted event
```

### Bot Monitoring Flow
```
1. PriceMonitor scans configured trading pairs
2. Fetches prices from all DEXes (V2 + V3)
3. Calculates price differences
4. Filters by minimum profit threshold (0.3%)
5. TradeExecutor simulates trade on-chain
6. Executes if profitable after gas + fees
7. DataLogger saves opportunity to JSON/CSV
8. Stats updated and displayed
```

### Configuration Hierarchy
```
config.ts (main)
├── network.ts (RPC URLs, chain IDs)
├── tokens (83 curated tokens)
├── dexes (15 DEXes across 3 chains)
├── tradingPairs (20 high-liquidity pairs)
└── trading parameters (min profit, gas limits, etc.)
```

---

## 🔐 Security & Best Practices

### Environment Variables
```bash
# .env structure (NEVER commit this file!)
PRIVATE_KEY=0x...                    # Wallet private key
POLYGON_RPC_URL=https://...          # Alchemy/Infura RPC
BSC_RPC_URL=https://...
BASE_RPC_URL=https://...
CONTRACT_ADDRESS=0x...               # Deployed contract
GRAPH_API_KEY=...                    # The Graph API (for V3 queries)
POLYGONSCAN_API_KEY=...              # For contract verification
```

### Private Key Handling
```typescript
// ✅ Good: Load from environment
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

// ❌ Bad: NEVER hardcode private keys
const wallet = new ethers.Wallet("0xabc123...", provider);
```

### Gas Price Management
```typescript
// ✅ Good: Cap gas price to prevent overpaying
const gasPrice = await provider.getFeeData();
if (gasPrice.gasPrice! > config.trading.maxGasPrice) {
  throw new Error("Gas price too high");
}
```

---

## 📊 Data & Logging

### Log Levels
- `logger.banner()` - ASCII art banner
- `logger.info()` - General information (blue)
- `logger.success()` - Successful operations (green)
- `logger.warning()` - Warnings (yellow)
- `logger.error()` - Errors (red)
- `logger.debug()` - Debug info (gray, only if DEBUG=true)

### Data Files
```
logs/
├── bot-YYYY-MM-DD.log              # Daily bot logs
├── opportunities_YYYY-MM-DD.json    # Detected opportunities
├── opportunities_YYYY-MM-DD.csv     # CSV format
└── stats_YYYY-MM-DD.json           # Daily statistics

data/
└── trading-pairs.json              # Discovered pairs with liquidity
```

---

## 🧪 Testing Strategy

### Unit Tests
- Located in `test/`
- Use Hardhat + Chai
- Test smart contract functions
- Run with: `npm test`

### Integration Tests
- Test bot components together
- Verify DEX interactions
- Check data logging

### Mainnet Fork Testing
- Use Hardhat mainnet fork
- Test with real liquidity
- No risk of losing funds
- See: `scripts/setup-mainnet-fork.ts`

---

## 🚨 Common Issues & Solutions

### "Insufficient liquidity" errors
**Problem:** V3 pools showing $0 liquidity  
**Solution:** V3 liquidity calculation uses placeholder (100k). Update `priceMonitor.ts` if needed.

### "Pool too small" rejections
**Problem:** Minimum liquidity threshold too high  
**Solution:** Adjust `config.trading.minPoolLiquidity` (default: $5000)

### RPC rate limiting
**Problem:** Too many requests to public RPC  
**Solution:** 
- Use Alchemy/Infura paid tier
- Enable caching in `priceMonitor.ts`
- Increase polling interval

### High gas costs
**Problem:** Trades unprofitable due to gas  
**Solution:**
- Wait for low gas periods
- Increase minimum profit threshold
- Trade larger amounts to improve ratio

### No opportunities found
**Problem:** Bot finds 0 profitable trades  
**This is NORMAL.** Arbitrage opportunities are rare due to:
- Efficient markets
- MEV bot competition
- High gas costs
- Flash loan fees

**Solutions:**
- Run for 24+ hours
- Add more trading pairs
- Lower profit threshold (risky)
- Try different networks

---

## 📚 Key Files to Understand

1. **`src/config.ts`** - All bot settings, tokens, DEXes, pairs
2. **`src/bot.ts`** - Main bot logic & orchestration
3. **`src/priceMonitor.ts`** - Price fetching & opportunity detection
4. **`src/tradeExecutor.ts`** - Trade simulation & execution
5. **`contracts/FlashLoanArbitrage.sol`** - Core smart contract
6. **`.env.example`** - Required environment variables
7. **`hardhat.config.ts`** - Network & compiler configuration

---

## 🎓 Learning Resources

### Flash Loans
- [Aave V3 Flash Loans](https://docs.aave.com/developers/guides/flash-loans)
- [Flash Loan Attacks Explained](https://blog.chain.link/flash-loans/)

### DEX Trading
- [Uniswap V2 Docs](https://docs.uniswap.org/contracts/v2/overview)
- [Uniswap V3 Docs](https://docs.uniswap.org/contracts/v3/overview)
- [How AMMs Work](https://ethereum.org/en/developers/docs/dapps/amms/)

### Arbitrage
- [DeFi Arbitrage Explained](https://academy.binance.com/en/articles/what-is-arbitrage-trading-in-crypto)
- [MEV (Maximal Extractable Value)](https://ethereum.org/en/developers/docs/mev/)

### ethers.js v6
- [Official Documentation](https://docs.ethers.org/v6/)
- [Migration Guide (v5 → v6)](https://docs.ethers.org/v6/migrating/)

---

## 🤖 AI Assistant Guidelines

When helping with this project:

1. **Always check existing code** before suggesting changes
2. **Use ethers.js v6 syntax** (not v5)
3. **Follow TypeScript strict mode** requirements
4. **Preserve existing configuration** (don't randomly change trading params)
5. **Test suggestions** before recommending (mentally trace execution)
6. **Explain tradeoffs** (e.g., "Lower profit threshold = more opportunities but more risk")
7. **Consider gas costs** in all calculations
8. **Be realistic** about arbitrage profitability (it's hard!)
9. **For Python work**: ALWAYS mention virtual environment setup first
10. **Security first**: Never expose private keys or API keys

### Generating Code

**DO:**
- ✅ Add proper error handling
- ✅ Include TypeScript types
- ✅ Add comments explaining complex logic
- ✅ Use existing utilities (logger, config)
- ✅ Follow project conventions

**DON'T:**
- ❌ Use deprecated ethers.js v5 syntax
- ❌ Hardcode values (use config.ts)
- ❌ Skip error handling
- ❌ Break existing functionality
- ❌ Suggest risky changes without warnings

---

## 📝 Documentation Standards

### Code Comments
```typescript
/**
 * Execute arbitrage trade with flash loan
 * 
 * @param opportunity - Detected arbitrage opportunity
 * @returns Transaction receipt if successful
 * @throws Error if simulation fails or trade reverts
 * 
 * FLOW:
 * 1. Validate opportunity (liquidity, profit)
 * 2. Encode trade parameters
 * 3. Request flash loan from Aave
 * 4. Execute buy/sell on DEXes
 * 5. Repay loan + profit
 */
async function executeArbitrage(opportunity: ArbitrageOpportunity) {
  // Implementation...
}
```

### README Updates
- Keep README.md concise (TL;DR focus)
- Move detailed docs to separate files
- Use tables for feature comparisons
- Include visual diagrams where helpful

---

## 🔄 Workflow Best Practices

### Before Committing
```powershell
# 1. Type check
npx tsc --noEmit

# 2. Build
npm run build

# 3. Test (if applicable)
npm test

# 4. Format (optional)
npm run format
```

### Branch Strategy
- `main` - Production-ready code
- `develop` - Active development
- Feature branches for new features
- Hotfix branches for urgent fixes

### Commit Messages
```
feat: add Uniswap V3 support for price monitoring
fix: resolve V3 liquidity calculation returning $0
docs: update setup guide with Graph API instructions
refactor: extract DEX query logic into separate module
test: add unit tests for trade simulation
```

---

## 🎯 Current Project Status (as of Nov 2025)

### ✅ Working
- Multi-chain support (Polygon, BSC, Base)
- V2 + V3 DEX integration
- Flash loan execution
- Price monitoring & opportunity detection
- Data logging (JSON/CSV)
- 20 high-liquidity trading pairs

### 🔄 In Progress
- V3 liquidity calculation improvements
- Performance optimization
- Extended monitoring tests

### ⏳ Planned
- Slippage protection enhancements
- MEV protection (Flashbots)
- Real-time alerts (Telegram/Discord)
- Multi-pair optimization
- Profit/loss analytics dashboard

---

## 🆘 Getting Help

1. **Check existing docs** in `docs/` and root-level `.md` files
2. **Review archived guides** in `archive/` for historical context
3. **Read inline comments** in source code
4. **Test with dry run** before live trading: `DRY_RUN=true npm run bot`
5. **Start small** - Use testnet or small amounts first

---

**Remember: Arbitrage is competitive and challenging. This is an educational project. Always test thoroughly and understand the risks before deploying real funds.**
