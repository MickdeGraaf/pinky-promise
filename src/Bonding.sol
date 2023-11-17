// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract Bonding {
    struct Bond {
        address token;
        uint256 amount;
        uint256 cooldownDuration;
        bytes verifier;
        // Uma params
        uint256 disputeAmount;
        uint256 disputeLiveness;
    }

    Bond[] public bonds;

    function createBond(
        address token,
        uint256 amount,
        uint256 cooldownDuration,
        bytes memory verifier,
        uint256 disputeAmount,
        uint256 disputeLiveness
    ) external payable {
        Bond storage bond = bonds.push();

        bond.token = token;
        bond.amount = amount;
        bond.cooldownDuration = cooldownDuration;
        bond.verifier = verifier;
        bond.disputeAmount = disputeAmount;
        bond.disputeLiveness = disputeLiveness;

        if(address(token) == address(0)) {
            // ETH
            require(msg.value == amount, "Bonding: ETH amount mismatch");
        } else {
            // ERC20
        }
        
    }
}