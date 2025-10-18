/**
 * 🍴 Setup Mainnet Fork for Testing
 * 
 * This script helps you test your arbitrage bot with REAL mainnet liquidity
 * without spending real money! Uses Hardhat's mainnet fork feature.
 */

import { ethers } from "ethers";

console.log("╔════════════════════════════════════════════════════════════╗");
console.log("║                                                            ║");
console.log("║     🍴 MAINNET FORK TESTING GUIDE 🍴                      ║");
console.log("║                                                            ║");
console.log("╚════════════════════════════════════════════════════════════╝\n");

console.log("📋 WHAT IS MAINNET FORK?\n");
console.log("   A mainnet fork lets you:");
console.log("   ✓ Test with REAL DEX liquidity from Ethereum mainnet");
console.log("   ✓ Use REAL token prices and reserves");
console.log("   ✓ Execute trades without spending real money");
console.log("   ✓ Find actual arbitrage opportunities\n");

console.log("═══════════════════════════════════════════════════════════\n");
console.log("🚀 STEP-BY-STEP SETUP\n");

console.log("1️⃣  CREATE ALCHEMY ACCOUNT (If you don't have one)");
console.log("    • Go to: https://www.alchemy.com/");
console.log("    • Sign up for free");
console.log("    • Create a new app (Ethereum Mainnet)");
console.log("    • Copy your API key\n");

console.log("2️⃣  UPDATE .env FILE");
console.log("    Add your Alchemy Mainnet RPC URL:");
console.log("    ");
console.log("    ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY");
console.log("    \n");

console.log("3️⃣  UPDATE hardhat.config.ts");
console.log("    Your config should have:\n");
console.log(`    networks: {
      hardhat: {
        forking: {
          url: process.env.ETHEREUM_RPC_URL || "",
          blockNumber: 18500000, // Optional: pin to specific block
        },
      },
    }\n`);

console.log("4️⃣  START MAINNET FORK");
console.log("    Open a NEW terminal and run:");
console.log("    ");
console.log("    npx hardhat node --fork https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY");
console.log("    ");
console.log("    Keep this terminal running!\n");

console.log("5️⃣  DEPLOY YOUR CONTRACT TO FORK");
console.log("    In a SECOND terminal:");
console.log("    ");
console.log("    npx hardhat run scripts/deploy.ts --network localhost");
console.log("    ");
console.log("    This deploys to the mainnet fork (not real mainnet!)\n");

console.log("6️⃣  UPDATE BOT CONFIGURATION");
console.log("    Update src/config.ts with:\n");
console.log(`    network: {
      name: "mainnet-fork",
      rpcUrl: "http://127.0.0.1:8545", // Local fork
      chainId: 1, // Mainnet chain ID
    },
    
    dexes: {
      uniswapV2Router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
      sushiswapRouter: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
    },
    
    tokens: {
      WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    }\n`);

console.log("7️⃣  RUN YOUR BOT");
console.log("    ");
console.log("    npm run bot");
console.log("    ");
console.log("    Your bot will now find REAL arbitrage opportunities!\n");

console.log("═══════════════════════════════════════════════════════════\n");
console.log("💡 TIPS FOR MAINNET FORK TESTING\n");

console.log("✓ **Instant ETH**: You have unlimited ETH on the fork");
console.log("✓ **Real Liquidity**: All mainnet DEXes have their actual reserves");
console.log("✓ **No Gas Costs**: Transactions are free on the fork");
console.log("✓ **Time Travel**: You can mine blocks instantly for testing");
console.log("✓ **Reset Anytime**: Just restart the fork to reset state\n");

console.log("═══════════════════════════════════════════════════════════\n");
console.log("⚠️  IMPORTANT NOTES\n");

console.log("• The fork uses a SNAPSHOT of mainnet at a specific block");
console.log("• Prices are from that block (may be old)");
console.log("• You can impersonate any address on the fork");
console.log("• Flash loans work exactly like on mainnet");
console.log("• This is the BEST way to test before mainnet deployment\n");

console.log("═══════════════════════════════════════════════════════════\n");
console.log("🎯 EXAMPLE WORKFLOW\n");

console.log(`# Terminal 1: Start fork
npx hardhat node --fork \$ETHEREUM_RPC_URL

# Terminal 2: Deploy contract
npx hardhat run scripts/deploy.ts --network localhost

# Terminal 2: Update config with new contract address
# Edit src/config.ts

# Terminal 2: Run bot
npm run bot

# Bot will scan mainnet DEXes and find real opportunities!
`);

console.log("═══════════════════════════════════════════════════════════\n");
console.log("📚 RESOURCES\n");

console.log("• Hardhat Fork Docs:");
console.log("  https://hardhat.org/hardhat-network/docs/guides/forking\n");

console.log("• Mainnet DEX Addresses:");
console.log("  - Uniswap V2: 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
console.log("  - Sushiswap: 0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F");
console.log("  - Uniswap V3: 0xE592427A0AEce92De3Edee1F18E0157C05861564\n");

console.log("═══════════════════════════════════════════════════════════\n");
console.log("✅ READY TO START?\n");

console.log("Run: npx hardhat node --fork YOUR_ALCHEMY_RPC_URL\n");

console.log("Then deploy your contract and start testing with REAL liquidity!");
console.log("No testnet limitations, no fake prices, no empty pools! 🚀\n");
