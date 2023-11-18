import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/modal"
import { Button, FormControl, FormLabel, Input, InputGroup, InputRightAddon, Select, Text } from "@chakra-ui/react";
import { Form } from "react-router-dom";


interface CreateBondModalProps {
    isOpen: boolean; // Assuming isOpen is a boolean prop
    onClose: () => void; // Assuming onClose is a function prop
  }
  
  const CreateBondModal: React.FC<CreateBondModalProps> = ({ isOpen, onClose }) => {
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
                    <Input type="text" />
                    <InputRightAddon children='eth' />
                </InputGroup>
            </FormControl>
            <FormControl mb={3}>
                <FormLabel>Cooldown</FormLabel>
                <Select placeholder="Select duration">
                    <option value="option1">1 hour</option>
                    <option value="option2">6 hours</option>
                    <option value="option2">12 hours</option>
                    <option value="option2">24 hours</option>
                </Select>
            </FormControl>
            
            <FormControl mb={3}>
                <FormLabel>Chain to borrow on</FormLabel>
                <Select placeholder="Select chain">
                    <option value="eth">Ethereum</option>
                    <option value="eth-goerli">Ethereum Goerli</option>
                    <option value="polygon">Polygon</option>
                    <option value="polygon-mumbai">Polygon Mumbai</option>
                    <option value="optimism">Optimism</option>
                    <option value="optimism-goerli">Optimism Goerli</option>
                    <option value="arbitrum">Arbitrum</option>
                </Select>
            </FormControl>

          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onClose}>
              Deposit
            </Button>
            
          </ModalFooter>
        </ModalContent>
      </Modal>
    )
}

export default CreateBondModal;