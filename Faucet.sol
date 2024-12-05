// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Faucet {
    uint256 constant WITHDRAW_AMOUNT = 0.1 ether;
    uint256 constant WAIT_TIME = 1 days;

    mapping(address => uint256) public lastRequestTime;

    // Event to emit when funds are dispensed
    event FundsDispensed(address indexed recipient, uint256 amount);

    // Function to receive Ether
    receive() external payable {}

    // Fallback function
    fallback() external payable {}

    function requestFunds() public {
        require(address(this).balance >= WITHDRAW_AMOUNT, "Faucet empty. Please try again later.");
        require(
            block.timestamp >= lastRequestTime[msg.sender] + WAIT_TIME,
            "0.1 ETH has already been requested for this account and you can request only once every day."
        );

        // Update last request time before transferring funds
        lastRequestTime[msg.sender] = block.timestamp;

        payable(msg.sender).transfer(WITHDRAW_AMOUNT);

        emit FundsDispensed(msg.sender, WITHDRAW_AMOUNT);
    }
}