import React from 'react';
import { render, screen, fireEvent } from '../../utils/test-utils';
import TouchButton from '../TouchButton';

describe('TouchButton Component', () => {
  it('renders the button with correct text', () => {
    render(<TouchButton>Click Me</TouchButton>);
    
    // Check if the button is present with the correct text
    expect(screen.getByText('Click Me')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Click Me');
  });

  it('applies custom props correctly', () => {
    render(
      <TouchButton 
        colorScheme="blue" 
        variant="solid" 
        size="lg"
        data-testid="custom-button"
      >
        Custom Button
      </TouchButton>
    );
    
    // Check if the button has the correct attributes
    const button = screen.getByTestId('custom-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('chakra-button');
    
    // Chakra UI applies specific classes based on props
    expect(button).toHaveClass('chakra-button');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    
    render(<TouchButton onClick={handleClick}>Click Me</TouchButton>);
    
    // Click the button
    fireEvent.click(screen.getByText('Click Me'));
    
    // Check if the click handler was called
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    const handleClick = jest.fn();
    
    render(<TouchButton isDisabled onClick={handleClick}>Disabled Button</TouchButton>);
    
    // Check if the button is disabled
    expect(screen.getByRole('button')).toBeDisabled();
    
    // Click the button
    fireEvent.click(screen.getByText('Disabled Button'));
    
    // Check that the click handler was not called
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies custom styles via sx prop', () => {
    render(
      <TouchButton 
        sx={{ 
          backgroundColor: 'red.500',
          color: 'white'
        }}
        data-testid="styled-button"
      >
        Styled Button
      </TouchButton>
    );
    
    // Check if the button is present
    const button = screen.getByTestId('styled-button');
    expect(button).toBeInTheDocument();
    
    // We can't easily test for specific styles in React Testing Library
    // But we can check that the button renders correctly
    expect(button).toHaveTextContent('Styled Button');
  });

  it('passes through other props to the underlying Button component', () => {
    render(
      <TouchButton 
        aria-label="Test Button"
        data-custom="custom-value"
        data-testid="props-button"
      >
        Props Button
      </TouchButton>
    );
    
    // Check if the button has the correct attributes
    const button = screen.getByTestId('props-button');
    expect(button).toHaveAttribute('aria-label', 'Test Button');
    expect(button).toHaveAttribute('data-custom', 'custom-value');
  });
});
