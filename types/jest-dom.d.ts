import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      // Jest DOM matchers
      toBeInTheDocument(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveClass(...classNames: string[]): R;
      toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace: boolean }): R;
      toBeVisible(): R;
      toBeChecked(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeEmpty(): R;
      toBeEmptyDOMElement(): R;
      toBeInvalid(): R;
      toBeRequired(): R;
      toBeValid(): R;
      toContainElement(element: HTMLElement | null): R;
      toContainHTML(htmlText: string): R;
      toHaveFocus(): R;
      toHaveFormValues(expectedValues: { [name: string]: any }): R;
      toHaveStyle(css: string | object): R;
      toHaveValue(value?: string | string[] | number): R;
      toBeInTheDOM(): R;
      toHaveDescription(text: string | RegExp): R;
      toBeTruthy(): R;
      toBeFalsy(): R;
      toBeDefined(): R;
      toBeUndefined(): R;
      toBeNull(): R;
      toBeNaN(): R;
      toBe(expected: any): R;
      toEqual(expected: any): R;
      toStrictEqual(expected: any): R;
      toHaveBeenCalled(): R;
      toHaveBeenCalledTimes(expected: number): R;
      toHaveBeenCalledWith(...args: any[]): R;
      toHaveBeenLastCalledWith(...args: any[]): R;
      toHaveBeenNthCalledWith(nthCall: number, ...args: any[]): R;
      toHaveReturned(): R;
      toHaveReturnedTimes(expected: number): R;
      toHaveReturnedWith(expected: any): R;
      toHaveLastReturnedWith(expected: any): R;
      toHaveNthReturnedWith(nthCall: number, expected: any): R;
      toHaveLength(expected: number): R;
      toHaveProperty(keyPath: string | string[], value?: any): R;
      toBeGreaterThan(expected: number | bigint): R;
      toBeGreaterThanOrEqual(expected: number | bigint): R;
      toBeLessThan(expected: number | bigint): R;
      toBeLessThanOrEqual(expected: number | bigint): R;
      toBeInstanceOf(expected: any): R;
      toMatch(expected: string | RegExp): R;
      toMatchObject(expected: object | object[]): R;
      toMatchSnapshot(propertyMatchers?: any, hint?: string): R;
      toMatchInlineSnapshot(propertyMatchers?: any, inlineSnapshot?: string): R;
      toThrow(error?: string | Error | RegExp): R;
      toThrowErrorMatchingSnapshot(hint?: string): R;
      toThrowErrorMatchingInlineSnapshot(inlineSnapshot?: string): R;
    }
  }
}

// Extend the expect interface for Jest DOM
declare global {
  namespace jest {
    interface Expect {
      // Jest DOM matchers
      toBeInTheDocument(): jest.Matchers<void>;
      toHaveAttribute(attr: string, value?: string): jest.Matchers<void>;
      toHaveClass(...classNames: string[]): jest.Matchers<void>;
      toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace: boolean }): jest.Matchers<void>;
      toBeVisible(): jest.Matchers<void>;
      toBeChecked(): jest.Matchers<void>;
      toBeDisabled(): jest.Matchers<void>;
      toBeEnabled(): jest.Matchers<void>;
      toBeEmpty(): jest.Matchers<void>;
      toBeEmptyDOMElement(): jest.Matchers<void>;
      toBeInvalid(): jest.Matchers<void>;
      toBeRequired(): jest.Matchers<void>;
      toBeValid(): jest.Matchers<void>;
      toContainElement(element: HTMLElement | null): jest.Matchers<void>;
      toContainHTML(htmlText: string): jest.Matchers<void>;
      toHaveFocus(): jest.Matchers<void>;
      toHaveFormValues(expectedValues: { [name: string]: any }): jest.Matchers<void>;
      toHaveStyle(css: string | object): jest.Matchers<void>;
      toHaveValue(value?: string | string[] | number): jest.Matchers<void>;
      toBeInTheDOM(): jest.Matchers<void>;
      toHaveDescription(text: string | RegExp): jest.Matchers<void>;
    }
  }
}

// Add type definitions for global mocks
declare global {
  interface Window {
    matchMedia: jest.Mock;
    localStorage: {
      getItem: jest.Mock;
      setItem: jest.Mock;
      removeItem: jest.Mock;
      clear: jest.Mock;
    };
  }

  // For imageOptimizer.test.ts
  function getOptimizedImageUrl(options: any): string;
  function generateSrcSet(src: string, widths: number[], format: string): string;
}

export {};
