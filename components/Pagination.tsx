import React from 'react';
import { Flex, Button, Text, IconButton, useColorModeValue } from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  const buttonColorScheme = useColorModeValue('blue', 'teal');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // Calculate range around current page
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pageNumbers.push('ellipsis1');
    }
    
    // Add pages around current page
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pageNumbers.push('ellipsis2');
    }
    
    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };
  
  if (totalPages <= 1) return null;
  
  return (
    <Flex justify="center" align="center" wrap="wrap" my={6} gap={2}>
      {/* First page button */}
      <IconButton
        aria-label="First page"
        icon={<FiChevronsLeft />}
        onClick={() => onPageChange(1)}
        isDisabled={currentPage === 1}
        size="sm"
        variant="outline"
        colorScheme={buttonColorScheme}
      />
      
      {/* Previous page button */}
      <IconButton
        aria-label="Previous page"
        icon={<FiChevronLeft />}
        onClick={() => onPageChange(currentPage - 1)}
        isDisabled={currentPage === 1}
        size="sm"
        variant="outline"
        colorScheme={buttonColorScheme}
      />
      
      {/* Page numbers */}
      {getPageNumbers().map((page, index) => {
        if (page === 'ellipsis1' || page === 'ellipsis2') {
          return (
            <Text key={`ellipsis-${index}`} mx={1} color={textColor}>
              ...
            </Text>
          );
        }
        
        return (
          <Button
            key={`page-${page}`}
            size="sm"
            variant={currentPage === page ? "solid" : "outline"}
            colorScheme={buttonColorScheme}
            onClick={() => onPageChange(page as number)}
          >
            {page}
          </Button>
        );
      })}
      
      {/* Next page button */}
      <IconButton
        aria-label="Next page"
        icon={<FiChevronRight />}
        onClick={() => onPageChange(currentPage + 1)}
        isDisabled={currentPage === totalPages}
        size="sm"
        variant="outline"
        colorScheme={buttonColorScheme}
      />
      
      {/* Last page button */}
      <IconButton
        aria-label="Last page"
        icon={<FiChevronsRight />}
        onClick={() => onPageChange(totalPages)}
        isDisabled={currentPage === totalPages}
        size="sm"
        variant="outline"
        colorScheme={buttonColorScheme}
      />
    </Flex>
  );
};

export default Pagination;
