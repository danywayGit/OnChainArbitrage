# 🛠️ Scripts

Utility scripts for deployment, monitoring, maintenance, and testing.

## 📁 Directory Structure

| Folder | Description | Scripts |
|--------|-------------|---------|
| [deployment/](deployment/) | Deploy and fund contracts | 10 scripts |
| [discovery/](discovery/) | Discover trading pairs and pools | 9 scripts |
| [monitoring/](monitoring/) | Monitor prices and analyze data | 5 scripts |
| [maintenance/](maintenance/) | Balance checks, transfers, updates | 14 scripts |
| [testing/](testing/) | Test configurations and connections | 12 scripts |
| [validation/](validation/) | Validate tokens and configurations | 4 scripts |
| [utilities/](utilities/) | Miscellaneous utility scripts | 5 scripts |

---

## 🚀 Deployment Scripts

Location: `scripts/deployment/`

| Script | Purpose |
|--------|---------|
| `deploy.ts` | Original deployment script |
| `deploy-v3-upgrade.ts` | Deploy V3 upgraded contract |
| `deploy-v4-with-withdraw.ts` | Deploy V4 with withdrawal feature |
| `deploy-to-base.ts` | Deploy to Base network |
| `deploy-withdrawer.ts` | Deploy fund withdrawer contract |
| `verify-deployment.ts` | Verify contract on block explorer |
| `fund-new-contract.ts` | Fund newly deployed contract |
| `fund-v4-contract.ts` | Fund V4 contract specifically |
| `fund-base-contract.ts` | Fund contract on Base |
| `setup-mainnet-fork.ts` | Setup Hardhat mainnet fork |

**Usage:**
```bash
npx hardhat run scripts/deployment/deploy-v3-upgrade.ts --network polygon
```

---

## 🔍 Discovery Scripts

Location: `scripts/discovery/`

| Script | Purpose |
|--------|---------|
| `discover-high-liquidity-pairs.js` | Find high liquidity trading pairs |
| `discover-high-liquidity-pairs-v2.js` | Improved pair discovery |
| `find-liquidity-pools.ts` | Find liquidity pools on DEXes |
| `comprehensive-pair-detector.ts` | Comprehensive pair analysis |
| `curated-pair-generator.ts` | Generate curated pair list |
| `generate-pairs.js` | Generate trading pairs |
| `select-dynamic-pairs.js` | Dynamic pair selection |
| `select-pairs-by-volume.js` | Select pairs by trading volume |
| `README-PAIR-DISCOVERY.md` | Documentation for discovery |

**Usage:**
```bash
node scripts/discovery/discover-high-liquidity-pairs-v2.js
```

---

## 📊 Monitoring Scripts

Location: `scripts/monitoring/`

| Script | Purpose |
|--------|---------|
| `monitor-live.js` | Real-time price monitoring dashboard |
| `analyze-data.js` | Analyze collected trading data |
| `multi-chain-analyzer.js` | Analyze across multiple chains |
| `multi-chain-launcher.js` | Launch bot on multiple chains |
| `multi-chain-simple.js` | Simplified multi-chain runner |

**Usage:**
```bash
node scripts/monitoring/monitor-live.js
node scripts/monitoring/analyze-data.js
```

---

## 🔧 Maintenance Scripts

Location: `scripts/maintenance/`

| Script | Purpose |
|--------|---------|
| `check-balance.ts` | Check wallet balance |
| `check-base-balance.ts` | Check Base network balance |
| `check-both-balances.ts` | Check wallet + contract balance |
| `check-contract-balance.ts` | Check contract balance |
| `check-sepolia-balance.ts` | Check Sepolia testnet balance |
| `check-token-balances.ts` | Check all token balances |
| `check-real-liquidity.js` | Verify real pool liquidity |
| `withdraw-profits.ts` | Withdraw profits from contract |
| `withdraw-v2-funds.ts` | Withdraw from V2 contract |
| `transfer-v2-to-v3.ts` | Transfer funds V2→V3 |
| `transfer-v2-to-v3-hardhat.ts` | Transfer via Hardhat |
| `transfer-v2-to-v4.ts` | Transfer funds V2→V4 |
| `auto-update-pairs.js` | Auto-update trading pairs |
| `run-pair-updater.js` | Run pair update process |

**Usage:**
```bash
npx ts-node scripts/maintenance/check-balance.ts
npx ts-node scripts/maintenance/withdraw-profits.ts
```

---

## 🧪 Testing Scripts

Location: `scripts/testing/`

| Script | Purpose |
|--------|---------|
| `test-all-wss-formats.js` | Test WebSocket URL formats |
| `test-base-config.js` | Test Base network config |
| `test-bsc-config.js` | Test BSC config |
| `test-bsc-websocket.js` | Test BSC WebSocket |
| `test-ethers-wss.js` | Test ethers WebSocket |
| `test-multi-chain.js` | Test multi-chain support |
| `test-optimized-polling.js` | Test optimized polling |
| `test-simple-wss.js` | Simple WebSocket test |
| `test-v3-api.js` | Test Uniswap V3 API |
| `test-websocket.js` | General WebSocket test |
| `test-wss-urls.js` | Test WSS URL connections |
| `test-cache.js` | Test caching system |

**Usage:**
```bash
node scripts/testing/test-multi-chain.js
node scripts/testing/test-websocket.js
```

---

## ✅ Validation Scripts

Location: `scripts/validation/`

| Script | Purpose |
|--------|---------|
| `validate-tokens.js` | Validate token addresses |
| `verify-dfyn.js` | Verify Dfyn DEX config |
| `verify-pair-liquidity.js` | Verify pair liquidity |
| `verify-v3-config.ts` | Verify V3 configuration |

**Usage:**
```bash
node scripts/validation/validate-tokens.js
npx ts-node scripts/validation/verify-v3-config.ts
```

---

## 🔨 Utility Scripts

Location: `scripts/utilities/`

| Script | Purpose |
|--------|---------|
| `decode-error.ts` | Decode transaction errors |
| `bridge-to-base-guide.ts` | Interactive Base bridge guide |
| `estimate-base-costs.ts` | Estimate Base network costs |
| `cleanup-docs.ps1` | PowerShell doc cleanup |
| `generate-testnet-wallet.js` | Generate testnet wallet |

**Usage:**
```bash
npx ts-node scripts/utilities/decode-error.ts
node scripts/utilities/generate-testnet-wallet.js
```

---

## 📋 Common Workflows

### Deploy New Contract
```bash
# 1. Deploy
npx hardhat run scripts/deployment/deploy-v3-upgrade.ts --network polygon

# 2. Verify
npx hardhat verify --network polygon <CONTRACT_ADDRESS>

# 3. Fund
npx ts-node scripts/deployment/fund-new-contract.ts
```

### Check Balances
```bash
npx ts-node scripts/maintenance/check-both-balances.ts
```

### Find Trading Pairs
```bash
node scripts/discovery/discover-high-liquidity-pairs-v2.js
```

### Test Configuration
```bash
node scripts/testing/test-multi-chain.js
node scripts/testing/test-websocket.js
```

### Withdraw Profits
```bash
npx ts-node scripts/maintenance/withdraw-profits.ts
```
