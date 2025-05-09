// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Ignore React hydration errors in tests
Cypress.on('uncaught:exception', (err) => {
  // Return false to prevent Cypress from failing the test
  if (err.message.includes('Hydration') || 
      err.message.includes('hydrating') || 
      err.message.includes('Minified React error')) {
    return false;
  }
  
  // We still want to fail the test if there are other errors
  return true;
});

// Alternatively you can use CommonJS syntax:
// require('./commands')
