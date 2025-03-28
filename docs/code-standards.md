# DecentraJournal Frontend Code Standards

This document outlines the code standards and best practices for the DecentraJournal frontend application. Following these standards ensures consistency, readability, and maintainability across the codebase.

## Table of Contents

1. [Component Structure](#component-structure)
2. [Loading & Error States](#loading--error-states)
3. [Error Handling](#error-handling)
4. [Naming Conventions](#naming-conventions)
5. [TypeScript Usage](#typescript-usage)
6. [State Management](#state-management)
7. [Performance Optimization](#performance-optimization)

## Component Structure

### Shared Layout Components

We use standardized layout components to ensure consistency across the application:

- **ContentLayout**: A flexible container that handles loading and error states
- **LoadingState**: A reusable loading indicator with multiple variants
- **ErrorState**: A standardized error display with multiple variants

Example usage:

```tsx
import ContentLayout from '../components/ui/ContentLayout';

function MyComponent() {
  const { data, isLoading, error } = useMyData();
  
  return (
    <ContentLayout
      isLoading={isLoading}
      error={error}
      loadingVariant="overlay"
      errorVariant="card"
      onRetry={refetchData}
    >
      {/* Your content here */}
      {data && <DataDisplay data={data} />}
    </ContentLayout>
  );
}
```

## Loading & Error States

### LoadingState Component

The `LoadingState` component provides a consistent way to display loading indicators across the application. It supports multiple variants:

- **inline**: For inline loading indicators
- **overlay**: For loading overlays on containers
- **fullPage**: For full-page loading screens
- **container**: For loading indicators within containers

```tsx
import LoadingState from '../components/ui/LoadingState';

// Inline loading
<LoadingState variant="inline" size="sm" />

// Overlay loading
<LoadingState variant="overlay" text="Loading data..." />

// Full-page loading
<LoadingState variant="fullPage" text="Initializing application..." />

// Container loading
<LoadingState variant="container" height="200px" />
```

### ErrorState Component

The `ErrorState` component provides a consistent way to display errors across the application. It supports multiple variants:

- **inline**: For inline error messages
- **card**: For error cards with borders
- **fullPage**: For full-page error screens
- **container**: For error messages within containers

```tsx
import ErrorState from '../components/ui/ErrorState';

// Inline error
<ErrorState 
  variant="inline" 
  error={error} 
  showRetry={true} 
  onRetry={handleRetry} 
/>

// Error card
<ErrorState 
  variant="card" 
  error={error} 
  title="Failed to load profile" 
/>

// Full-page error
<ErrorState 
  variant="fullPage" 
  error={error} 
  showDetails={isDevelopment} 
/>
```

## Error Handling

### Error Categories

We use standardized error categories to ensure consistent error handling:

- **AUTHENTICATION**: Authentication-related errors
- **AUTHORIZATION**: Permission-related errors
- **VALIDATION**: Input validation errors
- **NETWORK**: Network connectivity issues
- **SERVER**: Server-side errors
- **DATABASE**: Database-related errors
- **TIMEOUT**: Request timeout errors
- **NOT_FOUND**: Resource not found errors
- **UNKNOWN**: Unclassified errors

### useErrorHandler Hook

The `useErrorHandler` hook provides standardized error handling across components:

```tsx
import useErrorHandler from '../hooks/useErrorHandler';

function MyComponent() {
  const { handleError, withErrorHandling, withRetry } = useErrorHandler({
    componentName: 'MyComponent',
    showToasts: true,
  });
  
  // Handle errors directly
  const handleClick = () => {
    try {
      // Do something
    } catch (error) {
      handleError(error, 'handleClick');
    }
  };
  
  // Wrap async functions with error handling
  const fetchData = withErrorHandling(
    async () => {
      // Fetch data
    },
    'fetchData'
  );
  
  // Wrap async functions with retry logic
  const fetchWithRetry = withRetry(
    async () => {
      // Fetch data that might fail
    },
    'fetchWithRetry',
    {
      retryCount: 3,
      retryDelay: 1000,
      onRetry: (attempt, error) => {
        console.log(`Retry attempt ${attempt}`, error);
      }
    }
  );
  
  return (
    // ...
  );
}
```

## Naming Conventions

### Components

- Use **PascalCase** for component names
- Use descriptive names that reflect the component's purpose
- Prefix components with their category if applicable (e.g., `ProfileHeader`)
- Suffix components with their type if applicable (e.g., `UserAvatar`)

Examples:
- `Button`, `Card`, `Modal` (generic components)
- `ProfileHeader`, `ArticleCard`, `ReviewList` (domain-specific components)
- `UserAvatar`, `ArticleImage`, `ProfileBanner` (specialized components)

### Hooks

- Use **camelCase** for hook names
- Prefix hooks with `use`
- Use descriptive names that reflect the hook's purpose

Examples:
- `useState`, `useEffect`, `useContext` (React built-in hooks)
- `useProfileData`, `useArticles`, `useReviews` (domain-specific hooks)
- `useLocalStorage`, `useDebounce`, `useMediaQuery` (utility hooks)

### Utility Functions

- Use **camelCase** for utility function names
- Use descriptive names that reflect the function's purpose
- Use verb-noun format for action functions (e.g., `formatDate`, `validateEmail`)

Examples:
- `formatDate`, `validateEmail`, `calculateTotal` (action functions)
- `isValidEmail`, `hasPermission`, `shouldUpdate` (predicate functions)
- `getUser`, `findArticle`, `fetchData` (getter functions)

### Types and Interfaces

- Use **PascalCase** for type and interface names
- Suffix interfaces with props when they represent component props (e.g., `ButtonProps`)
- Suffix interfaces with state when they represent component state (e.g., `ProfileState`)

Examples:
- `User`, `Article`, `Review` (domain models)
- `ButtonProps`, `CardProps`, `ModalProps` (component props)
- `ProfileState`, `AuthState`, `AppState` (component or application state)

## TypeScript Usage

- Use TypeScript for all code
- Prefer interfaces over types for object definitions
- Use type aliases for union types and complex types
- Use generics for reusable components and functions
- Use enums for fixed sets of values
- Use discriminated unions for state management

## State Management

- Use React hooks for local state management
- Use context for shared state across components
- Use custom hooks for complex state logic
- Batch state updates to minimize re-renders
- Use refs for values that don't trigger re-renders

## Performance Optimization

- Use React Server Components (RSC) when possible
- Minimize the use of `use client` directives
- Use `React.memo` for expensive components
- Use `useCallback` and `useMemo` for expensive calculations
- Use dynamic imports for code splitting
- Optimize images with Next.js Image component
- Use Suspense for loading states
