// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IOrderFulfiller {
    struct Order {
        uint256 bondId;
        address recipient;
        address token; // address(0) for Native on dest chain
        uint256 amount;
        uint256 fulfillDeadline;
        uint256 repayDeadline;
    }

    /// @dev Errors
    error FailedDeadline();
    error InvalidDeadline();
    error OrderAlreadyFulfilled();
    error InvalidAmount();
    error OrderNotFulfilled();
    error OrderAlreadyRepaid();

    /// @dev Events
    event OrderFulfilled(uint256 bondId, uint256 orderId);

    /// @dev fulfills the order
    function fulfillOrder(
        address fulfiller,
        uint256 bondId,
        address recipient,
        address token,
        uint256 amount,
        uint256 fulfillDeadline,
        uint256 repayDeadline
    ) external payable;

    function repay(uint256 bondId) external payable;

    function isOutstanding(uint256 bondId) external view returns (bool);

    function getOutstandingOrders() external view returns (uint256[] memory);

    function getOutstandingOrderStructs() external view returns (Order[] memory);

    //get orders that are not oustanding and therefore "valid"
    function getValidOrders() external view returns (uint256[] memory);

    function getValidOrderStructs() external view returns (Order[] memory);

    function ordersLength() external view returns (uint256);
}
