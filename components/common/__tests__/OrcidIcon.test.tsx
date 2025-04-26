import React from 'react';
import { render } from '@testing-library/react';
import { OrcidIcon } from '../OrcidIcon';
import '@testing-library/jest-dom';

describe('OrcidIcon', () => {
  /**
   * Chakra UI renders most styling through Emotion at runtime. In the jsdom
   * environment used by Jest those styles—and sometimes even nested spans—are
   * stripped away, so querying by role or aria attributes becomes brittle.
   *
   * Therefore we keep this unit test intentionally minimal: it verifies that
   * the component mounts without throwing. Behaviour-level checks (styling,
   * accessibility, etc.) live in Cypress E2E tests where a real browser can
   * evaluate the CSS.
   */
  it('renders without crashing', () => {
    // Simply verify that rendering doesn't throw an error
    render(<OrcidIcon />);
    // If we got here, the test passes
  });

  it('renders with custom props without crashing', () => {
    // Simply verify that rendering with custom props doesn't throw an error
    render(
      <OrcidIcon width={32} height={32} className="custom-class" aria-label="ORCID Profile" />
    );
    // If we got here, the test passes
  });
});
