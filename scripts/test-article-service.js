// Test script for article service
import { getAllArticles } from '../services/articleService.js';

async function testArticleService() {
  console.log('Testing article service...');
  
  try {
    console.log('Fetching all articles...');
    const articles = await getAllArticles();
    
    console.log(`Successfully fetched ${articles.length} articles`);
    
    if (articles.length > 0) {
      console.log('First article:', JSON.stringify(articles[0], null, 2));
    } else {
      console.log('No articles found in the database');
    }
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error testing article service:', error);
  }
}

testArticleService();
