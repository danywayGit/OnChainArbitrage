# 🗺️ Complete System Architecture

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        YOUR COMPUTER                                     │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  Bot Process (npm run bot)                                      │   │
│  │                                                                  │   │
│  │  ┌──────────────┐                                              │   │
│  │  │   bot.ts     │  ← Main orchestrator                         │   │
│  │  │  (Main Loop) │                                              │   │
│  │  └──────┬───────┘                                              │   │
│  │         │                                                        │   │
│  │         ├─────→ ┌─────────────────┐                           │   │
│  │         │       │ priceMonitor.ts │                           │   │
│  │         │       │                 │                           │   │
│  │         │       │ - Fetch prices  │                           │   │
│  │         │       │ - Find arbitrage│                           │   │
│  │         │       │ - Calculate $   │                           │   │
│  │         │       └────────┬────────┘                           │   │
│  │         │                │                                      │   │
│  │         │                └───→ Opportunities                   │   │
│  │         │                                                        │   │
│  │         └─────→ ┌──────────────────┐                          │   │
│  │                 │ tradeExecutor.ts │                          │   │
│  │                 │                  │                          │   │
│  │                 │ - Build TX       │                          │   │
│  │                 │ - Send to chain  │                          │   │
│  │                 │ - Track results  │                          │   │
│  │                 └────────┬─────────┘                          │   │
│  │                          │                                      │   │
│  └──────────────────────────┼──────────────────────────────────────┘   │
│                             │                                          │
└─────────────────────────────┼────────────────────────────────────────┘
                              │
                              │ Blockchain Transaction
                              │ (via Alchemy RPC)
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    ETHEREUM SEPOLIA BLOCKCHAIN                          │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  Your Smart Contract                                            │   │
│  │  0x671A158DA6248e965698726ebb5e3512AF171Af3                    │   │
│  │                                                                  │   │
│  │  executeArbitrage() ─┐                                         │   │
│  │                       │                                         │   │
│  │                       ▼                                         │   │
│  │              Request Flash Loan                                │   │
│  │                       │                                         │   │
│  │                       ▼                                         │   │
│  │  ┌─────────────────────────────────────────┐                  │   │
│  │  │  Aave V3 Protocol                        │                  │   │
│  │  │  0x012b...136C9A                         │                  │   │
│  │  │                                          │                  │   │
│  │  │  1. Sends tokens to your contract       │                  │   │
│  │  │  2. Calls executeOperation()             │                  │   │
│  │  │  3. Expects repayment                    │                  │   │
│  │  └────────┬──────────────────────────────────┘                  │   │
│  │           │                                                      │   │
│  │           └─→ executeOperation() ─┐                            │   │
│  │                                     │                            │   │
│  │                                     ▼                            │   │
│  │              _executeArbitrageLogic()                           │   │
│  │                       │                                          │   │
│  │                       ├─→ Swap on Uniswap                      │   │
│  │                       ├─→ Swap on Sushiswap                    │   │
│  │                       └─→ Calculate profit                      │   │
│  │                                     │                            │   │
│  │                                     ▼                            │   │
│  │              Repay Flash Loan + Fee                             │   │
│  │                       │                                          │   │
│  │                       ▼                                          │   │
│  │              Keep Profit! 💰                                    │   │
│  │                                                                  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow (Step-by-Step)

### **1. Bot Initialization**
```
[Computer] → Load .env configuration
         → Connect to Alchemy RPC
         → Initialize wallet with private key
         → Connect to deployed contract
         → Verify authorization
         → Check balance
         → Start monitoring loop
```

### **2. Price Monitoring (Every 1 second)**
```
[PriceMonitor] → For each trading pair (WETH/USDC, WETH/DAI):
              
              → Connect to Uniswap Router
              → Call getAmountsOut(1 WETH, [WETH, USDC])
              → Get price: 2,000 USDC per WETH
              
              → Connect to Sushiswap Router  
              → Call getAmountsOut(1 WETH, [WETH, USDC])
              → Get price: 2,020 USDC per WETH
              
              → Compare prices:
                 - Buy: Uniswap @ 2,000 (cheaper)
                 - Sell: Sushiswap @ 2,020 (expensive)
                 - Profit: 20 USDC = 1%
              
              → Calculate costs:
                 - Flash loan fee: 0.05%
                 - Gas cost: ~$5
                 - Net profit: $10
              
              → Check if profitable:
                 - Profit (1%) > minProfit (0.5%)? ✓
                 - Net profit > 0? ✓
                 - Gas price OK? ✓
              
              → Return: OPPORTUNITY FOUND!
```

### **3. Trade Execution**
```
[TradeExecutor] → Receive opportunity
               
               → Safety checks:
                  - Wallet balance OK? ✓
                  - Gas price acceptable? ✓
                  - Contract not paused? ✓
               
               → Encode parameters:
                  - DEX router addresses
                  - Token swap paths
                  - Minimum profit threshold
               
               → Build transaction:
                  - To: 0x671A... (your contract)
                  - Function: executeArbitrage()
                  - Data: [WETH, 100 ETH, encoded_params]
                  - Gas limit: 300,000
                  - Gas price: 50 Gwei
               
               → Send transaction to blockchain
               
               → Wait for confirmation...
```

### **4. Smart Contract Execution** (On Blockchain)
```
[Your Contract] → Receives executeArbitrage() call
               
               → Calls Aave V3:
                  flashLoanSimple(WETH, 100 ETH)
               
[Aave]         → Sends 100 WETH to your contract
               → Calls: contract.executeOperation()
               
[Your Contract] → executeOperation() triggered:
                  - Now has 100 WETH borrowed
                  - Decode parameters
                  - Call _executeArbitrageLogic()
               
                → _executeArbitrageLogic():
                  ┌─────────────────────────────┐
                  │ ⚠️  YOU NEED TO IMPLEMENT!  │
                  └─────────────────────────────┘
                  
                  Should do:
                  1. Approve Uniswap: 100 WETH
                  2. Swap: 100 WETH → 201,000 USDC
                  3. Approve Sushiswap: 201,000 USDC
                  4. Swap: 201,000 USDC → 100.5 WETH
                  5. Return profit: 0.5 WETH
               
                → Check profit meets minimum
                → Approve Aave: 100.05 WETH (loan + fee)
                → Aave takes repayment
                → Contract keeps: 0.45 WETH profit!
                → Emit ArbitrageExecuted event
               
[Blockchain]   → Transaction confirmed ✓
```

### **5. Result Processing**
```
[TradeExecutor] → Transaction confirmed!
               → Parse events from logs
               → Extract profit: 0.45 WETH = $900
               → Calculate gas cost: $5
               → Net profit: $895
               
[Bot]          → Update statistics:
                 - Trades executed: 1
                 - Successful: 1
                 - Total profit: $895
                 - Success rate: 100%
               
               → Log results:
                 ✅ Trade executed successfully!
                 TX: 0xabc123...
                 Profit: $895
                 Gas: $5
```

---

## 📊 File Structure & Responsibilities

```
OnChainArbitrage/
│
├── contracts/
│   └── FlashLoanArbitrage.sol     ← Smart contract (deployed)
│                                     - Flash loan logic
│                                     - Arbitrage execution
│                                     - Security & access control
│
├── scripts/
│   ├── deploy.ts                   ← Deployment script
│   └── check-sepolia-balance.ts    ← Balance checker
│
├── src/                            ← Bot source code
│   ├── bot.ts                      ← Main orchestrator
│   │                                 - Startup & initialization
│   │                                 - Main monitoring loop
│   │                                 - Statistics tracking
│   │                                 - Error handling
│   │
│   ├── config.ts                   ← Configuration
│   │                                 - Network settings
│   │                                 - Contract addresses
│   │                                 - Trading parameters
│   │                                 - Safety limits
│   │
│   ├── logger.ts                   ← Logging utility
│   │                                 - Color-coded output
│   │                                 - Timestamps
│   │                                 - Special log methods
│   │
│   ├── priceMonitor.ts             ← Price monitoring
│   │                                 - Fetch DEX prices
│   │                                 - Compare prices
│   │                                 - Calculate profitability
│   │                                 - Detect opportunities
│   │
│   └── tradeExecutor.ts            ← Trade execution
│                                     - Build transactions
│                                     - Execute trades
│                                     - Parse results
│                                     - Track performance
│
├── docs/
│   ├── CONTRACT_EXPLANATION.md     ← Smart contract guide
│   ├── BOT_GUIDE.md                ← Bot operation guide
│   └── SUMMARY.md                  ← Project summary
│
├── .env                            ← Configuration (SECRET!)
│   ├── RPC URLs
│   ├── Private key
│   └── Bot settings
│
└── package.json                    ← Dependencies & scripts
    ├── npm run compile
    ├── npm run test
    ├── npm run deploy:testnet
    └── npm run bot
```

---

## 🎯 Critical Decision Points

### **Where Configuration Lives:**
```
.env file → config.ts → All modules
```
Change settings in ONE place!

### **Where Logic Lives:**
```
Price Detection:  src/priceMonitor.ts
Trade Decision:   src/bot.ts
Trade Execution:  src/tradeExecutor.ts
Arbitrage Logic:  contracts/FlashLoanArbitrage.sol ← YOU IMPLEMENT!
```

### **Data Flow:**
```
Blockchain → RPC → Bot → Smart Contract → Blockchain
   ↑                                           │
   └───────────────────────────────────────────┘
              (Single Transaction)
```

---

## 🔐 Security Layers

### **Layer 1: Environment Variables**
```
.env file (NEVER commit to git!)
├── Private key
├── RPC URLs
└── API keys
```

### **Layer 2: Smart Contract**
```
contracts/FlashLoanArbitrage.sol
├── onlyOwner: Only you can manage
├── onlyAuthorized: Only approved wallets
├── whenNotPaused: Emergency stop
└── Flash loan validation
```

### **Layer 3: Bot Safety Checks**
```
src/bot.ts & src/tradeExecutor.ts
├── Minimum wallet balance
├── Maximum gas price
├── Daily loss limits
└── Dry run mode
```

---

## 💡 Key Concepts Visualization

### **Flash Loan in One Transaction:**
```
┌─────────────────────────────────────────┐
│  Transaction begins                      │
├─────────────────────────────────────────┤
│  1. Request: Borrow 100 ETH             │
│  2. Receive: 100 ETH                    │
│  3. Execute: Arbitrage trades           │
│  4. Repay: 100.05 ETH                   │
│  5. Keep: 0.45 ETH profit               │
├─────────────────────────────────────────┤
│  Transaction ends ✓                     │
│  All or nothing!                        │
└─────────────────────────────────────────┘
```

If ANY step fails → Entire transaction reverts
No loss, but you pay gas fees!

### **Profit Calculation:**
```
Revenue from arbitrage:     $1,000
- Flash loan fee (0.05%):     - $0.50
- Gas costs:                  - $5
- DEX trading fees:           - $2
= Net profit:                  $992.50 ✓

Minimum to be profitable:
  Revenue > (Fees + Gas)
```

---

## 🚀 Ready to Launch Checklist

### **Pre-Flight:**
- ✅ Contract deployed: 0x671A...
- ✅ Bot code complete
- ✅ Configuration set
- ✅ Documentation read
- ⚠️ Trading logic: NOT IMPLEMENTED!

### **Test Flight:**
- [ ] Run in dry run mode
- [ ] Verify opportunity detection
- [ ] Check statistics tracking
- [ ] Test emergency stop

### **Implementation:**
- [ ] Code `_executeArbitrageLogic()`
- [ ] Add DEX swap calls
- [ ] Test on testnet
- [ ] Verify profits work

### **Production:**
- [ ] Deploy to mainnet
- [ ] Start with small trades
- [ ] Monitor 24/7
- [ ] Scale gradually

---

**You now have a complete understanding of how everything works together!** 🎉

**Next step:** Implement the trading logic in your smart contract, and you're ready to make money! 💰
