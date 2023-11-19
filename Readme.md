# PinkyPromise 🤙

Cross chain p2p lending for any asset on any chain using a decentralised promise based system and orderbook and secured by the ethereum mainnet we all know and trust


Cross chain p2p lending for any asset on any chain. It works by a promisor providing collateral on ethereum mainnet and instantly getting liquidity on another chain provided by an order fullfiler. The promisor deposits his collateral as a pinky promise that the loan on the destination chain will be repaid. If it isnt, the promisor will risk losing his pinky. 
Once the promisor has deposited his bonded collateral, a order can be posted to the order book requesting liquidity on any chain. This is where the order fulfillers come in. The order fulfiller is the person that will check the order intent of the promisor, his bond for it and will chose to provide liquidity for him on the desired chain. 
Once the promisor's order has been fulfilled on the destination chain, the promisor can use it do anything as long as he pays back in time. There's a repay deadline agreed upon these 2 entities which the promisor must comply (if he doesnt he gets slashed - aka loses his bond). 
When the promisor pays back his loan, he can trigger a cooldown period. During this time, anyone (aka verifiers) can dispute the withdrawal of his bond (saying he didnt pay back on the destination chain). If no one disputes it during the cooldown period, the promisor can withdraw his collateral or keep the bond there for future orders.
In the case someone tries to act maliciously (promisor not repaying and trying to withdraw or promisor has repaid and verifiers are saying he didnt), the verifiers will come in and initiate a discussion period. 
This period is defined by the verifiers and the promisor (or other entities on his behalf) seeing who's right (verifying the promisor has paid back or not). Both sides entering this discussion will have to lock in an amount of money. Once, the verification has been made, the locked amount is distributed to the party that was telling the truth.

The promises are bonded on Ethereum and arbitration is done through the UMA optimistic oracle using a Bonding smart contract which you can find in our smart contract repository and deployed at https://goerli.etherscan.io/address/0x44f93bd5b0b7de8c19fec38bd4afb9a2541ff898 . This contract is in charge of escrowing the promisor's collateral and scaling disputes to UMA if there are disagreements.

Offchain signed orders are submitted to the orderbook which currently runs locally but the goal is to use a data availability layer like Celestia.

On the destination chain, orders are settled using the OrderFulfiller which can be found in our repository and deployed on multiple places including here: https://testnet-zkevm.polygonscan.com/address/0x2fedc1e12f137982d3d4f3e07ef8a2a480f7b35e. This contract is in charge of managing every order, repayments, listing out valid and outstanding orders which can be used to do verifications in case there are any disputes.

The frontend is built in react using tools such as: wagmi, rainbowkit, viem, chakra-ui. It currently runs all of the functionality for demonstration purposes but some specialised roles would be run by specialised scripts/nodes in production.
For example, the verification process and discussions can be improved by running a bot to check for outstanding loans and getting the penalty rewards.

```
forge create --rpc-url <rpc> --private-key <pk> src/Bonding.sol:Bonding --verify --etherscan-api-key <key> —constructor-args <oov3>
```

```
OrderFulfiller
forge create --rpc-url <rpc> --private-key <pk> src/OrderFulfiller.sol:Orderfulfiller --verify --etherscan-api-key <key>
```
