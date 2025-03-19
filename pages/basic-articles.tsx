import React, { useState, useEffect, useMemo } from 'react';

// Basic article type
interface BasicArticle {
  id: string;
  title: string;
  content: string;
  date: string;
}

export default function BasicArticlesPage() {
  // Core state
  const [currentPage, setCurrentPage] = useState(1);
  const [articles, setArticles] = useState<BasicArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Constants
  const ARTICLES_PER_PAGE = 5;
  
  // Load mock articles
  useEffect(() => {
    console.log('Loading articles...');
    
    // Create 20 sample articles
    const mockArticles = Array.from({ length: 20 }, (_, i) => ({
      id: `article-${i + 1}`,
      title: `Article ${i + 1}`,
      content: `This is the content for article ${i + 1}. It contains some sample text.`,
      date: new Date(2025, 0, i + 1).toLocaleDateString()
    }));
    
    setArticles(mockArticles);
    setIsLoading(false);
    console.log('Articles loaded:', mockArticles.length);
  }, []);
  
  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(articles.length / ARTICLES_PER_PAGE));
  }, [articles.length]);
  
  // Get current page articles
  const displayedArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
    const endIndex = Math.min(startIndex + ARTICLES_PER_PAGE, articles.length);
    return articles.slice(startIndex, endIndex);
  }, [articles, currentPage]);
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    console.log('Changing to page:', newPage);
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };
  
  // Basic styles
  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    },
    heading: {
      fontSize: '24px',
      marginBottom: '20px'
    },
    debug: {
      background: '#f0f8ff',
      padding: '10px',
      borderRadius: '5px',
      marginBottom: '20px'
    },
    article: {
      border: '1px solid #ddd',
      borderRadius: '5px',
      padding: '15px',
      marginBottom: '15px'
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
      marginTop: '30px'
    },
    button: {
      padding: '8px 16px',
      border: '1px solid #ddd',
      borderRadius: '5px',
      cursor: 'pointer',
      background: 'white'
    },
    activeButton: {
      padding: '8px 16px',
      border: '1px solid #0066cc',
      borderRadius: '5px',
      cursor: 'pointer',
      background: '#0066cc',
      color: 'white'
    },
    disabledButton: {
      padding: '8px 16px',
      border: '1px solid #ddd',
      borderRadius: '5px',
      cursor: 'not-allowed',
      opacity: 0.5,
      background: 'white'
    }
  };
  
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Basic Articles Page</h1>
      
      {/* Debug info */}
      <div style={styles.debug}>
        <p><strong>Page {currentPage} of {totalPages}</strong> | Showing {displayedArticles.length} of {articles.length} articles</p>
      </div>
      
      {/* Articles list */}
      {isLoading ? (
        <p>Loading articles...</p>
      ) : (
        <div>
          {displayedArticles.map(article => (
            <div key={article.id} style={styles.article}>
              <h2>{article.title}</h2>
              <p style={{ color: '#666' }}>{article.date}</p>
              <p>{article.content}</p>
            </div>
          ))}
        </div>
      )}
      
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          {/* Previous button */}
          <button 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1}
            style={currentPage === 1 ? styles.disabledButton : styles.button}
          >
            Previous
          </button>
          
          {/* Page buttons */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button 
              key={`page-${page}`} 
              onClick={() => handlePageChange(page)}
              style={currentPage === page ? styles.activeButton : styles.button}
            >
              {page}
            </button>
          ))}
          
          {/* Next button */}
          <button 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
            style={currentPage === totalPages ? styles.disabledButton : styles.button}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
