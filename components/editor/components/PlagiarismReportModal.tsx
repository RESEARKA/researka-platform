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
  List,
  ListItem,
  Badge,
  Link,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Flex
} from '@chakra-ui/react';
import { PlagiarismMatch } from '../hooks/usePlagiarismDetection';

interface PlagiarismReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: PlagiarismMatch[];
  overallSimilarity: number;
  status: 'clean' | 'suspicious' | 'plagiarized' | null;
}

export const PlagiarismReportModal: React.FC<PlagiarismReportModalProps> = ({
  isOpen,
  onClose,
  matches,
  overallSimilarity,
  status
}) => {
  const getStatusColor = () => {
    if (!status) return 'gray';
    switch (status) {
      case 'clean': return 'green';
      case 'suspicious': return 'yellow';
      case 'plagiarized': return 'red';
      default: return 'gray';
    }
  };
  
  const getStatusText = () => {
    if (!status) return 'Unknown';
    switch (status) {
      case 'clean': return 'Clean';
      case 'suspicious': return 'Suspicious';
      case 'plagiarized': return 'Plagiarized';
      default: return 'Unknown';
    }
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
                Overall Similarity: {overallSimilarity.toFixed(1)}%
              </Heading>
              <Badge colorScheme={getStatusColor()} fontSize="md" p={1}>
                {getStatusText()}
              </Badge>
            </Flex>
            <Text color="gray.600">
              {matches.length} potential {matches.length === 1 ? 'match' : 'matches'} found
            </Text>
          </Box>
          
          <Divider mb={4} />
          
          {matches.length === 0 ? (
            <Text>No plagiarism detected in this document.</Text>
          ) : (
            <Accordion allowMultiple defaultIndex={[0]}>
              {matches.map((match, index) => (
                <AccordionItem key={index}>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        <Text fontWeight="bold">
                          Match with: {match.sourceTitle}
                        </Text>
                        <Badge 
                          colorScheme={match.similarity > 30 ? 'red' : 'yellow'}
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
                      
                      <Button 
                        size="sm" 
                        colorScheme="blue" 
                        variant="outline" 
                        mt={3}
                        onClick={() => {
                          // This would be implemented to view the source article
                          window.open(`/articles/${match.sourceId}`, '_blank');
                        }}
                      >
                        View Source Article
                      </Button>
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
          <Button 
            variant="outline" 
            onClick={() => {
              // This would be implemented to export the report
              alert('Report export functionality would be implemented here');
            }}
          >
            Export Report
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
