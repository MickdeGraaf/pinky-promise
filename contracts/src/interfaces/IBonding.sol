// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {OptimisticOracleV3Interface} from "./OptimisticOracleV3Interface.sol";

interface IBonding {
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

    struct BSCall {
        address bsCaller; // address of the bscaller
        address token; // token the bscaller locks to callBS
        uint256 amount; // amount the bscaller locks to callBS
        uint256 bondId; // bondId the bscaller is calling BS on
        uint256 time;
    }

    event EnterCooldown(uint256 bondId, uint256 cooldownEnd);

    function createBond(
        address owner,
        address token,
        uint256 amount,
        uint256 cooldownDuration,
        bytes memory verifier,
        uint256 disputeAmount,
        uint256 disputeLiveness
    ) external payable;

    function isCooldown(uint256 bondId) external view returns (bool);

    function triggerCooldown(uint256 bondId) external;

    function withdraw(uint256 bondId) external;

    function getBondsLength() external view returns (uint256);

    /// @dev disputes the fact that the user has paid back the order fulfiller
    function callBS(uint256 bondId, uint256 amount) external;

    // this is called by the promisor. He will have the bscaller's bond money if the promisor has in fact paid back the order fulfiller.
    function dispute(uint256 bondId) external;

    // This is called by the withdraw function and by the bscaller to claim his rewards.
    // It reverts if there's a dispute in place or if the dispute period has not passed.
    // If there's no dispute, it will give the money to the bscaller.
    function settleAndGetBSCallerResult(uint256 bondId) external returns (bool successful);

    // Just return the assertion result. Can only be called once the assertion has been settled.
    function getBSCallerResult(uint256 bondId) external view returns (bool);

    //Return the dispution result
    function getBSCallingResult(uint256 bondId) external view returns (OptimisticOracleV3Interface.Assertion memory);

    function getBondIndexesOfOwner(address owner) external view returns (uint256[] memory);

    function getBondsOfOwner(address owner) external view returns (Bond[] memory bonds_, uint256[] memory indexes_);

    function fetchBond(uint256 bondId) external view returns (Bond memory);
}
