import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3001',
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
      });
    },
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
  },
});
