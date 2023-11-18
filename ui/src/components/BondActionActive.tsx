import { Button } from "@chakra-ui/button";

interface BondActionActiveProps {
    bondId: number;
}

export const BondActionActive: React.FC<BondActionActiveProps> = ({ bondId }) => {
    return (
        <Button size={"lg"} width={"100%"}>Initiate Withdraw</Button>
    )
}

export default BondActionActive;