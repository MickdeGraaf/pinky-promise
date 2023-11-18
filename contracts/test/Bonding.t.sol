// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import {Bonding} from "../src/Bonding.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BondingTestMainnet is Test {
    Bonding public bonding;
    address public user1 = address(0x1);
    address public user2 = address(0x2);
    address public user3 = address(0x3);

    //weth on mainnet
    address public weth = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    uint256 AMOUNT = 1e18;

    function setUp() public {
        string memory MAINNET_RPC_URL = vm.envString("MAINNET_RPC_URL");
        vm.createSelectFork(MAINNET_RPC_URL);
        bonding = new Bonding();
    }

    function testCreateBonding() public {
        deal(weth, user1, AMOUNT);
        assertEq(bonding.getBondsLength(), 0);
        assertEq(IERC20(weth).balanceOf(user1), AMOUNT);

        vm.startPrank(user1);
        IERC20(weth).approve(address(bonding), AMOUNT);
        bonding.createBond(
            user1,
            weth,
            AMOUNT,
            1 hours,
            bytes(""), //mock verifier
            0, //mock disputeAmount
            0 //mock disputeLiveness
        );
        vm.stopPrank();

        assertEq(bonding.getBondsLength(), 1);
        assertEq(IERC20(weth).balanceOf(address(bonding)), AMOUNT);
        assertEq(IERC20(weth).balanceOf(user1), 0);
        assertFalse(bonding.isCooldown(bonding.getBondsLength() - 1));
        (
            address _owner,
            address _token,
            uint256 _amount,
            uint256 _cooldownDuration,
            bytes memory _verifier,
            uint256 _disputeAmount,
            uint256 _disputeLiveness
        ) = bonding.bonds(bonding.getBondsLength() - 1);
        assertEq(_owner, user1);
        assertEq(_token, weth);
        assertEq(_amount, AMOUNT);
        assertEq(_cooldownDuration, 1 hours);
        assertEq(_disputeAmount, 0);
        assertEq(_disputeLiveness, 0);
    }

    function testCreateBondingNativeToken() public {
        deal(user1, AMOUNT);
        assertEq(bonding.getBondsLength(), 0);
        assertEq(user1.balance, AMOUNT);

        vm.startPrank(user1);
        IERC20(weth).approve(address(bonding), AMOUNT);
        address(bonding).call{value: AMOUNT}(
            abi.encodeWithSelector(
                bonding.createBond.selector,
                user1,
                address(0),
                AMOUNT,
                1 hours,
                bytes(""), //mock verifier
                0, //mock disputeAmount
                0 //mock disputeLiveness
            )
        );
        vm.stopPrank();

        assertEq(bonding.getBondsLength(), 1);
        assertEq(address(bonding).balance, AMOUNT);
        assertEq(user1.balance, 0);
        (
            address _owner,
            address _token,
            uint256 _amount,
            uint256 _cooldownDuration,
            bytes memory _verifier,
            uint256 _disputeAmount,
            uint256 _disputeLiveness
        ) = bonding.bonds(bonding.getBondsLength() - 1);
        assertEq(_owner, user1);
        assertEq(_token, address(0));
        assertEq(_amount, AMOUNT);
        assertEq(_cooldownDuration, 1 hours);
        assertEq(_disputeAmount, 0);
        assertEq(_disputeLiveness, 0);
    }

    function testTriggerCooldown() public {
        deal(weth, user1, AMOUNT);
        assertEq(bonding.getBondsLength(), 0);
        assertEq(IERC20(weth).balanceOf(user1), AMOUNT);

        vm.startPrank(user1);
        IERC20(weth).approve(address(bonding), AMOUNT);
        bonding.createBond(
            user1,
            weth,
            AMOUNT,
            1 hours,
            bytes(""), //mock verifier
            0, //mock disputeAmount
            0 //mock disputeLiveness
        );

        vm.expectRevert();
        bonding.withdraw(0);

        bonding.triggerCooldown(0);

        vm.expectRevert();
        bonding.withdraw(0);

        skip(1 hours + 1);

        bonding.withdraw(0);
        vm.stopPrank();

        assertEq(IERC20(weth).balanceOf(user1), AMOUNT);
        assertEq(IERC20(weth).balanceOf(address(bonding)), 0);
    }
}
