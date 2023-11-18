// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract OrderFulfiller {
    struct Order {
        uint256 bondId;
        address recipient;
        address token; // address(0) for Native on dest chain
        uint256 amount;
    }

    Order[] public orders;

    // bond id => order id
    mapping(uint256 => uint256) public bondIdToOrderId;
    // bond id => fulfilled
    mapping(uint256 => bool) public orderFulfilled;
    // order id => repaid
    mapping(uint256 => bool) public orderRepaid;

    /// @dev fulfills the order
    function createOrder(uint256 bondId, address recipient, address token, uint256 amount) external payable {
        require(!orderFulfilled[bondId], "OrderFulfiller: order already fulfilled");

        Order storage order = orders.push();

        order.bondId = bondId;
        order.recipient = recipient;
        order.token = token;
        order.amount = amount;

        bondIdToOrderId[bondId] = orders.length - 1;
        orderFulfilled[bondId] = true;

        if (address(token) == address(0)) {
            // Native
            require(msg.value == amount, "OrderFulfiller: ETH amount mismatch");
            payable(recipient).transfer(msg.value);
        } else {
            SafeERC20.safeTransferFrom(IERC20(token), msg.sender, address(this), amount);
            SafeERC20.safeTransferFrom(IERC20(token), address(this), recipient, amount);
        }
    }

    function repay(uint256 bondId) external payable {
        require(orderFulfilled[bondId], "OrderFulfiller: order not fulfilled");
        require(!orderRepaid[bondId], "OrderFulfiller: order already repaid");

        uint256 orderId = bondIdToOrderId[bondId];

        Order storage order = orders[orderId];
        if (address(order.token) == address(0)) {
            // Native
            require(msg.value == order.amount, "OrderFulfiller: ETH amount mismatch");
        } else {
            SafeERC20.safeTransferFrom(IERC20(order.token), msg.sender, address(this), order.amount);
        }
        orderRepaid[bondIdToOrderId[bondId]] = true;
    }
}
