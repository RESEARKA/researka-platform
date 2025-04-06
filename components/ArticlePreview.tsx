import React from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Divider,
  Flex,
  Icon,
  Tooltip
} from '@chakra-ui/react';
import { FiEdit, FiAlertCircle } from 'react-icons/fi';

// Define the Article interface based on our standardized template
interface Article {
  title: string;
  abstract: string;
  keywords: string[];
  introduction: string;
  literatureReview?: string;
  methods: string;
  results: string;
  discussion: string;
  conclusion?: string;
  acknowledgments?: string;
  declarations: {
    ethics?: string;
    conflictOfInterest?: string;
    funding?: string;
  };
  references: string[];
  appendices?: string;
  supplementaryMaterial?: string;
  authorName: string;
  authorEmail: string;
  authorAffiliation: string;
  isCorrespondingAuthor: boolean;
  category: string;
  license: string;
}

interface ArticlePreviewProps {
  article: Article;
  onSectionEdit: (section: string) => void;
  validationErrors: Record<string, string>;
}

/**
 * Component to display a preview of the article with edit buttons for each section
 */
export const ArticlePreview: React.FC<ArticlePreviewProps> = ({
  article,
  onSectionEdit,
  validationErrors
}) => {
  // Helper function to render a section with edit button
  const renderSection = (
    title: string,
    content: string | string[] | undefined,
    sectionKey: string,
    isRequired = true
  ) => {
    const hasError = !!validationErrors[sectionKey];
    const isEmpty = !content || (Array.isArray(content) && content.length === 0) || (typeof content === 'string' && content.trim() === '');
    
    // Calculate word count for text content
    let wordCount = 0;
    if (typeof content === 'string' && content) {
      wordCount = content.split(/\s+/).filter(Boolean).length;
    }
    
    // Calculate item count for array content
    let itemCount = 0;
    if (Array.isArray(content)) {
      itemCount = content.length;
    }
    
    return (
      <Box mb={6} position="relative">
        <Flex justifyContent="space-between" alignItems="center" mb={2}>
          <HStack>
            <Heading as="h3" size="md">{title}</Heading>
            {!isRequired && (
              <Badge colorScheme="gray" fontSize="xs">Optional</Badge>
            )}
            {hasError && (
              <Tooltip label={validationErrors[sectionKey]}>
                <Box as="span" color="red.500">
                  <Icon as={FiAlertCircle} />
                </Box>
              </Tooltip>
            )}
          </HStack>
          <Button
            size="sm"
            leftIcon={<FiEdit />}
            onClick={() => onSectionEdit(sectionKey)}
            colorScheme={hasError ? "red" : "blue"}
            variant="outline"
          >
            Edit
          </Button>
        </Flex>
        
        {/* Display content or placeholder */}
        {isEmpty ? (
          <Text color="gray.500" fontStyle="italic">
            {isRequired ? 'Required section - Please add content' : 'Optional section - No content added'}
          </Text>
        ) : (
          <>
            {Array.isArray(content) ? (
              <VStack align="start" spacing={1}>
                {content.map((item, index) => (
                  <Text key={index}>{item}</Text>
                ))}
                <Text fontSize="sm" color="gray.500" mt={2}>
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </Text>
              </VStack>
            ) : (
              <>
                <Text whiteSpace="pre-wrap">
                  {typeof content === 'string' && content.length > 500
                    ? `${content.substring(0, 500)}...`
                    : content}
                </Text>
                {typeof content === 'string' && (
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    {wordCount} {wordCount === 1 ? 'word' : 'words'}
                  </Text>
                )}
              </>
            )}
          </>
        )}
      </Box>
    );
  };
  
  // Helper function to render nested sections (like declarations)
  const renderNestedSection = (
    title: string,
    parent: string,
    subsections: Record<string, string | undefined>,
    labels: Record<string, string>
  ) => {
    const hasError = Object.keys(subsections).some(key => !!validationErrors[`${parent}.${key}`]);
    
    return (
      <Box mb={6}>
        <Flex justifyContent="space-between" alignItems="center" mb={2}>
          <HStack>
            <Heading as="h3" size="md">{title}</Heading>
            {hasError && (
              <Box as="span" color="red.500">
                <Icon as={FiAlertCircle} />
              </Box>
            )}
          </HStack>
        </Flex>
        
        <VStack align="stretch" spacing={4} pl={4} mt={2}>
          {Object.entries(subsections).map(([key, value]) => {
            const sectionKey = `${parent}.${key}`;
            const hasSubError = !!validationErrors[sectionKey];
            
            return (
              <Box key={key}>
                <Flex justifyContent="space-between" alignItems="center" mb={1}>
                  <HStack>
                    <Heading as="h4" size="sm">{labels[key]}</Heading>
                    {hasSubError && (
                      <Tooltip label={validationErrors[sectionKey]}>
                        <Box as="span" color="red.500">
                          <Icon as={FiAlertCircle} />
                        </Box>
                      </Tooltip>
                    )}
                  </HStack>
                  <Button
                    size="xs"
                    leftIcon={<FiEdit />}
                    onClick={() => onSectionEdit(sectionKey)}
                    colorScheme={hasSubError ? "red" : "blue"}
                    variant="outline"
                  >
                    Edit
                  </Button>
                </Flex>
                
                {!value || value.trim() === '' ? (
                  <Text color="gray.500" fontStyle="italic">
                    Required - Please add content
                  </Text>
                ) : (
                  <Text whiteSpace="pre-wrap">
                    {value.length > 200 ? `${value.substring(0, 200)}...` : value}
                  </Text>
                )}
              </Box>
            );
          })}
        </VStack>
      </Box>
    );
  };
  
  return (
    <Box>
      {/* Article Title */}
      {renderSection('Title', article.title, 'title')}
      
      {/* Author Information */}
      <Box mb={6}>
        <Flex justifyContent="space-between" alignItems="center" mb={2}>
          <Heading as="h3" size="md">Author Information</Heading>
          <HStack>
            <Button
              size="sm"
              leftIcon={<FiEdit />}
              onClick={() => onSectionEdit('authorInfo')}
              colorScheme={
                validationErrors.authorName || 
                validationErrors.authorEmail || 
                validationErrors.authorAffiliation 
                  ? "red" : "blue"
              }
              variant="outline"
            >
              Edit
            </Button>
          </HStack>
        </Flex>
        
        <VStack align="start" spacing={1}>
          <Text><strong>Name:</strong> {article.authorName || 'Not provided'}</Text>
          <Text><strong>Email:</strong> {article.authorEmail || 'Not provided'}</Text>
          <Text><strong>Affiliation:</strong> {article.authorAffiliation || 'Not provided'}</Text>
          <Text><strong>Corresponding Author:</strong> {article.isCorrespondingAuthor ? 'Yes' : 'No'}</Text>
        </VStack>
      </Box>
      
      {/* Abstract */}
      {renderSection('Abstract', article.abstract, 'abstract')}
      
      {/* Keywords */}
      {renderSection('Keywords', article.keywords, 'keywords')}
      
      {/* Category & License */}
      <Box mb={6}>
        <Flex justifyContent="space-between" alignItems="center" mb={2}>
          <Heading as="h3" size="md">Category & License</Heading>
          <Button
            size="sm"
            leftIcon={<FiEdit />}
            onClick={() => onSectionEdit('metadata')}
            variant="outline"
            colorScheme="blue"
          >
            Edit
          </Button>
        </Flex>
        
        <VStack align="start" spacing={1}>
          <Text><strong>Category:</strong> {article.category || 'Not selected'}</Text>
          <Text><strong>License:</strong> {article.license || 'Not selected'}</Text>
        </VStack>
      </Box>
      
      <Divider my={6} />
      
      {/* Main Content Sections */}
      {renderSection('Introduction', article.introduction, 'introduction')}
      {renderSection('Literature Review/Background', article.literatureReview, 'literatureReview', false)}
      {renderSection('Methods', article.methods, 'methods')}
      {renderSection('Results', article.results, 'results')}
      {renderSection('Discussion', article.discussion, 'discussion')}
      {renderSection('Conclusion', article.conclusion, 'conclusion', false)}
      {renderSection('Acknowledgments', article.acknowledgments, 'acknowledgments', false)}
      
      {/* Declarations */}
      {renderNestedSection('Declarations', 'declarations', {
        ethics: article.declarations?.ethics,
        conflictOfInterest: article.declarations?.conflictOfInterest,
        funding: article.declarations?.funding
      }, {
        ethics: 'Ethics Statement',
        conflictOfInterest: 'Conflict of Interest',
        funding: 'Funding'
      })}
      
      {/* References */}
      {renderSection('References', article.references, 'references')}
      
      {/* Optional Sections */}
      {renderSection('Appendices', article.appendices, 'appendices', false)}
      {renderSection('Supplementary Material', article.supplementaryMaterial, 'supplementaryMaterial', false)}
    </Box>
  );
};
