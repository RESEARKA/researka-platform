import React from 'react';
import { 
  Box, 
  Tooltip, 
  Badge, 
  Text, 
  Progress, 
  Button,
  useDisclosure
} from '@chakra-ui/react';
import { WarningIcon, CheckIcon } from '@chakra-ui/icons';
import { PlagiarismMatch } from '../hooks/usePlagiarismDetection';
import { PlagiarismReportModal } from './PlagiarismReportModal';

interface PlagiarismIndicatorProps {
  isLoading: boolean;
  isChecked: boolean;
  overallSimilarity: number;
  matches: PlagiarismMatch[];
  status: 'clean' | 'suspicious' | 'plagiarized' | null;
  onCheckNow?: () => void;
}

export const PlagiarismIndicator: React.FC<PlagiarismIndicatorProps> = ({
  isLoading,
  isChecked,
  overallSimilarity,
  matches,
  status,
  onCheckNow
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const getStatusColor = () => {
    if (!status) return 'gray';
    switch (status) {
      case 'clean': return 'green';
      case 'suspicious': return 'yellow';
      case 'plagiarized': return 'red';
      default: return 'gray';
    }
  };
  
  return (
    <Box 
      p={3} 
      borderWidth="1px" 
      borderRadius="md" 
      bg="white" 
      boxShadow="sm"
      data-testid="plagiarism-indicator"
    >
      <Text fontWeight="bold" mb={2}>
        Plagiarism Check
      </Text>
      
      {isLoading ? (
        <Box>
          <Text fontSize="sm" mb={2}>Analyzing content...</Text>
          <Progress size="sm" isIndeterminate colorScheme="blue" />
        </Box>
      ) : !isChecked ? (
        <Box>
          <Text fontSize="sm" color="gray.600" mb={2}>
            Content has not been checked for plagiarism yet.
          </Text>
          {onCheckNow && (
            <Button 
              size="sm" 
              colorScheme="blue" 
              onClick={onCheckNow}
              isFullWidth
            >
              Check Now
            </Button>
          )}
        </Box>
      ) : (
        <Box>
          <Tooltip 
            label={`${matches.length} potential matches found`}
            placement="top"
            hasArrow
          >
            <Badge 
              colorScheme={getStatusColor()}
              p={1}
              borderRadius="md"
            >
              {status === 'clean' && <CheckIcon mr={1} />}
              {status !== 'clean' && <WarningIcon mr={1} />}
              {overallSimilarity.toFixed(1)}% Similar
            </Badge>
          </Tooltip>
          
          {matches.length > 0 ? (
            <Box mt={2}>
              <Text fontSize="sm">
                {matches.length} potential {matches.length === 1 ? 'match' : 'matches'} found
              </Text>
              <Button 
                size="sm" 
                colorScheme="blue" 
                variant="link" 
                onClick={onOpen}
                mt={1}
                data-testid="view-report-button"
              >
                View detailed report
              </Button>
            </Box>
          ) : (
            <Text fontSize="sm" mt={2} color="green.600">
              No plagiarism detected
            </Text>
          )}
          
          <PlagiarismReportModal 
            isOpen={isOpen}
            onClose={onClose}
            matches={matches}
            overallSimilarity={overallSimilarity}
            status={status}
          />
        </Box>
      )}
    </Box>
  );
};
