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
    /* ---------- Emotion: Comprehensive mapping for all Emotion packages ---------- */
    // Based on o3 recommendation - ensure all Emotion packages use CJS builds
    '^@emotion/react$': '<rootDir>/node_modules/@emotion/react/dist/emotion-react.cjs.js',
    '^@emotion/styled$': '<rootDir>/node_modules/@emotion/styled/dist/emotion-styled.cjs.js',
    '^@emotion/cache$': '<rootDir>/node_modules/@emotion/cache/dist/emotion-cache.cjs.js',
    '^@emotion/css$': '<rootDir>/node_modules/@emotion/css/dist/emotion-css.cjs.js',
    '^@emotion/server$': '<rootDir>/node_modules/@emotion/server/dist/emotion-server.cjs.js',
    '^@emotion/serialize$': '<rootDir>/node_modules/@emotion/serialize/dist/emotion-serialize.cjs.js',
    '^@emotion/use-insertion-effect-with-fallbacks$': '<rootDir>/node_modules/@emotion/use-insertion-effect-with-fallbacks/dist/emotion-use-insertion-effect-with-fallbacks.cjs.js',
    '^@emotion/utils$': '<rootDir>/node_modules/@emotion/utils/dist/emotion-utils.cjs.js',
    '^@emotion/weak-memoize$': '<rootDir>/node_modules/@emotion/weak-memoize/dist/emotion-weak-memoize.cjs.js',

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
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
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
