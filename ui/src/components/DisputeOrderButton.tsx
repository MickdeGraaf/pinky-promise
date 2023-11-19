import { Button } from "@chakra-ui/button";
import { Order } from "../types/Order";
import { useAccount, useNetwork } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import contracts from "../config/contracts";
import { switchNetwork } from "@wagmi/core";

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

    }
    return (
        <Button onClick={handleDisputeOrder}>
            Dispute Order
        </Button>
    )
}

export default DisputeOrderButton;