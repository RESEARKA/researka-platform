import React, { useState, useMemo } from 'react';
import SimplePagination from '../components/SimplePagination';

// Simple page with pagination that doesn't rely on any external components
export default function SimplePage() {
  // Sample data
  const allItems = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      title: `Item ${i + 1}`,
      description: `This is the description for item ${i + 1}`
    }));
  }, []);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(allItems.length / itemsPerPage);
  }, [allItems.length]);
  
  // Get current items
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allItems.slice(startIndex, endIndex);
  }, [allItems, currentPage]);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    console.log(`Changing to page ${page}`);
    setCurrentPage(page);
    // Scroll to top for better UX
    window.scrollTo(0, 0);
  };
  
  // Styles
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
    info: {
      marginBottom: '20px',
      padding: '10px',
      backgroundColor: '#f0f8ff',
      borderRadius: '4px'
    }
  };
  
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Simple Page with Pagination</h1>
      
      {/* Debug info */}
      <div style={styles.info}>
        <p>Page {currentPage} of {totalPages} | Showing items {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, allItems.length)} of {allItems.length}</p>
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
      
      {/* Pagination component */}
      <SimplePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
