import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  const v4ContractAddress = "0xe7c7a653a4d3BA2ebc9286Ddd0f37d8989983486";

  // Get wallet balance
  const balance = await provider.getBalance(wallet.address);
  const balanceMatic = parseFloat(ethers.formatEther(balance));
  
  // Keep 0.1 MATIC for gas
  const keepForGas = 0.1;
  const amountToSend = balanceMatic - keepForGas;

  if (amountToSend <= 0) {
    console.log("❌ Not enough MATIC (need more than 0.1 for gas)");
    process.exit(1);
  }

  console.log("💸 Funding V4 contract with remaining MATIC...\n");
  console.log(`   From: ${wallet.address}`);
  console.log(`   To: ${v4ContractAddress}`);
  console.log(`   Your balance: ${balanceMatic.toFixed(6)} MATIC`);
  console.log(`   Sending: ${amountToSend.toFixed(6)} MATIC`);
  console.log(`   Keeping for gas: ${keepForGas} MATIC\n`);

  const tx = await wallet.sendTransaction({
    to: v4ContractAddress,
    value: ethers.parseEther(amountToSend.toString()),
  });

  console.log(`📝 TX Hash: ${tx.hash}`);
  console.log("⏳ Waiting for confirmation...");

  await tx.wait();

  console.log("✅ Transfer confirmed!");

  // Check V4 balance
  const v4Balance = await provider.getBalance(v4ContractAddress);
  console.log(`💰 V4 contract balance: ${ethers.formatEther(v4Balance)} MATIC\n`);

  console.log("📊 SUMMARY:");
  console.log("   V2: 39.956 MATIC (locked, no withdrawal)");
  console.log("   V3: 35.000 MATIC (locked, no withdrawal)");
  console.log(`   V4: ${ethers.formatEther(v4Balance)} MATIC (✅ can withdraw!)`);
  console.log(`   TOTAL: ${(39.956 + 35 + parseFloat(ethers.formatEther(v4Balance))).toFixed(3)} MATIC\n`);

  console.log("🎯 Next Steps:");
  console.log(`   1. Update .env: CONTRACT_ADDRESS=${v4ContractAddress}`);
  console.log("   2. Start bot: npm run bot");
  console.log("   3. V4 has withdrawNative() so you can withdraw MATIC anytime!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
