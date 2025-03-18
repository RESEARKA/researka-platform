describe('Article Search Flow', () => {
  beforeEach(() => {
    // Visit the search page before each test
    cy.visit('/search');
  });

  it('should display the search page with search input', () => {
    // Check if the search page is loaded with the search input
    cy.get('input[placeholder*="Search"]').should('be.visible');
  });

  it('should allow searching for articles', () => {
    // Type a search query
    cy.get('input[placeholder*="Search"]').type('blockchain');
    
    // Submit the search (either by pressing Enter or clicking a search button)
    cy.get('input[placeholder*="Search"]').type('{enter}');
    
    // Wait for search results to load
    // This depends on how your search results are structured
    // You might need to adjust the selector
    cy.get('[data-testid="search-results"]', { timeout: 10000 }).should('exist');
  });

  it('should display search filters', () => {
    // Check if search filters are visible
    cy.contains('Filters').should('be.visible');
    
    // Expand filters if they are collapsed
    cy.contains('Filters').click();
    
    // Check for common filter options
    // Adjust these based on your actual filter options
    cy.contains('Date').should('be.visible');
    cy.contains('Category').should('be.visible');
  });

  it('should apply search filters', () => {
    // Type a search query
    cy.get('input[placeholder*="Search"]').type('research');
    
    // Submit the search
    cy.get('input[placeholder*="Search"]').type('{enter}');
    
    // Wait for search results to load
    cy.get('[data-testid="search-results"]', { timeout: 10000 }).should('exist');
    
    // Expand filters if they are collapsed
    cy.contains('Filters').click();
    
    // Select a filter option (adjust based on your actual UI)
    cy.contains('Category').parent().contains('Science').click();
    
    // Check that the filter is applied
    // This will depend on how your UI shows applied filters
    cy.get('[data-testid="applied-filters"]').should('contain', 'Science');
    
    // Check that search results are updated
    cy.get('[data-testid="search-results"]').should('exist');
  });

  it('should navigate to an article detail page when a search result is clicked', () => {
    // Type a search query
    cy.get('input[placeholder*="Search"]').type('blockchain');
    
    // Submit the search
    cy.get('input[placeholder*="Search"]').type('{enter}');
    
    // Wait for search results to load
    cy.get('[data-testid="search-results"]', { timeout: 10000 }).should('exist');
    
    // Click on the first search result
    cy.get('[data-testid="search-result-item"]').first().click();
    
    // Check that we've navigated to an article detail page
    // This will depend on your URL structure and page content
    cy.url().should('include', '/article/');
    
    // Check for article content elements
    cy.get('[data-testid="article-title"]').should('be.visible');
    cy.get('[data-testid="article-content"]').should('be.visible');
  });
});
