# Transferring MATIC from V2 to V3 Contract - Solution Guide

## Overview

This guide explains how to transfer MATIC from the V2 contract to the V3 contract using the newly added `withdrawNative()` function in the FlashLoanArbitrage contract.

## Problem Statement

The original FlashLoanArbitrage contract could receive native tokens (MATIC/ETH) through the `receive()` function but lacked a method to withdraw them. The `emergencyWithdraw()` function only worked for ERC20 tokens, leaving native tokens stuck in the contract.

## Solution

A new `withdrawNative()` function has been added to the FlashLoanArbitrage contract that allows the contract owner to withdraw native tokens.

### Function Signature

```solidity
function withdrawNative(uint256 amount, address payable to) external onlyOwner
```

### Features

- **Owner-only**: Only the contract owner can call this function
- **Validation**: Validates recipient address and available balance
- **Safe transfer**: Uses low-level `.call{value}` for secure transfers
- **Event logging**: Emits `EmergencyWithdraw` event for tracking

## Usage Options

### Option 1: Using the Transfer Script (Recommended)

If the V2 contract has been upgraded or you're deploying a new contract with the updated code:

```bash
npx hardhat run scripts/transfer-v2-to-v3-new.ts --network polygon
```

The script will:
1. Check current balances of both V2 and V3 contracts
2. Calculate the transfer amount (keeping 2 MATIC in V2 for safety)
3. Call `withdrawNative()` on the V2 contract
4. Send the MATIC to the V3 contract
5. Display the new balances

### Option 2: Manual Transfer via Polygonscan

For direct contract interaction:

1. Navigate to the V2 contract on Polygonscan:
   ```
   https://polygonscan.com/address/0xb3AdA357140c4942b01f7d3caB137AAe2b9e821f#writeContract
   ```

2. Connect your wallet (must be the contract owner)

3. Find the `withdrawNative` function and enter:
   - `amount`: The amount in Wei (e.g., `37956000000000000000` for 37.956 MATIC)
   - `to`: The V3 contract address (`0x13e25aF42942C627139A9C4055Bbd53274C201Fd`)

4. Confirm the transaction and wait for confirmation

### Option 3: Deploy a New V3 Contract

If your V2 contract doesn't have the `withdrawNative()` function:

```bash
npx hardhat run scripts/deploy.ts --network polygon
```

This will deploy a new contract with the updated code that includes the `withdrawNative()` function.

### Option 4: Continue Using V2 (Alternative)

If upgrading is not immediately necessary:

- The V2 contract (~40 MATIC) and V3 contract (~35 MATIC) have the same functionality
- Simply continue using the V2 contract by updating your `.env` file:
  ```
  CONTRACT_ADDRESS=0xb3AdA357140c4942b01f7d3caB137AAe2b9e821f
  ```

## Technical Implementation

### Contract Changes

The `withdrawNative()` function in FlashLoanArbitrage.sol:

```solidity
function withdrawNative(
    uint256 amount,
    address payable to
) external onlyOwner {
    require(to != address(0), "Invalid recipient");
    require(amount <= address(this).balance, "Insufficient balance");
    
    (bool success, ) = to.call{value: amount}("");
    require(success, "Transfer failed");
    
    emit EmergencyWithdraw(address(0), amount, to);
}
```

### Security Considerations

1. **Access Control**: Function is restricted to contract owner only
2. **Input Validation**: Checks for zero address and sufficient balance
3. **Safe Transfer**: Uses low-level call with success checking
4. **Event Emission**: Logs withdrawal for transparency (using address(0) for native token)
5. **No Reentrancy Risk**: Simple transfer with no external calls before balance update

## Contract Addresses

- **V2 Contract**: `0xb3AdA357140c4942b01f7d3caB137AAe2b9e821f`
- **V3 Contract**: `0x13e25aF42942C627139A9C4055Bbd53274C201Fd`
- **Network**: Polygon Mainnet

## Additional Resources

- [FlashLoanArbitrage.sol](../contracts/FlashLoanArbitrage.sol) - Updated contract with withdrawNative()
- [transfer-v2-to-v3-new.ts](../scripts/transfer-v2-to-v3-new.ts) - Transfer script
- [MANUAL_TRANSFER_GUIDE.md](../MANUAL_TRANSFER_GUIDE.md) - Detailed manual instructions

## Troubleshooting

### "Function not found" Error

If you get a "function not found" error when calling `withdrawNative()`:
- The V2 contract may not have been upgraded
- Deploy a new contract or continue using V2 as-is

### "Not authorized" Error

Ensure you're calling the function with the wallet that owns the contract.

### Transaction Fails

Check that:
1. The contract has sufficient MATIC balance
2. The recipient address is valid
3. Gas price is set appropriately

## Recommendations

1. **Best Practice**: Deploy new contracts with the updated code going forward
2. **For Existing Contracts**: If the contract has significant funds, consider careful testing on testnet first
3. **Alternative**: Keep using V2 if it has more funds until you're ready to deploy on a new network (like Base)

## Summary

The addition of the `withdrawNative()` function solves the native token withdrawal limitation in the FlashLoanArbitrage contract. This enables proper fund management and migration between contract versions while maintaining security through owner-only access control.
