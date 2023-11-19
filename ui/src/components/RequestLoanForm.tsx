import { CardBody, CardHeader } from "@chakra-ui/card";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Heading } from "@chakra-ui/layout";
import ChainSelector from "./ChainSelector";
import { Select } from "@chakra-ui/select";
import { Button } from "@chakra-ui/button";
import { useState } from "react";
import { set } from "lodash";
import encodeOrder from "../utils/encodeOrder";
import useFormattedBond from "../hooks/useFormattedBond";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import hashOrder from "../utils/hashOrder";
import { signMessage } from "@wagmi/core";
import contracts from "../config/contracts";

interface RequestLoanFormProps {
  bondId: number;
}

const RequestLoanForm = ({ bondId }: RequestLoanFormProps) => {
  const [token, setToken] = useState<string>("0x0000000000000000000000000000000000000000");
  const [amount, setAmount] = useState<string>("");
  const [repayAmount, setRepayAmount] = useState<string>("");
  const [fulfillDeadline, setFulfillDeadline] = useState<string>("");
  const [repayDeadline, setRepayDeadline] = useState<string>("");

  const account = useAccount();

  const formattedBond = useFormattedBond(bondId);

  const handleTokenChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setToken(e.target.value);
  };

  const handleAmountChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setAmount(e.target.value);
  }

  const handleRepayAmountChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setRepayAmount(e.target.value);
  }

  const handleFulfillDeadlineChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setFulfillDeadline(e.target.value);
  }

  const handleRepayDeadlineChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setRepayDeadline(e.target.value);
  }

  const handleRequestLoan = async () => {
    if(!formattedBond) {
      return;
    }

    const order = {
      bondId: bondId,
      chainId: formattedBond.destinationChainId,
      recipient: account.address || "0x0000000000000000000000000000000000000000",
      token: token,
      amount: parseEther(amount),
      repayAmount: parseEther(repayAmount),
      fulfillDeadline: Math.floor((new Date(fulfillDeadline)).getTime() / 1000),
      repayDeadline: Math.floor((new Date(repayDeadline)).getTime() / 1000),
    }

    const encodedOrder = encodeOrder(order);
    const orderHash = hashOrder(order);

    let signature: `0x${string}`;

    try {
      signature = await signMessage({
      message: orderHash
    })
    } catch(e) {
      signature = "0x0000000";
      return;
    };

    // Post to orderbook
    // fetch current orders for this bonding contract for dest chain
    const localOrders = localStorage.getItem(`orders-${contracts.bonding}-${formattedBond.destinationChainId}`);
    
    let orderArray = [];
    if(localOrders) {
      orderArray = JSON.parse(localOrders);
    }

    orderArray.push({
      encodedOrder
    });

    localStorage.setItem(`orders-${contracts.bonding}-${formattedBond.destinationChainId}`, JSON.stringify(orderArray));
  }


  return (
    <>
      <CardHeader>
        <Heading size="md">Request Loan</Heading>
      </CardHeader>
      <CardBody>
        <FormControl mb={3}>
          <FormLabel>Token</FormLabel>
          {/* <Select>
            <option value="ETH">ETH</option>
            <option value="DAI">DAI</option>
            <option value="USDC">USDC</option>
          </Select> */}
          <Input onChange={handleTokenChange} value={token} type="text" />
        </FormControl>

        <FormControl mb={3}>
          <FormLabel>Amount</FormLabel>
          <Input type="text" onChange={handleAmountChange} value={amount} />
        </FormControl>

        <FormControl mb={3}>
          <FormLabel>RepayAmount</FormLabel>
          <Input type="text" onChange={handleRepayAmountChange} value={repayAmount} />
        </FormControl>

        <FormControl mb={3}>
          <FormLabel>Fulfill deadline</FormLabel>
          <Input
            placeholder="Select Date and Time"
            size="md"
            type="datetime-local"
            onChange={handleFulfillDeadlineChange}
            value={fulfillDeadline}
          />
        </FormControl>

        <FormControl mb={3}>
          <FormLabel>Repay deadline</FormLabel>
          <Input
            placeholder="Select Date and Time"
            size="md"
            type="datetime-local"
            onChange={handleRepayDeadlineChange}
            value={repayDeadline}
          />
        </FormControl>

        <Button width={"100%"} size={"lg"} onClick={handleRequestLoan}>
            Request Loan
        </Button>
      </CardBody>
    </>
  );
};

export default RequestLoanForm;
