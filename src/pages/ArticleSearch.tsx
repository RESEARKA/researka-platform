import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Article, getAllArticles, getArticlesByCategory, searchArticles } from '../services/mockArticles';
import { SEO } from '../components/SEO';

interface SearchFilters {
  query: string;
  category: string;
  dateRange: 'all' | 'last_week' | 'last_month' | 'last_year';
  sortBy: 'relevance' | 'date' | 'citations' | 'views';
}

export function ArticleSearch() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    dateRange: 'all',
    sortBy: 'relevance'
  });
  
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Get articles from our mock data
        const mockArticles = getAllArticles();
        setArticles(mockArticles);
        setFilteredArticles(mockArticles);
        
        // Extract unique categories and count articles per category
        const uniqueCategories = Array.from(new Set(mockArticles.map(article => article.category)));
        setCategories(uniqueCategories);
        
        // Calculate category statistics
        const stats: Record<string, number> = {};
        uniqueCategories.forEach(category => {
          stats[category] = mockArticles.filter(article => article.category === category).length;
        });
        setCategoryStats(stats);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError('Failed to load articles. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);
  
  useEffect(() => {
    applyFilters();
  }, [filters, articles]);
  
  const applyFilters = () => {
    let result = [...articles];
    
    // Apply search query filter
    if (filters.query) {
      result = searchArticles(filters.query);
    }
    
    // Apply category filter
    if (filters.category) {
      result = result.filter(article => article.category === filters.category);
    }
    
    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch (filters.dateRange) {
        case 'last_week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'last_month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'last_year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      result = result.filter(article => {
        const publishedDate = new Date(article.publishedDate);
        return publishedDate >= cutoffDate;
      });
    }
    
    // Apply sorting
    switch (filters.sortBy) {
      case 'date':
        result.sort((a, b) => 
          new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
        );
        break;
      case 'citations':
        result.sort((a, b) => b.citations - a.citations);
        break;
      case 'views':
        result.sort((a, b) => b.views - a.views);
        break;
      // For relevance, we keep the original order (assuming it's already sorted by relevance)
    }
    
    setFilteredArticles(result);
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({
      ...prev,
      query: searchQuery
    }));
  };
  
  const handleCategoryChange = (category: string) => {
    setFilters(prev => ({
      ...prev,
      category
    }));
    setShowCategoryDropdown(false);
  };
  
  const handleDateRangeChange = (range: 'all' | 'last_week' | 'last_month' | 'last_year') => {
    setFilters(prev => ({
      ...prev,
      dateRange: range
    }));
  };
  
  const handleSortChange = (sortOption: 'relevance' | 'date' | 'citations' | 'views') => {
    setFilters(prev => ({
      ...prev,
      sortBy: sortOption
    }));
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      query: '',
      category: '',
      dateRange: 'all',
      sortBy: 'relevance'
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Search Articles</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-full mb-6"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Search Articles</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <SEO 
        title="Search Academic Articles | Researka"
        description="Search and discover peer-reviewed academic articles across multiple disciplines on Researka's decentralized publishing platform."
        canonical="/search"
        ogType="website"
        ogImage="/images/article-search-og.png"
      />
      <h1 className="text-2xl font-bold mb-6">Search Articles</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3">
          <form onSubmit={handleSearchSubmit} className="mb-6">
            <div className="flex">
              <input
                type="text"
                placeholder="Search by title, keywords, or author..."
                className="flex-grow border rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md"
              >
                Search
              </button>
            </div>
          </form>
          
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="font-medium">Sort by:</div>
            <div className="flex space-x-12">
              <button
                className={`text-sm ${filters.sortBy === 'relevance' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`}
                onClick={() => handleSortChange('relevance')}
              >
                Relevance
              </button>
              <button
                className={`text-sm ${filters.sortBy === 'date' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`}
                onClick={() => handleSortChange('date')}
              >
                Date
              </button>
              <button
                className={`text-sm ${filters.sortBy === 'citations' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`}
                onClick={() => handleSortChange('citations')}
              >
                Citations
              </button>
              <button
                className={`text-sm ${filters.sortBy === 'views' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`}
                onClick={() => handleSortChange('views')}
              >
                Views
              </button>
            </div>
          </div>
          
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              className={`px-3 py-1 rounded-full text-sm ${
                filters.category === '' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              onClick={() => handleCategoryChange('')}
            >
              All Categories
            </button>
            {categories.slice(0, 5).map((category) => (
              <button
                key={category}
                className={`px-3 py-1 rounded-full text-sm ${
                  filters.category === category 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
                onClick={() => handleCategoryChange(category)}
              >
                {category} ({categoryStats[category] || 0})
              </button>
            ))}
            {categories.length > 5 && (
              <div className="relative">
                <button
                  className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 hover:bg-gray-200"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                >
                  More...
                </button>
                {showCategoryDropdown && (
                  <div className="absolute z-10 mt-2 w-56 bg-white rounded-md shadow-lg">
                    <div className="py-1">
                      {categories.slice(5).map((category) => (
                        <button
                          key={category}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => handleCategoryChange(category)}
                        >
                          {category} ({categoryStats[category] || 0})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mb-6">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No articles found matching your search criteria.</p>
                <button
                  onClick={clearFilters}
                  className="mt-2 text-blue-600 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Showing {filteredArticles.length} {filteredArticles.length === 1 ? 'result' : 'results'}
                  {filters.query && ` for "${filters.query}"`}
                  {filters.category && ` in ${filters.category}`}
                </p>
                
                <div className="space-y-6">
                  {filteredArticles.map((article) => (
                    <div key={article.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <Link 
                        to={`/articles/${article.id}`}
                        className="text-lg font-medium text-blue-600 hover:text-blue-800"
                      >
                        {article.title}
                      </Link>
                      
                      <p className="text-sm text-gray-600 mt-1">
                        {article.authors.map(a => a.name).join(', ')}
                      </p>
                      
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="text-sm text-gray-500">
                          Published: {article.publishedDate}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span 
                          className="text-sm bg-blue-50 text-blue-700 px-2 py-0.5 rounded cursor-pointer hover:bg-blue-100"
                          onClick={(e) => {
                            e.preventDefault();
                            handleCategoryChange(article.category);
                          }}
                        >
                          {article.category}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-500">
                          DOI: {article.doi}
                        </span>
                      </div>
                      
                      <p className="mt-2 text-gray-700">{article.abstract}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {article.keywords.map((keyword, index) => (
                          <span 
                            key={index} 
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded cursor-pointer hover:bg-blue-200"
                            onClick={() => {
                              setSearchQuery(keyword);
                              setFilters(prev => ({
                                ...prev,
                                query: keyword
                              }));
                            }}
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex mt-3 text-sm text-gray-600">
                        <div className="mr-4 flex items-center">
                          <svg className="w-4 h-4 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                          </svg>
                          <span className="font-medium">{article.views}</span>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z"></path>
                            <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z"></path>
                          </svg>
                          <span className="font-medium">{article.citations}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
            <h2 className="font-medium text-lg mb-4">Filters</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={filters.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category} ({categoryStats[category] || 0})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={filters.dateRange === 'all'}
                    onChange={() => handleDateRangeChange('all')}
                    className="mr-2"
                  />
                  <span className="text-sm">All Time</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={filters.dateRange === 'last_week'}
                    onChange={() => handleDateRangeChange('last_week')}
                    className="mr-2"
                  />
                  <span className="text-sm">Last Week</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={filters.dateRange === 'last_month'}
                    onChange={() => handleDateRangeChange('last_month')}
                    className="mr-2"
                  />
                  <span className="text-sm">Last Month</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={filters.dateRange === 'last_year'}
                    onChange={() => handleDateRangeChange('last_year')}
                    className="mr-2"
                  />
                  <span className="text-sm">Last Year</span>
                </label>
              </div>
            </div>
            
            {(filters.query || filters.category || filters.dateRange !== 'all' || filters.sortBy !== 'relevance') && (
              <button
                onClick={clearFilters}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
