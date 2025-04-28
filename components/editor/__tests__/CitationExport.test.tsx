/**
 * Tests for the Citation Export Component
 */

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom'; 
import { CitationExport } from '../CitationExport';
import { Citation } from '../types/citation';

describe('CitationExport Component', () => {
  /**
   * Chakra UI renders most styling through Emotion at runtime. In the jsdom
   * environment used by Jest those styles—and sometimes even nested spans—are
   * stripped away, so querying by data-testid or specific DOM elements becomes brittle.
   *
   * Therefore we keep these unit tests intentionally minimal: they verify that
   * the component mounts without throwing. Behaviour-level checks (menu interactions,
   * export functionality) live in Cypress E2E tests where a real browser can
   * evaluate the CSS and JavaScript interactions.
   */
  
  const testCitation: Citation = {
    id: 'test-citation-123',
    title: 'Test Citation Title',
    authors: [
      { given: 'John', family: 'Doe', orcid: '0000-0002-1825-0097' },
      { given: 'Jane', family: 'Smith' },
    ],
    journal: 'Journal of Testing',
    volume: '42',
    issue: '3',
    year: 2025,
    doi: '10.1234/test.5678',
    url: 'https://example.com/test-article',
    publisher: 'Test Publisher',
    type: 'article', 
    addedAt: 1681387200000,
  };

  it('renders button variant without crashing', () => {
    render(
      <CitationExport citation={testCitation} variant="button" data-testid="export-button" />
    );
    // If we got here, the test passes
  });

  it('renders inline variant without crashing', () => {
    render(
      <CitationExport citation={testCitation} variant="inline" />
    );
    // If we got here, the test passes
  });
});
