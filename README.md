# Researka Platform

A decentralized academic publishing platform built on blockchain technology, enabling transparent peer review, fair compensation for researchers, and efficient knowledge sharing.

## Overview

Researka is a platform that revolutionizes academic publishing by leveraging blockchain technology to create a transparent, efficient, and incentivized ecosystem for researchers, reviewers, and readers. The platform uses a native token (RSKA) to facilitate transactions, reward contributions, and enable governance.

## Tokenomics

- **Total Supply**: 100 million RSKA tokens
- **Initial Price**: $0.10 per token
- **Market Cap**: $10 million (initial)
- **Founder Allocation**: 3 million tokens (3% of total supply)
- **Token Utility**:
  - Submission fees
  - Review rewards
  - Citation royalties
  - Staking rewards
  - Governance voting

## Smart Contracts

### ResearkaToken.sol
ERC-20 token contract with the following features:
- Capped supply of 100 million tokens
- Role-based access control
- Dynamic transaction fees
- Pause/unpause functionality
- Burn mechanism for price stability

### ResearkaSubmission.sol
Manages article submissions with:
- Metadata storage
- Dynamic submission fees based on ETH/USD price
- Submission status tracking
- Review process management

### ResearkaReview.sol
Handles the peer review process:
- Reviewer assignment
- Review submission and tracking
- Review rewards distribution
- Citation tracking and royalty payments

### ResearchaTreasury.sol
Manages platform economics:
- Buyback mechanism for price stability
- Staking rewards and distribution
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

### Staking Interface
- Staking position creation
- Reward claiming
- Position management

## Project Structure

```
researka-platform/
├── contracts/               # Smart contracts
│   ├── ResearkaToken.sol    # ERC-20 token implementation
│   ├── ResearkaSubmission.sol # Submission management
│   ├── ResearkaReview.sol   # Review process management
│   ├── ResearchaTreasury.sol # Treasury and economics
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

The smart contracts can be deployed to various networks:

- **Local**: `npm run deploy`
- **Testnet**: `npm run deploy:testnet`
- **Mainnet**: `npm run deploy:mainnet`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgements

- OpenZeppelin for secure contract implementations
- Chainlink for price feed oracles
- zkSync for layer 2 scaling solutions
