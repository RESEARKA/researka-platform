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
  
  if (!author.orcid) {
    return <Text>{authorName}</Text>;
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
  
  // If tooltip is disabled, just return the link
  if (!showTooltip) {
    return authorLink;
  }
  
  // Otherwise wrap in a tooltip
  return (
    <Tooltip 
      label={`ORCID: ${author.orcid}`}
      hasArrow
      openDelay={300}
      placement="top"
    >
      {authorLink}
    </Tooltip>
  );
};
