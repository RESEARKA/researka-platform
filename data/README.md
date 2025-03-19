# Mock Articles for Researka Platform

This directory contains mock data for testing the Researka platform's recommendation engine and article display components.

## Available Mock Data

### `mockArticles.ts`

Contains a comprehensive set of mock articles across 10 major academic fields:

1. Physics (Quantum Physics, Astrophysics, Condensed Matter)
2. Chemistry (Organic Chemistry, Inorganic Chemistry, Physical Chemistry)
3. Computer Science (Machine Learning, Cybersecurity, Software Engineering)
4. Biology (Genetics, Ecology, Neurobiology)
5. Mathematics (Number Theory, Topology, Applied Mathematics)
6. Humanities (Philosophy, Literature, History)
7. Social Sciences (Psychology, Economics)
8. Environmental Sciences (Climate Science, Conservation Biology)
9. Engineering (Electrical Engineering, Mechanical Engineering)
10. Medical Sciences (Immunology, Neurology)

Each field has 6 articles (3 in each of 2 subfields) with varying statuses (pending, under_review, accepted), publication dates, view counts, citation counts, and review counts.

## Usage

### Importing Mock Articles

```typescript
// Import all mock articles
import { EXPANDED_MOCK_ARTICLES } from '../data/mockArticles';

// Import articles from a specific field
import { PHYSICS_ARTICLES } from '../data/mockArticles';
import { COMPUTER_SCIENCE_ARTICLES } from '../data/mockArticles';
// etc.
```

### Testing the Recommendation Engine

Use the test utilities in `/utils/testRecommendationEngine.ts` to test the recommendation engine with these mock articles:

```typescript
import { runCompleteTest } from '../utils/testRecommendationEngine';

// Run tests with 15 recommendations per user
runCompleteTest(15);
```

Or visit the test page at `/test-recommendations` to interactively test the recommendation engine with different user profiles.

## Article Structure

Each article follows the `Article` interface defined in `recommendationEngine.ts`:

```typescript
interface Article {
  id: string;
  title: string;
  abstract: string;
  keywords: string[];
  categories: string[];
  authorId: string;
  publishedDate?: string;
  views?: number;
  citations?: number;
  reviewCount: number;
  status: 'pending' | 'under_review' | 'accepted' | 'rejected';
}
```

## Adding More Mock Articles

To add more mock articles, follow the existing pattern in `mockArticles.ts`:

1. Create a new array for your field
2. Add articles with appropriate metadata
3. Add your new array to the `EXPANDED_MOCK_ARTICLES` export

Example:

```typescript
export const NEW_FIELD_ARTICLES: Article[] = [
  // Your articles here
];

export const EXPANDED_MOCK_ARTICLES: Article[] = [
  // Existing fields
  ...NEW_FIELD_ARTICLES,
];
```
