import useBond from "./useBond";
import { decodeAbiParameters } from "viem";

const useFormattedBond = (bondId: number) => {
    const bondData = useBond(Number(bondId));

    const bond = bondData.data ? {
        id: Number(bondId),
        // @ts-ignore
        amount: bondData.data.amount,
        // @ts-ignore
        cooldownDuration: bondData.data.cooldownDuration,
        // @ts-ignore
        destinationChainId: Number(decodeAbiParameters([{ name: "x", type: "uint256" }, { name: "y", type: "address" }], bondData.data.verifier)[0]),
        // @ts-ignore
        token: bondData.data.token,
    } : undefined;

    return bond;
}

export default useFormattedBond;