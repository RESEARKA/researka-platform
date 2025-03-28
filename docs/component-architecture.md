# DecentraJournal Frontend Component Architecture

This document outlines the component architecture patterns used in the DecentraJournal frontend application.

## Core Principles

1. **Modularity**: Break down large components into smaller, focused components
2. **Consistent State Management**: Use consistent patterns for managing state
3. **Type Safety**: Implement proper TypeScript interfaces for all components
4. **Separation of Concerns**: Separate UI, state management, and business logic

## Component Structure

### Directory Organization

Components are organized into feature-based directories:

```
components/
├── navbar/           # Navigation components
│   ├── types.ts      # Shared types for navbar components
│   ├── NavItem.tsx   # Individual navigation item
│   ├── NavLinks.tsx  # Collection of navigation links
│   ├── UserMenu.tsx  # User dropdown menu
│   └── index.tsx     # Main NavBar component
├── profile/          # Profile components
│   ├── types.ts      # Shared types for profile components
│   ├── ProfileManager.tsx  # Profile state management
│   └── index.tsx     # Main ClientOnlyProfile component
└── profile-form/     # Profile form components
    ├── types.ts      # Shared types for profile form
    ├── BasicIdentitySection.tsx  # Form sections
    └── index.ts      # Exports for profile form components
```

### Component Patterns

#### Container Components

Container components handle state management and business logic:

- `ProfileManager`: Manages profile state and operations
- `NavBar`: Handles authentication state and user profile

#### Presentational Components

Presentational components focus on UI rendering:

- `NavItem`: Renders a navigation link
- `ProfileHeader`: Displays user profile information

#### Type Files

Each component group has a dedicated type file:

- `navbar/types.ts`: Types for navbar components
- `profile/types.ts`: Types for profile components
- `profile-form/types.ts`: Types for profile form components

## State Management Patterns

### Loading States

We use enums for granular loading state management:

```typescript
export enum ProfileLoadingState {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  LOADING_PROFILE = 'loading_profile',
  // ...
}
```

With helper functions to check states:

```typescript
const isInLoadingState = (state: ProfileLoadingState) => 
  currentLoadingState === state;
```

### Preventing Duplicate Operations

We use refs to prevent duplicate operations:

```typescript
const isUpdatingProfile = useRef(false);

const handleSaveProfile = async () => {
  if (isUpdatingProfile.current) return false;
  
  try {
    isUpdatingProfile.current = true;
    // Operation logic
  } finally {
    isUpdatingProfile.current = false;
  }
};
```

### Component Lifecycle Management

We track component mount state to prevent updates after unmount:

```typescript
const isMounted = useRef(true);

useEffect(() => {
  isMounted.current = true;
  
  return () => {
    isMounted.current = false;
  };
}, []);

const updateState = (data) => {
  if (isMounted.current) {
    setState(data);
  }
};
```

## Prop Typing

All components use TypeScript interfaces for props:

```typescript
export interface NavItemProps {
  href: string;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}
```

## Error Handling

Components implement consistent error handling:

```typescript
try {
  // Operation logic
} catch (error) {
  handleError(error, 'Error message');
  logOperation('Operation failed', { error });
}
```

## Logging

Components use a consistent logging pattern:

```typescript
import { createLogger, LogCategory } from '../../utils/logger';

const logger = createLogger('ComponentName');

logger.info('User action', {
  context: { userId: user.id },
  category: LogCategory.UI
});
```

## Best Practices

1. **Keep components focused**: Each component should have a single responsibility
2. **Use TypeScript**: All components should have proper TypeScript interfaces
3. **Consistent naming**: Follow naming conventions for components and props
4. **Document complex logic**: Add comments for complex business logic
5. **Test components**: Write unit and integration tests for components
