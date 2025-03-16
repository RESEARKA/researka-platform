import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SEO } from '../components/SEO';

export function ReviewSuccess() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <>
      <SEO 
        title="Review Submitted - Researka"
        description="Your peer review has been successfully submitted to Researka."
        canonical="/review/success"
      />
      <section className="relative py-16 bg-blueGray-50">
        <div className="container mx-auto px-4">
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg">
            <div className="px-6 py-12 text-center">
              <div className="mb-8">
                <div className="mx-auto bg-emerald-100 rounded-full p-4 w-20 h-20 flex items-center justify-center">
                  <i className="fas fa-check-circle text-4xl text-emerald-500"></i>
                </div>
              </div>
              
              <h3 className="text-3xl font-semibold leading-normal mb-4 text-blueGray-700">
                Review Submitted Successfully!
              </h3>
              
              <p className="text-lg text-blueGray-500 mb-8">
                Thank you for completing your peer review. Your contribution helps maintain the quality and integrity of academic publishing.
              </p>
              
              <div className="bg-blueGray-50 p-6 rounded-lg mb-8">
                <h4 className="text-xl font-semibold text-blueGray-700 mb-4">What happens next?</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="bg-blueGray-200 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                      <span className="text-blueGray-700 font-bold">1</span>
                    </div>
                    <h5 className="font-semibold text-blueGray-700 mb-2 text-center">Editor Review</h5>
                    <p className="text-sm text-blueGray-500 text-center">
                      The journal editor will review your feedback along with other reviewer comments.
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="bg-blueGray-200 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                      <span className="text-blueGray-700 font-bold">2</span>
                    </div>
                    <h5 className="font-semibold text-blueGray-700 mb-2 text-center">Decision</h5>
                    <p className="text-sm text-blueGray-500 text-center">
                      Based on all reviews, the editor will make a decision on the manuscript.
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="bg-blueGray-200 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                      <span className="text-blueGray-700 font-bold">3</span>
                    </div>
                    <h5 className="font-semibold text-blueGray-700 mb-2 text-center">Recognition</h5>
                    <p className="text-sm text-blueGray-500 text-center">
                      Your contribution will be recognized in your reviewer profile and metrics.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
                <Link
                  to="/review-dashboard"
                  className="bg-lightBlue-500 text-white active:bg-lightBlue-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                >
                  <i className="fas fa-tachometer-alt mr-2"></i> Review Dashboard
                </Link>
                
                <Link
                  to="/dashboard"
                  className="bg-blueGray-700 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                >
                  <i className="fas fa-home mr-2"></i> Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
