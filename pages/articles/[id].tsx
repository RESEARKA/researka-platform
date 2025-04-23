import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Grid,
  GridItem,
  Box,
  Text,
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
import FirebaseClientOnly from '../../components/firebase/FirebaseClientOnly';
import { SharePlatform } from '../../components/article/SocialShareButtons';

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
          
          // Fetch the main author data
          let authorInfos: AuthorInfo[] = [];
          
          try {
            // Fetch main author
            const authorDoc = await getDoc(doc(db, 'users', fetchedArticle.authorId));
            if (authorDoc.exists()) {
              const authorData = authorDoc.data();
              
              // Add main author
              authorInfos.push({
                name: authorData.name,
                displayName: authorData.displayName,
                orcid: authorData.orcid,
                email: authorData.email,
                affiliation: authorData.affiliation || authorData.institution || authorData.university,
                isCorresponding: true,
                userId: fetchedArticle.authorId
              });
              
              // Fetch co-authors if any
              if (fetchedArticle.coAuthors && fetchedArticle.coAuthors.length > 0) {
                for (const coAuthorId of fetchedArticle.coAuthors) {
                  try {
                    const coAuthorDoc = await getDoc(doc(db, 'users', coAuthorId));
                    if (coAuthorDoc.exists()) {
                      const coAuthorData = coAuthorDoc.data();
                      authorInfos.push({
                        name: coAuthorData.name,
                        displayName: coAuthorData.displayName,
                        orcid: coAuthorData.orcid,
                        email: coAuthorData.email,
                        affiliation: coAuthorData.affiliation || coAuthorData.institution || coAuthorData.university,
                        userId: coAuthorId
                      });
                    }
                  } catch (error) {
                    logger.warn(`Failed to fetch co-author: ${coAuthorId}`, {
                      context: { coAuthorId, error },
                      category: LogCategory.ERROR
                    });
                  }
                }
              }
            }
          } catch (error) {
            logger.warn('Failed to fetch author information', {
              context: { articleId, error },
              category: LogCategory.ERROR
            });
          }
          
          // If no author information was found, create a placeholder
          if (authorInfos.length === 0) {
            authorInfos = [{ 
              name: 'Anonymous Author',
              displayName: 'Anonymous Author',
              userId: fetchedArticle.authorId
            }];
          }
          
          // Set authors state
          setAuthors(authorInfos);
          
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

  const handleShare = (platform: SharePlatform) => {
    recordShare(platform);
  };

  return (
    <Layout title={article?.title || 'Article'} activePage="articles">
      <Container maxW="container.xl" py={8}>
        <FirebaseClientOnly
          fallback={
            <Box p={6} borderRadius="md" boxShadow="sm">
              <Text>Loading article content...</Text>
            </Box>
          }
        >
          <Grid templateColumns={{ base: '1fr', md: '3fr 1fr' }} gap={8}>
            <Box>
              <ArticleHeader 
                article={article} 
                isLoading={isLoading}
                authors={authors}
              />
              <Grid 
                templateColumns={{ base: '1fr', md: '4fr 1fr' }} 
                gap={6}
                mt={8}
              >
                <GridItem colSpan={{ base: 1, md: 1 }}>
                  <ArticleContent 
                    article={article} 
                    isLoading={isLoading} 
                  />
                </GridItem>
                <GridItem colSpan={{ base: 1, md: 1 }}>
                  <ArticleSidebar 
                    article={article} 
                    reviews={reviews}
                    metrics={{
                      readCount: metrics?.viewCount || 0,
                      citationCount: metrics?.citationCount || 0,
                      shareCount: metrics?.shareCount || {},
                    }}
                    recordShare={handleShare}
                    isLoading={isLoading}
                    authors={authors}
                  />
                </GridItem>
              </Grid>
            </Box>
          </Grid>
        </FirebaseClientOnly>
      </Container>
    </Layout>
  );
};

export default ArticleDetailPage;
