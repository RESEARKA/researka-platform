const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFiles: ['<rootDir>/jest.setup.pre.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  injectGlobals: true,
  moduleNameMapper: {
    // Only map the two main Emotion entry points to their CJS builds as recommended by O3
    '^@emotion/react$': '<rootDir>/node_modules/@emotion/react/dist/emotion-react.cjs.js',
    '^@emotion/styled$': '<rootDir>/node_modules/@emotion/styled/dist/emotion-styled.cjs.js',
    
    // Other module mappings remain unchanged
    '^pdfjs-dist$': '<rootDir>/__mocks__/pdfjs-dist.ts',
    '^react-dom/client$': '<rootDir>/__mocks__/react-dom/client.ts',
    '^pdfjs-dist/build/pdf$': '<rootDir>/__mocks__/pdfjs-dist-build-pdf.js',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
    '^@/utils/(.*)$': '<rootDir>/utils/$1',
    '^@/contexts/(.*)$': '<rootDir>/contexts/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
    '\.(jpg|jpeg|png|gif|webp|avif|svg)$': '<rootDir>/__mocks__/fileMock.js',
    'pdfjs-dist/build/pdf.worker.entry.js': '<rootDir>/__mocks__/pdfWorkerMock.js',
    'pdfjs-dist/build/pdf': '<rootDir>/__mocks__/pdfjs-dist-build-pdf.js',
    '@react-pdf/renderer': '<rootDir>/__mocks__/reactPdfRendererMock.js',
    '@solana/wallet-adapter-react-ui': '<rootDir>/__mocks__/solanaWalletAdapterReactUiMock.js',
  },
  // Tell Jest to transpile node_modules that ship ESM
  transformIgnorePatterns: [
    'node_modules/(?!(@chakra-ui|@emotion|framer-motion)/)',
  ],
  moduleDirectories: ['node_modules', 'components', '__mocks__', '<rootDir>'],
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'pages/**/*.{js,jsx,ts,tsx}',
    'utils/**/*.{js,jsx,ts,tsx}',
    'contexts/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/coverage/',
  ],
  transform: {
    // Use babel-jest to transpile tests with the next/babel preset
    // https://jestjs.io/docs/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.jest.json', // Use our Jest-specific TypeScript config
    },
  },
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
