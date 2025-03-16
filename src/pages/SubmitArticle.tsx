import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CONFIG } from '../config/constants';
import { submitArticle, ArticleSubmission } from '../services/articleService';

export function SubmitArticle() {
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [authors, setAuthors] = useState<string[]>([]);
  const [newAuthor, setNewAuthor] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  // Categories for the dropdown
  const categories = [
    'Blockchain Applications',
    'Cryptography',
    'Decentralized Finance',
    'Smart Contracts',
    'Tokenomics',
    'Academic Publishing',
    'Research Methodology',
    'Open Science',
    'Peer Review',
    'Research Funding',
    'Other'
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError(null);
      } else {
        setFile(null);
        setError('Please upload a PDF file');
      }
    }
  };

  const addAuthor = () => {
    if (newAuthor.trim() && !authors.includes(newAuthor.trim())) {
      setAuthors([...authors, newAuthor.trim()]);
      setNewAuthor('');
    }
  };

  const removeAuthor = (authorToRemove: string) => {
    setAuthors(authors.filter(author => author !== authorToRemove));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter(keyword => keyword !== keywordToRemove));
  };

  const validateForm = (): boolean => {
    if (!title || title.length < 10) {
      setError('Title must be at least 10 characters');
      return false;
    }
    
    if (!abstract || abstract.length < 100) {
      setError('Abstract must be at least 100 characters');
      return false;
    }
    
    if (authors.length === 0) {
      setError('Please add at least one author');
      return false;
    }
    
    if (keywords.length === 0) {
      setError('Please add at least one keyword');
      return false;
    }
    
    if (!category) {
      setError('Please select a category');
      return false;
    }
    
    if (!file) {
      setError('Please upload a PDF file');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Prepare submission data
      const submissionData: ArticleSubmission = {
        title,
        abstract,
        authors,
        keywords,
        category,
        file: file as File
      };
      
      // Submit article
      await submitArticle(submissionData);
      
      // Show success message
      setSuccess(true);
      
      // Reset form after 3 seconds and redirect to profile
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
    } catch (err) {
      console.error('Error submitting article:', err);
      setError('Failed to submit article. Please try again.');
      setSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative pt-8 pb-20 bg-blueGray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center">
          <div className="w-full lg:w-8/12 px-4">
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white border-0">
              <div className="rounded-t bg-white mb-0 px-6 py-6">
                <div className="text-center flex justify-between">
                  <h6 className="text-blueGray-700 text-xl font-bold">Submit New Article</h6>
                </div>
              </div>
              
              <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blueGray-700">Submission fee: ${CONFIG.SUBMISSION_FEE.DEFAULT} (paid in tokens)</p>
                  <p className="text-sm text-blueGray-500 mt-1">
                    Your article will be peer-reviewed within 2-4 weeks after submission.
                  </p>
                </div>
                
                {error && (
                  <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                    Your article has been submitted successfully! You will be redirected to your profile page.
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  {/* Title */}
                  <div className="relative w-full mb-3">
                    <label htmlFor="title" className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Article Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Enter article title (min 10 characters)"
                      disabled={isSubmitting || success}
                      required
                    />
                  </div>
                  
                  {/* Abstract */}
                  <div className="relative w-full mb-3">
                    <label htmlFor="abstract" className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Abstract <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="abstract"
                      value={abstract}
                      onChange={(e) => setAbstract(e.target.value)}
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      rows={5}
                      placeholder="Enter abstract (min 100 characters)"
                      disabled={isSubmitting || success}
                      required
                    ></textarea>
                  </div>
                  
                  {/* Authors */}
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Authors <span className="text-red-500">*</span>
                    </label>
                    <div className="flex mb-2">
                      <input
                        type="text"
                        value={newAuthor}
                        onChange={(e) => setNewAuthor(e.target.value)}
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded-l text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        placeholder="Add author (e.g., Dr. Jane Smith)"
                        disabled={isSubmitting || success}
                      />
                      <button
                        type="button"
                        onClick={addAuthor}
                        className="bg-blueGray-700 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded-r shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
                        disabled={isSubmitting || success}
                      >
                        Add
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap mt-2">
                      {authors.map((author, index) => (
                        <div key={index} className="bg-blueGray-100 text-blueGray-700 px-3 py-1 rounded-full text-sm font-semibold mr-2 mb-2 flex items-center">
                          {author}
                          <button
                            type="button"
                            onClick={() => removeAuthor(author)}
                            className="ml-2 text-blueGray-500 hover:text-blueGray-700 focus:outline-none"
                            disabled={isSubmitting || success}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Keywords */}
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Keywords <span className="text-red-500">*</span>
                    </label>
                    <div className="flex mb-2">
                      <input
                        type="text"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded-l text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        placeholder="Add keyword (e.g., Blockchain)"
                        disabled={isSubmitting || success}
                      />
                      <button
                        type="button"
                        onClick={addKeyword}
                        className="bg-blueGray-700 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded-r shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
                        disabled={isSubmitting || success}
                      >
                        Add
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap mt-2">
                      {keywords.map((keyword, index) => (
                        <div key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold mr-2 mb-2 flex items-center">
                          {keyword}
                          <button
                            type="button"
                            onClick={() => removeKeyword(keyword)}
                            className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
                            disabled={isSubmitting || success}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Category */}
                  <div className="relative w-full mb-3">
                    <label htmlFor="category" className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      disabled={isSubmitting || success}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat, index) => (
                        <option key={index} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* File Upload */}
                  <div className="relative w-full mb-3">
                    <label htmlFor="file" className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Upload PDF <span className="text-red-500">*</span>
                    </label>
                    <div className="border-0 px-3 py-3 bg-white rounded text-sm shadow w-full">
                      <input
                        id="file"
                        type="file"
                        onChange={handleFileChange}
                        accept="application/pdf"
                        className="hidden"
                        disabled={isSubmitting || success}
                        required
                      />
                      <label
                        htmlFor="file"
                        className="cursor-pointer flex items-center justify-center w-full bg-blueGray-50 border-dashed border-2 border-blueGray-300 rounded py-6 px-4"
                      >
                        <div className="text-center">
                          <i className="fas fa-file-pdf text-2xl text-blueGray-500 mb-2"></i>
                          <p className="text-blueGray-500">
                            {file ? file.name : 'Click to upload PDF file'}
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <div className="text-center mt-6">
                    <button
                      type="submit"
                      className="bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150"
                      disabled={isSubmitting || success}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </span>
                      ) : (
                        "Submit Article"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
