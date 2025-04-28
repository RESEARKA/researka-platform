// Make window.location writable to avoid errors in components that redirect
beforeAll(() => {
  // Setup portal mock for modal testing
  require('./test-utils/portal-mock').setupPortalMock();
  
  // jsdom defines window.location as read-only; redefine with a stub
  delete global.window.location;
  // minimal subset used by NavBar.handleLogout
  global.window.location = { href: '', assign: jest.fn() };
});

// Import essential Jest matchers before anything else
import '@testing-library/jest-dom';
import 'jest-extended'; // Restore for objectContaining etc.

// Import our Chakra test utilities
import './test-utils/chakra-test-utils';

// Polyfill for Node environments without TextEncoder (needed for WordParserPlugin)
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = function TextEncoder() {
    return {
      encode: function(str) {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          bytes.push(char & 0xff);
        }
        return {
          buffer: new Uint8Array(bytes).buffer
        };
      }
    };
  };
}

// Polyfill for File and Blob arrayBuffer methods used in WordParserPlugin
if (!File.prototype.arrayBuffer) {
  File.prototype.arrayBuffer = function() {
    return Promise.resolve(
      new TextEncoder().encode('dummy content').buffer
    );
  };
}

if (!Blob.prototype.arrayBuffer) {
  Blob.prototype.arrayBuffer = File.prototype.arrayBuffer;
}

// Mock Sentry to avoid actual error reporting during tests
jest.mock('@sentry/nextjs', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  setUser: jest.fn(),
  setContext: jest.fn(),
  setTag: jest.fn(),
  withSentry: (component) => component, // Pass-through for HOCs
  BrowserTracing: jest.fn().mockImplementation(() => ({ name: 'BrowserTracing' })),
  // Add any other Sentry functions your code might import/use
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    ...jest.requireActual('framer-motion'),
    AnimatePresence: ({ children }) => <>{children}</>,
    motion: {
      div: React.forwardRef((props, ref) => <div ref={ref} {...props} />),
      span: React.forwardRef((props, ref) => <span ref={ref} {...props} />),
      button: React.forwardRef((props, ref) => <button ref={ref} {...props} />),
      a: React.forwardRef((props, ref) => <a ref={ref} {...props} />),
      ul: React.forwardRef((props, ref) => <ul ref={ref} {...props} />),
      li: React.forwardRef((props, ref) => <li ref={ref} {...props} />),
      p: React.forwardRef((props, ref) => <p ref={ref} {...props} />),
    }
  };
});

// Mock next/router for tests
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
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.entries = new Map();
  }

  observe(element) {
    const entry = {
      isIntersecting: false,
      intersectionRatio: 0,
      target: element,
    };
    this.entries.set(element, entry);
    this.callback([entry], this);
    return entry;
  }

  unobserve(element) {
    this.entries.delete(element);
  }

  disconnect() {
    this.entries.clear();
  }

  triggerIntersection(element, isIntersecting = true, intersectionRatio = 1) {
    const entry = this.entries.get(element);
    if (entry) {
      entry.isIntersecting = isIntersecting;
      entry.intersectionRatio = intersectionRatio;
      this.callback([entry], this);
    }
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
    this.entries = new Map();
  }

  observe(element) {
    const entry = {
      contentRect: { width: 100, height: 100 },
      target: element,
    };
    this.entries.set(element, entry);
    this.callback([entry], this);
    return entry;
  }

  unobserve(element) {
    this.entries.delete(element);
  }

  disconnect() {
    this.entries.clear();
  }

  triggerResize(element, contentRect = { width: 200, height: 200 }) {
    const entry = this.entries.get(element);
    if (entry) {
      entry.contentRect = contentRect;
      this.callback([entry], this);
    }
  }
};

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

// Add TypeScript declarations for Jest matchers
if (typeof global.beforeAll === 'function') {
  // Only run in Jest environment
  const originalExpect = global.expect;
  if (originalExpect) {
    global.expect = Object.assign(
      // Add missing TypeScript definitions for Jest matchers
      (actual) => {
        const matchers = originalExpect(actual);
        return matchers;
      },
      originalExpect
    );
  }
}
