# Uniswap V3 Smart Contract Upgrade

## Overview

This upgrade adds Uniswap V3 support to the FlashLoanArbitrage contract, enabling execution of arbitrage trades on both V2 and V3 DEXes with proper fee tier handling.

## Changes Made

### 1. Smart Contract Updates

**Added Files:**
- `contracts/interfaces/IUniswapV3Router.sol` - Uniswap V3 router interface

**Modified Files:**
- `contracts/FlashLoanArbitrage.sol`:
  - Added V3 router interface import
  - Added `isUniswapV3Router` mapping to track V3 routers
  - Updated parameter encoding to include fee tiers (`uint24 feeTier1, uint24 feeTier2`)
  - Split `_executeArbitrageLogic()` into protocol-specific swap functions
  - Added `_executeV2Swap()` for V2 protocols (QuickSwap, SushiSwap)
  - Added `_executeV3Swap()` for V3 protocols (Uniswap V3)
  - Added `setUniswapV3Router()` admin function

### 2. TypeScript Code Updates

**Modified Files:**
- `src/tradeExecutor.ts`:
  - Updated `encodeArbitrageParams()` to include fee tiers
  - Added fee tier logging for debugging

## Deployment Steps

### Prerequisites

1. **Ensure you have:**
   - Sufficient MATIC for gas (~0.1 MATIC should be enough)
   - Private key in `.env` with DEPLOYER_PRIVATE_KEY
   - RPC endpoint configured

2. **Compile contracts:**
   ```bash
   npm run compile
   ```

### Step 1: Deploy New Contract

```bash
npx hardhat run scripts/deploy-v3-upgrade.ts --network polygon
```

**Expected Output:**
```
🚀 Deploying FlashLoanArbitrage contract with V3 support...
✅ Contract deployed to: 0x...
✅ Uniswap V3 router configured: 0xE592427A0AEce92De3Edee1F18E0157C05861564
```

### Step 2: Update Environment Variables

Update `.env` with the new contract address:
```env
CONTRACT_ADDRESS=0x... # New address from deployment
```

### Step 3: Configure V3 Router (Already done in deployment script)

The deployment script automatically configures the Uniswap V3 router:
- Address: `0xE592427A0AEce92De3Edee1F18E0157C05861564`
- Marked as V3: `true`

### Step 4: Test in Dry Run Mode

```bash
DRY_RUN=true npm run bot
```

Look for:
- ✅ V3 opportunities detected with correct fee tiers
- ✅ Parameter encoding includes feeTier1 and feeTier2
- ✅ No gas estimation errors for V3 trades

### Step 5: Execute Live Trades

```bash
npm run bot
```

## Technical Details

### Parameter Encoding

**Old (V2 only):**
```solidity
(address, address, address[], address[], uint256)
// dexRouter1, dexRouter2, path1, path2, minProfitBps
```

**New (V2 + V3):**
```solidity
(address, address, address[], address[], uint256, uint24, uint24)
// dexRouter1, dexRouter2, path1, path2, minProfitBps, feeTier1, feeTier2
```

### Fee Tier Values

- **V2 DEXes:** `feeTier = 0` (ignored, uses V2 swap function)
- **V3 DEXes:** 
  - `500` = 0.05% fee
  - `3000` = 0.3% fee
  - `10000` = 1% fee

### Router Detection

The contract uses `isUniswapV3Router` mapping:
- QuickSwap: V2 (false)
- SushiSwap: V2 (false)
- Uniswap V3: V3 (true)

## Gas Costs

**Deployment:**
- Contract deployment: ~3-5M gas (~0.01-0.02 MATIC)
- V3 router configuration: ~50K gas (~0.0001 MATIC)

**Execution:**
- V2→V2 trade: ~400K gas
- V2→V3 trade: ~450K gas
- V3→V3 trade: ~500K gas

## Verification (Optional)

Verify on PolygonScan:
```bash
npx hardhat verify --network polygon <CONTRACT_ADDRESS> "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb"
```

## Rollback Plan

If issues occur:
1. Update `.env` with old contract address
2. Restart bot - will use old V2-only contract
3. No loss of funds (flash loans are atomic)

## Benefits

✅ **Lower Fees:** V3 0.05% tier = 5 bps vs V2 30 bps (83% reduction!)  
✅ **Better Liquidity:** V3 concentrated liquidity = higher capital efficiency  
✅ **More Opportunities:** Access to V3-exclusive pairs  
✅ **Flexible Routing:** Can mix V2 and V3 in same trade  

## Monitoring

After deployment, monitor for:
- V3 trades executing successfully
- Fee calculations accurate (35-40 bps with V3 vs 60 bps V2 only)
- No smart contract reverts
- Profit margins improving

## Support

If you encounter issues:
1. Check deployment logs for errors
2. Verify contract address in `.env`
3. Test with DRY_RUN=true first
4. Check gas balances

## Files Modified

```
contracts/
├── FlashLoanArbitrage.sol (MODIFIED - V3 support)
└── interfaces/
    ├── IUniswapV2Router.sol (existing)
    └── IUniswapV3Router.sol (NEW)

src/
└── tradeExecutor.ts (MODIFIED - fee tier encoding)

scripts/
└── deploy-v3-upgrade.ts (NEW)
```
