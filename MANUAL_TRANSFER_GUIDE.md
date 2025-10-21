# Manual Transfer Instructions

## ✅ SOLUTION: withdrawNative() Function Added

The FlashLoanArbitrage contract has been updated with a `withdrawNative()` function that allows the owner to withdraw native tokens (MATIC/ETH).

### Method 1: Use withdrawNative() Function (RECOMMENDED)

If you deploy the updated contract or upgrade to V3 with the new code:

```bash
npx hardhat run scripts/transfer-v2-to-v3-new.ts --network polygon
```

This script will:
1. Check balances of V2 and V3 contracts
2. Calculate the amount to transfer (keeping 2 MATIC in V2)
3. Call `withdrawNative()` on the V2 contract to send MATIC to V3

### Method 2: Manual Transfer via Polygonscan

1. **Go to Polygonscan:**
   - Navigate to: https://polygonscan.com/address/0xb3AdA357140c4942b01f7d3caB137AAe2b9e821f#writeContract
   
2. **Connect your wallet** (must be the owner)

3. **Call withdrawNative():**
   - `amount`: Amount in Wei (e.g., 37956000000000000000 for 37.956 MATIC)
   - `to`: 0x13e25aF42942C627139A9C4055Bbd53274C201Fd (V3 contract address)

4. **Confirm transaction** and wait for confirmation

### Method 3: Deploy New V3 Contract

If the V2 contract doesn't have `withdrawNative()`, deploy a new V3 contract:

```bash
npx hardhat run scripts/deploy.ts --network polygon
```

The new contract will include the `withdrawNative()` function.

### Method 4: Keep Using V2 (ALTERNATIVE)

**REALITY CHECK:** Both V2 and V3 contracts have similar functionality. If the V2 contract has more funds and you can't upgrade it:

- V2 has ~40 MATIC
- V3 has ~35 MATIC  

Just use V2! Update .env:
```
CONTRACT_ADDRESS=0xb3AdA357140c4942b01f7d3caB137AAe2b9e821f
```

## 🎯 RECOMMENDATION

1. **First Choice:** Use the new `withdrawNative()` function if your contract supports it
2. **Second Choice:** Deploy a new contract with the updated code
3. **Fallback:** Keep using V2 contract with its existing funds

## 📝 Technical Details

The new `withdrawNative()` function:
- Can only be called by the contract owner
- Validates recipient address and balance
- Uses low-level `.call{value}` for safe transfers
- Emits EmergencyWithdraw event for tracking
