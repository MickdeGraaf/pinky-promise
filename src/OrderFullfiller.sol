// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract OrderFullfiller {
    function createOrder() external {}

    function isRepaid(uint256 orderId) external view returns (bool) {
        return true;
    }

    function repay(uint256 orderId) external {}
}
