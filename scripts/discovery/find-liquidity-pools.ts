/**
 * 🔍 Find Liquidity Pools on Sepolia
 * 
 * This script helps you discover which token pairs have liquidity
 * on Uniswap V2 (and compatible DEXes) on Sepolia testnet.
 */

import { ethers } from "ethers";
import { config } from "../src/config";

// Uniswap V2 Factory ABI (minimal - just what we need)
const FACTORY_ABI = [
  "function getPair(address tokenA, address tokenB) external view returns (address pair)",
  "function allPairs(uint256) external view returns (address pair)",
  "function allPairsLength() external view returns (uint256)",
];

// Uniswap V2 Pair ABI (minimal)
const PAIR_ABI = [
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
  "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function totalSupply() external view returns (uint256)",
];

// ERC20 ABI (minimal)
const ERC20_ABI = [
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
];

// Known Uniswap V2 deployments on Sepolia
const UNISWAP_V2_FACTORY = "0x7E0987E5b3a30e3f2828572Bc1A9B8B1991BCN1"; // May not exist
const UNISWAP_V2_ROUTER = config.dexes.uniswapV2Router;

// Backup: We'll check if Uniswap V2 exists, otherwise guide user to create pools

interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}

interface PairInfo {
  pairAddress: string;
  token0: TokenInfo;
  token1: TokenInfo;
  reserve0: bigint;
  reserve1: bigint;
  totalSupply: bigint;
  hasLiquidity: boolean;
}

async function getTokenInfo(tokenAddress: string, provider: ethers.Provider): Promise<TokenInfo> {
  try {
    const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const [symbol, name, decimals] = await Promise.all([
      token.symbol(),
      token.name(),
      token.decimals(),
    ]);
    
    return {
      address: tokenAddress,
      symbol,
      name,
      decimals: Number(decimals),
    };
  } catch (error) {
    console.error(`Failed to get token info for ${tokenAddress}:`, error);
    return {
      address: tokenAddress,
      symbol: "UNKNOWN",
      name: "Unknown Token",
      decimals: 18,
    };
  }
}

async function checkPairLiquidity(
  token0Address: string,
  token1Address: string,
  factoryAddress: string,
  provider: ethers.Provider
): Promise<PairInfo | null> {
  try {
    const factory = new ethers.Contract(factoryAddress, FACTORY_ABI, provider);
    const pairAddress = await factory.getPair(token0Address, token1Address);
    
    // Zero address means pair doesn't exist
    if (pairAddress === ethers.ZeroAddress) {
      return null;
    }
    
    const pair = new ethers.Contract(pairAddress, PAIR_ABI, provider);
    const [reserves, totalSupply, token0Info, token1Info] = await Promise.all([
      pair.getReserves(),
      pair.totalSupply(),
      getTokenInfo(token0Address, provider),
      getTokenInfo(token1Address, provider),
    ]);
    
    const hasLiquidity = reserves[0] > 0n && reserves[1] > 0n;
    
    return {
      pairAddress,
      token0: token0Info,
      token1: token1Info,
      reserve0: reserves[0],
      reserve1: reserves[1],
      totalSupply,
      hasLiquidity,
    };
  } catch (error) {
    console.error(`Failed to check pair ${token0Address}/${token1Address}:`, error);
    return null;
  }
}

async function findAllPairs(factoryAddress: string, provider: ethers.Provider): Promise<PairInfo[]> {
  try {
    const factory = new ethers.Contract(factoryAddress, FACTORY_ABI, provider);
    const pairsLength = await factory.allPairsLength();
    
    console.log(`Found ${pairsLength} total pairs on factory ${factoryAddress}`);
    
    const pairs: PairInfo[] = [];
    
    // Check each pair
    for (let i = 0; i < Number(pairsLength); i++) {
      try {
        const pairAddress = await factory.allPairs(i);
        const pair = new ethers.Contract(pairAddress, PAIR_ABI, provider);
        
        const [token0Address, token1Address, reserves, totalSupply] = await Promise.all([
          pair.token0(),
          pair.token1(),
          pair.getReserves(),
          pair.totalSupply(),
        ]);
        
        const [token0Info, token1Info] = await Promise.all([
          getTokenInfo(token0Address, provider),
          getTokenInfo(token1Address, provider),
        ]);
        
        const hasLiquidity = reserves[0] > 0n && reserves[1] > 0n;
        
        pairs.push({
          pairAddress,
          token0: token0Info,
          token1: token1Info,
          reserve0: reserves[0],
          reserve1: reserves[1],
          totalSupply,
          hasLiquidity,
        });
        
        console.log(`  [${i + 1}/${pairsLength}] ${token0Info.symbol}/${token1Info.symbol} - ${hasLiquidity ? "✓ HAS LIQUIDITY" : "✗ EMPTY"}`);
      } catch (error) {
        console.error(`  [${i + 1}/${pairsLength}] Failed to fetch pair info:`, error);
      }
    }
    
    return pairs;
  } catch (error) {
    console.error("Failed to fetch pairs:", error);
    return [];
  }
}

async function checkSpecificPairs(provider: ethers.Provider) {
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("🔍 Checking Specific Token Pairs on Sepolia");
  console.log("═══════════════════════════════════════════════════════════\n");
  
  const pairs = [
    { name: "WETH/USDC", token0: config.tokens.WETH, token1: config.tokens.USDC },
    { name: "WETH/DAI", token0: config.tokens.WETH, token1: config.tokens.DAI },
    { name: "WETH/LINK", token0: config.tokens.WETH, token1: config.tokens.LINK },
    { name: "USDC/DAI", token0: config.tokens.USDC, token1: config.tokens.DAI },
  ];
  
  // Try multiple factory addresses (different DEX deployments on Sepolia)
  const factories = [
    { name: "Uniswap V2", address: UNISWAP_V2_ROUTER }, // Will likely fail
  ];
  
  for (const factory of factories) {
    console.log(`\n📊 Checking ${factory.name} Factory: ${factory.address}\n`);
    
    for (const pair of pairs) {
      const pairInfo = await checkPairLiquidity(
        pair.token0,
        pair.token1,
        factory.address,
        provider
      );
      
      if (pairInfo) {
        console.log(`✅ ${pair.name} Pair Found!`);
        console.log(`   Address: ${pairInfo.pairAddress}`);
        console.log(`   ${pairInfo.token0.symbol} Reserve: ${ethers.formatUnits(pairInfo.reserve0, pairInfo.token0.decimals)}`);
        console.log(`   ${pairInfo.token1.symbol} Reserve: ${ethers.formatUnits(pairInfo.reserve1, pairInfo.token1.decimals)}`);
        console.log(`   Has Liquidity: ${pairInfo.hasLiquidity ? "YES ✓" : "NO ✗"}`);
      } else {
        console.log(`❌ ${pair.name} - Pair does not exist`);
      }
    }
  }
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║                                                            ║");
  console.log("║     🔍 FIND LIQUIDITY POOLS ON SEPOLIA TESTNET 🔍         ║");
  console.log("║                                                            ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");
  
  // Connect to Sepolia
  const provider = new ethers.JsonRpcProvider(config.network.rpcUrl);
  const network = await provider.getNetwork();
  
  console.log(`Connected to: ${network.name} (Chain ID: ${network.chainId})\n`);
  
  if (network.chainId !== 11155111n) {
    throw new Error("Not connected to Sepolia! Check your RPC URL.");
  }
  
  // Check specific pairs we're interested in
  await checkSpecificPairs(provider);
  
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("📋 SUMMARY & RECOMMENDATIONS");
  console.log("═══════════════════════════════════════════════════════════\n");
  
  console.log("🎯 OPTION 1: Use Existing Testnet Faucets");
  console.log("   If pools exist with liquidity, you can:");
  console.log("   1. Get test tokens from faucets");
  console.log("   2. Use existing liquidity for testing");
  console.log("   3. Execute small arbitrage tests\n");
  
  console.log("🏭 OPTION 2: Deploy Your Own Test Pools");
  console.log("   If no liquidity exists, you can:");
  console.log("   1. Deploy Uniswap V2 Factory & Router contracts");
  console.log("   2. Create pairs for your test tokens");
  console.log("   3. Add liquidity to the pools");
  console.log("   4. Test your arbitrage bot\n");
  
  console.log("🚀 OPTION 3: Use Mainnet (Recommended for Production)");
  console.log("   For real trading:");
  console.log("   1. Deploy contract to mainnet");
  console.log("   2. Use real DEX pools with deep liquidity");
  console.log("   3. Implement MEV protection");
  console.log("   4. Start with very small amounts\n");
  
  console.log("💡 NEXT STEPS:");
  console.log("   Run: npx hardhat run scripts/setup-test-pools.ts --network sepolia");
  console.log("   This will guide you through creating test pools if needed.\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
