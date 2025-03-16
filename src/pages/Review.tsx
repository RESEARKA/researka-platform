import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getArticleById, Article, ArticleReview } from '../services/articleService';
import { SEO } from '../components/SEO';

// Review decision type
type ReviewDecision = 'accept' | 'reject' | 'revise';

// Mock review data - in a real app, this would come from an API
const mockReview: ArticleReview = {
  id: 'rev123',
  articleId: 'art456',
  articleTitle: 'Blockchain Applications in Academic Publishing',
  reviewerId: '123456789',
  reviewerName: 'Dr. Jane Smith',
  completed: false,
  dueDate: '2025-04-15',
  comments: '',
  rating: 0,
  decision: undefined
};

export function Review() {
  const { reviewId } = useParams<{ reviewId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // State
  const [review, setReview] = useState<ArticleReview | null>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'article' | 'review'>('article');
  const [reviewForm, setReviewForm] = useState({
    comments: '',
    rating: 0,
    decision: '' as ReviewDecision | '',
    confidentialComments: ''
  });
  const [isDraft, setIsDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Fetch review and article data
  useEffect(() => {
    const fetchData = async () => {
      if (!reviewId) return;
      
      setIsLoading(true);
      try {
        // In a real app, we would fetch the review from an API
        // For now, we'll use mock data
        setReview(mockReview);
        
        // Fetch the article being reviewed
        const articleData = await getArticleById(mockReview.articleId);
        setArticle(articleData);
        
        // Load draft if exists
        loadDraft();
      } catch (error) {
        console.error('Error fetching review data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [reviewId]);
  
  // Save draft to local storage
  const saveDraft = () => {
    if (!reviewId) return;
    
    localStorage.setItem(`review_draft_${reviewId}`, JSON.stringify(reviewForm));
    setIsDraft(true);
    setLastSaved(new Date());
  };
  
  // Load draft from local storage
  const loadDraft = () => {
    if (!reviewId) return;
    
    const savedDraft = localStorage.getItem(`review_draft_${reviewId}`);
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setReviewForm(parsedDraft);
        setIsDraft(true);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  };
  
  // Clear draft from local storage
  const clearDraft = () => {
    if (!reviewId) return;
    
    localStorage.removeItem(`review_draft_${reviewId}`);
    setIsDraft(false);
    setLastSaved(null);
  };
  
  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle rating change
  const handleRatingChange = (rating: number) => {
    setReviewForm(prev => ({ ...prev, rating }));
    
    // Clear error for rating
    if (errors.rating) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.rating;
        return newErrors;
      });
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!reviewForm.comments.trim()) {
      newErrors.comments = 'Comments are required';
    }
    
    if (reviewForm.rating === 0) {
      newErrors.rating = 'Please provide a rating';
    }
    
    if (!reviewForm.decision) {
      newErrors.decision = 'Please select a decision';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent, asDraft: boolean = false) => {
    e.preventDefault();
    
    if (asDraft) {
      saveDraft();
      return;
    }
    
    // Validate form
    const isValid = validateForm();
    if (!isValid) return;
    
    setIsSubmitting(true);
    
    try {
      // In a real app, we would submit the review to an API
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Clear draft after successful submission
      clearDraft();
      
      // Redirect to success page
      navigate('/review/success');
    } catch (error) {
      console.error('Error submitting review:', error);
      setErrors({ submit: 'Failed to submit review. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Calculate days remaining
  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    
    // Reset time to compare just dates
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  // Render days remaining
  const renderDaysRemaining = (dueDate: string) => {
    const daysRemaining = getDaysRemaining(dueDate);
    
    if (daysRemaining < 0) {
      return (
        <span className="text-red-500 font-bold">
          {Math.abs(daysRemaining)} {Math.abs(daysRemaining) === 1 ? 'day' : 'days'} overdue
        </span>
      );
    }
    
    if (daysRemaining === 0) {
      return <span className="text-orange-500 font-bold">Due today</span>;
    }
    
    if (daysRemaining <= 3) {
      return (
        <span className="text-orange-500">
          {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
        </span>
      );
    }
    
    return (
      <span className="text-blueGray-500">
        {daysRemaining} days remaining
      </span>
    );
  };
  
  // Render star rating
  const renderStarRating = (
    currentRating: number,
    onChange?: (rating: number) => void
  ) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange && onChange(star)}
            className={`text-2xl ${
              star <= currentRating
                ? 'text-yellow-500'
                : 'text-blueGray-300'
            } focus:outline-none ${onChange ? 'cursor-pointer' : 'cursor-default'}`}
            disabled={!onChange}
          >
            ★
          </button>
        ))}
        
        {currentRating > 0 && (
          <span className="ml-2 text-sm text-blueGray-500">
            {currentRating}/5
          </span>
        )}
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <section className="relative py-16 bg-blueGray-50">
        <div className="container mx-auto px-4">
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg">
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lightBlue-500 mx-auto mb-4"></div>
              <p className="text-blueGray-500">Loading review data...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  if (!review || !article) {
    return (
      <section className="relative py-16 bg-blueGray-50">
        <div className="container mx-auto px-4">
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg">
            <div className="p-6 text-center">
              <div className="bg-red-100 p-4 rounded-full inline-block mb-4">
                <i className="fas fa-exclamation-circle text-4xl text-red-500"></i>
              </div>
              <h3 className="text-xl font-semibold text-blueGray-700 mb-2">Review Not Found</h3>
              <p className="text-blueGray-500 mb-4">
                The review you're looking for could not be found or you don't have permission to access it.
              </p>
              <Link
                to="/review-dashboard"
                className="bg-lightBlue-500 text-white active:bg-lightBlue-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <>
      <SEO 
        title={`Review: ${article.title} - Researka`}
        description="Peer review assignment for Researka."
        canonical={`/review/${reviewId}`}
      />
      <section className="relative py-16 bg-blueGray-50">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg">
            <div className="px-6 py-6">
              <div className="flex flex-wrap justify-between items-center">
                <div>
                  <h3 className="text-2xl font-semibold text-blueGray-700">
                    Peer Review Assignment
                  </h3>
                  <p className="text-lg text-blueGray-500 mt-1">
                    {article.title}
                  </p>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="flex items-center mb-1">
                    <i className="fas fa-calendar-alt text-blueGray-400 mr-2"></i>
                    <span className="text-sm text-blueGray-500">
                      Due: {formatDate(review.dueDate)}
                    </span>
                  </div>
                  
                  {!review.completed && (
                    <div className="text-sm">
                      {renderDaysRemaining(review.dueDate)}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Tabs */}
              <div className="mt-6 border-b border-blueGray-200">
                <div className="flex flex-wrap -mb-px">
                  <button
                    className={`mr-8 py-4 text-sm font-medium border-b-2 focus:outline-none ${
                      activeTab === 'article'
                        ? 'text-lightBlue-500 border-lightBlue-500'
                        : 'text-blueGray-500 border-transparent hover:text-blueGray-700 hover:border-blueGray-300'
                    }`}
                    onClick={() => setActiveTab('article')}
                  >
                    Article Details
                  </button>
                  
                  <button
                    className={`mr-8 py-4 text-sm font-medium border-b-2 focus:outline-none ${
                      activeTab === 'review'
                        ? 'text-lightBlue-500 border-lightBlue-500'
                        : 'text-blueGray-500 border-transparent hover:text-blueGray-700 hover:border-blueGray-300'
                    }`}
                    onClick={() => setActiveTab('review')}
                  >
                    Review Form
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg">
            <div className="px-6 py-6">
              {activeTab === 'article' ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-blueGray-700 mb-2">
                      Abstract
                    </h4>
                    <p className="text-blueGray-500">
                      {article.abstract}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-blueGray-700 mb-2">
                        Authors
                      </h4>
                      <ul className="list-disc list-inside text-blueGray-500">
                        {article.authors.map((author, index) => (
                          <li key={`author-${index}`}>{author}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-blueGray-700 mb-2">
                        Keywords
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {article.keywords.map((keyword, index) => (
                          <span
                            key={`keyword-${index}`}
                            className="text-xs bg-blueGray-100 text-blueGray-700 px-2 py-1 rounded-full"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-blueGray-700 mb-2">
                      Article File
                    </h4>
                    {article.fileUrl ? (
                      <a
                        href={article.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center bg-lightBlue-50 text-lightBlue-500 px-4 py-2 rounded-lg hover:bg-lightBlue-100"
                      >
                        <i className="fas fa-file-pdf mr-2"></i>
                        Download Article PDF
                      </a>
                    ) : (
                      <p className="text-blueGray-500">
                        No file available for this article.
                      </p>
                    )}
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-bold text-yellow-800 flex items-center mb-2">
                      <i className="fas fa-exclamation-circle mr-2"></i>
                      Reviewer Guidelines
                    </h4>
                    <p className="text-sm text-yellow-700">
                      Please review this article based on the following criteria:
                    </p>
                    <ul className="list-disc list-inside text-sm text-yellow-700 mt-2">
                      <li>Originality and significance of the research</li>
                      <li>Soundness of methodology and analysis</li>
                      <li>Clarity of presentation and organization</li>
                      <li>Relevance of conclusions and discussion</li>
                      <li>Appropriateness of references and citations</li>
                    </ul>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActiveTab('review')}
                      className="bg-lightBlue-500 text-white active:bg-lightBlue-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    >
                      Go to Review Form <i className="fas fa-arrow-right ml-2"></i>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Draft save status */}
                  {isDraft && (
                    <div className="mb-6 bg-green-50 p-3 rounded-lg flex items-center">
                      <i className="fas fa-save text-green-500 mr-2"></i>
                      <span className="text-sm text-green-700">
                        Draft saved {lastSaved && `(Last saved: ${lastSaved.toLocaleTimeString()})`}
                      </span>
                    </div>
                  )}
                  
                  <form onSubmit={(e) => handleSubmit(e, false)}>
                    <div className="space-y-6">
                      <div>
                        <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="rating">
                          Rating *
                        </label>
                        <div className="mb-1">
                          {renderStarRating(reviewForm.rating, handleRatingChange)}
                        </div>
                        {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
                      </div>
                      
                      <div>
                        <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="decision">
                          Decision *
                        </label>
                        <select
                          id="decision"
                          name="decision"
                          value={reviewForm.decision}
                          onChange={handleChange}
                          className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${errors.decision ? 'border-red-500' : ''}`}
                        >
                          <option value="">Select a decision</option>
                          <option value="accept">Accept (Publish as is)</option>
                          <option value="revise">Revise (Minor or major revisions needed)</option>
                          <option value="reject">Reject (Not suitable for publication)</option>
                        </select>
                        {errors.decision && <p className="text-red-500 text-xs mt-1">{errors.decision}</p>}
                      </div>
                      
                      <div>
                        <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="comments">
                          Comments for Authors *
                        </label>
                        <textarea
                          id="comments"
                          name="comments"
                          value={reviewForm.comments}
                          onChange={handleChange}
                          rows={8}
                          className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${errors.comments ? 'border-red-500' : ''}`}
                          placeholder="Provide detailed feedback for the authors..."
                        />
                        {errors.comments && <p className="text-red-500 text-xs mt-1">{errors.comments}</p>}
                      </div>
                      
                      <div>
                        <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="confidentialComments">
                          Confidential Comments for Editors (Optional)
                        </label>
                        <textarea
                          id="confidentialComments"
                          name="confidentialComments"
                          value={reviewForm.confidentialComments}
                          onChange={handleChange}
                          rows={4}
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          placeholder="These comments will only be visible to editors, not authors..."
                        />
                      </div>
                      
                      {errors.submit && (
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                          <p className="text-red-600">{errors.submit}</p>
                        </div>
                      )}
                      
                      <div className="flex justify-between mt-8">
                        <button
                          type="button"
                          onClick={() => setActiveTab('article')}
                          className="bg-blueGray-500 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                        >
                          <i className="fas fa-arrow-left mr-2"></i> Back to Article
                        </button>
                        
                        <div className="flex space-x-4">
                          <button
                            type="button"
                            onClick={(e) => handleSubmit(e, true)}
                            className="bg-blueGray-700 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                          >
                            <i className="fas fa-save mr-2"></i> Save Draft
                          </button>
                          
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-emerald-500 text-white active:bg-emerald-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                          >
                            {isSubmitting ? (
                              <>
                                <i className="fas fa-spinner fa-spin mr-2"></i> Submitting...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-paper-plane mr-2"></i> Submit Review
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
