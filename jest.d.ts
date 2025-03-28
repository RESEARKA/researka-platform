// Type definitions for Jest matchers
import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveClass(className: string): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveValue(value: string | string[] | number): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeChecked(): R;
      toBeEmpty(): R;
      toBeRequired(): R;
      toHaveFocus(): R;
      toBeInvalid(): R;
      toBeValid(): R;
    }
  }
}

// Extend the expect interface
declare global {
  namespace jest {
    interface Expect {
      toHaveBeenCalled(): any;
      toHaveBeenCalledWith(...args: any[]): any;
      toHaveBeenCalledTimes(times: number): any;
      toBe(expected: any): any;
      toEqual(expected: any): any;
      toStrictEqual(expected: any): any;
      toBeDefined(): any;
      toBeUndefined(): any;
      toBeNull(): any;
      toBeTruthy(): any;
      toBeFalsy(): any;
      toContain(expected: any): any;
      toContainEqual(expected: any): any;
      toHaveLength(length: number): any;
      toHaveProperty(path: string, value?: any): any;
      toMatch(expected: string | RegExp): any;
      toMatchObject(expected: object): any;
      toThrow(expected?: string | Error | RegExp): any;
    }
  }
}

export {};
