// This file extends the Jest types to include all standard matchers

// Extend Jest's expect
declare global {
  namespace jest {
    // Add the missing matchers to the Expect interface
    interface Expect {
      toBeTruthy(): jest.Matchers<void>;
      toBeFalsy(): jest.Matchers<void>;
      toBeDefined(): jest.Matchers<void>;
      toBeUndefined(): jest.Matchers<void>;
      toBeNull(): jest.Matchers<void>;
      toBeNaN(): jest.Matchers<void>;
      toBe(expected: any): jest.Matchers<void>;
      toEqual(expected: any): jest.Matchers<void>;
      toStrictEqual(expected: any): jest.Matchers<void>;
      toHaveBeenCalled(): jest.Matchers<void>;
      toHaveBeenCalledTimes(expected: number): jest.Matchers<void>;
      toHaveBeenCalledWith(...args: any[]): jest.Matchers<void>;
      toHaveBeenLastCalledWith(...args: any[]): jest.Matchers<void>;
      toHaveBeenNthCalledWith(nthCall: number, ...args: any[]): jest.Matchers<void>;
      toHaveReturned(): jest.Matchers<void>;
      toHaveReturnedTimes(expected: number): jest.Matchers<void>;
      toHaveReturnedWith(expected: any): jest.Matchers<void>;
      toHaveLastReturnedWith(expected: any): jest.Matchers<void>;
      toHaveNthReturnedWith(nthCall: number, expected: any): jest.Matchers<void>;
      toHaveLength(expected: number): jest.Matchers<void>;
      toHaveProperty(keyPath: string | string[], value?: any): jest.Matchers<void>;
      toBeGreaterThan(expected: number | bigint): jest.Matchers<void>;
      toBeGreaterThanOrEqual(expected: number | bigint): jest.Matchers<void>;
      toBeLessThan(expected: number | bigint): jest.Matchers<void>;
      toBeLessThanOrEqual(expected: number | bigint): jest.Matchers<void>;
      toBeInstanceOf(expected: any): jest.Matchers<void>;
      toMatch(expected: string | RegExp): jest.Matchers<void>;
      toMatchObject(expected: object | object[]): jest.Matchers<void>;
      toMatchSnapshot(propertyMatchers?: any, hint?: string): jest.Matchers<void>;
      toMatchInlineSnapshot(propertyMatchers?: any, inlineSnapshot?: string): jest.Matchers<void>;
      toThrow(error?: string | Error | RegExp): jest.Matchers<void>;
      toThrowErrorMatchingSnapshot(hint?: string): jest.Matchers<void>;
      toThrowErrorMatchingInlineSnapshot(inlineSnapshot?: string): jest.Matchers<void>;
    }
  }
}

// Augment the global expect
declare global {
  const expect: jest.Expect;
}

export {};
