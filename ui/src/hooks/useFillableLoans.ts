import contracts from "../config/contracts";
import demo from "../config/demo";
import { Order } from "../types/Order";
import decodeOrder from "../utils/decodeOrder";

const useFillableLoans =  () => {
    const stringifiedOrders = localStorage.getItem(`orders-${contracts.bonding}-${demo.demoChainID}`);
    const encodedOrderArray = stringifiedOrders ? JSON.parse(stringifiedOrders) : [];

    console.log("encodedOrders");
    console.log(encodedOrderArray);

    // const openOrders: Order[] = [];
    const openOrders: Order[] = encodedOrderArray.map((encodedOrder: string) => {
        // @ts-ignore
        return decodeOrder(encodedOrder.encodedOrder);
    });

    return openOrders;
}

export default useFillableLoans;