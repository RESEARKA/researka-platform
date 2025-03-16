import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  ArticleSubmission, 
  getAllSubmissions, 
  updateSubmissionStatus 
} from '../../services/mockAdminService';

export function ContentModeration() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [submissions, setSubmissions] = useState<ArticleSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ArticleSubmission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filter state
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchSubmissions = async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const allSubmissions = getAllSubmissions();
      setSubmissions(allSubmissions);
      setIsLoading(false);
    };
    
    fetchSubmissions();
  }, []);
  
  useEffect(() => {
    // Update URL when filter changes
    if (filter !== 'all') {
      searchParams.set('filter', filter);
    } else {
      searchParams.delete('filter');
    }
    setSearchParams(searchParams);
  }, [filter, searchParams, setSearchParams]);
  
  const filteredSubmissions = submissions
    .filter(sub => {
      if (filter === 'all') return true;
      return sub.status === filter;
    })
    .filter(sub => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        sub.title.toLowerCase().includes(searchLower) ||
        sub.authors.join(' ').toLowerCase().includes(searchLower) ||
        sub.id.toLowerCase().includes(searchLower)
      );
    });
  
  const handleStatusChange = (submissionId: string, newStatus: ArticleSubmission['status']) => {
    const updatedSubmission = updateSubmissionStatus(submissionId, newStatus);
    
    if (updatedSubmission) {
      setSubmissions(prevSubmissions => 
        prevSubmissions.map(sub => 
          sub.id === submissionId ? { ...sub, status: newStatus } : sub
        )
      );
      
      // If the submission is currently selected, update it
      if (selectedSubmission && selectedSubmission.id === submissionId) {
        setSelectedSubmission({ ...selectedSubmission, status: newStatus });
      }
    }
  };
  
  const openSubmissionModal = (submission: ArticleSubmission) => {
    setSelectedSubmission(submission);
    setIsModalOpen(true);
  };
  
  const closeSubmissionModal = () => {
    setIsModalOpen(false);
    setSelectedSubmission(null);
  };
  
  const getStatusBadge = (status: ArticleSubmission['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'approved':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Rejected</span>;
      case 'revisions_requested':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Revisions Requested</span>;
      default:
        return null;
    }
  };
  
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-12 bg-gray-200 rounded mb-6"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Content Moderation</h2>
        <Link
          to="/admin/content/guidelines"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Moderation Guidelines
        </Link>
      </div>
      
      {/* Filters */}
      <div className="bg-white border rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                filter === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                filter === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                filter === 'rejected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Rejected
            </button>
            <button
              onClick={() => setFilter('revisions_requested')}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                filter === 'revisions_requested'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Revisions Requested
            </button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search submissions..."
              className="pl-10 pr-4 py-2 border rounded-md w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Submissions Table */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reviews
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No submissions found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map(submission => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                           onClick={() => openSubmissionModal(submission)}>
                        {submission.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{submission.authors.join(', ')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{submission.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{submission.submittedDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(submission.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {submission.reviewAssignments.length} 
                        <span className="text-gray-500 ml-1">
                          ({submission.reviewAssignments.filter(r => r.status === 'completed').length} completed)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openSubmissionModal(submission)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleStatusChange(submission.id, 'approved')}
                        className="text-green-600 hover:text-green-900 mr-3"
                        disabled={submission.status === 'approved'}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(submission.id, 'rejected')}
                        className="text-red-600 hover:text-red-900"
                        disabled={submission.status === 'rejected'}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Submission Detail Modal */}
      {isModalOpen && selectedSubmission && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Submission Details</h3>
              <button
                onClick={closeSubmissionModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedSubmission.title}</h2>
                    <p className="text-sm text-gray-600">By {selectedSubmission.authors.join(', ')} • {selectedSubmission.submittedDate}</p>
                  </div>
                  {getStatusBadge(selectedSubmission.status)}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Category</h4>
                  <p className="text-sm text-gray-900">{selectedSubmission.category}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">DOI</h4>
                  <p className="text-sm text-gray-900">{selectedSubmission.doi || 'Not assigned'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Published Date</h4>
                  <p className="text-sm text-gray-900">{selectedSubmission.publishedDate || 'Not published'}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Abstract</h4>
                <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-800">
                  {selectedSubmission.abstract}
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSubmission.keywords.map((keyword, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Content Preview</h4>
                <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-800 max-h-48 overflow-y-auto">
                  {selectedSubmission.abstract}
                </div>
                <div className="mt-2 text-right">
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    Download Full PDF
                  </button>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Review Assignments</h4>
                {selectedSubmission.reviewAssignments.length === 0 ? (
                  <div className="bg-yellow-50 p-4 rounded-md text-sm text-yellow-800">
                    No reviewers have been assigned to this submission yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedSubmission.reviewAssignments.map(review => (
                      <div key={review.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{review.reviewerName}</p>
                            <p className="text-xs text-gray-500">Assigned: {review.assignedDate}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            review.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : review.status === 'declined'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                          </span>
                        </div>
                        
                        {review.status === 'completed' && (
                          <>
                            <div className="flex items-center mb-2">
                              <p className="text-sm font-medium text-gray-700 mr-2">Decision:</p>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                review.decision === 'accept' 
                                  ? 'bg-green-100 text-green-800' 
                                  : review.decision === 'reject'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                              }`}>
                                {review.decision && review.decision.charAt(0).toUpperCase() + review.decision.slice(1)}
                              </span>
                            </div>
                            
                            <div className="mb-2">
                              <p className="text-sm font-medium text-gray-700 mb-1">Rating:</p>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <svg 
                                    key={i}
                                    className={`h-4 w-4 ${i < (review.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill="currentColor" 
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">Comments:</p>
                              <p className="text-sm text-gray-600">{review.comments}</p>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-4">
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    + Assign New Reviewer
                  </button>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
              <div>
                <button
                  onClick={closeSubmissionModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    handleStatusChange(selectedSubmission.id, 'revisions_requested');
                    closeSubmissionModal();
                  }}
                  className="px-4 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-50"
                >
                  Request Revisions
                </button>
                <button
                  onClick={() => {
                    handleStatusChange(selectedSubmission.id, 'rejected');
                    closeSubmissionModal();
                  }}
                  className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50"
                  disabled={selectedSubmission.status === 'rejected'}
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    handleStatusChange(selectedSubmission.id, 'approved');
                    closeSubmissionModal();
                  }}
                  className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700"
                  disabled={selectedSubmission.status === 'approved'}
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
