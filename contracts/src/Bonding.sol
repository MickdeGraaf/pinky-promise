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
    mapping(address => uint256[]) public bondsOfOwner;

    // yes no idetifier
    bytes32 identifier = bytes32("YES_OR_NO_QUERY");
    // Create an Optimistic oracle instance at the deployed address on Görli.
    // OptimisticOracleV2Interface public oo;
    //bondId => timestamp
    mapping(uint256 => uint256) public cooldownEnd;
    //bondId => is dispute successful
    mapping(uint256 => bool) public isBlocked;

    modifier onlyOwner(uint256 bondId) {
        require(msg.sender == bonds[bondId].owner, "Bonding: not owner");
        _;
    }

    // // todo: this is passed in the deployer script
    // // Create an Optimistic Oracle V3 instance at the deployed address on Görli.
    // OptimisticOracleV3Interface oov3 = OptimisticOracleV3Interface(0x9923D42eF695B5dd9911D05Ac944d4cAca3c4EAB);
    //
    // constructor(address _oo) {
    //     oo = OptimisticOracleV3Interface(_oo);
    // }

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

        // settleAndGetDisputorResult();

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

    // /// @dev disputes the fact that the user has paid back the order fulfiller
    // function callBS(uint256 bondId) external {
    //     require(cooldownEnd[bondId] > block.timestamp, "Bonding: not in cooldown");
    //     _assertTruth();
    //     isBlocked[bondId] = true;
    // }
    //
    // function _getBSCallingAncillaryData(uint256 bondId) external returns (bytes memory bsCallingAncillaryData) {
    //     Bond storage bond = bonds[bondId];
    //
    //     (address addressOnDestChain, address, uint256, uint256 chainId, address orderFulfillerAddress) =
    //         abi.decode(bond.verifier, (address, address, uint256, uint256, address));
    //     // Bonding bscaller is arguing the promisor hasnt paid back the order fulfiller.
    //     // If he hasnt, this statement returns true.
    //     bsCallingAncillaryData = bytes(
    //         "Function call isOutstanding(%s) from contract with address %s on chain %s is returning true.",
    //         bondId,
    //         orderFulfillerAddress,
    //         chainId
    //     );
    // }
    //
    // // Asserted claim. This is some truth statement about the world and can be verified by the network of disputers.
    // // bytes public assertedClaim =
    //
    // // Each assertion has an associated assertionID that uniquly identifies the assertion. We will store this here.
    // // bytes32 public assertionId;
    //
    // // todo: set custom token, custom amounts, custom dispute time. We will have to pull funds from bscaller
    // // This is called by the bscaller. He will have to lock an amount to open the bscalling.
    // // if no one disputes back, the bscaller will receive the bond money plus the promisor money
    // // Assert the truth against the Optimistic Asserter. This uses the assertion with defaults method which defaults
    // // all values, such as a) challenge window to 120 seconds (2 mins), b) identifier to ASSERT_TRUTH, c) bond currency
    // //  to USDC and c) and default bond size to 0 (which means we dont need to worry about approvals in this example).
    // function _assertTruth(uint256 bondId) internal {
    //     assertedClaim = _getBSCallingAncillaryData(bondId);
    //     assertionId = oov3.assertTruthWithDefaults(assertedClaim, address(this));
    // }
    //
    // // this is called by the promisor. He will have the bscaller's bond money if the promisor has in fact paid back the order fulfiller.
    // function dispute() external {
    //     // todo: where is this function in the oov3?
    // }
    //
    // // This is called by the withdraw function and by the bscaller to claim his rewards.
    // // It reverts if there's a dispute in place or if the dispute period has not passed.
    // // If there's no dispute, it will give the money to the bscaller.
    // function settleAndGetBSCallerResult() public returns (bool) {
    //     return oov3.settleAndGetAssertionResult(assertionId);
    // }
    //
    // // Just return the assertion result. Can only be called once the assertion has been settled.
    // function getBSCallerResult() public view returns (bool) {
    //     return oov3.getAssertionResult(assertionId);
    // }
    //
    // //Return the dispution result
    // function getBSCallingResult() public view returns (OptimisticOracleV3Interface.Assertion memory) {
    //     return oov3.getAssertion(assertionId);
    // }

}
