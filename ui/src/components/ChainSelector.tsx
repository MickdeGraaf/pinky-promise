import { Select } from "@chakra-ui/select"
import chains from "../config/chains"

const ChainSelector = () => {
    return (
        <Select>
            {
                chains.map((chain) => {
                    return (
                        <option value={chain.id}>{chain.name}</option>
                    )
                })
            }
        </Select>
    )
}

export default ChainSelector;