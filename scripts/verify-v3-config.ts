/**
 * Verify V3 configuration on deployed contract
 */

import { ethers } from "hardhat";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS || "";
  const uniswapV3Router = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

  console.log("🔍 Verifying V3 configuration...\n");
  console.log("Contract:", contractAddress);
  console.log("V3 Router:", uniswapV3Router);

  const FlashLoanArbitrage = await ethers.getContractFactory("FlashLoanArbitrage");
  const contract = FlashLoanArbitrage.attach(contractAddress);

  // Check if V3 router is configured
  const isV3 = await contract.isUniswapV3Router(uniswapV3Router);
  
  console.log("\n✅ V3 Router configured:", isV3);

  if (!isV3) {
    console.log("\n⚠️  V3 Router NOT configured! Configuring now...");
    const tx = await contract.setUniswapV3Router(uniswapV3Router, true);
    console.log("📤 Transaction sent:", tx.hash);
    await tx.wait();
    console.log("✅ V3 Router configured successfully!");
    
    // Verify again
    const isV3After = await contract.isUniswapV3Router(uniswapV3Router);
    console.log("✅ Verification:", isV3After);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
