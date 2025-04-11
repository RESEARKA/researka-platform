import React from 'react';
import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { Box, Tooltip, Text } from '@chakra-ui/react';
import { Citation, CitationFormat } from '../types/citation';

interface CitationComponentProps extends NodeViewProps {
  node: {
    attrs: {
      id: string;
      format: CitationFormat;
    };
  };
  extension: {
    options: {
      citations: Citation[];
      formatCitation: (citation: Citation, format: CitationFormat) => string;
    };
  };
}

export const CitationComponent: React.FC<CitationComponentProps> = ({
  node,
  extension,
}) => {
  const { id, format } = node.attrs;
  const { citations, formatCitation } = extension.options;
  
  // Find the citation in the list
  const citation = citations.find(c => c.id === id);
  
  if (!citation) {
    return (
      <NodeViewWrapper as="span">
        <Box
          as="span"
          bg="red.100"
          color="red.800"
          px={1}
          borderRadius="sm"
          fontSize="sm"
        >
          [Citation not found]
        </Box>
      </NodeViewWrapper>
    );
  }
  
  // Format the in-text citation
  const authorYear = getInTextCitation(citation, format);
  
  // Format the full citation for the tooltip
  const fullCitation = formatCitation(citation, format);
  
  return (
    <NodeViewWrapper as="span">
      <Tooltip
        label={
          <Box maxW="400px" p={2}>
            <Text fontSize="sm" fontStyle="italic">
              {fullCitation}
            </Text>
          </Box>
        }
        placement="top"
        hasArrow
      >
        <Box
          as="span"
          bg="blue.50"
          color="blue.800"
          px={1}
          borderRadius="sm"
          cursor="pointer"
          _hover={{ bg: 'blue.100' }}
          data-citation-id={id}
        >
          {authorYear}
        </Box>
      </Tooltip>
    </NodeViewWrapper>
  );
};

/**
 * Generate an in-text citation based on the format
 */
function getInTextCitation(citation: Citation, format: CitationFormat): string {
  const firstAuthor = citation.authors[0];
  
  switch (format) {
    case 'apa':
      if (!firstAuthor) {
        return `(${citation.year})`;
      }
      
      if (citation.authors.length === 1) {
        return `(${firstAuthor.family}, ${citation.year})`;
      }
      
      if (citation.authors.length === 2) {
        return `(${firstAuthor.family} & ${citation.authors[1].family}, ${citation.year})`;
      }
      
      return `(${firstAuthor.family} et al., ${citation.year})`;
      
    case 'mla':
      if (!firstAuthor) {
        return `(${citation.title.split(' ').slice(0, 3).join(' ')}... ${citation.year})`;
      }
      
      return `(${firstAuthor.family} ${citation.year})`;
      
    case 'chicago':
      if (!firstAuthor) {
        return `(${citation.year})`;
      }
      
      return `(${firstAuthor.family} ${citation.year})`;
      
    case 'harvard':
      if (!firstAuthor) {
        return `(${citation.year})`;
      }
      
      if (citation.authors.length === 1) {
        return `(${firstAuthor.family}, ${citation.year})`;
      }
      
      if (citation.authors.length === 2) {
        return `(${firstAuthor.family} and ${citation.authors[1].family}, ${citation.year})`;
      }
      
      return `(${firstAuthor.family} et al., ${citation.year})`;
      
    case 'ieee':
      // IEEE uses numbered citations
      return `[${citation.id.slice(0, 2)}]`;
      
    default:
      if (!firstAuthor) {
        return `(${citation.year})`;
      }
      
      return `(${firstAuthor.family}, ${citation.year})`;
  }
}
