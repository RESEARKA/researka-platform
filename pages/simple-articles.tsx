import React, { useState, useEffect } from 'react';

const SimpleArticlesPage: React.FC = () => {
  // Sample data
  const [articles, setArticles] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  // Items per page
  const ITEMS_PER_PAGE = 5;
  
  // Load sample data
  useEffect(() => {
    // Create 20 sample articles
    const sampleArticles = Array.from({ length: 20 }, (_, i) => ({
      id: `article-${i + 1}`,
      title: `Sample Article ${i + 1}`,
      content: `This is the content for sample article ${i + 1}.`,
      date: new Date(2025, 0, i + 1).toLocaleDateString()
    }));
    
    setArticles(sampleArticles);
    setIsLoading(false);
  }, []);
  
  // Calculate pagination
  const totalPages = Math.ceil(articles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentArticles = articles.slice(startIndex, endIndex);
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Simple Articles Page</h1>
      <p>A minimal implementation of pagination</p>
      
      {/* Debug info */}
      <div style={{ 
        background: '#f0f8ff', 
        padding: '10px', 
        borderRadius: '5px', 
        marginBottom: '20px' 
      }}>
        <p><strong>Page {currentPage} of {totalPages}</strong> | Showing {currentArticles.length} of {articles.length} articles</p>
      </div>
      
      {/* Articles list */}
      {isLoading ? (
        <p>Loading articles...</p>
      ) : (
        <div>
          {currentArticles.map(article => (
            <div key={article.id} style={{ 
              border: '1px solid #ddd', 
              borderRadius: '5px', 
              padding: '15px', 
              marginBottom: '15px' 
            }}>
              <h2>{article.title}</h2>
              <p style={{ color: '#666' }}>{article.date}</p>
              <p>{article.content}</p>
            </div>
          ))}
        </div>
      )}
      
      {/* Pagination controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '10px', 
        marginTop: '30px' 
      }}>
        <button 
          onClick={() => handlePageChange(currentPage - 1)} 
          disabled={currentPage === 1}
          style={{ 
            padding: '8px 16px', 
            border: '1px solid #ddd', 
            borderRadius: '5px', 
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 ? 0.5 : 1
          }}
        >
          Previous
        </button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button 
            key={`page-${page}`} 
            onClick={() => handlePageChange(page)}
            style={{ 
              padding: '8px 16px', 
              border: '1px solid #ddd', 
              borderRadius: '5px', 
              backgroundColor: currentPage === page ? '#007bff' : 'white',
              color: currentPage === page ? 'white' : 'black',
              cursor: 'pointer'
            }}
          >
            {page}
          </button>
        ))}
        
        <button 
          onClick={() => handlePageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
          style={{ 
            padding: '8px 16px', 
            border: '1px solid #ddd', 
            borderRadius: '5px', 
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage === totalPages ? 0.5 : 1
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SimpleArticlesPage;
