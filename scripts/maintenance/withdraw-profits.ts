import hre from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const ethers = hre.ethers;

async function main() {
  console.log("💸 Withdrawing ERC20 profits from contract...\n");

  const [wallet] = await ethers.getSigners();
  
  // Get contract address from .env
  const contractAddress = process.env.CONTRACT_ADDRESS!;
  
  if (!contractAddress) {
    console.log("❌ CONTRACT_ADDRESS not set in .env");
    process.exit(1);
  }

  console.log(`📍 Contract: ${contractAddress}`);
  console.log(`👤 Your wallet: ${wallet.address}\n`);

  // Tokens to check and potentially withdraw
  const tokens = {
    USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    MAI: "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1"
  };

  // Get contract instance
  const contract = await ethers.getContractAt("FlashLoanArbitrage", contractAddress);

  let totalWithdrawals = 0;

  for (const [symbol, tokenAddress] of Object.entries(tokens)) {
    try {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`Checking ${symbol}...`);
      
      const token = await ethers.getContractAt("IERC20", tokenAddress);
      const balance = await token.balanceOf(contractAddress);
      const decimals = await token.decimals();
      const balanceFormatted = ethers.formatUnits(balance, decimals);
      
      console.log(`💰 Contract balance: ${balanceFormatted} ${symbol}`);
      
      if (parseFloat(balanceFormatted) === 0) {
        console.log(`⏭️  Skipping (no balance)`);
        continue;
      }

      // Ask for confirmation
      console.log(`\n⏳ Withdrawing ${balanceFormatted} ${symbol}...`);
      
      const tx = await contract.emergencyWithdraw(
        tokenAddress,
        balance,
        wallet.address
      );
      
      console.log(`📝 TX Hash: ${tx.hash}`);
      const receipt = await tx.wait();
      
      console.log(`✅ Withdrawal successful! (Gas used: ${receipt?.gasUsed.toString()})`);
      
      // Check new wallet balance
      const walletBalance = await token.balanceOf(wallet.address);
      const walletBalanceFormatted = ethers.formatUnits(walletBalance, decimals);
      console.log(`💰 Your wallet now has: ${walletBalanceFormatted} ${symbol}`);
      
      totalWithdrawals++;
      
    } catch (error: any) {
      console.log(`❌ Error withdrawing ${symbol}: ${error.message}`);
    }
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  if (totalWithdrawals > 0) {
    console.log(`✅ Successfully withdrew ${totalWithdrawals} token(s)!`);
  } else {
    console.log("⚠️  No tokens withdrawn (no balances found)");
  }
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  });
