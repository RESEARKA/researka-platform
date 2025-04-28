// Mock implementation of imageOptimizer utilities
const createResponsiveImage = jest.fn((src, options = {}) => ({
  src: `optimized-${src}`,
  srcSet: `optimized-${src} 1x, optimized-${src} 2x`,
}));

const isMobileDevice = jest.fn(() => false);

// Export the mocked functions
module.exports = {
  createResponsiveImage,
  isMobileDevice,
};
