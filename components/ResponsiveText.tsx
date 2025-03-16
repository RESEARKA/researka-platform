import React from 'react';
import { Text, TextProps, Heading, HeadingProps } from '@chakra-ui/react';

// Text style variants
export type TextStyleVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'h4' 
  | 'body' 
  | 'body-sm' 
  | 'caption' 
  | 'button';

// Props for the responsive text component
interface ResponsiveTextProps extends Omit<TextProps, 'textStyle'> {
  variant: TextStyleVariant;
  children: React.ReactNode;
}

/**
 * Responsive text component that adapts to different screen sizes
 */
export const ResponsiveText: React.FC<ResponsiveTextProps> = ({ 
  variant, 
  children, 
  ...props 
}) => {
  // Define text styles for different variants
  const textStyles = {
    h1: {
      as: 'h1',
      fontSize: { base: '2xl', md: '3xl', lg: '4xl' },
      fontWeight: 'bold',
      lineHeight: { base: 1.2, md: 1.1 },
      letterSpacing: 'tight',
      mb: { base: 3, md: 4 }
    },
    h2: {
      as: 'h2',
      fontSize: { base: 'xl', md: '2xl', lg: '3xl' },
      fontWeight: 'semibold',
      lineHeight: { base: 1.3, md: 1.2 },
      letterSpacing: 'tight',
      mb: { base: 2, md: 3 }
    },
    h3: {
      as: 'h3',
      fontSize: { base: 'lg', md: 'xl', lg: '2xl' },
      fontWeight: 'semibold',
      lineHeight: 1.3,
      mb: { base: 2, md: 2 }
    },
    h4: {
      as: 'h4',
      fontSize: { base: 'md', md: 'lg' },
      fontWeight: 'semibold',
      lineHeight: 1.4,
      mb: 2
    },
    body: {
      fontSize: { base: 'md', md: 'md' },
      lineHeight: 1.6,
      mb: 4
    },
    'body-sm': {
      fontSize: { base: 'sm', md: 'md' },
      lineHeight: 1.6,
      mb: 3
    },
    caption: {
      fontSize: { base: 'xs', md: 'sm' },
      color: 'gray.600',
      lineHeight: 1.5,
      mb: 2
    },
    button: {
      fontSize: { base: 'sm', md: 'md' },
      fontWeight: 'medium',
      lineHeight: 1.4
    }
  };

  // Get the style for the current variant
  const style = textStyles[variant];
  
  // Use Heading component for h1-h4 variants
  if (['h1', 'h2', 'h3', 'h4'].includes(variant)) {
    return (
      <Heading
        {...style as HeadingProps}
        {...props}
      >
        {children}
      </Heading>
    );
  }
  
  // Use Text component for other variants
  return (
    <Text
      {...style as TextProps}
      {...props}
    >
      {children}
    </Text>
  );
};

export default ResponsiveText;
