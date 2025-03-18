/// <reference types="cypress" />
/// <reference types="cypress-file-upload" />
/// <reference types="cypress-axe" />

import 'cypress-file-upload';
import 'cypress-axe';

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- This is a parent command --
Cypress.Commands.add('login', () => {
  // Simulate login by setting localStorage
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('loginMethod', 'email');
  localStorage.setItem('userProfile', JSON.stringify({
    username: 'testuser',
    email: 'test@example.com',
    id: '12345'
  }));
  
  // Reload the page to apply the login state
  cy.reload();
});

// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })

// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

declare global {
  namespace Cypress {
    interface Chainable {
      login(): Chainable<void>;
      // drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
      // dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
      // visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
    }
  }
}
