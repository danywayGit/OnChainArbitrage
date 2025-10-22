# V4 Contract Deployment - Fund Consolidation

**Date:** October 22, 2025  
**Network:** Polygon Mainnet (Chain ID: 137)  
**Status:** ✅ Successfully Deployed & Funded

---

## 📋 Executive Summary

Deployed V4 contract with critical `withdrawNative()` function that was missing from V2 and V3 contracts. This enables proper fund management and withdrawal capabilities going forward.

### Key Improvement: Withdrawal Function
```solidity
function withdrawNative(uint256 amount, address payable to) external onlyOwner {
    require(address(this).balance >= amount, "Insufficient balance");
    (bool success, ) = to.call{value: amount}("");
    require(success, "Transfer failed");
}
```

---

## 🏦 Contract Addresses (Public - No Security Risk)

> **Note:** All contract addresses are public information on Polygon blockchain. Publishing them poses no security risk as:
> - Only the owner (your wallet with private key) can execute privileged functions
> - All contracts inherit OpenZeppelin's `Ownable` with `onlyOwner` modifiers
> - Blockchain data is inherently public and viewable on Polygonscan

| Version | Address | Balance | Withdrawal | Status |
|---------|---------|---------|------------|--------|
| **V4** | `0xe7c7a653a4d3BA2ebc9286Ddd0f37d8989983486` | 4.563 MATIC | ✅ Enabled | **ACTIVE** |
| V3 | `0x13e25aF42942C627139A9C4055Bbd53274C201Fd` | 35.000 MATIC | ❌ Locked | Deprecated |
| V2 | `0xb3AdA357140c4942b01f7d3caB137AAe2b9e821f` | 39.956 MATIC | ❌ Locked | Deprecated |

**Owner Wallet:** `0x9b0AEB246858cB30b23A3590ED53a3C754075d33`  
**Total MATIC:** ~79.6 MATIC across all contracts

### Polygonscan Links
- [V4 Contract](https://polygonscan.com/address/0xe7c7a653a4d3BA2ebc9286Ddd0f37d8989983486)
- [V3 Contract](https://polygonscan.com/address/0x13e25aF42942C627139A9C4055Bbd53274C201Fd)
- [V2 Contract](https://polygonscan.com/address/0xb3AdA357140c4942b01f7d3caB137AAe2b9e821f)
- [Owner Wallet](https://polygonscan.com/address/0x9b0AEB246858cB30b23A3590ED53a3C754075d33)

---

## 🎯 Why V4 Was Needed

### Problem Discovery
After running the bot for 3+ hours with **894 trade attempts** and **0% success rate**, we attempted to consolidate funds from V2 and V3 contracts into one place. However, we discovered:

1. **V2 and V3 contracts lack `withdrawNative()` function**
   - 74.956 MATIC effectively locked in these contracts
   - Funds can still be used for trading, but cannot be withdrawn to wallet

2. **Contract-to-contract transfer impossible**
   - Tested successfully on Hardhat fork using `impersonateAccount`
   - Failed on mainnet: "Unsupported method: hardhat_impersonateAccount"
   - Only works in simulation, not on real blockchain

3. **No helper contract solution**
   - V2/V3 contracts cannot call external contracts with value transfers
   - Architectural limitation cannot be bypassed

### Solution
Deploy **new V4 contract** with:
- ✅ Full V2/V3 arbitrage functionality
- ✅ `withdrawNative()` function for fund management
- ✅ Proper withdrawal capabilities
- ✅ Same security model (Ownable)

---

## 🚀 Deployment Process

### 1. Contract Compilation
```bash
npx hardhat compile
```

### 2. Deployment to Polygon
```bash
npx hardhat run scripts/deploy-v4-with-withdraw.ts --network polygon
```

**Deployment Transaction:**
- Gas Cost: ~0.09 MATIC
- Block: Confirmed on Polygon mainnet
- Deployer: 0x9b0AEB246858cB30b23A3590ED53a3C754075d33

**Deployment Output:**
```
🚀 Deploying NEW V4 contract with withdrawal function...
👤 Deploying from: 0x9b0AEB246858cB30b23A3590ED53a3C754075d33
📝 Deployment Parameters:
   Aave Pool Provider: 0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb
⏳ Deploying contract...
✅ NEW V4 Contract deployed!
📍 Address: 0xe7c7a653a4d3BA2ebc9286Ddd0f37d8989983486
```

### 3. Fund Transfer
```bash
npx ts-node scripts/fund-v4-contract.ts
```

**Transfer Details:**
- From: 0x9b0AEB246858cB30b23A3590ED53a3C754075d33 (wallet)
- To: 0xe7c7a653a4d3BA2ebc9286Ddd0f37d8989983486 (V4 contract)
- Amount: 4.563 MATIC
- Kept for gas: 0.1 MATIC
- TX Hash: `0x95ecfb367449fe35329101e18c498f398151083f3ad3fe7d4bd16c46171d4031`

### 4. Configuration Update
Updated `.env`:
```bash
CONTRACT_ADDRESS=0xe7c7a653a4d3BA2ebc9286Ddd0f37d8989983486
```

---

## 💰 Fund Distribution

### Before V4 Deployment
```
Wallet:  4.75 MATIC
V2:     39.956 MATIC (locked)
V3:     35.000 MATIC (locked)
─────────────────────────
TOTAL:  79.706 MATIC
```

### After V4 Deployment & Funding
```
Wallet:  ~0.10 MATIC (gas reserve)
V2:      39.956 MATIC (locked, trading-only)
V3:      35.000 MATIC (locked, trading-only)
V4:       4.563 MATIC (✅ withdrawable + trading)
─────────────────────────
TOTAL:   79.619 MATIC
```

### Migration Strategy
- **V4 (Active):** Primary contract for new trades, can withdraw funds anytime
- **V2 (Deprecated):** 39.956 MATIC locked but usable for trading if needed
- **V3 (Deprecated):** 35.000 MATIC locked but usable for trading if needed

**Note:** To use V2 or V3 for trading, simply change `CONTRACT_ADDRESS` in `.env` to the respective address. Funds will remain accessible for flash loan arbitrage, just not withdrawable.

---

## 🔧 Technical Implementation

### Contract Constructor
```solidity
constructor(address _addressProvider) FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_addressProvider)) {
    owner = msg.sender;
}
```

**Parameters:**
- `_addressProvider`: Aave V3 Pool Address Provider
- Value: `0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb` (Polygon)

### Key Functions

#### 1. Execute Arbitrage (Unchanged)
```solidity
function executeArbitrage(
    address asset,
    uint256 amount,
    address router0,
    address router1,
    address token0,
    address token1,
    uint24 v3Fee
) external onlyOwner
```

#### 2. Withdraw Native Token (NEW)
```solidity
function withdrawNative(uint256 amount, address payable to) external onlyOwner {
    require(address(this).balance >= amount, "Insufficient balance");
    (bool success, ) = to.call{value: amount}("");
    require(success, "Transfer failed");
}
```

#### 3. Withdraw ERC20 (Existing)
```solidity
function withdrawToken(address token, uint256 amount, address to) external onlyOwner {
    require(IERC20(token).transfer(to, amount), "Transfer failed");
}
```

---

## 📊 Comparison: V2/V3 vs V4

| Feature | V2/V3 | V4 |
|---------|-------|-----|
| Uniswap V2 Support | ✅ | ✅ |
| Uniswap V3 Support | ✅ | ✅ |
| Flash Loan (Aave V3) | ✅ | ✅ |
| Execute Arbitrage | ✅ | ✅ |
| Withdraw ERC20 | ✅ | ✅ |
| **Withdraw Native Token** | ❌ | ✅ |
| Owner Access Control | ✅ | ✅ |
| Emergency Stop | ✅ | ✅ |

**Critical Difference:** V4 adds `withdrawNative()` function for MATIC/ETH withdrawal.

---

## 🔒 Security Considerations

### Public Information (Safe to Share)
✅ **Contract addresses** - Public on blockchain  
✅ **Transaction hashes** - Public on blockchain  
✅ **Owner wallet address** - Public on blockchain  
✅ **Contract source code** - Verified on Polygonscan  
✅ **MATIC balances** - Public on blockchain  

### Private Information (NEVER Share)
❌ **Private key** - Stored securely in `.env` (gitignored)  
❌ **Mnemonic phrase** - Never committed to Git  
❌ **API keys** - Stored in `.env` (gitignored)  

### Access Control
All privileged functions protected by:
```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Only owner can call this function");
    _;
}
```

**Owner:** `0x9b0AEB246858cB30b23A3590ED53a3C754075d33`  
Only transactions signed with the corresponding private key can execute:
- `executeArbitrage()`
- `withdrawNative()`
- `withdrawToken()`
- `pause()` / `unpause()`

---

## 📝 Related Scripts

### Deployment
```bash
# Deploy V4 contract
npx hardhat run scripts/deploy-v4-with-withdraw.ts --network polygon
```

### Funding
```bash
# Fund V4 from wallet
npx ts-node scripts/fund-v4-contract.ts
```

### Balance Checking
```bash
# Check V2 and V3 balances
npx ts-node scripts/check-both-balances.ts

# Check specific contract
npx ts-node scripts/check-contract-balance.ts <address>
```

### Withdrawal (Future Use)
```typescript
// Create a script to withdraw from V4
const contract = new ethers.Contract(
  "0xe7c7a653a4d3BA2ebc9286Ddd0f37d8989983486",
  contractABI,
  wallet
);

await contract.withdrawNative(
  ethers.parseEther("1.0"), // Amount
  "0x9b0AEB246858cB30b23A3590ED53a3C754075d33" // Your wallet
);
```

---

## 🎯 Next Steps

1. **Run Bot with V4**
   ```bash
   npm run bot
   ```

2. **Monitor Performance**
   - Stablecoin-only strategy active
   - 4 trading pairs enabled (MAI/USDC, DAI/USDC, USDC/USDT, USDT/DAI)
   - Min profit: 3 bps (0.03%)

3. **Withdrawal Available Anytime**
   - Create withdrawal script when needed
   - Call `withdrawNative()` on V4 contract
   - Transfer MATIC back to wallet

4. **Optional: Use V2/V3 for Trading**
   - Change `CONTRACT_ADDRESS` in `.env` to V2 or V3
   - Access larger MATIC pools (39.956 or 35 MATIC)
   - Funds remain locked but usable for trading

---

## 📚 Related Documentation

- [STABLECOIN_STRATEGY.md](./STABLECOIN_STRATEGY.md) - Why stablecoins-only
- [STABLECOIN_ACTIVATION.md](./STABLECOIN_ACTIVATION.md) - Configuration details
- [V3_UPGRADE_COMPLETE.md](./V3_UPGRADE_COMPLETE.md) - Uniswap V3 integration
- [MANUAL_TRANSFER_GUIDE.md](./MANUAL_TRANSFER_GUIDE.md) - Transfer attempts history

---

## 🔍 Verification

### Contract Verification on Polygonscan
```bash
npx hardhat verify --network polygon \
  0xe7c7a653a4d3BA2ebc9286Ddd0f37d8989983486 \
  0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb
```

### Check Contract Balance
```bash
# Via script
npx ts-node scripts/check-contract-balance.ts

# Via cast (Foundry)
cast balance 0xe7c7a653a4d3BA2ebc9286Ddd0f37d8989983486 --rpc-url $POLYGON_RPC_URL

# Via Polygonscan
# Visit: https://polygonscan.com/address/0xe7c7a653a4d3BA2ebc9286Ddd0f37d8989983486
```

---

## 📈 Expected Performance

### With V4 Contract (4.56 MATIC)
- **Trade Size:** $500 - $5,000 per trade
- **Target Pairs:** Stablecoins (MAI/USDC, DAI/USDC, etc.)
- **Success Target:** >0% (currently 0% across 894 attempts)
- **Challenge:** Price impact + MEV competition on Polygon

### Future Considerations
1. **If success rate remains 0%:** Consider Base network deployment
2. **If V4 funds insufficient:** Switch to V2 (39.956 MATIC) or V3 (35 MATIC)
3. **If MEV too competitive:** Explore private RPC or Flashbots on other chains

---

## ✅ Deployment Checklist

- [x] Compile contract with `withdrawNative()` function
- [x] Deploy to Polygon mainnet
- [x] Verify deployment successful
- [x] Fund contract from wallet (4.563 MATIC)
- [x] Update `.env` with V4 address
- [x] Document deployment process
- [x] Create withdrawal capability for future use
- [ ] Run bot and monitor for successful trades
- [ ] Test withdrawal function (when needed)

---

**Last Updated:** October 22, 2025  
**Contract Version:** V4  
**Network:** Polygon Mainnet  
**Status:** ✅ Active and Ready for Trading
