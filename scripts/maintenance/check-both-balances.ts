import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("💰 Checking Contract Balances...\n");

  const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);

  const v2Address = "0xb3AdA357140c4942b01f7d3caB137AAe2b9e821f";
  const v3Address = "0x13e25aF42942C627139A9C4055Bbd53274C201Fd";

  console.log("📦 V2 Contract:", v2Address);
  console.log("📦 V3 Contract:", v3Address);
  console.log();

  // Check V2 balance
  const v2Balance = await provider.getBalance(v2Address);
  const v2Matic = parseFloat(ethers.formatEther(v2Balance));

  // Check V3 balance
  const v3Balance = await provider.getBalance(v3Address);
  const v3Matic = parseFloat(ethers.formatEther(v3Balance));

  // Total
  const total = v2Matic + v3Matic;
  const maticPrice = 0.40; // $0.40 per MATIC

  console.log("💰 BALANCES:");
  console.log("─".repeat(50));
  console.log(`   V2 Contract: ${v2Matic.toFixed(6)} MATIC (~$${(v2Matic * maticPrice).toFixed(2)})`);
  console.log(`   V3 Contract: ${v3Matic.toFixed(6)} MATIC (~$${(v3Matic * maticPrice).toFixed(2)})`);
  console.log("─".repeat(50));
  console.log(`   TOTAL:       ${total.toFixed(6)} MATIC (~$${(total * maticPrice).toFixed(2)})`);
  console.log();

  // Check your wallet balance too
  const walletAddress = new ethers.Wallet(process.env.PRIVATE_KEY!).address;
  const walletBalance = await provider.getBalance(walletAddress);
  const walletMatic = parseFloat(ethers.formatEther(walletBalance));

  console.log("👛 YOUR WALLET:", walletAddress);
  console.log(`   Balance: ${walletMatic.toFixed(6)} MATIC (~$${(walletMatic * maticPrice).toFixed(2)})`);
  console.log();

  // Recommendation
  if (v2Matic > v3Matic) {
    console.log("💡 RECOMMENDATION: Use V2 contract (has more MATIC)");
    console.log(`   Current .env setting: Check CONTRACT_ADDRESS`);
  } else if (v3Matic > v2Matic) {
    console.log("💡 RECOMMENDATION: Use V3 contract (has more MATIC)");
    console.log(`   Update .env: CONTRACT_ADDRESS=${v3Address}`);
  } else {
    console.log("💡 Both contracts have equal balance - use either one");
  }

  console.log();
  console.log("🔍 View on Polygonscan:");
  console.log(`   V2: https://polygonscan.com/address/${v2Address}`);
  console.log(`   V3: https://polygonscan.com/address/${v3Address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
