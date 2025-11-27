# Examples Directory

This directory contains example configuration files for different networks and setups.

## Network-Specific Configurations

| File | Network | Description |
|------|---------|-------------|
| `.env.polygon.example` | Polygon | Recommended for testing (cheapest gas) |
| `.env.bsc.example` | BSC | Higher volume, higher gas costs |
| `.env.base.example` | Base | L2 with very low gas costs |

## Usage

1. **Copy the example file for your network:**
   ```powershell
   # For Polygon (recommended)
   Copy-Item examples/.env.polygon.example .env
   
   # For BSC
   Copy-Item examples/.env.bsc.example .env
   
   # For Base
   Copy-Item examples/.env.base.example .env
   ```

2. **Edit the `.env` file with your credentials:**
   - Add your Alchemy/Infura API key
   - Add your private key (NEVER commit this!)
   - Add your deployed contract address

3. **Customize trading parameters:**
   - Adjust `MIN_PROFIT_THRESHOLD` based on gas costs
   - Set appropriate `MAX_TRADE_SIZE_USD` for your capital
   - Configure `MAX_DAILY_LOSS` for risk management

## Network Comparison

| Network | Avg Gas Cost | Min Profit | Best For |
|---------|-------------|------------|----------|
| Polygon | ~$0.01 | 0.3% | Testing, small trades |
| BSC | ~$0.10 | 0.5% | Higher volume |
| Base | ~$0.001 | 0.2% | Minimal fees |

## Important Notes

- **NEVER commit** your actual `.env` file with real keys
- Always start with **DRY_RUN=true** for testing
- Monitor gas prices before live trading
- Start with small trade sizes to test

## Quick Start

```powershell
# 1. Copy example config
Copy-Item examples/.env.polygon.example .env

# 2. Edit with your keys
code .env

# 3. Test with dry run
$env:DRY_RUN="true"; npm run bot

# 4. Run live (when ready)
npm run bot
```
