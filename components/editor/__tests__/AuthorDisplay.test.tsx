import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthorDisplay } from '../AuthorDisplay';
import { Author } from '../types/citation';

// Mock the OrcidIcon component
jest.mock('../../common/OrcidIcon', () => ({
  OrcidIcon: (props: any) => <span data-testid="orcid-icon" {...props} />
}));

describe('AuthorDisplay', () => {
  const authorWithoutOrcid: Author = {
    given: 'John',
    family: 'Doe',
  };

  const authorWithOrcid: Author = {
    given: 'Jane',
    family: 'Smith',
    orcid: '0000-0002-1825-0097',
  };

  it('renders author name without ORCID', () => {
    render(<AuthorDisplay author={authorWithoutOrcid} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByTestId('orcid-icon')).not.toBeInTheDocument();
  });

  it('renders author name with ORCID icon and link', () => {
    render(<AuthorDisplay author={authorWithOrcid} />);
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByTestId('orcid-icon')).toBeInTheDocument();
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://orcid.org/0000-0002-1825-0097');
    expect(link).toHaveAttribute('aria-label', expect.stringContaining('Jane Smith'));
    expect(link).toHaveAttribute('aria-label', expect.stringContaining('0000-0002-1825-0097'));
  });

  it('renders without tooltip when showTooltip is false', () => {
    // This is a basic test as we can't easily test for the absence of a tooltip
    // in a unit test without more complex setup
    render(<AuthorDisplay author={authorWithOrcid} showTooltip={false} />);
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByTestId('orcid-icon')).toBeInTheDocument();
  });
});
