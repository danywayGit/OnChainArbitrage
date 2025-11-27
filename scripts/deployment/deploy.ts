import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying FlashLoanArbitrage contract...");

  // Get the network
  const network = await ethers.provider.getNetwork();
  console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);

  // Aave V3 Pool Address Provider addresses for different networks
  const poolAddressProviders: { [key: string]: string } = {
    // Mainnets
    "42161": "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb", // Arbitrum
    "137": "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",   // Polygon
    "1": "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e",     // Ethereum
    "8453": "0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D",   // Base
    "10": "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",    // Optimism
    // Testnets
    "11155111": "0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A", // Ethereum Sepolia
    "80002": "0x0496275d34753A48320CA58103d5220d394FF77F",  // Polygon Amoy
  };

  const chainId = network.chainId.toString();
  const poolAddressProvider = poolAddressProviders[chainId];

  if (!poolAddressProvider) {
    throw new Error(
      `No Aave V3 Pool Address Provider found for chain ID ${chainId}`
    );
  }

  console.log(`📍 Using Aave V3 Pool Address Provider: ${poolAddressProvider}`);

  // Deploy the contract
  const FlashLoanArbitrage = await ethers.getContractFactory(
    "FlashLoanArbitrage"
  );
  const flashLoanArbitrage = await FlashLoanArbitrage.deploy(
    poolAddressProvider
  );

  await flashLoanArbitrage.waitForDeployment();

  const address = await flashLoanArbitrage.getAddress();
  console.log(`✅ FlashLoanArbitrage deployed to: ${address}`);

  // Get deployer info
  const [deployer] = await ethers.getSigners();
  console.log(`👤 Deployed by: ${deployer.address}`);
  console.log(
    `💰 Deployer balance: ${ethers.formatEther(
      await ethers.provider.getBalance(deployer.address)
    )} ETH`
  );

  // Save deployment info
  console.log("\n📝 Deployment Summary:");
  console.log("========================");
  console.log(`Network: ${network.name}`);
  console.log(`Chain ID: ${network.chainId}`);
  console.log(`Contract Address: ${address}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Aave Pool Provider: ${poolAddressProvider}`);
  console.log("========================\n");

  // Wait for block confirmations on mainnet
  if (chainId !== "31337") {
    // Not hardhat network
    console.log("⏳ Waiting for block confirmations...");
    await flashLoanArbitrage.deploymentTransaction()?.wait(5);
    console.log("✅ Transaction confirmed!");

    // Verification instructions
    console.log("\n🔍 To verify the contract on block explorer, run:");
    console.log(
      `npx hardhat verify --network ${network.name} ${address} ${poolAddressProvider}`
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
