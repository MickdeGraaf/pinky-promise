import { Order } from "../types/Order";

interface OriginalOrder {
  bondId: number;
  chainId: number;
  fulfillerAddress: string;
  recipient: string;
  token: string;
  amount: number;
  repayAmount: number;
  fulfillDeadline: number;
  repayDeadline: number;
}

const convertToOrder = (originalOrder: OriginalOrder): Order => {
  const { fulfillerAddress, ...rest } = originalOrder;
  return {
    ...rest,
    amount: BigInt(originalOrder.amount),
    repayAmount: BigInt(originalOrder.repayAmount),
  };
};

export default convertToOrder;
