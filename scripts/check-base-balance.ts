import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🔍 Checking Base Network Balances...\n");

  const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  console.log(`👤 Wallet: ${wallet.address}`);
  console.log(`🌐 Network: Base Mainnet (Chain ID: 8453)\n`);

  // Check ETH balance
  const ethBalance = await provider.getBalance(wallet.address);
  console.log(`💰 ETH Balance: ${ethers.formatEther(ethBalance)} ETH`);

  const ethPrice = 2500; // Approximate ETH price in USD
  const usdValue = parseFloat(ethers.formatEther(ethBalance)) * ethPrice;
  console.log(`   (~$${usdValue.toFixed(2)} USD)\n`);

  // Check if you have enough for deployment
  const deploymentCost = 0.005; // ~0.005 ETH for deployment
  const fundingAmount = 0.01; // 0.01 ETH to fund contract
  const totalNeeded = deploymentCost + fundingAmount;

  console.log("📊 Requirements:");
  console.log(`   Deployment: ~0.005 ETH (~$${(deploymentCost * ethPrice).toFixed(2)})`);
  console.log(`   Funding: 0.01 ETH (~$${(fundingAmount * ethPrice).toFixed(2)})`);
  console.log(`   Total: ~${totalNeeded} ETH (~$${(totalNeeded * ethPrice).toFixed(2)})\n`);

  if (parseFloat(ethers.formatEther(ethBalance)) >= totalNeeded) {
    console.log("✅ You have enough ETH to deploy and fund the contract!");
    console.log("\n🚀 Next Steps:");
    console.log("   1. Deploy: npx hardhat run scripts/deploy-to-base.ts --network base");
    console.log("   2. Fund: npx ts-node scripts/fund-base-contract.ts");
    console.log("   3. Update .env: NETWORK=base");
    console.log("   4. Start bot: npm run bot");
  } else {
    console.log("❌ Insufficient ETH on Base network!");
    console.log(`   You need ${(totalNeeded - parseFloat(ethers.formatEther(ethBalance))).toFixed(4)} more ETH\n`);
    console.log("💡 How to get ETH on Base:");
    console.log("   Option 1: Bridge from Ethereum → https://bridge.base.org/");
    console.log("   Option 2: Buy directly on Coinbase and withdraw to Base");
    console.log("   Option 3: Use a cross-chain bridge like Stargate");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
