/**
 * ErrorBoundary Component
 * 
 * A component that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the whole app.
 * This is especially useful for handling errors in context consumers.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Heading, Text, Button, VStack, Code, useColorModeValue } from '@chakra-ui/react';
import { createLogger, LogCategory } from '../../utils/logger';

// Create a logger instance for this component
const logger = createLogger('ErrorBoundary');

// Props for the ErrorBoundary component
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

// State for the ErrorBoundary component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Default fallback UI for when an error occurs
 */
const DefaultFallback: React.FC<{
  error: Error | null;
  resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box
      p={6}
      m={4}
      borderRadius="md"
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="md"
    >
      <VStack spacing={4} align="stretch">
        <Heading as="h2" size="lg" color="brand.700">
          Something went wrong
        </Heading>
        
        <Text>
          An error occurred while rendering this component. Please try again or contact support if the problem persists.
        </Text>
        
        {error && (
          <Box
            p={3}
            borderRadius="md"
            bg={useColorModeValue('gray.100', 'gray.900')}
            overflowX="auto"
          >
            <Code>{error.toString()}</Code>
          </Box>
        )}
        
        <Button
          colorScheme="green"
          onClick={resetErrorBoundary}
          alignSelf="flex-start"
        >
          Try again
        </Button>
      </VStack>
    </Box>
  );
};

/**
 * ErrorBoundary component
 * Catches errors in child components and displays a fallback UI
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  // Static method to derive state from error
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  // Lifecycle method called when an error occurs
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error
    logger.error('Error caught by boundary', {
      context: { error, componentStack: errorInfo.componentStack },
      category: LogCategory.ERROR
    });
    
    // Update state with error info
    this.setState({
      errorInfo
    });
    
    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  // Reset the error state
  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Call onReset callback if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;
    
    // If there's an error, show the fallback UI
    if (hasError) {
      // Use custom fallback if provided, otherwise use default
      if (fallback) {
        return fallback;
      }
      
      return (
        <DefaultFallback
          error={error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }
    
    // Otherwise, render children normally
    return children;
  }
}

export default ErrorBoundary;

/**
 * Hook to create a component wrapped in an ErrorBoundary
 * @param Component Component to wrap
 * @param errorBoundaryProps Props for the ErrorBoundary
 * @returns Wrapped component
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps: Omit<ErrorBoundaryProps, 'children'> = {}
): React.FC<P> {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const WrappedComponent: React.FC<P> = (props) => {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
  
  WrappedComponent.displayName = `withErrorBoundary(${displayName})`;
  
  return WrappedComponent;
}
