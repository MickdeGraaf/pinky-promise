// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import {OrderFulfiller} from "../src/OrderFulfiller.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract OrderFulfillerTestMainnet is Test {
    OrderFulfiller public orderFulfiller;
    address public user1 = address(0x12345);
    address public user2 = address(0x23456);
    address public user3 = address(0x34567);

    //weth on mainnet
    address public weth = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    uint256 AMOUNT = 1e18;

    function setUp() public {
        string memory MAINNET_RPC_URL = vm.envString("MAINNET_RPC_URL");
        vm.createSelectFork(MAINNET_RPC_URL);
        orderFulfiller = new OrderFulfiller();
    }

    function outstadingContains(uint256 bondId) internal view returns (bool) {
        uint256[] memory outstandingOrders = orderFulfiller.getOutstandingOrders();
        for (uint256 i = 0; i < outstandingOrders.length; i++) {
            if (outstandingOrders[i] == bondId) {
                return true;
            }
        }
        return false;
    }

    function testFulfillOrder() public {
        assertEq(orderFulfiller.ordersLength(), 0);
        assertEq(IERC20(weth).balanceOf(user1), 0);
        assertEq(IERC20(weth).balanceOf(user2), 0);

        deal(weth, user1, AMOUNT);
        vm.startPrank(user1);
        IERC20(weth).approve(address(orderFulfiller), AMOUNT);
        orderFulfiller.fulfillOrder(
            user1,
            0, //mock bondId
            user2,
            weth,
            AMOUNT,
            //user has 1 hour to play around
            block.timestamp + 1 hours, //fulfillOrder dealine
            block.timestamp + 2 hours //repay dealine
        );
        vm.stopPrank();

        assertEq(IERC20(weth).balanceOf(user1), 0);
        assertEq(IERC20(weth).balanceOf(address(orderFulfiller)), 0);
        assertEq(IERC20(weth).balanceOf(user2), AMOUNT);
        assertEq(orderFulfiller.ordersLength(), 1);
        assertFalse(outstadingContains(0));

        (
            uint256 bondId,
            address recipient,
            address token, // address(0) for Native on dest chain
            uint256 amount,
            uint256 fulfillDeadline,
            uint256 repayDeadline
        ) = orderFulfiller.orders(0);

        assertEq(bondId, 0);
        assertEq(recipient, user2);
        assertEq(token, weth);
        assertEq(amount, AMOUNT);
        assertApproxEqAbs(fulfillDeadline, block.timestamp + 1 hours, 100);
        assertApproxEqAbs(repayDeadline, block.timestamp + 2 hours, 100);
        assertFalse(orderFulfiller.isOutstanding(0));
        assertFalse(orderFulfiller.orderRepaid(orderFulfiller.bondIdToOrderId(0)));
        assertFalse(outstadingContains(0));
    }

    function testTryFulfillDelayed() public {
        assertEq(orderFulfiller.ordersLength(), 0);
        assertEq(IERC20(weth).balanceOf(user1), 0);
        assertEq(IERC20(weth).balanceOf(user2), 0);

        deal(weth, user1, AMOUNT);
        vm.startPrank(user1);
        IERC20(weth).approve(address(orderFulfiller), AMOUNT);
        vm.expectRevert();
        orderFulfiller.fulfillOrder(
            user1,
            0, //mock bondId
            user2,
            weth,
            AMOUNT,
            //user has 1 hour to play around
            block.timestamp - 1, //fulfillOrder dealine
            block.timestamp + 1 hours //repay dealine
        );
        vm.stopPrank();

        assertEq(IERC20(weth).balanceOf(user1), AMOUNT);
        assertEq(IERC20(weth).balanceOf(address(orderFulfiller)), 0);
        assertEq(IERC20(weth).balanceOf(user2), 0);
        assertEq(orderFulfiller.ordersLength(), 0);
        assertFalse(orderFulfiller.isOutstanding(0));
        assertFalse(orderFulfiller.orderRepaid(orderFulfiller.bondIdToOrderId(0)));
        assertFalse(outstadingContains(0));
    }

    function testRepay() public {
        vm.expectRevert();
        orderFulfiller.repay(0);

        deal(weth, user1, AMOUNT);
        vm.startPrank(user1);
        IERC20(weth).approve(address(orderFulfiller), AMOUNT);
        orderFulfiller.fulfillOrder(
            user1,
            0, //mock bondId
            user2,
            weth,
            AMOUNT,
            //user has 1 hour to play around
            block.timestamp + 1 hours, //fulfillOrder dealine
            block.timestamp + 2 hours //repay dealine
        );
        vm.stopPrank();
        assertFalse(orderFulfiller.orderRepaid(orderFulfiller.bondIdToOrderId(0)));
        assertFalse(orderFulfiller.isOutstanding(0));

        vm.startPrank(user2);
        deal(weth, user2, AMOUNT);
        IERC20(weth).approve(address(orderFulfiller), AMOUNT);
        orderFulfiller.repay(0);
        assertTrue(orderFulfiller.orderRepaid(orderFulfiller.bondIdToOrderId(0)));
        assertFalse(orderFulfiller.isOutstanding(0));

        vm.expectRevert();
        orderFulfiller.repay(0);

        assertEq(IERC20(weth).balanceOf(user1), AMOUNT);
        assertEq(IERC20(weth).balanceOf(address(orderFulfiller)), 0);
        assertEq(IERC20(weth).balanceOf(user2), 0);
        assertTrue(orderFulfiller.orderRepaid(orderFulfiller.bondIdToOrderId(0)));
        assertFalse(outstadingContains(0));
    }

    function testTryRepayDelayed() public {
        vm.expectRevert();
        orderFulfiller.repay(0);
        assertFalse(outstadingContains(0));

        deal(weth, user1, AMOUNT);
        vm.startPrank(user1);
        IERC20(weth).approve(address(orderFulfiller), AMOUNT);
        orderFulfiller.fulfillOrder(
            user1,
            0, //mock bondId
            user2,
            weth,
            AMOUNT,
            //user has 1 hour to play around
            block.timestamp + 1 hours, //fulfillOrder dealine
            block.timestamp + 2 hours //repay dealine
        );
        vm.stopPrank();

        assertFalse(outstadingContains(0));

        skip(2 hours + 1);
        assertTrue(outstadingContains(0));

        vm.startPrank(user2);
        deal(weth, user2, AMOUNT);
        IERC20(weth).approve(address(orderFulfiller), AMOUNT);
        vm.expectRevert();
        orderFulfiller.repay(0);

        assertEq(IERC20(weth).balanceOf(user1), 0);
        assertEq(IERC20(weth).balanceOf(address(orderFulfiller)), 0);
        assertEq(IERC20(weth).balanceOf(user2), AMOUNT);
        assertEq(orderFulfiller.ordersLength(), 1);
        assertFalse(orderFulfiller.orderRepaid(orderFulfiller.bondIdToOrderId(0)));
        assertTrue(orderFulfiller.isOutstanding(0));
        assertTrue(outstadingContains(0));
    }
}
