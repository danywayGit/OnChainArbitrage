const { ethers } = require("ethers");
require("dotenv").config();

// Router addresses
const QUICKSWAP_ROUTER = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff";
const SUSHISWAP_ROUTER = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";
const DFYN_ROUTER = "0xA102072A4C07F06EC3B4900FDC4C7B80b6c57429";

// Token addresses on Polygon
const TOKENS = {
  WMATIC: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  WETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
  USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
  WBTC: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
  MAI: "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1",
  GHST: "0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7",
};

// Test pairs that we currently have enabled
const TEST_PAIRS = [
  ["WMATIC", "DAI"],
  ["MAI", "USDC"],
  ["WMATIC", "USDT"],
  ["WMATIC", "USDC"],
  ["DAI", "USDC"],
  ["WMATIC", "WETH"],
  ["WETH", "USDT"],
  ["WETH", "USDC"],
  ["GHST", "USDC"],
];

async function checkPrice(routerAddress, tokenA, tokenB, dexName) {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    const routerABI = [
      "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
    ];
    const router = new ethers.Contract(routerAddress, routerABI, provider);

    // Try 1 token in wei
    const amountIn = ethers.parseEther("1");
    const path = [tokenA, tokenB];

    const amounts = await router.getAmountsOut(amountIn, path);
    const price = parseFloat(ethers.formatEther(amounts[1]));

    return price;
  } catch (error) {
    console.log(`  ❌ ${dexName}: ${error.message.substring(0, 80)}`);
    return null;
  }
}

async function verifyPair(symbolA, symbolB) {
  const tokenA = TOKENS[symbolA];
  const tokenB = TOKENS[symbolB];

  if (!tokenA || !tokenB) {
    console.log(`\n❌ ${symbolA}/${symbolB}: Token not found`);
    return { valid: false };
  }

  console.log(`\n🔍 Testing ${symbolA}/${symbolB}...`);

  const [quickPrice, sushiPrice, dfynPrice] = await Promise.all([
    checkPrice(QUICKSWAP_ROUTER, tokenA, tokenB, "QuickSwap"),
    checkPrice(SUSHISWAP_ROUTER, tokenA, tokenB, "SushiSwap"),
    checkPrice(DFYN_ROUTER, tokenA, tokenB, "Dfyn"),
  ]);

  if (!quickPrice || !sushiPrice) {
    console.log(`  ⚠️  No pools on QuickSwap or SushiSwap`);
    return { valid: false };
  }

  if (!dfynPrice) {
    console.log(`  ⚠️  No Dfyn pool - DISABLE THIS PAIR`);
    return { valid: false };
  }

  // Calculate spreads
  const quickSushiSpread = Math.abs(quickPrice - sushiPrice) / Math.min(quickPrice, sushiPrice) * 100;
  const quickDfynSpread = Math.abs(quickPrice - dfynPrice) / Math.min(quickPrice, dfynPrice) * 100;
  const sushiDfynSpread = Math.abs(sushiPrice - dfynPrice) / Math.min(sushiPrice, dfynPrice) * 100;

  console.log(`  QuickSwap: $${quickPrice.toFixed(6)}`);
  console.log(`  SushiSwap: $${sushiPrice.toFixed(6)}`);
  console.log(`  Dfyn:      $${dfynPrice.toFixed(6)}`);
  console.log(`  Quick-Sushi spread: ${quickSushiSpread.toFixed(2)}%`);
  console.log(`  Quick-Dfyn spread:  ${quickDfynSpread.toFixed(2)}%`);
  console.log(`  Sushi-Dfyn spread:  ${sushiDfynSpread.toFixed(2)}%`);

  // Check if Dfyn has realistic prices (< 10% spread from others)
  if (quickDfynSpread > 10 || sushiDfynSpread > 10) {
    console.log(`  ❌ FAKE POOL! Dfyn spread > 10% - DISABLE THIS PAIR`);
    return { valid: false, reason: "Dfyn fake pool" };
  }

  if (quickSushiSpread > 2) {
    console.log(`  ⚠️  Quick-Sushi spread > 2% - Suspicious`);
  }

  console.log(`  ✅ VALID - All DEXes have realistic prices`);
  return { valid: true, quickPrice, sushiPrice, dfynPrice };
}

async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("              DFYN LIQUIDITY VERIFICATION");
  console.log("═══════════════════════════════════════════════════════════\n");
  console.log("Testing which of our 9 enabled pairs have real pools on Dfyn...\n");

  const validPairs = [];
  const invalidPairs = [];

  for (const [symbolA, symbolB] of TEST_PAIRS) {
    const result = await verifyPair(symbolA, symbolB);
    
    if (result.valid) {
      validPairs.push(`${symbolA}/${symbolB}`);
    } else {
      invalidPairs.push(`${symbolA}/${symbolB}`);
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("                      RESULTS");
  console.log("═══════════════════════════════════════════════════════════\n");
  console.log(`✅ VALID PAIRS (real pools on all 3 DEXes): ${validPairs.length}`);
  validPairs.forEach(pair => console.log(`   ${pair}`));
  console.log(`\n❌ INVALID PAIRS (no Dfyn pool or fake pool): ${invalidPairs.length}`);
  invalidPairs.forEach(pair => console.log(`   ${pair}`));
  
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("                   RECOMMENDATION");
  console.log("═══════════════════════════════════════════════════════════\n");
  
  if (invalidPairs.length > 3) {
    console.log("⚠️  Dfyn has too many fake/missing pools!");
    console.log("📌 RECOMMENDATION: Remove Dfyn from config, stick with QuickSwap + SushiSwap\n");
  } else if (invalidPairs.length > 0) {
    console.log("📌 RECOMMENDATION: Disable these pairs in config:\n");
    invalidPairs.forEach(pair => {
      console.log(`   { name: "${pair}", enabled: false } // ❌ No/fake Dfyn pool`);
    });
  } else {
    console.log("✅ All pairs have real liquidity on Dfyn! Safe to use all 3 DEXes.\n");
  }
}

main().catch(console.error);
