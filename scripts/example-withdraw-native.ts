import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Example script showing how to use the withdrawNative() function
 * This can be adapted for different scenarios
 */
async function main() {
  console.log("📝 Example: Using withdrawNative() function\n");

  // Get signer (contract owner)
  const [owner] = await ethers.getSigners();
  console.log(`👤 Owner: ${owner.address}\n`);

  // Contract addresses (update these for your deployment)
  const contractAddress = process.env.CONTRACT_ADDRESS || "0xb3AdA357140c4942b01f7d3caB137AAe2b9e821f";
  const recipientAddress = process.env.RECIPIENT_ADDRESS || "0x13e25aF42942C627139A9C4055Bbd53274C201Fd";

  console.log(`📦 Contract: ${contractAddress}`);
  console.log(`📨 Recipient: ${recipientAddress}\n`);

  // Get contract instance
  const FlashLoanArbitrage = await ethers.getContractFactory("FlashLoanArbitrage");
  const contract = FlashLoanArbitrage.attach(contractAddress);

  // Check current balance
  const balance = await ethers.provider.getBalance(contractAddress);
  console.log(`💰 Current Balance: ${ethers.formatEther(balance)} MATIC\n`);

  // Example 1: Withdraw specific amount
  console.log("Example 1: Withdraw 10 MATIC");
  const amount1 = ethers.parseEther("10");
  console.log(`   Amount: ${ethers.formatEther(amount1)} MATIC`);
  console.log(`   Command: await contract.withdrawNative("${amount1}", "${recipientAddress}")`);
  console.log("");

  // Example 2: Withdraw all but keep 2 MATIC
  console.log("Example 2: Withdraw all except 2 MATIC");
  const keepAmount = ethers.parseEther("2");
  const amount2 = balance - keepAmount;
  console.log(`   Amount: ${ethers.formatEther(amount2)} MATIC`);
  console.log(`   Keep: 2 MATIC`);
  console.log(`   Command: await contract.withdrawNative("${amount2}", "${recipientAddress}")`);
  console.log("");

  // Example 3: Withdraw everything
  console.log("Example 3: Withdraw all MATIC");
  console.log(`   Amount: ${ethers.formatEther(balance)} MATIC`);
  console.log(`   Command: await contract.withdrawNative("${balance}", "${recipientAddress}")`);
  console.log("");

  // Uncomment below to actually execute the withdrawal
  // WARNING: This will transfer actual funds!
  /*
  console.log("⚠️  Executing withdrawal...\n");
  
  try {
    // Choose which example to execute (uncomment one):
    
    // Example 1:
    // const tx = await contract.withdrawNative(amount1, recipientAddress);
    
    // Example 2:
    // const tx = await contract.withdrawNative(amount2, recipientAddress);
    
    // Example 3:
    // const tx = await contract.withdrawNative(balance, recipientAddress);
    
    console.log(`📝 TX Hash: ${tx.hash}`);
    console.log("⏳ Waiting for confirmation...");
    
    await tx.wait();
    
    console.log("✅ Withdrawal completed!\n");
    
    // Check new balance
    const newBalance = await ethers.provider.getBalance(contractAddress);
    console.log(`💰 New Balance: ${ethers.formatEther(newBalance)} MATIC`);
    
    console.log(`\n🔍 View on Polygonscan: https://polygonscan.com/tx/${tx.hash}`);
    
  } catch (error: any) {
    console.error("\n❌ Withdrawal failed:", error.message);
  }
  */

  console.log("\n💡 To execute an actual withdrawal:");
  console.log("   1. Uncomment the execution code above");
  console.log("   2. Choose which example to run");
  console.log("   3. Run: npx hardhat run scripts/example-withdraw-native.ts --network polygon");
  console.log("\n⚠️  Make sure you're the contract owner before executing!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
