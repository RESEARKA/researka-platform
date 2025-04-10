"use client";

import { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Box,
  Heading,
  Text,
  Textarea,
  Stack,
  Flex,
  Badge,
  Divider,
  Link,
  useToast
} from '@chakra-ui/react';
import { FlaggedArticle, Flag } from '../../types/moderation';
import { format } from 'date-fns';
import NextLink from 'next/link';

interface ModerationActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: FlaggedArticle;
  onAction: (action: 'approve' | 'reject', notes: string) => Promise<void>;
}

/**
 * ModerationActionModal Component
 * 
 * Modal for reviewing flagged content and taking moderation actions
 */
const ModerationActionModal: React.FC<ModerationActionModalProps> = ({
  isOpen,
  onClose,
  article,
  onAction
}) => {
  const toast = useToast();
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!notes.trim()) {
      toast({
        title: 'Notes Required',
        description: 'Please provide notes explaining your decision',
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    setActionType(action);
    setIsSubmitting(true);

    try {
      await onAction(action, notes);
    } catch (error) {
      console.error('Error performing moderation action:', error);
    } finally {
      setIsSubmitting(false);
      setActionType(null);
    }
  };

  // Group flags by category
  const flagsByCategory: Record<string, Flag[]> = {};
  if (article.flags) {
    article.flags.forEach(flag => {
      if (!flagsByCategory[flag.category]) {
        flagsByCategory[flag.category] = [];
      }
      flagsByCategory[flag.category].push(flag);
    });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Review Flagged Content</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <Stack spacing={4}>
            <Box>
              <Heading size="md">{article.title}</Heading>
              <Flex mt={2} gap={2} align="center">
                <Badge colorScheme={
                  article.moderationStatus === 'active' ? 'green' : 
                  article.moderationStatus === 'under_review' ? 'yellow' : 
                  'red'
                }>
                  {article.moderationStatus.replace('_', ' ')}
                </Badge>
                <Text fontSize="sm">
                  {article.flagCount} {article.flagCount === 1 ? 'flag' : 'flags'}
                </Text>
              </Flex>
            </Box>
            
            <Box>
              <Link as={NextLink} href={`/articles/${article.id}`} color="blue.500" isExternal>
                View Full Article
              </Link>
            </Box>
            
            <Divider />
            
            <Box>
              <Heading size="sm" mb={2}>Flag Summary</Heading>
              <Stack spacing={3}>
                {Object.entries(flagsByCategory).map(([category, flags]) => (
                  <Box key={category} p={3} borderWidth="1px" borderRadius="md">
                    <Flex justify="space-between" align="center">
                      <Badge colorScheme={
                        category === 'misinformation' ? 'red' :
                        category === 'offensive' ? 'orange' :
                        category === 'plagiarism' ? 'purple' :
                        category === 'spam' ? 'blue' :
                        'gray'
                      }>
                        {category}
                      </Badge>
                      <Text fontSize="sm">{flags.length} {flags.length === 1 ? 'report' : 'reports'}</Text>
                    </Flex>
                    
                    <Stack mt={2} spacing={2}>
                      {flags.slice(0, 3).map((flag, index) => (
                        <Box key={index} fontSize="sm" p={2} bg="gray.50" borderRadius="sm">
                          {flag.reason ? (
                            <Text>{flag.reason}</Text>
                          ) : (
                            <Text color="gray.500">No additional details provided</Text>
                          )}
                          <Text fontSize="xs" color="gray.500" mt={1}>
                            Reported {flag.timestamp ? format(new Date(flag.timestamp.seconds * 1000), 'MMM d, yyyy') : 'recently'}
                          </Text>
                        </Box>
                      ))}
                      
                      {flags.length > 3 && (
                        <Text fontSize="xs" color="gray.500">
                          +{flags.length - 3} more reports in this category
                        </Text>
                      )}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
            
            <Divider />
            
            <Box>
              <Heading size="sm" mb={2}>Moderation Notes</Heading>
              <Textarea
                placeholder="Explain your decision (required)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                minHeight="100px"
              />
            </Box>
          </Stack>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            colorScheme="green" 
            mr={3}
            onClick={() => handleAction('approve')}
            isLoading={isSubmitting && actionType === 'approve'}
            loadingText="Approving"
            isDisabled={isSubmitting && actionType !== 'approve'}
          >
            Approve Content
          </Button>
          <Button 
            colorScheme="red"
            onClick={() => handleAction('reject')}
            isLoading={isSubmitting && actionType === 'reject'}
            loadingText="Removing"
            isDisabled={isSubmitting && actionType !== 'reject'}
          >
            Remove Content
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModerationActionModal;
