export interface Order {
    bondId: number;
    chainId: number;
    recipient: string;
    token: string;
    amount: bigint;
    repayAmount: bigint;
    fulfillDeadline: number;
    repayDeadline: number;
}