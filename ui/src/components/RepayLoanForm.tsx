import { Button } from "@chakra-ui/button";
import { CardBody, CardFooter, CardHeader } from "@chakra-ui/card";
import { Flex, Heading, Text } from "@chakra-ui/layout";

interface RepayLoanFormProps {
    bondId: number;
}

const RepayLoanForm = ({ bondId }: RepayLoanFormProps) => {
    return(
        <>
            <CardHeader>
                <Heading size="md">Repay Loan</Heading>
            </CardHeader>

            <CardBody>
                <Text>Amount: 1 ETH</Text>
                <Text>Deadline: 15:00</Text>
                <Flex grow={"1"}/>
            </CardBody>

            <CardFooter>
                <Button size="lg" width="100%">Repay</Button>
            </CardFooter>
        </>
    )
}

export default RepayLoanForm;