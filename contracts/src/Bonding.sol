// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {OptimisticOracleV3Interface} from "./interfaces/OptimisticOracleV3Interface.sol";

contract Bonding {
    // struct Verifier {
    //     address addressOnDestChain;
    //     address tokenOnDestChain; // address(0) for Native on dest chain
    //     uint256 value;
    //     uint256 chainId;
    //    address orderFulfillerAddress;
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

    uint256 public constant MIN_LIVENESS = 1 minutes;
    uint256 public constant MAX_LIVENESS = 10 minutes ;

    bytes32 public constant defaultIdentifier = "ASSERT_TRUTH";
    // Create an Optimistic oracle instance at the deployed address on Görli.
    OptimisticOracleV3Interface public oo;
    //bondId => timestamp
    mapping(uint256 => uint256) public cooldownEnd;
    //bondId => is dispute successful
    mapping(uint256 => bool) public isBlocked;

    modifier onlyOwner(uint256 bondId) {
        require(msg.sender == bonds[bondId].owner, "Bonding: not owner");
        _;
    }

    // todo: this is passed in the deployer script
    // Create an Optimistic Oracle V3 instance at the deployed address on Görli.
    OptimisticOracleV3Interface oov3 = OptimisticOracleV3Interface(0x9923D42eF695B5dd9911D05Ac944d4cAca3c4EAB);

    constructor(address _oo) {
        oo = OptimisticOracleV3Interface(_oo);
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

        settleAndGetDisputorResult();

        require(!isBlocked[bondId], "Bonding: dispute in progress");
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

    /// @dev disputes the fact that the user has paid back the order fulfiller
    function callBS(uint256 bondId, address token, uint256 amount, uint256 liveness) external {
        require(!isBlocked[bondId], "Bonding: BSCalling already in progress");
        require(liveness > MIN_LIVENESS && liveness < MAX_LIVENESS, "Bonding: invalid liveness");
        uint256 minAmount = oov3.getMinimumBond(token);
        require(amount >= minAmount, "Bonding: amount too low");
        SafeERC20.safeTransferFrom(IERC20(token), msg.sender, address(this), amount);
        SafeERC20.safeApprove(IERC20(token), address(oov3), amount);

        _assertTruth(bondId, token, amount, liveness);
        isBlocked[bondId] = true;
    }

    function _getBSCallingAncillaryData(uint256 bondId) internal returns (bytes memory bsCallingAncillaryData) {
        Bond storage bond = bonds[bondId];

        (address addressOnDestChain, /* address */, /* uint256 */, uint256 chainId, address orderFulfillerAddress) =
            abi.decode(bond.verifier, (address, address, uint256, uint256, address));
        // Bonding bscaller is arguing the promisor hasnt paid back the order fulfiller.
        // If he hasnt, this statement returns true.
        bsCallingAncillaryData = bytes(
            "Function call isOutstanding(%s) from contract with address %s on chain %s is returning true.",
            bondId,
            orderFulfillerAddress,
            chainId
        );
    }

    // todo: set custom token, custom amounts, custom dispute time. We will have to pull funds from bscaller
    // This is called by the bscaller. He will have to lock an amount to open the bscalling.
    // if no one disputes back, the bscaller will receive the bond money plus the promisor money
    function _assertTruth(uint256 bondId, address token, uint256 liveness) internal {
        assertedClaim = _getBSCallingAncillaryData(bondId);
        // assertionId = oov3.assertTruthWithDefaults(assertedClaim, address(this));

        oov3.assertTruth(
                assertedClaim,
                asserter, // asserter
                address(0), // callbackRecipient
                address(0), // escalationManager
                liveness,
                IERC20(token),
                amount,
                defaultIdentifier,
                bytes32(0)
            );
    }

    // this is called by the promisor. He will have the bscaller's bond money if the promisor has in fact paid back the order fulfiller.
    function dispute() external {
        // todo: where is this function in the oov3?
    }

    // This is called by the withdraw function and by the bscaller to claim his rewards.
    // It reverts if there's a dispute in place or if the dispute period has not passed.
    // If there's no dispute, it will give the money to the bscaller.
    function settleAndGetBSCallerResult(uint256 bondId) public returns (bool successful) {
        successful = oov3.settleAndGetAssertionResult(assertionId);
        if(successful) {
          //todo: get money from oov3
          //todo: give money to bscaller
        }
        else{ isBlocked[bondId] = false;
          //todo: get money back from oov3
          //todo: give money back to bscaller disputor 
        }
    }

    // Just return the assertion result. Can only be called once the assertion has been settled.
    function getBSCallerResult() public view returns (bool) {
        return oov3.getAssertionResult(assertionId);
    }

    //Return the dispution result
    function getBSCallingResult() public view returns (OptimisticOracleV3Interface.Assertion memory) {
        return oov3.getAssertion(assertionId);
    }
}
