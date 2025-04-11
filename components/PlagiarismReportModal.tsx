import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Box,
  Heading,
  Divider,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Flex
} from '@chakra-ui/react';

interface PlagiarismMatch {
  sourceId: string;
  sourceTitle: string;
  similarity: number;
  matchedSections: Array<{
    startIndex: number;
    endIndex: number;
    text: string;
  }>;
}

interface PlagiarismResult {
  overallSimilarity: number;
  matches: PlagiarismMatch[];
}

interface PlagiarismReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: PlagiarismResult | null;
}

const PlagiarismReportModal: React.FC<PlagiarismReportModalProps> = ({
  isOpen,
  onClose,
  results
}) => {
  if (!results) {
    return null;
  }

  const getStatusColor = (similarity: number) => {
    if (similarity < 10) return 'green';
    if (similarity < 30) return 'yellow';
    return 'red';
  };
  
  const getStatusText = (similarity: number) => {
    if (similarity < 10) return 'Low Similarity';
    if (similarity < 30) return 'Moderate Similarity';
    return 'High Similarity';
  };
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="xl" 
      scrollBehavior="inside"
      data-testid="plagiarism-report-modal"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Plagiarism Detection Report</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <Box mb={4}>
            <Flex align="center" mb={2}>
              <Heading size="md" mr={2}>
                Overall Similarity: {results.overallSimilarity.toFixed(1)}%
              </Heading>
              <Badge 
                colorScheme={getStatusColor(results.overallSimilarity)} 
                fontSize="md" 
                p={1}
              >
                {getStatusText(results.overallSimilarity)}
              </Badge>
            </Flex>
            <Text color="gray.600">
              {results.matches.length} potential {results.matches.length === 1 ? 'match' : 'matches'} found
            </Text>
          </Box>
          
          <Divider mb={4} />
          
          {results.matches.length === 0 ? (
            <Text>No plagiarism detected in this document.</Text>
          ) : (
            <Accordion allowMultiple defaultIndex={[0]}>
              {results.matches.map((match, index) => (
                <AccordionItem key={index}>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        <Text fontWeight="bold">
                          Match with: {match.sourceTitle}
                        </Text>
                        <Badge 
                          colorScheme={getStatusColor(match.similarity)}
                          ml={2}
                        >
                          {match.similarity.toFixed(1)}% Similar
                        </Badge>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <Box>
                      <Text fontWeight="bold" mb={2}>Matched sections:</Text>
                      {match.matchedSections.length === 0 ? (
                        <Text color="gray.500">No specific sections identified</Text>
                      ) : (
                        match.matchedSections.map((section, idx) => (
                          <Box 
                            key={idx} 
                            p={3} 
                            mt={2} 
                            bg="red.50" 
                            borderRadius="md"
                            borderLeftWidth="4px"
                            borderLeftColor="red.500"
                          >
                            <Text fontSize="sm">{section.text}</Text>
                            <Text fontSize="xs" mt={1} color="gray.500">
                              Characters {section.startIndex}-{section.endIndex}
                            </Text>
                          </Box>
                        ))
                      )}
                    </Box>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </ModalBody>
        
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
          {results.overallSimilarity > 30 && (
            <Button 
              colorScheme="red" 
              onClick={() => {
                onClose();
                // User would revise their article here
              }}
            >
              Revise Article
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PlagiarismReportModal;
