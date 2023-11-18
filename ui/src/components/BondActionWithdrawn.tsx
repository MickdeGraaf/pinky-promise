import { Button } from "@chakra-ui/button";

interface BondActionWithdrawnProps {
    bondId: number;
}

export const BondActionWithdrawn: React.FC<BondActionWithdrawnProps> = ({ bondId }) => {
    return (
        <Button size={"lg"} width={"100%"}>Withdrawn, You good</Button>
    )
}

export default BondActionWithdrawn;