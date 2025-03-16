// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command for login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.findByLabelText(/email/i).type(email);
  cy.findByLabelText(/password/i).type(password);
  cy.findByRole('button', { name: /sign in/i }).click();
  // Wait for redirect to dashboard after successful login
  cy.url().should('include', '/dashboard');
});

// Custom command to submit an article
Cypress.Commands.add('submitArticle', (title: string, abstract: string) => {
  cy.visit('/submit');
  cy.findByLabelText(/title/i).type(title);
  cy.findByLabelText(/abstract/i).type(abstract);
  cy.findByRole('button', { name: /next/i }).click();
  // Continue with the rest of the submission flow
});

// Declare global Cypress namespace to add custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      submitArticle(title: string, abstract: string): Chainable<void>;
    }
  }
}
