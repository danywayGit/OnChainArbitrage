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
