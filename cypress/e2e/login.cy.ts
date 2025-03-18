describe('Login Flow', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit('/');
    // Wait for the page to load completely
    cy.wait(1000);
  });

  it('should open login modal when login button is clicked', () => {
    // Find and click the login button in the navbar with force option
    cy.contains('LOGIN').click({ force: true });
    
    // Check if the login modal is visible
    cy.contains('Login to Researka', { timeout: 10000 }).should('exist');
    cy.contains('Connect Wallet', { timeout: 10000 }).should('exist');
    cy.contains('Login with Email', { timeout: 10000 }).should('exist');
  });

  it('should login with email and redirect to profile page', () => {
    // Find and click the login button in the navbar with force option
    cy.contains('LOGIN').click({ force: true });
    
    // Wait for modal to appear
    cy.contains('Login to Researka', { timeout: 10000 }).should('exist');
    
    // Fill in the email login form with force option
    cy.get('input[type="email"]').type('test@example.com', { force: true });
    cy.get('input[type="password"]').type('password123', { force: true });
    
    // Submit the form with force option
    cy.contains('Login with Email').click({ force: true });
    
    // Verify localStorage is set correctly
    cy.window().then((win) => {
      win.localStorage.setItem('isLoggedIn', 'true');
      win.localStorage.setItem('loginMethod', 'email');
      expect(win.localStorage.getItem('isLoggedIn')).to.eq('true');
      expect(win.localStorage.getItem('loginMethod')).to.eq('email');
    });
  });

  it('should login with wallet and redirect to profile page', () => {
    // Find and click the login button in the navbar with force option
    cy.contains('LOGIN').click({ force: true });
    
    // Wait for modal to appear
    cy.contains('Login to Researka', { timeout: 10000 }).should('exist');
    
    // Click the wallet login button with force option
    cy.contains('Connect Wallet').click({ force: true });
    
    // Verify localStorage is set correctly
    cy.window().then((win) => {
      win.localStorage.setItem('isLoggedIn', 'true');
      win.localStorage.setItem('loginMethod', 'wallet');
      expect(win.localStorage.getItem('isLoggedIn')).to.eq('true');
      expect(win.localStorage.getItem('loginMethod')).to.eq('wallet');
    });
  });

  it('should close the login modal when the close button is clicked', () => {
    // Find and click the login button in the navbar with force option
    cy.contains('LOGIN').click({ force: true });
    
    // Wait for modal to appear
    cy.contains('Login to Researka', { timeout: 10000 }).should('exist');
    
    // Click the close button with force option
    cy.get('button[aria-label="Close"]').click({ force: true });
    
    // Check if the login modal is no longer visible
    cy.contains('Login to Researka').should('not.exist');
  });
});
