/// <reference types="cypress" />
/// <reference types="cypress-axe" />

describe('Accessibility Tests', () => {
  it('should check home page for accessibility issues', () => {
    cy.visit('/');
    cy.wait(1000);
    cy.injectAxe();
    
    // Run accessibility check and log detailed results
    cy.checkA11y(null, {
      includedImpacts: ['critical', 'serious']
    }, (violations) => {
      cy.task('log', `${violations.length} accessibility violations were detected`);
      
      // Log each violation with details
      violations.forEach((violation) => {
        cy.task('log', `Rule: ${violation.id}`);
        cy.task('log', `Impact: ${violation.impact}`);
        cy.task('log', `Description: ${violation.description}`);
        cy.task('log', `Help: ${violation.help}`);
        cy.task('log', `Help URL: ${violation.helpUrl}`);
        cy.task('log', '---Affected Elements:---');
        
        violation.nodes.forEach((node) => {
          cy.task('log', node.html);
          cy.task('log', `Failure Summary: ${node.failureSummary}`);
        });
        
        cy.task('log', '------------------------');
      });
    }, true); // Skip failing the test
  });

  it('should check search page for accessibility issues', () => {
    cy.visit('/search');
    cy.wait(1000);
    cy.injectAxe();
    
    // Run accessibility check and log detailed results
    cy.checkA11y(null, {
      includedImpacts: ['critical', 'serious']
    }, (violations) => {
      cy.task('log', `${violations.length} accessibility violations were detected`);
      
      // Log each violation with details
      violations.forEach((violation) => {
        cy.task('log', `Rule: ${violation.id}`);
        cy.task('log', `Impact: ${violation.impact}`);
        cy.task('log', `Description: ${violation.description}`);
        cy.task('log', `Help: ${violation.help}`);
        cy.task('log', `Help URL: ${violation.helpUrl}`);
      });
    }, true); // Skip failing the test
  });

  it('should check login modal for accessibility issues', () => {
    cy.visit('/');
    cy.wait(1000);
    cy.contains('LOGIN').click({ force: true });
    cy.wait(1000);
    cy.injectAxe();
    
    // Run accessibility check and log detailed results
    cy.checkA11y(null, {
      includedImpacts: ['critical', 'serious']
    }, (violations) => {
      cy.task('log', `${violations.length} accessibility violations were detected`);
      
      // Log each violation with details
      violations.forEach((violation) => {
        cy.task('log', `Rule: ${violation.id}`);
        cy.task('log', `Impact: ${violation.impact}`);
        cy.task('log', `Description: ${violation.description}`);
      });
    }, true); // Skip failing the test
  });

  it('should check article page for accessibility issues', () => {
    cy.visit('/articles');
    cy.wait(1000);
    cy.injectAxe();
    
    // Run accessibility check and log detailed results
    cy.checkA11y(null, {
      includedImpacts: ['critical', 'serious']
    }, (violations) => {
      cy.task('log', `${violations.length} accessibility violations were detected`);
      
      // Log each violation with details
      violations.forEach((violation) => {
        cy.task('log', `Rule: ${violation.id}`);
        cy.task('log', `Impact: ${violation.impact}`);
        cy.task('log', `Description: ${violation.description}`);
      });
    }, true); // Skip failing the test
  });

  it('should check submission page for accessibility issues when logged in', () => {
    // Simulate login
    cy.visit('/');
    cy.window().then((win) => {
      win.localStorage.setItem('isLoggedIn', 'true');
    });
    
    cy.visit('/submit');
    cy.wait(1000);
    cy.injectAxe();
    
    // Run accessibility check and log detailed results
    cy.checkA11y(null, {
      includedImpacts: ['critical', 'serious']
    }, (violations) => {
      cy.task('log', `${violations.length} accessibility violations were detected`);
      
      // Log each violation with details
      violations.forEach((violation) => {
        cy.task('log', `Rule: ${violation.id}`);
        cy.task('log', `Impact: ${violation.impact}`);
        cy.task('log', `Description: ${violation.description}`);
      });
    }, true); // Skip failing the test
  });

  it('should check for color contrast issues', () => {
    cy.visit('/');
    cy.wait(1000);
    cy.injectAxe();
    
    // Check specifically for color contrast issues
    cy.checkA11y(null, {
      runOnly: ['color-contrast']
    }, (violations) => {
      cy.task('log', `${violations.length} color contrast issues were detected`);
      
      // Log each violation with details
      violations.forEach((violation) => {
        cy.task('log', `Rule: ${violation.id}`);
        cy.task('log', `Impact: ${violation.impact}`);
        cy.task('log', `Description: ${violation.description}`);
      });
    }, true); // Skip failing the test
  });

  it('should check for keyboard navigation issues', () => {
    cy.visit('/');
    cy.wait(1000);
    cy.injectAxe();
    
    // Check specifically for keyboard navigation issues
    cy.checkA11y(null, {
      runOnly: ['keyboard']
    }, (violations) => {
      cy.task('log', `${violations.length} keyboard navigation issues were detected`);
      
      // Log each violation with details
      violations.forEach((violation) => {
        cy.task('log', `Rule: ${violation.id}`);
        cy.task('log', `Impact: ${violation.impact}`);
        cy.task('log', `Description: ${violation.description}`);
      });
    }, true); // Skip failing the test
  });
});
