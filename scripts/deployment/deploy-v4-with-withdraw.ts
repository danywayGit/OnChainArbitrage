import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🚀 Deploying NEW V4 contract with withdrawal function...\n");

  const [deployer] = await ethers.getSigners();
  console.log("👤 Deploying from:", deployer.address);

  // Get the contract factory
  const FlashLoanArbitrage = await ethers.getContractFactory("FlashLoanArbitrage");

  // Polygon Aave V3 Pool Address Provider
  const AAVE_POOL_ADDRESS_PROVIDER = "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb";

  console.log("📝 Deployment Parameters:");
  console.log(`   Aave Pool Provider: ${AAVE_POOL_ADDRESS_PROVIDER}`);
  console.log();

  console.log("⏳ Deploying contract...");
  const contract = await FlashLoanArbitrage.deploy(
    AAVE_POOL_ADDRESS_PROVIDER
  );

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("✅ NEW V4 Contract deployed!");
  console.log(`📍 Address: ${contractAddress}\n`);

  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Your remaining balance: ${ethers.formatEther(balance)} MATIC\n`);

  console.log("📋 Next Steps:");
  console.log("   1. Run transfer script to move funds from V2 to V4");
  console.log("   2. Update .env: CONTRACT_ADDRESS=" + contractAddress);
  console.log("   3. Start bot: npm run bot\n");

  console.log("🔍 View on Polygonscan:");
  console.log(`   https://polygonscan.com/address/${contractAddress}`);

  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
