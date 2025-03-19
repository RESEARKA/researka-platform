import { Article, User, generateComprehensiveFeed, EnhancedRecommendationResult } from './recommendationEngine';
import { EXPANDED_MOCK_ARTICLES } from '../data/mockArticles';

/**
 * Test utility to simulate different user profiles and test the recommendation engine
 */

// Sample user profiles for testing
export const TEST_USERS: User[] = [
  {
    id: 'user-physics',
    researchInterests: ['physics', 'quantum-physics', 'astrophysics']
  },
  {
    id: 'user-interdisciplinary',
    researchInterests: ['computer-science', 'machine-learning', 'neurobiology', 'cognitive-neuroscience']
  },
  {
    id: 'user-environmental',
    researchInterests: ['environmental-sciences', 'climate-science', 'conservation-biology', 'ecology']
  },
  {
    id: 'user-medical',
    researchInterests: ['medical-sciences', 'immunology', 'neurology', 'molecular-medicine']
  },
  {
    id: 'user-broad',
    researchInterests: ['physics', 'computer-science', 'biology', 'social-sciences']
  },
];

/**
 * Run a test of the recommendation engine for a specific user
 * @param user The user to generate recommendations for
 * @param limit Optional limit on the number of recommendations
 * @returns The recommendation results
 */
export function testRecommendationsForUser(
  user: User,
  limit: number = 10
): {
  user: User;
  recommendations: EnhancedRecommendationResult[];
  stats: {
    totalRecommendations: number;
    byRecommendationType: Record<string, number>;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
  };
} {
  // Generate recommendations
  const recommendations = generateComprehensiveFeed(user, EXPANDED_MOCK_ARTICLES, limit);
  
  // Calculate statistics
  const stats = {
    totalRecommendations: recommendations.length,
    byRecommendationType: {} as Record<string, number>,
    byCategory: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
  };
  
  // Count by recommendation type
  recommendations.forEach(rec => {
    // Count by recommendation type
    if (!stats.byRecommendationType[rec.matchType]) {
      stats.byRecommendationType[rec.matchType] = 0;
    }
    stats.byRecommendationType[rec.matchType]++;
    
    // Count by primary category
    const primaryCategory = rec.article.categories[0];
    if (!stats.byCategory[primaryCategory]) {
      stats.byCategory[primaryCategory] = 0;
    }
    stats.byCategory[primaryCategory]++;
    
    // Count by status
    if (!stats.byStatus[rec.article.status]) {
      stats.byStatus[rec.article.status] = 0;
    }
    stats.byStatus[rec.article.status]++;
  });
  
  return {
    user,
    recommendations,
    stats,
  };
}

/**
 * Run tests for all predefined test users
 * @param limit Optional limit on the number of recommendations per user
 * @returns Test results for all users
 */
export function runAllUserTests(limit: number = 10): Record<string, ReturnType<typeof testRecommendationsForUser>> {
  const results: Record<string, ReturnType<typeof testRecommendationsForUser>> = {};
  
  TEST_USERS.forEach(user => {
    results[user.id] = testRecommendationsForUser(user, limit);
  });
  
  return results;
}

/**
 * Print a summary of test results to the console
 * @param results The test results to summarize
 */
export function printTestResults(results: Record<string, ReturnType<typeof testRecommendationsForUser>>): void {
  console.log('=== RECOMMENDATION ENGINE TEST RESULTS ===');
  console.log(`Total test users: ${Object.keys(results).length}`);
  console.log('\n');
  
  Object.entries(results).forEach(([userId, result]) => {
    console.log(`=== USER: ${userId} ===`);
    console.log(`Interests: ${result.user.researchInterests.join(', ')}`);
    console.log(`Total recommendations: ${result.stats.totalRecommendations}`);
    
    console.log('\nBy Recommendation Type:');
    Object.entries(result.stats.byRecommendationType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    
    console.log('\nBy Category:');
    Object.entries(result.stats.byCategory).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`);
    });
    
    console.log('\nBy Status:');
    Object.entries(result.stats.byStatus).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });
    
    console.log('\nTop 5 Recommendations:');
    result.recommendations.slice(0, 5).forEach((rec, index) => {
      console.log(`  ${index + 1}. [${rec.matchType}] ${rec.article.title} (${rec.article.categories[0]})`);
    });
    
    console.log('\n');
  });
  
  console.log('=== END OF TEST RESULTS ===');
}

/**
 * Run a complete test of the recommendation engine and print results
 * @param limit Optional limit on the number of recommendations per user
 */
export function runCompleteTest(limit: number = 10): void {
  const results = runAllUserTests(limit);
  printTestResults(results);
}
