import hre from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const ethers = hre.ethers;

async function main() {
  console.log("💰 BASE NETWORK COST ESTIMATION\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Connect to Base network
  const baseProvider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
  
  // Get current gas price on Base
  const feeData = await baseProvider.getFeeData();
  const gasPrice = feeData.gasPrice || 0n;
  const gasPriceGwei = parseFloat(ethers.formatUnits(gasPrice, "gwei"));
  
  console.log("⛽ GAS PRICES ON BASE:");
  console.log(`   Current: ${gasPriceGwei.toFixed(4)} Gwei`);
  console.log(`   Priority Fee: ${ethers.formatUnits(feeData.maxPriorityFeePerGas || 0n, "gwei")} Gwei\n`);

  // ETH price (approximate)
  const ethPrice = 2500; // $2,500 per ETH
  console.log(`💵 ETH PRICE: $${ethPrice.toLocaleString()}\n`);

  // ============================================================================
  // 1. CONTRACT DEPLOYMENT COST
  // ============================================================================
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📦 1. CONTRACT DEPLOYMENT");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const deploymentGas = 3000000n; // ~3M gas for complex contract
  const deploymentCostWei = deploymentGas * gasPrice;
  const deploymentCostETH = parseFloat(ethers.formatEther(deploymentCostWei));
  const deploymentCostUSD = deploymentCostETH * ethPrice;

  console.log(`   Gas Required: ${deploymentGas.toLocaleString()} gas`);
  console.log(`   Cost: ${deploymentCostETH.toFixed(6)} ETH (~$${deploymentCostUSD.toFixed(2)})\n`);

  // ============================================================================
  // 2. FUNDING THE CONTRACT
  // ============================================================================
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("💰 2. FUNDING THE CONTRACT");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Different funding scenarios
  const fundingOptions = [
    { amount: 0.01, label: "Minimal" },
    { amount: 0.05, label: "Small" },
    { amount: 0.1, label: "Medium" },
    { amount: 0.5, label: "Large" }
  ];

  fundingOptions.forEach(({ amount, label }) => {
    const usdValue = amount * ethPrice;
    console.log(`   ${label} (${amount} ETH): $${usdValue.toLocaleString()}`);
  });
  console.log();

  // ============================================================================
  // 3. TRADE EXECUTION COSTS
  // ============================================================================
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("⚡ 3. PER-TRADE EXECUTION COSTS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const tradeGas = 500000n; // ~500k gas per trade
  const tradeCostWei = tradeGas * gasPrice;
  const tradeCostETH = parseFloat(ethers.formatEther(tradeCostWei));
  const tradeCostUSD = tradeCostETH * ethPrice;

  console.log(`   Gas per trade: ${tradeGas.toLocaleString()} gas`);
  console.log(`   Cost per trade: ${tradeCostETH.toFixed(6)} ETH (~$${tradeCostUSD.toFixed(2)})`);
  console.log();

  // Number of trades with different funding amounts
  console.log("   📊 Trades Possible with Each Funding:");
  fundingOptions.forEach(({ amount, label }) => {
    const numTrades = Math.floor(amount / tradeCostETH);
    console.log(`      ${label} (${amount} ETH): ~${numTrades} trades`);
  });
  console.log();

  // ============================================================================
  // 4. TOTAL INITIAL INVESTMENT
  // ============================================================================
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("💵 4. TOTAL INITIAL INVESTMENT REQUIRED");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const scenarios = [
    { name: "🔴 ABSOLUTE MINIMUM", funding: 0.01, trades: 10 },
    { name: "🟡 CONSERVATIVE", funding: 0.05, trades: 50 },
    { name: "🟢 RECOMMENDED", funding: 0.1, trades: 100 },
    { name: "🔵 AGGRESSIVE", funding: 0.5, trades: 500 }
  ];

  scenarios.forEach(({ name, funding, trades }) => {
    const totalETH = deploymentCostETH + funding;
    const totalUSD = totalETH * ethPrice;
    const avgTradeCost = (funding / trades) * ethPrice;
    
    console.log(`   ${name}`);
    console.log(`      Deployment: ${deploymentCostETH.toFixed(6)} ETH ($${deploymentCostUSD.toFixed(2)})`);
    console.log(`      Funding: ${funding} ETH ($${(funding * ethPrice).toFixed(2)})`);
    console.log(`      ────────────────────────────────`);
    console.log(`      TOTAL: ${totalETH.toFixed(6)} ETH (~$${totalUSD.toFixed(2)})`);
    console.log(`      Expected trades: ~${trades}`);
    console.log(`      Avg cost/trade: $${avgTradeCost.toFixed(2)}\n`);
  });

  // ============================================================================
  // 5. BASE vs POLYGON COMPARISON
  // ============================================================================
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("⚖️  5. BASE vs POLYGON COMPARISON");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Polygon costs (from your experience)
  const polygonDeploymentUSD = 0.09 * 0.40; // 0.09 MATIC * $0.40
  const polygonTradeUSD = 0.18; // From your config

  console.log("   Deployment Cost:");
  console.log(`      Polygon: $${polygonDeploymentUSD.toFixed(4)}`);
  console.log(`      Base: $${deploymentCostUSD.toFixed(2)}`);
  console.log(`      Difference: ${(deploymentCostUSD / polygonDeploymentUSD).toFixed(0)}x more expensive\n`);

  console.log("   Per-Trade Cost:");
  console.log(`      Polygon: $${polygonTradeUSD.toFixed(2)}`);
  console.log(`      Base: $${tradeCostUSD.toFixed(2)}`);
  console.log(`      Difference: ${(tradeCostUSD / polygonTradeUSD).toFixed(1)}x more expensive\n`);

  // ============================================================================
  // 6. YOUR CURRENT SITUATION
  // ============================================================================
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("👤 6. YOUR CURRENT WALLET");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    const [wallet] = await ethers.getSigners();
    const baseBalance = await baseProvider.getBalance(wallet.address);
    const baseBalanceETH = parseFloat(ethers.formatEther(baseBalance));
    const baseBalanceUSD = baseBalanceETH * ethPrice;

    console.log(`   Wallet: ${wallet.address}`);
    console.log(`   Base Balance: ${baseBalanceETH.toFixed(6)} ETH ($${baseBalanceUSD.toFixed(2)})\n`);

    if (baseBalanceETH === 0) {
      console.log("   ❌ INSUFFICIENT FUNDS ON BASE");
      console.log(`   📥 You need to bridge ETH from another chain to Base\n`);
      
      console.log("   💡 Recommended: Bridge 0.1 ETH (~$${(0.1 * ethPrice).toFixed(2)}) from:");
      console.log("      - Ethereum mainnet (via official Base bridge)");
      console.log("      - Polygon (bridge MATIC → ETH → Base)");
      console.log("      - Or buy directly on Base\n");
    } else if (baseBalanceETH < deploymentCostETH + 0.01) {
      console.log("   ⚠️  LOW BALANCE - Not enough for deployment + trading");
      console.log(`   Need: ${(deploymentCostETH + 0.05).toFixed(6)} ETH`);
      console.log(`   Have: ${baseBalanceETH.toFixed(6)} ETH`);
      console.log(`   Shortage: ${((deploymentCostETH + 0.05) - baseBalanceETH).toFixed(6)} ETH ($${(((deploymentCostETH + 0.05) - baseBalanceETH) * ethPrice).toFixed(2)})\n`);
    } else {
      console.log("   ✅ SUFFICIENT BALANCE for deployment!");
      const remainingAfterDeploy = baseBalanceETH - deploymentCostETH;
      const tradesAffordable = Math.floor(remainingAfterDeploy / tradeCostETH);
      console.log(`   After deployment: ${remainingAfterDeploy.toFixed(6)} ETH remaining`);
      console.log(`   Can execute: ~${tradesAffordable} trades\n`);
    }
  } catch (error) {
    console.log("   ℹ️  Could not check Base balance (not connected to Base network)\n");
  }

  // ============================================================================
  // 7. RECOMMENDATION
  // ============================================================================
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎯 7. RECOMMENDATION");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const recommendedETH = deploymentCostETH + 0.1;
  const recommendedUSD = recommendedETH * ethPrice;

  console.log(`   💰 Total needed: ${recommendedETH.toFixed(4)} ETH (~$${recommendedUSD.toFixed(2)})`);
  console.log(`      - Deployment: ${deploymentCostETH.toFixed(6)} ETH`);
  console.log(`      - Trading fund: 0.1 ETH (~100 trades)\n`);

  console.log("   📊 Expected ROI:");
  console.log("      - If success rate is 10% (10 successful out of 100)");
  console.log("      - Average profit: $5 per successful trade");
  console.log("      - Gross profit: $50");
  console.log("      - Gas cost: $${(tradeCostUSD * 100).toFixed(2)}");
  console.log(`      - Net: Loss of $${(tradeCostUSD * 100 - 50).toFixed(2)}\n`);

  console.log("   ⚠️  REALITY CHECK:");
  console.log("      - Your Polygon bot: 0% success rate (0/894 trades)");
  console.log("      - Base MIGHT be better (less MEV), but no guarantee");
  console.log("      - Gas costs on Base are ~${(tradeCostUSD / polygonTradeUSD).toFixed(1)}x higher than Polygon\n");

  console.log("   💡 ALTERNATIVES:");
  console.log("      1. Keep testing on Polygon (already have 79.6 MATIC)");
  console.log("      2. Wait for better market conditions");
  console.log("      3. Try different trading pairs");
  console.log("      4. Accept arbitrage might not be profitable for retail\n");

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  });
