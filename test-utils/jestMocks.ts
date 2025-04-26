// test-utils/jestMocks.ts

/**
 * Mocks IntersectionObserver for consistent test behavior across suites.
 */
export const mockIntersectionObserver = () => {
  const ioMock = jest.fn(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
  (global as any).IntersectionObserver = ioMock;
};

/**
 * Mocks ResizeObserver for consistent test behavior.
 */
export const mockResizeObserver = () => {
  const roMock = jest.fn(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
  (global as any).ResizeObserver = roMock;
};

/**
 * Mocks window.matchMedia for consistent test behavior.
 */
export const mockMatchMedia = () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
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
};
