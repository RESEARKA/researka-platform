'use client';

import { useState, useEffect } from 'react';
import { getAllArticles, Article } from '../../services/articleService';
import { createLogger, LogCategory } from '../../utils/logger';

const logger = createLogger('ArticleTestComponent');

export default function ArticleTestComponent() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticles() {
      try {
        logger.info('Fetching articles for test component', {
          category: LogCategory.UI
        });
        
        setLoading(true);
        const fetchedArticles = await getAllArticles();
        
        logger.info('Articles fetched successfully', {
          context: { count: fetchedArticles.length },
          category: LogCategory.UI
        });
        
        setArticles(fetchedArticles);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        
        logger.error('Error fetching articles', {
          context: { error: err },
          category: LogCategory.ERROR
        });
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-sm">
      <h1 className="text-3xl font-bold text-green-700 mb-6">RESEARKA Articles</h1>
      
      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Error loading articles</p>
          <p>{error}</p>
        </div>
      )}
      
      {!loading && articles.length === 0 && !error && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          <p>No articles found. Try publishing some articles first.</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <div 
            key={article.id} 
            className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 bg-white"
          >
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2 text-green-700">{article.title}</h2>
              <p className="text-sm text-gray-500 mb-2">
                By {article.author} • {new Date(article.date).toLocaleDateString()}
              </p>
              <p className="text-gray-700 mb-4 line-clamp-3">{article.abstract}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {article.keywords.map((keyword, index) => (
                  <span 
                    key={index} 
                    className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {article.category}
                </span>
                <span className="bg-green-700 text-white text-xs px-2 py-1 rounded">
                  {article.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
