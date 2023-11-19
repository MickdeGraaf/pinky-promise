import { useContractRead } from "wagmi"

import FulfillerABI from "../abi/Fulfiller.json"

const useOpenLoans = () => {
    const data = useContractRead({
        abi: c
    });

}