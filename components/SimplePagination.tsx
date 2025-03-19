import React from 'react';

interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const SimplePagination: React.FC<SimplePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  // Styles for the pagination component
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
      margin: '20px 0',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    button: {
      padding: '8px 16px',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      backgroundColor: '#fff',
      color: '#3182ce',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 500,
      transition: 'all 0.2s ease',
      outline: 'none',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
    },
    activeButton: {
      padding: '8px 16px',
      border: '1px solid #3182ce',
      borderRadius: '6px',
      backgroundColor: '#3182ce',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 600,
      transition: 'all 0.2s ease',
      outline: 'none',
      boxShadow: '0 2px 4px rgba(49, 130, 206, 0.2)'
    },
    disabledButton: {
      padding: '8px 16px',
      border: '1px solid #edf2f7',
      borderRadius: '6px',
      backgroundColor: '#f7fafc',
      color: '#a0aec0',
      cursor: 'not-allowed',
      fontSize: '14px',
      fontWeight: 500,
      transition: 'all 0.2s ease',
      outline: 'none'
    },
    navButton: {
      padding: '8px 16px',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      backgroundColor: '#f8fafc',
      color: '#4a5568',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 500,
      transition: 'all 0.2s ease',
      outline: 'none',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    disabledNavButton: {
      padding: '8px 16px',
      border: '1px solid #edf2f7',
      borderRadius: '6px',
      backgroundColor: '#f7fafc',
      color: '#a0aec0',
      cursor: 'not-allowed',
      fontSize: '14px',
      fontWeight: 500,
      transition: 'all 0.2s ease',
      outline: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  // Get visible page numbers (show 5 pages at most)
  const getVisiblePageNumbers = () => {
    const delta = 2; // Number of pages to show before and after current page
    const range = [];
    const rangeWithDots = [];
    let l;
    
    // Calculate range
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }
    
    // Always include first page
    if (range.length > 0) {
      // Add first page
      rangeWithDots.push(1);
      
      // Add dots if needed
      if (range[0] > 2) {
        rangeWithDots.push('...');
      }
      
      // Add range
      for (const i of range) {
        rangeWithDots.push(i);
      }
      
      // Add dots if needed
      if (range[range.length - 1] < totalPages - 1) {
        rangeWithDots.push('...');
      }
      
      // Add last page if not already included
      if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }
    } else {
      // Only one page
      rangeWithDots.push(1);
    }
    
    return rangeWithDots;
  };

  // If there's only one page, don't show pagination
  if (totalPages <= 1) return null;

  return (
    <div style={styles.container}>
      {/* Previous button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={currentPage === 1 ? styles.disabledNavButton : styles.navButton}
        aria-label="Previous page"
      >
        <span aria-hidden="true">←</span> Prev
      </button>

      {/* Page numbers with ellipsis for many pages */}
      {getVisiblePageNumbers().map((page, index) => {
        if (page === '...') {
          return (
            <span key={`ellipsis-${index}`} style={{ color: '#718096' }}>
              …
            </span>
          );
        }
        
        return (
          <button
            key={`page-${page}`}
            onClick={() => handlePageChange(page as number)}
            style={currentPage === page ? styles.activeButton : styles.button}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}

      {/* Next button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={currentPage === totalPages ? styles.disabledNavButton : styles.navButton}
        aria-label="Next page"
      >
        Next <span aria-hidden="true">→</span>
      </button>
    </div>
  );
};

export default SimplePagination;
