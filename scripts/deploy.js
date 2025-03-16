const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Researka Platform contracts...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);
  
  // Check deployer balance
  const balance = await deployer.getBalance();
  console.log(`Account balance: ${ethers.utils.formatEther(balance)} ETH`);

  // Deploy Treasury contract first (will be used by token contract)
  const treasuryAddress = deployer.address; // Initially set to deployer, will be updated
  
  // For zkSync deployment, we would use a different approach with Wallet
  // This is a standard Ethereum deployment
  
  // Deploy Token contract
  console.log("Deploying ResearkaToken...");
  const ResearkaToken = await ethers.getContractFactory("ResearkaToken");
  const token = await ResearkaToken.deploy(treasuryAddress);
  await token.deployed();
  console.log(`ResearkaToken deployed to: ${token.address}`);
  
  // Get a Chainlink price feed address (ETH/USD)
  // For local development, we would deploy a mock
  // For testnet/mainnet, we would use the actual Chainlink address
  let priceFeedAddress;
  
  // Check if we're on a local network
  const networkName = hre.network.name;
  if (networkName === "hardhat" || networkName === "localhost") {
    console.log("Deploying MockV3Aggregator for local development...");
    const MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator");
    const mockPriceFeed = await MockV3Aggregator.deploy(8, 200000000000); // 8 decimals, $2000.00000000 ETH/USD
    await mockPriceFeed.deployed();
    priceFeedAddress = mockPriceFeed.address;
    console.log(`MockV3Aggregator deployed to: ${priceFeedAddress}`);
  } else if (networkName === "goerli" || networkName === "zkSyncTestnet") {
    // Goerli ETH/USD price feed
    priceFeedAddress = "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e";
  } else if (networkName === "mainnet" || networkName === "zkSyncMainnet") {
    // Mainnet ETH/USD price feed
    priceFeedAddress = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";
  } else {
    throw new Error(`Unsupported network: ${networkName}`);
  }
  
  // Deploy Submission contract
  console.log("Deploying ResearkaSubmission...");
  const ResearkaSubmission = await ethers.getContractFactory("ResearkaSubmission");
  const submission = await ResearkaSubmission.deploy(
    token.address,
    priceFeedAddress,
    treasuryAddress
  );
  await submission.deployed();
  console.log(`ResearkaSubmission deployed to: ${submission.address}`);
  
  // Deploy Review contract
  console.log("Deploying ResearkaReview...");
  const ResearkaReview = await ethers.getContractFactory("ResearkaReview");
  const review = await ResearkaReview.deploy(
    token.address,
    submission.address,
    treasuryAddress
  );
  await review.deployed();
  console.log(`ResearkaReview deployed to: ${review.address}`);
  
  // Deploy Treasury contract
  console.log("Deploying ResearchaTreasury...");
  const ResearchaTreasury = await ethers.getContractFactory("ResearchaTreasury");
  const treasury = await ResearchaTreasury.deploy(
    token.address,
    priceFeedAddress
  );
  await treasury.deployed();
  console.log(`ResearchaTreasury deployed to: ${treasury.address}`);
  
  // Update treasury address in other contracts
  console.log("Updating treasury address in contracts...");
  
  // Grant roles to contracts
  console.log("Setting up contract permissions...");
  
  // Grant PLATFORM_ROLE to Review contract in Submission contract
  const PLATFORM_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PLATFORM_ROLE"));
  await submission.grantRole(PLATFORM_ROLE, review.address);
  console.log(`Granted PLATFORM_ROLE to Review contract in Submission contract`);
  
  // Grant MINTER_ROLE to Treasury contract in Token contract
  const MINTER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE"));
  await token.grantRole(MINTER_ROLE, treasury.address);
  console.log(`Granted MINTER_ROLE to Treasury contract in Token contract`);
  
  console.log("Deployment complete!");
  
  // Log all contract addresses for easy reference
  console.log("\nContract Addresses:");
  console.log("====================");
  console.log(`ResearkaToken: ${token.address}`);
  console.log(`ResearkaSubmission: ${submission.address}`);
  console.log(`ResearkaReview: ${review.address}`);
  console.log(`ResearchaTreasury: ${treasury.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
