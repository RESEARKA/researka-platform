import { useState } from 'react';
import { FlagReason } from '../services/articleTypes';
import { createFlag } from '../services/mockAdminService';

interface FlagButtonProps {
  articleId: string;
  userId: string;
  className?: string;
}

const reasonLabels: Record<FlagReason, string> = {
  inappropriate_content: 'Inappropriate Content',
  copyright_violation: 'Copyright Violation',
  plagiarism: 'Plagiarism',
  misinformation: 'Misinformation',
  spam: 'Spam',
  other: 'Other'
};

export function FlagButton({ articleId, userId, className = '' }: FlagButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState<FlagReason>('inappropriate_content');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      await createFlag(articleId, reason, description, userId);
      setSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(false);
        setReason('inappropriate_content');
        setDescription('');
      }, 3000);
    } catch (err) {
      setError('Failed to submit flag. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={className}>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center text-red-600 hover:text-red-800"
        aria-label="Flag content"
        title="Flag inappropriate content"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="#dc2626"
          className="w-5 h-5"
        >
          <path
            fillRule="evenodd"
            d="M3 2.25a.75.75 0 01.75.75v.54l1.838-.46a9.75 9.75 0 016.725.738l.108.054a8.25 8.25 0 005.58.652l3.109-.732a.75.75 0 01.917.81 47.784 47.784 0 00.005 10.337.75.75 0 01-.574.812l-3.114.733a9.75 9.75 0 01-6.594-.77l-.108-.054a8.25 8.25 0 00-5.69-.625l-2.202.55V21a.75.75 0 01-1.5 0V3A.75.75 0 013 2.25z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h2 className="text-xl font-semibold mb-4">Flag Content</h2>
            
            {success ? (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                Content has been flagged for review. Thank you for helping maintain quality content.
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Reason for flagging
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value as FlagReason)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {Object.entries(reasonLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    placeholder="Please provide details about why you're flagging this content..."
                    required
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Flag'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
