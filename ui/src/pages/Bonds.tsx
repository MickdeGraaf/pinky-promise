import react from 'react';
import Container from '../components/Container';
import { Center, Text } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/button';
import CreateBondModal from '../components/CreateBondModal';
import BondsList from '../components/BondsList';
import { Bond } from '../types/Bond';

import BondingABI from '../abis/Bonding.json';
import contracts from "../config/contracts";
import { useAccount, useContractRead } from 'wagmi';
import { decodeAbiParameters } from 'viem';

const Bonds = () => {

    const account = useAccount();

    const ownerBondsRead = useContractRead({
        address: contracts.bonding as `0x${string}`,
        chainId: contracts.bondingChainId,
        abi: BondingABI,
        functionName: 'getBondsOfOwner',
        args: [account.address],
        cacheOnBlock: true,
        watch: true
    });

    

    // @ts-ignore
    const bondData = ownerBondsRead.data ? ownerBondsRead.data[0] : [];

    console.log(ownerBondsRead.data);
    // @ts-ignore
    const bondIndexes = ownerBondsRead.data ? ownerBondsRead.data[1] : [];

    console.log(bondIndexes);

    const bonds:Bond[] = ownerBondsRead.data ? bondData.map((bondData: any, index: number) => {
        let chainId = 12284848; // random

        try {
            chainId = Number(decodeAbiParameters([{name: "x", type: "uint256"}, {name: "y", type: "address"}], bondData.verifier)[0]);
        }
        catch (e) {
            console.log(e);
        }

        return {
            id: Number(bondIndexes[index]),
            amount: bondData.amount,
            destinationChainId: chainId
        }
    }) : [];

    // const bonds:Bond[] = [
    //     {
    //         id: 1,
    //         amount: 1n * 10n ** 18n,
    //         destinationChainId: 1,
    //     }
    // ]

    // const bonds = [];
    
    // toggle is createBond modal open
    const [isCreateBondOpen, setIsCreateBondOpen] = react.useState(false);

    const onClickCreateBond = () => {
        setIsCreateBondOpen(true);
    }

    const onCloseCreateBond = () => {
        setIsCreateBondOpen(false);
    }

    return (
        <Container>
            <Button onClick={onClickCreateBond}>+ Create bond</Button>
        {bonds.length == 0 ? (
            <Center>
                <Text align={"center"}>You don't have a bond yet. <br></br> <Button onClick={onClickCreateBond}>Create one</Button></Text>     
            </Center>
        ) : (
            <BondsList bonds={bonds} />
        )}

        <CreateBondModal isOpen={isCreateBondOpen} onClose={onCloseCreateBond} />

        </Container>
    )
};

export default Bonds;