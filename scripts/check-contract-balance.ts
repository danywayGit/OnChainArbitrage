/**
 * Check contract MATIC balance
 */

import { ethers } from "hardhat";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS || "";

  console.log("💰 Checking contract balance...\n");
  console.log("Contract:", contractAddress);

  const balance = await ethers.provider.getBalance(contractAddress);
  
  console.log("\nBalance:", ethers.formatEther(balance), "MATIC");
  console.log("Balance (Wei):", balance.toString());

  if (balance === 0n) {
    console.log("\n⚠️  WARNING: Contract has ZERO balance!");
    console.log("   The contract needs MATIC to pay for gas when executing swaps.");
    console.log("\n💡 Solution: Send some MATIC to the contract address");
    console.log(`   Contract: ${contractAddress}`);
    console.log("   Recommended: 0.5 - 1 MATIC");
  } else if (balance < ethers.parseEther("0.1")) {
    console.log("\n⚠️  WARNING: Contract balance is low!");
    console.log("   Consider adding more MATIC for gas fees.");
  } else {
    console.log("\n✅ Contract has sufficient balance for gas fees");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
