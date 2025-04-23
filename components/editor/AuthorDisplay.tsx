import React from 'react';
import { Text, HStack, Link, Tooltip } from '@chakra-ui/react';
import { Author } from './types/citation';
import { OrcidIcon } from '../common/OrcidIcon';

interface AuthorDisplayProps {
  author: Author;
  showTooltip?: boolean;
}

/**
 * Displays an author's name with optional ORCID integration
 * If the author has an ORCID ID, it displays the ORCID icon and links to their profile
 */
export const AuthorDisplay: React.FC<AuthorDisplayProps> = ({ 
  author, 
  showTooltip = true 
}) => {
  const authorName = `${author.given} ${author.family}`;
  
  // Create the full display with affiliation if available
  const displayContent = (
    <HStack spacing={1} alignItems="center">
      <Text>{authorName}</Text>
      {author.affiliation && (
        <Text fontSize="sm" color="gray.600" ml={1}>({author.affiliation})</Text>
      )}
      {!author.orcid && (
        <Text fontSize="sm" color="gray.500">(ORCID ID: Pending)</Text>
      )}
    </HStack>
  );
  
  if (!author.orcid) {
    return displayContent;
  }
  
  const authorLink = (
    <Link 
      href={`https://orcid.org/${author.orcid}`} 
      isExternal 
      color="inherit" 
      textDecoration="none"
      _hover={{ textDecoration: 'underline' }}
      aria-label={`${authorName}'s ORCID profile: ${author.orcid}`}
      display="inline-flex"
      alignItems="center"
    >
      {authorName}
      <OrcidIcon 
        color="#A6CE39" 
        boxSize={4} 
        ml={1} 
        aria-hidden="true" 
      />
    </Link>
  );
  
  // If tooltip is disabled, just return the link with affiliation
  if (!showTooltip) {
    return (
      <HStack spacing={1} alignItems="center">
        {authorLink}
        {author.affiliation && (
          <Text fontSize="sm" color="gray.600" ml={1}>({author.affiliation})</Text>
        )}
      </HStack>
    );
  }
  
  // Otherwise show with tooltip
  return (
    <Tooltip 
      label={`View ${authorName}'s ORCID profile`}
      placement="top"
      hasArrow
    >
      <HStack spacing={1} alignItems="center">
        {authorLink}
        {author.affiliation && (
          <Text fontSize="sm" color="gray.600" ml={1}>({author.affiliation})</Text>
        )}
      </HStack>
    </Tooltip>
  );
};
