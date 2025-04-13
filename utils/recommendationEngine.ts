/**
 * Recommendation Engine for Researka Platform
 * 
 * This module provides functions to recommend articles to users based on their research interests,
 * and to match reviewers to articles based on expertise alignment.
 */

import { getAllResearchFields, getFieldById, getParentField } from './researchTaxonomy';

// Enhanced Article interface
export interface Article {
  id: string;
  title: string;
  abstract: string;
  keywords: string[];
  categories: string[];
  authorId: string;
  publishedDate?: string;
  views?: number;
  citations?: number;
  reviewCount: number;
  status: 'pending' | 'under_review' | 'accepted' | 'rejected';
  // Standardized template fields
  introduction?: string;
  literatureReview?: string;
  methods?: string;
  results?: string;
  discussion?: string;
  conclusion?: string;
  acknowledgments?: string;
  references?: string[];
  // Additional fields for author information
  content?: string;
  coAuthors?: string[];
}

// User interface
export interface User {
  id: string;
  researchInterests: string[];
}

// Recommendation result interface
export interface RecommendationResult {
  article: Article;
  score: number;
}

// Enhanced recommendation result with match type
export interface EnhancedRecommendationResult {
  article: Article;
  matchType: 'interest' | 'needs_reviews' | 'oldest' | 'trending';
  score?: number;
}

/**
 * Calculate similarity score between user interests and article keywords/categories
 * 
 * @param userInterests Array of user's research interest IDs
 * @param articleKeywords Array of article keyword IDs
 * @param articleCategories Array of article category IDs
 * @returns Similarity score between 0 and 1
 */
export function calculateSimilarityScore(
  userInterests: string[],
  articleKeywords: string[],
  articleCategories: string[]
): number {
  if (!userInterests.length || (!articleKeywords.length && !articleCategories.length)) {
    return 0;
  }

  // Combine keywords and categories for matching
  const articleTerms = Array.from(new Set([...articleKeywords, ...articleCategories]));
  
  let totalScore = 0;
  let matchCount = 0;
  
  // For each user interest, find the best match in article terms
  for (const interest of userInterests) {
    let bestMatchScore = 0;
    
    // Check for direct matches
    if (articleTerms.includes(interest)) {
      bestMatchScore = 1.0; // Exact match
    } else {
      // Check for parent-child relationships
      const parentField = getParentField(interest);
      if (parentField && articleTerms.includes(parentField.id)) {
        bestMatchScore = 0.75; // Parent field match
      } else {
        // Check if any article term is a child of this interest
        for (const term of articleTerms) {
          const termParent = getParentField(term);
          if (termParent && termParent.id === interest) {
            bestMatchScore = Math.max(bestMatchScore, 0.75); // Child field match
          }
        }
      }
      
      // Check for sibling relationships (same parent)
      if (bestMatchScore === 0) {
        const interestParent = getParentField(interest);
        if (interestParent) {
          for (const term of articleTerms) {
            const termParent = getParentField(term);
            if (termParent && termParent.id === interestParent.id) {
              bestMatchScore = Math.max(bestMatchScore, 0.5); // Sibling field match
            }
          }
        }
      }
    }
    
    if (bestMatchScore > 0) {
      totalScore += bestMatchScore;
      matchCount++;
    }
  }
  
  // Calculate final score
  // 1. Average match quality (how good were the matches)
  const avgMatchQuality = matchCount > 0 ? totalScore / matchCount : 0;
  
  // 2. Coverage (what portion of user interests matched)
  const coverage = matchCount / userInterests.length;
  
  // 3. Relevance (what portion of article terms matched)
  const relevance = matchCount / Math.min(userInterests.length, articleTerms.length);
  
  // Weighted combination
  return (avgMatchQuality * 0.5) + (coverage * 0.3) + (relevance * 0.2);
}

/**
 * Recommend articles to a user based on their research interests
 * 
 * @param user User object with research interests
 * @param articles Array of articles to recommend from
 * @param limit Maximum number of recommendations to return
 * @returns Array of articles with similarity scores
 */
export function recommendArticlesToUser(
  user: User,
  articles: Article[],
  limit: number = 10
): RecommendationResult[] {
  // Filter out user's own articles
  const filteredArticles = articles.filter(article => article.authorId !== user.id);
  
  // Calculate similarity scores
  const articlesWithScores = filteredArticles.map(article => {
    const score = calculateSimilarityScore(
      user.researchInterests,
      article.keywords,
      article.categories
    );
    
    return { article, score };
  });
  
  // Sort by score (descending) and take top results
  const sortedArticles = articlesWithScores
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  return sortedArticles;
}

/**
 * Find potential reviewers for an article based on research interest overlap
 * 
 * @param article Article to find reviewers for
 * @param users Array of potential reviewers
 * @param limit Maximum number of reviewers to return
 * @returns Array of users with match scores and overlapping interests
 */
export function findReviewersForArticle(
  article: Article,
  users: any[],
  limit: number = 5
): { userId: string; matchScore: number; interestOverlap: string[] }[] {
  // Filter out the article author
  const potentialReviewers = users.filter(user => user.id !== article.authorId);
  
  // Calculate match scores and find overlapping interests
  const reviewersWithScores = potentialReviewers.map(user => {
    const userInterests = user.researchInterests || [];
    const articleTerms = Array.from(new Set([...article.keywords, ...article.categories]));
    
    // Find directly overlapping interests
    const interestOverlap = userInterests.filter((interest: string) => 
      articleTerms.includes(interest)
    );
    
    // Find parent-child relationships
    for (const interest of userInterests) {
      if (!interestOverlap.includes(interest)) {
        // Check if interest is parent of any article term
        for (const term of articleTerms) {
          const termParent = getParentField(term);
          if (termParent && termParent.id === interest) {
            interestOverlap.push(interest);
            break;
          }
        }
      }
      
      if (!interestOverlap.includes(interest)) {
        // Check if interest is child of any article term
        const interestParent = getParentField(interest);
        if (interestParent && articleTerms.includes(interestParent.id)) {
          interestOverlap.push(interest);
        }
      }
    }
    
    const matchScore = calculateSimilarityScore(
      userInterests,
      article.keywords,
      article.categories
    );
    
    return { 
      userId: user.id,
      matchScore,
      interestOverlap: Array.from(new Set(interestOverlap)) as string[]
    };
  });
  
  // Sort by match score (descending) and take top results
  const sortedReviewers = reviewersWithScores
    .filter(item => item.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
  
  return sortedReviewers;
}

/**
 * Generate a comprehensive feed of articles for a user, combining multiple recommendation strategies
 * 
 * @param user User to generate feed for
 * @param articles Array of available articles
 * @param limit Maximum number of articles to include in feed
 * @returns Array of articles with recommendation types and scores
 */
export function generateComprehensiveFeed(
  user: User,
  articles: Article[],
  limit: number = 20
): EnhancedRecommendationResult[] {
  // Filter out user's own articles and already published/rejected articles
  const eligibleArticles = articles.filter(article => 
    article.authorId !== user.id && 
    ['pending', 'under_review'].includes(article.status)
  );
  
  // 1. Interest-based recommendations (60%)
  const interestLimit = Math.floor(limit * 0.6);
  const interestRecommendations = recommendArticlesToUser(user, eligibleArticles, interestLimit)
    .map(item => ({ 
      article: item.article, 
      matchType: 'interest' as const, 
      score: item.score 
    }));
  
  const recommendedIds = new Set(interestRecommendations.map(r => r.article.id));
  const remainingArticles = eligibleArticles.filter(article => !recommendedIds.has(article.id));
  
  // 2. Review status priority (20%)
  // Prioritize articles with fewer than 2 reviews
  const reviewLimit = Math.ceil(limit * 0.2);
  const reviewPriorityArticles = [...remainingArticles]
    .sort((a, b) => (a.reviewCount || 0) - (b.reviewCount || 0))
    .slice(0, reviewLimit)
    .map(article => ({ 
      article, 
      matchType: 'needs_reviews' as const,
      score: undefined
    }));
  
  const reviewPriorityIds = new Set(reviewPriorityArticles.map(r => r.article.id));
  const remainingForAge = remainingArticles.filter(article => !reviewPriorityIds.has(article.id));
  
  // 3. Age-based fallback (20%)
  // Prioritize oldest articles that haven't been recommended yet
  const ageLimit = Math.ceil(limit * 0.2);
  const oldestArticles = [...remainingForAge]
    .sort((a, b) => {
      const dateA = a.publishedDate ? new Date(a.publishedDate).getTime() : Date.now();
      const dateB = b.publishedDate ? new Date(b.publishedDate).getTime() : Date.now();
      return dateA - dateB;
    })
    .slice(0, ageLimit)
    .map(article => ({ 
      article, 
      matchType: 'oldest' as const,
      score: undefined
    }));
  
  // Combine all approaches
  const combinedFeed: EnhancedRecommendationResult[] = [
    ...interestRecommendations,
    ...reviewPriorityArticles,
    ...oldestArticles
  ];
  
  // If we still haven't reached the limit, add trending articles
  if (combinedFeed.length < limit) {
    const combinedIds = new Set(combinedFeed.map(item => item.article.id));
    const remainingForTrending = eligibleArticles.filter(article => !combinedIds.has(article.id));
    
    const trendingLimit = limit - combinedFeed.length;
    const trendingArticles = [...remainingForTrending]
      .sort((a, b) => {
        const scoreA = (a.views || 0) + (a.citations || 0) * 5;
        const scoreB = (b.views || 0) + (b.citations || 0) * 5;
        return scoreB - scoreA;
      })
      .slice(0, trendingLimit)
      .map(article => ({ 
        article, 
        matchType: 'trending' as const,
        score: undefined
      }));
    
    combinedFeed.push(...trendingArticles);
  }
  
  return combinedFeed;
}

/**
 * Generate a personalized feed of articles for a user
 * Combines interest-based recommendations with trending articles
 * 
 * @param user User to generate feed for
 * @param articles Array of available articles
 * @param limit Maximum number of articles to include in feed
 * @returns Array of articles
 */
export function generatePersonalizedFeed(
  user: User,
  articles: Article[],
  limit: number = 20
): Article[] {
  // Filter out user's own articles
  const filteredArticles = articles.filter(article => article.authorId !== user.id);
  
  // Get interest-based recommendations (70% of feed)
  const interestLimit = Math.floor(limit * 0.7);
  const recommendations = recommendArticlesToUser(user, filteredArticles, interestLimit);
  
  // Get trending articles for the remaining slots (30% of feed)
  const recommendedIds = new Set(recommendations.map(r => r.article.id));
  const remainingArticles = filteredArticles.filter(article => !recommendedIds.has(article.id));
  
  const trendingLimit = limit - recommendations.length;
  const trendingArticles = [...remainingArticles]
    .sort((a, b) => {
      const scoreA = (a.views || 0) + (a.citations || 0) * 5;
      const scoreB = (b.views || 0) + (b.citations || 0) * 5;
      return scoreB - scoreA;
    })
    .slice(0, trendingLimit);
  
  // Combine recommendations and trending articles
  return [
    ...recommendations.map(r => r.article),
    ...trendingArticles
  ];
}
