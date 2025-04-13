/**
 * Tests for the Citation Export Service
 */

import { 
  exportToBibTeX, 
  exportToRIS, 
  exportToCSLJSON, 
  exportToPlainText 
} from '../citationExportService';
import { Citation } from '../../types/citation';

// Mock the logger to prevent console output during tests
jest.mock('../../../../utils/logger', () => ({
  createLogger: () => ({
    error: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
  }),
  LogCategory: {
    ERROR: 'error',
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn'
  }
}));

describe('Citation Export Service', () => {
  // Test citation with ORCID IDs
  const testCitation: Citation = {
    id: 'test-citation-123',
    title: 'Test Citation Title',
    authors: [
      { given: 'John', family: 'Doe', orcid: '0000-0002-1825-0097' },
      { given: 'Jane', family: 'Smith' }
    ],
    year: 2025,
    journal: 'Journal of Testing',
    volume: '42',
    issue: '3',
    doi: '10.1234/test.5678',
    url: 'https://example.com/test-article',
    publisher: 'Test Publisher',
    type: 'article',
    addedAt: 1681387200000
  };

  describe('exportToBibTeX', () => {
    it('should format citation correctly with ORCID', () => {
      const result = exportToBibTeX(testCitation);
      
      // Check that the result contains the expected BibTeX format
      expect(result).toContain('@article{test-citation-123');
      expect(result).toContain('author = {Doe, John, orcid = {0000-0002-1825-0097} and Smith, Jane}');
      expect(result).toContain('title = {Test Citation Title}');
      expect(result).toContain('journal = {Journal of Testing}');
      expect(result).toContain('year = {2025}');
      expect(result).toContain('volume = {42}');
      expect(result).toContain('issue = {3}');
      expect(result).toContain('doi = {10.1234/test.5678}');
    });

    it('should handle missing optional fields', () => {
      const minimalCitation: Citation = {
        id: 'minimal-citation',
        title: 'Minimal Citation',
        authors: [{ given: 'John', family: 'Doe' }],
        year: 2025,
        type: 'article',
        addedAt: 1681387200000
      };
      
      const result = exportToBibTeX(minimalCitation);
      
      expect(result).toContain('@article{minimal-citation');
      expect(result).toContain('author = {Doe, John}');
      expect(result).toContain('title = {Minimal Citation}');
      expect(result).toContain('journal = {DecentraJournal}');
      expect(result).toContain('year = {2025}');
      expect(result).not.toContain('volume');
      expect(result).not.toContain('issue');
      expect(result).not.toContain('doi');
      expect(result).not.toContain('url');
    });

    it('should throw error for invalid citation', () => {
      const invalidCitation = { id: 'invalid' } as Citation;
      expect(() => exportToBibTeX(invalidCitation)).toThrow();
    });
  });

  describe('exportToRIS', () => {
    it('should format citation correctly with ORCID', () => {
      const result = exportToRIS(testCitation);
      
      // Check that the result contains the expected RIS format
      expect(result).toContain('TY  - JOUR');
      expect(result).toContain('AU  - Doe, John');
      expect(result).toContain('AI  - 0000-0002-1825-0097'); // ORCID identifier
      expect(result).toContain('AU  - Smith, Jane');
      expect(result).not.toContain('AI  - '); // No ORCID for second author
      expect(result).toContain('TI  - Test Citation Title');
      expect(result).toContain('JO  - Journal of Testing');
      expect(result).toContain('PY  - 2025');
      expect(result).toContain('VL  - 42');
      expect(result).toContain('IS  - 3');
      expect(result).toContain('DO  - 10.1234/test.5678');
      expect(result).toContain('UR  - https://example.com/test-article');
      expect(result).toContain('PB  - Test Publisher');
      expect(result).toContain('ER  - ');
    });

    it('should handle missing optional fields', () => {
      const minimalCitation: Citation = {
        id: 'minimal-citation',
        title: 'Minimal Citation',
        authors: [{ given: 'John', family: 'Doe' }],
        year: 2025,
        type: 'article',
        addedAt: 1681387200000
      };
      
      const result = exportToRIS(minimalCitation);
      
      expect(result).toContain('TY  - JOUR');
      expect(result).toContain('AU  - Doe, John');
      expect(result).toContain('TI  - Minimal Citation');
      expect(result).toContain('JO  - DecentraJournal');
      expect(result).toContain('PY  - 2025');
      expect(result).not.toContain('VL  - ');
      expect(result).not.toContain('IS  - ');
      expect(result).not.toContain('DO  - ');
      expect(result).not.toContain('UR  - ');
      expect(result).toContain('PB  - DecentraJournal Publishing');
    });
  });

  describe('exportToCSLJSON', () => {
    it('should format citation correctly with ORCID', () => {
      const result = exportToCSLJSON(testCitation);
      const parsed = JSON.parse(result);
      
      expect(parsed.id).toBe('test-citation-123');
      expect(parsed.title).toBe('Test Citation Title');
      expect(parsed.author).toHaveLength(2);
      expect(parsed.author[0].family).toBe('Doe');
      expect(parsed.author[0].given).toBe('John');
      expect(parsed.author[0].ORCID).toBe('0000-0002-1825-0097');
      expect(parsed.author[1].family).toBe('Smith');
      expect(parsed.author[1].given).toBe('Jane');
      expect(parsed.author[1].ORCID).toBeUndefined();
      expect(parsed['container-title']).toBe('Journal of Testing');
      expect(parsed.issued['date-parts'][0][0]).toBe(2025);
      expect(parsed.volume).toBe('42');
      expect(parsed.issue).toBe('3');
      expect(parsed.DOI).toBe('10.1234/test.5678');
      expect(parsed.URL).toBe('https://example.com/test-article');
    });
  });

  describe('exportToPlainText', () => {
    it('should format citation correctly with ORCID', () => {
      const result = exportToPlainText(testCitation);
      
      expect(result).toContain('Doe, J. (ORCID: 0000-0002-1825-0097), Smith, J.');
      expect(result).toContain('(2025)');
      expect(result).toContain('Test Citation Title');
      expect(result).toContain('Journal of Testing');
      expect(result).toContain('42(3)');
      expect(result).toContain('https://doi.org/10.1234/test.5678');
    });

    it('should use URL when DOI is not available', () => {
      const citationWithoutDOI = {
        ...testCitation,
        doi: undefined
      };
      
      const result = exportToPlainText(citationWithoutDOI);
      
      expect(result).toContain('https://example.com/test-article');
      expect(result).not.toContain('https://doi.org');
    });
  });
});
