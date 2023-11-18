// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Bonding {

    // struct Verifier {
    //     address addressOnDestChain;
    //     address tokenOnDestChain; // address(0) for Native on dest chain
    //     uint256 value;
    //     uint256 chainId;
    // }

    struct Bond {
        address owner;
        address token;
        uint256 amount;
        uint256 cooldownDuration;
        bytes verifier; // Verifier encoded
        // Uma params
        uint256 disputeAmount;
        uint256 disputeLiveness;
    }

    event EnterCooldown(uint256 bondId, uint256 cooldownEnd);

    Bond[] public bonds;

    modifier onlyOwner(uint256 bondId) {
        require(msg.sender == bonds[bondId].owner, "Bonding: not owner");
        _;
    }

    function createBond(
        address owner,
        address token,
        uint256 amount,
        uint256 cooldownDuration,
        bytes memory verifier,
        uint256 disputeAmount,
        uint256 disputeLiveness
    ) external payable {
        Bond storage bond = bonds.push();

        bond.owner = owner;
        bond.token = token;
        bond.amount = amount;
        bond.cooldownDuration = cooldownDuration;
        bond.verifier = verifier;
        bond.disputeAmount = disputeAmount;
        bond.disputeLiveness = disputeLiveness;

        if (address(token) == address(0)) {
            // ETH
            require(msg.value == amount, "Bonding: ETH amount mismatch");
        } else {
            // ERC20
        }
    }

    function isCooldown(uint256 bondId) external view returns (bool) {
        return true;
    }

    function triggerCooldown(uint256 bondId) external onlyOwner(bondId) {}

    function withdraw(uint256 bondId) external onlyOwner(bondId) {}
}
