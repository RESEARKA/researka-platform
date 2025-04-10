"use client";

import { useState } from 'react';
import {
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  useDisclosure,
  useToast,
  Tooltip
} from '@chakra-ui/react';
import { FiFlag } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { FlagCategory } from '../../types/moderation';
import { getAuth } from 'firebase/auth';

interface FlagArticleButtonProps {
  articleId: string;
  onFlagSuccess?: () => void;
}

/**
 * FlagArticleButton Component
 * 
 * Provides a button for users to flag inappropriate content
 * Opens a modal with options to select a reason and provide details
 */
export const FlagArticleButton: React.FC<FlagArticleButtonProps> = ({ 
  articleId,
  onFlagSuccess
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useAuth();
  const toast = useToast();
  
  const [category, setCategory] = useState<FlagCategory | ''>('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (!category) {
      toast({
        title: 'Error',
        description: 'Please select a category',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get current user token for authentication
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`/api/v1/articles/${articleId}/flag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          category, 
          reason: reason.trim() 
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || data.error || 'Failed to flag article');
      }
      
      toast({
        title: 'Content Reported',
        description: 'Thank you for helping us maintain quality content',
        status: 'success',
        duration: 5000,
        isClosable: true
      });
      
      // Reset form
      setCategory('');
      setReason('');
      
      // Close modal
      onClose();
      
      // Call success callback if provided
      if (onFlagSuccess) {
        onFlagSuccess();
      }
    } catch (error) {
      console.error('Error flagging article:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to report content',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!user) {
    return null; // Don't show flag button to non-logged in users
  }
  
  return (
    <>
      <Tooltip label="Report inappropriate content" aria-label="Report content">
        <IconButton
          aria-label="Report inappropriate content"
          icon={<FiFlag />}
          variant="ghost"
          size="sm"
          onClick={onOpen}
        />
      </Tooltip>
      
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Report Content</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired mb={4}>
              <FormLabel>Category</FormLabel>
              <Select
                placeholder="Select reason"
                value={category}
                onChange={(e) => setCategory(e.target.value as FlagCategory)}
              >
                <option value="misinformation">Misinformation</option>
                <option value="offensive">Offensive Content</option>
                <option value="plagiarism">Plagiarism</option>
                <option value="spam">Spam</option>
                <option value="other">Other</option>
              </Select>
            </FormControl>
            
            <FormControl>
              <FormLabel>Additional Details</FormLabel>
              <Textarea
                placeholder="Please provide details about your report"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={500}
              />
            </FormControl>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Submitting"
            >
              Submit Report
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FlagArticleButton;
