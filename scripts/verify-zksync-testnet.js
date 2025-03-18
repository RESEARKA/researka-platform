const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Verifying contracts on zkSync Testnet Explorer...");

  // Find the most recent deployment file
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    console.error("No deployments directory found. Please deploy contracts first.");
    process.exit(1);
  }

  const deploymentFiles = fs.readdirSync(deploymentsDir)
    .filter(file => file.startsWith("zksync-testnet-"))
    .sort()
    .reverse();

  if (deploymentFiles.length === 0) {
    console.error("No zkSync testnet deployment files found. Please deploy contracts first.");
    process.exit(1);
  }

  const latestDeploymentFile = deploymentFiles[0];
  const deploymentPath = path.join(deploymentsDir, latestDeploymentFile);
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

  console.log(`Using deployment from: ${latestDeploymentFile}`);

  // Verify Token contract
  console.log("\nVerifying ResearkaToken...");
  try {
    await hre.run("verify:verify", {
      address: deployment.token,
      contract: "contracts/ResearkaToken.sol:ResearkaToken",
      constructorArguments: [deployment.treasury],
      network: "zkSyncTestnet"
    });
    console.log("ResearkaToken verified successfully!");
  } catch (error) {
    console.error("Error verifying ResearkaToken:", error.message);
  }

  // Get price feed address
  const priceFeedAddress = "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e"; // Goerli ETH/USD price feed

  // Verify Submission contract
  console.log("\nVerifying ResearkaSubmission...");
  try {
    await hre.run("verify:verify", {
      address: deployment.submission,
      contract: "contracts/ResearkaSubmission.sol:ResearkaSubmission",
      constructorArguments: [
        deployment.token,
        priceFeedAddress,
        deployment.treasury
      ],
      network: "zkSyncTestnet"
    });
    console.log("ResearkaSubmission verified successfully!");
  } catch (error) {
    console.error("Error verifying ResearkaSubmission:", error.message);
  }

  // Verify Review contract
  console.log("\nVerifying ResearkaReview...");
  try {
    await hre.run("verify:verify", {
      address: deployment.review,
      contract: "contracts/ResearkaReview.sol:ResearkaReview",
      constructorArguments: [
        deployment.token,
        deployment.submission,
        deployment.treasury
      ],
      network: "zkSyncTestnet"
    });
    console.log("ResearkaReview verified successfully!");
  } catch (error) {
    console.error("Error verifying ResearkaReview:", error.message);
  }

  // Verify Treasury contract
  console.log("\nVerifying ResearchaTreasury...");
  try {
    await hre.run("verify:verify", {
      address: deployment.treasury,
      contract: "contracts/ResearchaTreasury.sol:ResearchaTreasury",
      constructorArguments: [
        deployment.token,
        priceFeedAddress
      ],
      network: "zkSyncTestnet"
    });
    console.log("ResearchaTreasury verified successfully!");
  } catch (error) {
    console.error("Error verifying ResearchaTreasury:", error.message);
  }

  console.log("\nVerification process completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
