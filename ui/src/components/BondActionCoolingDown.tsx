import { Button } from "@chakra-ui/button";

interface BondActionCoolingDownProps {
    bondId: number;
}

export const BondActionCoolingDown: React.FC<BondActionCoolingDownProps> = ({ bondId }) => {
    return (
        <Button size={"lg"} width={"100%"}>Bond Cooling Down. 50 more minutes</Button>
    )
}

export default BondActionCoolingDown;