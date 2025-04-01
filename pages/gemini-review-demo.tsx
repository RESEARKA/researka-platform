/**
 * Gemini Review Demo Page
 * 
 * This page demonstrates the Gemini 2.5 Pro AI integration for article reviews,
 * showcasing how AI can assist in the review process by providing suggestions
 * for logical reasoning, structure, and code quality.
 */

import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  useToast,
  Badge,
  Flex,
  Divider,
  Link,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import Layout from '../components/Layout';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

// Dynamic import for the GeminiReviewAssistant to avoid SSR issues
const DynamicGeminiReviewAssistant = dynamic(
  () => import('../components/review/GeminiReviewAssistant'),
  { ssr: false }
);

// Sample article data for demonstration
const sampleArticle = {
  id: 'demo-article-123',
  title: 'Decentralized Academic Publishing: A Blockchain Approach',
  abstract: 'This paper explores how blockchain technology can revolutionize academic publishing by creating a decentralized, transparent, and equitable system for research dissemination. We analyze the current challenges in academic publishing and propose a novel framework that leverages smart contracts to automate peer review, ensure fair compensation for reviewers, and maintain immutable records of research contributions.',
  content: `# Introduction

Academic publishing faces numerous challenges in the digital age, including high subscription costs, lengthy review processes, and limited access to research. Blockchain technology offers a promising solution to these issues by enabling decentralized, transparent, and tamper-proof systems.

## Current Challenges in Academic Publishing

1. **Centralized Control**: A few large publishers dominate the academic publishing landscape, leading to high subscription costs and limited access.
2. **Opaque Review Process**: The peer review process lacks transparency, with potential for bias and delays.
3. **Limited Recognition**: Reviewers receive minimal recognition for their contributions to the scientific process.

# Proposed Solution

We propose a blockchain-based academic publishing platform that addresses these challenges through:

\`\`\`javascript
// Smart contract for managing peer review process
contract PeerReview {
  struct Review {
    address reviewer;
    bytes32 articleHash;
    uint8 score;
    string comments;
    uint timestamp;
  }
  
  // Mapping of article hashes to their reviews
  mapping(bytes32 => Review[]) public articleReviews;
  
  // Event emitted when a new review is submitted
  event ReviewSubmitted(bytes32 indexed articleHash, address indexed reviewer);
  
  function submitReview(bytes32 _articleHash, uint8 _score, string memory _comments) public {
    // Ensure score is within valid range (1-5)
    require(_score >= 1 && _score <= 5, "Score must be between 1 and 5");
    
    // Create and store the review
    Review memory newReview = Review({
      reviewer: msg.sender,
      articleHash: _articleHash,
      score: _score,
      comments: _comments,
      timestamp: block.timestamp
    });
    
    articleReviews[_articleHash].push(newReview);
    
    // Emit event
    emit ReviewSubmitted(_articleHash, msg.sender);
  }
}
\`\`\`

## Decentralized Governance

The platform will implement a decentralized autonomous organization (DAO) structure to govern:

1. Review quality standards
2. Reviewer compensation
3. Article acceptance criteria

# Methodology

Our research methodology combines:

- Literature review of existing blockchain applications in publishing
- Prototype development and testing
- Quantitative analysis of transaction costs and efficiency

# Results

Initial testing shows promising results:

1. 60% reduction in review time
2. 75% cost savings compared to traditional publishing
3. Increased transparency and reviewer satisfaction

# Conclusion

Blockchain technology has the potential to transform academic publishing by creating a more efficient, transparent, and equitable system. Future work will focus on scaling the solution and addressing potential regulatory challenges.`,
  category: 'blockchain',
  keywords: ['blockchain', 'academic publishing', 'peer review', 'smart contracts', 'decentralized science'],
  codeSnippets: [
    {
      language: 'javascript',
      code: `// Smart contract for managing peer review process
contract PeerReview {
  struct Review {
    address reviewer;
    bytes32 articleHash;
    uint8 score;
    string comments;
    uint timestamp;
  }
  
  // Mapping of article hashes to their reviews
  mapping(bytes32 => Review[]) public articleReviews;
  
  // Event emitted when a new review is submitted
  event ReviewSubmitted(bytes32 indexed articleHash, address indexed reviewer);
  
  function submitReview(bytes32 _articleHash, uint8 _score, string memory _comments) public {
    // Ensure score is within valid range (1-5)
    require(_score >= 1 && _score <= 5, "Score must be between 1 and 5");
    
    // Create and store the review
    Review memory newReview = Review({
      reviewer: msg.sender,
      articleHash: _articleHash,
      score: _score,
      comments: _comments,
      timestamp: block.timestamp
    });
    
    articleReviews[_articleHash].push(newReview);
    
    // Emit event
    emit ReviewSubmitted(_articleHash, msg.sender);
  }
}`,
      description: 'Smart contract for managing the peer review process'
    }
  ]
};

// Sample article with logical flaws for demonstration
const flawedArticle = {
  id: 'demo-article-flawed',
  title: 'The Impact of Blockchain on Research Reproducibility',
  abstract: 'This study examines how blockchain technology can improve research reproducibility. We claim that blockchain solves all reproducibility issues in science without providing specific mechanisms or evidence.',
  content: `# Introduction

Research reproducibility is a major challenge in science. Blockchain technology will solve all reproducibility problems in science automatically.

## The Reproducibility Crisis

Many studies cannot be reproduced, which undermines scientific progress. This is a significant problem across all scientific disciplines.

# Blockchain Solution

Blockchain will make all research reproducible because it uses distributed ledger technology. Since blockchain is immutable, all research will become reproducible.

\`\`\`python
# This code demonstrates how blockchain improves reproducibility
def improve_reproducibility(research_data):
    # Simply adding data to blockchain makes it reproducible
    blockchain.add_data(research_data)
    return "Research is now reproducible"

# No validation or specific mechanisms implemented
def validate_results(experiment_data):
    # Missing implementation
    pass
\`\`\`

# Methodology

We conducted a survey of 10 researchers who agreed that blockchain would solve reproducibility issues.

# Results

Our results show that blockchain improves reproducibility by 100% in all cases, without exception.

# Conclusion

Blockchain is the perfect solution to all reproducibility problems in science. No further research is needed in this area.`,
  category: 'research methodology',
  keywords: ['blockchain', 'reproducibility', 'research integrity'],
  codeSnippets: [
    {
      language: 'python',
      code: `# This code demonstrates how blockchain improves reproducibility
def improve_reproducibility(research_data):
    # Simply adding data to blockchain makes it reproducible
    blockchain.add_data(research_data)
    return "Research is now reproducible"

# No validation or specific mechanisms implemented
def validate_results(experiment_data):
    # Missing implementation
    pass`,
      description: 'Python code demonstrating blockchain for reproducibility'
    }
  ]
};

const GeminiReviewDemoPage: React.FC = () => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [flawedSuggestions, setFlawedSuggestions] = useState<any[]>([]);
  const toast = useToast();
  const router = useRouter();
  
  const handleSuggestionsGenerated = (newSuggestions: any[]) => {
    setSuggestions(newSuggestions);
    
    if (newSuggestions.length > 0) {
      toast({
        title: 'AI Analysis Complete',
        description: `Generated ${newSuggestions.length} review suggestions`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleFlawedSuggestionsGenerated = (newSuggestions: any[]) => {
    setFlawedSuggestions(newSuggestions);
    
    if (newSuggestions.length > 0) {
      toast({
        title: 'AI Analysis Complete',
        description: `Generated ${newSuggestions.length} review suggestions for flawed article`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const navigateToReviewPage = () => {
    router.push('/review');
  };
  
  return (
    <Layout title="Gemini AI Review Demo | DecentraJournal" description="Demonstration of Gemini 2.5 Pro AI-assisted article review capabilities">
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center" mb={8}>
            <Heading as="h1" size="xl" mb={4}>
              Gemini 2.5 Pro AI Review Assistant
            </Heading>
            <Text fontSize="lg" maxW="800px" mx="auto">
              This demo showcases how Gemini 2.5 Pro AI can assist reviewers by analyzing academic content
              and providing suggestions related to logical reasoning, structure, and code quality.
            </Text>
            <Flex justify="center" mt={4}>
              <Badge colorScheme="purple" fontSize="md" p={2}>
                Powered by Gemini 2.5 Pro
              </Badge>
            </Flex>
            <Button 
              colorScheme="purple" 
              size="lg" 
              mt={6}
              onClick={navigateToReviewPage}
            >
              Go to Review Page
            </Button>
          </Box>
          
          <Divider />
          
          <Tabs variant="enclosed" colorScheme="purple" isLazy>
            <TabList>
              <Tab>Well-Structured Article</Tab>
              <Tab>Article with Logical Flaws</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Box bg="white" p={6} borderRadius="md" boxShadow="md">
                    <Heading as="h2" size="lg" mb={4}>
                      {sampleArticle.title}
                    </Heading>
                    <Text fontStyle="italic" mb={4}>
                      {sampleArticle.abstract}
                    </Text>
                    <Flex gap={2} mb={4} flexWrap="wrap">
                      {sampleArticle.keywords.map((keyword, index) => (
                        <Badge key={index} colorScheme="green">
                          {keyword}
                        </Badge>
                      ))}
                    </Flex>
                    <Text color="gray.600" fontSize="sm">
                      Category: {sampleArticle.category}
                    </Text>
                  </Box>
                  
                  <Box bg="white" p={6} borderRadius="md" boxShadow="md">
                    <Heading as="h3" size="md" mb={4}>
                      AI Review Analysis
                    </Heading>
                    <Text mb={4}>
                      Below is the AI-generated analysis of the article. The AI examines logical reasoning,
                      structure, and code quality to provide helpful suggestions for reviewers.
                    </Text>
                    
                    {suggestions.length > 0 && (
                      <Flex mb={4}>
                        <Badge colorScheme="purple" p={2}>
                          {suggestions.length} suggestions available
                        </Badge>
                      </Flex>
                    )}
                    
                    <DynamicGeminiReviewAssistant
                      article={sampleArticle}
                      onSuggestionsGenerated={handleSuggestionsGenerated}
                      autoAnalyze={true}
                    />
                  </Box>
                </VStack>
              </TabPanel>
              
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Box bg="white" p={6} borderRadius="md" boxShadow="md">
                    <Heading as="h2" size="lg" mb={4}>
                      {flawedArticle.title}
                    </Heading>
                    <Text fontStyle="italic" mb={4}>
                      {flawedArticle.abstract}
                    </Text>
                    <Flex gap={2} mb={4} flexWrap="wrap">
                      {flawedArticle.keywords.map((keyword, index) => (
                        <Badge key={index} colorScheme="green">
                          {keyword}
                        </Badge>
                      ))}
                    </Flex>
                    <Text color="gray.600" fontSize="sm">
                      Category: {flawedArticle.category}
                    </Text>
                  </Box>
                  
                  <Box bg="white" p={6} borderRadius="md" boxShadow="md">
                    <Heading as="h3" size="md" mb={4}>
                      AI Review Analysis
                    </Heading>
                    <Text mb={4}>
                      This example demonstrates how the AI can identify logical flaws, unsupported claims,
                      and code issues in a poorly structured article.
                    </Text>
                    
                    {flawedSuggestions.length > 0 && (
                      <Flex mb={4}>
                        <Badge colorScheme="purple" p={2}>
                          {flawedSuggestions.length} suggestions available
                        </Badge>
                      </Flex>
                    )}
                    
                    <DynamicGeminiReviewAssistant
                      article={flawedArticle}
                      onSuggestionsGenerated={handleFlawedSuggestionsGenerated}
                      autoAnalyze={true}
                    />
                  </Box>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
          
          <Divider my={8} />
          
          <Box textAlign="center">
            <Heading as="h2" size="md" mb={4}>
              About Gemini AI Integration
            </Heading>
            <Text>
              The Gemini 2.5 Pro AI integration enhances the review process by providing intelligent
              suggestions based on content analysis. This helps reviewers identify issues with structure,
              logical reasoning, and code quality more efficiently.
            </Text>
            <Link 
              href="https://ai.google.dev/gemini-api" 
              isExternal 
              color="purple.500"
              display="inline-flex"
              alignItems="center"
              mt={4}
            >
              Learn more about Gemini API <ExternalLinkIcon mx="2px" />
            </Link>
          </Box>
        </VStack>
      </Container>
    </Layout>
  );
};

export default GeminiReviewDemoPage;
