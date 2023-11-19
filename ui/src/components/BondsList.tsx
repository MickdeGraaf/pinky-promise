import { TableContainer, Table, TableCaption, Thead, Tr, Th, Tbody, Td } from "@chakra-ui/table"
import { Bond } from "../types/Bond";
import { extractChain, formatEther } from "viem";
import chains from "../config/chains";
import ChainName from "./ChainName";
import { Button } from "@chakra-ui/button";
import Link from "./Link";

interface BondsListProps {
    bonds: Bond[];
}

const BondsList: React.FC<BondsListProps> = ({ bonds }) => {
    // TODO fetch bonds from events

    return (
        <TableContainer>
            <Table variant='simple'>
                
                <Thead>
                    <Tr>
                        <Th>Id</Th>
                        <Th>Amount</Th>
                        <Th>DestinationChain</Th>
                        <Th></Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {bonds.map((bond) => {
                        return (
                            <Tr>
                                <Td>{bond.id}</Td>
                                <Td>{formatEther(bond.amount)} ETH</Td>
                                <Td><ChainName chainId={bond.destinationChainId}/></Td>
                                <Td>
                                    <Link to={`/manage-bond/${bond.id}`}><Button>Manage</Button></Link>
                                </Td>
                            </Tr>
                        )
                    })}
                </Tbody>
            </Table>
        </TableContainer>
    )
}

export default BondsList;