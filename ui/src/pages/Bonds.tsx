import react from 'react';
import Container from '../components/Container';
import { Center, Text } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/button';
import CreateBondModal from '../components/CreateBondModal';
import BondsList from '../components/BondsList';
import { Bond } from '../types/Bond';

const Bonds = () => {

    const bonds:Bond[] = [
        {
            id: 1,
            amount: 1n * 10n ** 18n,
            destinationChainId: 1,
        }
    ]

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