describe('Authentication Flows', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'fake-jwt-token',
        user: {
          id: '123',
          username: 'testuser',
          email: 'test@example.com',
          role: 'author',
          isVerified: true,
          verificationStatus: 'verified'
        }
      }
    }).as('loginRequest');
    
    cy.intercept('POST', '**/api/auth/register', {
      statusCode: 201,
      body: {
        token: 'fake-jwt-token',
        user: {
          id: '456',
          username: 'newuser',
          email: 'new@example.com',
          role: 'reader',
          isVerified: false,
          verificationStatus: 'pending'
        }
      }
    }).as('registerRequest');
  });

  it('should allow a user to log in', () => {
    cy.visit('/login');
    cy.findByLabelText(/email/i).type('test@example.com');
    cy.findByLabelText(/password/i).type('Password123!');
    cy.findByRole('button', { name: /sign in/i }).click();
    
    cy.wait('@loginRequest');
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome back').should('be.visible');
  });

  it('should show validation errors for invalid login', () => {
    cy.visit('/login');
    cy.findByRole('button', { name: /sign in/i }).click();
    
    cy.contains('Email is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
  });

  it('should allow a user to register', () => {
    cy.visit('/register');
    cy.findByLabelText(/username/i).type('newuser');
    cy.findByLabelText(/email/i).type('new@example.com');
    cy.findByLabelText(/password/i).type('NewPassword123!');
    cy.findByLabelText(/confirm password/i).type('NewPassword123!');
    cy.findByRole('button', { name: /register/i }).click();
    
    cy.wait('@registerRequest');
    cy.url().should('include', '/dashboard');
  });

  it('should allow a user to log out', () => {
    // Login first
    cy.visit('/login');
    cy.findByLabelText(/email/i).type('test@example.com');
    cy.findByLabelText(/password/i).type('Password123!');
    cy.findByRole('button', { name: /sign in/i }).click();
    cy.wait('@loginRequest');
    
    // Then logout
    cy.contains('Account').click();
    cy.contains('Logout').click();
    
    // Verify redirect to home page
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });
});
