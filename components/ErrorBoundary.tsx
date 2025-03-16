import React, { Component, ErrorInfo, ReactNode } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  Container, 
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
  Divider
} from '@chakra-ui/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can also log the error to an error reporting service
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Attempt to recover by trying to re-render the segment
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      return this.props.fallback || (
        <Container maxW="container.md" py={10}>
          <VStack spacing={6} align="stretch">
            <Alert 
              status="error" 
              variant="subtle" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center" 
              textAlign="center" 
              borderRadius="md"
              py={6}
            >
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={1} fontSize="xl">
                Something went wrong
              </AlertTitle>
              <AlertDescription maxWidth="sm">
                We've encountered an error while rendering this page.
              </AlertDescription>
            </Alert>
            
            <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
              <Heading size="md" mb={4}>Error Details</Heading>
              <Text fontWeight="bold">Message:</Text>
              <Code p={2} borderRadius="md" display="block" whiteSpace="pre-wrap" mb={4}>
                {this.state.error?.message || 'Unknown error'}
              </Code>
              
              {this.state.error?.stack && (
                <>
                  <Text fontWeight="bold">Stack:</Text>
                  <Code p={2} borderRadius="md" display="block" whiteSpace="pre-wrap" mb={4} fontSize="xs" maxH="200px" overflow="auto">
                    {this.state.error.stack}
                  </Code>
                </>
              )}
              
              {this.state.errorInfo && (
                <>
                  <Divider my={4} />
                  <Text fontWeight="bold">Component Stack:</Text>
                  <Code p={2} borderRadius="md" display="block" whiteSpace="pre-wrap" fontSize="xs" maxH="200px" overflow="auto">
                    {this.state.errorInfo.componentStack}
                  </Code>
                </>
              )}
            </Box>
            
            <Button colorScheme="green" onClick={this.handleReset}>
              Try Again
            </Button>
          </VStack>
        </Container>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
