import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/modal"
import { Button, FormControl, FormLabel, Input, InputGroup, InputRightAddon, Select, Text } from "@chakra-ui/react";
import { Form } from "react-router-dom";
import chains from "../config/chains";
import { MouseEventHandler, useState } from "react";
import { useContractWrite, usePrepareContractWrite } from "wagmi";


interface CreateBondModalProps {
    isOpen: boolean; // Assuming isOpen is a boolean prop
    onClose: () => void; // Assuming onClose is a function prop
  }
  
  const CreateBondModal: React.FC<CreateBondModalProps> = ({ isOpen, onClose }) => {

    const [cooldown, setCooldown] = useState(3600); // cooldown in seconds
    const [amount, setAmount] = useState("1"); // amount in eth
    const [chainId, setChainId] = useState("1"); // chain id

  //   function createBond(
  //     address owner,
  //     address token,
  //     uint256 amount,
  //     uint256 cooldownDuration,
  //     bytes memory verifier,
  //     uint256 disputeAmount,
  //     uint256 disputeLiveness
  // )

    const { config } = usePrepareContractWrite({
      address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
      abi: [
        {
          name: 'mint',
          type: 'function',
          stateMutability: 'payable',
          inputs: [],
          outputs: [],
        },
      ],
      functionName: 'mint',
    })
    const { write } = useContractWrite(config)

    const handleCooldownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      setCooldown(Number(event.target.value));
    }

    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setAmount(event.target.value);
    }

    const handleChainChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      setChainId(event.target.value);
    }

    const handleDeposit = (event: React.MouseEvent<HTMLButtonElement>) => {
      console.log("deposit");
      // TODO actual deposit
      doDeposit();
    }

    const doDeposit = async () => {
      // Try to do tx
      // If throws error try to connect wallet
      // Try again
      // If throws error again switch network
      // Try again
      // If throws error again show error
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Bond</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
                <FormLabel>Amount</FormLabel>
                <InputGroup>
                    <Input value={amount} onChange={handleAmountChange} type="text" />
                    <InputRightAddon children='eth' />
                </InputGroup>
            </FormControl>
            <FormControl mb={3}>
                <FormLabel>Cooldown</FormLabel>
                <Select value={cooldown} onChange={handleCooldownChange} placeholder="Select duration">
                    <option value="3600">1 hour</option>
                    <option value="21600">6 hours</option>
                    <option value="43200">12 hours</option>
                    <option value="86400">24 hours</option>
                </Select>
            </FormControl>
            
            <FormControl mb={3}>
                <FormLabel>Chain to borrow on</FormLabel>
                <Select value={chainId} onChange={handleChainChange} placeholder="Select chain">
                    {chains.map((chain) => {
                      return (
                        <option value={chain.id}>{chain.name}</option>
                      )
                    })}
                </Select>
            </FormControl>

          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={handleDeposit}>
              Deposit
            </Button>
            
          </ModalFooter>
        </ModalContent>
      </Modal>
    )
}

export default CreateBondModal;