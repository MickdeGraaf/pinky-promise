import { Button } from "@chakra-ui/button";

interface BondActionCooledDownProps {
    bondId: number;
}

export const BondActionCooledDown: React.FC<BondActionCooledDownProps> = ({ bondId }) => {
    return (
        <Button size={"lg"} width={"100%"}>Claim</Button>
    )
}

export default BondActionCooledDown;