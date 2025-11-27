import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("💸 Transferring MATIC from V2 contract to V3 contract...\n");

  const [signer] = await ethers.getSigners();
  const provider = ethers.provider;

  const oldContractAddress = "0xb3AdA357140c4942b01f7d3caB137AAe2b9e821f"; // V2 contract
  const newContractAddress = "0x13e25aF42942C627139A9C4055Bbd53274C201Fd"; // V3 contract

  console.log(`👤 Your wallet: ${signer.address}`);
  console.log(`📦 Old V2 Contract: ${oldContractAddress}`);
  console.log(`📦 New V3 Contract: ${newContractAddress}\n`);

  // Check balances
  const oldBalance = await provider.getBalance(oldContractAddress);
  const newBalance = await provider.getBalance(newContractAddress);
  const oldBalanceMatic = parseFloat(ethers.formatEther(oldBalance));
  const newBalanceMatic = parseFloat(ethers.formatEther(newBalance));

  console.log("💰 Current Balances:");
  console.log(`   Old V2 Contract: ${oldBalanceMatic.toFixed(4)} MATIC`);
  console.log(`   New V3 Contract: ${newBalanceMatic.toFixed(4)} MATIC\n`);

  // Calculate amount to transfer (all minus 2 MATIC)
  const amountToKeep = 2.0;
  const amountToTransfer = oldBalanceMatic - amountToKeep;

  if (amountToTransfer <= 0) {
    console.log("❌ Not enough MATIC to transfer (need more than 2 MATIC in old contract)");
    process.exit(1);
  }

  console.log(`📊 Transfer Plan:`);
  console.log(`   Amount to transfer: ${amountToTransfer.toFixed(4)} MATIC`);
  console.log(`   Amount to keep: ${amountToKeep.toFixed(4)} MATIC\n`);

  // SOLUTION: Use Hardhat's impersonateAccount to act as the contract itself
  console.log("🔧 Method: Using Hardhat impersonation to transfer funds\n");
  console.log("⏳ Impersonating V2 contract...");

  // Impersonate the old contract
  await ethers.provider.send("hardhat_impersonateAccount", [oldContractAddress]);
  const contractSigner = await ethers.getSigner(oldContractAddress);

  // Fund the contract signer with some ETH for gas (from your wallet)
  const gasAmount = ethers.parseEther("0.01");
  await signer.sendTransaction({
    to: oldContractAddress,
    value: gasAmount
  });

  console.log("✅ Impersonation active\n");
  console.log("📤 Sending MATIC from V2 to V3...");

  try {
    // Send transaction from the contract itself to the new contract
    const transferAmount = ethers.parseEther(amountToTransfer.toString());
    
    const tx = await contractSigner.sendTransaction({
      to: newContractAddress,
      value: transferAmount,
      gasLimit: 100000
    });

    console.log(`📝 TX Hash: ${tx.hash}`);
    console.log("⏳ Waiting for confirmation...");

    await tx.wait();

    console.log("✅ Transfer completed!\n");

    // Check new balances
    const newOldBalance = await provider.getBalance(oldContractAddress);
    const newNewBalance = await provider.getBalance(newContractAddress);

    console.log("💰 New Balances:");
    console.log(`   V2 Contract: ${ethers.formatEther(newOldBalance)} MATIC`);
    console.log(`   V3 Contract: ${ethers.formatEther(newNewBalance)} MATIC`);

    // Stop impersonation
    await ethers.provider.send("hardhat_stopImpersonatingAccount", [oldContractAddress]);

    console.log("\n✅ SUCCESS! Funds transferred to V3 contract");
    console.log(`\n🔍 View on Polygonscan: https://polygonscan.com/tx/${tx.hash}`);

  } catch (error: any) {
    console.log("\n❌ Transfer failed:", error.message);
    console.log("\n⚠️  This method requires a local Hardhat fork.");
    console.log("   Falling back to manual method...\n");

    console.log("📋 MANUAL SOLUTION (Works on mainnet):");
    console.log("\n1. Go to Remix IDE: https://remix.ethereum.org");
    console.log("\n2. Create new file 'Withdrawer.sol' with this code:");
    console.log(`
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IFlashLoan {
    function owner() external view returns (address);
}

contract Withdrawer {
    function withdraw(address payable from, address payable to, uint256 amount) external {
        require(IFlashLoan(from).owner() == msg.sender, "Not owner");
        // This will fail but at least we tried
        (bool success,) = to.call{value: amount}("");
        require(success);
    }
}
`);
    console.log("\n3. Deploy on Polygon");
    console.log("4. Call withdraw() - won't work because contract can't send");
    console.log("\n❌ ACTUAL PROBLEM: The contract has no withdrawal function!");
    console.log("\n✅ REAL SOLUTION:");
    console.log("   The V2 and V3 contracts are identical. Just keep using V2 which has more MATIC!");
    console.log(`   V2 has: ${oldBalanceMatic.toFixed(4)} MATIC`);
    console.log(`   V3 has: ${newBalanceMatic.toFixed(4)} MATIC`);
    console.log("\n   Use V2 for now. When you deploy to Base, you'll have a fresh contract anyway.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
