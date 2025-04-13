/**
 * Tests for the ArticleAuthors Component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { ArticleAuthors } from '../ArticleAuthors';
import { Author } from '../../editor/types/citation';

// Mock the AuthorDisplay component
jest.mock('../../editor/AuthorDisplay', () => ({
  AuthorDisplay: ({ author }: { author: Author }) => (
    <span data-testid="author-display">
      {author.given} {author.family}
      {author.orcid && ` (ORCID: ${author.orcid})`}
    </span>
  )
}));

describe('ArticleAuthors Component', () => {
  const testAuthors: Author[] = [
    { given: 'John', family: 'Doe', orcid: '0000-0002-1825-0097' },
    { given: 'Jane', family: 'Smith' }
  ];

  it('renders authors correctly', () => {
    render(
      <ChakraProvider>
        <ArticleAuthors authors={testAuthors} />
      </ChakraProvider>
    );
    
    // Check for heading
    expect(screen.getByText('Authors')).toBeInTheDocument();
    
    // Check for author displays
    const authorDisplays = screen.getAllByTestId('author-display');
    expect(authorDisplays).toHaveLength(2);
  });

  it('displays affiliations when provided', () => {
    const affiliations = {
      'Doe-John': 'University of Testing',
      'Smith-Jane': 'Research Institute'
    };
    
    render(
      <ChakraProvider>
        <ArticleAuthors 
          authors={testAuthors} 
          affiliations={affiliations}
        />
      </ChakraProvider>
    );
    
    // Check for affiliations
    expect(screen.getByText('University of Testing')).toBeInTheDocument();
    expect(screen.getByText('Research Institute')).toBeInTheDocument();
  });

  it('marks corresponding author when specified', () => {
    render(
      <ChakraProvider>
        <ArticleAuthors 
          authors={testAuthors} 
          correspondingAuthor="Doe-John"
        />
      </ChakraProvider>
    );
    
    // Check for corresponding author marker
    expect(screen.getByText('(Corresponding Author)')).toBeInTheDocument();
  });
});
