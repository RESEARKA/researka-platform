describe('Accessibility Tests', () => {
  it('should check home page for accessibility issues', () => {
    cy.visit('/');
    cy.injectAxe();
    cy.checkA11y();
  });

  it('should check search page for accessibility issues', () => {
    cy.visit('/search');
    cy.injectAxe();
    cy.checkA11y();
  });

  it('should check login modal for accessibility issues', () => {
    cy.visit('/');
    cy.contains('Login').click();
    cy.injectAxe();
    // Only check the modal, not the entire page
    cy.checkA11y('[role="dialog"]', {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa']
      }
    });
  });

  it('should check article page for accessibility issues', () => {
    // Visit an article page (you'll need to adjust the URL to match an actual article)
    cy.visit('/article/1');
    cy.injectAxe();
    cy.checkA11y();
  });

  it('should check submission page for accessibility issues when logged in', () => {
    // Login first
    cy.login();
    
    // Visit the submission page
    cy.visit('/submit');
    cy.injectAxe();
    cy.checkA11y();
  });

  it('should check for color contrast issues', () => {
    cy.visit('/');
    cy.injectAxe();
    cy.checkA11y(null, {
      runOnly: {
        type: 'rule',
        values: ['color-contrast']
      }
    });
  });

  it('should check for keyboard navigation issues', () => {
    cy.visit('/');
    cy.injectAxe();
    cy.checkA11y(null, {
      runOnly: {
        type: 'rule',
        values: ['keyboard']
      }
    });
  });
});
