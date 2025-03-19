/**
 * Test script for the recommendation engine
 * 
 * This script runs tests on the recommendation engine using the expanded mock articles
 * to verify that the engine is working correctly with various user profiles.
 */

import { runCompleteTest } from '../utils/testRecommendationEngine';

console.log('Starting recommendation engine tests...');

// Run the complete test with 15 recommendations per user
runCompleteTest(15);

console.log('Tests completed.');
