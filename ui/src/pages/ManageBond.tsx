import { useParams } from "react-router";
import Container from "../components/Container";
import { Card, CardBody, CardHeader } from "@chakra-ui/card";
import { Box, Flex, Heading, Stack, StackDivider, Text } from "@chakra-ui/layout";
import { decodeAbiParameters, formatEther } from "viem";
import { Button } from "@chakra-ui/button";
import RequestLoanForm from "../components/RequestLoanForm";
import RepayLoanForm from "../components/RepayLoanForm";
import { useState } from "react";
import BondActionActive from "../components/BondActionActive";
import BondActionCoolingDown from "../components/BondActionCoolingDown";
import BondActionCooledDown from "../components/BondActionCooledDown";
import BondActionWithdrawn from "../components/BondActionWithdrawn";
import useBond from "../hooks/useBond";
import ChainName from "../components/ChainName";
import useFormattedBond from "../hooks/useFormattedBond";

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

  // const bondData = useBond(Number(bondId));

  const bond = useFormattedBond(Number(bondId));

  const hasOpenLoan = false;

  const bondState : "cooledDown" | "coolingDown" | "active" | "withdrawn" = "coolingDown";

  const bondAction = returnBondAction(Number(bondId), bondState, hasOpenLoan);


  if(!bond) {
    return <Container>Loading</Container>;
  }

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
                    {Number(bond.cooldownDuration)} seconds
                  </Text>
                </Box>

                <Box>
                  <Heading size="xs" textTransform="uppercase">
                    Token
                  </Heading>
                  <Text pt="2" fontSize="sm">
                    {bond.token}
                  </Text>
                </Box>
                
                <Box>
                  <Heading size="xs" textTransform="uppercase">
                    DestinationChain
                  </Heading>
                  <Text pt="2" fontSize="sm">
                    <ChainName chainId={bond.destinationChainId}/>
                  </Text>
                </Box>
              </Stack>
              {/* TODO renable bondAction */}
              {/* {bondAction} */}
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
