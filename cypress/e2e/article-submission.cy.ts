describe('Article Submission Flow', () => {
  beforeEach(() => {
    // Mock the login API
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'fake-jwt-token',
        user: {
          id: '123',
          username: 'authoruser',
          email: 'author@university.edu',
          role: 'author',
          isVerified: true,
          verificationStatus: 'verified'
        }
      }
    }).as('loginRequest');
    
    // Mock the article submission API
    cy.intercept('POST', '**/api/articles', {
      statusCode: 201,
      body: {
        id: 'article-123',
        title: 'Test Article',
        abstract: 'This is a test article abstract',
        status: 'submitted'
      }
    }).as('submitArticleRequest');
    
    // Login as an author
    cy.visit('/login');
    cy.findByLabelText(/email/i).type('author@university.edu');
    cy.findByLabelText(/password/i).type('AuthorPass123!');
    cy.findByRole('button', { name: /sign in/i }).click();
    cy.wait('@loginRequest');
  });

  it('should allow an author to submit an article', () => {
    // Navigate to submit page
    cy.visit('/submit');
    
    // Step 1: Basic Information
    cy.findByLabelText(/title/i).type('Test Article Title');
    cy.findByLabelText(/abstract/i).type('This is a comprehensive abstract for the test article that describes the research methodology and findings.');
    cy.findByLabelText(/keywords/i).type('test, research, article');
    cy.findByRole('button', { name: /next/i }).click();
    
    // Step 2: Authors Information
    cy.findByRole('button', { name: /add co-author/i }).click();
    cy.findByLabelText(/co-author name/i).type('Jane Doe');
    cy.findByLabelText(/co-author email/i).type('jane.doe@university.edu');
    cy.findByLabelText(/co-author affiliation/i).type('University Research Department');
    cy.findByRole('button', { name: /save/i }).click();
    cy.findByRole('button', { name: /next/i }).click();
    
    // Step 3: File Upload
    // Mock the file upload
    cy.get('input[type=file]').attachFile({
      fileContent: 'test file content',
      fileName: 'article.pdf',
      mimeType: 'application/pdf'
    });
    cy.findByRole('button', { name: /upload/i }).click();
    cy.contains('File uploaded successfully').should('be.visible');
    cy.findByRole('button', { name: /next/i }).click();
    
    // Step 4: Review and Submit
    cy.contains('Test Article Title').should('be.visible');
    cy.contains('This is a comprehensive abstract').should('be.visible');
    cy.findByRole('button', { name: /submit article/i }).click();
    
    // Wait for submission and check redirect
    cy.wait('@submitArticleRequest');
    cy.url().should('include', '/submit/success');
    cy.contains('Article submitted successfully').should('be.visible');
  });

  it('should validate required fields during submission', () => {
    cy.visit('/submit');
    
    // Try to proceed without filling required fields
    cy.findByRole('button', { name: /next/i }).click();
    
    // Check for validation errors
    cy.contains('Title is required').should('be.visible');
    cy.contains('Abstract is required').should('be.visible');
  });
});
