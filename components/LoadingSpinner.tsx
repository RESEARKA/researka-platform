import React from 'react';
import { Flex, Spinner, Text, useColorModeValue, Box } from '@chakra-ui/react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullPage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...', 
  fullPage = false 
}) => {
  const spinnerColor = useColorModeValue('blue.500', 'blue.300');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  
  const content = (
    <Flex direction="column" align="center" justify="center">
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor={useColorModeValue('gray.200', 'gray.700')}
        color={spinnerColor}
        size={size}
        mb={text ? 4 : 0}
      />
      {text && (
        <Text color={textColor} fontSize={size} fontWeight="medium">
          {text}
        </Text>
      )}
    </Flex>
  );
  
  if (fullPage) {
    return (
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg={useColorModeValue('whiteAlpha.800', 'blackAlpha.800')}
        zIndex="overlay"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {content}
      </Box>
    );
  }
  
  return content;
};

export default LoadingSpinner;
