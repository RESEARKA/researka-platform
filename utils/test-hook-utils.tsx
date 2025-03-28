import { renderHook, RenderHookOptions } from '@testing-library/react';
import { ReactNode } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act } from 'react-dom/test-utils';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

/**
 * Mock Firebase context for testing hooks that use Firebase
 */
export const FirebaseContext = {
  app: null as unknown as FirebaseApp,
  auth: null as unknown as Auth,
  db: null as unknown as Firestore,
  isInitialized: true
};

/**
 * Options for rendering a hook with test providers
 */
export interface RenderHookWithProvidersOptions<TProps> extends RenderHookOptions<TProps> {
  /**
   * Whether to include the QueryClientProvider
   * @default true
   */
  withQueryClient?: boolean;
  
  /**
   * Whether to include the ChakraProvider
   * @default true
   */
  withChakra?: boolean;
  
  /**
   * Whether to include mocked Firebase context
   * @default false
   */
  withFirebase?: boolean;
  
  /**
   * Initial state for the QueryClient
   */
  queryClientState?: Record<string, any>;
  
  /**
   * Custom wrapper component
   */
  customWrapper?: (props: { children: ReactNode }) => JSX.Element;
}

/**
 * Render a hook with all necessary providers for testing
 */
export function renderHookWithProviders<TProps, TResult>(
  callback: (props: TProps) => TResult,
  {
    withQueryClient = true,
    withChakra = true,
    withFirebase = false,
    queryClientState,
    customWrapper,
    ...options
  }: RenderHookWithProvidersOptions<TProps> = {}
) {
  // Create a wrapper with all the providers
  const Wrapper = ({ children }: { children: ReactNode }) => {
    let wrappedChildren = children;
    
    // Add QueryClient if requested
    if (withQueryClient) {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            cacheTime: 0,
          },
        },
      });
      
      // Populate query client with initial state if provided
      if (queryClientState) {
        Object.entries(queryClientState).forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey.split(','), data);
        });
      }
      
      wrappedChildren = (
        <QueryClientProvider client={queryClient}>
          {wrappedChildren}
        </QueryClientProvider>
      );
    }
    
    // Add ChakraProvider if requested
    if (withChakra) {
      wrappedChildren = (
        <ChakraProvider>
          {wrappedChildren}
        </ChakraProvider>
      );
    }
    
    // Add custom wrapper if provided
    if (customWrapper) {
      wrappedChildren = customWrapper({ children: wrappedChildren });
    }
    
    return <>{wrappedChildren}</>;
  };
  
  // Render the hook with the wrapper
  return renderHook(callback, {
    ...options,
    wrapper: Wrapper,
  });
}

/**
 * Mock implementations of common browser APIs for testing
 */
export const mockBrowserAPIs = () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value.toString();
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        store = {};
      }),
      key: jest.fn((index: number) => Object.keys(store)[index] || null),
      length: jest.fn(() => Object.keys(store).length),
    };
  })();
  
  // Mock sessionStorage
  const sessionStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value.toString();
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        store = {};
      }),
      key: jest.fn((index: number) => Object.keys(store)[index] || null),
      length: jest.fn(() => Object.keys(store).length),
    };
  })();
  
  // Apply mocks to global object
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });
  
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
  
  // Return the mocks for direct access in tests
  return {
    localStorage: localStorageMock,
    sessionStorage: sessionStorageMock,
  };
};

/**
 * Create a mock for the Firestore database
 */
export const createFirestoreMock = () => {
  return {
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
};

/**
 * Create a mock for Firebase Authentication
 */
export const createAuthMock = () => {
  return {
    currentUser: null,
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
  };
};

export { act };
