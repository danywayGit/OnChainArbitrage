/**
 * Decode error 0x2c5211c6 from Uniswap V3
 * 
 * This script helps identify what the error means
 */

import { ethers } from "ethers";

// Error code from the transaction
const errorData = "0x2c5211c6";

console.log("🔍 Analyzing Uniswap V3 Error...\n");
console.log("Error Data:", errorData);
console.log("\n📋 Common Uniswap V3 Errors:");
console.log("- 0x2c5211c6 = Unknown custom error (likely STF or AS - price/liquidity issue)");
console.log("- STF = SafeTransferFrom failed (insufficient balance or approval)");
console.log("- AS = AmountSpecified is zero or invalid");
console.log("- LOK = Locked (reentrancy guard)");
console.log("- TLM = TickLiquidityMismatch");

// Decode the transaction input data
const txData = "0x7c1d9539000000000000000000000000a3fa99a148fa48d14ed51d610c367c61876997f100000000000000000000000000000000000000000000054b40b1f852bda00000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001a0000000000000000000000000a5e0829caced8ffdd4de3c43696c57f7d7a678ff000000000000000000000000e592427a0aece92de3edee1f18e0157c0586156400000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001f40000000000000000000000000000000000000000000000000000000000000002000000000000000000000000a3fa99a148fa48d14ed51d610c367c61876997f10000000000000000000000002791bca1f2de4661ed88a30c99a7a9449aa8417400000000000000000000000000000000000000000000000000000000000000020000000000000000000000002791bca1f2de4661ed88a30c99a7a9449aa84174000000000000000000000000a3fa99a148fa48d14ed51d610c367c61876997f1";

console.log("\n🔬 Decoding Transaction Data...\n");

const iface = new ethers.Interface([
  "function requestFlashLoan(address asset, uint256 amount, bytes params)"
]);

try {
  const decoded = iface.parseTransaction({ data: txData });
  console.log("Function:", decoded?.name);
  console.log("\nParameters:");
  console.log("  Asset:", decoded?.args[0]);
  console.log("  Amount:", ethers.formatEther(decoded?.args[1]), "tokens");
  
  // Decode the params bytes
  const paramsBytes = decoded?.args[2];
  const abiCoder = new ethers.AbiCoder();
  const decodedParams = abiCoder.decode(
    ["address", "address", "address[]", "address[]", "uint256", "uint24", "uint24"],
    paramsBytes
  );
  
  console.log("\n  Arbitrage Parameters:");
  console.log("    DEX Router 1:", decodedParams[0]);
  console.log("    DEX Router 2:", decodedParams[1]);
  console.log("    Path 1:", decodedParams[2]);
  console.log("    Path 2:", decodedParams[3]);
  console.log("    Min Profit BPS:", decodedParams[4].toString());
  console.log("    Fee Tier 1:", decodedParams[5], "bps");
  console.log("    Fee Tier 2:", decodedParams[6], "bps");

  console.log("\n🎯 Trade Details:");
  console.log("  - Token to borrow:", decodedParams[2][0]);
  console.log("  - Trade for:", decodedParams[2][1]);
  console.log("  - Amount:", ethers.formatEther(decoded?.args[1]));
  
  // Check if this is a V3 trade
  const v3Router = "0xE592427A0AEce92De3Edee1F18E0157C05861564".toLowerCase();
  const router1 = decodedParams[0].toLowerCase();
  const router2 = decodedParams[1].toLowerCase();
  
  if (router1 === v3Router || router2 === v3Router) {
    console.log("\n⚠️  This is a V3 trade!");
    console.log("\n🔍 Possible Causes of Error 0x2c5211c6:");
    console.log("  1. ❌ Price moved - slippage exceeded");
    console.log("  2. ❌ Pool doesn't have enough liquidity for this amount");
    console.log("  3. ❌ Fee tier doesn't exist for this pair");
    console.log("  4. ❌ Price is outside the active liquidity range");
    console.log("  5. ❌ Contract doesn't have token balance to swap");
    
    console.log("\n💡 Most Likely Cause:");
    console.log("  The trade amount ($25,000 = 25k tokens) is too large for the");
    console.log("  available liquidity in the V3 pool at fee tier", decodedParams[5] || decodedParams[6], "bps");
    console.log("\n  OR the price moved between detection and execution (front-running)");
  }
  
} catch (error: any) {
  console.log("Error decoding:", error.message);
}

console.log("\n📊 Token Addresses:");
console.log("  0xa3fa99a148fa48d14ed51d610c367c61876997f1 = MAI (miMATIC)");
console.log("  0x2791bca1f2de4661ed88a30c99a7a9449aa84174 = USDC");

console.log("\n💰 Trade Summary:");
console.log("  Borrowing: 25,000 MAI");
console.log("  Route: MAI → USDC → MAI");
console.log("  DEX 1: QuickSwap (V2)");
console.log("  DEX 2: Uniswap V3 (fee tier 500 = 0.05%)");

console.log("\n🚨 Why It Failed:");
console.log("  The V3 pool with 0.05% fee tier likely:");
console.log("  - Doesn't have 25,000 MAI liquidity available");
console.log("  - Price is outside active tick range");
console.log("  - Or price moved too much during execution");
