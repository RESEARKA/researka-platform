import React from 'react';

interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

const SimplePagination: React.FC<SimplePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPrevPage
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
    if (page < 1 || (totalPages > 0 && page > totalPages)) return;
    onPageChange(page);
  };

  // Get visible page numbers (show 5 pages at most)
  const getVisiblePages = () => {
    const visiblePages = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // Adjust start page if needed
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      visiblePages.push(i);
    }
    
    return visiblePages;
  };

  // Determine if we can go to next/prev page based on the props
  const canGoPrev = hasPrevPage !== undefined ? hasPrevPage : currentPage > 1;
  const canGoNext = hasNextPage !== undefined ? hasNextPage : currentPage < totalPages;

  return (
    <div style={styles.container}>
      {/* Previous Page Button */}
      <button
        style={canGoPrev ? styles.navButton : styles.disabledNavButton}
        onClick={() => canGoPrev && handlePageChange(currentPage - 1)}
        disabled={!canGoPrev}
        aria-label="Previous page"
      >
        &laquo; Prev
      </button>
      
      {/* Current page indicator */}
      <span style={{ padding: '8px 12px' }}>
        Page {currentPage}{totalPages > 0 ? ` of ${totalPages}` : ''}
      </span>
      
      {/* Next Page Button */}
      <button
        style={canGoNext ? styles.navButton : styles.disabledNavButton}
        onClick={() => canGoNext && handlePageChange(currentPage + 1)}
        disabled={!canGoNext}
        aria-label="Next page"
      >
        Next &raquo;
      </button>
    </div>
  );
};

export default SimplePagination;
