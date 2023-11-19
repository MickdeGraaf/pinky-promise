import { useContractRead } from "wagmi";
import FulfillerABI from "../abis/Fulfiller.json";
import contracts from "../config/contracts";
import demo from "../config/demo";
import { Order } from "../types/Order";

const useExpiredLoans = () => {

    // abi: BondingABI,
    // address: contracts.bonding as `0x${string}`,
    // chainId: contracts.bondingChainId,
    // functionName: "fetchBond",
    // args: [bondId],
    // watch: true,
    const data = useContractRead({
        abi: FulfillerABI,
        // @ts-ignore
        address: contracts.fulfillers[demo.demoChainID],
        chainId: demo.demoChainID,
        functionName: "getOutstandingOrderStructs",
        args: [],
        watch: true,
    });

//     amount: 1000000000000000n,
//   bondId: 0n,
//   fulfillDeadline: 1700365500n,
//   recipient: "0x89d7066eAe04c42698117919BCd38699e71e546a",
//   repayDeadline: 1700365560n,
//   token: "0x0000000000000000000000000000000000000000",
// };

// @ts-ignore
    const orders: Order[] = data.data ? data.data.map((item: any): Order => {
        return {
            bondId: item.bondId,
            chainId: demo.demoChainID,
            recipient: item.recipient,
            token: item.token,
            amount: item.amount,
            repayAmount: item.amount,
            fulfillDeadline: item.fulfillDeadline,
            repayDeadline: item.repayDeadline,
        }
    }) : [];

    console.log(data);

    return orders;
}

export default useExpiredLoans;