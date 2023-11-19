import { keccak256 } from "viem";
import { Order } from "../types/Order";
import encodeOrder from "./encodeOrder"

export default (order: Order) => {
    const encodedOrder = encodeOrder(order);
    // hash order
    return keccak256(encodedOrder);
}