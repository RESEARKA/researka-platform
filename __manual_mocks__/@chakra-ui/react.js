// __manual_mocks__/@chakra-ui/react.js
// Updated fix for Chakra UI/Emotion testing issues based on O3's recommendation

// Re-export the real Chakra UI components
const actualChakra = jest.requireActual('@chakra-ui/react');

// Make sure __emotion_real is present on the styled function
if (actualChakra.styled && !actualChakra.styled.__emotion_real) {
  actualChakra.styled.__emotion_real = actualChakra.styled;
}

module.exports = {
  ...actualChakra,
  // You can override specific components here if needed
};
