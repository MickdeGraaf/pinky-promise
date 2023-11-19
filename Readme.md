# PinkyPromise 🤙

Cross chain loans using arbitrary promises on top of UMA

## Problem

Market makers and solvers (promisers) need immediate liquidity across a wide range of layer 1s and 2s which requires them to have directional exposure and is capital intensive.

Holders of tokens can often not earn a good yield and the commitment of staking is long term or not available for a lot of tokens.


## Solution

PinkyPromise allows market makers and solvers to enter commitments and loans using a single collateral on a single chain. Allowing them to access instant liquidity to fulfill intents and market make on any chain.


## Mechanism

### Bonds

On Ethereum mainnet a Promisor locks a bond.


```solidity
function bond(
    address token, // token being bonded (0x00000....0000) for ETH
    uint256 amount, 
    uint256 cooldownDuration, // How long withdraw can be contested
    bytes calldata verifier, // Pointer to verifier and parameters to run it with
    uint256 disputBondAmount,
    uint256 disputeLiveness,
    
)
```


When the `promisor` wants to unbond they need to enter the cooldown period in which `hunters` can submit a payload to dispute a bond. The payload is run against the verifier which returns either ``true`` or ``false``

## Orders

On the chain where the asset is borrowed lenders can fill loan requests. Or execute signed fills on behalf of lenders

```solidity
struct Order {
    address maker;
    address taker;
    address token;
    uint256 amount;
    uint256 repayAmount;
    uint256 validTill;
    uint256 expiration;
}
````
```solidity 
struct SignedOrder {
    Order order;
    bytes signature;
}
```

```solidity 
function fullFillOrder(SignedOrder calldata order) external payable;

```


```solidity
function fullFillWithSignature(SignedOrder calldata order, SignedFulfillment fulfillment) external
```
