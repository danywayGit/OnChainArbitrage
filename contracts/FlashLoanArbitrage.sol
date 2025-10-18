// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import "@aave/core-v3/contracts/interfaces/IPool.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IUniswapV2Router.sol";

/**
 * @title FlashLoanArbitrage
 * @notice Smart contract for executing arbitrage trades using Aave V3 flash loans
 * @dev Inherits from FlashLoanSimpleReceiverBase and Ownable
 */
contract FlashLoanArbitrage is FlashLoanSimpleReceiverBase, Ownable {
    using SafeERC20 for IERC20;

    // Events
    event ArbitrageExecuted(
        address indexed token,
        uint256 amount,
        uint256 profit,
        uint256 timestamp
    );
    
    event FlashLoanInitiated(
        address indexed token,
        uint256 amount,
        uint256 fee
    );

    event EmergencyWithdraw(
        address indexed token,
        uint256 amount,
        address indexed to
    );

    // State variables
    mapping(address => bool) public authorizedExecutors;
    uint256 public totalProfitGenerated;
    uint256 public totalTradesExecuted;
    bool public paused;

    // Modifiers
    modifier onlyAuthorized() {
        require(
            authorizedExecutors[msg.sender] || msg.sender == owner(),
            "Not authorized"
        );
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    /**
     * @notice Constructor
     * @param _addressProvider Address of the Aave V3 PoolAddressesProvider
     */
    constructor(
        address _addressProvider
    ) FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_addressProvider)) Ownable(msg.sender) {
        // Initialize with deployer as authorized executor
        authorizedExecutors[msg.sender] = true;
    }

    /**
     * @notice Execute a flash loan arbitrage
     * @param token Address of the token to borrow
     * @param amount Amount to borrow
     * @param params Encoded parameters for the arbitrage execution
     */
    function executeArbitrage(
        address token,
        uint256 amount,
        bytes calldata params
    ) external onlyAuthorized whenNotPaused {
        // Request flash loan from Aave
        POOL.flashLoanSimple(
            address(this),
            token,
            amount,
            params,
            0 // referral code
        );
    }

    /**
     * @notice This function is called after your contract has received the flash loaned amount
     * @dev Overrides the executeOperation function from FlashLoanSimpleReceiverBase
     * @param asset The address of the flash-borrowed asset
     * @param amount The amount of the flash-borrowed asset
     * @param premium The fee of the flash-borrowed asset
     * @param initiator The address of the flashloan initiator
     * @param params The byte-encoded params passed when initiating the flashloan
     * @return True if the execution of the operation succeeds, false otherwise
     */
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        require(msg.sender == address(POOL), "Caller must be Pool");
        require(initiator == address(this), "Initiator must be this contract");

        emit FlashLoanInitiated(asset, amount, premium);

        // Decode parameters
        (
            address dexRouter1,
            address dexRouter2,
            address[] memory path1,
            address[] memory path2,
            uint256 minProfitBps
        ) = abi.decode(params, (address, address, address[], address[], uint256));

        // Execute the arbitrage logic
        uint256 profit = _executeArbitrageLogic(
            asset,
            amount,
            dexRouter1,
            dexRouter2,
            path1,
            path2
        );

        // Calculate minimum required profit
        uint256 totalDebt = amount + premium;
        uint256 minRequiredProfit = (totalDebt * minProfitBps) / 10000;

        require(profit >= minRequiredProfit, "Insufficient profit");

        // Update stats
        totalProfitGenerated += profit;
        totalTradesExecuted++;

        emit ArbitrageExecuted(asset, amount, profit, block.timestamp);

        // Approve the Pool to pull the owed amount
        IERC20(asset).forceApprove(address(POOL), totalDebt);

        return true;
    }

    /**
     * @notice Internal function to execute arbitrage logic
     * @dev Executes two swaps across different DEXes to capture price differences
     * @param asset The flash loaned asset address
     * @param amount The amount borrowed
     * @param dexRouter1 Address of the first DEX router (buy DEX)
     * @param dexRouter2 Address of the second DEX router (sell DEX)
     * @param path1 Token path for the first swap
     * @param path2 Token path for the second swap
     * @return profit The profit generated from the arbitrage (in the borrowed asset)
     */
    function _executeArbitrageLogic(
        address asset,
        uint256 amount,
        address dexRouter1,
        address dexRouter2,
        address[] memory path1,
        address[] memory path2
    ) internal returns (uint256 profit) {
        // Validate paths
        require(path1.length >= 2, "Invalid path1 length");
        require(path2.length >= 2, "Invalid path2 length");
        require(path1[0] == asset, "path1 must start with borrowed asset");
        require(path2[path2.length - 1] == asset, "path2 must end with borrowed asset");

        // Get initial balance
        uint256 initialBalance = IERC20(asset).balanceOf(address(this));

        // ========== STEP 1: First Swap (Buy on DEX 1) ==========
        // Approve DEX Router 1 to spend our borrowed tokens
        IERC20(asset).forceApprove(dexRouter1, amount);

        // Execute first swap
        uint256[] memory amounts1 = IUniswapV2Router(dexRouter1).swapExactTokensForTokens(
            amount,
            0, // Accept any amount (in production, calculate minimum with slippage)
            path1,
            address(this),
            block.timestamp + 300 // 5 minute deadline
        );

        // Get the intermediate token and amount received
        address intermediateToken = path1[path1.length - 1];
        uint256 intermediateAmount = amounts1[amounts1.length - 1];

        require(intermediateAmount > 0, "First swap failed");

        // ========== STEP 2: Second Swap (Sell on DEX 2) ==========
        // Approve DEX Router 2 to spend the intermediate tokens
        IERC20(intermediateToken).forceApprove(dexRouter2, intermediateAmount);

        // Execute second swap
        uint256[] memory amounts2 = IUniswapV2Router(dexRouter2).swapExactTokensForTokens(
            intermediateAmount,
            amount, // Must get at least the borrowed amount back
            path2,
            address(this),
            block.timestamp + 300 // 5 minute deadline
        );

        // Get final amount received
        uint256 finalAmount = amounts2[amounts2.length - 1];

        require(finalAmount > amount, "Arbitrage not profitable");

        // Calculate profit
        uint256 finalBalance = IERC20(asset).balanceOf(address(this));
        profit = finalBalance - initialBalance;

        return profit;
    }

    /**
     * @notice Add or remove authorized executors
     * @param executor Address of the executor
     * @param authorized Boolean indicating if the executor should be authorized
     */
    function setAuthorizedExecutor(
        address executor,
        bool authorized
    ) external onlyOwner {
        authorizedExecutors[executor] = authorized;
    }

    /**
     * @notice Pause or unpause the contract
     * @param _paused Boolean indicating if the contract should be paused
     */
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
    }

    /**
     * @notice Emergency withdraw function to recover stuck tokens
     * @param token Address of the token to withdraw
     * @param amount Amount to withdraw
     * @param to Address to send the tokens to
     */
    function emergencyWithdraw(
        address token,
        uint256 amount,
        address to
    ) external onlyOwner {
        IERC20(token).safeTransfer(to, amount);
        emit EmergencyWithdraw(token, amount, to);
    }

    /**
     * @notice Get contract stats
     * @return totalProfit Total profit generated
     * @return totalTrades Total number of trades executed
     * @return isPaused Whether the contract is paused
     */
    function getStats() external view returns (
        uint256 totalProfit,
        uint256 totalTrades,
        bool isPaused
    ) {
        return (totalProfitGenerated, totalTradesExecuted, paused);
    }

    /**
     * @notice Receive function to accept ETH
     */
    receive() external payable {}
}
