import { useParams } from "react-router";
import Container from "../components/Container";
import { Card, CardBody, CardHeader } from "@chakra-ui/card";
import { Box, Flex, Heading, Stack, StackDivider, Text } from "@chakra-ui/layout";
import { formatEther } from "viem";
import { Button } from "@chakra-ui/button";
import RequestLoanForm from "../components/RequestLoanForm";

const ManageBond = () => {
  const { bondId } = useParams();

  if (!bondId) {
    return <Container>Invalid bond id</Container>;
  }

  const bond = {
    id: 1,
    amount: 1n * 10n ** 18n,
    destinationChainId: 1,
  };

  const hasOpenLoan = false;

  return (
    <Container>
      <Flex>
        {/* First Card */}
        <Flex flex="1" marginRight="4">
          <Card flex="1">
            <CardHeader>
              <Heading size={"md"}>Bond {bondId}</Heading>
            </CardHeader>
            <CardBody>
              <Stack divider={<StackDivider />} spacing="4">
                <Box>
                  <Heading size="xs" textTransform="uppercase">
                    Amount
                  </Heading>
                  <Text pt="2" fontSize="sm">
                    {formatEther(bond.amount)} ETH
                  </Text>
                </Box>
                <Box>
                  <Heading size="xs" textTransform="uppercase">
                    Cooldown
                  </Heading>
                  <Text pt="2" fontSize="sm">
                    6 hours
                  </Text>
                </Box>
              </Stack>

              <Button mt="6" size="lg" width="100%">
                Initiate Withdraw
              </Button>
            </CardBody>
          </Card>
        </Flex>

        {/* Second Card */}
        <Flex width={"30%"}>
          <Card width={"100%"}> 
            {hasOpenLoan ? (
                <>Repay</>
            ) : (
                <RequestLoanForm bondId={Number(bondId)} />
            )}
          </Card>
        </Flex>
      </Flex>
    </Container>
  );
};

export default ManageBond;
