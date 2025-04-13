import React from 'react';
import { render, screen } from '@testing-library/react';
import { OrcidIcon } from '../OrcidIcon';

describe('OrcidIcon', () => {
  it('renders with default props', () => {
    render(<OrcidIcon />);
    const icon = screen.getByRole('img', { name: /ORCID identifier/i });
    expect(icon).toBeInTheDocument();
  });

  it('applies custom props correctly', () => {
    render(<OrcidIcon data-testid="custom-orcid" color="red" boxSize={6} />);
    const icon = screen.getByTestId('custom-orcid');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('color', 'red');
  });

  it('maintains accessibility attributes', () => {
    render(<OrcidIcon aria-label="Custom ORCID label" />);
    const icon = screen.getByRole('img', { name: /Custom ORCID label/i });
    expect(icon).toBeInTheDocument();
  });
});
