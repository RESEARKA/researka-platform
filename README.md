# RESEARKA Platform

A decentralized academic publishing platform built on blockchain technology, enabling transparent peer review, fair compensation for researchers, and efficient knowledge sharing.

## Overview

RESEARKA is a platform that revolutionizes academic publishing by leveraging blockchain technology to create a transparent, efficient, and incentivized ecosystem for researchers, reviewers, and readers. The platform integrates with an external token for transactions and rewards, keeping the core platform focused on academic publishing functionality.

## External Token Integration

RESEARKA integrates with an external token platform rather than implementing a native token. This architectural decision:

- Separates concerns between academic publishing features and token mechanics
- Allows specialized teams to focus on respective areas of expertise
- Enables more flexible token utility patterns across multiple platforms

For token-related functionality, please refer to the separate token platform documentation at [RESEARKA Token Platform](https://researka.io/token).

## Smart Contracts

### RESEARKASubmission.sol
Manages article submissions with:
- Metadata storage
- Flexible fee structures with external token integration
- Submission status tracking
- Review process management

### RESEARKAReview.sol
Handles the peer review process:
- Reviewer assignment
- Review submission and tracking
- Review rewards distribution through external token
- Citation tracking and royalty payments

### RESEARKATreasury.sol
Manages platform economics:
- Integration with external token for payments
- Rewards distribution mechanisms
- Dynamic fee adjustments
- Platform treasury management

## Frontend Components

### Wallet Integration
- Wallet connection interface
- Network detection and switching
- Balance display

### Token Management
- Token balance display
- Token transfer functionality
- Transaction history

### Staking Interface (Optional - requires token features flag)
- Staking position creation
- Reward claiming
- Position management

## Project Structure

```
researka-platform/
├── contracts/               # Smart contracts
│   ├── RESEARKASubmission.sol # Submission management
│   ├── RESEARKAReview.sol   # Review process management
│   ├── RESEARKATreasury.sol # Treasury and economics
│   └── mocks/               # Mock contracts for testing
├── frontend/                # Frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── token/       # Token-related components
│   │   │   └── wallet/      # Wallet connection components
│   │   ├── contexts/        # React contexts
│   │   └── abis/            # Contract ABIs
├── scripts/                 # Deployment scripts
├── test/                    # Contract tests
└── hardhat.config.js        # Hardhat configuration
```

## Setup and Installation

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MetaMask or another Web3 wallet

### Smart Contract Development

1. Install dependencies:
```bash
npm install
```

2. Compile contracts:
```bash
npm run compile
```

3. Run tests:
```bash
npm run test
```

4. Deploy to local network:
```bash
npm run node
npm run deploy
```

5. Deploy to testnet:
```bash
npm run deploy:testnet
```

### Frontend Development

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm start
```

## Deployment

### Prerequisites
- Node.js and npm installed
- A wallet with ETH on Goerli testnet (for zkSync testnet deployment)
- Private key of the deployment wallet

### Environment Setup
1. Copy the example environment file:
   ```
   cp .env.example .env
   ```

2. Fill in the required environment variables in the `.env` file:
   ```
   PRIVATE_KEY=your_private_key_here
   INFURA_API_KEY=your_infura_api_key_here
   ETHERSCAN_API_KEY=your_etherscan_api_key_here
   ```

### Deploy to zkSync Testnet
1. Install dependencies:
   ```
   npm install
   ```

2. Compile the contracts:
   ```
   npx hardhat compile
   ```

3. Deploy the contracts to zkSync testnet:
   ```
   node scripts/deploy-zksync-testnet.js
   ```
   This will deploy all contracts to zkSync testnet and save the deployment information to the `deployments` directory.

4. Update your `.env` file with the testnet contract addresses:
   ```
   node scripts/update-env-testnet.js
   ```

5. Verify the contracts on zkSync testnet explorer:
   ```
   node scripts/verify-zksync-testnet.js
   ```

### Testing the Deployment
1. Run the development server:
   ```
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000/token-dashboard`

3. Connect your wallet (make sure it's connected to zkSync testnet)

4. You should now be able to interact with the deployed contracts

### Important Notes
- **DO NOT** use the mainnet deployment scripts until explicitly instructed to do so
- Always test thoroughly on testnet before deploying to mainnet
- Keep your private keys secure and never commit them to version control

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgements

- OpenZeppelin for secure contract implementations
- Chainlink for price feed oracles
- zkSync for layer 2 scaling solutions
