import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserReviews, ArticleReview } from '../services/articleService';
import { SEO } from '../components/SEO';
import { ReviewStatus, ReviewTier, AvailableArticle } from '../types/reviewTypes';

// Article categories
const CATEGORIES = [
  'Blockchain Applications',
  'Academic Publishing',
  'Decentralized Systems',
  'Open Science',
  'Computer Science',
  'Economics',
  'Physics',
  'Biology',
  'Chemistry',
  'Medicine',
  'Social Sciences',
  'Humanities'
];

export function ReviewDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // State
  const [reviews, setReviews] = useState<ArticleReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<ReviewStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'articleTitle'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [activeTab, setActiveTab] = useState<'my-reviews' | 'available'>('my-reviews');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<ReviewTier | 'all'>('all');
  
  // Mock available articles
  const availableArticles: AvailableArticle[] = [
    {
      id: 'art001',
      title: 'Blockchain-Based Incentives for Open Peer Review',
      abstract: 'This paper explores how blockchain technology can create incentive mechanisms for open peer review...',
      category: 'Blockchain Applications',
      submittedDate: '2025-03-01',
      tier: ReviewTier.PREMIUM,
      tokenReward: 50
    },
    {
      id: 'art002',
      title: 'Decentralized Identity Systems for Academic Publishing',
      abstract: 'We propose a decentralized identity framework for academic publishing that addresses verification challenges...',
      category: 'Academic Publishing',
      submittedDate: '2025-03-05',
      tier: ReviewTier.STANDARD,
      tokenReward: 25
    },
    {
      id: 'art003',
      title: 'Smart Contracts for Automated Research Funding Distribution',
      abstract: 'This study demonstrates how smart contracts can automate research funding distribution based on predefined milestones...',
      category: 'Research Funding',
      submittedDate: '2025-03-10',
      tier: ReviewTier.PREMIUM,
      tokenReward: 50
    },
    {
      id: 'art004',
      title: 'Tokenomics of Scientific Collaboration',
      abstract: 'We analyze various token economic models to incentivize scientific collaboration across institutions...',
      category: 'Decentralized Science',
      submittedDate: '2025-03-12',
      tier: ReviewTier.STANDARD,
      tokenReward: 25
    }
  ];
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const userReviews = await getUserReviews(user.id);
        setReviews(userReviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReviews();
  }, [user]);
  
  // Calculate stats
  const stats = useMemo(() => {
    const pending = reviews.filter(review => review.status === 'pending').length;
    const inProgress = reviews.filter(review => review.status === 'in_progress').length;
    const completed = reviews.filter(review => review.status === 'completed').length;
    
    // Calculate overdue reviews (due date is in the past)
    const overdue = reviews.filter(review => {
      const dueDate = new Date(review.dueDate);
      const today = new Date();
      return dueDate < today && review.status !== 'completed';
    }).length;
    
    return {
      pending,
      inProgress,
      completed,
      total: reviews.length,
      overdue
    };
  }, [reviews]);
  
  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    // First filter by status
    let filtered = reviews;
    if (activeFilter !== 'all') {
      filtered = reviews.filter(review => review.status === activeFilter as ReviewStatus);
    }
    
    // Then filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(review => 
        review.articleTitle.toLowerCase().includes(query)
      );
    }
    
    // Sort the filtered reviews
    return [...filtered].sort((a, b) => {
      if (sortBy === 'dueDate') {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        const titleA = a.articleTitle.toLowerCase();
        const titleB = b.articleTitle.toLowerCase();
        return sortOrder === 'asc' 
          ? titleA.localeCompare(titleB) 
          : titleB.localeCompare(titleA);
      }
    });
  }, [reviews, activeFilter, searchQuery, sortBy, sortOrder]);
  
  // Filter available articles
  const filteredAvailableArticles = useMemo(() => {
    let filtered = availableArticles;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }
    
    // Filter by tier
    if (selectedTier !== 'all') {
      filtered = filtered.filter(article => article.tier === selectedTier);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(query) || 
        article.abstract.toLowerCase().includes(query)
      );
    }
    
    // Sort by date (newest first)
    return [...filtered].sort((a, b) => {
      return new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime();
    });
  }, [availableArticles, selectedCategory, selectedTier, searchQuery]);
  
  // Toggle sort order
  const handleSort = (field: 'dueDate' | 'articleTitle') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };
  
  // Get status badge color
  const getStatusBadge = (status: ReviewStatus | undefined) => {
    switch (status) {
      case ReviewStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case ReviewStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case ReviewStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case ReviewStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get tier badge
  const getTierBadge = (tier: ReviewTier) => {
    switch (tier) {
      case ReviewTier.STANDARD:
        return 'bg-blue-100 text-blue-800';
      case ReviewTier.PREMIUM:
        return 'bg-purple-100 text-purple-800';
      case ReviewTier.EXPERT:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get tier description
  const getTierDescription = (tier: ReviewTier) => {
    switch (tier) {
      case ReviewTier.STANDARD:
        return 'Standard - earn 1x token';
      case ReviewTier.PREMIUM:
        return 'Premium - earn 2x token';
      case ReviewTier.EXPERT:
        return 'Expert - earn 3x token';
      default:
        return '';
    }
  };
  
  // Check if a review is overdue
  const isOverdue = (dueDate: string) => {
    const reviewDueDate = new Date(dueDate);
    const today = new Date();
    return reviewDueDate < today;
  };
  
  // Handle claiming an article for review
  const handleClaimArticle = (articleId: string) => {
    // In a real app, this would make an API call to claim the article
    alert(`Article ${articleId} claimed for review!`);
    // Then refresh the lists
  };
  
  return (
    <div className="min-h-screen bg-blueGray-50">
      <SEO title="Review Dashboard | Researka" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-blueGray-700">Review Dashboard</h1>
        </div>
        
        {/* Stats cards - horizontal layout */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex flex-wrap -mx-2">
            <div className="px-2 w-1/5">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
                  <i className="fas fa-tasks"></i>
                </div>
                <div>
                  <p className="text-sm text-blueGray-500">Total Reviews</p>
                  <h3 className="text-2xl font-bold">{stats.total}</h3>
                </div>
              </div>
            </div>
            
            <div className="px-2 w-1/5">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
                  <i className="fas fa-clock"></i>
                </div>
                <div>
                  <p className="text-sm text-blueGray-500">Pending</p>
                  <h3 className="text-2xl font-bold">{stats.pending}</h3>
                </div>
              </div>
            </div>
            
            <div className="px-2 w-1/5">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
                  <i className="fas fa-spinner"></i>
                </div>
                <div>
                  <p className="text-sm text-blueGray-500">In Progress</p>
                  <h3 className="text-2xl font-bold">{stats.inProgress}</h3>
                </div>
              </div>
            </div>
            
            <div className="px-2 w-1/5">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
                  <i className="fas fa-check"></i>
                </div>
                <div>
                  <p className="text-sm text-blueGray-500">Completed</p>
                  <h3 className="text-2xl font-bold">{stats.completed}</h3>
                </div>
              </div>
            </div>
            
            <div className="px-2 w-1/5">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 text-red-500 mr-4">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <div>
                  <p className="text-sm text-blueGray-500">Overdue</p>
                  <h3 className="text-2xl font-bold">{stats.overdue}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main tabs */}
        <div className="flex border-b border-blueGray-200 mb-6">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'my-reviews' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-blueGray-500 hover:text-blueGray-700'}`}
            onClick={() => setActiveTab('my-reviews')}
          >
            My Reviews
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'available' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-blueGray-500 hover:text-blueGray-700'}`}
            onClick={() => setActiveTab('available')}
          >
            Available Articles
          </button>
        </div>
        
        {activeTab === 'my-reviews' ? (
          <>
            {/* Search bar for my reviews */}
            <div className="mb-6">
              <div className="relative w-full md:w-1/3">
                <input
                  type="text"
                  placeholder="Search my reviews..."
                  className="px-4 py-2 w-full border border-blueGray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blueGray-400"
                  onClick={() => setSearchQuery('')}
                >
                  {searchQuery && <i className="fas fa-times"></i>}
                </button>
              </div>
            </div>
            
            {/* Filter tabs */}
            <div className="flex border-b border-blueGray-200 mb-6">
              <button
                className={`py-2 px-4 font-medium ${activeFilter === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-blueGray-500 hover:text-blueGray-700'}`}
                onClick={() => setActiveFilter('all')}
              >
                All Reviews
              </button>
              <button
                className={`py-2 px-4 font-medium ${activeFilter === ReviewStatus.PENDING ? 'text-blue-600 border-b-2 border-blue-600' : 'text-blueGray-500 hover:text-blueGray-700'}`}
                onClick={() => setActiveFilter(ReviewStatus.PENDING)}
              >
                Pending
              </button>
              <button
                className={`py-2 px-4 font-medium ${activeFilter === ReviewStatus.IN_PROGRESS ? 'text-blue-600 border-b-2 border-blue-600' : 'text-blueGray-500 hover:text-blueGray-700'}`}
                onClick={() => setActiveFilter(ReviewStatus.IN_PROGRESS)}
              >
                In Progress
              </button>
              <button
                className={`py-2 px-4 font-medium ${activeFilter === ReviewStatus.COMPLETED ? 'text-blue-600 border-b-2 border-blue-600' : 'text-blueGray-500 hover:text-blueGray-700'}`}
                onClick={() => setActiveFilter(ReviewStatus.COMPLETED)}
              >
                Completed
              </button>
            </div>
            
            {/* Reviews table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredReviews.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-5xl text-blueGray-300 mb-4">
                    <i className="fas fa-clipboard-list"></i>
                  </div>
                  <h3 className="text-xl font-medium text-blueGray-700 mb-2">No reviews found</h3>
                  <p className="text-blueGray-500">
                    {searchQuery 
                      ? 'Try adjusting your search criteria'
                      : activeFilter !== 'all' 
                        ? `You don't have any ${activeFilter} reviews`
                        : 'You have not been assigned any reviews yet'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-blueGray-200">
                    <thead className="bg-blueGray-50">
                      <tr>
                        <th 
                          scope="col" 
                          className="px-6 py-3 text-left text-xs font-medium text-blueGray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('articleTitle')}
                        >
                          <div className="flex items-center">
                            Article
                            {sortBy === 'articleTitle' && (
                              <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'} ml-1`}></i>
                            )}
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blueGray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th 
                          scope="col" 
                          className="px-6 py-3 text-left text-xs font-medium text-blueGray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('dueDate')}
                        >
                          <div className="flex items-center">
                            Due Date
                            {sortBy === 'dueDate' && (
                              <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'} ml-1`}></i>
                            )}
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-blueGray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-blueGray-200">
                      {filteredReviews.map((review) => (
                        <tr key={review.id} className="hover:bg-blueGray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-blueGray-900">{review.articleTitle}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(review.status)}`}>
                              {review.status === ReviewStatus.PENDING ? 'Pending' : 
                               review.status === ReviewStatus.IN_PROGRESS ? 'In Progress' : 
                               review.status === ReviewStatus.COMPLETED ? 'Completed' : 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${isOverdue(review.dueDate) && review.status !== ReviewStatus.COMPLETED ? 'text-red-600 font-medium' : 'text-blueGray-500'}`}>
                              {new Date(review.dueDate).toLocaleDateString()}
                              {isOverdue(review.dueDate) && review.status !== ReviewStatus.COMPLETED && (
                                <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Overdue</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link 
                              to={`/review/${review.id}`}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              {review.status === ReviewStatus.COMPLETED ? 'View' : 'Review'}
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Available Articles Section */}
            <div className="mb-6 flex flex-wrap items-center">
              <div className="w-full md:w-1/3 mb-4 md:mb-0 md:pr-4">
                <input
                  type="text"
                  placeholder="Search available articles..."
                  className="px-4 py-2 w-full border border-blueGray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="w-full md:w-1/3 mb-4 md:mb-0 md:px-2">
                <select
                  className="px-4 py-2 w-full border border-blueGray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="w-full md:w-1/3 md:pl-4">
                <select
                  className="px-4 py-2 w-full border border-blueGray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value as ReviewTier | 'all')}
                >
                  <option value="all">All Tiers</option>
                  <option value={ReviewTier.STANDARD}>Standard</option>
                  <option value={ReviewTier.PREMIUM}>Premium</option>
                  <option value={ReviewTier.EXPERT}>Expert</option>
                </select>
              </div>
            </div>
            
            {/* Available Articles */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {filteredAvailableArticles.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-5xl text-blueGray-300 mb-4">
                    <i className="fas fa-search"></i>
                  </div>
                  <h3 className="text-xl font-medium text-blueGray-700 mb-2">No articles found</h3>
                  <p className="text-blueGray-500">
                    Try adjusting your search criteria or check back later for new submissions
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                  {filteredAvailableArticles.map(article => (
                    <div key={article.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-4 border-b">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-semibold text-blueGray-800 mb-2">{article.title}</h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTierBadge(article.tier)}`}>
                            {getTierDescription(article.tier)}
                          </span>
                        </div>
                        <div className="text-sm text-blueGray-500 mb-2">
                          <span className="bg-blueGray-100 text-blueGray-700 px-2 py-1 rounded text-xs">
                            {article.category}
                          </span>
                          <span className="ml-2 text-xs">
                            Submitted: {new Date(article.submittedDate).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-blueGray-600 mb-2 line-clamp-2">{article.abstract}</p>
                        <div className="flex items-center text-sm text-blueGray-500">
                          <i className="fas fa-coins text-yellow-500 mr-1"></i>
                          <span>Reward: {article.tokenReward} DJT</span>
                        </div>
                      </div>
                      <div className="bg-blueGray-50 p-3 flex justify-between items-center">
                        <button
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          onClick={() => window.open(`/articles/${article.id}`, '_blank')}
                        >
                          View Details
                        </button>
                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm font-medium transition-colors"
                          onClick={() => handleClaimArticle(article.id)}
                        >
                          Claim for Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
