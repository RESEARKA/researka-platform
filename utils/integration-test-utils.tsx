import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider } from '@chakra-ui/react';
import { act } from 'react-dom/test-utils';
import { MemoryRouterProvider } from 'next-router-mock/MemoryRouterProvider';
import { AuthProvider } from '../contexts/AuthContext';
import { mockUseAuth } from '../__mocks__/authContext';
import { mockUseModal } from '../__mocks__/modalContext';

// Mock components
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const MockModalProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

// Mock the AuthContext
jest.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <MockAuthProvider>{children}</MockAuthProvider>,
  useAuth: () => mockUseAuth(),
}));

// Mock the ModalContext
jest.mock('../contexts/ModalContext', () => ({
  ModalProvider: ({ children }: { children: React.ReactNode }) => <MockModalProvider>{children}</MockModalProvider>,
  useModal: () => mockUseModal(),
}));

/**
 * Custom render function for integration tests
 * Provides all necessary providers for testing components that rely on:
 * - Authentication
 * - React Query
 * - Chakra UI
 * - Next.js Router
 * - Modal Context
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
  queryClient?: QueryClient;
  authContextOverrides?: Record<string, any>;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    initialRoute = '/',
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0, // Use staleTime instead of cacheTime
        },
      },
    }),
    authContextOverrides = {},
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <MemoryRouterProvider url={initialRoute}>
        <QueryClientProvider client={queryClient}>
          {/* We're not using the AuthProvider's overrides prop since we're mocking the entire context */}
          <AuthProvider>
            <ChakraProvider>
              <MockModalProvider>
                {children}
              </MockModalProvider>
            </ChakraProvider>
          </AuthProvider>
        </QueryClientProvider>
      </MemoryRouterProvider>
    );
  };

  let renderResult: ReturnType<typeof render>;
  
  // Use act to wrap the render to catch any state updates during initial render
  act(() => {
    renderResult = render(ui, { wrapper: Wrapper, ...renderOptions });
  });

  return {
    ...renderResult!,
    queryClient,
  };
}

/**
 * Setup function for integration tests
 * Returns the rendered component with user event setup
 */
export function setupIntegrationTest(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const user = userEvent.setup();

  // Render the component wrapped in all providers
  const renderResult = renderWithProviders(ui, options);

  // Return the render result along with the user event
  return {
    ...renderResult,
    user,
    // Helper to perform actions with act
    actAsync: async (callback: () => Promise<void>) => {
      await act(async () => {
        await callback();
      });
    },
    // Helper to wait for state updates to settle
    waitForStateUpdates: async () => {
      await act(async () => {
        // This empty act will flush any pending state updates
        await new Promise(resolve => setTimeout(resolve, 0));
      });
    }
  };
}

/**
 * Mock Firebase authentication
 */
export const mockFirebaseAuth = {
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  currentUser: null as any, // Use type assertion to avoid TypeScript error
};

/**
 * Mock Firebase Firestore
 */
export const mockFirestore = {
  collection: jest.fn().mockReturnThis(),
  doc: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  onSnapshot: jest.fn(),
  add: jest.fn(),
};

/**
 * Setup mock for Firebase
 */
export function setupFirebaseMocks() {
  jest.mock('../config/firebase', () => ({
    getFirebaseAuth: jest.fn().mockReturnValue(mockFirebaseAuth),
    getFirebaseFirestore: jest.fn().mockReturnValue(mockFirestore),
    initializeFirebase: jest.fn().mockReturnValue(true),
  }));
}

/**
 * Helper to simulate authenticated user
 */
export function simulateAuthenticated(user = { uid: 'test-user-123', email: 'test@example.com' }) {
  mockFirebaseAuth.currentUser = user as any; // Use type assertion to avoid TypeScript error
  mockFirebaseAuth.onAuthStateChanged.mockImplementation((callback) => {
    callback(user);
    return jest.fn(); // Return unsubscribe function
  });
}

/**
 * Helper to simulate unauthenticated user
 */
export function simulateUnauthenticated() {
  mockFirebaseAuth.currentUser = null;
  mockFirebaseAuth.onAuthStateChanged.mockImplementation((callback) => {
    callback(null);
    return jest.fn(); // Return unsubscribe function
  });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
