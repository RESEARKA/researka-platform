import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  Flex,
  Grid,
  GridItem,
  Icon,
  Skeleton,
  SkeletonText,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { FiArrowLeft, FiCalendar, FiDownload, FiEye, FiFileText, FiShare2 } from 'react-icons/fi';
import { doc, getDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { Article } from '../../utils/recommendationEngine';
import { getAllResearchFields } from '../../utils/researchTaxonomy';
import { articleToCitation, AuthorInfo } from '../../utils/citationHelper';
import ArticleReviewStatus from '../../components/ArticleReviewStatus';
import ArticleReviewers from '../../components/ArticleReviewers';
import { ArticleAuthors } from '../../components/article/ArticleAuthors';
import { ArticleCitation } from '../../components/article/ArticleCitation';
import { downloadArticlePdf } from '../../utils/pdfGenerator';
import FlagArticleButton from '../../components/moderation/FlagArticleButton';
import { useArticleViewTracking } from '../../hooks/useActivityTracking';
import { createLogger, LogCategory } from '../../utils/logger';
import ReadCountDisplay from '../../components/article/ReadCountDisplay';
import CitationBadge from '../../components/article/CitationBadge';
import SocialShareMetrics from '../../components/article/SocialShareMetrics';
import { useArticleMetrics } from '../../hooks/useArticleMetrics';

const logger = createLogger('article-detail');

const ArticleDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState<Article | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allFields, setAllFields] = useState<Record<string, string>>({});
  const [authors, setAuthors] = useState<AuthorInfo[]>([]);
  const toast = useToast();
  const { metrics, recordShare } = useArticleMetrics(id as string);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Track article view when the page loads
  const trackingStatus = useArticleViewTracking(
    typeof id === 'string' ? id : undefined,
    article ? {
      category: article.categories?.[0] || 'unknown',
      keywords: article.keywords?.join(',') || '',
      title: article.title || 'unknown'
    } : {}
  );
  
  // Log any tracking errors
  useEffect(() => {
    if (!trackingStatus.success && trackingStatus.error) {
      logger.warn('Failed to track article view', {
        context: { articleId: id, error: trackingStatus.error },
        category: LogCategory.ERROR
      });
    }
  }, [trackingStatus, id]);

  useEffect(() => {
    if (!id) return;
    
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        
        // Fetch research fields for category names
        const fields = await getAllResearchFields();
        // Convert fields array to a record for easier lookup
        const fieldMap = fields.reduce((acc: Record<string, string>, field: any) => {
          acc[field.id] = field.name;
          return acc;
        }, {});
        setAllFields(fieldMap);
        
        // Fetch article data from Firestore
        const articleDoc = await getDoc(doc(db, 'articles', id as string));
        
        if (articleDoc.exists()) {
          const fetchedArticle = articleDoc.data();
          
          // Fetch reviews for this article
          const reviewsSnapshot = await getDocs(
            query(collection(db, 'reviews'), where('articleId', '==', id))
          );
          const articleReviews = reviewsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Fetch author information if available
          let authorInfos: AuthorInfo[] = [];
          if (fetchedArticle.authorId) {
            try {
              const authorDoc = await getDoc(doc(db, 'users', fetchedArticle.authorId));
              if (authorDoc.exists()) {
                const authorData = authorDoc.data();
                
                // Debug logging to see what data we're getting from Firestore
                console.log('AUTHOR DATA RAW:', JSON.stringify(authorData, null, 2));
                
                // Add main author with both displayName and name fields
                authorInfos.push({
                  displayName: authorData.displayName,
                  name: authorData.name,
                  orcid: authorData.orcid || undefined,
                  email: authorData.email,
                  affiliation: authorData.affiliation || authorData.institution,
                  isCorresponding: true,
                  userId: fetchedArticle.authorId
                });
                
                // Check for co-authors if available
                if (fetchedArticle.coAuthors && Array.isArray(fetchedArticle.coAuthors)) {
                  for (const coAuthorId of fetchedArticle.coAuthors) {
                    try {
                      const coAuthorDoc = await getDoc(doc(db, 'users', coAuthorId));
                      if (coAuthorDoc.exists()) {
                        const coAuthorData = coAuthorDoc.data();
                        authorInfos.push({
                          displayName: coAuthorData.displayName,
                          name: coAuthorData.name,
                          orcid: coAuthorData.orcid || undefined,
                          email: coAuthorData.email,
                          affiliation: coAuthorData.affiliation || coAuthorData.institution,
                          userId: coAuthorId
                        });
                      }
                    } catch (error) {
                      console.error('Error fetching co-author:', error);
                    }
                  }
                }
              }
            } catch (error) {
              console.error('Error fetching author information:', error);
            }
          }
          
          // If no author information was found, create a placeholder
          if (authorInfos.length === 0) {
            authorInfos = [{ 
              displayName: fetchedArticle.authorId || 'Unknown Author',
              name: fetchedArticle.authorId || 'Unknown Author',
              orcid: undefined,
              userId: fetchedArticle.authorId
            }];
          }
          
          // Set authors state
          setAuthors(authorInfos);
          console.log('Author information:', authorInfos);
          
          // Convert to the format expected by the component
          const formattedArticle: Article = {
            id: fetchedArticle.id || '',
            title: fetchedArticle.title || 'Untitled Article',
            abstract: fetchedArticle.abstract || 'No abstract available',
            keywords: fetchedArticle.keywords || [],
            categories: [fetchedArticle.category || 'Uncategorized'],
            authorId: fetchedArticle.authorId || 'unknown',
            publishedDate: fetchedArticle.date || new Date().toISOString().split('T')[0],
            views: fetchedArticle.views || 0,
            citations: 0,
            reviewCount: articleReviews?.length || 0,
            // Handle all possible article status values to prevent TypeScript errors
            status: (() => {
              // Convert backend status to UI status
              switch(fetchedArticle.status) {
                case 'pending_review': return 'under_review';
                case 'published': return 'accepted';
                case 'draft': 
                case 'archived':
                default: return 'pending';
              }
            })() as 'pending' | 'under_review' | 'accepted' | 'rejected',
            introduction: fetchedArticle.introduction || '',
            literatureReview: fetchedArticle.literatureReview || '',
            methods: fetchedArticle.methods || '',
            results: fetchedArticle.results || '',
            discussion: fetchedArticle.discussion || '',
            conclusion: fetchedArticle.conclusion || '',
            acknowledgments: fetchedArticle.acknowledgments || '',
            references: Array.isArray(fetchedArticle.references) ? fetchedArticle.references : [],
          };
          setArticle(formattedArticle);
          setReviews(articleReviews);
        } else {
          console.error('Article not found with ID:', id);
          toast({
            title: 'Article not found',
            description: 'The requested article could not be found',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error('Error fetching article:', error);
        toast({
          title: 'Error',
          description: 'Failed to load article details',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArticle();
  }, [id, toast]);
  
  // Get readable name for a field ID
  const getFieldName = (fieldId: string) => {
    return allFields[fieldId] || fieldId;
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Note: Reviewer invitation feature is disabled for now
  // Will be implemented when the real reviewer system is fully integrated
  
  return (
    <Container maxW="container.xl" py={8}>
      {/* Add navigation back button */}
      <Box mb={4}>
        <Button
          leftIcon={<Icon as={FiArrowLeft} />}
          variant="ghost"
          size="md"
          onClick={() => router.push('/articles')}
        >
          Back to Articles
        </Button>
      </Box>
      
      {isLoading ? (
        <Box>
          <Skeleton height="50px" width="80%" mb={4} />
          <SkeletonText mt={2} noOfLines={4} spacing={4} />
          <Grid templateColumns={{ base: '1fr', lg: '3fr 1fr' }} gap={8} mt={8}>
            <GridItem>
              <Skeleton height="200px" mb={8} />
              <SkeletonText mt={4} noOfLines={10} spacing={4} />
            </GridItem>
            <GridItem>
              <Skeleton height="300px" mb={6} />
              <Skeleton height="400px" />
            </GridItem>
          </Grid>
        </Box>
      ) : article ? (
        <Box>
          <Heading as="h1" size="xl" mb={4}>
            {article.title}
          </Heading>
          
          {/* Display article metadata */}
          <Flex wrap="wrap" gap={4} mb={6} align="center">
            <HStack>
              <Icon as={FiCalendar} color="gray.500" />
              <Text color="gray.600">
                {article.publishedDate ? formatDate(article.publishedDate) : 'No date'}
              </Text>
            </HStack>
            
            <HStack>
              <Icon as={FiEye} color="gray.500" />
              <Text color="gray.600">{article.views} views</Text>
            </HStack>
            
            <HStack>
              <Icon as={FiFileText} color="gray.500" />
              <Text color="gray.600">{article.citations} citations</Text>
            </HStack>
          </Flex>
          
          {/* Display author information with ORCID */}
          <ArticleAuthors 
            authors={authors.map(a => {
              // Check if name looks like a wallet address using our utility function
              const isWalletAddress = (str?: string) => {
                if (!str) return false;
                return /^[a-zA-Z0-9]{30,}$/.test(str) && !str.includes(' ');
              };
              
              // Use displayName or name, but never show wallet addresses
              let displayName = a.displayName || a.name;
              if (!displayName || isWalletAddress(displayName)) {
                displayName = 'Anonymous Author';
              }
              
              // Split the name into given and family parts
              const nameParts = displayName.split(' ');
              const given = nameParts.length > 1 ? nameParts[0] : '';
              const family = nameParts.length > 1 ? nameParts.slice(1).join(' ') : displayName;
              
              // Debug what we're sending to ArticleAuthors
              console.log('Author data being sent to ArticleAuthors:', {
                id: a.userId || 'anonymous',
                given, 
                family,
                orcid: a.orcid,
                affiliation: a.affiliation
              });
              
              return { 
                id: a.userId || 'anonymous',
                given, 
                family,
                orcid: a.orcid,
                affiliation: a.affiliation // Add affiliation directly to author object
              };
            })}
            correspondingAuthor={authors.find(a => a.isCorresponding)?.userId}
            affiliations={authors.reduce((acc, a) => {
              // Redefine isWalletAddress here to avoid scope issues
              const isWalletAddress = (str?: string) => {
                if (!str) return false;
                return /^[a-zA-Z0-9]{30,}$/.test(str) && !str.includes(' ');
              };
              
              if (a.affiliation) {
                // Add affiliation with userId as key
                if (a.userId) {
                  acc[a.userId] = a.affiliation;
                }
                
                // Add affiliation with displayName as key
                if (a.displayName && !isWalletAddress(a.displayName)) {
                  acc[a.displayName] = a.affiliation;
                }
                
                // Add affiliation with name as key
                if (a.name && !isWalletAddress(a.name)) {
                  acc[a.name] = a.affiliation;
                  
                  // Also add with split name format
                  const nameParts = a.name.split(' ');
                  if (nameParts.length > 1) {
                    const given = nameParts[0];
                    const family = nameParts.slice(1).join(' ');
                    acc[`${family}-${given}`] = a.affiliation;
                  }
                }
              }
              return acc;
            }, {} as Record<string, string>)}
          />
          
          <Flex gap={2} flexWrap="wrap" mb={6}>
            {article.keywords.map((keyword) => (
              <Badge key={keyword} colorScheme="blue" variant="subtle">
                {getFieldName(keyword)}
              </Badge>
            ))}
            {article.categories.map((category) => (
              <Badge key={category} colorScheme="purple" variant="subtle">
                {getFieldName(category)}
              </Badge>
            ))}
          </Flex>
          
          <Grid templateColumns={{ base: '1fr', lg: '3fr 1fr' }} gap={8}>
            <GridItem>
              <Box 
                bg={bgColor} 
                p={6} 
                borderRadius="md" 
                borderWidth="1px" 
                borderColor={borderColor}
                mb={8}
              >
                <Heading as="h2" size="md" mb={4}>
                  Abstract
                </Heading>
                <Text>{article.abstract}</Text>
              </Box>
              
              {/* Add citation information with ORCID */}
              <ArticleCitation citation={articleToCitation(article, authors)} />
              
              <Box 
                bg={bgColor} 
                p={6} 
                borderRadius="md" 
                borderWidth="1px" 
                borderColor={borderColor}
                mb={8}
              >
                <Heading as="h2" size="md" mb={4}>
                  Full Text
                </Heading>
                
                {/* Display all article sections according to the standardized template */}
                <VStack spacing={6} align="stretch">
                  {article.introduction && (
                    <Box>
                      <Heading as="h3" size="sm" mb={2}>Introduction</Heading>
                      <Text whiteSpace="pre-wrap">{article.introduction}</Text>
                    </Box>
                  )}
                  
                  {article.literatureReview && (
                    <Box>
                      <Heading as="h3" size="sm" mb={2}>Literature Review/Background</Heading>
                      <Text whiteSpace="pre-wrap">{article.literatureReview}</Text>
                    </Box>
                  )}
                  
                  {article.methods && (
                    <Box>
                      <Heading as="h3" size="sm" mb={2}>Methods</Heading>
                      <Text whiteSpace="pre-wrap">{article.methods}</Text>
                    </Box>
                  )}
                  
                  {article.results && (
                    <Box>
                      <Heading as="h3" size="sm" mb={2}>Results</Heading>
                      <Text whiteSpace="pre-wrap">{article.results}</Text>
                    </Box>
                  )}
                  
                  {article.discussion && (
                    <Box>
                      <Heading as="h3" size="sm" mb={2}>Discussion</Heading>
                      <Text whiteSpace="pre-wrap">{article.discussion}</Text>
                    </Box>
                  )}
                  
                  {article.conclusion && (
                    <Box>
                      <Heading as="h3" size="sm" mb={2}>Conclusion</Heading>
                      <Text whiteSpace="pre-wrap">{article.conclusion}</Text>
                    </Box>
                  )}
                  
                  {article.acknowledgments && (
                    <Box>
                      <Heading as="h3" size="sm" mb={2}>Acknowledgments</Heading>
                      <Text whiteSpace="pre-wrap">{article.acknowledgments}</Text>
                    </Box>
                  )}
                  
                  {article.references && article.references.length > 0 && (
                    <Box>
                      <Heading as="h3" size="sm" mb={2}>References</Heading>
                      <VStack align="stretch" spacing={1}>
                        {article.references.map((reference, index) => (
                          <Text key={index}>{reference}</Text>
                        ))}
                      </VStack>
                    </Box>
                  )}
                </VStack>
              </Box>
              
              <Button 
                leftIcon={<FiDownload />} 
                colorScheme="blue"
                mt={6}
                onClick={() => {
                  try {
                    // Log that we're generating the PDF
                    console.log('Generating PDF for article:', article.title);
                    
                    // Prepare full content by combining all sections
                    const fullContent = [
                      `${article.introduction || ''}`,
                      article.literatureReview && `## Literature Review/Background\n${article.literatureReview}`,
                      article.methods && `## Methods\n${article.methods}`,
                      article.results && `## Results\n${article.results}`,
                      article.discussion && `## Discussion\n${article.discussion}`,
                      article.conclusion && `## Conclusion\n${article.conclusion}`,
                      article.acknowledgments && `## Acknowledgments\n${article.acknowledgments}`,
                      article.references && article.references.length > 0 && `## References\n${article.references.join('\n')}`
                    ].filter(Boolean).join('\n\n');
                    
                    // Generate and download the PDF using the available properties in the Article interface
                    downloadArticlePdf({
                      title: article.title || 'Untitled Article',
                      author: article.authorId || 'Unknown Author',
                      abstract: article.abstract || '',
                      content: fullContent,
                      date: article.publishedDate || new Date().toLocaleDateString(),
                      categories: article.categories || []
                    });
                    
                    toast({
                      title: 'PDF Downloaded',
                      description: 'Your PDF has been successfully generated and downloaded.',
                      status: 'success',
                      duration: 3000,
                      isClosable: true,
                    });
                  } catch (error) {
                    console.error('Error downloading PDF:', error);
                    toast({
                      title: 'Download Failed',
                      description: 'There was an error generating the PDF. Please try again.',
                      status: 'error',
                      duration: 3000,
                      isClosable: true,
                    });
                  }
                }}
              >
                Download PDF
              </Button>
              
              <Flex justify="space-between" mb={4}>
                <Button 
                  leftIcon={<FiShare2 />} 
                  variant="outline" 
                  onClick={() => recordShare('twitter')}
                >
                  Share
                </Button>
                <FlagArticleButton articleId={article.id || id as string} />
              </Flex>
              
              {/* Article Metrics Display */}
              <HStack spacing={4} mt={4} mb={6}>
                <ReadCountDisplay count={metrics.viewCount} showLabel={true} />
                <CitationBadge count={metrics.citationCount} />
                <SocialShareMetrics shares={metrics.shareCount} />
              </HStack>
            </GridItem>
            
            <GridItem>
              <VStack spacing={6} align="stretch">
                <ArticleReviewStatus 
                  article={article}
                  reviews={reviews}
                />
                
                {article.status !== 'accepted' && article.status !== 'rejected' && (
                  <ArticleReviewers 
                    articleId={article.id || id as string}
                    limit={3}
                    reviews={reviews}
                  />
                )}
              </VStack>
            </GridItem>
          </Grid>
        </Box>
      ) : (
        <Box textAlign="center" py={10}>
          <Heading as="h2" size="lg" mb={4}>
            Article Not Found
          </Heading>
          <Text mb={6}>
            The article you are looking for does not exist or has been removed.
          </Text>
          <Button 
            colorScheme="blue" 
            onClick={() => router.push('/articles')}
          >
            Back to Articles
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default ArticleDetailPage;
