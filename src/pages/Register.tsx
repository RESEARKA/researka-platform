import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SEO } from '../components/SEO';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    orcidId: '',
    institution: '',
    agreeTerms: false
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailType, setEmailType] = useState<'institutional' | 'non-institutional' | null>(null);
  const [additionalDocuments, setAdditionalDocuments] = useState<File[]>([]);

  // Check if email is from an educational institution
  useEffect(() => {
    if (!formData.email) {
      setEmailType(null);
      return;
    }
    
    const eduDomains = [
      /\.edu$/,                 // US educational institutions
      /\.ac\.[a-z]{2,}$/,       // Academic institutions in many countries (ac.uk, ac.jp, etc.)
      /\.edu\.[a-z]{2,}$/       // Educational institutions in some countries
    ];
    
    const isInstitutional = eduDomains.some(pattern => 
      pattern.test(formData.email.toLowerCase())
    );
    
    setEmailType(isInstitutional ? 'institutional' : 'non-institutional');
  }, [formData.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setAdditionalDocuments(filesArray);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.agreeTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }

    // Validate ORCID ID format if provided
    if (formData.orcidId && !validateOrcidFormat(formData.orcidId)) {
      setError('Invalid ORCID ID format. It should be in the format: 0000-0000-0000-0000');
      return;
    }

    // For non-institutional emails, ORCID ID is required
    if (emailType === 'non-institutional' && !formData.orcidId) {
      setError('ORCID ID is required for non-institutional email addresses');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        orcidId: formData.orcidId,
        institution: formData.institution,
        additionalDocuments: additionalDocuments
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Validate ORCID ID format
  const validateOrcidFormat = (orcidId: string): boolean => {
    const orcidPattern = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
    return orcidPattern.test(orcidId);
  };

  return (
    <>
      <SEO 
        title="Register - Researka"
        description="Create a new account on Researka to submit and review academic articles."
        canonical="/register"
      />
      <div className="container mx-auto px-4 h-full py-16">
        <div className="flex content-center items-center justify-center h-full">
          <div className="w-full lg:w-6/12 px-4">
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-200 border-0">
              <div className="rounded-t mb-0 px-6 py-6">
                <div className="text-center mb-3">
                  <h6 className="text-blueGray-500 text-sm font-bold">
                    Create a new account
                  </h6>
                </div>
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-3" role="alert">
                    <span className="block sm:inline">{error}</span>
                  </div>
                )}
              </div>
              <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                <form onSubmit={handleSubmit}>
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="username"
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="email"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    {emailType && (
                      <p className={`text-xs mt-1 ${emailType === 'institutional' ? 'text-green-600' : 'text-orange-500'}`}>
                        {emailType === 'institutional' 
                          ? 'Institutional email detected. Your account will be verified automatically.' 
                          : 'Non-institutional email detected. Additional verification will be required.'}
                      </p>
                    )}
                  </div>

                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="institution"
                    >
                      Institution (Optional)
                    </label>
                    <input
                      type="text"
                      name="institution"
                      id="institution"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Your academic institution"
                      value={formData.institution}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="orcidId"
                    >
                      ORCID ID {emailType === 'non-institutional' && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      name="orcidId"
                      id="orcidId"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="0000-0000-0000-0000"
                      value={formData.orcidId}
                      onChange={handleChange}
                      required={emailType === 'non-institutional'}
                    />
                    <p className="text-xs mt-1 text-blueGray-500">
                      <a href="https://orcid.org/register" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        Don't have an ORCID ID? Register for one here.
                      </a>
                    </p>
                  </div>

                  {emailType === 'non-institutional' && (
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlFor="additionalDocuments"
                      >
                        Additional Documentation
                      </label>
                      <input
                        type="file"
                        name="additionalDocuments"
                        id="additionalDocuments"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        onChange={handleFileChange}
                        multiple
                      />
                      <p className="text-xs mt-1 text-blueGray-500">
                        For non-institutional emails, please upload supporting documents such as CV, list of publications, or reference letters.
                      </p>
                    </div>
                  )}

                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="confirmPassword"
                    >
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        id="agreeTerms"
                        name="agreeTerms"
                        type="checkbox"
                        className="form-checkbox border-0 rounded text-blueGray-700 ml-1 w-5 h-5 ease-linear transition-all duration-150"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                        required
                      />
                      <span className="ml-2 text-sm font-semibold text-blueGray-600">
                        I agree with the{" "}
                        <a
                          href="#terms"
                          className="text-blue-500"
                          onClick={(e) => e.preventDefault()}
                        >
                          Terms and Conditions
                        </a>
                      </span>
                    </label>
                  </div>

                  <div className="text-center mt-6">
                    <button
                      className="bg-emerald-500 text-white active:bg-emerald-600 hover:bg-emerald-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating Account...
                        </span>
                      ) : (
                        "Create Account"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <div className="flex flex-wrap mt-6 relative">
              <div className="w-full text-center">
                <Link to="/login" className="text-blueGray-200">
                  <small>Already have an account? Sign in</small>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
