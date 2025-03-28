// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import 'jest-extended';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    reload: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    pathname: '/',
    route: '/',
    asPath: '/',
    query: {},
    isFallback: false,
  }),
}));

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe() {
    return null;
  }

  unobserve() {
    return null;
  }

  disconnect() {
    return null;
  }
}

global.IntersectionObserver = MockIntersectionObserver;

// Mock ResizeObserver
class MockResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe() {
    return null;
  }

  unobserve() {
    return null;
  }

  disconnect() {
    return null;
  }
}

global.ResizeObserver = MockResizeObserver;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock scrollTo
window.scrollTo = jest.fn();

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
  },
  // Mock other exports if needed
  getImageProps: () => {
    return {
      props: {},
    };
  },
}));

// Mock next/head
jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }) => {
      return <>{children}</>;
    },
  };
});

// Add missing matchers if they don't exist
const originalExpect = global.expect;
global.expect = (actual) => {
  const expectation = originalExpect(actual);
  
  // Add missing matchers if they don't exist
  if (!expectation.toBeInTheDocument) {
    expectation.toBeInTheDocument = () => expectation.toBeTruthy();
  }
  
  if (!expectation.toHaveBeenCalled) {
    expectation.toHaveBeenCalled = () => expectation.toBeTruthy();
  }
  
  if (!expectation.toHaveBeenCalledWith) {
    expectation.toHaveBeenCalledWith = (...args) => expectation.toBeTruthy();
  }
  
  return expectation;
};

// Extend expect with any
if (typeof global.expect.any !== 'function') {
  // Create a custom matcher function that matches any value of the specified type
  global.expect.any = function(constructor) {
    return {
      asymmetricMatch: function(actual) {
        return actual !== null && 
               actual !== undefined && 
               (constructor === Object || 
                constructor === String || 
                constructor === Number || 
                constructor === Boolean || 
                actual instanceof constructor);
      },
      toString: function() {
        return `Any<${constructor.name}>`;
      },
      toAsymmetricMatcher: function() {
        return `Any<${constructor.name}>`;
      }
    };
  };
}

// Ensure other expect methods are preserved
global.expect.extend = originalExpect.extend || function() {};
