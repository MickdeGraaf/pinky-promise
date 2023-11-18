import { useParams } from "react-router";
import Container from "../components/Container";
import { Card, CardBody, CardHeader } from "@chakra-ui/card";
import { Box, Flex, Heading, Stack, StackDivider, Text } from "@chakra-ui/layout";
import { formatEther } from "viem";
import { Button } from "@chakra-ui/button";
import RequestLoanForm from "../components/RequestLoanForm";
import RepayLoanForm from "../components/RepayLoanForm";
import { useState } from "react";
import BondActionActive from "../components/BondActionActive";
import BondActionCoolingDown from "../components/BondActionCoolingDown";
import BondActionCooledDown from "../components/BondActionCooledDown";
import BondActionWithdrawn from "../components/BondActionWithdrawn";

function returnBondAction(bondId: number, bondState: "cooledDown" | "coolingDown" | "active" | "withdrawn", hasOpenLoan: boolean) {

  if (hasOpenLoan) {
    return <Button disabled size="lg" width={"100%"}>Repay your loans first</Button>
  }

  switch(bondState) {
    case "active":
      return <BondActionActive bondId={bondId} />;
    case "coolingDown":
      return <BondActionCoolingDown bondId={bondId} />;
    case "cooledDown":
      return <BondActionCooledDown bondId={bondId} />;
    case "withdrawn":
      return <BondActionWithdrawn bondId={bondId} />;
  }
}

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

  const bondState : "cooledDown" | "coolingDown" | "active" | "withdrawn" = "active";

  const bondAction = returnBondAction(Number(bondId), bondState, hasOpenLoan);


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

              {bondAction}
            </CardBody>
          </Card>
        </Flex>

        {/* Second Card */}
        <Flex width={"30%"}>
          <Card width={"100%"}> 
            {hasOpenLoan ? (
                <RepayLoanForm bondId={Number(bondId)} />
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
