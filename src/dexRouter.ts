/**
 * 🔀 DEX Router Manager
 * 
 * Maps DEX names to their actual router addresses on Polygon.
 * This ensures we trade on the CORRECT DEXes, not just Uniswap!
 */

import { config } from "./config";
import { getChainConfig } from "./multichainConfig";

// ============================================================================
// DEX ROUTER MAPPING
// ============================================================================

/**
 * Map DEX names to their router addresses
 */
export const DEX_ROUTERS: Record<string, string> = {
  // QuickSwap (most popular on Polygon) ✅
  "QuickSwap": config.dexes.quickswap,
  "Quickswap": config.dexes.quickswap,
  "quickswap": config.dexes.quickswap,
  
  // SushiSwap ✅
  "SushiSwap": config.dexes.sushiswap,
  "Sushiswap": config.dexes.sushiswap,
  "sushiswap": config.dexes.sushiswap,
  "SUSHI": config.dexes.sushiswap,
  
  // Uniswap V3 ✅ NEW - Lower fees, concentrated liquidity
  "UniswapV3": config.dexes.uniswapv3,
  "Uniswapv3": config.dexes.uniswapv3,
  "uniswapv3": config.dexes.uniswapv3,
  "UNI": config.dexes.uniswapv3,
  "Uniswap": config.dexes.uniswapv3,
  "uniswap": config.dexes.uniswapv3,
  
  // Dfyn removed - only 2/9 pairs had real liquidity
  // "Dfyn": config.dexes.dfyn,
  // "dfyn": config.dexes.dfyn,
  // "DFYN": config.dexes.dfyn,
  
  // ApeSwap removed (limited liquidity on Polygon)
  // "ApeSwap": config.dexes.apeswap,
  // "Apeswap": config.dexes.apeswap,
  // "apeswap": config.dexes.apeswap,
  // "APE": config.dexes.apeswap,
  
  // Balancer
  "Balancer": config.dexes.balancer,
  "balancer": config.dexes.balancer,
  "BAL": config.dexes.balancer,
};

/**
 * Get router address for a DEX name
 * Falls back to QuickSwap if DEX not found
 */
export function getDexRouter(dexName: string): string {
  const router = DEX_ROUTERS[dexName];
  
  if (!router) {
    console.warn(`[WARNING] DEX "${dexName}" not found in router mapping. Using QuickSwap as fallback.`);
    return config.dexes.quickswap; // Safe fallback
  }
  
  return router;
}

/**
 * Check if a DEX uses Uniswap V2 compatible interface
 * (Curve and Balancer use different interfaces)
 */
export function isUniswapV2Compatible(dexName: string): boolean {
  const v2Compatible = [
    "QuickSwap", "Quickswap", "quickswap",
    "SushiSwap", "Sushiswap", "sushiswap", "SUSHI",
    // Note: Uniswap V3 has different interface, handled separately
  ];
  
  return v2Compatible.includes(dexName);
}

/**
 * Get DEX type for specialized handling
 */
export function getDexType(dexName: string): "uniswapV2" | "curve" | "balancer" | "uniswapV3" {
  const normalized = dexName.toLowerCase();
  
  if (normalized.includes("curve")) {
    return "curve";
  }
  
  if (normalized.includes("balancer")) {
    return "balancer";
  }
  
  if (normalized.includes("uniswap") && !normalized.includes("v2")) {
    return "uniswapV3";
  }
  
  // Default to Uniswap V2 (QuickSwap, SushiSwap use same interface)
  return "uniswapV2";
}

/**
 * Estimate swap fee for a DEX (in basis points)
 * Returns actual DEX-specific fees from config
 * 
 * For Uniswap V3: Can optionally pass actual fee tier used
 */
export function getDexFee(dexName: string, v3FeeTier?: number): number {
  // If V3 fee tier provided, use it directly (convert from hundredths of bip to bps)
  if (v3FeeTier !== undefined && dexName.toLowerCase().includes("uniswap")) {
    return v3FeeTier / 100; // 500 -> 5 bps, 3000 -> 30 bps, 10000 -> 100 bps
  }
  
  // Get network-specific config with actual DEX fees
  const chainConfig = getChainConfig(config.network.chainId);
  
  if (chainConfig && chainConfig.dexes) {
    const dex = chainConfig.dexes[dexName.toLowerCase()];
    if (dex && dex.fee) {
      return dex.fee; // Use actual fee from config (QuickSwap=25, SushiSwap=30, UniswapV3=5)
    }
  }
  
  // Fallback to type-based estimation if not in config
  const dexType = getDexType(dexName);
  
  switch (dexType) {
    case "uniswapV2":
      return 30; // 0.3% = 30 bps (conservative fallback)
    case "uniswapV3":
      return 5; // 0.05% for stablecoins (lowest tier) - can also be 30 or 100 bps
    case "curve":
      return 4; // ~0.04% for stablecoins
    case "balancer":
      return 10; // Varies by pool, ~0.1% average
    default:
      return 30; // Conservative default
  }
}

/**
 * Get estimated gas cost for a trade on this DEX (in USD)
 * 
 * This estimates the total gas cost including:
 * - Network base fee (Polygon is cheap!)
 * - DEX router complexity
 * - Flash loan overhead
 */
export function getEstimatedGasCost(dexName: string, gasPrice: bigint): number {
  const dexType = getDexType(dexName);
  
  // Base gas estimates for different DEX types
  let gasUnits: number;
  
  switch (dexType) {
    case "uniswapV2":
      gasUnits = 400000; // QuickSwap, SushiSwap - simple and efficient
      break;
    case "uniswapV3":
      gasUnits = 600000; // More complex math, higher gas
      break;
    case "curve":
      gasUnits = 350000; // Very optimized for stablecoins
      break;
    case "balancer":
      gasUnits = 700000; // Complex pool math, highest gas
      break;
    default:
      gasUnits = 500000;
  }
  
  // Add flash loan overhead (constant ~100k gas)
  const totalGasUnits = BigInt(gasUnits + 100000);
  
  // Calculate cost in wei
  const gasCostWei = totalGasUnits * gasPrice;
  
  // Convert to MATIC (18 decimals)
  const gasCostMatic = Number(gasCostWei) / 1e18;
  
  // Convert to USD (MATIC price ~$0.50)
  const maticPriceUsd = 0.5;
  const gasCostUsd = gasCostMatic * maticPriceUsd;
  
  return gasCostUsd;
}

/**
 * ✅ NEW: Check if a DEX is acceptable for trading based on gas costs
 * 
 * Rejects DEXes where:
 * - Single trade gas cost > $10
 * - DEX is known to be expensive
 * 
 * @param dexName Name of the DEX
 * @param currentGasPrice Current network gas price in wei
 * @param maxGasCostUsd Maximum acceptable gas cost in USD (default: $10)
 * @returns true if DEX is acceptable, false if too expensive
 */
export function isDexAcceptable(
  dexName: string, 
  currentGasPrice: bigint,
  maxGasCostUsd: number = 10.0
): { acceptable: boolean; reason?: string; estimatedCost?: number } {
  
  // Calculate estimated gas cost for this DEX
  const estimatedGasCost = getEstimatedGasCost(dexName, currentGasPrice);
  
  // Check if gas cost exceeds threshold
  if (estimatedGasCost > maxGasCostUsd) {
    return {
      acceptable: false,
      reason: `Gas cost ($${estimatedGasCost.toFixed(2)}) exceeds maximum ($${maxGasCostUsd})`,
      estimatedCost: estimatedGasCost
    };
  }
  
  // Balancer has high gas even on Polygon - warn if close to limit
  const dexType = getDexType(dexName);
  if (dexType === "balancer" && estimatedGasCost > maxGasCostUsd * 0.8) {
    return {
      acceptable: false,
      reason: `Balancer gas cost ($${estimatedGasCost.toFixed(2)}) too high for profitable arbitrage`,
      estimatedCost: estimatedGasCost
    };
  }
  
  // Uniswap V3 can be expensive with complex positions
  if (dexType === "uniswapV3" && estimatedGasCost > maxGasCostUsd * 0.7) {
    return {
      acceptable: false,
      reason: `Uniswap V3 gas cost ($${estimatedGasCost.toFixed(2)}) too high`,
      estimatedCost: estimatedGasCost
    };
  }
  
  // DEX is acceptable
  return {
    acceptable: true,
    estimatedCost: estimatedGasCost
  };
}

/**
 * Get recommended DEXes for low-fee trading on Polygon
 * 
 * Ranked by efficiency and cost:
 * 1. ApeSwap - Uniswap V2 compatible, low fees
 * 2. QuickSwap - Most popular, good liquidity, low gas
 * 3. SushiSwap - Good alternative, similar to QuickSwap
 */
export function getRecommendedDexes(): string[] {
  return [
    "ApeSwap",    // Uniswap V2 compatible - low gas + fees
    "QuickSwap",  // Best for general trading - most liquid
    "Sushiswap",  // Good alternative - competitive fees
    // "Uniswap" and "Balancer" excluded - higher gas costs
  ];
}

/**
 * Check if a DEX pair is efficient for trading
 */
export function isDexPairEfficient(
  buyDexName: string,
  sellDexName: string,
  currentGasPrice: bigint
): { efficient: boolean; reason?: string; totalGasCost?: number } {
  
  const maxGasPerDex = 5.0; // $5 max per DEX = $10 total for round trip
  
  // Check buy DEX
  const buyDexCheck = isDexAcceptable(buyDexName, currentGasPrice, maxGasPerDex);
  if (!buyDexCheck.acceptable) {
    return {
      efficient: false,
      reason: `Buy DEX (${buyDexName}): ${buyDexCheck.reason}`,
      totalGasCost: (buyDexCheck.estimatedCost || 0)
    };
  }
  
  // Check sell DEX
  const sellDexCheck = isDexAcceptable(sellDexName, currentGasPrice, maxGasPerDex);
  if (!sellDexCheck.acceptable) {
    return {
      efficient: false,
      reason: `Sell DEX (${sellDexName}): ${sellDexCheck.reason}`,
      totalGasCost: (sellDexCheck.estimatedCost || 0)
    };
  }
  
  // Calculate total gas cost for the arbitrage
  const totalGasCost = (buyDexCheck.estimatedCost || 0) + (sellDexCheck.estimatedCost || 0);
  
  // Check total cost
  if (totalGasCost > 10.0) {
    return {
      efficient: false,
      reason: `Total gas cost ($${totalGasCost.toFixed(2)}) exceeds $10 limit`,
      totalGasCost
    };
  }
  
  return {
    efficient: true,
    totalGasCost
  };
}
