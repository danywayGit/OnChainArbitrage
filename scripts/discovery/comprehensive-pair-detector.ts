/**
 * COMPREHENSIVE TRADING PAIR DETECTOR AND VERIFIER
 * 
 * This script will:
 * 1. Generate trading pairs from ALL available tokens
 * 2. Filter out top 15 tokens by volume/market cap (MEV dominated)
 * 3. Remove stablecoin vs stablecoin pairs
 * 4. Verify liquidity across all chains (Polygon, BSC, Base)
 * 5. Verify price spreads and detect fake pools
 * 6. Generate comprehensive trading-pairs.json with many more pairs
 */

import { ethers } from 'ethers';
import config from '../src/config';
import fs from 'fs';
import path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

// Top 15 tokens by volume/market cap (MEV dominated - EXCLUDE THESE)
const TOP_15_TOKENS = [
  'WETH', 'WBTC', 'USDC', 'USDT', 'DAI', 'BNB', 'MATIC', 'WMATIC',
  'LINK', 'UNI', 'AAVE', 'ATOM', 'LDO', 'MKR', 'SNX'
];

// Stablecoins (exclude stablecoin vs stablecoin pairs)
const STABLECOINS = [
  'USDC', 'USDT', 'DAI', 'BUSD', 'USDD', 'TUSD', 'FRAX', 'MAI',
  'sUSD', 'EURS', 'AGEUR', 'jEUR', 'RAI', 'LUSD'
];

// Minimum liquidity thresholds (USD)
const MIN_LIQUIDITY = {
  polygon: 50000,   // $50k minimum on Polygon
  bsc: 50000,       // $50k minimum on BSC
  base: 30000,      // $30k minimum on Base (newer chain)
};

// Maximum spread to consider (fake pool detection)
const MAX_SPREAD = 5.0; // 5% maximum spread

// Uniswap V2 Pair ABI (minimal - just what we need)
const PAIR_ABI = [
  'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function token0() external view returns (address)',
  'function token1() external view returns (address)',
];

// Uniswap V2 Factory ABI
const FACTORY_ABI = [
  'function getPair(address tokenA, address tokenB) external view returns (address pair)',
];

// ERC20 ABI (for decimals)
const ERC20_ABI = [
  'function decimals() external view returns (uint8)',
  'function symbol() external view returns (string)',
];

// Factory addresses
const FACTORIES = {
  polygon: {
    quickswap: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
    sushiswap: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    apeswap: '0xCf083Be4164828f00cAE704EC15a36D711491284',
    dfyn: '0xE7Fb3e833eFE5F9c441105EB65Ef8b261266423B',
    polycat: '0x477Ce834Ae6b7aB003cCe4BC4d8697763FF456FA',
    jetswap: '0x668ad0ed2622C62E24f0d5ab6B6Ac1b9D2cD4AC7',
  },
  bsc: {
    pancakeswap: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
    apeswap: '0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6',
    biswap: '0x858E3312ed3A876947EA49d572A7C42DE08af7EE',
    bakeryswap: '0x01bF7C66c6BD861915CdaaE475042d3c4BaE16A7',
    mdex: '0x3CD1C46068dAEa5Ebb0d3f55F6915B10648062B8',
  },
  base: {
    baseswap: '0xFDa619b6d20975be80A10332cD39b9a4b0FAa8BB',
    sushiswap: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    swapbased: '0x04C9f118d21e8B767D2e50C946f0cC9F6C367300',
    aerodrome: '0x420DD381b31aEf6683db6B902084cB0FFECe40Da',
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function isTop15Token(symbol: string): boolean {
  return TOP_15_TOKENS.includes(symbol.toUpperCase());
}

function isStablecoin(symbol: string): boolean {
  return STABLECOINS.includes(symbol.toUpperCase());
}

function isStablecoinPair(token0: string, token1: string): boolean {
  return isStablecoin(token0) && isStablecoin(token1);
}

async function getPairAddress(
  factory: string,
  tokenA: string,
  tokenB: string,
  provider: ethers.Provider
): Promise<string> {
  try {
    const factoryContract = new ethers.Contract(factory, FACTORY_ABI, provider);
    const pairAddress = await factoryContract.getPair(tokenA, tokenB);
    return pairAddress;
  } catch (error) {
    return ethers.ZeroAddress;
  }
}

async function getPairLiquidity(
  pairAddress: string,
  token0Decimals: number,
  token1Decimals: number,
  provider: ethers.Provider,
  priceUSD: { token0: number; token1: number }
): Promise<number> {
  try {
    if (pairAddress === ethers.ZeroAddress) return 0;

    const pairContract = new ethers.Contract(pairAddress, PAIR_ABI, provider);
    const reserves = await pairContract.getReserves();

    const reserve0 = Number(ethers.formatUnits(reserves.reserve0, token0Decimals));
    const reserve1 = Number(ethers.formatUnits(reserves.reserve1, token1Decimals));

    // Calculate USD value of liquidity
    const liquidityUSD = (reserve0 * priceUSD.token0) + (reserve1 * priceUSD.token1);

    return liquidityUSD;
  } catch (error) {
    return 0;
  }
}

async function getPrice(
  pairAddress: string,
  token0Decimals: number,
  token1Decimals: number,
  provider: ethers.Provider
): Promise<number | null> {
  try {
    if (pairAddress === ethers.ZeroAddress) return null;

    const pairContract = new ethers.Contract(pairAddress, PAIR_ABI, provider);
    const reserves = await pairContract.getReserves();

    const reserve0 = Number(ethers.formatUnits(reserves.reserve0, token0Decimals));
    const reserve1 = Number(ethers.formatUnits(reserves.reserve1, token1Decimals));

    if (reserve0 === 0 || reserve1 === 0) return null;

    return reserve1 / reserve0; // Price of token0 in terms of token1
  } catch (error) {
    return null;
  }
}

// ============================================================================
// MAIN PAIR GENERATION LOGIC
// ============================================================================

interface PairCandidate {
  name: string;
  token0: string;
  token1: string;
  token0Address: string;
  token1Address: string;
  enabled: boolean;
  reason: string;
  verifiedSpread?: number | null;
  liquidity?: {
    polygon?: number;
    bsc?: number;
    base?: number;
  };
}

async function generatePairCandidates(chain: 'polygon' | 'bsc' | 'base'): Promise<PairCandidate[]> {
  console.log(`\n🔍 Generating pair candidates for ${chain.toUpperCase()}...`);

  const tokens = chain === 'polygon' ? config.tokens : 
                 chain === 'bsc' ? config.tokensBSC :
                 config.tokensBase;

  const tokenSymbols = Object.keys(tokens);
  const pairs: PairCandidate[] = [];

  // Generate all possible pairs
  for (let i = 0; i < tokenSymbols.length; i++) {
    for (let j = i + 1; j < tokenSymbols.length; j++) {
      const token0 = tokenSymbols[i];
      const token1 = tokenSymbols[j];

      // Skip if either token is in top 15
      if (isTop15Token(token0) || isTop15Token(token1)) {
        pairs.push({
          name: `${token0}/${token1}`,
          token0,
          token1,
          token0Address: tokens[token0 as keyof typeof tokens] as string,
          token1Address: tokens[token1 as keyof typeof tokens] as string,
          enabled: false,
          reason: `Contains top 15 token (MEV dominated)`,
        });
        continue;
      }

      // Skip if both are stablecoins
      if (isStablecoinPair(token0, token1)) {
        pairs.push({
          name: `${token0}/${token1}`,
          token0,
          token1,
          token0Address: tokens[token0 as keyof typeof tokens] as string,
          token1Address: tokens[token1 as keyof typeof tokens] as string,
          enabled: false,
          reason: `Stablecoin vs stablecoin (low profit potential)`,
        });
        continue;
      }

      // Add as candidate for verification
      pairs.push({
        name: `${token0}/${token1}`,
        token0,
        token1,
        token0Address: tokens[token0 as keyof typeof tokens] as string,
        token1Address: tokens[token1 as keyof typeof tokens] as string,
        enabled: false, // Will be enabled after verification
        reason: `Pending verification`,
      });
    }
  }

  console.log(`✅ Generated ${pairs.length} pair candidates`);
  console.log(`   - Filtered out: ${pairs.filter(p => p.reason !== 'Pending verification').length}`);
  console.log(`   - To verify: ${pairs.filter(p => p.reason === 'Pending verification').length}`);

  return pairs;
}

async function verifyPairsOnChain(
  pairs: PairCandidate[],
  chain: 'polygon' | 'bsc' | 'base',
  provider: ethers.Provider
): Promise<PairCandidate[]> {
  console.log(`\n🔬 Verifying pairs on ${chain.toUpperCase()}...`);

  const factories = FACTORIES[chain];
  const dexNames = Object.keys(factories);
  const minLiquidity = MIN_LIQUIDITY[chain];

  // Simple price estimates (you can improve this with real price feeds)
  const priceEstimates: Record<string, number> = {
    WETH: 2500, WBTC: 45000, WBNB: 300, WMATIC: 0.8,
    USDC: 1, USDT: 1, DAI: 1, BUSD: 1,
  };

  let verified = 0;
  const candidatesForVerification = pairs.filter(p => p.reason === 'Pending verification');

  for (let i = 0; i < candidatesForVerification.length; i++) {
    const pair = candidatesForVerification[i];
    
    if (i % 10 === 0) {
      console.log(`   Progress: ${i}/${candidatesForVerification.length} pairs verified...`);
    }

    try {
      // Check liquidity on at least 2 DEXes
      const liquidities: number[] = [];
      const prices: number[] = [];

      for (const dexName of dexNames) {
        const factory = factories[dexName as keyof typeof factories];
        const pairAddress = await getPairAddress(
          factory,
          pair.token0Address,
          pair.token1Address,
          provider
        );

        if (pairAddress !== ethers.ZeroAddress) {
          // Estimate liquidity (simplified - assumes 18 decimals)
          const price = await getPrice(pairAddress, 18, 18, provider);
          if (price !== null) {
            prices.push(price);
            
            // Rough liquidity estimate
            const liquidity = await getPairLiquidity(
              pairAddress,
              18,
              18,
              provider,
              {
                token0: priceEstimates[pair.token0] || 1,
                token1: priceEstimates[pair.token1] || 1,
              }
            );
            liquidities.push(liquidity);
          }
        }
      }

      // Require liquidity on at least 2 DEXes
      if (liquidities.length < 2) {
        pair.reason = `No liquidity on at least 2 DEXes`;
        continue;
      }

      // Check if liquidity meets minimum
      const avgLiquidity = liquidities.reduce((a, b) => a + b, 0) / liquidities.length;
      if (avgLiquidity < minLiquidity) {
        pair.reason = `Insufficient liquidity ($${avgLiquidity.toFixed(0)} < $${minLiquidity})`;
        continue;
      }

      // Calculate spread between DEXes
      if (prices.length >= 2) {
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const spread = ((maxPrice - minPrice) / minPrice) * 100;

        if (spread > MAX_SPREAD) {
          pair.enabled = false;
          pair.verifiedSpread = spread;
          pair.reason = `Fake pool detected (${spread.toFixed(2)}% spread)`;
          continue;
        }

        // VALID PAIR!
        pair.enabled = true;
        pair.verifiedSpread = spread;
        pair.reason = `Verified liquidity ($${avgLiquidity.toFixed(0)}), realistic spread (${spread.toFixed(4)}%)`;
        pair.liquidity = { [chain]: avgLiquidity };
        verified++;
      }

    } catch (error) {
      pair.reason = `Verification error: ${(error as Error).message}`;
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`✅ Verified ${verified} valid pairs on ${chain.toUpperCase()}`);
  return pairs;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║     COMPREHENSIVE TRADING PAIR DETECTOR & VERIFIER            ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  // Setup providers
  const providers = {
    polygon: new ethers.JsonRpcProvider(
      process.env.POLYGON_RPC_URL || 'https://polygon-mainnet.g.alchemy.com/v2/5z1t0IOirVugLoPi0wSHv'
    ),
    bsc: new ethers.JsonRpcProvider(
      process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/'
    ),
    base: new ethers.JsonRpcProvider(
      process.env.BASE_RPC_URL || 'https://base-mainnet.g.alchemy.com/v2/5z1t0IOirVugLoPi0wSHv'
    ),
  };

  // Generate and verify pairs for each chain
  const allPairs: Record<string, PairCandidate[]> = {};

  for (const chain of ['polygon', 'bsc', 'base'] as const) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`CHAIN: ${chain.toUpperCase()}`);
    console.log('='.repeat(70));

    // Generate candidates
    const candidates = await generatePairCandidates(chain);

    // Verify on-chain
    const verifiedPairs = await verifyPairsOnChain(candidates, chain, providers[chain]);

    allPairs[chain] = verifiedPairs;
  }

  // ============================================================================
  // AGGREGATE RESULTS
  // ============================================================================

  console.log('\n' + '='.repeat(70));
  console.log('AGGREGATING MULTI-CHAIN RESULTS');
  console.log('='.repeat(70));

  // Combine pairs from all chains (use Polygon as base)
  const polygonPairs = allPairs.polygon;

  // For pairs that appear on multiple chains, aggregate liquidity
  for (const bscPair of allPairs.bsc) {
    const polygonMatch = polygonPairs.find(p => p.name === bscPair.name);
    if (polygonMatch && bscPair.liquidity) {
      if (!polygonMatch.liquidity) polygonMatch.liquidity = {};
      polygonMatch.liquidity.bsc = bscPair.liquidity.bsc;
      
      // If valid on BSC but not Polygon, consider enabling
      if (bscPair.enabled && !polygonMatch.enabled) {
        polygonMatch.enabled = true;
        polygonMatch.reason = `Valid on BSC: ${bscPair.reason}`;
      }
    }
  }

  for (const basePair of allPairs.base) {
    const polygonMatch = polygonPairs.find(p => p.name === basePair.name);
    if (polygonMatch && basePair.liquidity) {
      if (!polygonMatch.liquidity) polygonMatch.liquidity = {};
      polygonMatch.liquidity.base = basePair.liquidity.base;
      
      // If valid on Base but not Polygon, consider enabling
      if (basePair.enabled && !polygonMatch.enabled) {
        polygonMatch.enabled = true;
        polygonMatch.reason = `Valid on Base: ${basePair.reason}`;
      }
    }
  }

  // ============================================================================
  // SAVE RESULTS
  // ============================================================================

  const enabledPairs = polygonPairs.filter(p => p.enabled);
  const excludedPairs = polygonPairs.filter(p => !p.enabled);

  const output = {
    lastUpdated: new Date().toISOString(),
    updateFrequency: 'daily',
    source: 'comprehensive_auto_verification',
    criteria: {
      excludeTop15: true,
      excludeStablecoinPairs: true,
      maxSpread: MAX_SPREAD,
      minLiquidity: MIN_LIQUIDITY,
      verifiedDEXes: ['quickswap', 'sushiswap', 'apeswap', 'dfyn', 'polycat', 'jetswap'],
      verifiedChains: ['polygon', 'bsc', 'base'],
    },
    pairs: polygonPairs.map(p => ({
      name: p.name,
      token0: p.token0,
      token1: p.token1,
      enabled: p.enabled,
      verifiedSpread: p.verifiedSpread,
      reason: p.reason,
      liquidity: p.liquidity,
    })),
    excludedPairs: excludedPairs.map(p => ({
      name: p.name,
      reason: p.reason,
    })),
  };

  const outputPath = path.join(process.cwd(), 'data', 'trading-pairs.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  // ============================================================================
  // SUMMARY
  // ============================================================================

  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                    DETECTION COMPLETE                          ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  console.log(`📊 SUMMARY`);
  console.log(`   Total pairs analyzed: ${polygonPairs.length}`);
  console.log(`   ✅ Enabled pairs: ${enabledPairs.length}`);
  console.log(`   ❌ Excluded pairs: ${excludedPairs.length}`);
  console.log(``);
  console.log(`📁 Output saved to: ${outputPath}`);
  console.log(``);

  console.log(`✅ ENABLED PAIRS:`);
  enabledPairs.slice(0, 20).forEach(p => {
    const chains = Object.keys(p.liquidity || {}).join(', ');
    console.log(`   - ${p.name.padEnd(20)} Spread: ${p.verifiedSpread?.toFixed(4)}% | Chains: ${chains}`);
  });
  if (enabledPairs.length > 20) {
    console.log(`   ... and ${enabledPairs.length - 20} more pairs`);
  }

  console.log(``);
  console.log(`❌ EXCLUDED CATEGORIES:`);
  const reasons = excludedPairs.reduce((acc, p) => {
    const category = p.reason.includes('top 15') ? 'Top 15 tokens' :
                     p.reason.includes('Stablecoin') ? 'Stablecoin pairs' :
                     p.reason.includes('liquidity') ? 'No liquidity' :
                     p.reason.includes('Fake pool') ? 'Fake pools' : 'Other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(reasons).forEach(([reason, count]) => {
    console.log(`   - ${reason}: ${count}`);
  });

  console.log('\n🎉 Done! You now have a comprehensive list of trading pairs.\n');
}

main().catch(console.error);
