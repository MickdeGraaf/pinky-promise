import react from 'react';
import Container from '../components/Container';
import { Center, Text } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/button';

const Borrow = () => {

    const hasBonds = false;
    
    // toggle is createBond modal open
    const [isCreateBondOpen, setIsCreateBondOpen] = react.useState(false);

    const onClickCreateBond = () => {
        setIsCreateBondOpen(true);
    }

    return (
        <Container>
        {!hasBonds ? (
            <Center>
                <Text align={"center"}>You don't have a bond yet. <br></br> <Button>Create one</Button></Text>     
            </Center>
        ) : (
            <Text>Placeholder bonds list</Text>
        )}

        </Container>
    )
};

export default Borrow;