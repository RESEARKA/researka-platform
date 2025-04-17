import { getFirestore, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { createLogger, LogCategory } from './logger';

const logger = createLogger('article-metrics');

/**
 * Increments the view count for an article
 * @param articleId The ID of the article
 */
export const incrementViewCount = async (articleId: string): Promise<void> => {
  try {
    const db = getFirestore();
    const articleRef = doc(db, 'articles', articleId);
    const articleDoc = await getDoc(articleRef);
    
    if (articleDoc.exists()) {
      await updateDoc(articleRef, {
        viewCount: increment(1),
        lastViewed: new Date().toISOString()
      });
    } else {
      logger.error('Article not found when incrementing view count', {
        context: { articleId },
        category: LogCategory.DATA
      });
    }
  } catch (error) {
    logger.error('Failed to increment view count', {
      context: { articleId, error },
      category: LogCategory.ERROR
    });
  }
};

/**
 * Records a social share for an article
 * @param articleId The ID of the article
 * @param platform The platform where the article was shared
 */
export const recordSocialShare = async (
  articleId: string, 
  platform: 'twitter' | 'facebook' | 'linkedin' | 'email'
): Promise<void> => {
  try {
    const db = getFirestore();
    const articleRef = doc(db, 'articles', articleId);
    const articleDoc = await getDoc(articleRef);
    
    if (articleDoc.exists()) {
      const updateData: Record<string, any> = {
        [`shareCount.${platform}`]: increment(1),
        'shareCount.total': increment(1),
        lastShared: new Date().toISOString()
      };
      
      await updateDoc(articleRef, updateData);
    } else {
      logger.error('Article not found when recording social share', {
        context: { articleId, platform },
        category: LogCategory.DATA
      });
    }
  } catch (error) {
    logger.error('Failed to record social share', {
      context: { articleId, platform, error },
      category: LogCategory.ERROR
    });
  }
};

/**
 * Gets the metrics for an article
 * @param articleId The ID of the article
 */
export const getArticleMetrics = async (articleId: string) => {
  try {
    const db = getFirestore();
    const articleRef = doc(db, 'articles', articleId);
    const articleDoc = await getDoc(articleRef);
    
    if (articleDoc.exists()) {
      const data = articleDoc.data();
      return {
        viewCount: data.viewCount || 0,
        shareCount: data.shareCount || { total: 0 },
        citationCount: data.citationCount || 0
      };
    }
    
    return {
      viewCount: 0,
      shareCount: { total: 0 },
      citationCount: 0
    };
  } catch (error) {
    logger.error('Failed to get article metrics', {
      context: { articleId, error },
      category: LogCategory.ERROR
    });
    
    return {
      viewCount: 0,
      shareCount: { total: 0 },
      citationCount: 0
    };
  }
};

/**
 * Updates the citation count for an article
 * @param articleId The ID of the article
 * @param count The new citation count
 */
export const updateCitationCount = async (articleId: string, count: number): Promise<void> => {
  try {
    const db = getFirestore();
    const articleRef = doc(db, 'articles', articleId);
    const articleDoc = await getDoc(articleRef);
    
    if (articleDoc.exists()) {
      await updateDoc(articleRef, {
        citationCount: count,
        lastCitationUpdate: new Date().toISOString()
      });
    } else {
      logger.error('Article not found when updating citation count', {
        context: { articleId },
        category: LogCategory.DATA
      });
    }
  } catch (error) {
    logger.error('Failed to update citation count', {
      context: { articleId, count, error },
      category: LogCategory.ERROR
    });
  }
};
