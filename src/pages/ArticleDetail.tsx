import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDetailedArticleById } from '../services/mockArticles';
import { Article } from '../services/articleTypes';
import 'katex/dist/katex.min.css';
import { SEO } from '../components/SEO';
import { FlagButton } from '../components/FlagButton';
import { Helmet } from 'react-helmet-async';

export function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [activeTab, setActiveTab] = useState<'article' | 'reviews' | 'related' | 'references' | 'figures' | 'supplementary'>('article');
  const [showCitationDropdown, setShowCitationDropdown] = useState(false);
  const [citationCopied, setCitationCopied] = useState(false);
  const [isPdfVisible, setIsPdfVisible] = useState(false);
  const citationDropdownRef = useRef<HTMLDivElement>(null);
  
  const citationFormats = [
    { label: 'APA' },
    { label: 'MLA' },
    { label: 'Chicago' },
    { label: 'Harvard' },
    { label: 'Vancouver' },
    { label: 'IEEE' },
  ];

  useEffect(() => {
    if (id) {
      const fetchedArticle = getDetailedArticleById(id);
      if (fetchedArticle) {
        setArticle(fetchedArticle);
      }
    }
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (citationDropdownRef.current && !citationDropdownRef.current.contains(event.target as Node)) {
        setShowCitationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCite = (format: { label: string }) => {
    // In a real app, this would generate the proper citation format based on the selected format
    let citation = '';
    
    if (format.label === 'APA') {
      citation = `${article?.authors.map(a => typeof a === 'string' ? a : a.name).join(', ')} (${new Date(article?.publishedDate || '').getFullYear()}). ${article?.title}. Researka, ${article?.doi}.`;
    } else if (format.label === 'MLA') {
      citation = `${article?.authors.map(a => typeof a === 'string' ? a : a.name).join(', ')}. "${article?.title}." Researka, ${new Date(article?.publishedDate || '').getFullYear()}, ${article?.doi}.`;
    } else if (format.label === 'Chicago') {
      citation = `${article?.authors.map(a => typeof a === 'string' ? a : a.name).join(', ')}. "${article?.title}." Researka (${new Date(article?.publishedDate || '').getFullYear()}): ${article?.doi}.`;
    } else {
      citation = `${article?.authors.map(a => typeof a === 'string' ? a : a.name).join(', ')} (${new Date(article?.publishedDate || '').getFullYear()}). ${article?.title}. Researka, ${article?.doi}.`;
    }
    
    navigator.clipboard.writeText(citation);
    setCitationCopied(true);
    setTimeout(() => setCitationCopied(false), 2000);
    setShowCitationDropdown(false);
  };

  const renderArticleContent = () => {
    // This would render the actual article content
    return (
      <div className="px-6 py-6">
        <h2 className="text-xl font-semibold mb-4 text-blueGray-800">Abstract</h2>
        <p className="text-blueGray-600 leading-relaxed mb-6">{article?.abstract}</p>
        
        {/* Placeholder for actual article content */}
        <div className="prose max-w-none">
          <p>Full article content would be rendered here...</p>
        </div>
      </div>
    );
  };

  const renderMetrics = () => {
    return (
      <div className="px-6 py-6 border-t border-blueGray-200">
        <div className="flex flex-row justify-center items-center space-x-16">
          <div className="text-center">
            <span className="text-3xl font-bold block uppercase tracking-wide text-blueGray-600 mb-2">
              {article?.views || 0}
            </span>
            <span className="text-sm text-blueGray-500 px-4">Views</span>
          </div>
          <div className="text-center">
            <span className="text-3xl font-bold block uppercase tracking-wide text-blueGray-600 mb-2">
              {article?.metrics?.downloads || 0}
            </span>
            <span className="text-sm text-blueGray-500 px-4">Downloads</span>
          </div>
          <div className="text-center">
            <span className="text-3xl font-bold block uppercase tracking-wide text-blueGray-600 mb-2">
              {article?.citations || 0}
            </span>
            <span className="text-sm text-blueGray-500 px-4">Citations</span>
          </div>
        </div>
      </div>
    );
  };

  const renderStarRating = (rating: number) => {
    // This would render the actual star rating
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star, index) => (
          <svg key={index} className={`w-4 h-4 ${rating >= star ? 'text-yellow-500' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.967 0 1.71.672 1.71 1.59v3.962a1.438 1.438 0 01-2.303 1.438l-7.5-3.814A1.438 1.438 0 013.02 12V5.61c0-1.915 1.504-3.49 3.604-3.49z"></path>
          </svg>
        ))}
      </div>
    );
  };

  const renderDecisionBadge = (decision: string) => {
    // This would render the actual decision badge
    return (
      <div className={`px-2 py-1 text-xs font-bold rounded-full ${decision === 'accepted' ? 'bg-green-100 text-green-600' : decision === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
        {decision.charAt(0).toUpperCase() + decision.slice(1)}
      </div>
    );
  };

  if (!article) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-blueGray-600">Loading article...</p>
      </div>
    );
  }

  return (
    <div className="relative pt-8 pb-20 bg-blueGray-50">
      {article && (
        <>
          <SEO
            title={`${article.title} | Researka`}
            description={article.abstract.substring(0, 160)}
            canonical={`/article/${article.id}`}
            type="article"
            image={article.figures && article.figures.length > 0 ? article.figures[0].url : '/images/article-default-og.png'}
            isArticle={true}
            authors={article.authors.map(author => typeof author === 'string' ? author : author.name)}
            publicationDate={article.publishedDate}
            pdfUrl={article.pdfUrl} // Use pdfUrl property
            doi={article.doi}
            journalName="Researka"
          />
          
          {/* Schema.org structured data for ScholarlyArticle */}
          <Helmet>
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ScholarlyArticle",
                "headline": article.title,
                "author": article.authors.map(author => ({
                  "@type": "Person",
                  "name": typeof author === 'string' ? author : author.name,
                  "affiliation": typeof author === 'string' ? '' : author.institution || ""
                })),
                "datePublished": article.publishedDate,
                "dateModified": article.publishedDate,
                "description": article.abstract,
                "keywords": article.keywords.join(", "),
                "publisher": {
                  "@type": "Organization",
                  "name": "Researka",
                  "logo": {
                    "@type": "ImageObject",
                    "url": `${window.location.origin}/images/logo.png`
                  }
                },
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": `${window.location.origin}/article/${article.id}`
                },
                "isAccessibleForFree": true,
                "identifier": article.doi ? {
                  "@type": "PropertyValue",
                  "propertyID": "DOI",
                  "value": article.doi
                } : undefined
              })}
            </script>
          </Helmet>
        </>
      )}
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap">
          <div className="w-full lg:w-8/12 px-4">
            {/* Article Header */}
            <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg">
              <div className="px-6 py-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap mb-3">
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-emerald-500 mr-2">
                        {article.mainCategory}
                      </span>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blueGray-600 bg-blueGray-200">
                        {article.subCategory}
                      </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-blueGray-700 mb-3">
                      {article.title}
                    </h1>
                    <div className="text-sm text-blueGray-500 mb-4 flex flex-wrap items-center gap-2">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        {new Date(article.publishedDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="hidden md:inline">•</span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                        </svg>
                        <a href={`https://doi.org/${article.doi}`} className="text-blue-500 hover:text-blue-700" target="_blank" rel="noopener noreferrer">{article.doi}</a>
                      </span>
                    </div>
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-blueGray-600 mb-2">Authors:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {article.authors.map((author, index) => (
                          <div key={index} className="bg-gray-50 px-4 py-3 rounded-md">
                            <div className="text-center">
                              <span className="font-medium text-blueGray-700 block mb-1">{typeof author === 'string' ? author : author.name}</span>
                              {typeof author !== 'string' && author.institution && (
                                <span className="text-xs text-blueGray-500 block">{author.institution}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2">
                    <button
                      onClick={() => setIsPdfVisible(!isPdfVisible)}
                      className="bg-blue-500 text-white active:bg-blue-600 text-xs font-bold uppercase px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150 w-full flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                      </svg>
                      PDF
                    </button>
                    <div className="flex flex-row space-x-2 mt-6 items-center">
                      <button 
                        className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold uppercase px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150 flex items-center justify-center"
                        onClick={() => setShowCitationDropdown(!showCitationDropdown)}
                      >
                        CITE
                      </button>
                      <a 
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(`${window.location.origin}/article/${article.id}`)}&hashtags=research,academia`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-black hover:bg-gray-800 text-white text-xs font-bold uppercase px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150 flex items-center justify-center"
                        aria-label="Share on Twitter (X)"
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                        </svg>
                        X
                      </a>
                      
                      <a 
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${window.location.origin}/article/${article.id}`)}&summary=${encodeURIComponent(article.abstract.substring(0, 100) + '...')}&title=${encodeURIComponent(article.title)}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-[#0077B5] hover:bg-[#005e8c] text-white text-xs font-bold uppercase px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150 flex items-center justify-center"
                        aria-label="Share on LinkedIn"
                      >
                        LINKEDIN
                      </a>

                      <button
                        onClick={() => {
                          const flagButton = document.getElementById('flag-button-container');
                          if (flagButton) {
                            const actualButton = flagButton.querySelector('button');
                            if (actualButton) {
                              actualButton.click();
                            }
                          }
                        }}
                        className="text-red-500 hover:text-red-700 flex items-center justify-center"
                        aria-label="Flag article"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                        </svg>
                      </button>
                      
                      {showCitationDropdown && (
                        <div 
                          ref={citationDropdownRef} 
                          className="absolute mt-10 left-4 bg-white shadow-md rounded-lg p-4 w-64 z-10"
                        >
                          <h4 className="text-lg font-semibold mb-2">Citation Styles</h4>
                          <ul>
                            {citationFormats.map((format, index) => (
                              <li key={index} className="py-2">
                                <button 
                                  className="text-blue-500 hover:text-blue-700"
                                  onClick={() => handleCite(format)}
                                >
                                  {format.label}
                                </button>
                              </li>
                            ))}
                          </ul>
                          {citationCopied && (
                            <p className="text-sm text-blue-500 mt-2">Citation copied to clipboard!</p>
                          )}
                        </div>
                      )}
                      
                      <div id="flag-button-container" className="hidden">
                        <FlagButton 
                          articleId={article.id} 
                          userId="user-123"
                          className=""
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tabs for Article, Reviews, Related */}
            <div className="border-b mb-6 overflow-x-auto">
              <div className="flex whitespace-nowrap">
                <button
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'article'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('article')}
                >
                  Article
                </button>
                <button
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'reviews'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Reviews ({article.reviews?.length || 0})
                </button>
                <button
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'related'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('related')}
                >
                  Related
                </button>
                <button
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'references'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('references')}
                >
                  References
                </button>
                <button
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'figures'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('figures')}
                >
                  Figures
                </button>
                <button
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'supplementary'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('supplementary')}
                >
                  Supplementary
                </button>
              </div>
            </div>
            
            {/* Tab Content */}
            {activeTab === 'article' && (
              <>
                {/* Article Content */}
                {renderArticleContent()}
                
                {/* Metrics */}
                {renderMetrics()}
                
                {isPdfVisible ? (
                  <div className="mb-6 px-6">
                    <div className="relative pt-[56.25%] bg-gray-100 rounded">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-gray-500">PDF Viewer would be embedded here</p>
                      </div>
                    </div>
                    <button 
                      className="mt-4 text-blue-600 hover:text-blue-800"
                      onClick={() => setIsPdfVisible(false)}
                    >
                      Hide PDF
                    </button>
                  </div>
                ) : (
                  <div className="text-center mb-6 px-6">
                    <button 
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => setIsPdfVisible(true)}
                    >
                      View PDF
                    </button>
                  </div>
                )}
              </>
            )}
            
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4 text-blueGray-800 border-b pb-2">Peer Reviews</h2>
                
                {!article.reviews || article.reviews.length === 0 ? (
                  <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <p className="text-gray-600">No reviews available for this article.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {article.reviews.map((review: any) => (
                      <div key={review.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="bg-gray-50 p-4 border-b">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                            <div>
                              <p className="font-medium text-blueGray-800">{review.reviewerName}</p>
                              <p className="text-sm text-gray-600">Reviewed on: {review.date}</p>
                            </div>
                            <div className="flex flex-col items-start sm:items-end gap-1">
                              {renderStarRating(review.rating)}
                              <div>
                                {renderDecisionBadge(review.decision)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-gray-700 whitespace-pre-line">{review.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'related' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4 text-blueGray-800 border-b pb-2">Related Articles</h2>
                
                {!article.relatedArticles || article.relatedArticles.length === 0 ? (
                  <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <p className="text-gray-600">No related articles found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {article.relatedArticles.map((relatedArticle: Article) => (
                      <div key={relatedArticle.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                        <Link 
                          to={`/articles/${relatedArticle.id}`}
                          className="font-medium text-blue-600 hover:text-blue-800 block mb-2"
                        >
                          {relatedArticle.title}
                        </Link>
                        <p className="text-sm text-gray-600 mb-2">
                          {relatedArticle.authors.map(author => typeof author === 'string' ? author : author.name).join(', ')}
                        </p>
                        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                          <span>{new Date(relatedArticle.publishedDate).toLocaleDateString()}</span>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                              </svg>
                              {relatedArticle.views}
                            </span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                              </svg>
                              {relatedArticle.citations}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'references' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4 text-blueGray-800 border-b pb-2">References</h2>
                
                {!article.references || article.references.length === 0 ? (
                  <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <p className="text-gray-600">No references found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {article.references.map((reference: any, index: number) => (
                      <div key={reference.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="flex items-start">
                          <div className="bg-gray-100 text-gray-700 font-medium rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-blueGray-800 mb-1">{reference.title}</p>
                            <p className="text-sm text-gray-600 mb-1">{reference.authors.join(', ')}</p>
                            <div className="flex flex-wrap gap-x-4 text-sm text-gray-600">
                              {reference.journal && <span>{reference.journal}</span>}
                              <span>{reference.year}</span>
                              {reference.doi && (
                                <a 
                                  href={`https://doi.org/${reference.doi}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  DOI: {reference.doi}
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'figures' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4 text-blueGray-800 border-b pb-2">Figures</h2>
                
                {!article.figures || article.figures.length === 0 ? (
                  <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <p className="text-gray-600">No figures found.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {article.figures.map((figure: any) => (
                      <div key={figure.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b">
                          <h3 className="font-medium text-blueGray-700">{figure.id.toUpperCase()}</h3>
                        </div>
                        <div className="p-4">
                          <div className="article-content flex justify-center">
                            <img 
                              src={figure.url} 
                              alt={figure.altText} 
                              className="max-w-full h-auto rounded-md shadow-sm"
                            />
                          </div>
                          <p className="text-sm text-gray-600 mt-4 text-center">{figure.caption}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'supplementary' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4 text-blueGray-800 border-b pb-2">Supplementary Materials</h2>
                
                {!article.supplementaryMaterials || article.supplementaryMaterials.length === 0 ? (
                  <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <p className="text-gray-600">No supplementary materials found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {article.supplementaryMaterials.map((material: any) => (
                      <div key={material.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="flex flex-col sm:flex-row">
                          <div className="bg-gray-100 text-gray-700 font-medium rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                            {material.id}
                          </div>
                          <div>
                            <p className="font-medium text-blueGray-800 mb-1">{material.title}</p>
                            <p className="text-sm text-gray-600 mb-1">{material.description}</p>
                            <div className="flex flex-wrap gap-x-4 text-sm text-gray-600">
                              <span>{material.fileType}</span>
                              <span>{material.size}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div className="flex justify-between items-center pt-4 border-t">
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                onClick={() => alert('Download functionality will be implemented in the future')}
              >
                Download PDF
              </button>
            </div>
          </div>
          <div className="w-full lg:w-4/12 px-4">
            <div className="sticky top-24">
              {/* Sidebar Content */}
              <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg p-6">
                
                <div className="mb-4">
                  <h4 className="text-lg font-semibold mb-2">Article Information</h4>
                  <div className="text-sm text-gray-600">
                    <p className="mb-1"><span className="font-medium">DOI:</span> {article.doi}</p>
                    <p className="mb-1"><span className="font-medium">Published:</span> {new Date(article.publishedDate).toLocaleDateString()}</p>
                    <p className="mb-1"><span className="font-medium">Category:</span> {article.mainCategory || article.category}</p>
                    {article.subCategory && (
                      <p className="mb-1"><span className="font-medium">Subcategory:</span> {article.subCategory}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
