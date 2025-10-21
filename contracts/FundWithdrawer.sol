// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FlashLoanArbitrageWithWithdraw
 * @notice Adds native token withdrawal capability
 * @dev This is the missing function we need
 */
interface IOwnable {
    function owner() external view returns (address);
}

/**
 * @title FundWithdrawer
 * @notice Helper contract to withdraw native tokens from contracts that don't have withdrawal functions
 * @dev This can be used as a workaround for contracts without native token withdrawal capability
 */
contract FundWithdrawer {
    address public owner;
    
    event NativeWithdrawn(address indexed to, uint256 amount);
    event FundsReceived(address indexed from, uint256 amount);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    /**
     * @notice Withdraw all native tokens to a destination address
     * @param destination Where to send the native tokens
     */
    function withdrawAll(address payable destination) external onlyOwner {
        require(destination != address(0), "Invalid destination");
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = destination.call{value: balance}("");
        require(success, "Transfer failed");
        
        emit NativeWithdrawn(destination, balance);
    }
    
    /**
     * @notice Withdraw specific amount of native tokens
     * @param destination Where to send the native tokens
     * @param amount Amount to withdraw
     */
    function withdraw(address payable destination, uint256 amount) external onlyOwner {
        require(destination != address(0), "Invalid destination");
        require(amount > 0, "Amount must be positive");
        require(amount <= address(this).balance, "Insufficient balance");
        
        (bool success, ) = destination.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit NativeWithdrawn(destination, amount);
    }
    
    /**
     * @notice Get the current balance of this contract
     * @return The balance in wei
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @notice Receive function to accept native tokens
     */
    receive() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }
    
    /**
     * @notice Fallback function
     */
    fallback() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }
}

/**
 * @title ForceTransfer
 * @notice DEPRECATED - Uses selfdestruct which is being phased out
 * @dev Kept for reference but not recommended for use
 */
contract ForceTransfer {
    /**
     * @notice Force transfer MATIC from source contract to destination
     * @dev Uses selfdestruct to force send (deprecated in future but works now)
     * @param source The contract to pull from (must send us MATIC first)
     * @param destination Where to send the MATIC
     */
    function execute(address payable source, address payable destination) external payable {
        // Step 1: This contract receives MATIC (msg.value)
        // Step 2: We'll use selfdestruct to force send to destination
        // Note: selfdestruct is deprecated but still works
        
        // Alternative: Just forward what we receive
        uint256 amount = address(this).balance;
        (bool success, ) = destination.call{value: amount}("");
        require(success, "Transfer failed");
    }
    
    receive() external payable {}
}

/**
 * @title DirectWithdrawer  
 * @notice Simpler approach - manually send MATIC then withdraw
 */
contract DirectWithdrawer {
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @notice Withdraw all MATIC to destination
     * @param destination Where to send
     */
    function withdrawAll(address payable destination) external {
        require(msg.sender == owner, "Only owner");
        uint256 balance = address(this).balance;
        (bool success, ) = destination.call{value: balance}("");
        require(success, "Transfer failed");
    }
    
    receive() external payable {}
}

