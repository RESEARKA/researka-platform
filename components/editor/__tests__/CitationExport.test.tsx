/**
 * Tests for the Citation Export Component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { CitationExport } from '../CitationExport';
import { Citation } from '../types/citation';
import * as citationExportService from '../services/citationExportService';

// Mock the citation export service
jest.mock('../services/citationExportService', () => ({
  exportToBibTeX: jest.fn().mockReturnValue('Mocked BibTeX'),
  exportToRIS: jest.fn().mockReturnValue('Mocked RIS'),
  exportToCSLJSON: jest.fn().mockReturnValue('Mocked CSL-JSON'),
  exportToPlainText: jest.fn().mockReturnValue('Mocked Plain Text')
}));

// Mock the clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve())
  }
});

// Mock URL.createObjectURL and URL.revokeObjectURL
URL.createObjectURL = jest.fn().mockReturnValue('mocked-url');
URL.revokeObjectURL = jest.fn();

// Mock document.createElement and related DOM manipulation for download
const mockAnchorElement = {
  href: '',
  download: '',
  click: jest.fn(),
};

document.createElement = jest.fn().mockImplementation((tag) => {
  if (tag === 'a') return mockAnchorElement;
  return document.createElement(tag);
});

document.body.appendChild = jest.fn();
document.body.removeChild = jest.fn();

describe('CitationExport Component', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders button variant correctly', () => {
    render(
      <ChakraProvider>
        <CitationExport citation={testCitation} />
      </ChakraProvider>
    );
    
    expect(screen.getByText('Export Citation')).toBeInTheDocument();
  });

  it('renders inline variant correctly', () => {
    render(
      <ChakraProvider>
        <CitationExport citation={testCitation} variant="inline" />
      </ChakraProvider>
    );
    
    expect(screen.getByText('Export as:')).toBeInTheDocument();
    expect(screen.getByText('BibTeX')).toBeInTheDocument();
    expect(screen.getByText('RIS')).toBeInTheDocument();
    expect(screen.getByText('CSL-JSON')).toBeInTheDocument();
    expect(screen.getByText('Plain Text')).toBeInTheDocument();
  });

  it('opens menu when button is clicked', async () => {
    render(
      <ChakraProvider>
        <CitationExport citation={testCitation} />
      </ChakraProvider>
    );
    
    // Click the button to open the menu
    fireEvent.click(screen.getByText('Export Citation'));
    
    // Check that menu items are displayed
    await waitFor(() => {
      expect(screen.getByText('Copy as BibTeX')).toBeInTheDocument();
      expect(screen.getByText('Copy as RIS')).toBeInTheDocument();
      expect(screen.getByText('Copy as CSL-JSON')).toBeInTheDocument();
      expect(screen.getByText('Copy as Plain Text')).toBeInTheDocument();
      expect(screen.getByText('Download BibTeX')).toBeInTheDocument();
      expect(screen.getByText('Download RIS')).toBeInTheDocument();
    });
  });

  it('calls export service when BibTeX format is selected', async () => {
    render(
      <ChakraProvider>
        <CitationExport citation={testCitation} variant="inline" />
      </ChakraProvider>
    );
    
    // Click the BibTeX button
    fireEvent.click(screen.getByText('BibTeX'));
    
    // Check that the export service was called
    expect(citationExportService.exportToBibTeX).toHaveBeenCalledWith(testCitation);
  });

  it('calls export service when RIS format is selected', async () => {
    render(
      <ChakraProvider>
        <CitationExport citation={testCitation} variant="inline" />
      </ChakraProvider>
    );
    
    // Click the RIS button
    fireEvent.click(screen.getByText('RIS'));
    
    // Check that the export service was called
    expect(citationExportService.exportToRIS).toHaveBeenCalledWith(testCitation);
  });

  it('handles download functionality', async () => {
    render(
      <ChakraProvider>
        <CitationExport citation={testCitation} />
      </ChakraProvider>
    );
    
    // Click the button to open the menu
    fireEvent.click(screen.getByText('Export Citation'));
    
    // Click the Download BibTeX option
    await waitFor(() => {
      fireEvent.click(screen.getByText('Download BibTeX'));
    });
    
    // Check that the export service was called
    expect(citationExportService.exportToBibTeX).toHaveBeenCalledWith(testCitation);
    
    // Check that the download functionality was used
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(mockAnchorElement.download).toBe('citation-test-citation-123.bib');
    expect(mockAnchorElement.click).toHaveBeenCalled();
    
    // Wait for cleanup
    await waitFor(() => {
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  it('handles errors gracefully', async () => {
    // Mock exportToBibTeX to throw an error
    (citationExportService.exportToBibTeX as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Test error');
    });
    
    render(
      <ChakraProvider>
        <CitationExport citation={testCitation} variant="inline" />
      </ChakraProvider>
    );
    
    // Click the BibTeX button
    fireEvent.click(screen.getByText('BibTeX'));
    
    // Check that the export service was called
    expect(citationExportService.exportToBibTeX).toHaveBeenCalledWith(testCitation);
    
    // Toast would be shown with error message, but we can't easily test that in this environment
  });
});
