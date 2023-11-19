// export default (order: Order) => {
//     const encodedOrder = encodeAbiParameters(
//         [
//             { name: "bondId", type: "uint256" },
//             { name: "chainId", type: "uint256" },
//             { name: "recipient", type: "address" },
//             { name: "token", type: "address" },
//             { name: "amount", type: "uint256" },
//             { name: "repayAmount", type: "uint256" },
//             { name: "fulfillDeadline", type: "uint256" },
//             { name: "repayDeadline", type: "uint256" },
//         ], [
//             BigInt(order.bondId),
//             BigInt(order.chainId),
//             order.recipient as `0x${string}`,
//             order.token as `0x${string}`,
//             order.amount,
//             order.repayAmount,
//             BigInt(order.fulfillDeadline),
//             BigInt(order.repayDeadline),
//         ]);

import { decodeAbiParameters } from "viem"
import { Order } from "../types/Order"

//         return encodedOrder;
// }

export default (encodedOrder: string) => {
    const decodedOrder = decodeAbiParameters(
        [
            { name: "bondId", type: "uint256" },
            { name: "chainId", type: "uint256" },
            { name: "recipient", type: "address" },
            { name: "token", type: "address" },
            { name: "amount", type: "uint256" },
            { name: "repayAmount", type: "uint256" },
            { name: "fulfillDeadline", type: "uint256" },
            { name: "repayDeadline", type: "uint256" },
        ],
        encodedOrder as `0x${string}`
    )

    const typedOrder: Order = {
        bondId: Number(decodedOrder[0]),
        chainId: Number(decodedOrder[1]),
        recipient: decodedOrder[2],
        token: decodedOrder[3],
        amount: BigInt(decodedOrder[4]),
        repayAmount: BigInt(decodedOrder[5]),
        fulfillDeadline: Number(decodedOrder[6]),
        repayDeadline: Number(decodedOrder[7]),
    }

    return typedOrder;
}