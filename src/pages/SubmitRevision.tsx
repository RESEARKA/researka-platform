import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getArticleById } from '../services/articleService';
import type { Article } from '../services/articleService';
import { SEO } from '../components/SEO';

export function SubmitRevision() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // State
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [revisionFile, setRevisionFile] = useState<File | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Fetch article data
  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const articleData = await getArticleById(id);
        
        // Verify that the article belongs to the current user
        if (articleData.submittedBy.id !== user?.id) {
          setError('You do not have permission to revise this article');
          navigate('/author-dashboard');
          return;
        }
        
        // Verify that the article is in revision_requested status
        if (articleData.status !== 'revision_requested') {
          setError('This article is not currently eligible for revision');
          navigate('/author-dashboard');
          return;
        }
        
        setArticle(articleData);
      } catch (error) {
        console.error('Error fetching article:', error);
        setError('Failed to load article details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArticle();
  }, [id, user?.id, navigate]);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setRevisionFile(e.target.files[0]);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!revisionFile) {
      setError('Please upload your revised manuscript');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // In a real application, you would send the revision to your backend
      // For demo purposes, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to success page
      navigate('/submit/success', { 
        state: { 
          isRevision: true,
          articleTitle: article?.title 
        } 
      });
    } catch (error) {
      console.error('Error submitting revision:', error);
      setError('Failed to submit revision. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get reviewer comments
  const getReviewerComments = () => {
    if (!article?.reviews || article.reviews.length === 0) {
      return [];
    }
    
    return article.reviews
      .filter(review => review.status === 'completed' && review.comments)
      .map(review => ({
        reviewer: review.reviewerName,
        comments: review.comments || '',
        decision: review.decision || 'revise'
      }));
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-blueGray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error && !article) {
    return (
      <div className="min-h-screen bg-blueGray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p>{error}</p>
          </div>
          <button
            onClick={() => navigate('/author-dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  const reviewerComments = getReviewerComments();
  
  return (
    <div className="min-h-screen bg-blueGray-50">
      <SEO title="Submit Revision | Researka" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-blueGray-700">Submit Revision</h1>
          <p className="text-blueGray-500 mt-2">
            Revise your article based on reviewer feedback
          </p>
        </div>
        
        {/* Article information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-blueGray-700 mb-4">Article Information</h2>
          
          <div className="mb-4">
            <p className="text-sm text-blueGray-500">Title</p>
            <p className="text-lg font-medium">{article?.title}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-blueGray-500">Authors</p>
            <p>{article?.authors.join(', ')}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-blueGray-500">Abstract</p>
            <p className="text-sm">{article?.abstract}</p>
          </div>
          
          <div>
            <p className="text-sm text-blueGray-500">Keywords</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {article?.keywords.map((keyword, index) => (
                <span 
                  key={index}
                  className="bg-blueGray-100 text-blueGray-600 px-2 py-1 rounded-md text-xs"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Reviewer comments */}
        {reviewerComments.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-blueGray-700 mb-4">Reviewer Comments</h2>
            
            <div className="space-y-6">
              {reviewerComments.map((comment, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-1">
                  <p className="font-medium text-blueGray-700">{comment.reviewer}</p>
                  <p className="text-sm text-blueGray-600 mb-2">
                    Decision: <span className="font-medium text-orange-600">Revision Requested</span>
                  </p>
                  <p className="text-sm whitespace-pre-line">{comment.comments}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Revision form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-blueGray-700 mb-4">Submit Your Revision</h2>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
              <p>{error}</p>
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-blueGray-700 font-medium mb-2" htmlFor="revisionFile">
              Upload Revised Manuscript (PDF)
            </label>
            <input
              type="file"
              id="revisionFile"
              accept=".pdf"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-blueGray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-blueGray-500 mt-1">
              Please upload your revised manuscript in PDF format
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-blueGray-700 font-medium mb-2" htmlFor="revisionNotes">
              Revision Notes
            </label>
            <textarea
              id="revisionNotes"
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="Describe the changes you've made in response to reviewer comments..."
              className="w-full px-3 py-2 border border-blueGray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px]"
              required
            ></textarea>
          </div>
          
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => navigate('/author-dashboard')}
              className="mr-4 text-blueGray-600 hover:text-blueGray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block animate-spin mr-2">⟳</span>
                  Submitting...
                </>
              ) : (
                'Submit Revision'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
