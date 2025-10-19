# Quick Start Guide - OnChain Arbitrage Bot

## 📋 Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js >= 18.0.0
- ✅ npm or yarn
- ✅ Git installed
- ✅ A code editor (VS Code recommended)
- ✅ Basic understanding of blockchain and DeFi

## 🚀 Step-by-Step Setup

### 1️⃣ Install Dependencies

```powershell
# Navigate to project directory
cd C:\Users\danyw\Documents\Git\DanywayGit\OnChainArbitrage

# Install all dependencies
npm install
```

This will install:
- Hardhat (Smart contract development)
- ethers.js v6 (Blockchain interactions)
- OpenZeppelin contracts (Security)
- Aave V3 contracts (Flash loans)
- TypeScript and all dev dependencies

### 2️⃣ Configure Environment

```powershell
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual values
# Use notepad or VS Code
code .env
```

**Required Configuration:**
```env
# Get free API keys from Alchemy.com or Infura.io
ARBITRUM_RPC_URL=https://arb-mainnet.g.alchemy.com/v2/YOUR_KEY
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY

# TESTNET first! Never use your main wallet
PRIVATE_KEY=your_testnet_wallet_private_key

# Trading parameters
MIN_PROFIT_THRESHOLD=0.5  # 0.5% minimum profit
MAX_GAS_PRICE=100         # Maximum 100 Gwei
```

### 3️⃣ Get Testnet Funds

Before using real money, test everything:

**Ethereum Sepolia (Get This First):**
- **Google Cloud Faucet** (BEST): https://cloud.google.com/application/web3/faucet/ethereum/sepolia
  - 0.05 ETH per day
  - No requirements

**Arbitrum Sepolia:**
- **QuickNode** (No requirements): https://faucet.quicknode.com/arbitrum/sepolia
- **Alchemy** (Requires 0.01 ETH on Arbitrum mainnet): https://www.alchemy.com/faucets/arbitrum-sepolia
  - 0.05 Arbitrum Sepolia ETH every 72 hours
- **Chainlink**: https://faucets.chain.link/arbitrum-sepolia
- **Triangle Platform**: https://faucet.triangleplatform.com/arbitrum/sepolia

**Polygon Amoy:**
- Faucet: https://faucet.polygon.technology/
- Get free testnet MATIC

### 4️⃣ Compile Contracts

```powershell
# Compile all smart contracts
npm run compile
```

This creates:
- Contract ABIs in `artifacts/`
- TypeChain types in `typechain-types/`

### 5️⃣ Run Tests

```powershell
# Run all tests (uses forked mainnet)
npm test

# Run with coverage report
npm run test:coverage

# Run with gas reporting
REPORT_GAS=true npm test
```

### 6️⃣ Deploy to Testnet

```powershell
# Deploy to Arbitrum Sepolia testnet
npm run deploy:testnet

# You should see output like:
# ✅ FlashLoanArbitrage deployed to: 0x123...
```

Save the contract address for later!

### 7️⃣ Verify Contract (Optional)

```powershell
# Verify on block explorer
npx hardhat verify --network arbitrumSepolia DEPLOYED_ADDRESS POOL_PROVIDER_ADDRESS
```

### 8️⃣ Test on Testnet

```powershell
# Start the bot on testnet (DRY RUN mode)
npm run start:testnet
```

The bot will:
- ✅ Monitor prices on multiple DEXs
- ✅ Detect arbitrage opportunities
- ✅ Calculate expected profit
- ✅ Simulate trades (not execute if DRY_RUN=true)

## 🎯 Understanding the Components

### Smart Contract (`FlashLoanArbitrage.sol`)
- Handles flash loan execution
- Performs token swaps across DEXs
- Calculates and returns profit
- Has emergency controls

### Bot Logic (`src/bot.ts` - to be created)
- Monitors DEX prices in real-time
- Detects arbitrage opportunities
- Estimates gas costs
- Executes profitable trades

### Configuration (`src/config/networks.ts`)
- Network definitions
- DEX addresses
- Token addresses
- Trading parameters

## 🔄 Typical Workflow

```
1. Monitor Prices
   ↓
2. Detect Price Difference > Minimum Threshold
   ↓
3. Calculate Expected Profit (after fees & gas)
   ↓
4. Is Profit > Threshold? → YES
   ↓
5. Request Flash Loan from Aave
   ↓
6. Buy Token A on DEX 1
   ↓
7. Sell Token A on DEX 2
   ↓
8. Repay Flash Loan + Fee
   ↓
9. Keep Profit 🎉
```

## 📊 Monitoring Your Bot

### Check Contract Stats
```typescript
// In Hardhat console
const contract = await ethers.getContractAt("FlashLoanArbitrage", "YOUR_ADDRESS");
const stats = await contract.getStats();
console.log("Total Profit:", stats.totalProfit);
console.log("Total Trades:", stats.totalTrades);
```

### View Transactions
- Arbitrum: https://arbiscan.io/address/YOUR_CONTRACT
- Polygon: https://polygonscan.com/address/YOUR_CONTRACT

## ⚠️ Important Safety Tips

### Before Going to Mainnet:

1. **Test Extensively on Testnet** (at least 1-2 weeks)
2. **Start with Small Amounts** ($100-$500)
3. **Set Strict Limits:**
   - Maximum trade size
   - Maximum daily loss
   - Minimum profit threshold

4. **Monitor Closely:**
   - Check every few hours initially
   - Set up alerts for failures
   - Track gas costs

5. **Use Conservative Settings:**
   ```env
   MIN_PROFIT_THRESHOLD=1.0  # 1% minimum on mainnet
   MAX_TRADE_SIZE_USD=1000   # Start small
   MAX_DAILY_LOSS=100        # Limit your risk
   ```

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module 'hardhat'"
**Solution:** Run `npm install`

### Issue: "Network not supported"
**Solution:** Check your RPC URLs in `.env`

### Issue: "Insufficient funds"
**Solution:** Add testnet ETH/MATIC to your wallet

### Issue: "Transaction failed"
**Solution:** 
- Check gas price limits
- Verify contract addresses
- Ensure enough token balance

### Issue: "No arbitrage opportunities found"
**Solution:** 
- This is normal! Opportunities are rare
- Lower your profit threshold for testing
- Check if DEXs have sufficient liquidity

## 📈 Optimizing Performance

### 1. Fast RPC Providers
- Use paid Alchemy or Infura plans
- Consider dedicated nodes for production
- Enable WebSocket connections

### 2. Gas Optimization
- Monitor gas prices
- Use gas price APIs
- Set maximum gas limits
- Consider using Flashbots on Ethereum

### 3. Monitoring Multiple Pairs
- Start with high-volume pairs (ETH/USDC)
- Add more pairs gradually
- Focus on liquid markets

### 4. Response Time
- Host on cloud server (AWS, Digital Ocean)
- Use servers close to RPC nodes
- Optimize code for speed

## 🎓 Learning Resources

### Recommended Reading:
1. [Aave V3 Documentation](https://docs.aave.com/developers/)
2. [Uniswap V3 Book](https://uniswapv3book.com/)
3. [Hardhat Tutorial](https://hardhat.org/tutorial)
4. [ethers.js Documentation](https://docs.ethers.org/)

### Video Tutorials:
1. Flash Loans Explained
2. MEV and Arbitrage Strategies
3. Smart Contract Security

## 📞 Getting Help

### If You Get Stuck:
1. Check the error messages carefully
2. Read the documentation
3. Search for similar issues on GitHub
4. Ask in DeFi developer communities
5. Review the code comments

### Useful Communities:
- r/ethdev on Reddit
- Ethereum Stack Exchange
- Hardhat Discord
- Aave Discord

## ✅ Readiness Checklist

Before deploying to mainnet:

- [ ] Compiled all contracts without errors
- [ ] All tests pass
- [ ] Deployed and tested on testnet
- [ ] Executed at least 10 successful test trades
- [ ] Understood all code and risks
- [ ] Set conservative safety limits
- [ ] Have monitoring in place
- [ ] Used separate wallet (not main funds)
- [ ] Calculated expected returns vs risks
- [ ] Ready to monitor 24/7 initially

## 🚦 Next Steps

1. **Week 1-2:** Learn and setup
   - Install everything
   - Read all documentation
   - Understand the code

2. **Week 3-4:** Testnet testing
   - Deploy to testnet
   - Run bot in dry-run mode
   - Simulate many trades

3. **Week 5-6:** Optimization
   - Improve profitability calculations
   - Optimize gas usage
   - Add more DEX integrations

4. **Week 7+:** Careful mainnet launch
   - Start with tiny amounts
   - Monitor constantly
   - Scale gradually

## 🎉 You're Ready!

Remember:
- **Start small** and scale up
- **Test everything** on testnet first
- **Never invest** more than you can afford to lose
- **Monitor actively**, especially at first
- **Learn continuously** from each trade

Good luck with your arbitrage journey! 🚀

---

**Questions?** Check CONTRIBUTING.md or open an issue on GitHub.
