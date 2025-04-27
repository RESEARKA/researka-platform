// This file runs before tests to set up the environment
// Keep it minimal to avoid module resolution issues
console.log('Jest pre-setup running...');

/**
 * Fix for Chakra UI/Emotion integration issues in Jest
 * 
 * The main problem is that Jest loads two different copies of Emotion:
 * - One through Chakra UI's imports (ES modules build)
 * - Another through our Jest setup (CommonJS build)
 * 
 * This causes the "__emotion_real" property to be missing when components are inspected,
 * because they were created with one version but checked with another.
 */

// Patch @emotion/styled
const emotionStyled = require('@emotion/styled');
if (emotionStyled && !emotionStyled.__emotion_real) {
  emotionStyled.__emotion_real = emotionStyled;
}
if (emotionStyled.default && !emotionStyled.default.__emotion_real) {
  emotionStyled.default.__emotion_real = emotionStyled.default;
}

// Patch @emotion/react
const emotionReact = require('@emotion/react');
if (emotionReact && !emotionReact.__emotion_real) {
  emotionReact.__emotion_real = emotionReact;
}
if (emotionReact.default && !emotionReact.default.__emotion_real) {
  emotionReact.default.__emotion_real = emotionReact.default;
}
