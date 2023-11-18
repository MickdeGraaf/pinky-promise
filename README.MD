# Pinky Promise


## Deploy Bonding

```
cd contracts
forge build
forge create --rpc-url [RPC_URL] --private-key [PRIVATE_KEY] src/Bonding.sol:Bonding --verify --etherscan-api-key [ETHERSCAN_API_KEY]
```