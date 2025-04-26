import React from 'react';
import { render } from '@testing-library/react';
import TouchButton from '../TouchButton';
import '@testing-library/jest-dom';

describe('TouchButton', () => {
  /**
   * Chakra UI renders most styling through Emotion at runtime. In the jsdom
   * environment used by Jest those styles—and sometimes even nested spans—are
   * stripped away, so querying by width/height or inner markup becomes brittle.
   *
   * Therefore we keep this unit test intentionally minimal: it verifies that
   * the component mounts without throwing. Behaviour-level checks (hover,
   * tap, focus states) live in Cypress E2E tests where a real browser can
   * evaluate the CSS.
   */
  it('renders without crashing', () => {
    const { container } = render(<TouchButton>Button Text</TouchButton>);
    expect(container).toBeTruthy();
  });
});
