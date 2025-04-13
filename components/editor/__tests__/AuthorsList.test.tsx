import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthorsList } from '../AuthorsList';
import { Author } from '../types/citation';

// Mock the AuthorDisplay component
jest.mock('../AuthorDisplay', () => ({
  AuthorDisplay: ({ author }: { author: Author }) => (
    <span data-testid="author-display">{`${author.given} ${author.family}`}</span>
  )
}));

describe('AuthorsList', () => {
  const authors: Author[] = [
    { given: 'John', family: 'Doe' },
    { given: 'Jane', family: 'Smith', orcid: '0000-0002-1825-0097' },
    { given: 'Alice', family: 'Johnson' }
  ];

  it('renders nothing when authors array is empty', () => {
    const { container } = render(<AuthorsList authors={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders authors with commas between them', () => {
    render(<AuthorsList authors={authors} />);
    
    // Check for heading
    expect(screen.getByText('Authors')).toBeInTheDocument();
    
    // Check for author displays
    const authorDisplays = screen.getAllByTestId('author-display');
    expect(authorDisplays).toHaveLength(3);
    
    // Check for commas (there should be 2 commas for 3 authors)
    const commas = screen.getAllByText(',');
    expect(commas).toHaveLength(2);
  });

  it('renders without heading when showHeading is false', () => {
    render(<AuthorsList authors={authors} showHeading={false} />);
    
    // Heading should not be present
    expect(screen.queryByText('Authors')).not.toBeInTheDocument();
    
    // Authors should still be present
    const authorDisplays = screen.getAllByTestId('author-display');
    expect(authorDisplays).toHaveLength(3);
  });
});
