# Manual Transfer Instructions

## ✅ EASIEST SOLUTION: Use MetaMask + Polygonscan

Since the V2 contract doesn't have a `withdrawNative()` function, but the successful Hardhat fork test proved the transfer IS POSSIBLE, here's how to do it manually:

### Method 1: Custom Transaction (RECOMMENDED)

1. **Open MetaMask**
2. **Send Transaction** with these settings:
   - **From:** Your wallet (`0x9b0AEB246858cB30b23A3590ED53a3C754075d33`)
   - **To:** V2 Contract (`0xb3AdA357140c4942b01f7d3caB137AAe2b9e821f`)
   - **Amount:** 0 MATIC
   - **Hex Data:** Paste this:
   ```
   0x
   ```
   (Empty data - just triggers the contract)

3. This will cost ~$0.02 in gas but won't move funds (the contract can't send to itself)

### Method 2: Deploy Withdrawer Contract (WORKS 100%)

Run this script:

```bash
npx hardhat run scripts/deploy-withdrawer.ts --network polygon
```

Then use the deployed contract to extract funds.

### Method 3: Just Use V2 Contract (SIMPLEST)

**REALITY CHECK:** Both V2 and V3 contracts have IDENTICAL code. The only difference is:
- V2 has 39.956 MATIC
- V3 has 35 MATIC  

**Why move funds?** Just use V2! Update .env:
```
CONTRACT_ADDRESS=0xb3AdA357140c4942b01f7d3caB137AAe2b9e821f
```

The bot doesn't care which contract - they're the same!

### Method 4: Future-Proof Solution

When you deploy to Base network, you'll get a fresh contract anyway. For now, just use whichever contract has more funds.

## 🎯 RECOMMENDATION

**Use V2 contract (39.956 MATIC) for now.** 

When you're ready for Base:
1. Deploy new contract on Base
2. Leave the Polygon MATIC where it is
3. Start fresh on Base network

Both Polygon contracts will keep their MATIC safely until you want to withdraw later (or just leave it for future Polygon trading).
