import React from 'react';
import * as ReactDOM from 'react-dom';
import axe from 'axe-core';

/**
 * Runs accessibility tests on a React component
 * This should only be used in development mode
 * @param App - The React component to test
 * @param container - The DOM element to render the component into
 */
export const runA11yTests = async (App: React.ReactElement, container: HTMLElement): Promise<void> => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  // Render the component using legacy ReactDOM.render for testing purposes
  // @ts-ignore - ReactDOM.render is deprecated but still works for testing
  ReactDOM.render(App, container);

  // Run axe
  try {
    const results = await axe.run(document as any);
    
    if (results.violations.length === 0) {
      console.log('%c✓ No accessibility violations found', 'color: green; font-weight: bold;');
    } else {
      console.group('%c⚠️ Accessibility violations found', 'color: red; font-weight: bold;');
      
      results.violations.forEach((violation) => {
        console.group(`%c${violation.impact?.toUpperCase() || 'ISSUE'}: ${violation.help}`, 'color: red;');
        console.log(`Description: ${violation.description}`);
        console.log(`Help URL: ${violation.helpUrl}`);
        
        violation.nodes.forEach((node) => {
          console.log('HTML:', node.html);
          console.log('Element:', node.target);
          console.log('Impact:', node.impact);
          console.log('Failure Summary:', node.failureSummary);
        });
        
        console.groupEnd();
      });
      
      console.groupEnd();
    }
  } catch (error) {
    console.error('Error running accessibility tests:', error);
  }
};

/**
 * A development-only component that wraps the application and runs accessibility tests
 * This component will only run tests in development mode
 */
export const A11yTestingWrapper: React.FC<{
  children: React.ReactNode;
  runTests?: boolean;
}> = ({ children, runTests = true }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && runTests && containerRef.current) {
      // Wait for the component to render before running tests
      const timeoutId = setTimeout(() => {
        if (containerRef.current) {
          runA11yTests(children as React.ReactElement, containerRef.current);
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [children, runTests]);

  return React.createElement('div', { ref: containerRef }, children);
};

/**
 * Enable or disable accessibility testing globally
 * This is useful for toggling testing on and off during development
 */
export const enableA11yTesting = (enable = true): void => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  window.__A11Y_TESTING_ENABLED__ = enable;
  console.log(`Accessibility testing ${enable ? 'enabled' : 'disabled'}`);
};

// Add type definition for the global window object
declare global {
  interface Window {
    __A11Y_TESTING_ENABLED__?: boolean;
  }
}
