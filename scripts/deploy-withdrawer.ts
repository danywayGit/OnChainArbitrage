import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying FundWithdrawer helper contract...\n");

  const [deployer] = await ethers.getSigners();
  console.log(`👤 Deployer: ${deployer.address}\n`);

  const FundWithdrawer = await ethers.getContractFactory("FundWithdrawer");
  const withdrawer = await FundWithdrawer.deploy();
  
  await withdrawer.waitForDeployment();
  const address = await withdrawer.getAddress();

  console.log(`✅ FundWithdrawer deployed to: ${address}\n`);

  console.log("📋 How to use this helper contract:");
  console.log("\nOption 1: Manual Transfer (if V2 contract owner can send)");
  console.log(`   1. Send MATIC from your wallet to: ${address}`);
  console.log(`   2. Call withdrawAll(0x13e25aF42942C627139A9C4055Bbd53274C201Fd)`);
  console.log("      (Sends all MATIC to V3 contract)\n");
  
  console.log("Option 2: Use as intermediary");
  console.log("   This contract can receive MATIC and forward it");
  console.log("   Useful if you need to batch transfer or intermediate steps\n");
  
  console.log("⚠️  IMPORTANT NOTES:");
  console.log("   - This helper contract does NOT solve the V2 withdrawal issue");
  console.log("   - V2 contract itself needs withdrawNative() function");
  console.log("   - Or deploy a new V3 contract with the updated FlashLoanArbitrage code\n");

  console.log("🎯 RECOMMENDED APPROACH:");
  console.log("   Deploy a new V3 contract with the updated code that includes withdrawNative()");
  console.log("   Run: npx hardhat run scripts/deploy.ts --network polygon\n");

  console.log(`🔍 View on Polygonscan: https://polygonscan.com/address/${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
