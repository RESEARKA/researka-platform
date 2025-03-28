# Client-Side Rendering Guide

This guide outlines best practices for handling client-side rendering in the DecentraJournal frontend application to prevent hydration errors and ensure consistent loading states.

## Core Tools

### 1. `useClient` Hook

The `useClient` hook is used to detect if the code is running on the client side. This helps prevent hydration errors by ensuring certain components only render on the client side.

```typescript
import useClient from '../hooks/useClient';

function MyComponent() {
  const isClient = useClient();
  
  // Only access browser APIs when on the client
  useEffect(() => {
    if (isClient) {
      // Safe to use localStorage, window, etc.
      localStorage.getItem('key');
    }
  }, [isClient]);
  
  return (
    <div>
      {isClient ? 'Client-side content' : 'Server-side fallback'}
    </div>
  );
}
```

### 2. `ClientOnly` Component

The `ClientOnly` component ensures children are only rendered on the client side. This helps prevent hydration errors by avoiding rendering components that use browser APIs during SSR.

```typescript
import ClientOnly from '../components/ClientOnly';

function MyPage() {
  return (
    <div>
      <h1>My Page</h1>
      <ClientOnly 
        fallback={<div>Loading...</div>}
        showSkeleton={true} // Optional: Use skeleton loading
        skeletonHeight="40px" // Optional: Customize skeleton
        skeletonCount={3} // Optional: Number of skeleton lines
      >
        <ComponentWithBrowserAPIs />
      </ClientOnly>
    </div>
  );
}
```

### 3. `ClientLoadingSkeleton` Component

The `ClientLoadingSkeleton` component provides a consistent loading state across the application during client-side initialization.

```typescript
import ClientLoadingSkeleton from './ui/ClientLoadingSkeleton';

function MyComponent() {
  const isClient = useClient();
  
  if (!isClient) {
    return <ClientLoadingSkeleton height="40px" count={3} />;
  }
  
  return <div>My client-side content</div>;
}
```

## Best Practices

1. **Always check for client-side before using browser APIs**:
   ```typescript
   const isClient = useClient();
   
   useEffect(() => {
     if (isClient) {
       // Safe to use browser APIs
       localStorage.getItem('key');
     }
   }, [isClient]);
   ```

2. **Provide appropriate loading states**:
   - Use `ClientLoadingSkeleton` for consistent loading UIs
   - Customize skeleton height and count based on content
   - Consider using Chakra UI's built-in Skeleton components for more complex layouts

3. **Wrap components that use browser APIs with `ClientOnly`**:
   - Components that use localStorage, window, navigator, etc.
   - Components that manipulate the DOM directly
   - Components that rely on browser-specific features

4. **Avoid unnecessary client-side rendering**:
   - Only use client-side rendering when necessary
   - Keep as much of your app as server components when possible
   - Use the Next.js App Router's built-in server/client component model

5. **Handle errors gracefully**:
   - Provide fallback UI for when client-side initialization fails
   - Add appropriate error boundaries around client-only components

## Common Hydration Error Scenarios

1. **Accessing browser APIs during SSR**:
   - Problem: Using `window`, `document`, `localStorage` during server rendering
   - Solution: Use `useClient` hook to check if on client before accessing

2. **Different content between server and client**:
   - Problem: Rendering different content on server vs. client
   - Solution: Use consistent initial state and conditional rendering with `useClient`

3. **Time-dependent rendering**:
   - Problem: Rendering content based on current time/date
   - Solution: Use the same time source for both server and client initial render

## Example Components

See these components for reference implementations:
- `FirebaseInitializationDemo.tsx`
- `LoginModal.tsx`
- `MobileNav.tsx`
- `FirebaseTest.tsx`
