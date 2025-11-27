# 📊 Data

Data files for trading pairs, tokens, and results.

## 📁 Directory Structure

| Folder | Description |
|--------|-------------|
| [pairs/](pairs/) | Trading pair configurations |
| [tokens/](tokens/) | Token data and lists |
| [results/](results/) | Analysis results and reports |

## Files

### pairs/
- `trading-pairs.json` - Active trading pairs for the bot
- `verified-pairs.json` - Verified high-liquidity pairs

### results/
- `liquidity-verification-results.json` - Liquidity verification output
- `multichain-report.json` - Multi-chain analysis report

### tokens/
- (Add token lists as needed)

## Usage

The bot automatically reads from `data/pairs/trading-pairs.json` for trading pair configuration.

To update pairs:
```bash
# Run discovery script
node scripts/discovery/discover-high-liquidity-pairs-v2.js

# Pairs are saved to data/pairs/
```

## Data Format

### trading-pairs.json
```json
[
  {
    "name": "WMATIC/USDC",
    "token0": "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    "token1": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    "dex1": "quickswap",
    "dex2": "sushiswap"
  }
]
```
