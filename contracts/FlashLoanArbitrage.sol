// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import "@aave/core-v3/contracts/interfaces/IPool.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IUniswapV2Router.sol";
import "./interfaces/IUniswapV3Router.sol";

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
    mapping(address => bool) public isUniswapV3Router; // Track which routers are V3
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
            uint256 minProfitBps,
            uint24 feeTier1,
            uint24 feeTier2
        ) = abi.decode(params, (address, address, address[], address[], uint256, uint24, uint24));

        // Execute the arbitrage logic
        uint256 profit = _executeArbitrageLogic(
            asset,
            amount,
            dexRouter1,
            dexRouter2,
            path1,
            path2,
            feeTier1,
            feeTier2,
            minProfitBps
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
     * @dev Supports both Uniswap V2 and V3 protocols
     * @param asset The flash loaned asset address
     * @param amount The amount borrowed
     * @param dexRouter1 Address of the first DEX router (buy DEX)
     * @param dexRouter2 Address of the second DEX router (sell DEX)
     * @param path1 Token path for the first swap
     * @param path2 Token path for the second swap
     * @param feeTier1 Fee tier for V3 swap on DEX1 (0 for V2)
     * @param feeTier2 Fee tier for V3 swap on DEX2 (0 for V2)
     * @param minProfitBps Minimum required profit in basis points
     * @return profit The profit generated from the arbitrage (in the borrowed asset)
     */
    function _executeArbitrageLogic(
        address asset,
        uint256 amount,
        address dexRouter1,
        address dexRouter2,
        address[] memory path1,
        address[] memory path2,
        uint24 feeTier1,
        uint24 feeTier2,
        uint256 minProfitBps
    ) internal returns (uint256 profit) {
        // Validate paths
        require(path1.length >= 2, "Invalid path1 length");
        require(path2.length >= 2, "Invalid path2 length");
        require(path1[0] == asset, "path1 must start with borrowed asset");
        require(path2[path2.length - 1] == asset, "path2 must end with borrowed asset");

        // Get initial balance
        uint256 initialBalance = IERC20(asset).balanceOf(address(this));

        // ========== STEP 1: First Swap (Buy on DEX 1) ==========
        uint256 intermediateAmount;
        address intermediateToken = path1[path1.length - 1];

        if (isUniswapV3Router[dexRouter1]) {
            // Execute Uniswap V3 swap
            intermediateAmount = _executeV3Swap(
                dexRouter1,
                path1[0],
                intermediateToken,
                feeTier1,
                amount,
                0 // Accept any amount (slippage handled off-chain)
            );
        } else {
            // Execute Uniswap V2 swap
            intermediateAmount = _executeV2Swap(
                dexRouter1,
                amount,
                0, // Accept any amount (slippage handled off-chain)
                path1
            );
        }

        require(intermediateAmount > 0, "First swap failed");

        // ========== STEP 2: Second Swap (Sell on DEX 2) ==========
        uint256 finalAmount;

        if (isUniswapV3Router[dexRouter2]) {
            // Execute Uniswap V3 swap
            finalAmount = _executeV3Swap(
                dexRouter2,
                intermediateToken,
                asset,
                feeTier2,
                intermediateAmount,
                0 // Accept any amount (profitability checked below with proper calculation)
            );
        } else {
            // Execute Uniswap V2 swap
            finalAmount = _executeV2Swap(
                dexRouter2,
                intermediateAmount,
                0, // Accept any amount (profitability checked below)
                path2
            );
        }

        // Calculate minimum required return (borrowed amount + flash loan fee + minimum profit)
        // Flash loan fee is 0.05% (5 bps) on Aave V3
        uint256 flashLoanFee = (amount * 5) / 10000; // 0.05% fee
        uint256 minRequiredProfit = (amount * minProfitBps) / 10000;
        uint256 minRequiredReturn = amount + flashLoanFee + minRequiredProfit;

        require(finalAmount >= minRequiredReturn, "Arbitrage not profitable");

        // Calculate profit
        uint256 finalBalance = IERC20(asset).balanceOf(address(this));
        profit = finalBalance - initialBalance;

        return profit;
    }

    /**
     * @notice Execute a Uniswap V2 style swap
     * @param router The V2 router address
     * @param amountIn Amount of input tokens
     * @param amountOutMin Minimum amount of output tokens
     * @param path Token swap path
     * @return amountOut Amount of output tokens received
     */
    function _executeV2Swap(
        address router,
        uint256 amountIn,
        uint256 amountOutMin,
        address[] memory path
    ) internal returns (uint256 amountOut) {
        // Approve router to spend tokens
        IERC20(path[0]).forceApprove(router, amountIn);

        // Execute swap
        uint256[] memory amounts = IUniswapV2Router(router).swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            address(this),
            block.timestamp + 300 // 5 minute deadline
        );

        amountOut = amounts[amounts.length - 1];
    }

    /**
     * @notice Execute a Uniswap V3 style swap
     * @param router The V3 router address
     * @param tokenIn Input token address
     * @param tokenOut Output token address
     * @param fee Fee tier (500 = 0.05%, 3000 = 0.3%, 10000 = 1%)
     * @param amountIn Amount of input tokens
     * @param amountOutMin Minimum amount of output tokens
     * @return amountOut Amount of output tokens received
     */
    function _executeV3Swap(
        address router,
        address tokenIn,
        address tokenOut,
        uint24 fee,
        uint256 amountIn,
        uint256 amountOutMin
    ) internal returns (uint256 amountOut) {
        // Approve router to spend tokens
        IERC20(tokenIn).forceApprove(router, amountIn);

        // Prepare swap parameters
        IUniswapV3Router.ExactInputSingleParams memory params = IUniswapV3Router.ExactInputSingleParams({
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            fee: fee,
            recipient: address(this),
            deadline: block.timestamp + 300, // 5 minute deadline
            amountIn: amountIn,
            amountOutMinimum: amountOutMin,
            sqrtPriceLimitX96: 0 // No price limit
        });

        // Execute swap
        amountOut = IUniswapV3Router(router).exactInputSingle(params);
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
     * @notice Mark a router as Uniswap V3 compatible
     * @param router Address of the router
     * @param isV3 Boolean indicating if the router is V3
     */
    function setUniswapV3Router(
        address router,
        bool isV3
    ) external onlyOwner {
        isUniswapV3Router[router] = isV3;
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
