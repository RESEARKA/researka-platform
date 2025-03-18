describe('Article Submission Flow', () => {
  beforeEach(() => {
    // Login before each test
    cy.login();
    
    // Visit the submit page
    cy.visit('/submit');
  });

  it('should display the article submission form for logged in users', () => {
    // Check if the submission form is visible
    cy.get('[data-testid="submission-form"]').should('be.visible');
    
    // Check for key form elements
    cy.get('input[name="title"]').should('be.visible');
    cy.get('textarea[name="abstract"]').should('be.visible');
    cy.get('[data-testid="content-editor"]').should('be.visible');
  });

  it('should validate required fields', () => {
    // Try to submit the form without filling required fields
    cy.get('[data-testid="submit-button"]').click();
    
    // Check for validation error messages
    cy.contains('Title is required').should('be.visible');
    cy.contains('Abstract is required').should('be.visible');
    cy.contains('Content is required').should('be.visible');
  });

  it('should allow uploading files', () => {
    // Check if the file upload component is visible
    cy.get('[data-testid="file-upload"]').should('be.visible');
    
    // Upload a test file
    // Note: This requires a fixture file to be present
    cy.fixture('test-document.pdf', 'base64').then(fileContent => {
      cy.get('input[type="file"]').attachFile({
        fileContent,
        fileName: 'test-document.pdf',
        mimeType: 'application/pdf'
      });
    });
    
    // Check that the file was uploaded
    cy.contains('test-document.pdf').should('be.visible');
  });

  it('should submit an article successfully', () => {
    // Fill in the submission form
    cy.get('input[name="title"]').type('Test Article Title');
    cy.get('textarea[name="abstract"]').type('This is a test abstract for the article submission flow test.');
    cy.get('[data-testid="content-editor"]').type('This is the main content of the test article. It includes multiple paragraphs and sections to simulate a real article submission.');
    
    // Select a category (adjust based on your actual UI)
    cy.get('select[name="category"]').select('Science');
    
    // Add keywords (adjust based on your actual UI)
    cy.get('input[name="keywords"]').type('test, cypress, automation');
    
    // Submit the form
    cy.get('[data-testid="submit-button"]').click();
    
    // Check for success message
    cy.contains('Article submitted successfully', { timeout: 10000 }).should('be.visible');
    
    // Check that we're redirected to a confirmation page or the article preview
    cy.url().should('include', '/submission/');
  });

  it('should save draft articles', () => {
    // Fill in partial submission form
    cy.get('input[name="title"]').type('Draft Article Title');
    cy.get('textarea[name="abstract"]').type('This is a draft abstract.');
    
    // Click save draft button
    cy.get('[data-testid="save-draft-button"]').click();
    
    // Check for draft saved message
    cy.contains('Draft saved', { timeout: 5000 }).should('be.visible');
    
    // Navigate to drafts page
    cy.visit('/drafts');
    
    // Check that our draft is listed
    cy.contains('Draft Article Title').should('be.visible');
  });

  it('should prevent submission for non-logged in users', () => {
    // First logout
    cy.window().then((win) => {
      win.localStorage.removeItem('isLoggedIn');
      win.localStorage.removeItem('userProfile');
    });
    
    // Reload the page
    cy.reload();
    
    // Check that we're redirected to login
    cy.url().should('include', '/login');
    
    // Or check for a login prompt
    cy.contains('Please log in to submit articles').should('be.visible');
  });
});
