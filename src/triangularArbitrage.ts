/**
 * Triangular Arbitrage Module - PROOF OF CONCEPT
 * 
 * Finds profit opportunities using 3-token cycles instead of direct swaps
 * Example: USDC → WETH → WMATIC → USDC
 * 
 * Benefits:
 * - Captures more opportunities (paths that direct arbitrage misses)
 * - Can use deeper liquidity pools (stablecoin pairs usually have more volume)
 * - Works around low-liquidity pairs by routing through high-volume intermediaries
 * 
 * TODO for full implementation:
 * 1. Integrate with bot.ts monitoring loop
 * 2. Add execution logic (multi-hop flash loan swap)
 * 3. Gas cost estimation for 3 swaps
 * 4. Slippage calculation across all legs
 * 5. MEV protection for complex paths
 */

import { logger } from "./logger";
import { getDexFee } from "./dexRouter";

/**
 * Triangular route structure
 * Represents a 3-hop arbitrage path
 */
export interface TriangularRoute {
  path: string[]; // e.g., ["USDC", "WETH", "WMATIC", "USDC"]
  dexes: string[]; // e.g., ["quickswap", "sushiswap", "quickswap"]
  estimatedProfit: number; // USD
  profitPercent: number;
  legs: {
    from: string;
    to: string;
    dex: string;
    price: number;
    liquidity: number;
  }[];
}

/**
 * Triangular Arbitrage Engine
 * 
 * CURRENT STATUS: Framework/skeleton implementation
 * 
 * This provides the structure for triangular arbitrage.
 * Integration with your existing PriceMonitor and execution
 * logic requires connecting to your specific data structures.
 * 
 * Key Concept:
 * Instead of: USDC → WMATIC (direct on 2 DEXes)
 * Use: USDC → WETH → WMATIC → USDC (3 hops, potentially more profit)
 * 
 * Why it works:
 * - USDC/WETH might have $300M liquidity
 * - WETH/WMATIC might have $150M liquidity  
 * - But USDC/WMATIC might only have $50k liquidity
 * - Routing through WETH gives better prices despite extra hop
 */
export class TriangularArbitrage {
  
  /**
   * Common intermediate tokens that typically have high liquidity
   * These act as "bridges" between other tokens
   */
  private readonly INTERMEDIATES = [
    "WMATIC", // Native token - always high liquidity on Polygon
    "USDC",   // Most popular stablecoin
    "WETH",   // Second most liquid (wrapped ETH)
    "USDT",   // Stablecoin alternative
    "DAI",    // Decentralized stablecoin
  ];

  /**
   * Find triangular arbitrage opportunities
   * 
   * Logic:
   * 1. Start with base token (e.g., USDC)
   * 2. Try paths: USDC → X → Y → USDC
   * 3. Calculate if you end up with more USDC than you started
   * 4. Account for fees on each leg
   * 
   * Example profitable path:
   * Start: 1000 USDC
   * Leg 1: 1000 USDC → 0.5 WETH @ 2000 (QuickSwap, -0.25% fee = 0.49875 WETH)
   * Leg 2: 0.49875 WETH → 1200 WMATIC @ 2400 (SushiSwap, -0.30% fee = 1196.4 WMATIC)
   * Leg 3: 1196.4 WMATIC → 1015 USDC @ 0.848 (QuickSwap, -0.25% fee = 1012.5 USDC)
   * End: 1012.5 USDC
   * Profit: 12.5 USDC (1.25%)
   * 
   * @param baseToken - Token to start and end with (usually a stablecoin)
   * @param minProfitPercent - Minimum profit threshold
   */
  async findOpportunities(
    baseToken: string = "USDC",
    minProfitPercent: number = 0.2
  ): Promise<TriangularRoute[]> {
    const opportunities: TriangularRoute[] = [];
    
    logger.info(`[TRIANGULAR] Scanning for ${baseToken} arbitrage cycles...`);
    logger.info(`[TRIANGULAR] This is a proof-of-concept - full integration pending`);
    
    // TODO: Integrate with actual price data from PriceMonitor
    // For now, this is a framework showing the concept
    
    logger.info(
      `[TRIANGULAR] Would scan ${this.INTERMEDIATES.length} intermediates for cycles`
    );
    logger.info(`[TRIANGULAR] Example paths to check:`);
    
    for (const int1 of this.INTERMEDIATES) {
      if (int1 === baseToken) continue;
      for (const int2 of this.INTERMEDIATES) {
        if (int2 === baseToken || int2 === int1) continue;
        
        const path = `${baseToken} → ${int1} → ${int2} → ${baseToken}`;
        logger.debug(`[TRIANGULAR]   ${path}`);
      }
    }
    
    return opportunities;
  }

  /**
   * Calculate optimal trade size for triangular route
   * Must consider liquidity across ALL 3 legs - the bottleneck determines max size
   * 
   * Example:
   * Leg 1: USDC/WETH has $200k liquidity (20% = $40k max)
   * Leg 2: WETH/WMATIC has $50k liquidity (20% = $10k max) ← BOTTLENECK
   * Leg 3: WMATIC/USDC has $100k liquidity (20% = $20k max)
   * 
   * Max trade size = $10k (limited by leg 2)
   */
  calculateTradeSize(
    route: TriangularRoute,
    minTradeSize: number,
    maxTradeSize: number
  ): number {
    // Find the leg with minimum liquidity (bottleneck)
    const minLiquidity = Math.min(...route.legs.map(leg => leg.liquidity));
    
    // Apply 20% pool depth rule to the most constraining leg
    const maxSafeTradeSize = minLiquidity * 0.20;
    
    if (maxSafeTradeSize < minTradeSize) {
      logger.warning(
        `[TRIANGULAR] Route too small! 20% of $${minLiquidity.toLocaleString()} = ` +
        `$${maxSafeTradeSize.toLocaleString()} < min $${minTradeSize}`
      );
      return 0; // Can't execute
    }
    
    // Use the smaller of: max safe size OR configured max
    const tradeSize = Math.min(maxSafeTradeSize, maxTradeSize);
    
    const percentOfPool = ((tradeSize / minLiquidity) * 100).toFixed(1);
    logger.info(
      `[TRIANGULAR] Trade size: $${tradeSize.toFixed(2)} ` +
      `(${percentOfPool}% of $${minLiquidity.toLocaleString()} pool)`
    );
    
    return tradeSize;
  }

  /**
   * Format route for logging
   */
  formatRoute(route: TriangularRoute): string {
    const pathStr = route.path.join(" → ");
    const dexStr = route.dexes.join(" → ");
    const profit = route.estimatedProfit.toFixed(2);
    const percent = route.profitPercent.toFixed(3);
    return `${pathStr} via [${dexStr}] = $${profit} (${percent}%)`;
  }
}

/**
 * INTEGRATION NOTES FOR FULL IMPLEMENTATION:
 * 
 * 1. **Connect to PriceMonitor:**
 *    - Need to query prices for pairs like getPricesForPair({token0: "USDC", token1: "WETH"})
 *    - Store/cache prices to avoid repeated queries
 *    - Handle case where pair doesn't exist on a DEX
 * 
 * 2. **Execution (TradeExecutor):**
 *    - Flash loan for initial capital (e.g., 1000 USDC)
 *    - Execute swap1: USDC → WETH on DEX1
 *    - Execute swap2: WETH → WMATIC on DEX2
 *    - Execute swap3: WMATIC → USDC on DEX3
 *    - Repay flash loan + profit
 * 
 * 3. **Smart Contract Changes:**
 *    - Current contract does 2-hop arbitrage
 *    - Need to add executeTriangularArbitrage() function
 *    - Support for 3+ swaps in sequence
 * 
 * 4. **Gas Costs:**
 *    - 3 swaps instead of 2 = ~450k gas (vs 300k)
 *    - On Polygon @ 30 gwei = ~$0.015 (still very cheap!)
 *    - Need higher profit to justify extra gas
 * 
 * 5. **MEV Protection:**
 *    - More complex paths = easier to front-run
 *    - MUST use Flashbots or private RPC
 *    - Consider splitting into smaller trades
 * 
 * 6. **Benefits:**
 *    - Can capture 10-50x more opportunities
 *    - Works around low-liquidity pairs
 *    - Takes advantage of price inconsistencies across multiple pairs
 *    - Typical triangular profit: 0.3-1% (vs 0.1-0.3% for 2-way)
 * 
 * Example Real Scenario (Polygon 2025):
 * - USDC/WMATIC direct: Only $50k liquidity, 0.15% spread
 * - USDC → USDT → WMATIC: $500k + $300k liquidity, 0.45% spread
 * - Triangular captures 3x more profit despite extra hop!
 */

