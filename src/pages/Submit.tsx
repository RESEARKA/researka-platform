import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { submitArticle, ArticleSubmission } from '../services/articleService';
import { SEO } from '../components/SEO';

// Step types for the multi-step form
type SubmissionStep = 'basics' | 'authors' | 'file' | 'review' | 'submitting';

export function Submit() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Form state
  const [currentStep, setCurrentStep] = useState<SubmissionStep>('basics');
  const [formData, setFormData] = useState<Partial<ArticleSubmission>>({
    title: '',
    abstract: '',
    authors: user ? [`${user.username}`] : [''],
    keywords: [''],
    category: '',
    file: undefined
  });
  
  // Draft state
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filePreview, setFilePreview] = useState<string | null>(null);
  
  // Available categories
  const categories = [
    'Biology',
    'Chemistry',
    'Physics',
    'Mathematics',
    'Computer Science',
    'Economics',
    'Psychology',
    'Sociology',
    'Philosophy',
    'Literature',
    'History',
    'Political Science',
    'Earth Sciences',
    'Environmental Science',
    'Engineering'
  ];
  
  // Auto-save draft
  useEffect(() => {
    if (!autoSaveEnabled || !formHasData()) return;
    
    const autoSaveTimer = setTimeout(() => {
      saveDraft();
    }, 30000); // Auto-save every 30 seconds
    
    return () => clearTimeout(autoSaveTimer);
  }, [formData, autoSaveEnabled]);
  
  // Load draft on mount
  useEffect(() => {
    loadDraft();
  }, []);
  
  // Check if form has any data
  const formHasData = (): boolean => {
    return !!(
      formData.title || 
      formData.abstract || 
      (formData.authors && formData.authors.some(author => author.trim() !== '')) ||
      (formData.keywords && formData.keywords.some(keyword => keyword.trim() !== '')) ||
      formData.category ||
      formData.file
    );
  };
  
  // Save draft to local storage
  const saveDraft = () => {
    if (!formHasData()) return;
    
    localStorage.setItem('article_draft', JSON.stringify(formData));
    setIsDraftSaved(true);
    setLastSaved(new Date());
  };
  
  // Load draft from local storage
  const loadDraft = () => {
    const savedDraft = localStorage.getItem('article_draft');
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft) as Partial<ArticleSubmission>;
        // File can't be stored in localStorage, so we need to handle it separately
        setFormData({ ...parsedDraft, file: undefined });
        setIsDraftSaved(true);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  };
  
  // Clear draft from local storage
  const clearDraft = () => {
    localStorage.removeItem('article_draft');
    setIsDraftSaved(false);
    setLastSaved(null);
  };
  
  // Handle form field changes
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDraftSaved(false);
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle file upload
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, file }));
      setIsDraftSaved(false);
      
      // Create file preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear error for this field
      if (errors.file) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.file;
          return newErrors;
        });
      }
    }
  };
  
  // Handle author field changes
  const handleAuthorChange = (index: number, value: string) => {
    setFormData(prev => {
      const newAuthors = [...(prev.authors || [])];
      newAuthors[index] = value;
      return { ...prev, authors: newAuthors };
    });
    setIsDraftSaved(false);
  };
  
  // Add a new author field
  const addAuthor = () => {
    setFormData(prev => ({
      ...prev,
      authors: [...(prev.authors || []), '']
    }));
    setIsDraftSaved(false);
  };
  
  // Remove an author field
  const removeAuthor = (index: number) => {
    setFormData(prev => {
      const newAuthors = [...(prev.authors || [])];
      newAuthors.splice(index, 1);
      return { ...prev, authors: newAuthors };
    });
    setIsDraftSaved(false);
  };
  
  // Handle keyword field changes
  const handleKeywordChange = (index: number, value: string) => {
    setFormData(prev => {
      const newKeywords = [...(prev.keywords || [])];
      newKeywords[index] = value;
      return { ...prev, keywords: newKeywords };
    });
    setIsDraftSaved(false);
  };
  
  // Add a new keyword field
  const addKeyword = () => {
    setFormData(prev => ({
      ...prev,
      keywords: [...(prev.keywords || []), '']
    }));
    setIsDraftSaved(false);
  };
  
  // Remove a keyword field
  const removeKeyword = (index: number) => {
    setFormData(prev => {
      const newKeywords = [...(prev.keywords || [])];
      newKeywords.splice(index, 1);
      return { ...prev, keywords: newKeywords };
    });
    setIsDraftSaved(false);
  };
  
  // Validate the current step
  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (currentStep) {
      case 'basics':
        if (!formData.title?.trim()) {
          newErrors.title = 'Title is required';
        }
        if (!formData.abstract?.trim()) {
          newErrors.abstract = 'Abstract is required';
        }
        if (!formData.category) {
          newErrors.category = 'Category is required';
        }
        break;
        
      case 'authors':
        if (!formData.authors?.length || !formData.authors.some(author => author.trim() !== '')) {
          newErrors.authors = 'At least one author is required';
        }
        if (!formData.keywords?.length || !formData.keywords.some(keyword => keyword.trim() !== '')) {
          newErrors.keywords = 'At least one keyword is required';
        }
        break;
        
      case 'file':
        if (!formData.file) {
          newErrors.file = 'Article file is required';
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Move to the next step
  const nextStep = () => {
    if (!validateCurrentStep()) return;
    
    switch (currentStep) {
      case 'basics':
        setCurrentStep('authors');
        break;
      case 'authors':
        setCurrentStep('file');
        break;
      case 'file':
        setCurrentStep('review');
        break;
      default:
        break;
    }
    
    // Save draft when moving to next step
    saveDraft();
  };
  
  // Move to the previous step
  const prevStep = () => {
    switch (currentStep) {
      case 'authors':
        setCurrentStep('basics');
        break;
      case 'file':
        setCurrentStep('authors');
        break;
      case 'review':
        setCurrentStep('file');
        break;
      default:
        break;
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Final validation
    const isValid = validateCurrentStep();
    if (!isValid) return;
    
    // Prepare submission data
    const submissionData: ArticleSubmission = {
      title: formData.title || '',
      abstract: formData.abstract || '',
      authors: formData.authors?.filter(author => author.trim() !== '') || [],
      keywords: formData.keywords?.filter(keyword => keyword.trim() !== '') || [],
      category: formData.category || '',
      file: formData.file as File
    };
    
    setIsSubmitting(true);
    setCurrentStep('submitting');
    
    try {
      // Submit the article
      await submitArticle(submissionData);
      
      // Clear draft after successful submission
      clearDraft();
      
      // Redirect to success page
      navigate('/submit/success');
    } catch (error) {
      console.error('Error submitting article:', error);
      setErrors({ submit: 'Failed to submit article. Please try again.' });
      setCurrentStep('review');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render form steps
  const renderFormStep = () => {
    switch (currentStep) {
      case 'basics':
        return (
          <div className="space-y-6">
            <div>
              <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="title">
                Article Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title || ''}
                onChange={handleChange}
                className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${errors.title ? 'border-red-500' : ''}`}
                placeholder="Enter article title"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>
            
            <div>
              <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="abstract">
                Abstract *
              </label>
              <textarea
                id="abstract"
                name="abstract"
                value={formData.abstract || ''}
                onChange={handleChange}
                rows={6}
                className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${errors.abstract ? 'border-red-500' : ''}`}
                placeholder="Enter article abstract"
              />
              {errors.abstract && <p className="text-red-500 text-xs mt-1">{errors.abstract}</p>}
            </div>
            
            <div>
              <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="category">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category || ''}
                onChange={handleChange}
                className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${errors.category ? 'border-red-500' : ''}`}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>
          </div>
        );
        
      case 'authors':
        return (
          <div className="space-y-6">
            <div>
              <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                Authors *
              </label>
              {formData.authors?.map((author, index) => (
                <div key={`author-${index}`} className="flex items-center mb-3">
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => handleAuthorChange(index, e.target.value)}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    placeholder={`Author ${index + 1}`}
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeAuthor(index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addAuthor}
                className="text-lightBlue-500 text-sm font-bold flex items-center"
              >
                <i className="fas fa-plus mr-1"></i> Add Author
              </button>
              {errors.authors && <p className="text-red-500 text-xs mt-1">{errors.authors}</p>}
            </div>
            
            <div>
              <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                Keywords *
              </label>
              {formData.keywords?.map((keyword, index) => (
                <div key={`keyword-${index}`} className="flex items-center mb-3">
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => handleKeywordChange(index, e.target.value)}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    placeholder={`Keyword ${index + 1}`}
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeKeyword(index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addKeyword}
                className="text-lightBlue-500 text-sm font-bold flex items-center"
              >
                <i className="fas fa-plus mr-1"></i> Add Keyword
              </button>
              {errors.keywords && <p className="text-red-500 text-xs mt-1">{errors.keywords}</p>}
            </div>
          </div>
        );
        
      case 'file':
        return (
          <div className="space-y-6">
            <div>
              <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="file">
                Article File (PDF) *
              </label>
              <div className="border-dashed border-2 border-blueGray-300 rounded-lg p-6 text-center">
                <input
                  id="file"
                  name="file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="file" className="cursor-pointer">
                  <div className="flex flex-col items-center justify-center">
                    <i className="fas fa-cloud-upload-alt text-4xl text-blueGray-400 mb-2"></i>
                    <p className="text-blueGray-500">
                      {formData.file ? formData.file.name : 'Drag and drop your file here or click to browse'}
                    </p>
                    <p className="text-xs text-blueGray-400 mt-1">
                      Supported format: PDF
                    </p>
                  </div>
                </label>
              </div>
              {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file}</p>}
              
              {formData.file && (
                <div className="mt-4 p-4 bg-blueGray-50 rounded-lg">
                  <div className="flex items-center">
                    <i className="fas fa-file-pdf text-red-500 text-2xl mr-3"></i>
                    <div>
                      <p className="font-semibold">{formData.file.name}</p>
                      <p className="text-xs text-blueGray-500">
                        {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, file: undefined }));
                        setFilePreview(null);
                      }}
                      className="ml-auto text-red-500 hover:text-red-700"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                Supplementary Materials (Optional)
              </label>
              <p className="text-sm text-blueGray-500 mb-4">
                You can add supplementary materials after your article is accepted.
              </p>
            </div>
          </div>
        );
        
      case 'review':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-blueGray-700 mb-4">Review Your Submission</h3>
            
            <div className="bg-blueGray-50 p-4 rounded-lg">
              <h4 className="font-bold text-blueGray-700 mb-2">Article Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-blueGray-500">Title</p>
                  <p className="font-medium">{formData.title}</p>
                </div>
                <div>
                  <p className="text-xs text-blueGray-500">Category</p>
                  <p className="font-medium">{formData.category}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-xs text-blueGray-500">Abstract</p>
                <p className="text-sm">{formData.abstract}</p>
              </div>
            </div>
            
            <div className="bg-blueGray-50 p-4 rounded-lg">
              <h4 className="font-bold text-blueGray-700 mb-2">Authors & Keywords</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-blueGray-500">Authors</p>
                  <ul className="list-disc list-inside">
                    {formData.authors?.filter(author => author.trim() !== '').map((author, index) => (
                      <li key={`review-author-${index}`} className="text-sm">{author}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs text-blueGray-500">Keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.keywords?.filter(keyword => keyword.trim() !== '').map((keyword, index) => (
                      <span key={`review-keyword-${index}`} className="text-xs bg-blueGray-200 text-blueGray-700 px-2 py-1 rounded-full">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blueGray-50 p-4 rounded-lg">
              <h4 className="font-bold text-blueGray-700 mb-2">Files</h4>
              {formData.file && (
                <div className="flex items-center">
                  <i className="fas fa-file-pdf text-red-500 text-xl mr-2"></i>
                  <div>
                    <p className="font-medium">{formData.file.name}</p>
                    <p className="text-xs text-blueGray-500">
                      {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-bold text-yellow-800 flex items-center mb-2">
                <i className="fas fa-exclamation-circle mr-2"></i>
                Important Notice
              </h4>
              <p className="text-sm text-yellow-700">
                By submitting this article, you confirm that:
              </p>
              <ul className="list-disc list-inside text-sm text-yellow-700 mt-2">
                <li>This is your original work or you have permission from all co-authors to submit</li>
                <li>The article is not currently under review or published elsewhere</li>
                <li>You agree to the Researka's terms and conditions</li>
              </ul>
            </div>
            
            {errors.submit && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-red-600">{errors.submit}</p>
              </div>
            )}
          </div>
        );
        
      case 'submitting':
        return (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-lightBlue-500 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-blueGray-700 mb-2">Submitting Your Article</h3>
            <p className="text-blueGray-500">
              Please wait while we process your submission...
            </p>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // Render progress bar
  const renderProgressBar = () => {
    const steps = [
      { key: 'basics', label: 'Basic Info' },
      { key: 'authors', label: 'Authors & Keywords' },
      { key: 'file', label: 'Upload Files' },
      { key: 'review', label: 'Review & Submit' }
    ];
    
    const currentIndex = steps.findIndex(step => step.key === currentStep);
    const progress = currentIndex >= 0 ? (currentIndex / (steps.length - 1)) * 100 : 0;
    
    return (
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <div 
              key={step.key} 
              className={`text-xs font-bold uppercase ${
                index <= currentIndex ? 'text-lightBlue-500' : 'text-blueGray-400'
              }`}
            >
              {step.label}
            </div>
          ))}
        </div>
        <div className="h-2 bg-blueGray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-lightBlue-500 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    );
  };
  
  return (
    <>
      <SEO 
        title="Submit Article - Researka"
        description="Submit your academic article to Researka for peer review and publication."
        canonical="/submit"
      />
      <section className="relative py-16 bg-blueGray-50">
        <div className="container mx-auto px-4">
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg">
            <div className="px-6">
              <div className="text-center mt-12">
                <h3 className="text-4xl font-semibold leading-normal mb-2 text-blueGray-700">
                  Submit Your Article
                </h3>
                <div className="text-sm leading-normal mt-0 mb-2 text-blueGray-400 font-bold uppercase">
                  <i className="fas fa-paper-plane mr-2 text-lg text-blueGray-400"></i>
                  Publish your research with Researka
                </div>
                <div className="mb-8 text-blueGray-600">
                  <p>Complete the form below to submit your article for peer review.</p>
                </div>
              </div>
              
              {/* Draft save status */}
              {isDraftSaved && (
                <div className="mb-6 bg-green-50 p-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <i className="fas fa-save text-green-500 mr-2"></i>
                    <span className="text-sm text-green-700">
                      Draft saved {lastSaved && `(Last saved: ${lastSaved.toLocaleTimeString()})`}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <label className="inline-flex items-center mr-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoSaveEnabled}
                        onChange={() => setAutoSaveEnabled(!autoSaveEnabled)}
                        className="form-checkbox h-4 w-4 text-lightBlue-500 transition duration-150 ease-in-out"
                      />
                      <span className="ml-2 text-sm text-green-700">Auto-save</span>
                    </label>
                    <button
                      type="button"
                      onClick={clearDraft}
                      className="text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 bg-red-500 text-white active:bg-red-600"
                    >
                      Clear Draft
                    </button>
                  </div>
                </div>
              )}
              
              {/* Form progress */}
              {currentStep !== 'submitting' && renderProgressBar()}
              
              {/* Submission form */}
              <form onSubmit={handleSubmit} className="mb-12">
                {renderFormStep()}
                
                {/* Form navigation buttons */}
                {currentStep !== 'submitting' && (
                  <div className="flex justify-between mt-8">
                    {currentStep !== 'basics' ? (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="bg-blueGray-500 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                      >
                        <i className="fas fa-arrow-left mr-2"></i> Previous
                      </button>
                    ) : (
                      <div></div> // Empty div to maintain flex layout
                    )}
                    
                    {currentStep !== 'review' ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="bg-lightBlue-500 text-white active:bg-lightBlue-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                      >
                        Next <i className="fas fa-arrow-right ml-2"></i>
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-emerald-500 text-white active:bg-emerald-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                      >
                        <i className="fas fa-paper-plane mr-2"></i> Submit Article
                      </button>
                    )}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
