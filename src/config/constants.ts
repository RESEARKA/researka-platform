// Contract and blockchain configuration
export const CONFIG = {
  CONTRACT_ADDRESS: import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
  ZKSYNC_RPC: import.meta.env.VITE_ZKSYNC_RPC || 'https://testnet.era.zksync.dev',
  DEFAULT_CHAIN_ID: import.meta.env.VITE_DEFAULT_CHAIN_ID || '0x144', // zkSync Era testnet
  SUBMISSION_FEE: {
    MIN: 10,
    MAX: 100,
    DEFAULT: 25
  },
  TOKEN_SUPPLY: 1000000
} as const;

// Application routes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/',
  SUBMIT: '/submit',
  ARTICLES: '/articles',
  GOVERNANCE: '/governance',
  ABOUT: '/about',
  PROFILE: '/profile',
};
