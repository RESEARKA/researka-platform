import { Article, Flag, FlagReason } from './articleTypes';
import { getAllArticles } from './mockArticles';

// Mock user types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'reviewer' | 'editor' | 'admin';
  status: 'active' | 'pending' | 'suspended' | 'banned';
  walletAddress?: string;
  registrationDate: string;
  lastActive: string;
  articleCount: number;
  reviewCount: number;
}

export interface ArticleSubmission extends Article {
  status: 'pending' | 'approved' | 'rejected' | 'revisions_requested';
  submittedDate: string;
  reviewAssignments: ReviewAssignment[];
}

export interface ReviewAssignment {
  id: string;
  reviewerId: string;
  reviewerName: string;
  status: 'pending' | 'completed' | 'declined';
  assignedDate: string;
  completedDate?: string;
  decision?: 'accept' | 'reject' | 'revise';
  comments?: string;
  rating?: number;
}

export interface AnalyticsData {
  userMetrics: {
    totalUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
    activeUsersToday: number;
    usersByRole: {
      user: number;
      reviewer: number;
      editor: number;
      admin: number;
    };
  };
  contentMetrics: {
    totalArticles: number;
    newArticlesToday: number;
    newArticlesThisWeek: number;
    newArticlesThisMonth: number;
    articlesPerCategory: Record<string, number>;
    totalViews: number;
    totalCitations: number;
    totalDownloads: number;
    flaggedContent: number;
  };
  reviewMetrics: {
    pendingReviews: number;
    completedReviews: number;
    averageReviewTime: number; // in days
    reviewsPerDay: number[];
    reviewDecisions: {
      accept: number;
      reject: number;
      revise: number;
    };
  };
}

// Mock users data
const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'admin',
    status: 'active',
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    registrationDate: '2024-01-15',
    lastActive: '2025-03-13',
    articleCount: 5,
    reviewCount: 12
  },
  {
    id: 'u2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'editor',
    status: 'active',
    walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    registrationDate: '2024-02-10',
    lastActive: '2025-03-12',
    articleCount: 3,
    reviewCount: 8
  },
  {
    id: 'u3',
    name: 'Robert Johnson',
    email: 'robert.johnson@example.com',
    role: 'reviewer',
    status: 'active',
    walletAddress: '0x7890abcdef1234567890abcdef1234567890abcd',
    registrationDate: '2024-02-20',
    lastActive: '2025-03-10',
    articleCount: 2,
    reviewCount: 15
  },
  {
    id: 'u4',
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    role: 'user',
    status: 'active',
    walletAddress: '0xdef1234567890abcdef1234567890abcdef123456',
    registrationDate: '2024-03-05',
    lastActive: '2025-03-13',
    articleCount: 1,
    reviewCount: 0
  },
  {
    id: 'u5',
    name: 'Michael Wilson',
    email: 'michael.wilson@example.com',
    role: 'user',
    status: 'pending',
    registrationDate: '2025-03-12',
    lastActive: '2025-03-12',
    articleCount: 0,
    reviewCount: 0
  },
  {
    id: 'u6',
    name: 'Sarah Brown',
    email: 'sarah.brown@example.com',
    role: 'reviewer',
    status: 'suspended',
    walletAddress: '0x567890abcdef1234567890abcdef1234567890ab',
    registrationDate: '2024-01-25',
    lastActive: '2025-02-28',
    articleCount: 4,
    reviewCount: 7
  }
];

// Mock flags data
const mockFlags: Flag[] = [
  {
    id: 'f1',
    articleId: 'a1',
    reason: 'inappropriate_content',
    description: 'Contains offensive language in the discussion section',
    createdAt: '2025-03-10T09:15:00Z',
    createdBy: 'u3',
    status: 'pending'
  },
  {
    id: 'f2',
    articleId: 'a4',
    reason: 'copyright_violation',
    description: 'Figure 2 appears to be copied from another publication without attribution',
    createdAt: '2025-03-12T14:30:00Z',
    createdBy: 'u5',
    status: 'pending'
  },
  {
    id: 'f3',
    articleId: 'a7',
    reason: 'plagiarism',
    description: 'Several paragraphs in the methods section appear to be plagiarized',
    createdAt: '2025-03-08T11:45:00Z',
    createdBy: 'u2',
    status: 'reviewed',
    reviewedAt: '2025-03-09T10:20:00Z',
    reviewedBy: 'u10',
    resolution: 'Author contacted for explanation'
  }
];

// Generate mock article submissions based on existing articles
function generateMockSubmissions(): ArticleSubmission[] {
  const allArticles = getAllArticles();
  
  return allArticles.slice(0, 10).map((article, index) => {
    const status = index < 3 
      ? 'pending' 
      : index < 6 
        ? 'approved' 
        : index < 8 
          ? 'rejected' 
          : 'revisions_requested';
    
    const reviewAssignments: ReviewAssignment[] = [];
    
    // Add 1-3 review assignments per article
    const reviewCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < reviewCount; i++) {
      const reviewer = mockUsers.find(u => u.role === 'reviewer') || mockUsers[2];
      const isCompleted = Math.random() > 0.4;
      
      reviewAssignments.push({
        id: `rev-${article.id}-${i}`,
        reviewerId: reviewer.id,
        reviewerName: reviewer.name,
        status: isCompleted ? 'completed' : 'pending',
        assignedDate: '2025-02-20',
        ...(isCompleted && {
          completedDate: '2025-03-05',
          decision: Math.random() > 0.7 ? 'accept' : Math.random() > 0.5 ? 'reject' : 'revise',
          comments: 'This is a detailed review of the article with suggestions for improvement.',
          rating: Math.floor(Math.random() * 5) + 1
        })
      });
    }
    
    return {
      ...article,
      status,
      submittedDate: '2025-02-15',
      reviewAssignments
    };
  });
};

const mockSubmissions = generateMockSubmissions();

// Generate mock analytics data
function generateMockAnalytics(): AnalyticsData {
  const users = mockUsers;
  const articles = getAllArticles();
  const submissions = mockSubmissions;
  
  // Calculate user metrics
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekAgo = today - 7 * 24 * 60 * 60 * 1000;
  const monthAgo = today - 30 * 24 * 60 * 60 * 1000;
  
  const newUsersToday = users.filter(u => new Date(u.registrationDate).getTime() >= today).length;
  const newUsersThisWeek = users.filter(u => new Date(u.registrationDate).getTime() >= weekAgo).length;
  const newUsersThisMonth = users.filter(u => new Date(u.registrationDate).getTime() >= monthAgo).length;
  const activeUsersToday = users.filter(u => new Date(u.lastActive).getTime() >= today).length;
  
  const usersByRole = {
    user: users.filter(u => u.role === 'user').length,
    reviewer: users.filter(u => u.role === 'reviewer').length,
    editor: users.filter(u => u.role === 'editor').length,
    admin: users.filter(u => u.role === 'admin').length,
  };
  
  // Calculate content metrics
  const newArticlesToday = articles.filter(a => new Date(a.publishedDate).getTime() >= today).length;
  const newArticlesThisWeek = articles.filter(a => new Date(a.publishedDate).getTime() >= weekAgo).length;
  const newArticlesThisMonth = articles.filter(a => new Date(a.publishedDate).getTime() >= monthAgo).length;
  
  const articlesPerCategory: Record<string, number> = {};
  articles.forEach(article => {
    const category = article.mainCategory || article.category || 'Uncategorized';
    articlesPerCategory[category] = (articlesPerCategory[category] || 0) + 1;
  });
  
  const totalViews = articles.reduce((sum, article) => sum + article.views, 0);
  const totalCitations = articles.reduce((sum, article) => sum + article.citations, 0);
  const totalDownloads = articles.reduce((sum, article) => sum + (article.metrics?.downloads || 0), 0);
  const flaggedContent = mockFlags.filter(f => f.status === 'pending').length;
  
  // Calculate review metrics
  const pendingReviews = submissions.reduce((sum, sub) => {
    return sum + sub.reviewAssignments.filter(r => r.status === 'pending').length;
  }, 0);
  
  const completedReviews = submissions.reduce((sum, sub) => {
    return sum + sub.reviewAssignments.filter(r => r.status === 'completed').length;
  }, 0);
  
  const reviewTimes: number[] = [];
  submissions.forEach(sub => {
    sub.reviewAssignments.forEach(r => {
      if (r.status === 'completed' && r.assignedDate && r.completedDate) {
        const assignedTime = new Date(r.assignedDate).getTime();
        const completedTime = new Date(r.completedDate).getTime();
        const days = (completedTime - assignedTime) / (24 * 60 * 60 * 1000);
        reviewTimes.push(days);
      }
    });
  });
  
  const averageReviewTime = reviewTimes.length > 0 
    ? reviewTimes.reduce((sum, time) => sum + time, 0) / reviewTimes.length 
    : 0;
  
  const reviewsPerDay = Array(7).fill(0);
  for (let i = 0; i < 7; i++) {
    const dayStart = today - (6 - i) * 24 * 60 * 60 * 1000;
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    
    submissions.forEach(sub => {
      sub.reviewAssignments.forEach(r => {
        if (r.status === 'completed' && r.completedDate) {
          const completedTime = new Date(r.completedDate).getTime();
          if (completedTime >= dayStart && completedTime < dayEnd) {
            reviewsPerDay[i]++;
          }
        }
      });
    });
  }
  
  const reviewDecisions = {
    accept: 0,
    reject: 0,
    revise: 0
  };
  
  submissions.forEach(sub => {
    sub.reviewAssignments.forEach(r => {
      if (r.status === 'completed' && r.decision) {
        reviewDecisions[r.decision]++;
      }
    });
  });
  
  return {
    userMetrics: {
      totalUsers: users.length,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      activeUsersToday,
      usersByRole
    },
    contentMetrics: {
      totalArticles: articles.length,
      newArticlesToday,
      newArticlesThisWeek,
      newArticlesThisMonth,
      articlesPerCategory,
      totalViews,
      totalCitations,
      totalDownloads,
      flaggedContent
    },
    reviewMetrics: {
      pendingReviews,
      completedReviews,
      averageReviewTime,
      reviewsPerDay,
      reviewDecisions
    }
  };
}

// Admin service functions
export const getUsers = (): User[] => {
  return [...mockUsers];
};

export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const updateUserStatus = (id: string, status: User['status']): User | undefined => {
  const userIndex = mockUsers.findIndex(user => user.id === id);
  if (userIndex === -1) return undefined;
  
  // In a real app, this would update the database
  // For this mock, we'll just return the updated user
  const updatedUser = {
    ...mockUsers[userIndex],
    status
  };
  
  return updatedUser;
};

export const updateUserRole = (id: string, role: User['role']): User | undefined => {
  const userIndex = mockUsers.findIndex(user => user.id === id);
  if (userIndex === -1) return undefined;
  
  // In a real app, this would update the database
  // For this mock, we'll just return the updated user
  const updatedUser = {
    ...mockUsers[userIndex],
    role
  };
  
  return updatedUser;
};

export const getPendingSubmissions = (): ArticleSubmission[] => {
  return mockSubmissions.filter(sub => sub.status === 'pending');
};

export const getAllSubmissions = (): ArticleSubmission[] => {
  return [...mockSubmissions];
};

export const getSubmissionById = (id: string): ArticleSubmission | undefined => {
  return mockSubmissions.find(sub => sub.id === id);
};

export const updateSubmissionStatus = (
  id: string, 
  status: ArticleSubmission['status']
): ArticleSubmission | undefined => {
  const subIndex = mockSubmissions.findIndex(sub => sub.id === id);
  if (subIndex === -1) return undefined;
  
  // In a real app, this would update the database
  // For this mock, we'll just return the updated submission
  const updatedSubmission = {
    ...mockSubmissions[subIndex],
    status
  };
  
  return updatedSubmission;
};

export const assignReviewer = (
  submissionId: string,
  reviewerId: string,
  reviewerName: string
): ArticleSubmission | undefined => {
  const subIndex = mockSubmissions.findIndex(sub => sub.id === submissionId);
  if (subIndex === -1) return undefined;
  
  const newAssignment: ReviewAssignment = {
    id: `rev-${submissionId}-${Date.now()}`,
    reviewerId,
    reviewerName,
    status: 'pending',
    assignedDate: new Date().toISOString().split('T')[0]
  };
  
  // In a real app, this would update the database
  // For this mock, we'll just return the updated submission
  const updatedSubmission = {
    ...mockSubmissions[subIndex],
    reviewAssignments: [...mockSubmissions[subIndex].reviewAssignments, newAssignment]
  };
  
  return updatedSubmission;
};

export function getFlags(): Flag[] {
  return [...mockFlags];
}

export function getPendingFlags(): Flag[] {
  return mockFlags.filter(flag => flag.status === 'pending');
}

export function getFlagById(id: string): Flag | undefined {
  return mockFlags.find(flag => flag.id === id);
}

export function getFlagsByArticleId(articleId: string): Flag[] {
  return mockFlags.filter(flag => flag.articleId === articleId);
}

export function createFlag(
  articleId: string,
  reason: FlagReason,
  description: string,
  userId: string
): Flag {
  const newFlag: Flag = {
    id: `f${mockFlags.length + 1}`,
    articleId,
    reason,
    description,
    createdAt: new Date().toISOString(),
    createdBy: userId,
    status: 'pending'
  };
  
  mockFlags.push(newFlag);
  return newFlag;
}

export function updateFlagStatus(
  id: string,
  status: Flag['status'],
  reviewerId: string,
  resolution?: string
): Flag | undefined {
  const flagIndex = mockFlags.findIndex(flag => flag.id === id);
  if (flagIndex === -1) return undefined;
  
  const updatedFlag = {
    ...mockFlags[flagIndex],
    status,
    reviewedAt: new Date().toISOString(),
    reviewedBy: reviewerId
  };
  
  if (resolution) {
    updatedFlag.resolution = resolution;
  }
  
  mockFlags[flagIndex] = updatedFlag;
  return updatedFlag;
}

export function getAnalytics(): AnalyticsData {
  return generateMockAnalytics();
}
