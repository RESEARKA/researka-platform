import React, { useState } from 'react';
import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react';

const TestPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;

  const handlePageChange = (newPage: number) => {
    console.log(`Changing page to ${newPage}`);
    setCurrentPage(newPage);
  };

  return (
    <Box p={8}>
      <Heading mb={4}>Pagination Test Page</Heading>
      <Text mb={8}>Current Page: {currentPage} of {totalPages}</Text>

      <Flex justifyContent="center" gap={2} mb={8}>
        <Button 
          onClick={() => handlePageChange(currentPage - 1)}
          isDisabled={currentPage === 1}
          colorScheme="blue"
        >
          Previous
        </Button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <Button
            key={`page-${page}`}
            onClick={() => handlePageChange(page)}
            colorScheme={currentPage === page ? "blue" : "gray"}
            variant={currentPage === page ? "solid" : "outline"}
          >
            {page}
          </Button>
        ))}
        
        <Button 
          onClick={() => handlePageChange(currentPage + 1)}
          isDisabled={currentPage === totalPages}
          colorScheme="blue"
        >
          Next
        </Button>
      </Flex>

      <Box p={4} bg="gray.100" borderRadius="md">
        <Text>Page content for page {currentPage}</Text>
        <Text mt={2} fontSize="sm" color="gray.600">
          This is a simple test to verify that pagination state updates correctly.
        </Text>
      </Box>
    </Box>
  );
};

export default TestPage;
