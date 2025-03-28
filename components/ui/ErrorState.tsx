import React from 'react';
import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  Button, 
  Icon, 
  useColorModeValue,
  VStack
} from '@chakra-ui/react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

export type ErrorStateVariant = 'inline' | 'card' | 'fullPage' | 'container';

export interface ErrorStateProps {
  /**
   * Error object or error message
   */
  error?: Error | string | null;
  
  /**
   * Custom error title
   * @default 'An error occurred'
   */
  title?: string;
  
  /**
   * Custom error message
   * If not provided, will use error.message or a default message
   */
  message?: string;
  
  /**
   * Whether to show a retry button
   * @default true
   */
  showRetry?: boolean;
  
  /**
   * Text for the retry button
   * @default 'Try Again'
   */
  retryText?: string;
  
  /**
   * Callback function when retry button is clicked
   */
  onRetry?: () => void;
  
  /**
   * Variant of the error state
   * - inline: Minimal display for inline errors
   * - card: Card-style error with border and background
   * - fullPage: Fixed position covering the entire viewport
   * - container: Fills the parent container
   * @default 'card'
   */
  variant?: ErrorStateVariant;
  
  /**
   * Custom height for the container
   * Only applicable for 'container' variant
   */
  height?: string | number;
  
  /**
   * Custom width for the container
   * Only applicable for 'container' variant
   */
  width?: string | number;
  
  /**
   * Whether to show the error details (for developers)
   * @default process.env.NODE_ENV === 'development'
   */
  showDetails?: boolean;
  
  /**
   * Additional class name
   */
  className?: string;
  
  /**
   * Additional styles
   */
  style?: React.CSSProperties;
}

/**
 * ErrorState component
 * 
 * A flexible error display that can be used in various contexts:
 * - As an inline error message
 * - As a card with error details
 * - As a full-page error
 * - As a container with an error message
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  title = 'An error occurred',
  message,
  showRetry = true,
  retryText = 'Try Again',
  onRetry,
  variant = 'card',
  height,
  width,
  showDetails = process.env.NODE_ENV === 'development',
  className,
  style,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('red.100', 'red.800');
  const iconColor = useColorModeValue('red.500', 'red.300');
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  
  // Determine the error message to display
  const errorMessage = message || 
    (error instanceof Error ? error.message : 
      (typeof error === 'string' ? error : 'Something went wrong. Please try again.'));
  
  // Core content with icon, title, message, and retry button
  const content = (
    <VStack spacing={4} align={variant === 'inline' ? 'start' : 'center'} w="100%">
      {variant !== 'inline' && (
        <Icon 
          as={FiAlertTriangle} 
          color={iconColor} 
          boxSize={variant === 'fullPage' ? 12 : 8} 
          mb={2}
        />
      )}
      
      <Heading 
        as="h3" 
        size={variant === 'fullPage' ? 'lg' : variant === 'inline' ? 'xs' : 'md'} 
        color={headingColor}
        textAlign={variant === 'inline' ? 'left' : 'center'}
      >
        {title}
      </Heading>
      
      <Text 
        color={textColor} 
        textAlign={variant === 'inline' ? 'left' : 'center'}
        fontSize={variant === 'inline' ? 'sm' : 'md'}
      >
        {errorMessage}
      </Text>
      
      {/* Show error details in development */}
      {showDetails && error instanceof Error && error.stack && variant !== 'inline' && (
        <Box 
          p={3} 
          bg={useColorModeValue('gray.50', 'gray.900')} 
          borderRadius="md" 
          w="100%" 
          maxW="100%" 
          overflowX="auto"
          fontSize="xs"
          fontFamily="monospace"
          mt={2}
        >
          <Text whiteSpace="pre-wrap">{error.stack}</Text>
        </Box>
      )}
      
      {showRetry && onRetry && (
        <Button 
          leftIcon={<FiRefreshCw />} 
          colorScheme="blue" 
          size={variant === 'inline' ? 'sm' : 'md'} 
          onClick={onRetry}
          mt={2}
        >
          {retryText}
        </Button>
      )}
    </VStack>
  );
  
  // Render different variants
  switch (variant) {
    case 'fullPage':
      return (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg={bgColor}
          zIndex="overlay"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={8}
          className={className}
          style={style}
        >
          <Box maxW="600px" w="100%">
            {content}
          </Box>
        </Box>
      );
      
    case 'container':
      return (
        <Flex
          align="center"
          justify="center"
          height={height || '200px'}
          width={width || '100%'}
          className={className}
          style={style}
        >
          <Box maxW="600px" w="100%" p={4}>
            {content}
          </Box>
        </Flex>
      );
      
    case 'card':
      return (
        <Box
          p={4}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="md"
          bg={useColorModeValue('red.50', 'rgba(254, 178, 178, 0.1)')}
          w="100%"
          className={className}
          style={style}
        >
          {content}
        </Box>
      );
      
    case 'inline':
    default:
      return (
        <Box
          py={2}
          color={iconColor}
          className={className}
          style={style}
        >
          {content}
        </Box>
      );
  }
};

export default ErrorState;
