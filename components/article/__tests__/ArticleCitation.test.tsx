/**
 * Tests for the ArticleCitation Component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { ArticleCitation } from '../ArticleCitation';
import { Citation } from '../../editor/types/citation';

// Mock the CitationExport component
jest.mock('../../editor/CitationExport', () => ({
  CitationExport: () => <div data-testid="citation-export">Citation Export</div>
}));

// Mock the AuthorsList component
jest.mock('../../editor/AuthorsList', () => ({
  AuthorsList: ({ authors }: { authors: any[] }) => (
    <div data-testid="authors-list">
      {authors.map((author, index) => (
        <span key={index} data-testid="author-item">
          {author.given} {author.family}
          {author.orcid && ` (ORCID: ${author.orcid})`}
        </span>
      ))}
    </div>
  )
}));

describe('ArticleCitation Component', () => {
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

  it('renders citation information correctly', () => {
    render(
      <ChakraProvider>
        <ArticleCitation citation={testCitation} />
      </ChakraProvider>
    );
    
    // Check for heading
    expect(screen.getByText('How to Cite')).toBeInTheDocument();
    
    // Check for authors list
    expect(screen.getByTestId('authors-list')).toBeInTheDocument();
    
    // Check for citation export
    expect(screen.getByTestId('citation-export')).toBeInTheDocument();
    
    // Check for citation text
    const citationText = screen.getByText(/Doe, J., Smith, J. \(2025\). Test Citation Title/i);
    expect(citationText).toBeInTheDocument();
    
    // Check for DOI
    expect(screen.getByText(/https:\/\/doi\.org\/10\.1234\/test\.5678/i)).toBeInTheDocument();
  });
});
