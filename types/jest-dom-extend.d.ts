// Import the jest-dom matchers
import '@testing-library/jest-dom';

// Extend the Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      // DOM element matchers
      toBeInTheDocument(): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveAttribute(attr: string, value?: string): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeChecked(): R;
      toHaveClass(className: string): R;
      toHaveValue(value: string | string[] | number): R;
      toHaveFocus(): R;
      toHaveStyle(css: string | object): R;
      
      // Mock function matchers
      toHaveBeenCalled(): R;
      toHaveBeenCalledTimes(count: number): R;
      toHaveBeenCalledWith(...args: any[]): R;
      toHaveBeenLastCalledWith(...args: any[]): R;
      toHaveBeenNthCalledWith(nth: number, ...args: any[]): R;
      toHaveReturned(): R;
      toHaveReturnedTimes(count: number): R;
      toHaveReturnedWith(value: any): R;
      toHaveLastReturnedWith(value: any): R;
      toHaveNthReturnedWith(nth: number, value: any): R;
    }
  }

  // Add expect.any() and other expect utilities
  namespace jest {
    interface Expect {
      any(constructor: any): any;
      anything(): any;
      arrayContaining(array: Array<any>): any;
      objectContaining(object: {}): any;
      stringContaining(string: string): any;
      stringMatching(regexp: RegExp | string): any;
    }
  }
}
