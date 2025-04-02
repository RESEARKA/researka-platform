import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Flex,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Text,
} from '@chakra-ui/react';
import { FiArrowLeft, FiEdit } from 'react-icons/fi';
import { Article, Review } from '../../types/review';
import { ReviewForm } from './ReviewForm';
import ArticleContent from '../article/ArticleContent';

interface TabbedReviewInterfaceProps {
  article: Article;
  isLoading: boolean;
  onSubmit?: (reviewData: Partial<Review>) => Promise<void>;
  errors?: Record<string, string>;
}

// Tab index constants
const TABS = {
  ARTICLE: 0,
  REVIEW: 1,
};

/**
 * PanelContainer - Extracted component for consistent panel styling
 */
const PanelContainer = React.memo<{ children: React.ReactNode }>(({ children }) => (
  <Box
    bg="white"
    p={6}
    borderRadius="md"
    boxShadow="sm"
    w="full"
    minH="70vh"
    overflowY="auto"
  >
    {children}
  </Box>
));

PanelContainer.displayName = 'PanelContainer';

/**
 * TabbedReviewInterface - A tabbed interface for reviewing articles
 * 
 * Provides a tabbed interface with two tabs:
 * 1. Article Content - Displays the article being reviewed
 * 2. Review Form - Allows the reviewer to submit their review
 */
const TabbedReviewInterface: React.FC<TabbedReviewInterfaceProps> = ({ 
  article, 
  isLoading, 
  onSubmit, 
  errors 
}) => {
  const [activeTab, setActiveTab] = useState<number>(TABS.ARTICLE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // Check for missing article after hooks declaration
  if (!article) {
    return (
      <Box p={4} bg="red.50" borderRadius="md">
        <Text color="red.500">No article provided for review</Text>
      </Box>
    );
  }

  const handleReviewSubmit = useCallback(async (reviewData: Partial<Review>) => {
    try {
      setIsSubmitting(true);
      if (!onSubmit) {
        throw new Error('No submit handler provided');
      }
      await onSubmit(reviewData);
      
      // Add success toast
      toast({
        title: 'Review Submitted',
        description: 'Your review has been submitted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Switch back to article tab after successful submission
      setActiveTab(TABS.ARTICLE);
    } catch (error) {
      console.error('Review submission failed:', error);
      const description = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
          ? error 
          : 'There was an error submitting your review. Please try again.';
      toast({
        title: 'Submission Failed',
        description,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, toast]);

  return (
    <Tabs 
      index={activeTab} 
      onChange={setActiveTab}
      isLazy
      variant="enclosed"
      colorScheme="blue"
      size="lg"
    >
      <TabList>
        <Tab 
          data-testid="article-tab"
          id="article-tab"
          aria-controls="article-panel"
        >
          Article Content
        </Tab>
        <Tab 
          data-testid="review-tab"
          id="review-tab"
          aria-controls="review-panel"
        >
          Review Form
        </Tab>
      </TabList>

      <TabPanels>
        {/* Article Content Panel */}
        <TabPanel 
          p={4}
          id="article-panel"
          role="tabpanel"
          aria-labelledby="article-tab"
        >
          <PanelContainer>
            <VStack spacing={6} align="stretch">
              <ArticleContent article={article} isLoading={isLoading} />
              
              <Flex justifyContent="flex-end" mt={4}>
                <Button 
                  leftIcon={<FiEdit />}
                  colorScheme="blue" 
                  size="md" 
                  onClick={() => setActiveTab(TABS.REVIEW)}
                  aria-label="Proceed to review form"
                  data-testid="proceed-to-review-button"
                >
                  Proceed to Review Form
                </Button>
              </Flex>
            </VStack>
          </PanelContainer>
        </TabPanel>

        {/* Review Form Panel */}
        <TabPanel 
          p={4}
          id="review-panel"
          role="tabpanel"
          aria-labelledby="review-tab"
        >
          <PanelContainer>
            <VStack spacing={6} align="stretch">
              <Button 
                leftIcon={<FiArrowLeft />}
                variant="outline"
                size="md"
                onClick={() => setActiveTab(TABS.ARTICLE)}
                aria-label="Return to article"
                mb={4}
                data-testid="return-to-article-button"
              >
                Return to Article
              </Button>
              
              <ReviewForm 
                article={article} 
                onSubmit={handleReviewSubmit}
                isLoading={isSubmitting || isLoading}
                errors={errors}
              />
            </VStack>
          </PanelContainer>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default TabbedReviewInterface;
