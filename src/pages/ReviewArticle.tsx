import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Article, getArticleById } from '../services/mockArticles';

interface ReviewCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
  score: number;
}

interface ReviewData {
  articleId: string;
  reviewerId: string;
  comments: string;
  confidentialComments: string;
  criteria: ReviewCriteria[];
  decision: 'accept' | 'reject' | 'revise' | '';
  completed: boolean;
}

export function ReviewArticle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [reviewData, setReviewData] = useState<ReviewData>({
    articleId: id || '',
    reviewerId: '',
    comments: '',
    confidentialComments: '',
    criteria: [
      { 
        id: 'originality', 
        name: 'Originality', 
        description: 'Evaluates the novelty and innovation of the research',
        weight: 0.25,
        score: 0
      },
      { 
        id: 'methodology', 
        name: 'Methodology', 
        description: 'Assesses the appropriateness and rigor of the research methods',
        weight: 0.25,
        score: 0
      },
      { 
        id: 'clarity', 
        name: 'Clarity and Presentation', 
        description: 'Evaluates how well the paper is written and structured',
        weight: 0.2,
        score: 0
      },
      { 
        id: 'significance', 
        name: 'Significance', 
        description: 'Assesses the importance and potential impact of the research',
        weight: 0.3,
        score: 0
      }
    ],
    decision: '',
    completed: false
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPdfVisible, setIsPdfVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchArticle = async () => {
      setIsLoading(true);
      try {
        if (!id) {
          throw new Error('Article ID is missing');
        }
        
        const foundArticle = getArticleById(id);
        
        if (!foundArticle) {
          throw new Error('Article not found');
        }
        
        setArticle(foundArticle);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching article:', err);
        setError(err.message || 'Failed to load article for review. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    } else {
      setError('Review ID is missing');
      setIsLoading(false);
    }
  }, [id]);
  
  const handleCriteriaChange = (criteriaId: string, score: number) => {
    setReviewData(prev => ({
      ...prev,
      criteria: prev.criteria.map(c => 
        c.id === criteriaId ? { ...c, score } : c
      )
    }));
  };
  
  const handleCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReviewData(prev => ({
      ...prev,
      comments: e.target.value
    }));
  };
  
  const handleConfidentialCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReviewData(prev => ({
      ...prev,
      confidentialComments: e.target.value
    }));
  };
  
  const handleDecisionChange = (decision: 'accept' | 'reject' | 'revise') => {
    setReviewData(prev => ({
      ...prev,
      decision
    }));
  };
  
  const calculateOverallScore = (): number => {
    if (reviewData.criteria.length === 0) return 0;
    
    const weightedSum = reviewData.criteria.reduce(
      (sum, criterion) => sum + criterion.score * criterion.weight, 
      0
    );
    
    const totalWeight = reviewData.criteria.reduce(
      (sum, criterion) => sum + criterion.weight, 
      0
    );
    
    return weightedSum / totalWeight;
  };
  
  const validateReview = (): string | null => {
    // Check if all criteria have been scored
    const unratedCriteria = reviewData.criteria.filter(c => c.score === 0);
    if (unratedCriteria.length > 0) {
      return `Please rate all criteria. Missing: ${unratedCriteria.map(c => c.name).join(', ')}`;
    }
    
    // Check if comments are provided
    if (!reviewData.comments.trim()) {
      return 'Please provide comments for the authors';
    }
    
    // Check if a decision is selected
    if (!reviewData.decision) {
      return 'Please select a decision (Accept, Revise, or Reject)';
    }
    
    return null;
  };
  
  const handleSaveDraft = async () => {
    // In a real application, this would save to an API
    console.log('Saving draft review:', reviewData);
    
    // Simulate API call
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSubmitting(false);
    
    // Show success message
    setSuccessMessage('Draft saved successfully');
    setTimeout(() => setSuccessMessage(null), 3000);
  };
  
  const handleSubmitReview = async () => {
    const validationError = validateReview();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    // In a real application, this would submit to an API
    console.log('Submitting review:', {
      ...reviewData,
      completed: true
    });
    
    // Simulate API call
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsSubmitting(false);
    
    // Navigate to confirmation or dashboard
    navigate('/dashboard');
  };
  
  if (isLoading) {
    return (
      <div className="relative pt-8 pb-20 bg-blueGray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center">
            <div className="w-full lg:w-8/12 px-4">
              <h1 className="text-2xl font-bold mb-6 text-blueGray-700">Review Article</h1>
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-blueGray-200 rounded w-3/4"></div>
                <div className="h-4 bg-blueGray-200 rounded w-1/2"></div>
                <div className="h-64 bg-blueGray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="relative pt-8 pb-20 bg-blueGray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center">
            <div className="w-full lg:w-8/12 px-4">
              <h1 className="text-2xl font-bold mb-6 text-blueGray-700">Review Article</h1>
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
              <Link 
                to="/dashboard" 
                className="text-blueGray-700 hover:text-blueGray-900 font-bold transition-all duration-300 ease-in-out"
              >
                <i className="fas fa-arrow-left mr-2"></i> Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!article) {
    return (
      <div className="relative pt-8 pb-20 bg-blueGray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center">
            <div className="w-full lg:w-8/12 px-4">
              <h1 className="text-2xl font-bold mb-6 text-blueGray-700">Review Article</h1>
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">Article not found</span>
              </div>
              <Link 
                to="/dashboard" 
                className="text-blueGray-700 hover:text-blueGray-900 font-bold transition-all duration-300 ease-in-out"
              >
                <i className="fas fa-arrow-left mr-2"></i> Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative pt-8 pb-20 bg-blueGray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center">
          <div className="w-full lg:w-8/12 px-4">
            <h1 className="text-2xl font-bold mb-6 text-blueGray-700">Review Article</h1>
            
            {successMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{successMessage}</span>
              </div>
            )}
            
            <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-2 text-blueGray-700">{article.title}</h2>
              <p className="text-sm text-blueGray-600 mb-1">
                {article.authors.map(author => author.name).join(', ')}
              </p>
              <p className="text-sm text-blueGray-500 mb-3">
                Published: {article.publishedDate} • Category: {article.category} • DOI: {article.doi}
              </p>
              
              <div className="mb-4">
                <h3 className="font-medium mb-1 text-blueGray-700">Abstract</h3>
                <p className="text-blueGray-600">{article.abstract}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-1 text-blueGray-700">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {article.keywords.map((keyword, index) => (
                    <span 
                      key={index}
                      className="bg-blueGray-100 text-blueGray-700 text-xs px-2 py-1 rounded"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              
              <button
                onClick={() => setIsPdfVisible(!isPdfVisible)}
                className="bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
              >
                {isPdfVisible ? 'Hide Full Paper' : 'View Full Paper'}
              </button>
            </div>
            
            {isPdfVisible && (
              <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-blueGray-700">Full Paper</h3>
                <div className="border p-4 rounded-md bg-blueGray-50 whitespace-pre-line text-blueGray-700">
                  {article.fullText}
                </div>
              </div>
            )}
            
            <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-blueGray-700">Evaluation</h3>
              
              <div className="space-y-6">
                {reviewData.criteria.map((criterion) => (
                  <div key={criterion.id}>
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-medium text-blueGray-700">{criterion.name}</label>
                      <span className="text-sm text-blueGray-500">{criterion.score}/5</span>
                    </div>
                    <p className="text-sm text-blueGray-600 mb-2">{criterion.description}</p>
                    <div className="flex space-x-4 md:space-x-8">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          onClick={() => handleCriteriaChange(criterion.id, score)}
                          className={`w-10 h-10 rounded-full ${
                            criterion.score === score
                              ? 'bg-blue-600 text-white'
                              : 'bg-blueGray-100 hover:bg-blueGray-200 text-blueGray-700'
                          } transition-all duration-200 ease-in-out`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                
                {reviewData.criteria.some(c => c.score > 0) && (
                  <div className="mt-4 p-3 bg-blueGray-50 rounded-md">
                    <p className="font-medium text-blueGray-700">Overall Score: {calculateOverallScore().toFixed(1)}/5</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-blueGray-700">Comments</h3>
              
              <div className="mb-6">
                <label className="block font-medium mb-2 text-blueGray-700">Comments to Authors</label>
                <textarea
                  className="w-full border rounded-md px-3 py-2 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide constructive feedback to the authors..."
                  value={reviewData.comments}
                  onChange={handleCommentsChange}
                ></textarea>
              </div>
              
              <div className="mb-6">
                <label className="block font-medium mb-2 text-blueGray-700">Confidential Comments to Editors</label>
                <textarea
                  className="w-full border rounded-md px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="These comments will only be visible to editors..."
                  value={reviewData.confidentialComments}
                  onChange={handleConfidentialCommentsChange}
                ></textarea>
              </div>
              
              <div className="mb-6">
                <label className="block font-medium mb-2 text-blueGray-700">Decision</label>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleDecisionChange('accept')}
                    className={`px-4 py-2 rounded-md ${
                      reviewData.decision === 'accept'
                        ? 'bg-green-600 text-white'
                        : 'bg-blueGray-100 text-blueGray-700 hover:bg-blueGray-200'
                    } transition-all duration-200 ease-in-out`}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDecisionChange('revise')}
                    className={`px-4 py-2 rounded-md ${
                      reviewData.decision === 'revise'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-blueGray-100 text-blueGray-700 hover:bg-blueGray-200'
                    } transition-all duration-200 ease-in-out`}
                  >
                    Revise
                  </button>
                  <button
                    onClick={() => handleDecisionChange('reject')}
                    className={`px-4 py-2 rounded-md ${
                      reviewData.decision === 'reject'
                        ? 'bg-red-600 text-white'
                        : 'bg-blueGray-100 text-blueGray-700 hover:bg-blueGray-200'
                    } transition-all duration-200 ease-in-out`}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className="bg-blueGray-500 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={isSubmitting}
                className="bg-emerald-500 text-white active:bg-emerald-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
