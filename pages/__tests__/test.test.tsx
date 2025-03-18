import React from 'react';
import { render, screen } from '../../utils/test-utils';
import TestPage from '../test';

describe('Test Page', () => {
  it('renders the test page correctly', () => {
    render(<TestPage />);
    
    // Check if the heading is present
    expect(screen.getByText('Test Page')).toBeInTheDocument();
    
    // Check if the paragraph is present
    expect(screen.getByText('This is a test page to check if the site is working.')).toBeInTheDocument();
  });
});
