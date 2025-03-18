# Sentry Error Monitoring Setup

This document provides instructions on how to set up and configure Sentry for error monitoring in the Researka Platform.

## What is Sentry?

Sentry is an error monitoring service that helps developers track, prioritize, and fix crashes in real-time. It provides detailed error reports, performance monitoring, and user feedback tools to help improve application quality.

## Setup Instructions

### 1. Create a Sentry Account

If you don't already have a Sentry account, sign up at [sentry.io](https://sentry.io).

### 2. Create a New Project

1. Log in to your Sentry account
2. Create a new project
3. Select "Next.js" as the platform
4. Follow the setup instructions to get your DSN (Data Source Name)

### 3. Configure Environment Variables

1. Copy the `.env.local.example` file to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Add your Sentry DSN to the `.env.local` file:
   ```
   NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
   NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
   SENTRY_ENABLED=true
   ```

### 4. Verify the Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Trigger a test error by adding the following code to a page component temporarily:
   ```jsx
   <button onClick={() => {
     throw new Error('Test error for Sentry');
   }}>
     Test Sentry Error
   </button>
   ```

3. Click the button and check your Sentry dashboard to see if the error was captured

## Using Error Handling Utilities

We've added several error handling utilities to make it easier to capture and handle errors:

### ErrorBoundary Component

Wrap components that might throw errors with the ErrorBoundary component:

```jsx
import ErrorBoundary from '../components/ErrorBoundary';

// In your component
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Error Handling Utilities

Use the error handling utilities in `utils/errorHandling.ts`:

```jsx
import { captureError, handleApiError, createError } from '../utils/errorHandling';

// Capture a client-side error
try {
  // Your code
} catch (error) {
  const message = captureError(error, { additionalContext: 'value' });
  // Display message to user
}

// In API routes
export default async function handler(req, res) {
  try {
    // Your API logic
  } catch (error) {
    const errorResponse = handleApiError(error, { 
      route: req.url,
      method: req.method 
    });
    return res.status(errorResponse.error.statusCode).json(errorResponse);
  }
}
```

## Best Practices

1. **Always use try/catch blocks** for async operations
2. **Add context to errors** to make debugging easier
3. **Use ErrorBoundary components** for UI components that might fail
4. **Create specific error types** for different error scenarios
5. **Provide user-friendly error messages** while logging detailed information to Sentry

## Additional Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Next.js with Sentry](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Error Boundary Documentation](https://reactjs.org/docs/error-boundaries.html)
