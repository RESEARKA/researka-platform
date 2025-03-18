import React from 'react';
import {
  Box,
  Skeleton,
  SkeletonText,
  Flex,
  useColorModeValue,
  HStack,
  VStack
} from '@chakra-ui/react';

interface ArticleSkeletonProps {
  count?: number;
}

const ArticleSkeleton: React.FC<ArticleSkeletonProps> = ({ count = 1 }) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('white', 'gray.800');
  
  const skeletons = Array.from({ length: count }, (_, index) => (
    <Box 
      key={index}
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={4}
      borderColor={borderColor}
      bg={bgColor}
      width="100%"
      height="100%"
      transition="all 0.2s"
      _hover={{ 
        transform: 'translateY(-4px)',
        boxShadow: 'md',
        borderColor: useColorModeValue('gray.300', 'gray.600')
      }}
    >
      <Skeleton height="200px" mb={4} borderRadius="md" />
      
      <VStack align="stretch" spacing={4}>
        <SkeletonText mt={2} noOfLines={1} spacing="4" skeletonHeight="6" width="70%" />
        
        <SkeletonText mt={2} noOfLines={3} spacing="4" skeletonHeight="3" />
        
        <HStack spacing={2} mt={2}>
          <Skeleton height="20px" width="80px" borderRadius="full" />
          <Skeleton height="20px" width="80px" borderRadius="full" />
        </HStack>
        
        <Flex justify="space-between" align="center" mt={2}>
          <Skeleton height="20px" width="120px" />
          <Skeleton height="30px" width="30px" borderRadius="md" />
        </Flex>
      </VStack>
    </Box>
  ));
  
  return (
    <>
      {skeletons}
    </>
  );
};

export default ArticleSkeleton;
