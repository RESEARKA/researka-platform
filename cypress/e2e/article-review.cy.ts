describe('Article Review Flow', () => {
  beforeEach(() => {
    // Mock the login API
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'fake-jwt-token',
        user: {
          id: '456',
          username: 'revieweruser',
          email: 'reviewer@university.edu',
          role: 'reviewer',
          isVerified: true,
          verificationStatus: 'verified'
        }
      }
    }).as('loginRequest');
    
    // Mock the review dashboard API
    cy.intercept('GET', '**/api/reviews/pending', {
      statusCode: 200,
      body: [
        {
          id: 'review-123',
          articleId: 'article-123',
          title: 'Test Article for Review',
          abstract: 'This is a test article abstract for review',
          submittedDate: '2025-03-01T12:00:00Z',
          status: 'pending_review'
        }
      ]
    }).as('getPendingReviews');
    
    // Mock the specific article API
    cy.intercept('GET', '**/api/articles/article-123', {
      statusCode: 200,
      body: {
        id: 'article-123',
        title: 'Test Article for Review',
        abstract: 'This is a test article abstract for review',
        content: 'Full article content would be here',
        authors: [
          {
            name: 'John Smith',
            email: 'john.smith@university.edu',
            affiliation: 'University Research Department'
          }
        ],
        fileUrl: 'https://example.com/articles/article-123.pdf',
        status: 'pending_review'
      }
    }).as('getArticleDetails');
    
    // Mock the submit review API
    cy.intercept('POST', '**/api/reviews', {
      statusCode: 201,
      body: {
        id: 'review-feedback-123',
        articleId: 'article-123',
        reviewerId: '456',
        status: 'completed',
        recommendation: 'accept',
        comments: 'This is a great article with solid methodology.'
      }
    }).as('submitReview');
    
    // Login as a reviewer
    cy.visit('/login');
    cy.findByLabelText(/email/i).type('reviewer@university.edu');
    cy.findByLabelText(/password/i).type('ReviewerPass123!');
    cy.findByRole('button', { name: /sign in/i }).click();
    cy.wait('@loginRequest');
  });

  it('should allow a reviewer to review an article', () => {
    // Navigate to review dashboard
    cy.visit('/review-dashboard');
    cy.wait('@getPendingReviews');
    
    // Select an article to review
    cy.contains('Test Article for Review').click();
    cy.wait('@getArticleDetails');
    
    // Verify article details are displayed
    cy.contains('Test Article for Review').should('be.visible');
    cy.contains('This is a test article abstract for review').should('be.visible');
    
    // Fill in review form
    cy.findByLabelText(/methodology/i).select('4');
    cy.findByLabelText(/originality/i).select('5');
    cy.findByLabelText(/clarity/i).select('4');
    cy.findByLabelText(/significance/i).select('5');
    
    cy.findByLabelText(/recommendation/i).select('accept');
    cy.findByLabelText(/comments/i).type('This is a well-written article with sound methodology and significant findings. The research contributes meaningfully to the field.');
    
    // Submit the review
    cy.findByRole('button', { name: /submit review/i }).click();
    cy.wait('@submitReview');
    
    // Verify success page
    cy.url().should('include', '/review/success');
    cy.contains('Review submitted successfully').should('be.visible');
  });

  it('should validate all required fields in the review form', () => {
    // Navigate to review dashboard and select an article
    cy.visit('/review-dashboard');
    cy.wait('@getPendingReviews');
    cy.contains('Test Article for Review').click();
    cy.wait('@getArticleDetails');
    
    // Try to submit without filling required fields
    cy.findByRole('button', { name: /submit review/i }).click();
    
    // Check for validation errors
    cy.contains('Methodology rating is required').should('be.visible');
    cy.contains('Originality rating is required').should('be.visible');
    cy.contains('Clarity rating is required').should('be.visible');
    cy.contains('Significance rating is required').should('be.visible');
    cy.contains('Recommendation is required').should('be.visible');
    cy.contains('Comments are required').should('be.visible');
  });
});
