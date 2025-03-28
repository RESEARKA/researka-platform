import React from 'react';
import { Box, BoxProps } from '@chakra-ui/react';
import LoadingState, { LoadingStateProps } from './LoadingState';
import ErrorState, { ErrorStateProps } from './ErrorState';

export interface ContentLayoutProps extends BoxProps {
  /**
   * Whether the content is loading
   */
  isLoading?: boolean;
  
  /**
   * Error object or error message
   */
  error?: Error | string | null;
  
  /**
   * Props to pass to the LoadingState component
   */
  loadingProps?: Omit<LoadingStateProps, 'variant'>;
  
  /**
   * Props to pass to the ErrorState component
   */
  errorProps?: Omit<ErrorStateProps, 'error' | 'variant'>;
  
  /**
   * How to display the loading state
   * @default 'overlay'
   */
  loadingVariant?: LoadingStateProps['variant'];
  
  /**
   * How to display the error state
   * @default 'container'
   */
  errorVariant?: ErrorStateProps['variant'];
  
  /**
   * Whether to render children when loading
   * @default true
   */
  renderChildrenWhileLoading?: boolean;
  
  /**
   * Whether to render children when there's an error
   * @default false
   */
  renderChildrenWhileError?: boolean;
  
  /**
   * Minimum height for the container
   * @default 'auto'
   */
  minHeight?: string | number;
}

/**
 * ContentLayout component
 * 
 * A layout component that handles loading and error states consistently.
 * It wraps content and shows appropriate loading or error UI based on the state.
 */
const ContentLayout: React.FC<ContentLayoutProps> = ({
  children,
  isLoading = false,
  error = null,
  loadingProps = {},
  errorProps = {},
  loadingVariant = 'overlay',
  errorVariant = 'container',
  renderChildrenWhileLoading = true,
  renderChildrenWhileError = false,
  minHeight = 'auto',
  position = 'relative',
  ...boxProps
}) => {
  // Determine if we should show the error state
  const hasError = !!error;
  
  return (
    <Box
      position={position}
      minHeight={minHeight}
      {...boxProps}
    >
      {/* Render children based on conditions */}
      {((!isLoading && !hasError) || 
        (isLoading && renderChildrenWhileLoading) || 
        (hasError && renderChildrenWhileError)) && children}
      
      {/* Show loading state */}
      {isLoading && (
        <LoadingState
          variant={loadingVariant}
          {...loadingProps}
        />
      )}
      
      {/* Show error state */}
      {hasError && !isLoading && (
        <ErrorState
          error={error}
          variant={errorVariant}
          {...errorProps}
        />
      )}
    </Box>
  );
};

export default ContentLayout;
