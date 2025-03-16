# Researka Platform Testing Documentation

This document outlines the testing strategy and setup for the Researka platform.

## End-to-End Testing

End-to-end tests verify that the critical user flows of the application work as expected from the user's perspective. These tests simulate real user interactions with the application.

### Test Coverage

The end-to-end tests cover the following critical user flows:

1. **Authentication Flows**
   - User login
   - User registration
   - Form validation
   - Logout functionality

2. **Article Submission Flows**
   - Complete article submission process
   - Form validation
   - Co-author management
   - File uploads

3. **Article Review Flows**
   - Reviewer dashboard navigation
   - Article review process
   - Review form validation
   - Review submission

### Running the Tests

To run the end-to-end tests, you can use the following npm scripts:

```bash
# Open Cypress Test Runner (interactive mode)
npm run cypress:open

# Run all tests headlessly (CI mode)
npm run cypress:run

# Run end-to-end tests (alias for cypress:run)
npm run test:e2e
```

### Test Structure

The tests are organized in the following directory structure:

- `cypress/e2e/` - Contains the test files
- `cypress/fixtures/` - Contains test data
- `cypress/support/` - Contains custom commands and global configuration

### Adding New Tests

When adding new tests:

1. Consider which critical user flow you are testing
2. Use the existing custom commands where possible
3. Mock API responses for consistent test results
4. Test both happy paths and error scenarios

## Continuous Integration

These tests are designed to be run in a CI environment. When setting up CI:

1. Install dependencies with `npm ci`
2. Build the application with `npm run build`
3. Start the application server
4. Run the tests with `npm run test:e2e`

## Best Practices

- Keep tests independent of each other
- Clean up any test data after tests run
- Use descriptive test names that explain the behavior being tested
- Use data-testid attributes for more reliable element selection
