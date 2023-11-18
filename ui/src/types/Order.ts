export interface Order {
    bondId: number;
    chainId: number;
    fulfillerAddress: string;
    recipient: string;
    token: string;
    amount: bigint;
    repayAmount: bigint;
    fulfillDeadline: number;
    repayDeadline: number;
}