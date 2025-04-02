import { Review, ReviewSuggestion } from '../types/review';

// Define ReviewDecision based on the Review type
type ReviewDecision = Review['decision'];

/**
 * Generates AI-based ratings based on review suggestions.
 * Adjusts scores based on suggestion severity.
 * @param suggestions - Array of AI-generated suggestions.
 * @returns A record of criteria mapped to their calculated ratings.
 */
export function generateAIRatings(suggestions: ReviewSuggestion[]): Review['ratings'] {
  // Define base ratings and criteria keys based on the Review type
  const baseRating = 3; // Start with a neutral 'Good' rating
  const criteriaKeys: (keyof Review['ratings'])[] = [
    'originality',
    'methodology', 
    'clarity',
    'significance',
    'references' 
  ];

  // Initialize ratings with base values
  const ratings = criteriaKeys.reduce((acc, key) => {
    acc[key] = baseRating;
    return acc;
  }, {} as Review['ratings']);

  // Adjust ratings based on suggestions
  suggestions.forEach(suggestion => {
    const category = suggestion.category.toLowerCase();
    const impact = suggestion.priority === 'high' ? -1.5 : 
                  suggestion.priority === 'medium' ? -1 :
                  0; // Low priority has no impact

    // Only apply negative impact for now
    let currentImpact = impact < 0 ? impact : 0;

    // Apply impact based on category keywords - Map to correct keys in Review['ratings']
    if (category.includes('method') || category.includes('approach') || category.includes('technical')) {
      ratings.methodology = Math.max(1, Math.min(5, (ratings.methodology || baseRating) + currentImpact));
    } 
    if (category.includes('original') || category.includes('novel') || category.includes('innovation')) {
      ratings.originality = Math.max(1, Math.min(5, (ratings.originality || baseRating) + currentImpact));
    }
    if (category.includes('clear') || category.includes('writing') || category.includes('structure') || category.includes('presentation')) {
      ratings.clarity = Math.max(1, Math.min(5, (ratings.clarity || baseRating) + currentImpact));
    }
    if (category.includes('impact') || category.includes('significant') || category.includes('important') || category.includes('relevan')) { // Combined significance/relevance
      ratings.significance = Math.max(1, Math.min(5, (ratings.significance || baseRating) + currentImpact));
    }
    if (category.includes('reference') || category.includes('citation') || category.includes('literature')) {
      ratings.references = Math.max(1, Math.min(5, (ratings.references || baseRating) + currentImpact));
    }
  });

  // Round ratings UP to the nearest integer
  Object.keys(ratings).forEach((keyStr) => {
    const key = keyStr as keyof Review['ratings']; // Assert key type
    ratings[key] = Math.ceil(ratings[key]);
  });

  return ratings;
}

/**
 * Determines the overall review decision based on AI-generated ratings.
 * @param ratings - The AI-generated ratings for the review criteria.
 * @returns The suggested review decision.
 */
export function determineAIDecision(ratings: Review['ratings']): ReviewDecision {
  // Ensure ratings object is valid
  if (!ratings || Object.keys(ratings).length === 0) {
    console.warn('Cannot determine AI decision: Invalid or empty ratings object provided.');
    return 'minor_revision'; // Default decision if ratings are missing
  }

  const ratingValues = Object.values(ratings).filter(val => typeof val === 'number'); // Ensure only numbers are considered
  if (ratingValues.length === 0) {
    console.warn('Cannot determine AI decision: No valid numeric ratings found.');
    return 'minor_revision'; // Default decision
  }

  const averageRating = ratingValues.reduce((sum, rating) => sum + rating, 0) / ratingValues.length;
  const lowestRating = Math.min(...ratingValues);

  console.log(`Determining AI Decision: Average=${averageRating.toFixed(2)}, Lowest=${lowestRating}`);

  // Stricter decision logic
  if (lowestRating <= 1) return 'reject'; // Reject if any score is 1 or less
  if (lowestRating < 2) return 'major_revision'; // Major revision if lowest is below 2

  // Logic based on average score
  if (averageRating < 2.5) return 'major_revision'; // Major revision if average is low
  if (averageRating < 3.5) return 'minor_revision'; // Minor revision for moderate scores

  // Acceptance requires consistently good scores
  if (averageRating >= 3.5 && lowestRating >= 3) return 'accept';

  // Default fallback (e.g., average >= 3.5 but lowest is < 3)
  return 'minor_revision'; 
}
