import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as mockArticles from '../services/mockArticles';
import { Article } from '../services/articleTypes';
import { SEO } from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';

export function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Author stats
  const [authorStats, setAuthorStats] = useState({
    totalPublications: 0,
    totalCitations: 0,
    totalViews: 0,
    hIndex: 0,
    pendingReviews: 0
  });

  // Author's recent submissions
  const [authorSubmissions, setAuthorSubmissions] = useState<Article[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 7;
  const [goToPage, setGoToPage] = useState('');

  useEffect(() => {
    // Fetch articles
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const allArticles = await mockArticles.getAllArticles();
        setArticles(allArticles);
        setFilteredArticles(allArticles);

        // Simulate author's submissions (in a real app, this would be filtered by author ID)
        if (user) {
          // For demo purposes, just take the first 3 articles as the author's
          const authorArticles = allArticles.slice(0, 3);
          setAuthorSubmissions(authorArticles);
          
          // Calculate author stats
          setAuthorStats({
            totalPublications: authorArticles.length,
            totalCitations: authorArticles.reduce((sum, article) => sum + article.citations, 0),
            totalViews: authorArticles.reduce((sum, article) => sum + article.views, 0),
            hIndex: 3, // Mocked h-index
            pendingReviews: 2 // Mocked pending reviews
          });
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [user]);

  // Filter articles by category
  const filterByCategory = (category: string | null) => {
    setActiveCategory(category);
    setCurrentPage(1); // Reset to first page when changing category
    
    if (!category) {
      setFilteredArticles(articles);
      return;
    }

    const filtered = articles.filter(article => 
      article.mainCategory === category || article.subCategory === category
    );
    setFilteredArticles(filtered);
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
    
    if (!query) {
      filterByCategory(activeCategory);
      return;
    }

    let filtered = [...articles];
    if (activeCategory) {
      filtered = filtered.filter(article => 
        article.mainCategory === activeCategory || article.subCategory === activeCategory
      );
    }
    
    filtered = filtered.filter(article => {
      const searchLowerCase = query.toLowerCase();
      const titleMatch = article.title.toLowerCase().includes(searchLowerCase);
      const abstractMatch = article.abstract.toLowerCase().includes(searchLowerCase);
      const authorMatch = article.authors.some(author => 
        typeof author === 'object' && author.name && author.name.toLowerCase().includes(searchLowerCase)
      );
      
      return titleMatch || abstractMatch || authorMatch;
    });
    
    setFilteredArticles(filtered);
  };

  // Reset filters
  const resetFilters = () => {
    setActiveCategory(null);
    setSearchQuery('');
    setCurrentPage(1); // Reset to first page when clearing filters
    setFilteredArticles(articles);
  };

  // Get unique categories
  const getUniqueCategories = () => {
    const mainCategories = [...new Set(articles.map(article => article.mainCategory))];
    const subCategories = [...new Set(articles.map(article => article.subCategory).filter(Boolean))];
    return [...mainCategories, ...subCategories].filter((value, index, self) => 
      value !== undefined && self.indexOf(value) === index
    ) as string[];
  };

  // Check if a category is a main category
  const isMainCategory = (category: string) => {
    return articles.some(article => article.mainCategory === category);
  };

  // Get current articles for pagination
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  // Go to previous page
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Go to next page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle go to page input
  const handleGoToPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGoToPage(e.target.value);
  };

  const handleGoToPageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNumber = parseInt(goToPage);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      setGoToPage('');
    }
  };

  // Generate page numbers for pagination with ellipses
  const getPageNumbers = () => {
    const pageNumbers = [];
    const siblingCount = 1; // Number of siblings on each side of current page
    const boundaryCount = 1; // Number of boundary pages at start and end
    
    // Always show first page
    if (boundaryCount >= 1) {
      for (let i = 1; i <= Math.min(boundaryCount, totalPages); i++) {
        pageNumbers.push(i);
      }
    }
    
    // Calculate start and end of sibling range
    const startSiblings = Math.max(
      boundaryCount + 1,
      currentPage - siblingCount
    );
    const endSiblings = Math.min(
      totalPages - boundaryCount,
      currentPage + siblingCount
    );
    
    // Add ellipsis before siblings if needed
    if (startSiblings > boundaryCount + 1) {
      pageNumbers.push(-1); // -1 represents ellipsis
    }
    
    // Add siblings
    for (let i = startSiblings; i <= endSiblings; i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis after siblings if needed
    if (endSiblings < totalPages - boundaryCount) {
      pageNumbers.push(-2); // -2 represents ellipsis (using different value to ensure unique keys)
    }
    
    // Always show last page
    if (boundaryCount >= 1 && totalPages > boundaryCount) {
      for (let i = Math.max(boundaryCount + 1, totalPages - boundaryCount + 1); i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  return (
    <>
      <SEO 
        title="Researka - Latest Academic Research"
        description="Explore the latest peer-reviewed academic articles on Researka, a decentralized publishing platform for researchers and academics."
        canonical="/"
      />
      <section className="header relative pt-4 items-center flex">
        <div className="container mx-auto">
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg">
            <div className="px-6">
              <div className="flex flex-wrap justify-center">
                <div className="w-full lg:w-8/12 px-4 lg:order-1">
                  <div className="py-6 px-3 mt-6">
                    <h3 className="text-2xl font-semibold leading-normal mb-2 text-blueGray-700">
                      Decentralizing Academic Research
                    </h3>
                  </div>
                </div>
                <div className="w-full lg:w-4/12 px-4 lg:order-2">
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="search">
                      Search Articles
                    </label>
                    <input
                      type="text"
                      id="search"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Search by title, abstract, or author..."
                      value={searchQuery}
                      onChange={handleSearch}
                    />
                  </div>
                </div>
              </div>
              
              {/* Category filters */}
              <div className="mt-2 py-6 border-t border-blueGray-200 text-center">
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  <button
                    onClick={() => filterByCategory(null)}
                    className={`px-4 py-2 text-xs font-bold uppercase rounded ${
                      activeCategory === null
                        ? 'bg-lightBlue-500 text-white active:bg-lightBlue-600'
                        : 'bg-blueGray-200 text-blueGray-700 hover:bg-blueGray-300'
                    } shadow hover:shadow-lg outline-none focus:outline-none transition-all duration-150 ease-linear`}
                  >
                    All
                  </button>
                  
                  {getUniqueCategories().map((category) => (
                    <button
                      key={category}
                      onClick={() => filterByCategory(category)}
                      className={`px-4 py-2 text-xs font-bold uppercase rounded ${
                        activeCategory === category
                          ? 'bg-lightBlue-500 text-white active:bg-lightBlue-600'
                          : isMainCategory(category)
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                            : 'bg-blueGray-200 text-blueGray-700 hover:bg-blueGray-300'
                      } shadow hover:shadow-lg outline-none focus:outline-none transition-all duration-150 ease-linear`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Author stats section */}
          {isAuthenticated && user && (
            <div className="flex flex-col items-center justify-center py-8">
              <h2 className="text-3xl font-bold text-blueGray-700 mb-4">Your Author Stats</h2>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-blueGray-700 mb-2">Total Publications</h3>
                  <p className="text-lg text-blueGray-500">{authorStats.totalPublications}</p>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-blueGray-700 mb-2">Total Citations</h3>
                  <p className="text-lg text-blueGray-500">{authorStats.totalCitations}</p>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-blueGray-700 mb-2">Total Views</h3>
                  <p className="text-lg text-blueGray-500">{authorStats.totalViews}</p>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-blueGray-700 mb-2">h-Index</h3>
                  <p className="text-lg text-blueGray-500">{authorStats.hIndex}</p>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-blueGray-700 mb-2">Pending Reviews</h3>
                  <p className="text-lg text-blueGray-500">{authorStats.pendingReviews}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Author's recent submissions section */}
          {isAuthenticated && user && authorSubmissions.length > 0 && (
            <div className="flex flex-col items-center justify-center py-8">
              <h2 className="text-3xl font-bold text-blueGray-700 mb-4">Your Recent Submissions</h2>
              <div className="flex flex-wrap justify-center gap-4">
                {authorSubmissions.map((article) => (
                  <div key={article.id} className="w-full md:w-6/12 lg:w-4/12 px-4 mb-8">
                    <div className="relative flex flex-col min-w-0 break-words bg-white rounded-lg shadow-lg">
                      <div className="px-6 py-6 flex-auto">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-lightBlue-600 bg-lightBlue-200 last:mr-0 mr-2">
                            {article.subCategory}
                          </span>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-emerald-500 last:mr-0">
                            {article.mainCategory}
                          </span>
                        </div>
                        
                        <h4 className="text-xl font-bold text-blueGray-700">
                          {article.title}
                        </h4>
                        
                        <div className="mt-2 text-sm text-blueGray-500">
                          {article.authors.map(author => typeof author === 'object' ? author.name : author).join(', ')}
                        </div>
                        
                        <p className="mt-3 mb-4 text-blueGray-500 line-clamp-3">
                          {article.abstract}
                        </p>
                        
                        {/* Article metadata section */}
                        <div className="mt-4 border-t border-blueGray-200 pt-4 flex justify-between items-center">
                          {/* Date on the left */}
                          <div className="text-sm text-blueGray-500">
                            <i className="far fa-calendar-alt mr-1"></i>
                            <time dateTime={article.publishedDate}>
                              {new Date(article.publishedDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </time>
                          </div>
                          
                          {/* Stats on the right */}
                          <div className="flex gap-4 text-sm text-blueGray-500">
                            <div className="flex items-center">
                              <i className="far fa-eye mr-1"></i>
                              <span>{article.views}</span>
                            </div>
                            <div className="flex items-center">
                              <i className="fas fa-quote-right mr-1"></i>
                              <span>{article.citations}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 text-center">
                          <Link 
                            to={`/articles/${article.id}`}
                            className="inline-flex items-center px-4 py-2 text-xs font-bold uppercase bg-lightBlue-500 text-white rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                          >
                            <i className="fas fa-book-open mr-2"></i> Read Article
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Quick actions section */}
          {isAuthenticated && user && (
            <div className="flex flex-col items-center justify-center py-8">
              <h2 className="text-3xl font-bold text-blueGray-700 mb-4">Quick Actions</h2>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                <Link 
                  to="/submit"
                  className="bg-emerald-500 text-white active:bg-emerald-600 text-xs font-bold uppercase px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
                >
                  <i className="fas fa-paper-plane mr-2"></i> Submit New Article
                </Link>
                <Link 
                  to="/profile"
                  className="bg-lightBlue-500 text-white active:bg-lightBlue-600 text-xs font-bold uppercase px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
                >
                  <i className="fas fa-user mr-2"></i> View Your Profile
                </Link>
                <Link 
                  to="/review-dashboard"
                  className="bg-orange-500 text-white active:bg-orange-600 text-xs font-bold uppercase px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
                >
                  <i className="fas fa-tasks mr-2"></i> Review Dashboard
                </Link>
              </div>
            </div>
          )}
          
          {/* Article Cards */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lightBlue-500"></div>
            </div>
          ) : filteredArticles.length > 0 ? (
            <>
              <div className="flex flex-wrap -mx-4">
                {currentArticles.map((article) => (
                  <div key={article.id} className="w-full md:w-6/12 lg:w-4/12 px-4 mb-8">
                    <div className="relative flex flex-col min-w-0 break-words bg-white rounded-lg shadow-lg">
                      <div className="px-6 py-6 flex-auto">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-lightBlue-600 bg-lightBlue-200 last:mr-0 mr-2">
                            {article.subCategory}
                          </span>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-emerald-500 last:mr-0">
                            {article.mainCategory}
                          </span>
                        </div>
                        
                        <h4 className="text-xl font-bold text-blueGray-700">
                          {article.title}
                        </h4>
                        
                        <div className="mt-2 text-sm text-blueGray-500">
                          {article.authors.map(author => typeof author === 'object' ? author.name : author).join(', ')}
                        </div>
                        
                        <p className="mt-3 mb-4 text-blueGray-500 line-clamp-3">
                          {article.abstract}
                        </p>
                        
                        {/* Article metadata section */}
                        <div className="mt-4 border-t border-blueGray-200 pt-4 flex justify-between items-center">
                          {/* Date on the left */}
                          <div className="text-sm text-blueGray-500">
                            <i className="far fa-calendar-alt mr-1"></i>
                            <time dateTime={article.publishedDate}>
                              {new Date(article.publishedDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </time>
                          </div>
                          
                          {/* Stats on the right */}
                          <div className="flex gap-4 text-sm text-blueGray-500">
                            <div className="flex items-center">
                              <i className="far fa-eye mr-1"></i>
                              <span>{article.views}</span>
                            </div>
                            <div className="flex items-center">
                              <i className="fas fa-quote-right mr-1"></i>
                              <span>{article.citations}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 text-center">
                          <Link 
                            to={`/articles/${article.id}`}
                            className="inline-flex items-center px-4 py-2 text-xs font-bold uppercase bg-lightBlue-500 text-white rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                          >
                            <i className="fas fa-book-open mr-2"></i> Read Article
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col md:flex-row justify-center items-center py-8 gap-4">
                  <nav className="block">
                    <ul className="flex flex-wrap pl-0 rounded list-none items-center">
                      {/* Previous button */}
                      <li>
                        <button
                          onClick={goToPreviousPage}
                          disabled={currentPage === 1}
                          className={`first:ml-0 text-xs font-semibold flex h-8 mx-1 px-3 items-center justify-center leading-tight relative border border-solid rounded-md ${
                            currentPage === 1
                              ? 'bg-blueGray-200 text-blueGray-500 border-blueGray-200 cursor-not-allowed'
                              : 'bg-white text-blueGray-500 border-blueGray-300 hover:bg-blueGray-100'
                          }`}
                        >
                          <i className="fas fa-chevron-left mr-1"></i> Prev
                        </button>
                      </li>
                      
                      {/* Page numbers with ellipses */}
                      {getPageNumbers().map((pageNumber, index) => {
                        // Render ellipsis
                        if (pageNumber < 0) {
                          return (
                            <li key={`ellipsis-${pageNumber}`} className="mx-1">
                              <span className="text-blueGray-500">...</span>
                            </li>
                          );
                        }
                        
                        // Render page number
                        return (
                          <li key={index}>
                            <button
                              onClick={() => paginate(pageNumber)}
                              className={`first:ml-0 text-xs font-semibold flex w-8 h-8 mx-1 p-0 rounded-full items-center justify-center leading-tight relative border border-solid ${
                                currentPage === pageNumber
                                  ? 'bg-lightBlue-500 text-white border-lightBlue-500'
                                  : 'bg-white text-blueGray-500 border-blueGray-300 hover:bg-blueGray-100'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          </li>
                        );
                      })}
                      
                      {/* Next button */}
                      <li>
                        <button
                          onClick={goToNextPage}
                          disabled={currentPage === totalPages}
                          className={`first:ml-0 text-xs font-semibold flex h-8 mx-1 px-3 items-center justify-center leading-tight relative border border-solid rounded-md ${
                            currentPage === totalPages
                              ? 'bg-blueGray-200 text-blueGray-500 border-blueGray-200 cursor-not-allowed'
                              : 'bg-white text-blueGray-500 border-blueGray-300 hover:bg-blueGray-100'
                          }`}
                        >
                          Next <i className="fas fa-chevron-right ml-1"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                  
                  {/* Go to page form */}
                  <form onSubmit={handleGoToPageSubmit} className="flex items-center">
                    <span className="text-xs text-blueGray-500 mr-2">Go to page:</span>
                    <input
                      type="number"
                      min="1"
                      max={totalPages}
                      value={goToPage}
                      onChange={handleGoToPageChange}
                      className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-xs shadow focus:outline-none focus:ring w-16 ease-linear transition-all duration-150 mr-2"
                    />
                    <button
                      type="submit"
                      className="bg-lightBlue-500 text-white active:bg-lightBlue-600 text-xs font-bold uppercase px-3 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
                    >
                      Go
                    </button>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-lg text-blueGray-700 mb-4">No articles found matching your criteria.</div>
              <button
                onClick={resetFilters}
                className="bg-lightBlue-500 text-white active:bg-lightBlue-600 text-xs font-bold uppercase px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
