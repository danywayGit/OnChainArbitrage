import hre from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const ethers = hre.ethers;

async function main() {
  console.log("💰 Checking token balances in contracts...\n");

  const contracts = {
    "V2": "0xb3AdA357140c4942b01f7d3caB137AAe2b9e821f",
    "V3": "0x13e25aF42942C627139A9C4055Bbd53274C201Fd",
    "V4": "0xe7c7a653a4d3BA2ebc9286Ddd0f37d8989983486"
  };

  // Common stablecoin addresses on Polygon
  const tokens = {
    USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    MAI: "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1"
  };

  for (const [contractName, contractAddress] of Object.entries(contracts)) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📦 ${contractName} Contract: ${contractAddress}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    let hasTokens = false;

    for (const [symbol, tokenAddress] of Object.entries(tokens)) {
      try {
        const token = await ethers.getContractAt("IERC20", tokenAddress);
        const balance = await token.balanceOf(contractAddress);
        const decimals = await token.decimals();
        const formatted = ethers.formatUnits(balance, decimals);
        
        if (parseFloat(formatted) > 0) {
          console.log(`✅ ${symbol}: ${formatted}`);
          hasTokens = true;
        }
      } catch (error: any) {
        console.log(`❌ ${symbol}: Error checking balance`);
      }
    }

    if (!hasTokens) {
      console.log("❌ No token balances found");
    }

    // Also check native MATIC balance
    const maticBalance = await ethers.provider.getBalance(contractAddress);
    const maticFormatted = ethers.formatEther(maticBalance);
    console.log(`\n💎 Native MATIC: ${maticFormatted}`);
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Balance check complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("💡 To withdraw ERC20 profits, use:");
  console.log("   npx ts-node scripts/withdraw-profits.ts");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  });
