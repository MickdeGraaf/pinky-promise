import { extractChain } from "viem"
import chains from "../config/chains"

interface ChainNameProps {
    chainId: number
}

const ChainName: React.FC<ChainNameProps> = ({ chainId }) => {
    // @ts-ignore
    const chain = extractChain({chains, id: chainId });

    return (
        chain.name
    )
}

export default ChainName;