import { paginateArticles, getTotalPages } from '../articleUtils';
import { Article } from '../../data/articles';

// For now, let's focus on debugging the pagination issue rather than running tests
// We'll use this file as a reference for our manual testing

// Create a mock array of articles for testing
const mockArticles: Article[] = Array.from({ length: 35 }, (_, i) => ({
  id: i + 1,
  title: `Test Article ${i + 1}`,
  authors: [`Author ${i + 1}`],
  abstract: `Abstract for article ${i + 1}`,
  date: '2023-01-01',
  views: i * 10,
  categories: ['Test Category'],
  imageUrl: 'https://example.com/image.jpg'
}));

// Manual test functions
function testPaginateArticles() {
  console.log('Testing paginateArticles function');
  
  // Test first page
  const firstPage = paginateArticles(mockArticles, 1, 10);
  console.log('First page length:', firstPage.length);
  console.log('First page first article ID:', firstPage[0]?.id);
  console.log('First page last article ID:', firstPage[9]?.id);
  
  // Test second page
  const secondPage = paginateArticles(mockArticles, 2, 10);
  console.log('Second page length:', secondPage.length);
  console.log('Second page first article ID:', secondPage[0]?.id);
  console.log('Second page last article ID:', secondPage[9]?.id);
  
  // Test last page
  const lastPage = paginateArticles(mockArticles, 4, 10);
  console.log('Last page length:', lastPage.length);
  console.log('Last page first article ID:', lastPage[0]?.id);
  console.log('Last page last article ID:', lastPage[4]?.id);
}

function testGetTotalPages() {
  console.log('Testing getTotalPages function');
  console.log('Total pages for 35 items, 10 per page:', getTotalPages(35, 10));
  console.log('Total pages for 10 items, 10 per page:', getTotalPages(10, 10));
  console.log('Total pages for 11 items, 10 per page:', getTotalPages(11, 10));
  console.log('Total pages for 0 items, 10 per page:', getTotalPages(0, 10));
}

// Export the test functions so we can run them manually
export { testPaginateArticles, testGetTotalPages };
