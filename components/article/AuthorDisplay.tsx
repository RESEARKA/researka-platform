import React from 'react';
import { Text, Box, Flex, Link, Tooltip } from '@chakra-ui/react';
import { OrcidIcon } from '../common/OrcidIcon';

interface AuthorDisplayProps {
  authorId: string;
  displayName?: string;
  name?: string;
  affiliation?: string;
  orcid?: string;
}

/**
 * AuthorDisplay component
 * 
 * A simple component to display author information with proper fallbacks
 * and ORCID integration if available.
 */
export const AuthorDisplay: React.FC<AuthorDisplayProps> = ({
  authorId,
  displayName,
  name,
  affiliation,
  orcid
}) => {
  // Use displayName or name, or fallback to authorId (wallet address)
  const authorName = displayName || name || authorId;
  
  // Determine if we're displaying a wallet address (no human-readable name)
  const isWalletAddress = !displayName && !name;
  
  console.log('AuthorDisplay rendering:', { authorId, displayName, name, authorName, isWalletAddress });
  
  return (
    <Box mb={3}>
      <Flex direction="column" justify="flex-start" align="flex-start">
        {/* Author Name */}
        <Text fontSize="md" fontWeight="medium" mb={1}>
          {authorName}
        </Text>
        
        {/* ORCID ID if available */}
        {orcid && (
          <Flex align="center" mb={1}>
            <Tooltip label={`ORCID: ${orcid}`} hasArrow placement="top">
              <Link 
                href={`https://orcid.org/${orcid}`}
                isExternal
                display="flex"
                alignItems="center"
                color="green.700"
                fontSize="sm"
              >
                <OrcidIcon boxSize={4} mr={1} />
                {orcid}
              </Link>
            </Tooltip>
          </Flex>
        )}
        
        {/* Show "ORCID: Pending" if no ORCID but we have a name */}
        {!orcid && !isWalletAddress && (
          <Text fontSize="sm" color="gray.500" mb={1}>
            (ORCID ID: Pending)
          </Text>
        )}
        
        {/* Affiliation/University */}
        {affiliation && (
          <Text fontSize="sm" color="gray.600" mb={1}>
            Affiliation: {affiliation}
          </Text>
        )}
      </Flex>
    </Box>
  );
};
