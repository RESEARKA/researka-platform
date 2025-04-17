import React from 'react';
import { 
  Box, Text, VStack, Heading, 
  Divider, Link, HStack, Badge 
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { FiExternalLink } from 'react-icons/fi';
import CitationBadge from '../article/CitationBadge';

// Define types for publications
interface Publication {
  id: string;
  title: string;
  journal?: string;
  year?: number;
  doi?: string;
  url?: string;
  citations?: number;
}

interface PublicationsListProps {
  publications: Publication[];
  isLoading?: boolean;
}

/**
 * A component that displays a list of publications
 * Shows title, journal, year, citations, and links
 */
export const PublicationsList: React.FC<PublicationsListProps> = ({ 
  publications, 
  isLoading = false 
}) => {
  if (isLoading) {
    return <Box p={4} textAlign="center">Loading publications...</Box>;
  }
  
  if (!publications || publications.length === 0) {
    return (
      <Box p={4} bg="gray.50" borderRadius="md" textAlign="center">
        <Text>No publications found</Text>
      </Box>
    );
  }
  
  return (
    <Box>
      <Heading size="md" mb={4}>Publications ({publications.length})</Heading>
      
      <VStack spacing={4} align="stretch" divider={<Divider />}>
        {publications.map(pub => (
          <Box key={pub.id} p={3} borderRadius="md" _hover={{ bg: 'gray.50' }}>
            <Text fontWeight="bold" mb={1}>{pub.title}</Text>
            
            <HStack fontSize="sm" color="gray.600" mb={2} flexWrap="wrap">
              {pub.journal && <Text>{pub.journal}</Text>}
              {pub.year && <Text>({pub.year})</Text>}
            </HStack>
            
            <HStack spacing={3} flexWrap="wrap">
              {pub.citations !== undefined && (
                <CitationBadge count={pub.citations} size="sm" />
              )}
              
              {pub.doi && (
                <Link href={`https://doi.org/${pub.doi}`} isExternal fontSize="sm">
                  DOI <FiExternalLink style={{ display: 'inline' }} />
                </Link>
              )}
              
              {pub.url && !pub.doi && (
                <Link href={pub.url} isExternal fontSize="sm">
                  View <FiExternalLink style={{ display: 'inline' }} />
                </Link>
              )}
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default PublicationsList;
