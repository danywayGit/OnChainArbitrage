/**
 * Deployment script for FlashLoanArbitrage contract with V3 support
 * 
 * This deploys the upgraded contract that supports both Uniswap V2 and V3
 */

import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying FlashLoanArbitrage contract with V3 support...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "MATIC\n");

  // Aave V3 PoolAddressesProvider on Polygon
  const AAVE_POOL_ADDRESSES_PROVIDER = "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb";
  
  console.log("📋 Using Aave V3 PoolAddressesProvider:", AAVE_POOL_ADDRESSES_PROVIDER);

  // Deploy contract
  console.log("\n⏳ Deploying contract...");
  const FlashLoanArbitrage = await ethers.getContractFactory("FlashLoanArbitrage");
  const contract = await FlashLoanArbitrage.deploy(AAVE_POOL_ADDRESSES_PROVIDER);
  
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("✅ Contract deployed to:", contractAddress);

  // Configure Uniswap V3 router
  const UNISWAP_V3_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
  
  console.log("\n⚙️  Configuring Uniswap V3 router...");
  const tx = await contract.setUniswapV3Router(UNISWAP_V3_ROUTER, true);
  await tx.wait();
  console.log("✅ Uniswap V3 router configured:", UNISWAP_V3_ROUTER);

  // Display summary
  console.log("\n" + "=".repeat(70));
  console.log("📊 DEPLOYMENT SUMMARY");
  console.log("=".repeat(70));
  console.log("Contract Address:", contractAddress);
  console.log("Deployer:", deployer.address);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Aave Provider:", AAVE_POOL_ADDRESSES_PROVIDER);
  console.log("V3 Router:", UNISWAP_V3_ROUTER);
  console.log("=".repeat(70));

  console.log("\n📝 Next steps:");
  console.log("1. Update .env with new contract address:");
  console.log(`   CONTRACT_ADDRESS=${contractAddress}`);
  console.log("2. Verify contract on PolygonScan (optional)");
  console.log("3. Fund contract with gas money");
  console.log("4. Test with dry run mode");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
