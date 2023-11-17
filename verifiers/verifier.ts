const ethers = require("ethers");

import { abi as bondChainA } from "./abis/bondChainA.json";
import { abi as bondChainB } from "./abis/bondChainB.json";
import {
  chainANodeUrl,
  chainBNodeUrl,
  contractAddressA,
  contractAddressB,
} from "./config.js";

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
    const bondId = event.args.bondID;

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
async function isCooldownOnChainA(bondId) {
  // Call isCooldown function on Chain A
  const isCooldown = await contractA.isCooldown(bondId);

  return isCooldown;
}

// Function to check isRepaid on Chain B
async function isRepaidOnChainB(bondId) {
  // Call isRepaid function on Chain B
  const isRepaid = await contractB.isRepaid(bondId);

  return isRepaid;
}

// Function to make dispute
async function makeDispute(bondId) {
  try {
    // make dispute here
  } catch (error) {
    console.error("Error making dispute:", error.message);
  }
}

// Start listening for EnterCooldown events
listenForEnterCooldownEvent();
