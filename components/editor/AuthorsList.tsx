import React from 'react';
import { Box, Heading, HStack, Text, VStack, Divider } from '@chakra-ui/react';
import { Author } from './types/citation';
import { AuthorDisplay } from './AuthorDisplay';

interface AuthorsListProps {
  authors: Author[];
  showHeading?: boolean;
}

/**
 * Displays a list of authors with their ORCID identifiers
 * Used in article headers, citation displays, and author lists
 */
export const AuthorsList: React.FC<AuthorsListProps> = ({ 
  authors, 
  showHeading = true 
}) => {
  if (!authors || authors.length === 0) {
    return null;
  }

  return (
    <Box>
      {showHeading && (
        <>
          <Heading as="h3" size="sm" mb={2}>
            Authors
          </Heading>
          <Divider mb={3} />
        </>
      )}
      
      <HStack spacing={2} flexWrap="wrap" align="center">
        {authors.map((author, index) => (
          <React.Fragment key={`${author.family}-${index}`}>
            <AuthorDisplay author={author} />
            {index < authors.length - 1 && <Text color="gray.500">,</Text>}
          </React.Fragment>
        ))}
      </HStack>
    </Box>
  );
};
