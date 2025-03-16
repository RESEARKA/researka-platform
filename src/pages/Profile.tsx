import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, UserProfile, verifyUserOrcid } from '../services/profileService';
import { getUserSubmissions, getUserReviews, Article, ArticleReview } from '../services/articleService';
import { EditProfile } from '../components/EditProfile';
import { isValidOrcidFormat } from '../services/orcidService';
import ErrorBoundary from '../components/ErrorBoundary';

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  return (
    <div className="p-6 bg-red-50 rounded-lg">
      <h2 className="text-xl font-bold text-red-800 mb-2">Something went wrong:</h2>
      <p className="text-red-700 mb-4">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  );
};

export function Profile() {
  const [activeTab, setActiveTab] = useState<'profile' | 'submissions' | 'reviews'>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Article[]>([]);
  const [reviews, setReviews] = useState<ArticleReview[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [orcidInput, setOrcidInput] = useState('');
  const [isLinkingOrcid, setIsLinkingOrcid] = useState(false);
  const [orcidVerifying, setOrcidVerifying] = useState(false);
  const [orcidMessage, setOrcidMessage] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const { isAuthenticated } = useAuth();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch user profile data
        const profileData = await getUserProfile();
        setUserProfile(profileData);
        
        // Fetch user submissions
        const submissionsData = await getUserSubmissions(profileData.id);
        setSubmissions(submissionsData);
        
        // Fetch user reviews
        const reviewsData = await getUserReviews(profileData.id);
        setReviews(reviewsData);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    setIsEditing(false);
  };

  const handleOrcidInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrcidInput(e.target.value);
    setOrcidMessage(null);
  };

  const verifyAndLinkOrcid = async () => {
    if (!orcidInput) {
      setOrcidMessage('Please enter an ORCID ID');
      return;
    }

    if (!isValidOrcidFormat(orcidInput)) {
      setOrcidMessage('Invalid ORCID format. It should be in the format: 0000-0000-0000-0000');
      return;
    }

    setOrcidVerifying(true);
    setOrcidMessage('Verifying ORCID...');

    try {
      const result = await verifyUserOrcid(orcidInput);
      
      if (result.success && userProfile) {
        // In a real app, this would make an API call to update the user's profile
        const updatedProfile = {
          ...userProfile,
          orcid: orcidInput,
          orcidVerified: true,
          orcidLastVerified: new Date().toISOString().split('T')[0]
        };
        
        setUserProfile(updatedProfile);
        setOrcidMessage('ORCID successfully linked to your profile!');
        setIsLinkingOrcid(false);
        setOrcidInput('');
      } else {
        setOrcidMessage(result.message || 'Failed to verify ORCID. Please try again.');
      }
    } catch (error) {
      setError(error);
    } finally {
      setOrcidVerifying(false);
    }
  };

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-blueGray-200 rounded w-1/4"></div>
          <div className="h-4 bg-blueGray-200 rounded w-1/2"></div>
          <div className="h-4 bg-blueGray-200 rounded w-3/4"></div>
          <div className="h-4 bg-blueGray-200 rounded w-1/2"></div>
        </div>
      );
    }

    if (!userProfile) {
      return (
        <div className="text-center py-8">
          <p className="text-red-600">Failed to load profile data. Please try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
          >
            Reload
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'profile':
        return isEditing ? (
          <EditProfile 
            userProfile={userProfile} 
            onSave={handleProfileUpdate} 
            onCancel={() => setIsEditing(false)} 
          />
        ) : (
          <div className="space-y-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                {userProfile.profilePictureUrl ? (
                  <img 
                    src={userProfile.profilePictureUrl} 
                    alt={userProfile.name} 
                    className="rounded-full w-24 h-24 object-cover shadow"
                  />
                ) : (
                  <div className="bg-blueGray-200 text-blueGray-800 rounded-full w-24 h-24 flex items-center justify-center text-2xl font-bold shadow">
                    {userProfile.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-blueGray-700">{userProfile.name}</h2>
                <p className="text-blueGray-600">{userProfile.institution}</p>
                <p className="text-sm text-blueGray-500">Wallet: {userProfile.walletAddress}</p>
                
                {/* ORCID Display with Verification Status */}
                <div className="mt-2">
                  {userProfile.orcid ? (
                    <div className="flex items-center">
                      <span className="text-sm text-blueGray-500 mr-2">ORCID:</span>
                      <a 
                        href={`https://orcid.org/${userProfile.orcid}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <img 
                          src="https://orcid.org/assets/vectors/orcid.logo.icon.svg" 
                          alt="ORCID" 
                          className="w-4 h-4 mr-1"
                        />
                        {userProfile.orcid}
                      </a>
                      {userProfile.orcidVerified && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </span>
                      )}
                    </div>
                  ) : (
                    <div>
                      {isLinkingOrcid ? (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center">
                            <input
                              type="text"
                              value={orcidInput}
                              onChange={handleOrcidInputChange}
                              placeholder="0000-0000-0000-0000"
                              className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={verifyAndLinkOrcid}
                              disabled={orcidVerifying || !orcidInput}
                              className="px-3 py-1 text-sm text-white bg-blue-600 rounded-r-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {orcidVerifying ? 'Verifying...' : 'Verify & Link'}
                            </button>
                          </div>
                          {orcidMessage && (
                            <p className="text-sm text-orange-500">{orcidMessage}</p>
                          )}
                          <div className="flex items-center space-x-2">
                            <a 
                              href="https://orcid.org/register" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Don't have an ORCID? Register here
                            </a>
                            <button
                              onClick={() => setIsLinkingOrcid(false)}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsLinkingOrcid(true)}
                          className="mt-1 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Link ORCID ID
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-blueGray-500 mt-2">Member since: {userProfile.joinDate}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 text-blueGray-700">About</h3>
              <p className="text-blueGray-600">{userProfile.bio}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blueGray-50 p-4 rounded-lg shadow-sm">
                <h4 className="font-medium text-blueGray-700">Publications</h4>
                <p className="text-2xl font-bold text-blue-600">{userProfile.publications}</p>
              </div>
              <div className="bg-blueGray-50 p-4 rounded-lg shadow-sm">
                <h4 className="font-medium text-blueGray-700">Reviews</h4>
                <p className="text-2xl font-bold text-blue-600">{userProfile.reviews}</p>
              </div>
            </div>
            
            {/* Verification Status */}
            {userProfile.verificationStatus && (
              <div className="bg-blueGray-50 p-4 rounded-lg shadow-sm">
                <h4 className="font-medium text-blueGray-700">Account Verification</h4>
                <div className="mt-2 flex items-center">
                  {userProfile.isVerified ? (
                    <>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                        <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                      <span className="text-sm text-blueGray-600">
                        Your account has been fully verified.
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mr-2">
                        {userProfile.verificationStatus}
                      </span>
                      <span className="text-sm text-blueGray-600">
                        {userProfile.verificationStatus === 'pending' 
                          ? 'Your verification is being processed.' 
                          : 'Additional verification is required.'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
            
            <div className="pt-4 border-t">
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
              >
                Edit Profile
              </button>
            </div>
          </div>
        );
        
      case 'submissions':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-blueGray-700">Your Submissions</h2>
            
            {submissions.length === 0 ? (
              <p className="text-blueGray-600">You haven't submitted any articles yet.</p>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div key={submission.id} className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-blueGray-700">{submission.title}</h3>
                        <p className="text-sm text-blueGray-600">Submitted on: {submission.submittedDate}</p>
                        <p className="text-sm text-blueGray-600">Category: {submission.category}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {submission.keywords.map((keyword, idx) => (
                            <span key={idx} className="text-xs bg-blueGray-100 px-2 py-1 rounded text-blueGray-700">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className={`inline-block px-2 py-1 text-xs rounded ${
                          submission.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : submission.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Link 
                        to={`/articles/${submission.id}`} 
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="pt-4">
              <Link 
                to="/submit" 
                className="bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
              >
                Submit New Article
              </Link>
            </div>
          </div>
        );
        
      case 'reviews':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-blueGray-700">Your Reviews</h2>
            
            {reviews.length === 0 ? (
              <p className="text-blueGray-600">You haven't reviewed any articles yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-blueGray-700">{review.articleTitle}</h3>
                        <p className="text-sm text-blueGray-600">Reviewed on: {review.reviewDate || 'In progress'}</p>
                        <p className="text-sm text-blueGray-600">
                          Rating: {Array(5).fill(0).map((_, idx) => (
                            <span key={idx} className={`text-yellow-400 ${idx < (review.rating || 0) ? 'opacity-100' : 'opacity-30'}`}>★</span>
                          ))}
                        </p>
                      </div>
                      <div>
                        <span className={`inline-block px-2 py-1 text-xs rounded ${
                          review.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {review.status ? review.status.charAt(0).toUpperCase() + review.status.slice(1) : 'Pending'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-blueGray-600 truncate">{review.comment || review.comments || 'No comments yet'}</p>
                    </div>
                    <div className="mt-3">
                      <Link 
                        to={`/reviews/${review.id}`} 
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Full Review
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => setError(null)}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap">
          <div className="w-full lg:w-3/12 px-4">
            <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg p-5">
              <div className="px-4 py-5 flex-auto">
                <div className="tab-content tab-space">
                  <div className="space-y-2">
                    <button
                      className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                        activeTab === 'profile' 
                          ? 'bg-blueGray-800 text-white' 
                          : 'text-blueGray-700 hover:bg-blueGray-100'
                      }`}
                      onClick={() => setActiveTab('profile')}
                    >
                      Profile
                    </button>
                    <button
                      className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                        activeTab === 'submissions' 
                          ? 'bg-blueGray-800 text-white' 
                          : 'text-blueGray-700 hover:bg-blueGray-100'
                      }`}
                      onClick={() => setActiveTab('submissions')}
                    >
                      Submissions
                    </button>
                    <button
                      className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                        activeTab === 'reviews' 
                          ? 'bg-blueGray-800 text-white' 
                          : 'text-blueGray-700 hover:bg-blueGray-100'
                      }`}
                      onClick={() => setActiveTab('reviews')}
                    >
                      Reviews
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-9/12 px-4">
            <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
