import { paginateArticles, getTotalPages } from '../articleUtils';
import { Article } from '../../data/articles';

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

describe('Article Utils', () => {
  describe('paginateArticles', () => {
    it('should return the correct articles for the first page', () => {
      const firstPage = paginateArticles(mockArticles, 1, 10);
      expect(firstPage.length).toBe(10);
      expect(firstPage[0].id).toBe(1);
      expect(firstPage[9].id).toBe(10);
    });

    it('should return the correct articles for the second page', () => {
      const secondPage = paginateArticles(mockArticles, 2, 10);
      expect(secondPage.length).toBe(10);
      expect(secondPage[0].id).toBe(11);
      expect(secondPage[9].id).toBe(20);
    });

    it('should return the correct articles for the last page', () => {
      const lastPage = paginateArticles(mockArticles, 4, 10);
      expect(lastPage.length).toBe(5);
      expect(lastPage[0].id).toBe(31);
      expect(lastPage[4].id).toBe(35);
    });
  });

  describe('getTotalPages', () => {
    it('should calculate the correct number of pages', () => {
      expect(getTotalPages(35, 10)).toBe(4);
      expect(getTotalPages(10, 10)).toBe(1);
      expect(getTotalPages(11, 10)).toBe(2);
      // Update: getTotalPages returns at least 1 page even for 0 items
      expect(getTotalPages(0, 10)).toBe(1);
    });
  });
});
