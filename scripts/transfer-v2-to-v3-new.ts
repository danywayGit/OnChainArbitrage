import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("💸 Transferring MATIC from V2 contract to V3 contract...\n");

  const [signer] = await ethers.getSigners();
  const provider = ethers.provider;

  const oldContractAddress = "0xb3AdA357140c4942b01f7d3caB137AAe2b9e821f"; // V2 contract
  const newContractAddress = "0x13e25aF42942C627139A9C4055Bbd53274C201Fd"; // V3 contract

  console.log(`👤 Your wallet: ${signer.address}`);
  console.log(`📦 Old V2 Contract: ${oldContractAddress}`);
  console.log(`📦 New V3 Contract: ${newContractAddress}\n`);

  // Check balances
  const oldBalance = await provider.getBalance(oldContractAddress);
  const newBalance = await provider.getBalance(newContractAddress);
  const oldBalanceMatic = parseFloat(ethers.formatEther(oldBalance));
  const newBalanceMatic = parseFloat(ethers.formatEther(newBalance));

  console.log("💰 Current Balances:");
  console.log(`   Old V2 Contract: ${oldBalanceMatic.toFixed(4)} MATIC`);
  console.log(`   New V3 Contract: ${newBalanceMatic.toFixed(4)} MATIC\n`);

  // Calculate amount to transfer (all minus 2 MATIC)
  const amountToKeep = 2.0;
  const amountToTransfer = oldBalanceMatic - amountToKeep;

  if (amountToTransfer <= 0) {
    console.log("❌ Not enough MATIC to transfer (need more than 2 MATIC in old contract)");
    process.exit(1);
  }

  console.log(`📊 Transfer Plan:`);
  console.log(`   Amount to transfer: ${amountToTransfer.toFixed(4)} MATIC`);
  console.log(`   Amount to keep: ${amountToKeep.toFixed(4)} MATIC\n`);

  // Get contract instance
  const FlashLoanArbitrage = await ethers.getContractFactory("FlashLoanArbitrage");
  const v2Contract = FlashLoanArbitrage.attach(oldContractAddress);

  console.log("🔧 Using withdrawNative() function...\n");
  console.log("📤 Sending MATIC from V2 to V3...");

  try {
    // Use the new withdrawNative function
    const transferAmount = ethers.parseEther(amountToTransfer.toString());
    
    const tx = await v2Contract.withdrawNative(transferAmount, newContractAddress);

    console.log(`📝 TX Hash: ${tx.hash}`);
    console.log("⏳ Waiting for confirmation...");

    await tx.wait();

    console.log("✅ Transfer completed!\n");

    // Check new balances
    const newOldBalance = await provider.getBalance(oldContractAddress);
    const newNewBalance = await provider.getBalance(newContractAddress);

    console.log("💰 New Balances:");
    console.log(`   V2 Contract: ${ethers.formatEther(newOldBalance)} MATIC`);
    console.log(`   V3 Contract: ${ethers.formatEther(newNewBalance)} MATIC`);

    console.log("\n✅ SUCCESS! Funds transferred to V3 contract");
    console.log(`\n🔍 View on Polygonscan: https://polygonscan.com/tx/${tx.hash}`);

  } catch (error: any) {
    console.log("\n❌ Transfer failed:", error.message);
    console.log("\n⚠️  Make sure:");
    console.log("   1. The V2 contract has the withdrawNative() function");
    console.log("   2. You are the owner of the V2 contract");
    console.log("   3. The V2 contract has enough MATIC balance");
    console.log("\n💡 If the V2 contract doesn't have withdrawNative(), you need to:");
    console.log("   1. Deploy a new contract with the updated code");
    console.log("   2. Or use the V2 contract as-is (both V2 and V3 are identical)");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
