import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserSubmissions } from '../services/articleService';
import type { Article } from '../services/articleService';
import { SEO } from '../components/SEO';
import { ShareButtons } from '../components/ShareButtons';

// Submission status types
type SubmissionStatus = 'pending' | 'in_review' | 'revision_requested' | 'accepted' | 'rejected';

export function AuthorDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // State
  const [submissions, setSubmissions] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<SubmissionStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'submittedDate' | 'title'>('submittedDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // Default newest first
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Fetch submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const userSubmissions = await getUserSubmissions(user.id);
        setSubmissions(userSubmissions);
      } catch (error) {
        console.error('Error fetching submissions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubmissions();
  }, [user]);
  
  // Calculate stats
  const stats = useMemo(() => {
    const pending = submissions.filter(submission => submission.status === 'pending').length;
    const inReview = submissions.filter(submission => submission.status === 'in_review').length;
    const revisionRequested = submissions.filter(submission => submission.status === 'revision_requested').length;
    const accepted = submissions.filter(submission => submission.status === 'accepted').length;
    const rejected = submissions.filter(submission => submission.status === 'rejected').length;
    
    return {
      pending,
      inReview,
      revisionRequested,
      accepted,
      rejected,
      total: submissions.length
    };
  }, [submissions]);
  
  // Filter and sort submissions
  const filteredSubmissions = useMemo(() => {
    // First filter by status
    let filtered = submissions;
    if (activeFilter !== 'all') {
      filtered = submissions.filter(submission => submission.status === activeFilter);
    }
    
    // Then filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(submission => 
        submission.title.toLowerCase().includes(query) ||
        submission.abstract.toLowerCase().includes(query)
      );
    }
    
    // Sort the filtered submissions
    return [...filtered].sort((a, b) => {
      if (sortBy === 'submittedDate') {
        const dateA = new Date(a.submittedDate).getTime();
        const dateB = new Date(b.submittedDate).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        return sortOrder === 'asc' 
          ? titleA.localeCompare(titleB) 
          : titleB.localeCompare(titleA);
      }
    });
  }, [submissions, activeFilter, searchQuery, sortBy, sortOrder]);
  
  // Toggle sort order
  const handleSort = (field: 'submittedDate' | 'title') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };
  
  // Get status badge color
  const getStatusBadge = (status?: SubmissionStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_review':
        return 'bg-blue-100 text-blue-800';
      case 'revision_requested':
        return 'bg-orange-100 text-orange-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Format status for display
  const formatStatus = (status?: SubmissionStatus) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in_review':
        return 'In Review';
      case 'revision_requested':
        return 'Revision Requested';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };
  
  // Calculate days since submission
  const getDaysSinceSubmission = (dateString: string) => {
    const submittedDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - submittedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // Get review progress percentage
  const getReviewProgress = (submission: Article) => {
    if (submission.status === 'pending') return 0;
    if (submission.status === 'in_review') {
      // Calculate based on reviews completed vs total required
      const completedReviews = submission.reviews?.filter((r: any) => r.status === 'completed').length || 0;
      const totalReviews = submission.reviews?.length || 3; // Default to 3 if not specified
      return Math.round((completedReviews / totalReviews) * 100);
    }
    if (submission.status === 'revision_requested') return 75;
    if (submission.status === 'accepted' || submission.status === 'rejected') return 100;
    return 0;
  };
  
  return (
    <div className="min-h-screen bg-blueGray-50">
      <SEO title="Author Dashboard | Researka" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-blueGray-700">Author Dashboard</h1>
          
          <Link
            to="/submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            New Submission
          </Link>
        </div>
        
        {/* Stats cards - horizontal layout */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex flex-wrap -mx-2">
            <div className="px-2 w-1/6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
                  <i className="fas fa-file-alt"></i>
                </div>
                <div>
                  <p className="text-sm text-blueGray-500">Total</p>
                  <h3 className="text-2xl font-bold">{stats.total}</h3>
                </div>
              </div>
            </div>
            
            <div className="px-2 w-1/6">
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
            
            <div className="px-2 w-1/6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
                  <i className="fas fa-search"></i>
                </div>
                <div>
                  <p className="text-sm text-blueGray-500">In Review</p>
                  <h3 className="text-2xl font-bold">{stats.inReview}</h3>
                </div>
              </div>
            </div>
            
            <div className="px-2 w-1/6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-100 text-orange-500 mr-4">
                  <i className="fas fa-edit"></i>
                </div>
                <div>
                  <p className="text-sm text-blueGray-500">Revisions</p>
                  <h3 className="text-2xl font-bold">{stats.revisionRequested}</h3>
                </div>
              </div>
            </div>
            
            <div className="px-2 w-1/6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
                  <i className="fas fa-check"></i>
                </div>
                <div>
                  <p className="text-sm text-blueGray-500">Accepted</p>
                  <h3 className="text-2xl font-bold">{stats.accepted}</h3>
                </div>
              </div>
            </div>
            
            <div className="px-2 w-1/6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 text-red-500 mr-4">
                  <i className="fas fa-times"></i>
                </div>
                <div>
                  <p className="text-sm text-blueGray-500">Rejected</p>
                  <h3 className="text-2xl font-bold">{stats.rejected}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Search and filter */}
        <div className="mb-6 flex flex-wrap items-center">
          <div className="w-full md:w-1/3 mb-4 md:mb-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search submissions..."
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
        </div>
        
        {/* Filter tabs */}
        <div className="flex border-b border-blueGray-200 mb-6 overflow-x-auto">
          <button
            className={`py-2 px-4 font-medium whitespace-nowrap ${activeFilter === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-blueGray-500 hover:text-blueGray-700'}`}
            onClick={() => setActiveFilter('all')}
          >
            All Submissions
          </button>
          <button
            className={`py-2 px-4 font-medium whitespace-nowrap ${activeFilter === 'pending' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-blueGray-500 hover:text-blueGray-700'}`}
            onClick={() => setActiveFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`py-2 px-4 font-medium whitespace-nowrap ${activeFilter === 'in_review' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-blueGray-500 hover:text-blueGray-700'}`}
            onClick={() => setActiveFilter('in_review')}
          >
            In Review
          </button>
          <button
            className={`py-2 px-4 font-medium whitespace-nowrap ${activeFilter === 'revision_requested' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-blueGray-500 hover:text-blueGray-700'}`}
            onClick={() => setActiveFilter('revision_requested')}
          >
            Revision Requested
          </button>
          <button
            className={`py-2 px-4 font-medium whitespace-nowrap ${activeFilter === 'accepted' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-blueGray-500 hover:text-blueGray-700'}`}
            onClick={() => setActiveFilter('accepted')}
          >
            Accepted
          </button>
          <button
            className={`py-2 px-4 font-medium whitespace-nowrap ${activeFilter === 'rejected' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-blueGray-500 hover:text-blueGray-700'}`}
            onClick={() => setActiveFilter('rejected')}
          >
            Rejected
          </button>
        </div>
        
        {/* Submissions */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-5xl text-blueGray-300 mb-4">
                <i className="fas fa-file-alt"></i>
              </div>
              <h3 className="text-xl font-medium text-blueGray-700 mb-2">No submissions found</h3>
              <p className="text-blueGray-500 mb-6">
                {searchQuery 
                  ? 'Try adjusting your search criteria'
                  : activeFilter !== 'all' 
                    ? `You don't have any ${formatStatus(activeFilter).toLowerCase()} submissions`
                    : 'You have not submitted any articles yet'}
              </p>
              
              {stats.total === 0 && (
                <Link
                  to="/submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Submit Your First Article
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blueGray-200">
                <thead className="bg-blueGray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-blueGray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center">
                        Title
                        {sortBy === 'title' && (
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
                      onClick={() => handleSort('submittedDate')}
                    >
                      <div className="flex items-center">
                        Submitted
                        {sortBy === 'submittedDate' && (
                          <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'} ml-1`}></i>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blueGray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-blueGray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-blueGray-200">
                  {filteredSubmissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-blueGray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-blueGray-900">{submission.title}</div>
                        <div className="text-xs text-blueGray-500 mt-1 line-clamp-1">{submission.abstract}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(submission.status as SubmissionStatus)}`}>
                          {formatStatus(submission.status as SubmissionStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-blueGray-500">
                          {new Date(submission.submittedDate).toLocaleDateString()}
                          <span className="text-xs text-blueGray-400 block">
                            {getDaysSinceSubmission(submission.submittedDate)} days ago
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-blueGray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${
                              submission.status === 'rejected' ? 'bg-red-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${getReviewProgress(submission)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-blueGray-500 mt-1 block">
                          {getReviewProgress(submission)}% Complete
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          to={`/articles/${submission.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          View
                        </Link>
                        
                        {submission.status === 'accepted' && (
                          <div className="inline-block ml-2">
                            <ShareButtons 
                              url={`${window.location.origin}/articles/${submission.id}`}
                              title={submission.title}
                              summary={submission.abstract?.substring(0, 100) + '...'}
                            />
                          </div>
                        )}
                        
                        {submission.status === 'revision_requested' && (
                          <Link 
                            to={`/submit/revision/${submission.id}`}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            Submit Revision
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
