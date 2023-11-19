import { Button } from "@chakra-ui/button";
import { Order } from "../types/Order";
import { useAccount, useNetwork } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import contracts from "../config/contracts";
import { switchNetwork, writeContract } from "@wagmi/core";
import BondingABI from "../abis/Bonding.json";

const DisputeOrderButton = ({ order }: { order: Order }) => {
    const { address, isConnecting, isDisconnected } = useAccount()
    const connectModal = useConnectModal();
    const { chain, chains } = useNetwork();

    const handleDisputeOrder = async () => {
        // Open connect modal if not connected
        if (!address) {
            if (typeof connectModal == undefined) {
                return;
            }
            // @ts-ignore
            connectModal.openConnectModal();
            return;
        }

        // Check if connected to correct network if not switch network
        if (chain?.id != contracts.bondingChainId) {
            await switchNetwork({
                chainId: contracts.bondingChainId,
            });
        }

        // Do dispute tx

        // function callBS(uint256 bondId, uint256 amount) external

        const tx = await writeContract({
            // address: contracts.bonding as `0x${string}`,
            address: "0xDbf03aD3D8eD9d83E1381F72d7025E4174c5C69D",
            abi: BondingABI,
            functionName: "callBS", // TODO dispute function
            args: [
                order.bondId,
                order.amount
            ],
            chainId: contracts.bondingChainId,
            value: order.amount
        })

        alert("Dispute tx sent: " + tx.hash)

    }
    return (
        <Button onClick={handleDisputeOrder}>
            Dispute Order
        </Button>
    )
}

export default DisputeOrderButton;