import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying DirectWithdrawer contract...\n");

  const DirectWithdrawer = await ethers.getContractFactory("DirectWithdrawer");
  const withdrawer = await DirectWithdrawer.deploy();
  
  await withdrawer.waitForDeployment();
  const address = await withdrawer.getAddress();

  console.log(`✅ DirectWithdrawer deployed to: ${address}\n`);

  console.log("📋 Next Steps:");
  console.log(`   1. Send MATIC from V2 contract to withdrawer:`);
  console.log(`      Go to: https://polygonscan.com/address/0xb3AdA357140c4942b01f7d3caB137AAe2b9e821f#writeContract`);
  console.log(`      (This won't work - contract has no send function)\n`);
  
  console.log(`   2. OR manually send from your wallet:`);
  console.log(`      Send 37.956 MATIC to: ${address}`);
  console.log(`      Then call withdrawAll(0x13e25aF42942C627139A9C4055Bbd53274C201Fd)`);
  console.log("\n❌ WAIT - This doesn't solve the problem!");
  console.log("   The V2 contract still can't send MATIC out.\n");

  console.log("🎯 REAL SOLUTION:");
  console.log("   The Hardhat fork test WORKED because it used impersonation.");
  console.log("   On mainnet, the contract physically cannot send MATIC without a withdrawal function.");
  console.log("\n💡 OPTIONS:");
  console.log("   A) Just use V2 contract (39.956 MATIC) - it works fine!");
  console.log("   B) Deploy to Base network with fresh contract");
  console.log("   C) Leave both contracts funded for redundancy");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
