import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  // Get contract address from .env or use the one you'll deploy
  const contractAddress = process.env.CONTRACT_ADDRESS || "REPLACE_AFTER_DEPLOYMENT";

  console.log("💸 Sending 0.01 ETH to Base contract for gas...");
  console.log(`   From: ${wallet.address}`);
  console.log(`   To: ${contractAddress}`);
  console.log(`   Network: Base Mainnet`);
  console.log();

  // Check wallet balance first
  const walletBalance = await provider.getBalance(wallet.address);
  console.log(`💰 Your wallet balance: ${ethers.formatEther(walletBalance)} ETH`);

  if (walletBalance < ethers.parseEther("0.01")) {
    console.error("❌ Insufficient balance! Need at least 0.01 ETH");
    console.log("   Bridge ETH to Base: https://bridge.base.org/");
    process.exit(1);
  }

  const tx = await wallet.sendTransaction({
    to: contractAddress,
    value: ethers.parseEther("0.01"), // 0.01 ETH (~$20-30) should be enough for hundreds of trades
  });

  console.log(`📝 TX Hash: ${tx.hash}`);
  console.log("⏳ Waiting for confirmation...");

  await tx.wait();

  console.log("✅ Transfer confirmed!");

  // Check contract balance
  const balance = await provider.getBalance(contractAddress);
  console.log(`💰 Contract balance: ${ethers.formatEther(balance)} ETH`);
  console.log();

  console.log("🎯 Next Steps:");
  console.log("   1. Update .env: NETWORK=base");
  console.log("   2. Start bot: npm run bot");
  console.log();

  console.log(`🔍 View on BaseScan: https://basescan.org/tx/${tx.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
