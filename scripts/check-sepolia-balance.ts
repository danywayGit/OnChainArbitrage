import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(signer.address);
  
  console.log("👤 Wallet Address:", signer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH");
  
  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("📡 Network:", network.name);
  console.log("🔗 Chain ID:", network.chainId.toString());
  
  if (balance === 0n) {
    console.log("\n❌ No ETH on this network!");
    console.log("📍 Get Sepolia ETH from: https://cloud.google.com/application/web3/faucet/ethereum/sepolia");
  } else {
    console.log("\n✅ Ready to deploy!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
