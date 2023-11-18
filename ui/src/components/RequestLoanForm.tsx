import { CardBody, CardHeader } from "@chakra-ui/card";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Heading } from "@chakra-ui/layout";
import ChainSelector from "./ChainSelector";
import { Select } from "@chakra-ui/select";
import { Button } from "@chakra-ui/button";

interface RequestLoanFormProps {
  bondId: number;
}

const RequestLoanForm = ({ bondId }: RequestLoanFormProps) => {
  return (
    <>
      <CardHeader>
        <Heading size="md">Request Loan</Heading>
      </CardHeader>
      <CardBody>
        <FormControl mb={3}>
          <FormLabel>Chain</FormLabel>
          <ChainSelector />
        </FormControl>

        <FormControl mb={3}>
          <FormLabel>Token</FormLabel>
          <Select>
            <option value="ETH">ETH</option>
            <option value="DAI">DAI</option>
            <option value="USDC">USDC</option>
          </Select>
        </FormControl>

        <FormControl mb={3}>
          <FormLabel>Amount</FormLabel>
          <Input type="text" />
        </FormControl>

        <FormControl mb={3}>
          <FormLabel>RepayAmount</FormLabel>
          <Input type="text" />
        </FormControl>

        <FormControl mb={3}>
          <FormLabel>Fulfill deadline</FormLabel>
          <Input
            placeholder="Select Date and Time"
            size="md"
            type="datetime-local"
          />
        </FormControl>

        <FormControl mb={3}>
          <FormLabel>Repay deadline</FormLabel>
          <Input
            placeholder="Select Date and Time"
            size="md"
            type="datetime-local"
          />
        </FormControl>

        <Button width={"100%"} size={"lg"}>
            Request Loan
        </Button>
      </CardBody>
    </>
  );
};

export default RequestLoanForm;
