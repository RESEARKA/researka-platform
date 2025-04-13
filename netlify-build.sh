#!/bin/bash

# Install dependencies with legacy peer deps flag
echo "Installing dependencies with legacy peer deps..."
npm install --legacy-peer-deps --no-audit

# Temporarily remove hardhat-related packages for build
echo "Temporarily removing hardhat-related packages for build..."
npm uninstall --no-save hardhat @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-ethers @nomicfoundation/hardhat-chai-matchers @typechain/ethers-v6 @typechain/hardhat

# Run the build
echo "Running build..."
NEXT_DISABLE_ESLINT=1 npm run build

# Exit with the build's exit code
exit $?
