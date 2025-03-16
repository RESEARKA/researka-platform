// Article submission data interface
export interface ArticleSubmission {
  title: string;
  abstract: string;
  authors: string[];
  keywords: string[];
  file: File;
  category: string;
}

// Import the Article type from the types file
import { Article } from '../types/articleTypes';
// Import ReviewStatus from reviewTypes
import { ReviewStatus } from '../types/reviewTypes';

// Export the Article type for use in other components
export type { Article };

// Article interface (local version with additional fields)
export interface LocalArticle extends Article {
  id: string;
  submittedDate: string;
  publishedDate?: string;
  fileUrl?: string;
  submittedBy: {
    id: string;
    name: string;
  };
  reviews?: ArticleReview[];
  revisionCount?: number;
  lastRevisedDate?: string;
}

// Review interface
export interface ArticleReview {
  id: string;
  articleId: string;
  articleTitle: string;
  reviewerId?: string;
  reviewerName?: string;
  assignedDate: string;
  dueDate: string;
  status: ReviewStatus;
  compensation: number;
  completed?: boolean;
  comments?: string;
  comment?: string;
  rating?: number;
  decision?: 'accept' | 'reject' | 'revise';
  reviewDate?: string;
}

/**
 * Submit a new article
 */
export async function submitArticle(submission: ArticleSubmission): Promise<LocalArticle> {
  try {
    // For demo purposes, we're simulating an API call
    // In production, replace this with a real API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate a mock article ID
    const articleId = Math.random().toString(36).substring(2, 10);
    
    // Create a mock article response
    const newArticle: LocalArticle = {
      id: articleId,
      title: submission.title,
      abstract: submission.abstract,
      authors: submission.authors,
      keywords: submission.keywords,
      status: 'pending',
      submittedDate: new Date().toISOString().split('T')[0],
      category: submission.category,
      fileUrl: URL.createObjectURL(submission.file),
      submittedBy: {
        id: '123456789',
        name: 'Dr. Jane Smith'
      }
    };
    
    return newArticle;
  } catch (error) {
    console.error('Error submitting article:', error);
    throw error;
  }
}

/**
 * Get user's submitted articles
 */
export async function getUserSubmissions(userId: string): Promise<LocalArticle[]> {
  try {
    // For demo purposes, we're simulating an API call
    // In production, replace this with a real API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock submissions data
    const mockSubmissions: LocalArticle[] = [
      {
        id: '1',
        title: 'Blockchain-Based Verification of Scientific Results',
        abstract: 'This paper presents a novel approach to verifying scientific results using blockchain technology...',
        authors: ['Dr. Jane Smith', 'Dr. John Doe'],
        keywords: ['blockchain', 'verification', 'scientific integrity'],
        status: 'published',
        submittedDate: '2025-01-10',
        publishedDate: '2025-02-15',
        category: 'Blockchain Applications',
        submittedBy: {
          id: userId,
          name: 'Dr. Jane Smith'
        },
        reviews: [
          {
            id: 'r1',
            articleId: '1',
            articleTitle: 'Blockchain-Based Verification of Scientific Results',
            reviewerId: 'reviewer1',
            reviewerName: 'Dr. Robert Chen',
            completed: true,
            assignedDate: '2025-01-15',
            dueDate: '2025-01-25',
            comments: 'Excellent methodology and clear presentation of results.',
            rating: 4.5,
            decision: 'accept',
            status: ReviewStatus.COMPLETED,
            compensation: 100,
            reviewDate: '2025-01-23'
          },
          {
            id: 'r2',
            articleId: '1',
            articleTitle: 'Blockchain-Based Verification of Scientific Results',
            reviewerId: 'reviewer2',
            reviewerName: 'Dr. Maria Garcia',
            completed: true,
            assignedDate: '2025-01-15',
            dueDate: '2025-01-25',
            comments: 'Innovative approach with significant implications for the field.',
            rating: 5,
            decision: 'accept',
            status: ReviewStatus.COMPLETED,
            compensation: 100,
            reviewDate: '2025-01-20'
          }
        ]
      },
      {
        id: '2',
        title: 'Incentive Mechanisms for Open Peer Review',
        abstract: 'We explore various incentive mechanisms to encourage participation in open peer review processes...',
        authors: ['Dr. Jane Smith'],
        keywords: ['peer review', 'incentives', 'academic publishing'],
        status: 'in_review',
        submittedDate: '2025-02-28',
        category: 'Academic Publishing',
        submittedBy: {
          id: userId,
          name: 'Dr. Jane Smith'
        },
        reviews: [
          {
            id: 'r3',
            articleId: '2',
            articleTitle: 'Incentive Mechanisms for Open Peer Review',
            reviewerId: 'reviewer3',
            reviewerName: 'Dr. James Wilson',
            completed: true,
            assignedDate: '2025-03-01',
            dueDate: '2025-03-15',
            comments: 'The literature review is comprehensive, but the methodology needs clarification.',
            rating: 3.5,
            decision: 'revise',
            status: ReviewStatus.COMPLETED,
            compensation: 80,
            reviewDate: '2025-03-10'
          },
          {
            id: 'r4',
            articleId: '2',
            articleTitle: 'Incentive Mechanisms for Open Peer Review',
            reviewerId: 'reviewer4',
            reviewerName: 'Dr. Sarah Johnson',
            completed: false,
            assignedDate: '2025-03-05',
            dueDate: '2025-03-20',
            status: ReviewStatus.IN_PROGRESS,
            compensation: 80
          }
        ]
      },
      {
        id: '3',
        title: 'Decentralized Funding Models for Scientific Research',
        abstract: 'This study analyzes various decentralized funding models for scientific research...',
        authors: ['Dr. Jane Smith', 'Dr. Alice Johnson'],
        keywords: ['funding', 'decentralization', 'research'],
        status: 'rejected',
        submittedDate: '2024-12-05',
        category: 'Research Funding',
        submittedBy: {
          id: userId,
          name: 'Dr. Jane Smith'
        },
        reviews: [
          {
            id: 'r5',
            articleId: '3',
            articleTitle: 'Decentralized Funding Models for Scientific Research',
            reviewerId: 'reviewer5',
            reviewerName: 'Dr. Michael Brown',
            completed: true,
            assignedDate: '2024-12-10',
            dueDate: '2024-12-25',
            comments: 'The methodology has significant flaws and the conclusions are not supported by the data.',
            rating: 2,
            decision: 'reject',
            status: ReviewStatus.COMPLETED,
            compensation: 90,
            reviewDate: '2024-12-20'
          },
          {
            id: 'r6',
            articleId: '3',
            articleTitle: 'Decentralized Funding Models for Scientific Research',
            reviewerId: 'reviewer6',
            reviewerName: 'Dr. Emily White',
            completed: true,
            assignedDate: '2024-12-10',
            dueDate: '2024-12-25',
            comments: 'The paper lacks originality and does not make a significant contribution to the field.',
            rating: 2.5,
            decision: 'reject',
            status: ReviewStatus.COMPLETED,
            compensation: 90,
            reviewDate: '2024-12-22'
          }
        ]
      },
      {
        id: '4',
        title: 'Smart Contracts for Automated Peer Review Assignment',
        abstract: 'This paper proposes a system for automating peer review assignments using smart contracts...',
        authors: ['Dr. Jane Smith', 'Dr. Thomas Lee'],
        keywords: ['smart contracts', 'peer review', 'automation'],
        status: 'revision_requested',
        submittedDate: '2025-01-20',
        category: 'Blockchain Applications',
        submittedBy: {
          id: userId,
          name: 'Dr. Jane Smith'
        },
        revisionCount: 1,
        lastRevisedDate: '2025-02-10',
        reviews: [
          {
            id: 'r7',
            articleId: '4',
            articleTitle: 'Smart Contracts for Automated Peer Review Assignment',
            reviewerId: 'reviewer7',
            reviewerName: 'Dr. David Kim',
            completed: true,
            assignedDate: '2025-01-25',
            dueDate: '2025-02-10',
            comments: 'The concept is promising, but the implementation details need to be more thoroughly explained.',
            rating: 3,
            decision: 'revise',
            status: ReviewStatus.COMPLETED,
            compensation: 85,
            reviewDate: '2025-02-05'
          },
          {
            id: 'r8',
            articleId: '4',
            articleTitle: 'Smart Contracts for Automated Peer Review Assignment',
            reviewerId: 'reviewer8',
            reviewerName: 'Dr. Lisa Chen',
            completed: true,
            assignedDate: '2025-01-25',
            dueDate: '2025-02-10',
            comments: 'The paper needs to address potential biases in the automated assignment system.',
            rating: 3.5,
            decision: 'revise',
            status: ReviewStatus.COMPLETED,
            compensation: 85,
            reviewDate: '2025-02-08'
          }
        ]
      },
      {
        id: '5',
        title: 'Tokenized Citation Impact: A New Metric for Academic Influence',
        abstract: 'We introduce a new metric for measuring academic influence based on tokenized citations...',
        authors: ['Dr. Jane Smith'],
        keywords: ['citation metrics', 'tokenization', 'academic impact'],
        status: 'pending',
        submittedDate: '2025-03-01',
        category: 'Academic Publishing',
        submittedBy: {
          id: userId,
          name: 'Dr. Jane Smith'
        }
      }
    ];
    
    return mockSubmissions;
  } catch (error) {
    console.error('Error fetching user submissions:', error);
    throw error;
  }
}

/**
 * Get user's assigned reviews
 */
export async function getUserReviews(userId: string): Promise<ArticleReview[]> {
  try {
    // For demo purposes, we're simulating an API call
    // In production, replace this with a real API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock reviews data
    const mockReviews: ArticleReview[] = [
      {
        id: 'r10',
        articleId: '6',
        articleTitle: 'Decentralized Identity Verification for Academic Credentials',
        reviewerId: userId,
        reviewerName: 'Dr. Jane Smith',
        assignedDate: '2025-02-15',
        dueDate: '2025-03-01',
        status: ReviewStatus.COMPLETED,
        compensation: 100,
        completed: true,
        comments: 'The paper presents a novel approach with significant practical applications.',
        rating: 4,
        decision: 'accept',
        reviewDate: '2025-02-25'
      },
      {
        id: 'r11',
        articleId: '7',
        articleTitle: 'Blockchain-Based Reputation Systems for Peer Reviewers',
        reviewerId: userId,
        reviewerName: 'Dr. Jane Smith',
        assignedDate: '2025-03-01',
        dueDate: '2025-03-15',
        status: ReviewStatus.IN_PROGRESS,
        compensation: 90,
        completed: false
      },
      {
        id: 'r12',
        articleId: '8',
        articleTitle: 'Incentive Mechanisms for Open Data Sharing in Academia',
        reviewerId: userId,
        reviewerName: 'Dr. Jane Smith',
        assignedDate: '2025-03-05',
        dueDate: '2025-03-20',
        status: ReviewStatus.PENDING,
        compensation: 85,
        completed: false
      }
    ];
    
    return mockReviews;
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    throw error;
  }
}

/**
 * Get article details by ID
 */
export async function getArticleById(articleId: string): Promise<LocalArticle> {
  try {
    // For demo purposes, we're simulating an API call
    // In production, replace this with a real API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock article data
    const mockArticle: LocalArticle = {
      id: articleId,
      title: 'Smart Contracts for Automated Peer Review Assignment',
      abstract: 'This paper proposes a system for automating peer review assignments using smart contracts...',
      authors: ['Dr. Jane Smith', 'Dr. Thomas Lee'],
      keywords: ['smart contracts', 'peer review', 'automation'],
      status: 'revision_requested',
      submittedDate: '2025-01-20',
      category: 'Blockchain Applications',
      submittedBy: {
        id: '123456789',
        name: 'Dr. Jane Smith'
      },
      revisionCount: 1,
      lastRevisedDate: '2025-02-10',
      reviews: [
        {
          id: 'r7',
          articleId: articleId,
          articleTitle: 'Smart Contracts for Automated Peer Review Assignment',
          reviewerId: 'reviewer7',
          reviewerName: 'Dr. David Kim',
          completed: true,
          assignedDate: '2025-01-25',
          dueDate: '2025-02-10',
          comments: 'The concept is promising, but the implementation details need to be more thoroughly explained.',
          rating: 3,
          decision: 'revise',
          status: ReviewStatus.COMPLETED,
          compensation: 85,
          reviewDate: '2025-02-05'
        },
        {
          id: 'r8',
          articleId: articleId,
          articleTitle: 'Smart Contracts for Automated Peer Review Assignment',
          reviewerId: 'reviewer8',
          reviewerName: 'Dr. Lisa Chen',
          completed: true,
          assignedDate: '2025-01-25',
          dueDate: '2025-02-10',
          comments: 'The paper needs to address potential biases in the automated assignment system.',
          rating: 3.5,
          decision: 'revise',
          status: ReviewStatus.COMPLETED,
          compensation: 85,
          reviewDate: '2025-02-08'
        }
      ]
    };
    
    return mockArticle;
  } catch (error) {
    console.error('Error fetching article:', error);
    throw error;
  }
}
