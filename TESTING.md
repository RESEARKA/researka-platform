# Testing Strategy

This document outlines the testing approach for the Researka platform.

## Testing Infrastructure

The project uses the following testing tools:

- **Jest**: For unit and component testing
- **React Testing Library**: For component testing
- **Cypress**: For end-to-end testing

## Running Tests

```bash
# Run Jest tests in watch mode
pnpm test --watch

# Run Jest tests once
pnpm test

# Open Cypress test runner
pnpm cypress:open

# Run Cypress tests headlessly
pnpm cypress:run

# Run all end-to-end tests
pnpm test:e2e
```

## Testing Guidelines

### Unit Tests

Unit tests should focus on testing individual functions and components in isolation. Mock dependencies when necessary.

### Component Tests

Component tests should verify that components render correctly and respond to user interactions as expected.

### End-to-End Tests

End-to-end tests should cover critical user flows such as:
- Authentication
- Article submission
- Article review

## UI components

### Chakra UI components

Chakra uses Emotion to generate class names and inline styles at runtime.
Inside **jsdom** (our Jest environment) that styling layer is stripped down,
so many widgets appear as "empty" `<button />` or `<div />` elements in the
rendered markup.

**Testing strategy**

| Layer | What we test | Tool |
|-------|--------------|------|
| **Unit** | Component mounts without throwing. No assertions on DOM shape, styles, or visibility. | Jest + Testing Library |
| **Integration / E2E** | Real-world interactions (hover states, focus rings, responsive menus, etc.). | Cypress |

If you find yourself reaching for `querySelector('.chakra-button…')` in a unit
test, move that scenario to Cypress instead—where the component is rendered in
a real browser and Chakra's CSS actually runs.

## Best Practices

1. **Test behavior, not implementation**: Focus on what the component does, not how it does it.
2. **Use role-based queries**: Prefer queries like `getByRole` over `getByTestId` for better accessibility testing.
3. **Keep tests simple**: Each test should verify one specific behavior.
4. **Use meaningful assertions**: Make assertions that verify the expected outcome from a user's perspective.
5. **Avoid testing library internals**: Don't test the behavior of third-party libraries.
