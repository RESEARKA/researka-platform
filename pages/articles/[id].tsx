import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Grid,
  GridItem,
  Box,
  Button,
  Text,
  Heading,
  useToast,
} from '@chakra-ui/react';
import { doc, getDoc, getDocs, collection, query, where } from 'firebase/firestore';
import Layout from '../../components/Layout';
import { getFirebaseFirestore } from '../../config/firebase';
import { Article } from '../../utils/recommendationEngine';
import { getAllResearchFields } from '../../utils/researchTaxonomy';
import { AuthorInfo } from '../../utils/citationHelper';
import { useArticleViewTracking } from '../../hooks/useActivityTracking';
import { createLogger, LogCategory } from '../../utils/logger';
import { useArticleMetrics } from '../../hooks/useArticleMetrics';
import { ArticleHeader, ArticleContent, ArticleSidebar } from '../../components/article/detail';

const logger = createLogger('article-detail');

/**
 * ArticleDetailPage component displays a single article with its content,
 * metadata, review status, and sharing options
 */
const ArticleDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const articleId = id ? (Array.isArray(id) ? id[0] : id) : '';

  const [article, setArticle] = useState<Article | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allFields, setAllFields] = useState<Record<string, string>>({});
  const [authors, setAuthors] = useState<AuthorInfo[]>([]);
  const toast = useToast();
  const { metrics, recordShare } = useArticleMetrics(articleId);
  
  // Track article view when the page loads
  const trackingStatus = useArticleViewTracking(
    articleId,
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
        context: { articleId, error: trackingStatus.error },
        category: LogCategory.ERROR
      });
    }
  }, [trackingStatus, articleId]);

  useEffect(() => {
    if (!articleId) return;
    
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        
        // Fetch research fields for category names
        const fields = await getAllResearchFields();
        const fieldMap = fields.reduce((acc: Record<string, string>, field: any) => {
          acc[field.id] = field.name;
          return acc;
        }, {});
        setAllFields(fieldMap);
        
        // Fetch article data from Firestore
        const db = await getFirebaseFirestore();
        if (!db) {
          throw new Error('Firestore not initialized');
        }
        
        const articleDoc = await getDoc(doc(db, 'articles', articleId));
        
        if (articleDoc.exists()) {
          const fetchedArticle = articleDoc.data() as Article;
          fetchedArticle.id = articleDoc.id;
          
          // Map category IDs to names if possible
          if (fetchedArticle.categories) {
            fetchedArticle.categories = fetchedArticle.categories.map(
              (catId) => fieldMap[catId] || catId
            );
          }
          
          setArticle(fetchedArticle);
          
          // Format author info for citation
          if (fetchedArticle.authors) {
            const authorInfo: AuthorInfo[] = fetchedArticle.authors.map((author) => ({
              name: author.name || 'Unknown Author',
              affiliations: author.affiliations || [],
            }));
            setAuthors(authorInfo);
          }
          
          // Fetch reviews for this article
          const reviewsQuery = query(
            collection(db, 'reviews'),
            where('articleId', '==', articleId)
          );
          
          const reviewsSnapshot = await getDocs(reviewsQuery);
          const reviewsData = reviewsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setReviews(reviewsData);
        } else {
          logger.warn('Article not found', {
            context: { articleId },
            category: LogCategory.ERROR
          });
          
          toast({
            title: 'Article not found',
            description: 'The requested article does not exist or has been removed.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (error) {
        logger.error('Failed to fetch article', {
          context: { articleId, error },
          category: LogCategory.ERROR
        });
        
        toast({
          title: 'Error loading article',
          description: 'There was a problem loading the article. Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArticle();
  }, [articleId, toast]);

  return (
    <Layout title={article?.title || 'Article'} activePage="articles">
      <Container maxW="container.xl" mt={8} px={{ base: 4, md: 8 }}>
        {article || isLoading ? (
          <Box>
            <ArticleHeader 
              article={article} 
              isLoading={isLoading} 
            />
            
            <Grid 
              templateColumns={{ base: '1fr', lg: '2fr 1fr' }} 
              gap={8}
            >
              <GridItem>
                <ArticleContent 
                  article={article} 
                  isLoading={isLoading} 
                />
              </GridItem>
              
              <GridItem>
                <ArticleSidebar 
                  article={article} 
                  reviews={reviews} 
                  metrics={metrics}
                  recordShare={recordShare}
                  isLoading={isLoading} 
                />
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
    </Layout>
  );
};

export default ArticleDetailPage;
