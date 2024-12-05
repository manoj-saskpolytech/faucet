// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Faucet {
    uint256 constant WITHDRAW_AMOUNT = 0.1 ether;
    uint256 constant WAIT_TIME = 1 days;

    address public owner;
    mapping(address => uint256) public lastRequestTime;

    // Event to emit when funds are dispensed
    event FundsDispensed(address indexed recipient, uint256 amount);

    // Event to emit when funds are withdrawn by the owner
    event FundsWithdrawn(address indexed owner, uint256 amount);

    // Event to emit when the faucet is disabled or enabled
    event FaucetStatusChanged(bool isActive);

    // Faucet active status
    bool public isActive = true;

    // Modifier to restrict access to the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    // Modifier to check if the faucet is active
    modifier whenActive() {
        require(isActive, "Faucet is currently disabled");
        _;
    }

    // Constructor to set the owner
    constructor() {
        owner = msg.sender;
    }

    // Function to receive Ether
    receive() external payable {}

    // Fallback function
    fallback() external payable {}

    // Function to request funds
    function requestFunds() public whenActive {
        require(address(this).balance >= WITHDRAW_AMOUNT, "Faucet empty. Please try again later.");
        require(
            block.timestamp >= lastRequestTime[msg.sender] + WAIT_TIME,
            "0.1 ETH has already been requested for this account and you can request only once every day."
        );

        lastRequestTime[msg.sender] = block.timestamp;

        payable(msg.sender).transfer(WITHDRAW_AMOUNT);

        emit FundsDispensed(msg.sender, WITHDRAW_AMOUNT);
    }

    // Function for the owner to withdraw all funds
    function withdrawAll() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw.");

        payable(owner).transfer(balance);

        emit FundsWithdrawn(owner, balance);
    }

    // Function for the owner to disable or enable the faucet
    function setFaucetStatus(bool status) public onlyOwner {
        isActive = status;
        emit FaucetStatusChanged(isActive);
    }
}