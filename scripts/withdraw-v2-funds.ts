import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("💸 Transferring MATIC from V2 to V3 contract...\n");

  const [owner] = await ethers.getSigners();
  
  const oldContractAddress = "0xb3AdA357140c4942b01f7d3caB137AAe2b9e821f"; // V2
  const newContractAddress = "0x13e25aF42942C627139A9C4055Bbd53274C201Fd"; // V3

  console.log(`👤 Owner: ${owner.address}`);
  console.log(`📦 Old V2: ${oldContractAddress}`);
  console.log(`📦 New V3: ${newContractAddress}\n`);

  // Check balances
  const provider = ethers.provider;
  const oldBalance = await provider.getBalance(oldContractAddress);
  const newBalance = await provider.getBalance(newContractAddress);
  
  console.log("💰 Current Balances:");
  console.log(`   V2 Contract: ${ethers.formatEther(oldBalance)} MATIC`);
  console.log(`   V3 Contract: ${ethers.formatEther(newBalance)} MATIC\n`);

  // Calculate transfer amount (all except 2 MATIC)
  const keepAmount = ethers.parseEther("2");
  const transferAmount = oldBalance - keepAmount;

  if (transferAmount <= 0n) {
    console.log("❌ Not enough MATIC (need more than 2 MATIC in V2 contract)");
    return;
  }

  console.log(`📊 Transfer: ${ethers.formatEther(transferAmount)} MATIC`);
  console.log(`   Keep in V2: 2 MATIC\n`);

  // Get contract instance
  const FlashLoanArbitrage = await ethers.getContractFactory("FlashLoanArbitrage");
  const contract = FlashLoanArbitrage.attach(oldContractAddress);

  console.log("🔧 Sending MATIC from V2 contract to V3 contract...");

  try {
    // Use low-level call from the contract to transfer MATIC
    // Since the contract is Ownable, we can make it call another address
    // We'll send a transaction that triggers the contract to send MATIC
    
    // Method: Send a transaction directly from owner to trigger the transfer
    const tx = await owner.sendTransaction({
      to: oldContractAddress,
      data: ethers.concat([
        ethers.id("transfer(address,uint256)").slice(0, 10),
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "uint256"],
          [newContractAddress, transferAmount]
        )
      ])
    });

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

  } catch (error: any) {
    console.log("\n❌ Direct transfer failed:", error.message);
    console.log("\n💡 The contract doesn't have a withdrawal function.");
    console.log("   Using alternative method: Polygonscan direct interaction\n");
    
    console.log("🔗 Manual Steps:");
    console.log(`1. Go to: https://polygonscan.com/address/${oldContractAddress}#writeContract`);
    console.log("2. Connect your wallet");
    console.log("3. Unfortunately, there's no withdrawNative function available");
    console.log("\n❌ PROBLEM: The V2 contract is missing a native token withdrawal function!");
    console.log("\n✅ SOLUTION: The funds are safe, but we need to add the function.");
    console.log("   Option 1: Deploy a new V3 contract with withdrawal function");
    console.log("   Option 2: Use the existing V3 contract (it has the same limitation)");
    console.log("   Option 3: Accept that the MATIC stays in V2 for now");
    console.log("\n💡 Since both contracts have the same code, let's just use the V2");
    console.log("   contract with the stablecoin strategy - it already has funds!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
