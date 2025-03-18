const { Wallet, Provider } = require("zksync-web3");
const { Deployer } = require("@matterlabs/hardhat-zksync-deploy");
const hre = require("hardhat");
const ethers = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
  console.log("Deploying Researka Platform contracts to zkSync Testnet...");

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

  // Deploy Treasury contract first (will be used by token contract)
  const treasuryAddress = wallet.address; // Initially set to deployer, will be updated
  
  // Deploy Token contract
  console.log("Deploying ResearkaToken...");
  const tokenArtifact = await deployer.loadArtifact("ResearkaToken");
  const token = await deployer.deploy(tokenArtifact, [treasuryAddress]);
  await token.deployed();
  console.log(`ResearkaToken deployed to: ${token.address}`);
  
  // zkSync testnet ETH/USD price feed (using Goerli feed for now)
  const priceFeedAddress = "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e";
  
  // Deploy Submission contract
  console.log("Deploying ResearkaSubmission...");
  const submissionArtifact = await deployer.loadArtifact("ResearkaSubmission");
  const submission = await deployer.deploy(submissionArtifact, [
    token.address,
    priceFeedAddress,
    treasuryAddress
  ]);
  await submission.deployed();
  console.log(`ResearkaSubmission deployed to: ${submission.address}`);
  
  // Deploy Review contract
  console.log("Deploying ResearkaReview...");
  const reviewArtifact = await deployer.loadArtifact("ResearkaReview");
  const review = await deployer.deploy(reviewArtifact, [
    token.address,
    submission.address,
    treasuryAddress
  ]);
  await review.deployed();
  console.log(`ResearkaReview deployed to: ${review.address}`);
  
  // Deploy Treasury contract
  console.log("Deploying ResearchaTreasury...");
  const treasuryArtifact = await deployer.loadArtifact("ResearchaTreasury");
  const treasury = await deployer.deploy(treasuryArtifact, [
    token.address,
    priceFeedAddress
  ]);
  await treasury.deployed();
  console.log(`ResearchaTreasury deployed to: ${treasury.address}`);
  
  // Update treasury address in other contracts
  console.log("Setting up contract permissions...");
  
  // Grant PLATFORM_ROLE to Review contract in Submission contract
  const PLATFORM_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PLATFORM_ROLE"));
  const grantPlatformRoleTx = await submission.grantRole(PLATFORM_ROLE, review.address);
  await grantPlatformRoleTx.wait();
  console.log(`Granted PLATFORM_ROLE to Review contract in Submission contract`);
  
  // Grant MINTER_ROLE to Treasury contract in Token contract
  const MINTER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE"));
  const grantMinterRoleTx = await token.grantRole(MINTER_ROLE, treasury.address);
  await grantMinterRoleTx.wait();
  console.log(`Granted MINTER_ROLE to Treasury contract in Token contract`);
  
  console.log("Deployment complete!");
  
  // Log all contract addresses for easy reference
  const deploymentInfo = {
    network: "zkSyncTestnet",
    token: token.address,
    treasury: treasury.address,
    submission: submission.address,
    review: review.address,
    deployer: wallet.address,
    timestamp: new Date().toISOString()
  };
  
  console.log("\nDeployment Information:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // Save deployment information to a file
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentPath = path.join(
    deploymentsDir, 
    `zksync-testnet-${new Date().toISOString().replace(/:/g, "-")}.json`
  );
  
  fs.writeFileSync(
    deploymentPath,
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log(`Deployment information saved to ${deploymentPath}`);
  
  // Create .env.testnet file with the contract addresses
  const envContent = `# Contract Addresses - zkSync Testnet
NEXT_PUBLIC_TESTNET_TOKEN_ADDRESS=${token.address}
NEXT_PUBLIC_TESTNET_TREASURY_ADDRESS=${treasury.address}
NEXT_PUBLIC_TESTNET_SUBMISSION_ADDRESS=${submission.address}
NEXT_PUBLIC_TESTNET_REVIEW_ADDRESS=${review.address}
`;

  fs.writeFileSync(
    path.join(__dirname, "../.env.testnet"),
    envContent
  );
  
  console.log(`Environment variables saved to .env.testnet`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
