import { useContractRead } from "wagmi"

// @ts-ignore
import FulfillerABI from "../abi/Fulfiller.json"
import contracts from "../config/contracts";
import demo from "../config/demo";


const useOpenLoans = () => {
    // const data = useContractRead({
    //     abi: FulfillerABI,
    //     // @ts-ignore
    //     address: contracts.fulfillers[demo.demoChainID],
    //     chainId: demo.demoChainID,

    // });

}