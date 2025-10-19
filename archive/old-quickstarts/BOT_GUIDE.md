# 🤖 Arbitrage Bot - Complete Guide

## 📁 Bot Architecture

Your arbitrage bot consists of 5 main modules:

```
src/
├── bot.ts           # Main orchestrator - controls everything
├── config.ts        # Configuration & settings
├── logger.ts        # Colored console output
├── priceMonitor.ts  # Fetches prices & finds opportunities
└── tradeExecutor.ts # Executes trades on the blockchain
```

---

## 🔄 How The Bot Works (Step-by-Step)

### **Phase 1: Initialization**

1. **Load Configuration** (`config.ts`)
   - Reads `.env` file for API keys and settings
   - Validates all required parameters
   - Sets up trading thresholds

2. **Connect to Blockchain** (`bot.ts`)
   - Connects to Ethereum via RPC
   - Initializes wallet with your private key
   - Connects to your deployed FlashLoanArbitrage contract

3. **Safety Checks**
   - Verifies wallet has enough ETH for gas
   - Checks if wallet is authorized on the contract
   - Validates contract is not paused

### **Phase 2: Monitoring Loop** (Runs continuously)

```
┌─────────────────────────────────────────┐
│  1. Scan for Opportunities              │
│     - Check all watched pairs           │
│     - Get prices from multiple DEXes    │
│     - Calculate price differences       │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  2. Opportunity Detection               │
│     - Compare DEX prices                │
│     - Calculate profit %                │
│     - Estimate gas costs                │
│     - Determine if profitable           │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  3. Filter Viable Opportunities         │
│     - Profit > minimum threshold?       │
│     - Net profit > 0 after gas?         │
│     - Gas price < max limit?            │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  4. Execute Trade (if profitable)       │
│     - Build transaction                 │
│     - Call FlashLoanArbitrage contract  │
│     - Wait for confirmation             │
│     - Update statistics                 │
└─────────────────────────────────────────┘
```

### **Phase 3: Trade Execution**

When a profitable opportunity is found:

1. **Encode Parameters** (`tradeExecutor.ts`)
   ```typescript
   - DEX router addresses
   - Token swap paths
   - Minimum profit threshold
   ```

2. **Calculate Flash Loan Amount**
   ```typescript
   - Based on available liquidity
   - Respects max trade size limits
   - Optimizes for profit vs. gas costs
   ```

3. **Build Transaction**
   ```typescript
   - Call: contract.executeArbitrage(token, amount, params)
   - Set gas limit with 20% buffer
   - Set gas price (check against max)
   ```

4. **Execute & Monitor**
   ```typescript
   - Send transaction to blockchain
   - Wait for confirmation
   - Parse events for actual profit
   - Update bot statistics
   ```

---

## 📊 Price Monitoring Explained

### **How Prices Are Fetched** (`priceMonitor.ts`)

```typescript
// For each trading pair (e.g., WETH/USDC):
1. Connect to DEX router contract
2. Call getAmountsOut(1 token, [token0, token1])
3. Router returns: "For 1 WETH, you get X USDC"
4. Repeat for each DEX (Uniswap, Sushiswap, Curve)
5. Compare prices to find differences
```

### **Opportunity Detection Logic**

```typescript
// Example: WETH/USDC prices
Uniswap:   1 WETH = 2,000 USDC  ← Cheaper (BUY here)
Sushiswap: 1 WETH = 2,020 USDC  ← More expensive (SELL here)

Profit = (2,020 - 2,000) / 2,000 = 1%

// If 1% > minProfitBps (0.5%) → OPPORTUNITY!
```

### **Profitability Calculation**

```typescript
Step 1: Calculate raw profit
  rawProfit = (sellPrice - buyPrice) / buyPrice
  
Step 2: Estimate gas costs
  gasLimit = 300,000 (flash loan + 2 swaps)
  gasCost = gasLimit × gasPrice × ETH_price
  
Step 3: Calculate net profit
  netProfit = rawProfit - gasCost - flashLoanFee
  
Step 4: Check if viable
  viable = netProfit > 0 && rawProfit > minProfitBps
```

---

## ⚡ Trade Execution Flow

### **What Happens When You Execute a Trade**

```
┌──────────────────────────────────────────────────────┐
│ 1. Bot calls: contract.executeArbitrage()           │
│    - Token: WETH                                     │
│    - Amount: 100 ETH                                 │
│    - Params: [dexRouters, paths, minProfit]         │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│ 2. Your Contract: Flash Loan Request                │
│    - Calls Aave: "Lend me 100 ETH"                  │
│    - Aave sends 100 ETH to your contract            │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│ 3. Aave Calls: contract.executeOperation()          │
│    - Your contract now has 100 ETH                  │
│    - Decodes trading parameters                     │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│ 4. Execute Arbitrage Logic (TODO: YOU implement!)   │
│    a) Approve DEX #1 to spend 100 ETH              │
│    b) Swap 100 ETH → 201,000 USDC on Uniswap      │
│    c) Approve DEX #2 to spend USDC                 │
│    d) Swap 201,000 USDC → 100.5 ETH on Sushiswap  │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│ 5. Check Profit & Repay                             │
│    - Profit check: 100.5 - 100.05 = 0.45 ETH ✓    │
│    - Approve Aave to take back 100.05 ETH         │
│    - Keep 0.45 ETH as profit!                      │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│ 6. Transaction Complete                             │
│    - Emit ArbitrageExecuted event                   │
│    - Bot receives confirmation                      │
│    - Update statistics                              │
└──────────────────────────────────────────────────────┘
```

---

## 🎛️ Configuration Options

### **Key Settings in `config.ts`**

#### **Trading Parameters**
```typescript
minProfitBps: 50           // 0.5% minimum profit
maxGasPrice: 100           // 100 Gwei max
maxTradeSize: 10000        // $10,000 max trade
minTradeSize: 100          // $100 min trade
slippageTolerance: 50      // 0.5% slippage
```

#### **Monitoring Settings**
```typescript
priceCheckInterval: 1000   // Check every 1 second
dryRun: true               // Simulate without executing
debugMode: true            // Show detailed logs
```

#### **Safety Limits**
```typescript
maxConcurrentTrades: 3       // Max 3 trades at once
maxDailyLoss: 100            // Stop if lose $100
emergencyGasPriceStop: 30000 // Emergency stop at 200 Gwei
minWalletBalance: 0.01       // Keep 0.01 ETH minimum
```

#### **Watched Pairs**
```typescript
watchedPairs: [
  { name: "WETH/USDC", token0: "WETH", token1: "USDC", enabled: true },
  { name: "WETH/DAI",  token0: "WETH", token1: "DAI",  enabled: true },
  // Add more pairs as needed!
]
```

---

## 🚦 Safety Features

### **Pre-Trade Safety Checks**

Before executing any trade, the bot verifies:

1. ✅ **Wallet Balance**
   - Has enough ETH for gas
   - Above minimum balance threshold

2. ✅ **Gas Price**
   - Current gas < maxGasPrice
   - Current gas < emergencyGasPriceStop

3. ✅ **Daily Loss Limit**
   - Net profit not below -$1000

4. ✅ **Contract Status**
   - Contract not paused
   - Wallet is authorized

### **Emergency Stops**

The bot automatically stops if:
- Gas price exceeds emergency limit (30000 Gwei), this is 0,000030 ETH, with ETH at 4000$, 30000 Gwei = 0.12$
- Daily loss limit reached ($100)
- Wallet balance too low
- Uncaught exception occurs

---

## 📈 Statistics Tracking

The bot tracks:
- **Opportunities Found** - Total arbitrage opportunities detected
- **Trades Executed** - Total trades attempted
- **Success Rate** - % of successful trades
- **Total Profit** - Sum of all profits
- **Total Gas Cost** - Sum of all gas fees
- **Net Profit** - Profit - Gas Costs

View stats in real-time as the bot runs!

---

## 🎨 Logger Features

### **Color-Coded Output**

```typescript
logger.debug()    // Magenta - Detailed debugging info
logger.info()     // Blue    - General information
logger.success()  // Green   - Successful operations
logger.warning()  // Yellow  - Potential issues
logger.error()    // Red     - Errors
```

### **Special Log Methods**

```typescript
logger.opportunity(pair, profit, percent)  // Highlights opportunities
logger.trade("START" | "SUCCESS" | "FAILED", txHash)  // Trade status
logger.priceCheck(pair, price1, price2)    // Price comparisons
logger.separator()  // Visual separator line
logger.banner()     // Startup banner
```

---

## 🔧 How to Use the Bot

### **1. Start in Dry Run Mode (Recommended)**

```bash
# Edit .env file
ENABLE_DRY_RUN=true
ENABLE_DEBUG=true

# Run the bot
npm run start:testnet
```

**Dry run mode:**
- ✅ Monitors prices
- ✅ Detects opportunities
- ✅ Simulates trades
- ❌ Doesn't execute real transactions

### **2. Monitor Output**

Watch for:
```
💰 OPPORTUNITY FOUND: WETH/USDC - Profit: $10.50 (0.52%)
⚡ Executing arbitrage trade...
⚠️  DRY RUN MODE - Trade simulated but not executed
```

### **3. Switch to Live Mode**

Once confident:
```bash
# Edit .env
ENABLE_DRY_RUN=false

# Run bot
npm run start:testnet
```

**Live mode:**
- ✅ Real transactions
- ✅ Real profits
- ⚠️ Real gas costs!

### **4. Stop the Bot**

```bash
Press Ctrl+C

# Bot will:
- Stop monitoring
- Display final statistics
- Shut down gracefully
```

---

## 🎯 What Still Needs To Be Done

### **CRITICAL: Implement Trading Logic**

The `_executeArbitrageLogic()` function in your smart contract is currently a placeholder:

```solidity
// contracts/FlashLoanArbitrage.sol
function _executeArbitrageLogic(...) internal returns (uint256 profit) {
    // TODO: Implement the actual DEX swap logic
    profit = 0;  // ← Currently returns 0!
}
```

**You need to add:**
1. Token approvals to DEX routers
2. Actual swap calls (Uniswap/Sushiswap)
3. Profit calculation
4. Error handling

### **Example Implementation:**

```solidity
function _executeArbitrageLogic(
    address asset,
    uint256 amount,
    address dexRouter1,
    address dexRouter2,
    address[] memory path1,
    address[] memory path2
) internal returns (uint256 profit) {
    // 1. Approve DEX 1
    IERC20(asset).safeApprove(dexRouter1, amount);
    
    // 2. Swap on DEX 1
    uint[] memory amounts1 = IUniswapV2Router(dexRouter1).swapExactTokensForTokens(
        amount,
        0, // Accept any amount (calculate min in production!)
        path1,
        address(this),
        block.timestamp + 300
    );
    
    // 3. Approve DEX 2
    uint256 intermediateAmount = amounts1[amounts1.length - 1];
    address intermediateToken = path1[path1.length - 1];
    IERC20(intermediateToken).safeApprove(dexRouter2, intermediateAmount);
    
    // 4. Swap on DEX 2
    uint[] memory amounts2 = IUniswapV2Router(dexRouter2).swapExactTokensForTokens(
        intermediateAmount,
        0,
        path2,
        address(this),
        block.timestamp + 300
    );
    
    // 5. Calculate profit
    uint256 finalAmount = amounts2[amounts2.length - 1];
    profit = finalAmount > amount ? finalAmount - amount : 0;
}
```

---

## 📚 Next Steps

1. **Test Dry Run Mode**
   - Run bot and verify it detects opportunities
   - Check statistics tracking works

2. **Implement Trading Logic**
   - Update smart contract with real DEX swaps
   - Redeploy contract to testnet
   - Update contract address in `config.ts`

3. **Test Live on Testnet**
   - Switch to live mode
   - Execute small test trades
   - Verify profits work correctly

4. **Optimize & Scale**
   - Add more trading pairs
   - Tune profit thresholds
   - Optimize gas usage
   - Add monitoring/alerts

5. **Go Live on Mainnet** (When ready!)
   - Deploy to Arbitrum/Polygon mainnet
   - Start with small trade sizes
   - Monitor closely
   - Scale gradually

---

## 🐛 Troubleshooting

### **Bot won't start**
- Check `.env` file has all required variables
- Verify RPC URL is correct
- Ensure private key is valid

### **No opportunities found**
- This is normal! Real arbitrage is competitive
- Try lowering `minProfitBps` (but watch gas costs!)
- Add more trading pairs
- Check prices are being fetched correctly

### **Trades fail**
- Check wallet has enough ETH for gas
- Verify wallet is authorized on contract
- Ensure contract has trading logic implemented
- Check gas prices aren't too high

---

## 🎓 Key Concepts Recap

1. **The bot monitors prices** - Continuously checks DEXes
2. **Finds price differences** - Compares to find arbitrage
3. **Calculates profitability** - Profit > gas costs?
4. **Executes flash loan** - Borrows funds instantly
5. **Performs arbitrage** - Buy low, sell high
6. **Repays loan** - Returns borrowed amount + fee
7. **Keeps profit** - Whatever's left is yours!

**All in ONE blockchain transaction!** ⚡

---

Ready to run your bot? Let's do it! 🚀
