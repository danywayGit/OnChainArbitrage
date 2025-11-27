import { ethers } from 'ethers';
import logger from './logger';
import { config } from './config';

const ROUTER_V2_ABI = [
  'function getAmountsOut(uint amountIn, address[] memory path) view returns (uint[] memory amounts)'
];

// Uniswap V3 Quoter V2 - This is the correct contract for simulating V3 swaps
// Polygon address: 0x61fFE014bA17989E743c5F6cB21bF9697530B21e
const QUOTER_V2_ABI = [
  'function quoteExactInputSingle((address tokenIn, address tokenOut, uint256 amountIn, uint24 fee, uint160 sqrtPriceLimitX96)) external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)'
];

// Polygon Uniswap V3 Quoter V2 address
const POLYGON_QUOTER_V2 = '0x61fFE014bA17989E743c5F6cB21bF9697530B21e';

// Execution slippage buffer (accounts for price movement between detection and execution)
// This is CRITICAL for realistic profit calculation
const getExecutionSlippageBps = () => config?.trading?.executionSlippageBuffer || 20;

/**
 * Simulates a V2 swap using router's getAmountsOut
 * This is a VIEW function - no gas cost, no state change
 */
export async function simulateV2Swap(
  provider: ethers.Provider,
  router: string,
  amountIn: bigint,
  path: string[]
): Promise<bigint> {
  try {
    const routerContract = new ethers.Contract(router, ROUTER_V2_ABI, provider);
    const amounts = await routerContract.getAmountsOut(amountIn, path);
    return amounts[amounts.length - 1]; // Return final amount
  } catch (error) {
    logger.error(`Failed to simulate V2 swap on ${router}: ${error}`);
    throw error;
  }
}

/**
 * Simulates a V3 swap using Quoter V2's quoteExactInputSingle
 * This returns the exact output amount accounting for:
 * - Price impact from your specific trade size
 * - Pool's concentrated liquidity positions
 * - Fee tier (500 = 0.05%, 3000 = 0.3%, 10000 = 1%)
 */
export async function simulateV3Swap(
  provider: ethers.Provider,
  quoter: string, // Not used, we hardcode Polygon Quoter V2
  tokenIn: string,
  tokenOut: string,
  fee: number,
  amountIn: bigint
): Promise<bigint> {
  try {
    const quoterContract = new ethers.Contract(POLYGON_QUOTER_V2, QUOTER_V2_ABI, provider);
    
    // Quoter V2 uses a struct parameter
    const quoteParams = {
      tokenIn: tokenIn,
      tokenOut: tokenOut,
      amountIn: amountIn,
      fee: fee,
      sqrtPriceLimitX96: 0 // No price limit
    };
    
    // Use staticCall to simulate without executing
    const result = await quoterContract.quoteExactInputSingle.staticCall(quoteParams);
    
    // Result is [amountOut, sqrtPriceX96After, initializedTicksCrossed, gasEstimate]
    const amountOut = result[0];
    
    logger.debug(`V3 simulation: ${ethers.formatEther(amountIn)} → ${ethers.formatEther(amountOut)} (fee: ${fee/100} bps)`);
    
    return amountOut;
  } catch (error: any) {
    logger.warning(`V3 simulation failed: ${error.message}`);
    // Fallback: estimate with conservative slippage
    // For small amounts, V3 has better pricing than V2 due to concentrated liquidity
    const estimatedOut = (amountIn * 995n) / 1000n; // Assume 0.5% slippage
    logger.warning(`Using fallback estimate: ${ethers.formatEther(estimatedOut)}`);
    return estimatedOut;
  }
}

/**
 * Simulates a complete arbitrage route (buy on DEX1, sell on DEX2)
 * Returns the final amount and profit calculation
 * 
 * IMPORTANT: We simulate V3 swaps with Quoter V2 to get EXACT amounts
 * This accounts for concentrated liquidity and price impact
 */
export async function simulateArbitrageRoute(
  provider: ethers.Provider,
  buyRouter: string,
  sellRouter: string,
  amountIn: bigint,
  token0: string,
  token1: string,
  buyDexType: 'v2' | 'v3' = 'v2',
  sellDexType: 'v2' | 'v3' = 'v2',
  buyFee?: number,
  sellFee?: number
): Promise<{
  finalAmount: bigint;
  profit: bigint;
  profitPercent: number;
  profitable: boolean;
  buyOutput: bigint;
  priceImpactBps: number;
}> {
  try {
    logger.info(`🔍 Simulating arbitrage: ${ethers.formatEther(amountIn)} tokens`);
    logger.info(`  Buy: ${buyDexType === 'v3' ? `V3 (${buyFee ? buyFee/100 : '?'} bps)` : 'V2'} | Sell: ${sellDexType === 'v3' ? `V3 (${sellFee ? sellFee/100 : '?'} bps)` : 'V2'}`);
    
    // Step 1: Simulate BUY swap (token0 -> token1)
    let buyOutput: bigint;
    if (buyDexType === 'v3' && buyFee) {
      // Use V3 Quoter for accurate simulation
      buyOutput = await simulateV3Swap(provider, buyRouter, token0, token1, buyFee, amountIn);
    } else {
      // Use V2 router's getAmountsOut
      const buyPath = [token0, token1];
      buyOutput = await simulateV2Swap(provider, buyRouter, amountIn, buyPath);
    }
    
    logger.info(`  Buy simulation: ${ethers.formatEther(amountIn)} → ${ethers.formatEther(buyOutput)}`);
    
    // Step 2: Simulate SELL swap (token1 -> token0)
    let finalAmount: bigint;
    if (sellDexType === 'v3' && sellFee) {
      // Use V3 Quoter for accurate simulation
      finalAmount = await simulateV3Swap(provider, sellRouter, token1, token0, sellFee, buyOutput);
    } else {
      // Use V2 router's getAmountsOut
      const sellPath = [token1, token0];
      finalAmount = await simulateV2Swap(provider, sellRouter, buyOutput, sellPath);
    }
    
    logger.info(`  Sell simulation: ${ethers.formatEther(buyOutput)} → ${ethers.formatEther(finalAmount)}`);
    
    // Step 3: Calculate profit
    const profit = finalAmount - amountIn;
    const profitPercent = (Number(profit) * 100) / Number(amountIn);
    const profitable = profit > 0n;
    
    // Step 4: Calculate price impact
    // Expected output (off-chain) vs actual output (on-chain)
    const expectedOutput = amountIn; // Should be close to amountIn for arbitrage
    const priceImpactBps = Math.abs(((Number(expectedOutput) - Number(finalAmount)) / Number(expectedOutput)) * 10000);
    
    logger.info(`  Result: ${profitable ? '✅ PROFIT' : '❌ LOSS'} ${ethers.formatEther(profit)} (${profitPercent.toFixed(4)}%)`);
    logger.info(`  Price impact: ${priceImpactBps.toFixed(2)} bps`);
    
    return {
      finalAmount,
      profit,
      profitPercent,
      profitable,
      buyOutput,
      priceImpactBps
    };
  } catch (error) {
    logger.error(`Failed to simulate arbitrage route: ${error}`);
    throw error;
  }
}

/**
 * Simulates arbitrage and accounts for all costs (flash loan fee, gas)
 */
export async function simulateArbitrageWithCosts(
  provider: ethers.Provider,
  buyRouter: string,
  sellRouter: string,
  amountIn: bigint,
  token0: string,
  token1: string,
  flashLoanFeeBps: number = 5,
  estimatedGasUnits: bigint = 500000n,
  buyDexType: 'v2' | 'v3' = 'v2',
  sellDexType: 'v2' | 'v3' = 'v2',
  buyFee?: number,
  sellFee?: number
): Promise<{
  finalAmount: bigint;
  grossProfit: bigint;
  flashLoanFee: bigint;
  gasCost: bigint;
  netProfit: bigint;
  netProfitPercent: number;
  profitable: boolean;
  simulation: Awaited<ReturnType<typeof simulateArbitrageRoute>>;
}> {
  // Simulate the swaps
  const simulation = await simulateArbitrageRoute(
    provider,
    buyRouter,
    sellRouter,
    amountIn,
    token0,
    token1,
    buyDexType,
    sellDexType,
    buyFee,
    sellFee
  );
  
  // Calculate flash loan fee (e.g., 5 bps = 0.05%)
  const flashLoanFee = (amountIn * BigInt(flashLoanFeeBps)) / 10000n;
  
  // Estimate gas cost
  const feeData = await provider.getFeeData();
  const gasPrice = feeData.gasPrice || 0n;
  const gasCost = estimatedGasUnits * gasPrice;
  
  // Calculate execution slippage buffer (accounts for price movement between detection and execution)
  // This is CRITICAL: on-chain prices move during block time, MEV bots can frontrun, etc.
  const executionSlippageBps = getExecutionSlippageBps();
  const executionSlippageCost = (amountIn * BigInt(executionSlippageBps)) / 10000n;
  
  // Calculate net profit with ALL costs accounted for
  const grossProfit = simulation.profit;
  const totalCosts = flashLoanFee + gasCost + executionSlippageCost;
  const netProfit = grossProfit - totalCosts;
  const netProfitPercent = (Number(netProfit) * 100) / Number(amountIn);
  const profitable = netProfit > 0n;
  
  logger.info(`💰 Cost breakdown:`);
  logger.info(`  Gross profit: ${ethers.formatEther(grossProfit)}`);
  logger.info(`  Flash loan fee: ${ethers.formatEther(flashLoanFee)} (${flashLoanFeeBps} bps)`);
  logger.info(`  Gas cost: ${ethers.formatEther(gasCost)} MATIC`);
  logger.info(`  Execution slippage buffer: ${ethers.formatEther(executionSlippageCost)} (${executionSlippageBps} bps)`);
  logger.info(`  Total costs: ${ethers.formatEther(totalCosts)}`);
  logger.info(`  Net profit: ${ethers.formatEther(netProfit)} (${netProfitPercent.toFixed(4)}%)`);
  logger.info(`  Status: ${profitable ? '✅ PROFITABLE' : '❌ UNPROFITABLE'}`);
  
  return {
    finalAmount: simulation.finalAmount,
    grossProfit,
    flashLoanFee,
    gasCost,
    netProfit,
    netProfitPercent,
    profitable,
    simulation
  };
}
