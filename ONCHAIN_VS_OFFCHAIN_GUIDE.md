# 🎯 On-Chain vs Off-Chain Price Discovery Guide

**The Problem:** Off-chain price calculations don't account for slippage and price impact.

**The Solution:** Simulate the actual swap on-chain before executing.

---

## 📊 Current Situation

### Off-Chain Detection (What Your Bot Does Now):
```typescript
// Step 1: Get reserves from pools
const reserve0 = 1000000; // 1M tokens
const reserve1 = 193000;  // 193k USDT
const price = reserve1 / reserve0; // 0.193

// Step 2: Compare prices
DEX1 price: 0.1928
DEX2 price: 0.1940
Spread: 0.62% (62 bps)

// Step 3: Subtract fees
Spread: 62 bps
Fees: 40 bps (DEX + flash loan)
Expected Profit: 22 bps ✅ Looks profitable!
```

### On-Chain Reality (What Actually Happens):
```solidity
// Step 1: Execute swap on DEX1
Input: 1000 WMATIC
Output: 192.5 USDT (expected: 192.8)
Price impact: -0.3 USDT (-15 bps)

// Step 2: Execute swap on DEX2
Input: 192.5 USDT
Output: 992 WMATIC (expected: 995)
Price impact: -3 WMATIC (-30 bps)

// Net result
Started: 1000 WMATIC
Ended: 992 WMATIC
Loss: 8 WMATIC (-0.8%)
```

**Why the difference?**
- Off-chain: Uses static reserve ratio (constant product formula)
- On-chain: Accounts for YOUR trade moving the price (price impact)

---

## 🔧 Solution: On-Chain Swap Simulation

### Method 1: Use Router's `getAmountsOut()` (V2 DEXes)

**What it does:** Simulates the exact swap without executing it.

```typescript
// Simulate swap BEFORE executing
async function simulateSwapV2(
  router: string,
  amountIn: bigint,
  path: string[]
): Promise<bigint[]> {
  const routerContract = new ethers.Contract(
    router,
    [
      'function getAmountsOut(uint amountIn, address[] memory path) view returns (uint[] memory amounts)'
    ],
    provider
  );
  
  // This calls the blockchain but doesn't execute
  const amounts = await routerContract.getAmountsOut(amountIn, path);
  
  return amounts; // [amountIn, amountOut]
}

// Example usage
const path = [WMATIC, USDT];
const amountIn = ethers.parseEther("1000"); // 1000 WMATIC

const amounts = await simulateSwapV2(
  quickswapRouter,
  amountIn,
  path
);

const amountOut = amounts[1]; // What you'll actually receive
console.log(`Input: ${ethers.formatEther(amountIn)} WMATIC`);
console.log(`Output: ${ethers.formatEther(amountOut)} USDT`);
console.log(`Actual price: ${Number(amountOut) / Number(amountIn)}`);
```

**Benefits:**
- ✅ Accounts for price impact
- ✅ Accounts for fees
- ✅ Uses real pool state
- ✅ No gas cost (view function)
- ✅ Gets EXACT amount you'll receive

---

### Method 2: Use Quoter for V3 Pools (Uniswap V3)

**What it does:** Simulates V3 swap with concentrated liquidity math.

```typescript
async function simulateSwapV3(
  quoter: string,
  tokenIn: string,
  tokenOut: string,
  fee: number, // 500, 3000, or 10000
  amountIn: bigint
): Promise<bigint> {
  const quoterContract = new ethers.Contract(
    quoter,
    [
      'function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)'
    ],
    provider
  );
  
  // Simulate the swap
  const amountOut = await quoterContract.quoteExactInputSingle.staticCall(
    tokenIn,
    tokenOut,
    fee,
    amountIn,
    0 // No price limit
  );
  
  return amountOut;
}

// Example usage
const amountOut = await simulateSwapV3(
  uniswapV3Quoter,
  WMATIC,
  USDT,
  500, // 0.05% fee tier
  ethers.parseEther("1000")
);
```

---

## 🎯 Complete Workflow: Realistic Profitability Check

### Step-by-Step Implementation:

```typescript
async function checkRealProfitability(
  opportunity: ArbitrageOpportunity,
  tradeSize: bigint
): Promise<{ profitable: boolean; realProfit: number }> {
  
  // STEP 1: Simulate BUY swap (DEX1)
  const buyPath = [
    opportunity.pair.token0Address,
    opportunity.pair.token1Address
  ];
  
  const buyAmounts = await simulateSwapV2(
    opportunity.buyDex.router,
    tradeSize,
    buyPath
  );
  
  const amountReceived = buyAmounts[1];
  console.log(`Buy: ${ethers.formatEther(tradeSize)} → ${ethers.formatEther(amountReceived)}`);
  
  // STEP 2: Simulate SELL swap (DEX2)
  const sellPath = [
    opportunity.pair.token1Address,
    opportunity.pair.token0Address
  ];
  
  const sellAmounts = await simulateSwapV2(
    opportunity.sellDex.router,
    amountReceived, // Use actual output from step 1
    sellPath
  );
  
  const finalAmount = sellAmounts[1];
  console.log(`Sell: ${ethers.formatEther(amountReceived)} → ${ethers.formatEther(finalAmount)}`);
  
  // STEP 3: Calculate REAL profit
  const profit = finalAmount - tradeSize;
  const profitPercent = (Number(profit) / Number(tradeSize)) * 100;
  
  console.log(`Started: ${ethers.formatEther(tradeSize)}`);
  console.log(`Ended: ${ethers.formatEther(finalAmount)}`);
  console.log(`Profit: ${ethers.formatEther(profit)} (${profitPercent.toFixed(2)}%)`);
  
  // STEP 4: Subtract flash loan fee (5 bps = 0.05%)
  const flashLoanFee = tradeSize * 5n / 10000n;
  const netProfit = profit - flashLoanFee;
  
  // STEP 5: Subtract gas cost
  const gasEstimate = 500000n;
  const gasPrice = (await provider.getFeeData()).gasPrice || 0n;
  const gasCost = gasEstimate * gasPrice;
  const gasCostInToken = gasCost; // Convert if needed
  
  const finalProfit = netProfit - gasCostInToken;
  
  return {
    profitable: finalProfit > 0n,
    realProfit: Number(ethers.formatEther(finalProfit))
  };
}
```

---

## 📊 Comparison: Off-Chain vs On-Chain

### Example: CRV/WMATIC Trade

**Off-Chain Calculation:**
```
DEX1 (SushiSwap): 2.6950 WMATIC/CRV
DEX2 (Uniswap V3): 2.7435 WMATIC/CRV
Spread: 1.80% (180 bps)
Fees: 65 bps
Expected Profit: 115 bps ✅
Trade Size: $121.75
Expected Profit: $1.40
```

**On-Chain Simulation:**
```typescript
// Buy 121.75 CRV on SushiSwap
Input: 304.38 WMATIC ($121.75)
Simulated Output: 112.5 CRV (not 113 CRV expected)
Price Impact: -0.5 CRV (-0.44%)

// Sell 112.5 CRV on Uniswap V3
Input: 112.5 CRV
Simulated Output: 302.1 WMATIC (not 309 WMATIC expected)
Price Impact: -6.9 WMATIC (-2.24%)

// Net result
Started: 304.38 WMATIC
Ended: 302.1 WMATIC
Real Loss: -2.28 WMATIC (-0.75%) ❌
```

**Why?**
- Pool liquidity only $128 on SushiSwap
- Trading $121 in $128 pool = 94% of liquidity
- Massive price impact from large % of pool

---

## 🔧 Implementation in Your Bot

### Where to Add Simulation:

**Current flow:**
```
1. Detect opportunity (off-chain calculation)
2. Calculate trade size
3. ❌ Execute trade (fails on-chain)
```

**Improved flow:**
```
1. Detect opportunity (off-chain calculation)
2. Calculate trade size
3. ✅ Simulate swaps on-chain
4. Validate real profitability
5. Execute only if truly profitable
```

### Code Location:

**File:** `src/tradeExecutor.ts`

**Function:** `validateProfitability()`

**Add before executing:**
```typescript
// Current validation (off-chain)
const spreadBps = opportunity.profitPercent * 100;
const totalFeeBps = 65;
const netProfitBps = spreadBps - totalFeeBps;

// ✅ ADD: On-chain simulation
const simulatedProfit = await this.simulateSwaps(
  opportunity,
  flashLoanAmount
);

if (simulatedProfit <= 0) {
  return {
    profitable: false,
    reason: `On-chain simulation shows loss: ${simulatedProfit.toFixed(2)}%`
  };
}

// Continue only if simulation shows profit
logger.info(`✅ On-chain simulation confirms profit: ${simulatedProfit.toFixed(2)}%`);
```

---

## 🎯 Benefits of On-Chain Simulation

### 1. **Avoid Failed Transactions**
- **Before:** Try 100 trades → 0 succeed
- **After:** Simulate 100, try 10 → 3 succeed
- **Gas Saved:** 90 failed transactions

### 2. **Realistic Profit Estimates**
- **Before:** "Expected $10 profit" → Loses $2
- **After:** "Expected $2 profit" → Actually makes $2

### 3. **Better Pool Selection**
- Automatically filters out pools with too much slippage
- Focus on deep liquidity pools
- Ignore fake opportunities

### 4. **Dynamic Slippage Detection**
```typescript
// Calculate actual slippage from simulation
const expectedOut = (amountIn * price) - fees;
const actualOut = simulatedAmountOut;
const slippage = ((expectedOut - actualOut) / expectedOut) * 100;

if (slippage > 2.0) {
  logger.warning(`⚠️ High slippage detected: ${slippage.toFixed(2)}%`);
  return false; // Skip this trade
}
```

---

## 🚀 Quick Implementation Guide

### Step 1: Add Simulation Functions

Create new file: `src/swapSimulator.ts`

```typescript
import { ethers } from 'ethers';

const ROUTER_ABI = [
  'function getAmountsOut(uint amountIn, address[] memory path) view returns (uint[] memory amounts)'
];

export async function simulateV2Swap(
  provider: ethers.Provider,
  router: string,
  amountIn: bigint,
  path: string[]
): Promise<bigint> {
  const routerContract = new ethers.Contract(router, ROUTER_ABI, provider);
  const amounts = await routerContract.getAmountsOut(amountIn, path);
  return amounts[amounts.length - 1]; // Return final amount
}

export async function simulateArbitrageRoute(
  provider: ethers.Provider,
  buyRouter: string,
  sellRouter: string,
  amountIn: bigint,
  token0: string,
  token1: string
): Promise<{
  finalAmount: bigint;
  profit: bigint;
  profitable: boolean;
}> {
  // Simulate buy
  const buyPath = [token0, token1];
  const amountMid = await simulateV2Swap(provider, buyRouter, amountIn, buyPath);
  
  // Simulate sell
  const sellPath = [token1, token0];
  const finalAmount = await simulateV2Swap(provider, sellRouter, amountMid, sellPath);
  
  const profit = finalAmount - amountIn;
  
  return {
    finalAmount,
    profit,
    profitable: profit > 0n
  };
}
```

### Step 2: Use in Trade Executor

In `tradeExecutor.ts`, before executing:

```typescript
import { simulateArbitrageRoute } from './swapSimulator';

// Before executeTrade(), add:
const simulation = await simulateArbitrageRoute(
  this.provider,
  opportunity.buyDex.router,
  opportunity.sellDex.router,
  flashLoanAmount,
  token0Address,
  token1Address
);

if (!simulation.profitable) {
  logger.warning(`❌ On-chain simulation shows LOSS: ${ethers.formatEther(simulation.profit)}`);
  return {
    success: false,
    reason: 'Simulation failed profitability check'
  };
}

logger.info(`✅ On-chain simulation shows PROFIT: ${ethers.formatEther(simulation.profit)}`);
// Proceed with execution...
```

---

## 📊 Expected Results After Implementation

### Current Results:
- Opportunities found: 27
- Trades attempted: 8
- Successful trades: 0 (0%)
- Reason: Price impact not accounted for

### After On-Chain Simulation:
- Opportunities found: 27
- **Simulation filters:** 24 (88% would fail)
- Trades attempted: 3 (only profitable ones)
- Successful trades: 1-2 (33-66%)
- **Gas saved:** 85% (24 failed transactions avoided)

---

## 🎯 Summary

**The Key Difference:**

| Method | Accounts For | Result |
|--------|--------------|--------|
| **Off-Chain Calculation** | Reserves, fees | ❌ Overestimates profit |
| **On-Chain Simulation** | Reserves, fees, **price impact**, slippage | ✅ Realistic profit |

**Implementation:**
1. Use `getAmountsOut()` for V2 DEXes (QuickSwap, SushiSwap)
2. Use `quoteExactInputSingle()` for V3 DEXes (Uniswap V3)
3. Simulate BOTH swaps (buy + sell) before executing
4. Compare simulated profit vs expected profit
5. Only execute if simulation confirms profitability

**Benefits:**
- ✅ Avoid 80-90% of failed transactions
- ✅ Save gas on unprofitable attempts
- ✅ Realistic profit expectations
- ✅ Focus on truly profitable opportunities

**The simulation is FREE (view function) and saves you REAL gas costs on failed trades!**

Would you like me to implement the on-chain simulation feature in your bot?
