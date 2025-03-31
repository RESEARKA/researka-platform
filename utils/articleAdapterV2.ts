import { Article } from '../services/articleServiceV2';
import { Review } from '../services/reviewServiceV2';

// Article format expected by the UI components
export interface PageArticle {
  id: string;
  title: string;
  abstract: string;
  category: string;
  keywords: string[];
  author: string;
  authorId: string;
  date: string;
  // Content sections
  introduction?: string;
  methods?: string;
  results?: string;
  discussion?: string;
  references?: string;
  // Metadata
  reviewCount: number;
  views: number;
  // Optional fields
  funding?: string;
  ethicalApprovals?: string;
  dataAvailability?: string;
  conflicts?: string;
  license?: string;
}

/**
 * Convert Firebase article to the format expected by the UI
 */
export function convertToPageArticle(article: Article): PageArticle {
  return {
    id: article.id || '',
    title: article.title,
    abstract: article.abstract,
    category: article.category,
    keywords: article.keywords,
    author: article.author,
    authorId: article.authorId,
    date: article.date,
    introduction: article.introduction,
    methods: article.methods,
    results: article.results,
    discussion: article.discussion,
    references: article.references,
    reviewCount: article.reviewCount,
    views: article.views,
    funding: article.funding,
    ethicalApprovals: article.ethicalApprovals,
    dataAvailability: article.dataAvailability,
    conflicts: article.conflicts,
    license: article.license,
  };
}

/**
 * Convert multiple Firebase articles to the format expected by the UI
 */
export function convertToPageArticles(articles: Article[]): PageArticle[] {
  return articles.map(convertToPageArticle);
}

// Review format expected by the UI components
export interface PageReview {
  id: string;
  articleId: string;
  reviewerName: string;
  reviewerInstitution?: string;
  date: string;
  // Review scores
  novelty: number;
  methodology: number;
  clarity: number;
  significance: number;
  overall: number;
  // Text feedback
  strengths: string;
  weaknesses: string;
  comments: string;
}

/**
 * Convert Firebase review to the format expected by the UI
 */
export function convertToPageReview(review: Review): PageReview {
  // Calculate overall score
  const overall = (review.novelty + review.methodology + review.clarity + review.significance) / 4;
  
  // Format date from Timestamp
  const date = review.createdAt 
    ? new Date(review.createdAt.toMillis()).toISOString().split('T')[0] 
    : new Date().toISOString().split('T')[0];
  
  return {
    id: review.id || '',
    articleId: review.articleId,
    reviewerName: review.reviewerName,
    reviewerInstitution: review.reviewerInstitution,
    date,
    novelty: review.novelty,
    methodology: review.methodology,
    clarity: review.clarity,
    significance: review.significance,
    overall: parseFloat(overall.toFixed(1)),
    strengths: review.strengths,
    weaknesses: review.weaknesses,
    comments: review.comments,
  };
}

/**
 * Convert multiple Firebase reviews to the format expected by the UI
 */
export function convertToPageReviews(reviews: Review[]): PageReview[] {
  return reviews.map(convertToPageReview);
}
