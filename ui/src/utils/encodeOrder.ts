import { encodeAbiParameters } from "viem";
import { Order } from "../types/Order";

export default (order: Order) => {
    const encodedOrder = encodeAbiParameters(
        [
            { name: "bondId", type: "uint256" },
            { name: "chainId", type: "uint256" },
            { name: "recipient", type: "address" },
            { name: "token", type: "address" },
            { name: "amount", type: "uint256" },
            { name: "repayAmount", type: "uint256" },
            { name: "fulfillDeadline", type: "uint256" },
            { name: "repayDeadline", type: "uint256" },
        ], [
            BigInt(order.bondId),
            BigInt(order.chainId),
            order.recipient as `0x${string}`,
            order.token as `0x${string}`,
            order.amount,
            order.repayAmount,
            BigInt(order.fulfillDeadline),
            BigInt(order.repayDeadline),
        ]);

        return encodedOrder;
}