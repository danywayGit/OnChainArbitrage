import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  const newContractAddress = "0x13e25aF42942C627139A9C4055Bbd53274C201Fd";

  console.log("💸 Sending 35 MATIC to new contract...");
  console.log(`   From: ${wallet.address}`);
  console.log(`   To: ${newContractAddress}`);

  const tx = await wallet.sendTransaction({
    to: newContractAddress,
    value: ethers.parseEther("35"),
  });

  console.log(`📝 TX Hash: ${tx.hash}`);
  console.log("⏳ Waiting for confirmation...");

  await tx.wait();

  console.log("✅ Transfer confirmed!");

  // Check balance
  const balance = await provider.getBalance(newContractAddress);
  console.log(`💰 New contract balance: ${ethers.formatEther(balance)} MATIC`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
