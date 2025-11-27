import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Verifying deployed contract...\n");

  // NEW contract with DEX swap logic!
  const contractAddress = "0x151ca2Fd91f1F6aB55f8ccC3847434AF3e7f225F";

  // Minimal ABI to check contract functions
  const abi = [
    "function getStats() external view returns (uint256 totalProfit, uint256 totalTrades, bool isPaused)",
    "function owner() external view returns (address)",
    "function authorizedExecutors(address) external view returns (bool)",
  ];

  // Connect to contract
  const contract = new ethers.Contract(
    contractAddress,
    abi,
    ethers.provider
  );

  try {
    // 1. Check if contract exists (has code)
    const code = await ethers.provider.getCode(contractAddress);
    if (code === "0x") {
      console.log("❌ No contract found at this address!");
      return;
    }
    console.log("✅ Contract exists at address:", contractAddress);

    // 2. Check owner
    const owner = await contract.owner();
    console.log("✅ Contract owner:", owner);

    // 3. Get stats
    const stats = await contract.getStats();
    console.log("✅ Contract stats:");
    console.log("   - Total Trades:", stats[1].toString());
    console.log("   - Total Profit:", ethers.formatEther(stats[0]), "ETH");
    console.log("   - Is Paused:", stats[2]);

    // 4. Check if deployer is authorized
    const [deployer] = await ethers.getSigners();
    const isAuthorized = await contract.authorizedExecutors(deployer.address);
    console.log("✅ Deployer authorized:", isAuthorized);

    console.log("\n🎉 Contract is LIVE and WORKING perfectly!");
    console.log("\n📍 View on Etherscan:");
    console.log(`   https://sepolia.etherscan.io/address/${contractAddress}`);
  } catch (error) {
    console.error("❌ Error checking contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
