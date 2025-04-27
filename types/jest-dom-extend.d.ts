// This file extends the Jest types to include jest-dom matchers
import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      // Jest-DOM matchers
      toBeInTheDocument(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveTextContent(text: string | RegExp): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeChecked(): R;
      toHaveClass(className: string): R;
      toHaveStyle(style: Record<string, any>): R;
      toHaveFocus(): R;
      toContainElement(element: HTMLElement | null): R;
      toBeEmpty(): R;
      toBeRequired(): R;
      
      // Standard Jest matchers
      toBe(expected: any): R;
      toBeCloseTo(expected: number, precision?: number): R;
      toBeDefined(): R;
      toBeFalsy(): R;
      toBeGreaterThan(expected: number | bigint): R;
      toBeGreaterThanOrEqual(expected: number | bigint): R;
      toBeInstanceOf(expected: Function): R;
      toBeLessThan(expected: number | bigint): R;
      toBeLessThanOrEqual(expected: number | bigint): R;
      toBeNaN(): R;
      toBeNull(): R;
      toBeTruthy(): R;
      toBeUndefined(): R;
      toContain(expected: any): R;
      toContainEqual(expected: any): R;
      toEqual(expected: any): R;
      toHaveBeenCalled(): R;
      toHaveBeenCalledTimes(count: number): R;
      toHaveBeenCalledWith(...args: any[]): R;
      toHaveBeenLastCalledWith(...args: any[]): R;
      toHaveLength(expected: number): R;
      toHaveProperty(keyPath: string | Array<string>, value?: any): R;
      toMatch(expected: string | RegExp): R;
      toMatchObject(expected: object | Array<object>): R;
      toMatchSnapshot(hint?: string): R;
      toStrictEqual(expected: any): R;
      toThrow(error?: string | Constructable | RegExp | Error): R;
      
      // Add missing matchers for our tests
      toBeEmptyDOMElement(): R;
      not: Matchers<R>;
    }
    
    interface Expect {
      objectContaining<T extends object>(obj: T): T;
      stringContaining(str: string): string;
      arrayContaining<T>(arr: T[]): T[];
    }
  }
}

// This defines the Constructable interface used in toThrow
interface Constructable {
  new (...args: any[]): any;
}

// This empty export is needed to make this a module
export {};
