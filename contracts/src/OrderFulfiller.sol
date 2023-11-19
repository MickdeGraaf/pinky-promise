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
        uint256 fulfillDeadline;
        uint256 repayDeadline;
    }

    Order[] public orders;

    event OrderFulfilled(uint256 bondId, uint256 orderId);

    // bond id => order id
    mapping(uint256 => uint256) public bondIdToOrderId;
    // bond id => fulfilled
    mapping(uint256 => bool) public orderFulfilled;
    // order id => repaid
    mapping(uint256 => bool) public orderRepaid;
    // order id => fullfiller
    mapping(uint256 => address) public orderFulfiller;

    /// @dev fulfills the order
    function fulfillOrder(
        address fulfiller,
        uint256 bondId,
        address recipient,
        address token,
        uint256 amount,
        uint256 fulfillDeadline,
        uint256 repayDeadline
    ) external payable {
        require(fulfillDeadline > block.timestamp, "OrderFulfiller: fulfill deadline in the past");
        require(repayDeadline > fulfillDeadline, "OrderFulfiller: repay deadline before fulfill deadline");
        require(!orderFulfilled[bondId], "OrderFulfiller: order already fulfilled");

        Order storage order = orders.push();

        order.bondId = bondId;
        order.recipient = recipient;
        order.token = token;
        order.amount = amount;
        order.fulfillDeadline = fulfillDeadline;
        order.repayDeadline = repayDeadline;

        orderFulfiller[orders.length - 1] = fulfiller;

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

        emit OrderFulfilled(bondId, orders.length - 1);
    }

    function repay(uint256 bondId) external payable {
        require(
            block.timestamp < orders[bondIdToOrderId[bondId]].repayDeadline, "OrderFulfiller: repay deadline passed"
        );
        require(orderFulfilled[bondId], "OrderFulfiller: order not fulfilled");
        require(!orderRepaid[bondId], "OrderFulfiller: order already repaid");

        uint256 orderId = bondIdToOrderId[bondId];
        address fulfiller = orderFulfiller[orderId];

        Order storage order = orders[orderId];
        if (address(order.token) == address(0)) {
            // Native
            require(msg.value == order.amount, "OrderFulfiller: ETH amount mismatch");
            payable(fulfiller).transfer(msg.value);
        } else {
            SafeERC20.safeTransferFrom(IERC20(order.token), msg.sender, address(this), order.amount);
            SafeERC20.safeTransferFrom(IERC20(order.token), address(this), fulfiller, order.amount);
        }
        orderRepaid[bondIdToOrderId[bondId]] = true;
    }

    function isOutstanding(uint256 bondId) public view returns (bool) {
        return orderFulfilled[bondId] && !orderRepaid[bondId]
            && block.timestamp > orders[bondIdToOrderId[bondId]].repayDeadline;
    }

    function getOutstandingOrders() public view returns (uint256[] memory) {
        uint256 _len = orders.length;
        uint256 _outstandingOrdersLen = 0;
        for (uint256 i = 0; i < _len;) {
            if (isOutstanding(i)) {
                _outstandingOrdersLen++;
            }
            unchecked {
                i++;
            }
        }
        uint256[] memory outstandingOrders = new uint256[](_outstandingOrdersLen);
        _outstandingOrdersLen = 0;
        for (uint256 i = 0; i < _len;) {
            if (isOutstanding(i)) {
                outstandingOrders[_outstandingOrdersLen++] = i;
            }
            unchecked {
                i++;
            }
        }
        return outstandingOrders;
    }

    function getOutstandingOrderStructs() external view returns (Order[] memory) {
        uint256[] memory outstandingOrders = getOutstandingOrders();
        Order[] memory outstandingOrderStructs = new Order[](outstandingOrders.length);
        for (uint256 i = 0; i < outstandingOrders.length;) {
            outstandingOrderStructs[i] = orders[outstandingOrders[i]];
            unchecked {
                i++;
            }
        }
        return outstandingOrderStructs;
    }

    //get orders that are not oustanding and therefore "valid"
    function getValidOrders() public view returns (uint256[] memory){
        uint256 _len = orders.length;
        uint256 _validOrdersLen = 0;
        for (uint256 i = 0; i < _len;) {
            if (!isOutstanding(i)) {
                _validOrdersLen++;
            }
            unchecked {
                i++;
            }
        }
        uint256[] memory validOrders = new uint256[](_validOrdersLen);
        _validOrdersLen = 0;
        for (uint256 i = 0; i < _len;) {
            if (!isOutstanding(i)) {
                validOrders[_validOrdersLen++] = i;
            }
            unchecked {
                i++;
            }
        }
        return validOrders;
    }

    function getValidOrderStructs() external view returns (Order[] memory) {
        uint256[] memory validOrders = getValidOrders();
        Order[] memory validOrderStructs = new Order[](validOrders.length);
        for (uint256 i = 0; i < validOrders.length;) {
            validOrderStructs[i] = orders[validOrders[i]];
            unchecked {
                i++;
            }
        }
        return validOrderStructs;
    }

    function ordersLength() external view returns (uint256) {
        return orders.length;
    }
}
