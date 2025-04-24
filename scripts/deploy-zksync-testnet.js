const { Wallet, Provider } = require("zksync-web3");
const { Deployer } = require("@matterlabs/hardhat-zksync-deploy");
const hre = require("hardhat");
const ethers = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
  console.log("Deploying RESEARKA Platform contracts to zkSync Testnet...");

  // Initialize the wallet.
  const provider = new Provider("https://zksync2-testnet.zksync.dev");
  const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
  const deployer = new Deployer(hre, wallet);

  console.log(`Deployer address: ${wallet.address}`);
  
  // Check deployer balance
  const balance = await wallet.getBalance();
  console.log(`Account balance: ${ethers.utils.formatEther(balance)} ETH`);

  if (ethers.utils.formatEther(balance) < 0.01) {
    console.error("Not enough ETH to deploy contracts. Please fund your wallet with at least 0.01 ETH.");
    process.exit(1);
  }

  // Deploy Treasury contract first
  const treasuryAddress = wallet.address; // Initially set to deployer, will be updated
  
  // Use existing external token instead of deploying
  if (!process.env.EXTERNAL_TOKEN_ADDRESS) {
    console.error("ERROR: EXTERNAL_TOKEN_ADDRESS environment variable is required.");
    console.error("Please add the external RESEARKA token address to your .env file.");
    process.exit(1);
  }
  
  console.log(`Using external RESEARKA token at: ${process.env.EXTERNAL_TOKEN_ADDRESS}`);
  const tokenAddress = process.env.EXTERNAL_TOKEN_ADDRESS;
  
  // Create token contract interface - will be used later if verification is successful
  // Define outside try/catch so it's available throughout the function scope
  let tokenContract = null;
  let hasAccessControl = false;
  
  // For testing, we can get an instance of the external token to verify it exists
  try {
    const tokenArtifact = await hre.artifacts.readArtifact("IResearkaToken");
    tokenContract = new ethers.Contract(tokenAddress, tokenArtifact.abi, wallet);
    const symbol = await tokenContract.symbol();
    console.log(`Connected to external token with symbol: ${symbol}`);
    
    // Check if token implements AccessControl (has role functions)
    try {
      const MINTER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE"));
      const hasRoleMethod = await tokenContract.hasRole.call(MINTER_ROLE, wallet.address);
      // If we get here, token has AccessControl interface
      hasAccessControl = true;
      console.log("Token implements AccessControl with roles");
    } catch (roleError) {
      console.log("External token does not implement AccessControl with roles");
      hasAccessControl = false;
    }
  } catch (error) {
    console.warn("Warning: Could not verify external token. Continuing anyway...");
    console.warn(error.message);
    // Keep tokenContract as null
  }
  
  // zkSync testnet ETH/USD price feed (using Goerli feed for now)
  const priceFeedAddress = "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e";
  
  // Deploy Submission contract
  console.log("Deploying ResearkaSubmission...");
  const submissionArtifact = await deployer.loadArtifact("ResearkaSubmission");
  const submission = await deployer.deploy(submissionArtifact, [
    tokenAddress,
    priceFeedAddress,
    treasuryAddress
  ]);
  await submission.deployed();
  console.log(`ResearkaSubmission deployed to: ${submission.address}`);
  
  // Deploy Review contract
  console.log("Deploying ResearkaReview...");
  const reviewArtifact = await deployer.loadArtifact("ResearkaReview");
  const review = await deployer.deploy(reviewArtifact, [
    tokenAddress,
    submission.address,
    treasuryAddress
  ]);
  await review.deployed();
  console.log(`ResearkaReview deployed to: ${review.address}`);
  
  // Deploy Treasury contract
  console.log("Deploying ResearchaTreasury...");
  const treasuryArtifact = await deployer.loadArtifact("ResearchaTreasury");
  const treasury = await deployer.deploy(treasuryArtifact, [
    tokenAddress,
    priceFeedAddress
  ]);
  await treasury.deployed();
  console.log(`ResearchaTreasury deployed to: ${treasury.address}`);
  
  // Grant PLATFORM_ROLE to the Treasury contract in Submission contract
  const PLATFORM_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PLATFORM_ROLE"));
  const grantPlatformRoleTx = await submission.grantRole(PLATFORM_ROLE, treasury.address);
  await grantPlatformRoleTx.wait();
  console.log(`Granted PLATFORM_ROLE to Treasury contract in Submission contract`);
  
  // Grant MINTER_ROLE to Treasury contract in Token contract ONLY if it supports AccessControl
  if (tokenContract && hasAccessControl) {
    try {
      console.log("Attempting to grant MINTER_ROLE to treasury on token contract...");
      const MINTER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE"));
      const grantMinterRoleTx = await tokenContract.grantRole(MINTER_ROLE, treasury.address);
      await grantMinterRoleTx.wait();
      console.log(`Granted MINTER_ROLE to Treasury contract in Token contract`);
    } catch (error) {
      console.warn("Failed to grant MINTER_ROLE to Treasury. External token may use a different role mechanism:");
      console.warn(error.message);
    }
  } else {
    console.log("Skipping MINTER_ROLE grant - token doesn't support AccessControl interface");
  }
  
  // Record deployment info for easy reference
  const deploymentInfo = {
    network: "zkSyncTestnet",
    token: tokenAddress,
    treasury: treasury.address,
    submission: submission.address,
    review: review.address,
    deployedAt: new Date().toISOString(),
    deployer: wallet.address
  };
  
  // Ensure deployment directory exists
  const deployDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir);
  }
  
  // Write deployment info to file
  fs.writeFileSync(
    path.join(deployDir, 'zksync-testnet.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("Deployment information saved to deployments/zksync-testnet.json");
  
  // Create .env.testnet file with the contract addresses
  const envContent = `# Contract Addresses - zkSync Testnet
NEXT_PUBLIC_TESTNET_TOKEN_ADDRESS=${tokenAddress}
NEXT_PUBLIC_TESTNET_TREASURY_ADDRESS=${treasury.address}
NEXT_PUBLIC_TESTNET_SUBMISSION_ADDRESS=${submission.address}
NEXT_PUBLIC_TESTNET_REVIEW_ADDRESS=${review.address}
`;
  
  fs.writeFileSync(
    path.join(__dirname, '../.env.testnet'),
    envContent
  );
  
  console.log("Environment variables saved to .env.testnet");
  console.log("Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
