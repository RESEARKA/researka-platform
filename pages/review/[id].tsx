import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Tag,
  Divider,
  Image,
  Flex,
  Button,
  Textarea,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  useToast,
  useColorModeValue,
  Skeleton,
  Link
} from '@chakra-ui/react';
import { FiArrowLeft, FiCalendar, FiStar, FiCheck } from 'react-icons/fi';
import Layout from '../../components/Layout';
import { useWallet } from '../../frontend/src/contexts/WalletContext';

// Mock data for articles awaiting review (same as in review.tsx)
const mockArticles = [
  {
    id: 1,
    title: 'Blockchain-Based Framework for Academic Credential Verification',
    abstract: 'This paper proposes a novel blockchain-based framework for verifying academic credentials, addressing issues of fraud and inefficiency in traditional verification systems.',
    author: 'Sarah Chen',
    category: 'Blockchain',
    date: 'March 15, 2025',
    keywords: ['blockchain', 'academic credentials', 'verification'],
    compensation: '50 RKA TOKENS',
    content: `
      # Introduction
      
      Academic credential verification is a critical process that ensures the authenticity of educational qualifications. Traditional methods of verification are often time-consuming, inefficient, and susceptible to fraud. This paper proposes a blockchain-based framework that addresses these challenges by providing a secure, transparent, and efficient system for verifying academic credentials.
      
      # Background
      
      The current academic credential verification process typically involves contacting the issuing institution directly, which can be time-consuming and resource-intensive. Additionally, the process is vulnerable to fraud through document forgery or misrepresentation. Blockchain technology, with its immutable and distributed nature, offers a promising solution to these challenges.
      
      # Proposed Framework
      
      Our proposed framework leverages blockchain technology to create a secure and transparent system for academic credential verification. The framework consists of the following components:
      
      1. **Credential Issuance**: Academic institutions issue digital credentials and store their hash on the blockchain.
      2. **Verification Portal**: Employers and other stakeholders can verify credentials through a user-friendly portal.
      3. **Smart Contracts**: Automate the verification process and ensure compliance with predefined rules.
      4. **Identity Management**: Secure identity verification for all participants in the system.
      
      # Implementation
      
      We implemented a prototype of the proposed framework using Ethereum blockchain and smart contracts written in Solidity. The system was tested with a sample dataset of academic credentials from various institutions.
      
      # Results
      
      Our evaluation shows that the proposed framework significantly reduces the time and resources required for credential verification while enhancing security and transparency. The blockchain-based approach successfully prevented various types of fraud attempts in our controlled experiments.
      
      # Conclusion
      
      The blockchain-based framework for academic credential verification offers a promising solution to the challenges faced by traditional verification methods. By leveraging blockchain technology, we can create a more secure, efficient, and transparent system for verifying academic credentials.
    `
  },
  {
    id: 2,
    title: 'Decentralized Peer Review: A New Paradigm for Scientific Publishing',
    abstract: 'We present a decentralized approach to peer review that leverages blockchain technology to create transparent, immutable records of the review process.',
    author: 'Michael Rodriguez',
    category: 'Academic Publishing',
    date: 'March 14, 2025',
    keywords: ['peer review', 'decentralization', 'scientific publishing'],
    compensation: '50 RKA TOKENS',
    content: `
      # Introduction
      
      The peer review process is fundamental to scientific publishing, ensuring the quality and validity of research before publication. However, traditional peer review systems face challenges such as lack of transparency, potential bias, and limited recognition for reviewers. This paper presents a decentralized approach to peer review that addresses these challenges through blockchain technology.
      
      # Background
      
      Traditional peer review typically involves a small number of reviewers selected by journal editors, with the review process often being opaque and the reviewers receiving little recognition for their contributions. Blockchain technology offers potential solutions through its transparency, immutability, and tokenization capabilities.
      
      # Proposed Approach
      
      Our decentralized peer review system leverages blockchain technology to create a transparent and immutable record of the review process. Key features include:
      
      1. **Open Participation**: Any qualified researcher can participate as a reviewer.
      2. **Transparent Process**: All review comments and decisions are recorded on the blockchain.
      3. **Reviewer Recognition**: Reviewers receive tokens as recognition for their contributions.
      4. **Quality Control**: A reputation system ensures the quality of reviews.
      
      # Implementation
      
      We implemented a prototype of the decentralized peer review system using a combination of blockchain technology and a web-based interface. The system was tested with a sample of research papers from various disciplines.
      
      # Results
      
      Our evaluation shows that the decentralized approach increases transparency, reduces potential bias, and provides better recognition for reviewers compared to traditional systems. The quality of reviews was maintained through the reputation system.
      
      # Conclusion
      
      The decentralized peer review system represents a new paradigm for scientific publishing that addresses many of the challenges faced by traditional peer review. By leveraging blockchain technology, we can create a more transparent, fair, and rewarding review process.
    `
  },
  {
    id: 3,
    title: 'Smart Contracts for Research Funding Distribution',
    abstract: 'This study examines how smart contracts can automate and improve the distribution of research funding, ensuring transparency and reducing administrative overhead.',
    author: 'Emma Johnson',
    category: 'Research Funding',
    date: 'March 12, 2025',
    keywords: ['smart contracts', 'research funding', 'automation'],
    compensation: '50 RKA TOKENS',
    content: `
      # Introduction
      
      Research funding distribution is often hampered by administrative overhead, lack of transparency, and delays in fund disbursement. This study examines how smart contracts can automate and improve the distribution of research funding, addressing these challenges.
      
      # Background
      
      Traditional research funding processes involve multiple stakeholders, complex application procedures, and manual fund disbursement. Smart contracts, self-executing contracts with the terms directly written into code, offer potential solutions through automation and transparency.
      
      # Methodology
      
      We designed a smart contract-based system for research funding distribution and evaluated it through a case study involving a simulated research grant program. The system was implemented on the Ethereum blockchain using Solidity for smart contract development.
      
      # Smart Contract Design
      
      Our system includes the following components:
      
      1. **Funding Pool Contract**: Manages the allocation of funds to different research projects.
      2. **Milestone Contract**: Releases funds based on the achievement of predefined research milestones.
      3. **Evaluation Contract**: Facilitates the evaluation of research outputs by reviewers.
      4. **Reporting Contract**: Automates the generation of financial reports for transparency.
      
      # Results
      
      The smart contract-based system demonstrated significant improvements over traditional funding distribution methods:
      
      - 60% reduction in administrative overhead
      - 75% faster fund disbursement
      - 100% transparency in fund allocation and usage
      - Automated compliance with funding requirements
      
      # Conclusion
      
      Smart contracts offer a promising approach to improving research funding distribution by automating processes, ensuring transparency, and reducing administrative overhead. The implementation of such systems could significantly enhance the efficiency and effectiveness of research funding programs.
    `
  },
  {
    id: 4,
    title: 'Tokenized Citation Impact: A New Metric for Academic Influence',
    abstract: 'We propose a tokenized citation impact system that quantifies academic influence through a combination of traditional citation metrics and token-based incentives.',
    author: 'David Kim',
    category: 'Bibliometrics',
    date: 'March 10, 2025',
    keywords: ['citation impact', 'tokenization', 'academic metrics'],
    compensation: '50 RKA TOKENS',
    content: `
      # Introduction
      
      Citation metrics are widely used to evaluate academic influence but have limitations in capturing the full impact of research. This paper proposes a tokenized citation impact system that combines traditional citation metrics with token-based incentives to provide a more comprehensive measure of academic influence.
      
      # Background
      
      Traditional citation metrics such as h-index and impact factor have been criticized for their limitations, including field-specific biases and inability to capture diverse forms of impact. Tokenization, enabled by blockchain technology, offers new possibilities for quantifying and incentivizing academic contributions.
      
      # Proposed System
      
      Our tokenized citation impact system includes the following components:
      
      1. **Citation Tokens**: Researchers receive tokens when their work is cited.
      2. **Impact Weighting**: Citations are weighted based on the citing paper's own impact.
      3. **Token Utility**: Tokens can be used within the academic ecosystem for various purposes.
      4. **Cross-disciplinary Normalization**: Adjustments for field-specific citation patterns.
      
      # Implementation
      
      We implemented a prototype of the tokenized citation impact system using a private blockchain and integrated it with a bibliometric database. The system was tested with a dataset of publications from multiple disciplines.
      
      # Results
      
      Our evaluation shows that the tokenized citation impact system provides a more nuanced and comprehensive measure of academic influence compared to traditional metrics. The system successfully incentivized valuable academic contributions and reduced field-specific biases.
      
      # Conclusion
      
      The tokenized citation impact system represents a novel approach to measuring academic influence that addresses many of the limitations of traditional citation metrics. By leveraging blockchain technology and tokenization, we can create a more fair, comprehensive, and incentive-aligned system for evaluating research impact.
    `
  }
];

const ReviewArticlePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState('3');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { account } = useWallet();
  const toast = useToast();

  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Image URLs for different article categories
  const imageUrls = {
    'Blockchain': 'https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
    'Academic Publishing': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
    'Research Funding': 'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
    'Bibliometrics': 'https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
    'DEFAULT': 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80'
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      // Find the article with the matching ID
      const articleId = parseInt(id as string, 10);
      const foundArticle = mockArticles.find(article => article.id === articleId);
      
      if (foundArticle) {
        setArticle(foundArticle);
        setError(null);
      } else {
        setError('Article not found');
      }
      
      setLoading(false);
    }
  }, [id]);

  const handleSubmitReview = () => {
    if (!account) {
      toast({
        title: 'Authentication required',
        description: 'Please connect your wallet to submit a review',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!reviewText.trim()) {
      toast({
        title: 'Review required',
        description: 'Please provide your review comments',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Review submitted',
        description: `You've earned ${article.compensation} for your contribution!`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setIsSubmitting(false);
      router.push('/review');
    }, 2000);
  };

  if (loading) {
    return (
      <Layout>
        <Container maxW="container.xl" py={8}>
          <Skeleton height="400px" mb={6} />
          <Skeleton height="20px" mb={2} />
          <Skeleton height="20px" mb={2} />
          <Skeleton height="20px" mb={6} />
          <Skeleton height="200px" />
        </Container>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Container maxW="container.xl" py={8}>
          <Box textAlign="center" py={10}>
            <Heading as="h2" size="xl" mb={4}>
              {error}
            </Heading>
            <Text mb={6}>The article you're looking for could not be found.</Text>
            <Button 
              leftIcon={<FiArrowLeft />} 
              colorScheme="green" 
              onClick={() => router.push('/review')}
            >
              Back to Review Page
            </Button>
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxW="container.xl" py={8}>
        {/* Back button */}
        <Button 
          leftIcon={<FiArrowLeft />} 
          variant="ghost" 
          mb={6} 
          onClick={() => router.push('/review')}
        >
          Back to Review Page
        </Button>

        {/* Article header */}
        <Box 
          position="relative" 
          height="400px" 
          mb={6} 
          borderRadius="lg" 
          overflow="hidden"
        >
          <Image 
            src={imageUrls[article.category as keyof typeof imageUrls] || imageUrls.DEFAULT} 
            alt={article.title} 
            objectFit="cover" 
            width="100%" 
            height="100%" 
          />
          <Box 
            position="absolute" 
            bottom={0} 
            left={0} 
            right={0} 
            bg="rgba(0,0,0,0.7)" 
            p={6}
          >
            <Heading as="h1" size="xl" color="white">
              {article.title}
            </Heading>
            <HStack mt={2} spacing={4}>
              <Text color="white">{article.author}</Text>
              <Flex align="center">
                <FiCalendar color="white" style={{ marginRight: '4px' }} />
                <Text color="white">{article.date}</Text>
              </Flex>
            </HStack>
          </Box>
        </Box>

        {/* Article content */}
        <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
          <Box 
            flex="2" 
            bg={bgColor} 
            p={6} 
            borderRadius="lg" 
            boxShadow="sm" 
            borderWidth="1px" 
            borderColor={borderColor}
          >
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Abstract
            </Text>
            <Text mb={6}>{article.abstract}</Text>
            
            <Divider my={6} />
            
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Full Paper
            </Text>
            <Box 
              className="markdown-content" 
              sx={{
                'h1': { fontSize: '2xl', fontWeight: 'bold', my: 4 },
                'h2': { fontSize: 'xl', fontWeight: 'bold', my: 3 },
                'p': { my: 2 },
                'ul, ol': { pl: 6, my: 2 },
                'li': { my: 1 },
              }}
            >
              {article.content.split('\n').map((line, index) => (
                <Text key={index} whiteSpace="pre-wrap">
                  {line}
                </Text>
              ))}
            </Box>
            
            <Flex mt={6} gap={2} flexWrap="wrap">
              {article.keywords.map((keyword: string, index: number) => (
                <Tag key={index} size="md" colorScheme="green" variant="subtle">
                  {keyword}
                </Tag>
              ))}
            </Flex>
          </Box>
          
          {/* Review submission form */}
          <Box 
            flex="1" 
            bg={bgColor} 
            p={6} 
            borderRadius="lg" 
            boxShadow="sm" 
            borderWidth="1px" 
            borderColor={borderColor}
            position="sticky"
            top="20px"
            alignSelf="flex-start"
          >
            <Heading as="h2" size="lg" mb={6}>
              Submit Your Review
            </Heading>
            
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel>Rating</FormLabel>
                <RadioGroup value={rating} onChange={setRating}>
                  <Stack direction="row">
                    <Radio value="1">1</Radio>
                    <Radio value="2">2</Radio>
                    <Radio value="3">3</Radio>
                    <Radio value="4">4</Radio>
                    <Radio value="5">5</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>
              
              <FormControl>
                <FormLabel>Review Comments</FormLabel>
                <Textarea 
                  placeholder="Provide your detailed review here..." 
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  minHeight="200px"
                />
              </FormControl>
              
              <Box>
                <Text fontWeight="bold" mb={2}>Compensation</Text>
                <HStack>
                  <FiStar />
                  <Text>{article.compensation}</Text>
                </HStack>
              </Box>
              
              <Button 
                colorScheme="green" 
                size="lg" 
                leftIcon={<FiCheck />}
                isLoading={isSubmitting}
                loadingText="Submitting..."
                onClick={handleSubmitReview}
              >
                Submit Review
              </Button>
              
              <Text fontSize="sm" color="gray.500">
                By submitting your review, you agree to our review guidelines and terms of service.
              </Text>
            </VStack>
          </Box>
        </Flex>
      </Container>
    </Layout>
  );
};

export default ReviewArticlePage;
