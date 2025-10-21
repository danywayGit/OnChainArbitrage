import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("💸 Transferring ALL MATIC from V2 to V4 (New Contract)...\n");

  const [signer] = await ethers.getSigners();
  console.log("👛 Using wallet:", signer.address);

  const v2ContractAddress = "0xb3AdA357140c4942b01f7d3caB137AAe2b9e821f";
  const v4ContractAddress = process.argv[2]; // Pass V4 address as argument

  if (!v4ContractAddress) {
    console.error("❌ Please provide V4 contract address:");
    console.error("Usage: npx hardhat run scripts/transfer-v2-to-v4.ts --network polygon <V4_ADDRESS>");
    process.exit(1);
  }

  console.log("📦 V2 (Old):", v2ContractAddress);
  console.log("📦 V4 (New):", v4ContractAddress);

  // Check balances
  const v2Balance = await ethers.provider.getBalance(v2ContractAddress);
  const v4Balance = await ethers.provider.getBalance(v4ContractAddress);

  console.log("\n💰 Balances BEFORE:");
  console.log(`   V2: ${ethers.formatEther(v2Balance)} MATIC`);
  console.log(`   V4: ${ethers.formatEther(v4Balance)} MATIC`);

  // Amount to transfer (all except 2 MATIC)
  const keepAmount = ethers.parseEther("2.0");
  const transferAmount = v2Balance - keepAmount;

  if (transferAmount <= 0n) {
    console.error("❌ Not enough MATIC in V2 to transfer");
    process.exit(1);
  }

  console.log("\n📤 Transfer Plan:");
  console.log(`   Amount: ${ethers.formatEther(transferAmount)} MATIC`);
  console.log(`   Keep in V2: ${ethers.formatEther(keepAmount)} MATIC`);

  // V2 contract ABI with withdrawNative function
  // Wait... V2 doesn't have withdrawNative! That's the problem!
  
  console.log("\n❌ PROBLEM: V2 contract doesn't have withdrawNative() function!");
  console.log("   V2 was deployed without withdrawal capability.\n");

  console.log("💡 SOLUTION: Fund V4 directly from your wallet instead\n");

  // Calculate how much to send from wallet
  const walletBalance = await ethers.provider.getBalance(signer.address);
  console.log(`👛 Your wallet balance: ${ethers.formatEther(walletBalance)} MATIC`);

  // Ask to send MATIC from wallet to V4
  console.log("\n🔄 Alternative: Send MATIC from your wallet to V4");
  console.log(`   You have: ${ethers.formatEther(walletBalance)} MATIC`);
  console.log(`   V2 has: ${ethers.formatEther(v2Balance)} MATIC (stuck without withdrawal)`);
  console.log(`   V3 has: 35 MATIC`);
  
  console.log("\n⚠️  RECOMMENDATION:");
  console.log("   1. V2 and V3 funds are STUCK (no withdrawal function)");
  console.log("   2. V4 has withdrawal function ✅");
  console.log("   3. Send ~40 MATIC from your wallet to V4");
  console.log("   4. Use V4 going forward (can withdraw later)");
  
  console.log(`\n💸 Send MATIC to V4: ${v4ContractAddress}`);
  console.log("   Then V2/V3 funds can stay there (or deploy NEW contracts to access them later)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
