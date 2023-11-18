import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/modal"
import { Button, FormControl, FormLabel, Input, InputGroup, InputRightAddon, Select, Text } from "@chakra-ui/react";
import { Form } from "react-router-dom";
import chains from "../config/chains";
import { MouseEventHandler, useState } from "react";
import { useAccount, useContractWrite, useNetwork, usePrepareContractWrite, useWalletClient } from "wagmi";

import contracts from "../config/contracts";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { switchNetwork, writeContract } from "@wagmi/core";
import BondingABI from "../abis/Bonding.json";
import { encodeAbiParameters, encodePacked, parseEther } from "viem";


interface CreateBondModalProps {
    isOpen: boolean; // Assuming isOpen is a boolean prop
    onClose: () => void; // Assuming onClose is a function prop
  }
  
  const CreateBondModal: React.FC<CreateBondModalProps> = ({ isOpen, onClose }) => {

    const [cooldown, setCooldown] = useState(3600); // cooldown in seconds
    const [amount, setAmount] = useState("0.1"); // amount in eth
    const [chainId, setChainId] = useState("1"); // chain id
    const { address, isConnecting, isDisconnected } = useAccount()
    const connectModal = useConnectModal();
    const { chain, chains } = useNetwork()
  //   function createBond(
  //     address owner,
  //     address token,
  //     uint256 amount,
  //     uint256 cooldownDuration,
  //     bytes memory verifier,
  //     uint256 disputeAmount,
  //     uint256 disputeLiveness
  // )

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
      // Open connect modal if not connected
      if(!address) {
        if(typeof connectModal == undefined) {
          return;
        }
        // @ts-ignore
        connectModal.openConnectModal();
        return;
      }

      // Check if connected to correct network if not switch network
      if(chain?.id != contracts.bondingChainId) {
        await switchNetwork({
          chainId: contracts.bondingChainId,
        });
      }
      
    //   function createBond(
    //     address owner,
    //     address token,
    //     uint256 amount,
    //     uint256 cooldownDuration,
    //     bytes memory verifier,
    //     uint256 disputeAmount,
    //     uint256 disputeLiveness
    // )
    
      // abi encode verifier
      // @ts-ignore
      const destinationContract = contracts.fulfillers[Number(chainId)] as `0x${string}`;

      if(typeof destinationContract == undefined) {
        alert("No fulfiller for this chain");
        return;
      }
      
      const verifier = encodeAbiParameters([{name: "x", type: "uint256"}, {name: "y", type: "address"}], [BigInt(chainId), destinationContract]);
      // const verifier = encodeAbiParameters({x: "uint256", y: "address"}, [BigInt(chainId), destinationContract]);
      // const verifier = encodePacked(["uint256", "address"], [BigInt(chainId), destinationContract]);
      console.log(verifier);
      // Send tx
      const tx = await writeContract({
        address: contracts.bonding as `0x${string}`,
        abi: BondingABI,
        functionName: "createBond",
        args: [
          address, // owner
          "0x0000000000000000000000000000000000000000", // token
          parseEther(amount), // amount
          cooldown, // cooldownDuration
          verifier, // verifier
          0, // disputeAmount TODO actual secure values
          0 // disputeLiveness TODO actual secure values
        ],
        chainId: contracts.bondingChainId,
        value: parseEther(amount) // TODO don't send native token when other token is bonded
      });

      alert(`tx send with hash ${tx.hash}`);
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