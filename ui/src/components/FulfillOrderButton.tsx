import { Button } from "@chakra-ui/button";
import { Order } from "../types/Order";
import { useAccount, useNetwork } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { switchNetwork, writeContract } from "@wagmi/core";
import contracts from "../config/contracts";
import { parseEther } from "viem";

interface FulfillOrderProps {
    order: Order;

}

const FulfillOrder = ({ order }: FulfillOrderProps) => {
    const { address, isConnecting, isDisconnected } = useAccount()
    const connectModal = useConnectModal();
    const { chain, chains } = useNetwork();

    const handleFulfillOrder = async () => {
        if (!address) {
            if (typeof connectModal == undefined) {
                return;
            }
            // @ts-ignore
            connectModal.openConnectModal();
            return;
        }

        // Check if connected to correct network if not switch network
        if (chain?.id != order.chainId) {
            await switchNetwork({
                chainId: order.chainId,
            });
        }

        // @ts-ignore
        const targetContract = contracts.fulfillers[order.chainId];

        if(!targetContract) {
            alert("No fulfiller contract found for chain id: " + order.chainId)
            return;
        }

        // const tx = await writeContract({
        //     address: targetContract,
        //     chainId: order.chainId,
        //     value: parseEther(order.amount),
        // });
    }

    return (
        <Button>
            Fulfill Order
        </Button>
    )
}


export default FulfillOrder;