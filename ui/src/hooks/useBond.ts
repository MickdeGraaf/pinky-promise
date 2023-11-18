import { useContractRead } from "wagmi"
import BondingABI from "../abis/Bonding.json"
import contracts from "../config/contracts"

const useBond = (bondId: number) => {
    const bondData = useContractRead({
        abi: BondingABI,
        address: contracts.bonding as `0x${string}`,
        chainId: contracts.bondingChainId,
        functionName: "bonds",
        args: [bondId],
        watch: true,
    });

    return bondData;
}

export default useBond;