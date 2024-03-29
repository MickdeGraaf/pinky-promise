// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {OptimisticOracleV3Interface} from "./interfaces/OptimisticOracleV3Interface.sol";
import {IBonding} from "./interfaces/IBonding.sol";

contract Bonding is IBonding {
    Bond[] public bonds;
    mapping(address => uint256[]) public bondsOfOwner;

    uint64 public constant MIN_LIVENESS = 1 minutes;

    bytes32 public constant defaultIdentifier = "ASSERT_TRUTH";
    // Create an Optimistic oracle instance at the deployed address on Görli.
    OptimisticOracleV3Interface public oov3;
    //bondId => timestamp
    mapping(uint256 => uint256) public cooldownEnd;
    //bondId => is dispute successful
    mapping(uint256 => bool) public isBlocked;
    //bondId => bscall
    mapping(uint256 => BSCall) public bscalls;
    //bondId => bool
    mapping(uint256 => bool) public bscallHasBeenDisputed;

    modifier onlyOwner(uint256 bondId) {
        require(msg.sender == bonds[bondId].owner, "Bonding: not owner");
        _;
    }

    constructor(address _oov3) {
        oov3 = OptimisticOracleV3Interface(_oov3);
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

        if (isBlocked[bondId]) {
            settleAndGetBSCallerResult(bondId);
        }

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
    function callBS(uint256 bondId, uint256 amount) external {
        require(!isBlocked[bondId], "Bonding: BSCalling already in progress");
        address token = bonds[bondId].token;
        uint256 minAmount = oov3.getMinimumBond(token);
        require(amount >= minAmount && amount < bonds[bondId].amount, "Bonding: amount too low");

        SafeERC20.safeTransferFrom(IERC20(token), msg.sender, address(this), amount);
        SafeERC20.safeIncreaseAllowance(IERC20(token), address(oov3), amount);

        _assertTruth(bondId);
        isBlocked[bondId] = true;

        uint64 time = uint64(block.timestamp);
        bscalls[bondId] = BSCall(msg.sender, token, amount, bondId, time);
    }

    function _getBSCallingAncillaryData(uint256 bondId) internal view returns (bytes memory bsCallingAncillaryData) {
        Bond storage bond = bonds[bondId];

        (uint256 chainId, address destinationContractAddress) = abi.decode(bond.verifier, (uint256, address));
        // Bonding bscaller is arguing the promisor hasnt paid back the order fulfiller.
        // If he hasnt, this statement returns true.
        bsCallingAncillaryData = abi.encodePacked(
            "Function call isOutstanding(%s) from contract with address %s on chain %s is returning true.",
            bondId,
            destinationContractAddress,
            chainId
        );
    }

    // This is called by the bscaller. He will have to lock an amount to open the bscalling.
    // if no one disputes back, the bscaller will receive the bond money plus the promisor money
    function _assertTruth(uint256 bondId) internal {
        bytes memory assertedClaim = _getBSCallingAncillaryData(bondId);
        Bond memory bond = bonds[bondId];
        address token = bond.token;
        BSCall memory bscall = bscalls[bondId];

        oov3.assertTruth(
            assertedClaim,
            address(this), // asserter
            address(0), // callbackRecipient
            address(0), // escalationManager
            MIN_LIVENESS,
            IERC20(token),
            bscall.amount,
            defaultIdentifier,
            bytes32(0)
        );
    }

    // this is called by the promisor. He will have the bscaller's bond money if the promisor has in fact paid back the order fulfiller.
    function dispute(uint256 bondId) external {
        require(isBlocked[bondId], "Bonding: no BSCalling in progress");
        Bond memory bond = bonds[bondId];
        BSCall memory bscall = bscalls[bondId];

        SafeERC20.safeIncreaseAllowance(IERC20(bond.token), address(oov3), bscall.amount);
        //this contract is the one holding the promisor's funds. So, this contract disputes the bscaller's claim on behalf of the user.
        oov3.disputeAssertion(_getAssertionId(bondId), address(this));
        bscallHasBeenDisputed[bondId] = true;
    }

    // This is called by the withdraw function and by the bscaller to claim his rewards.
    // It reverts if there's a dispute in place or if the dispute period has not passed.
    // If there's no dispute, it will give the money to the bscaller.
    function settleAndGetBSCallerResult(uint256 bondId) public returns (bool successful) {
        successful = oov3.settleAndGetAssertionResult(_getAssertionId(bondId));
        if (successful) {
            //give money to bscaller
        } else {
            //give bscaller money to promisor
            if (bscallHasBeenDisputed[bondId]) {
                //give bscaller money to promisor plus the amount used to dispute the bscaller
                bonds[bondId].amount += bscalls[bondId].amount * 2;
                bscallHasBeenDisputed[bondId] = false;
            }
            bonds[bondId].amount += bscalls[bondId].amount;
            isBlocked[bondId] = false;
            delete bscalls[bondId];
        }
    }

    // Just return the assertion result. Can only be called once the assertion has been settled.
    function getBSCallerResult(uint256 bondId) public view returns (bool) {
        return oov3.getAssertionResult(_getAssertionId(bondId));
    }

    //Return the dispution result
    function getBSCallingResult(uint256 bondId) public view returns (OptimisticOracleV3Interface.Assertion memory) {
        return oov3.getAssertion(_getAssertionId(bondId));
    }

    function _getAssertionId(uint256 bondId) internal view returns (bytes32) {
        bytes memory assertedClaim = _getBSCallingAncillaryData(bondId);
        BSCall memory bscall = bscalls[bondId];

        return keccak256(
            abi.encode(
                assertedClaim,
                bscall.amount,
                bscall.time,
                MIN_LIVENESS,
                bonds[bondId].token,
                address(0),
                address(0),
                defaultIdentifier,
                address(this)
            )
        );
    }

    function getBondIndexesOfOwner(address owner) external view returns (uint256[] memory) {
        return bondsOfOwner[owner];
    }

    function getBondsOfOwner(address owner) external view returns (Bond[] memory bonds_, uint256[] memory indexes_) {
        uint256[] memory indexes = bondsOfOwner[owner];
        Bond[] memory _bonds = new Bond[](indexes.length);
        for (uint256 i = 0; i < indexes.length; i++) {
            _bonds[i] = bonds[indexes[i]];
        }
        return (_bonds, indexes);
    }

    function fetchBond(uint256 bondId) external view returns (Bond memory) {
        return bonds[bondId];
    }
}
