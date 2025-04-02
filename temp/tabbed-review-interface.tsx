import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useDisclosure,
  Flex,
} from '@chakra-ui/react';
import { FiArrowLeft, FiEdit } from 'react-icons/fi';
import { Article } from '../../types/review';
import ReviewForm from '../../components/review/ReviewForm';
import ArticleContent from '../../components/article/ArticleContent';

interface ReviewPageProps {
  article: Article;
  isLoading: boolean;
}

/**
 * TabbedReviewInterface Component
 * 
 * A component that provides a tabbed interface for reviewing articles:
 * - Tab 1: Article Content - Displays the full article for review
 * - Tab 2: Review Form - Contains the form for submitting a review
 */
const TabbedReviewInterface: React.FC<ReviewPageProps> = ({ 
  article,
  isLoading
}) => {
  // State for managing active tab
  const [activeTab, setActiveTab] = useState<number>(0);
  
  // Function to switch tabs
  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };

  // Function to handle review submission
  const handleReviewSubmit = async (reviewData: any) => {
    // Implementation would go here
    console.log('Review submitted:', reviewData);
  };

  return (
    <Box width="100%">
      {/* Tabbed interface */}
      <Tabs 
        isFitted 
        variant="enclosed" 
        colorScheme="blue" 
        index={activeTab} 
        onChange={handleTabChange}
        isLazy // Only renders the selected tab's panel
        aria-label="Article review tabs"
      >
        <TabList mb="1em">
          <Tab 
            fontWeight="semibold"
            aria-controls="article-content-panel"
            data-testid="article-tab"
          >
            Article Content
          </Tab>
          <Tab 
            fontWeight="semibold"
            aria-controls="review-form-panel"
            data-testid="review-tab"
          >
            Review Form
          </Tab>
        </TabList>
        
        <TabPanels>
          {/* Tab 1: Article Content */}
          <TabPanel id="article-content-panel">
            <Box 
              bg="white" 
              p={6} 
              borderRadius="lg" 
              boxShadow="sm" 
              borderWidth="1px" 
              borderColor="gray.200"
            >
              <ArticleContent article={article} isLoading={isLoading} />
              
              <Flex justifyContent="center" mt={8}>
                <Button 
                  leftIcon={<FiEdit />}
                  colorScheme="blue" 
                  size="lg" 
                  onClick={() => setActiveTab(1)}
                  aria-label="Proceed to review form"
                >
                  Proceed to Review Form
                </Button>
              </Flex>
            </Box>
          </TabPanel>
          
          {/* Tab 2: Review Form */}
          <TabPanel id="review-form-panel">
            <Box 
              bg="white" 
              p={6} 
              borderRadius="lg" 
              boxShadow="sm" 
              borderWidth="1px" 
              borderColor="gray.200"
            >
              <VStack spacing={6} align="stretch">
                <ReviewForm 
                  article={article}
                  onSubmit={handleReviewSubmit}
                />
                
                <Flex justifyContent="center" mt={4}>
                  <Button 
                    leftIcon={<FiArrowLeft />}
                    variant="outline"
                    colorScheme="blue" 
                    size="md" 
                    onClick={() => setActiveTab(0)}
                    aria-label="Return to article content"
                  >
                    Return to Article
                  </Button>
                </Flex>
              </VStack>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default TabbedReviewInterface;
