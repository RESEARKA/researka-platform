import { paginateArticles, getTotalPages, getAllMockArticles } from './articleUtils';

// Get all mock articles
const allArticles = getAllMockArticles();
console.log('Total articles:', allArticles.length);

// Test pagination with different page numbers
console.log('\n--- Testing Page 1 ---');
const page1 = paginateArticles(allArticles, 1, 10);
console.log('Page 1 length:', page1.length);
console.log('Page 1 article IDs:', page1.map(a => a.id));

console.log('\n--- Testing Page 2 ---');
const page2 = paginateArticles(allArticles, 2, 10);
console.log('Page 2 length:', page2.length);
console.log('Page 2 article IDs:', page2.map(a => a.id));

console.log('\n--- Testing Page 3 ---');
const page3 = paginateArticles(allArticles, 3, 10);
console.log('Page 3 length:', page3.length);
console.log('Page 3 article IDs:', page3.map(a => a.id));

// Test total pages calculation
const totalPages = getTotalPages(allArticles.length, 10);
console.log('\nTotal pages:', totalPages);

// Check for duplicate articles across pages
const page1Ids = page1.map(a => a.id);
const page2Ids = page2.map(a => a.id);
const page3Ids = page3.map(a => a.id);

console.log('\n--- Checking for Duplicates ---');
console.log('Duplicates between page 1 and 2:', page1Ids.filter(id => page2Ids.includes(id)));
console.log('Duplicates between page 2 and 3:', page2Ids.filter(id => page3Ids.includes(id)));
console.log('Duplicates between page 1 and 3:', page1Ids.filter(id => page3Ids.includes(id)));
