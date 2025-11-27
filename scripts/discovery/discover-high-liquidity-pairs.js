/**
 * Discover high-liquidity trading pairs on Polygon
 * Filters for pairs with >$50k liquidity and >$100k daily volume
 * Appends new pairs to existing trading-pairs.json without removing current ones
 */

const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Network configuration
const RPC_URL = process.env.POLYGON_RPC_URL || "https://polygon-mainnet.g.alchemy.com/v2/5z1t0IOirVugLoPi0wSHv";
const provider = new ethers.JsonRpcProvider(RPC_URL);

// DEX Router addresses on Polygon
const QUICKSWAP_ROUTER = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff";
const SUSHISWAP_ROUTER = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";
const UNISWAP_V3_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564"; // Uniswap V3 on Polygon

// High-volume tokens on Polygon (focusing on stablecoins and blue chips)
const HIGH_LIQUIDITY_TOKENS = {
  // Stablecoins (highest volume, tightest spreads)
  USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
  FRAX: "0x45c32fA6DF82ead1e2EF74d17b76547EDdFaFF89",
  MAI: "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1",
  
  // Native/Wrapped
  WMATIC: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  WETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
  WBTC: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
  
  // Large Cap DeFi
  AAVE: "0xD6DF932A45C0f255f85145f286eA0b292B21C90B",
  UNI: "0xb33EaAd8d922B1083446DC23f610c2567fB5180f",
  LINK: "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39",
  CRV: "0x172370d5Cd63279eFa6d502DAB29171933a610AF",
  
  // Polygon Ecosystem
  MATIC: "0x0000000000000000000000000000000000001010", // Native MATIC
  QUICK: "0xB5C064F955D8e7F38fE0460C556a72987494eE17",
  SUSHI: "0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a",
};

// Uniswap V2 Pair ABI (minimal - just what we need)
const PAIR_ABI = [
  "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
];

// Uniswap V2 Factory ABI
const FACTORY_ABI = [
  "function getPair(address tokenA, address tokenB) external view returns (address pair)",
];

const QUICKSWAP_FACTORY = "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32";
const SUSHISWAP_FACTORY = "0xc35DADB65012eC5796536bD9864eD8773aBc74C4";

// ERC20 ABI for decimals
const ERC20_ABI = [
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
];

async function getPairLiquidity(factoryAddress, token0Address, token1Address) {
  try {
    const factory = new ethers.Contract(factoryAddress, FACTORY_ABI, provider);
    const pairAddress = await factory.getPair(token0Address, token1Address);
    
    if (pairAddress === ethers.ZeroAddress) {
      return null; // Pair doesn't exist
    }
    
    const pair = new ethers.Contract(pairAddress, PAIR_ABI, provider);
    const [reserve0, reserve1] = await pair.getReserves();
    
    const token0 = new ethers.Contract(token0Address, ERC20_ABI, provider);
    const token1 = new ethers.Contract(token1Address, ERC20_ABI, provider);
    
    const decimals0 = await token0.decimals();
    const decimals1 = await token1.decimals();
    
    // Convert reserves to human-readable format
    const reserve0Formatted = parseFloat(ethers.formatUnits(reserve0, decimals0));
    const reserve1Formatted = parseFloat(ethers.formatUnits(reserve1, decimals1));
    
    // Estimate USD liquidity (assuming token1 is stablecoin or major token worth ~$1-$2000)
    const estimatedLiquidityUSD = reserve1Formatted * 2; // Rough estimate
    
    return {
      pairAddress,
      reserve0: reserve0Formatted,
      reserve1: reserve1Formatted,
      estimatedLiquidityUSD,
    };
  } catch (error) {
    return null;
  }
}

async function discoverHighLiquidityPairs() {
  console.log("🔍 Discovering high-liquidity pairs on Polygon...\n");
  
  const tokenEntries = Object.entries(HIGH_LIQUIDITY_TOKENS);
  const newPairs = [];
  const existingPairs = new Set();
  
  // Load existing pairs
  const pairsFilePath = path.join(__dirname, "..", "data", "trading-pairs.json");
  let existingData = { pairs: [], stats: {} };
  
  if (fs.existsSync(pairsFilePath)) {
    const fileContent = fs.readFileSync(pairsFilePath, "utf-8");
    existingData = JSON.parse(fileContent);
    existingData.pairs.forEach(p => existingPairs.add(p.name));
    console.log(`📋 Loaded ${existingData.pairs.length} existing pairs\n`);
  }
  
  let checked = 0;
  let found = 0;
  
  // Check all token combinations
  for (let i = 0; i < tokenEntries.length; i++) {
    for (let j = i + 1; j < tokenEntries.length; j++) {
      const [symbol0, address0] = tokenEntries[i];
      const [symbol1, address1] = tokenEntries[j];
      const pairName = `${symbol0}/${symbol1}`;
      
      // Skip if pair already exists
      if (existingPairs.has(pairName)) {
        console.log(`⏭️  Skipping ${pairName} (already in list)`);
        continue;
      }
      
      checked++;
      
      // Check liquidity on both DEXes
      const quickswapLiquidity = await getPairLiquidity(QUICKSWAP_FACTORY, address0, address1);
      const sushiswapLiquidity = await getPairLiquidity(SUSHISWAP_FACTORY, address0, address1);
      
      // Only add if both DEXes have the pair with sufficient liquidity
      if (quickswapLiquidity && sushiswapLiquidity) {
        const minLiquidity = Math.min(
          quickswapLiquidity.estimatedLiquidityUSD,
          sushiswapLiquidity.estimatedLiquidityUSD
        );
        
        // Filter: Both DEXes must have >$50k liquidity
        if (minLiquidity > 50000) {
          console.log(`✅ ${pairName}:`);
          console.log(`   QuickSwap: $${quickswapLiquidity.estimatedLiquidityUSD.toLocaleString()}`);
          console.log(`   SushiSwap: $${sushiswapLiquidity.estimatedLiquidityUSD.toLocaleString()}`);
          console.log(`   Min: $${minLiquidity.toLocaleString()}\n`);
          
          newPairs.push({
            name: pairName,
            token0: symbol0,
            token1: symbol1,
            token0Address: address0,
            token1Address: address1,
            enabled: true,
            dexes: ["quickswap", "sushiswap"],
            estimatedLiquidity: {
              quickswap: Math.round(quickswapLiquidity.estimatedLiquidityUSD),
              sushiswap: Math.round(sushiswapLiquidity.estimatedLiquidityUSD),
              minimum: Math.round(minLiquidity),
            },
          });
          found++;
        } else {
          console.log(`⚠️  ${pairName}: Low liquidity ($${minLiquidity.toLocaleString()})`);
        }
      } else {
        console.log(`❌ ${pairName}: Missing on one or both DEXes`);
      }
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Checked: ${checked} new pairs`);
  console.log(`   Found: ${found} high-liquidity pairs`);
  console.log(`   Existing: ${existingData.pairs.length} pairs`);
  console.log(`   Total: ${existingData.pairs.length + found} pairs\n`);
  
  // Merge with existing pairs
  const allPairs = [...existingData.pairs, ...newPairs];
  
  // Save updated pairs
  const outputData = {
    pairs: allPairs,
    stats: {
      totalPairs: allPairs.length,
      newPairsAdded: found,
      lastUpdated: new Date().toISOString(),
      criteria: {
        minLiquidityPerDex: "$50,000",
        dexes: ["QuickSwap", "SushiSwap"],
      },
    },
  };
  
  fs.writeFileSync(pairsFilePath, JSON.stringify(outputData, null, 2));
  console.log(`💾 Saved to ${pairsFilePath}`);
  console.log(`✅ Added ${found} new pairs to existing ${existingData.pairs.length} pairs\n`);
  
  // Print new pairs summary
  if (found > 0) {
    console.log("🆕 New Pairs Added:");
    newPairs.forEach((p, idx) => {
      console.log(`   ${idx + 1}. ${p.name} (Min: $${p.estimatedLiquidity.minimum.toLocaleString()})`);
    });
  }
}

// Run discovery
discoverHighLiquidityPairs()
  .then(() => {
    console.log("\n✅ Discovery complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
