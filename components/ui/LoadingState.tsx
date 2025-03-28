import React from 'react';
import { Box, Flex, Spinner, Text, useColorModeValue } from '@chakra-ui/react';

export type LoadingStateSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LoadingStateVariant = 'overlay' | 'inline' | 'fullPage' | 'container';

export interface LoadingStateProps {
  /**
   * Size of the loading spinner
   * @default 'md'
   */
  size?: LoadingStateSize;
  
  /**
   * Text to display below the spinner
   * @default 'Loading...'
   */
  text?: string;
  
  /**
   * Whether to show the text
   * @default true
   */
  showText?: boolean;
  
  /**
   * Variant of the loading state
   * - overlay: Positioned absolute within a relative parent
   * - inline: Displayed inline with content
   * - fullPage: Fixed position covering the entire viewport
   * - container: Fills the parent container
   * @default 'inline'
   */
  variant?: LoadingStateVariant;
  
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
   * Background color
   * @default 'transparent' for inline, semi-transparent for others
   */
  backgroundColor?: string;
  
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
 * LoadingState component
 * 
 * A flexible loading indicator that can be used in various contexts:
 * - As an inline element
 * - As an overlay on a container
 * - As a full-page loading indicator
 * - As a container with a loading indicator
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  size = 'md',
  text = 'Loading...',
  showText = true,
  variant = 'inline',
  height,
  width,
  backgroundColor,
  className,
  style,
}) => {
  const spinnerColor = useColorModeValue('blue.500', 'blue.300');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const bgColor = backgroundColor || useColorModeValue(
    variant === 'inline' ? 'transparent' : 'whiteAlpha.800',
    variant === 'inline' ? 'transparent' : 'blackAlpha.800'
  );
  
  // Core content with spinner and optional text
  const content = (
    <Flex direction="column" align="center" justify="center">
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor={useColorModeValue('gray.200', 'gray.700')}
        color={spinnerColor}
        size={size}
        mb={showText && text ? 4 : 0}
      />
      {showText && text && (
        <Text color={textColor} fontSize={size === 'xs' ? 'xs' : 'sm'} fontWeight="medium">
          {text}
        </Text>
      )}
    </Flex>
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
          className={className}
          style={style}
        >
          {content}
        </Box>
      );
      
    case 'overlay':
      return (
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg={bgColor}
          zIndex="1"
          display="flex"
          alignItems="center"
          justifyContent="center"
          className={className}
          style={style}
        >
          {content}
        </Box>
      );
      
    case 'container':
      return (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height={height || '200px'}
          width={width || '100%'}
          bg={bgColor}
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
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          className={className}
          style={style}
        >
          {content}
        </Box>
      );
  }
};

export default LoadingState;
