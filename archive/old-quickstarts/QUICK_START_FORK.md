# 🚀 Quick Start: Mainnet Fork Testing

## TL;DR

```bash
# Terminal 1: Start fork
npx hardhat node --fork https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Terminal 2: Deploy contract
npx hardhat run scripts/deploy.ts --network localhost

# Terminal 2: Update config with new address, then run bot
npm run bot
```

## 📝 Quick Checklist

- [ ] Update `hardhat.config.ts` with forking config
- [ ] Set `ETHEREUM_RPC_URL` in `.env` (Alchemy mainnet)
- [ ] Start fork in Terminal 1 (keep running)
- [ ] Deploy contract to fork in Terminal 2
- [ ] Update `src/config.ts` with:
  - Network: `http://127.0.0.1:8545`
  - Chain ID: `1`
  - DEX Routers: Mainnet addresses
  - Tokens: Mainnet addresses
  - Contract: Your fork deployment address
- [ ] Run bot: `npm run bot`
- [ ] Watch REAL opportunities! 🎉

## 📋 Mainnet Addresses to Use

```typescript
// Mainnet DEX Routers
uniswapV2Router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
sushiswapRouter: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F"

// Mainnet Tokens
WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F"

// Mainnet Aave V3
aavePoolProvider: "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e"
```

## ⚡ Benefits

✅ **Real Liquidity** - Billions in TVL from mainnet
✅ **Free Testing** - No gas costs
✅ **Zero Risk** - Completely simulated
✅ **Real Opportunities** - Actual market conditions
✅ **Full Flash Loans** - Aave works identically
✅ **Instant Testing** - No waiting for testnet faucets

## 🎯 What to Expect

**On Sepolia (Testnet):**
- 72 fake opportunities
- No real liquidity
- Errors when executing

**On Mainnet Fork:**
- 1-5 real opportunities per day
- Real mainnet liquidity
- Successful executions
- Accurate profit calculations

## 📚 Full Docs

See `TESTING_ROADMAP.md` for complete guide!
