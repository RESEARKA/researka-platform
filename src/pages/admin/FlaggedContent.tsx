import { useState, useEffect } from 'react';
import { 
  getFlags, 
  getPendingFlags, 
  updateFlagStatus, 
  getSubmissionById,
  getUserById
} from '../../services/mockAdminService';
import { Flag, FlagReason } from '../../services/articleTypes';
import { Link } from 'react-router-dom';

const reasonLabels: Record<FlagReason, string> = {
  inappropriate_content: 'Inappropriate Content',
  copyright_violation: 'Copyright Violation',
  plagiarism: 'Plagiarism',
  misinformation: 'Misinformation',
  spam: 'Spam',
  other: 'Other'
};

export function FlaggedContent() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending'>('pending');
  const [selectedFlag, setSelectedFlag] = useState<Flag | null>(null);
  const [resolution, setResolution] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    const fetchFlags = async () => {
      setIsLoading(true);
      try {
        const data = filter === 'all' ? getFlags() : getPendingFlags();
        setFlags(data);
      } catch (error) {
        console.error('Error fetching flags:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFlags();
  }, [filter]);
  
  const handleReviewFlag = (flag: Flag) => {
    setSelectedFlag(flag);
    setResolution('');
    setIsModalOpen(true);
  };
  
  const handleUpdateStatus = async (status: Flag['status']) => {
    if (!selectedFlag) return;
    
    try {
      // In a real app, you would get the current user ID from auth context
      const reviewerId = 'u10'; // Mock admin user ID
      const updatedFlag = updateFlagStatus(selectedFlag.id, status, reviewerId, resolution);
      
      if (updatedFlag) {
        setFlags(flags.map(f => f.id === updatedFlag.id ? updatedFlag : f));
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error updating flag status:', error);
    }
  };
  
  const getStatusBadge = (status: Flag['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'reviewed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Reviewed</span>;
      case 'resolved':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Resolved</span>;
      case 'dismissed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Dismissed</span>;
      default:
        return null;
    }
  };
  
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-64 bg-gray-200 rounded mb-6"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Flagged Content</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Filter:</span>
          <select
            className="border rounded-md text-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filter}
            onChange={e => setFilter(e.target.value as 'all' | 'pending')}
          >
            <option value="pending">Pending</option>
            <option value="all">All Flags</option>
          </select>
        </div>
      </div>
      
      {flags.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-600">No flagged content found.</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reported By
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {flags.map((flag) => {
                const article = getSubmissionById(flag.articleId);
                const reporter = getUserById(flag.createdBy);
                
                return (
                  <tr key={flag.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {article ? (
                          <Link to={`/article/${article.id}`} className="hover:text-blue-600">
                            {article.title}
                          </Link>
                        ) : (
                          <span>Unknown Article</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {article ? `by ${article.authors.join(', ')}` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {reasonLabels[flag.reason]}
                      </div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {flag.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {reporter ? reporter.name : 'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {reporter ? reporter.email : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(flag.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(flag.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {flag.status === 'pending' && (
                        <button
                          onClick={() => handleReviewFlag(flag)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Review
                        </button>
                      )}
                      {flag.status !== 'pending' && (
                        <button
                          onClick={() => handleReviewFlag(flag)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Review Modal */}
      {isModalOpen && selectedFlag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Review Flagged Content
            </h3>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700">Flag Information</h4>
              <div className="mt-2 bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Reason</p>
                    <p className="text-sm">{reasonLabels[selectedFlag.reason]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Reported On</p>
                    <p className="text-sm">{new Date(selectedFlag.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Description</p>
                    <p className="text-sm">{selectedFlag.description}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700">Article Information</h4>
              <div className="mt-2 bg-gray-50 p-4 rounded-md">
                {(() => {
                  const article = getSubmissionById(selectedFlag.articleId);
                  if (!article) return <p className="text-sm">Article information not available</p>;
                  
                  return (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Title</p>
                        <p className="text-sm font-medium">{article.title}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Authors</p>
                        <p className="text-sm">{article.authors.join(', ')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">DOI</p>
                        <p className="text-sm">{article.doi || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Published</p>
                        <p className="text-sm">{new Date(article.publishedDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <p className="text-sm">{article.status}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700">Reporter Information</h4>
              <div className="mt-2 bg-gray-50 p-4 rounded-md">
                {(() => {
                  const reporter = getUserById(selectedFlag.createdBy);
                  if (!reporter) return <p className="text-sm">Reporter information not available</p>;
                  
                  return (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="text-sm">{reporter.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm">{reporter.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Role</p>
                        <p className="text-sm capitalize">{reporter.role}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <p className="text-sm capitalize">{reporter.status}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
            
            {selectedFlag.status === 'pending' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resolution Notes
                </label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Add notes about how this flag was resolved..."
                />
              </div>
            )}
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
              
              {selectedFlag.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus('dismissed')}
                    className="px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('reviewed')}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Mark as Reviewed
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('resolved')}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Resolve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
