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
    mapping(address => uint256[]) public bondsOfOwner;

    //bondId => timestamp
    mapping(uint256 => uint256) public cooldownEnd;

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
            SafeERC20.safeTransferFrom(IERC20(token), msg.sender, address(this), amount);
        }

        bondsOfOwner[owner].push(bonds.length - 1);
    }

    function isCooldown(uint256 bondId) external view returns (bool) {
        require(bondId < bonds.length, "Bonding: invalid bondId");
        return cooldownEnd[bondId] > 0 ? block.timestamp < cooldownEnd[bondId] : false;
    }

    function triggerCooldown(uint256 bondId) external onlyOwner(bondId) {
        require(cooldownEnd[bondId] == 0, "Bonding: already in cooldown");
        cooldownEnd[bondId] = block.timestamp + bonds[bondId].cooldownDuration;

        emit EnterCooldown(bondId, cooldownEnd[bondId]);
    }

    function withdraw(uint256 bondId) external onlyOwner(bondId) {
        require(cooldownEnd[bondId] < block.timestamp && cooldownEnd[bondId] > 0, "Bonding: still in cooldown");
        Bond storage bond = bonds[bondId];
        if (address(bond.token) == address(0)) {
            // ETH
            payable(msg.sender).transfer(bond.amount);
        } else {
            // ERC20
            SafeERC20.safeTransfer(IERC20(bond.token), msg.sender, bond.amount);
        }
    }

    function getBondsLength() external view returns (uint256) {
        return bonds.length;
    }

    function getBondIndexesOfOwner(address owner) external view returns (uint256[] memory) {
        return bondsOfOwner[owner];
    }

    function getBondsOfOwner(address owner) external view returns (Bond[] memory) {
        uint256[] memory indexes = bondsOfOwner[owner];
        Bond[] memory _bonds = new Bond[](indexes.length);
        for (uint256 i = 0; i < indexes.length; i++) {
            _bonds[i] = bonds[indexes[i]];
        }
        return _bonds;
    }
}
