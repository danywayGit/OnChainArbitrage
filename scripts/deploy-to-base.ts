import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🚀 Deploying Flash Loan Arbitrage Contract to BASE...\n");

  // Get the contract factory
  const FlashLoanArbitrage = await ethers.getContractFactory("FlashLoanArbitrage");

  // Base network addresses
  const AAVE_POOL_ADDRESS_PROVIDER = "0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D"; // Aave V3 on Base
  const MIN_PROFIT_BPS = 3; // 0.03% minimum profit (stablecoin strategy)

  console.log("📝 Deployment Parameters:");
  console.log(`   Aave Pool Provider: ${AAVE_POOL_ADDRESS_PROVIDER}`);
  console.log(`   Min Profit: ${MIN_PROFIT_BPS} bps (${MIN_PROFIT_BPS / 100}%)`);
  console.log(`   Network: Base Mainnet (Chain ID: 8453)`);
  console.log();

  // Deploy the contract
  console.log("⏳ Deploying contract...");
  const contract = await FlashLoanArbitrage.deploy(
    AAVE_POOL_ADDRESS_PROVIDER,
    MIN_PROFIT_BPS
  );

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("✅ Contract deployed successfully!");
  console.log(`📍 Contract Address: ${contractAddress}`);
  console.log();

  // Get deployer info
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("👤 Deployer Info:");
  console.log(`   Address: ${deployer.address}`);
  console.log(`   Remaining Balance: ${ethers.formatEther(balance)} ETH`);
  console.log();

  console.log("📋 Next Steps:");
  console.log(`   1. Update .env: CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`   2. Fund contract with ETH for gas: npx hardhat run scripts/fund-base-contract.ts --network base`);
  console.log(`   3. Update NETWORK in .env: NETWORK=base`);
  console.log(`   4. Start bot: npm run bot`);
  console.log();

  console.log("🔍 Verify on BaseScan:");
  console.log(`   https://basescan.org/address/${contractAddress}`);
  console.log();

  console.log("🎯 To verify contract source code:");
  console.log(`   npx hardhat verify --network base ${contractAddress} "${AAVE_POOL_ADDRESS_PROVIDER}" ${MIN_PROFIT_BPS}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
