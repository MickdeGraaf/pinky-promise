import ethers from "ethers";
import { Contract } from "@ethersproject/contracts";
import { BigNumber } from "@ethersproject/bignumber";
import { Provider } from "@ethersproject/providers";

import { abi as bondChainA } from "./abis/bondChainA.json";
import { abi as bondChainB } from "./abis/bondChainB.json";
import {
  chainANodeUrl,
  chainBNodeUrl,
  contractAddressA,
  contractAddressB,
} from "./config";

// Connect to providers for Chain A and Chain B
const providerChainA = new ethers.providers.JsonRpcProvider(chainANodeUrl);
const providerChainB = new ethers.providers.JsonRpcProvider(chainBNodeUrl);

// Connect to contracts
const contractA = new ethers.Contract(
  contractAddressA,
  bondChainA,
  providerChainA,
);
const contractB = new ethers.Contract(
  contractAddressB,
  bondChainB,
  providerChainB,
);

// Function to listen for EnterCooldown event on Chain A
async function listenForEnterCooldownEvent() {
  // Set up event filter for EnterCooldown event on Chain A
  const filter = {
    // Set filter parameters
    // ...
  };

  const events = await contractA.queryFilter(filter);

  for (const event of events) {
    // Get bondID from the event
    const bondId = BigNumber.from(0);

    // Check isCooldown on Chain A
    const isCooldown = await isCooldownOnChainA(bondId);

    if (isCooldown) {
      // Check isRepaid on Chain B
      const isRepaid = await isRepaidOnChainB(bondId);

      if (isRepaid) {
        await makeDispute(bondId);
      }
    }
  }

  // Keep listening for EnterCooldown events
  listenForEnterCooldownEvent();
}

// Function to check isCooldown on Chain A
async function isCooldownOnChainA(bondId: BigNumber) {
  // Call isCooldown function on Chain A
  const isCooldown = await contractA.isCooldown(bondId);

  return isCooldown;
}

// Function to check isRepaid on Chain B
async function isRepaidOnChainB(bondId: BigNumber) {
  // Call isRepaid function on Chain B
  const isRepaid = await contractB.isRepaid(bondId);

  return isRepaid;
}

// Function to make dispute
async function makeDispute(bondId: BigNumber) {
  try {
    // make dispute here
  } catch (error) {
    console.error("Error making dispute:");
  }
}

// Start listening for EnterCooldown events
listenForEnterCooldownEvent();
