import { TableContainer, Table, TableCaption, Thead, Tr, Th, Tbody, Td, Tfoot } from "@chakra-ui/table";
import Container from "../components/Container";
import orders from "../dummyData/orders.json";
import { truncateAddress } from "../utils/truncateAddress";
import { formatEther } from "viem";
import { formatUnixTimestamp } from "../utils/formatUnixTimestamp";
import { Button } from "@chakra-ui/button";
import { Heading, Stack } from "@chakra-ui/layout";
import { FormControl } from "@chakra-ui/form-control";
import useFillableLoans from "../hooks/useFillableLoans";
import ChainName from "../components/ChainName";
import DisputeOrderButton from "../components/DisputeOrderButton";
import convertToOrder from "../utils/convertOrder";
import FulfillOrderButton from "../components/FulfillOrderButton";
import useExpiredLoans from "../hooks/useExpiredLoans";
import { Order } from "../types/Order";

const Lend = () => {

    const fillableLoans = useFillableLoans();
    const expiredLoans = useExpiredLoans();
    // const expiredLoans: Order[] = [];

    console.log("expiredLoans");

    console.log(expiredLoans);
    
    // const openLoans = useOpenLoans();

    return (
        <Container>
            <Heading size="md">
                Expired Loans
            </Heading>

            <TableContainer>
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Bond ID</Th>
                            <Th>Chain ID</Th>
                            <Th>Token</Th>
                            <Th>Amount</Th>
                            <Th>Repay Amount</Th>
                            <Th>Repay Deadline</Th>
                            <Th></Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {expiredLoans.map((order) => (
                            <Tr key={order.bondId}>
                                <Td>{Number(order.bondId)}</Td>
                                <Td>{order.chainId}</Td>
                                <Td>{truncateAddress(order.token)}</Td>
                                <Td>{formatEther(order.amount)}</Td>
                                <Td>{formatEther(order.repayAmount)}</Td>
                                <Td>{formatUnixTimestamp(Number(order.fulfillDeadline))}</Td>
                                <Td><DisputeOrderButton order={order}/></Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
                


            {/* <Heading size="md">
                Open Loans
            </Heading>

            <TableContainer>
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Bond ID</Th>
                            <Th>Chain ID</Th>
                            <Th>Token</Th>
                            <Th>Amount</Th>
                            <Th>Repay Amount</Th>
                            <Th>Repay Deadline</Th>
                            
                        </Tr>
                    </Thead>
                    <Tbody>
                        {orders.map((order) => (
                            <Tr key={order.bondId}>
                                <Td>{order.bondId}</Td>
                                <Td>{order.chainId}</Td>
                                <Td>{truncateAddress(order.token)}</Td>
                                <Td>{formatEther(BigInt(order.amount))}</Td>
                                <Td>{formatEther(BigInt(order.repayAmount))}</Td>
                                <Td>{formatUnixTimestamp(order.fulfillDeadline)}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer> */}


            <Heading mt="12" size="md">Fulfillable loans</Heading>
            <TableContainer>
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Bond ID</Th>
                            <Th>Chain ID</Th>
                            <Th>Token</Th>
                            <Th>Amount</Th>
                            <Th>Repay Amount</Th>
                            <Th isNumeric>Fulfill Deadline</Th>
                            <Th isNumeric>Repay Deadline</Th>
                            <Th> </Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {fillableLoans.map((order) => (
                            <Tr key={order.bondId}>
                                <Td>{order.bondId}</Td>
                                <Td><ChainName chainId={order.chainId} /></Td>
                                <Td>{truncateAddress(order.token)}</Td>
                                <Td>{formatEther(BigInt(order.amount))}</Td>
                                <Td>{formatEther(BigInt(order.repayAmount))}</Td>
                                <Td>{formatUnixTimestamp(order.fulfillDeadline)}</Td>
                                <Td>{formatUnixTimestamp(order.repayDeadline)}</Td>
                                <Td> <FulfillOrderButton order={order} /> </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
            

        </Container>
    )
};

export default Lend;