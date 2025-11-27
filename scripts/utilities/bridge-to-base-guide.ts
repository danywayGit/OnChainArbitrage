import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("💸 Checking options to get funds on Base...\n");

  const wallet = process.env.PRIVATE_KEY!;
  const address = new ethers.Wallet(wallet).address;

  console.log(`👤 Your Address: ${address}\n`);

  // Check Polygon MATIC
  const polygonProvider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
  const polygonBalance = await polygonProvider.getBalance(address);
  const maticAmount = parseFloat(ethers.formatEther(polygonBalance));
  const maticPrice = 0.40; // MATIC price
  const maticUsd = maticAmount * maticPrice;

  console.log("🟣 Polygon Network:");
  console.log(`   MATIC: ${maticAmount.toFixed(4)} (~$${maticUsd.toFixed(2)})`);

  // Check Ethereum ETH (if available)
  try {
    const ethProvider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
    const ethBalance = await ethProvider.getBalance(address);
    const ethAmount = parseFloat(ethers.formatEther(ethBalance));
    const ethPrice = 2500;
    const ethUsd = ethAmount * ethPrice;

    console.log("\n🔵 Ethereum Network:");
    console.log(`   ETH: ${ethAmount.toFixed(6)} (~$${ethUsd.toFixed(2)})`);
  } catch (e) {
    console.log("\n🔵 Ethereum Network: Unable to check");
  }

  console.log("\n" + "=".repeat(60));
  console.log("\n💡 RECOMMENDED APPROACH:");
  console.log("\n📍 Option 1: Use Your Polygon MATIC (Cheapest & Fastest)");
  console.log("   1. Swap MATIC → ETH on Polygon (QuickSwap/SushiSwap)");
  console.log("   2. Bridge ETH from Polygon → Base using:");
  console.log("      • Stargate: https://stargate.finance/");
  console.log("      • LayerZero Bridge");
  console.log("   3. Cost: ~$0.50 in fees");
  console.log("   4. Time: 5-10 minutes");

  console.log("\n📍 Option 2: Official Base Bridge (If you have ETH on Ethereum)");
  console.log("   1. Go to: https://bridge.base.org/");
  console.log("   2. Bridge 0.02 ETH from Ethereum → Base");
  console.log("   3. Cost: ~$5-10 in gas fees");
  console.log("   4. Time: 10-20 minutes");

  console.log("\n📍 Option 3: Multichain DEX Aggregator (Easiest)");
  console.log("   1. Use Jumper.exchange or Bungee.exchange");
  console.log("   2. Swap MATIC (Polygon) → ETH (Base) directly");
  console.log("   3. Cost: ~$1-2 in fees");
  console.log("   4. Time: 5-15 minutes");

  console.log("\n📍 Option 4: CEX Withdrawal (If you have funds on exchange)");
  console.log("   1. Coinbase: Buy ETH → Withdraw to Base network");
  console.log("   2. Binance/OKX: Buy ETH → Withdraw to Base network");
  console.log("   3. Cost: Minimal withdrawal fee");
  console.log("   4. Time: 2-5 minutes");

  console.log("\n" + "=".repeat(60));

  if (maticAmount >= 50) {
    console.log("\n✅ BEST OPTION FOR YOU:");
    console.log("   You have enough MATIC! Use Option 1 or Option 3:");
    console.log("\n   🔗 Quick Links:");
    console.log(`   • Jumper (MATIC→ETH on Base): https://jumper.exchange/?fromChain=137&fromToken=0x0000000000000000000000000000000000001010&toChain=8453&toToken=0x0000000000000000000000000000000000000000`);
    console.log(`   • Or swap on QuickSwap first: https://quickswap.exchange/`);
    console.log(`     Then bridge on Stargate: https://stargate.finance/`);
    
    console.log("\n   📝 Steps:");
    console.log(`   1. Swap ~40 MATIC → ~16 MATIC worth of WETH on QuickSwap`);
    console.log(`   2. Bridge WETH from Polygon → ETH on Base using Stargate`);
    console.log(`   3. You'll receive ~0.006 ETH on Base (enough for deployment + funding)`);
  } else {
    console.log("\n⚠️  Limited funds on Polygon. Consider:");
    console.log("   • Using a CEX to deposit and withdraw to Base");
    console.log("   • Or bridge from Ethereum if you have ETH there");
  }

  console.log("\n🎯 What you need on Base: ~0.015 ETH (~$37)");
  console.log("   • Contract deployment: ~0.005 ETH");
  console.log("   • Contract funding for gas: ~0.01 ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
