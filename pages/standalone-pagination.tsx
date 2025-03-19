import React, { useState } from 'react';

// Minimal standalone pagination page that doesn't rely on any external components
export default function StandalonePagination() {
  // Generate sample data
  const generateData = () => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      title: `Item ${i + 1}`,
      description: `This is the description for item ${i + 1}`
    }));
  };

  // State
  const [data] = useState(generateData());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate total pages
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  // Inline styles to avoid any external dependencies
  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    },
    title: {
      fontSize: '24px',
      marginBottom: '20px'
    },
    item: {
      border: '1px solid #ddd',
      borderRadius: '4px',
      padding: '15px',
      marginBottom: '10px',
      backgroundColor: '#fff'
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '20px',
      gap: '5px'
    },
    pageButton: {
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      backgroundColor: '#fff',
      cursor: 'pointer'
    },
    activePageButton: {
      padding: '8px 12px',
      border: '1px solid #0066cc',
      borderRadius: '4px',
      backgroundColor: '#0066cc',
      color: '#fff',
      cursor: 'pointer'
    },
    disabledButton: {
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      backgroundColor: '#f5f5f5',
      color: '#999',
      cursor: 'not-allowed'
    },
    info: {
      marginBottom: '20px',
      padding: '10px',
      backgroundColor: '#f0f8ff',
      borderRadius: '4px'
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Standalone Pagination Example</h1>
      
      {/* Debug info */}
      <div style={styles.info}>
        <p>Page {currentPage} of {totalPages} | Showing items {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, data.length)} of {data.length}</p>
      </div>
      
      {/* Items */}
      <div>
        {currentItems.map(item => (
          <div key={item.id} style={styles.item}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      <div style={styles.pagination}>
        {/* Previous button */}
        <button 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={currentPage === 1 ? styles.disabledButton : styles.pageButton}
        >
          Previous
        </button>
        
        {/* Page numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            style={currentPage === page ? styles.activePageButton : styles.pageButton}
          >
            {page}
          </button>
        ))}
        
        {/* Next button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={currentPage === totalPages ? styles.disabledButton : styles.pageButton}
        >
          Next
        </button>
      </div>
    </div>
  );
}
