/**
 * Type guard utilities for DecentraJournal
 * 
 * This file contains type guard functions to help enforce type safety
 * throughout the application.
 */

/**
 * Type guard to check if a value is not null or undefined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard to check if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard to check if a value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard to check if a value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Type guard to check if a value is an object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard to check if a value is an array
 */
export function isArray<T>(value: unknown, itemGuard?: (item: unknown) => item is T): value is T[] {
  if (!Array.isArray(value)) {
    return false;
  }
  
  if (itemGuard) {
    return value.every(item => itemGuard(item));
  }
  
  return true;
}

/**
 * Type guard to check if a value is a valid date
 */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Type guard to check if a value is a valid ISO date string
 */
export function isISODateString(value: unknown): value is string {
  if (!isString(value)) return false;
  const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/;
  return isoDatePattern.test(value);
}

/**
 * Type guard to check if a value has all required properties
 */
export function hasRequiredProperties<T extends Record<string, unknown>>(
  value: unknown,
  requiredProps: (keyof T)[]
): value is T {
  if (!isObject(value)) return false;
  
  return requiredProps.every(prop => 
    Object.prototype.hasOwnProperty.call(value, prop) && 
    isDefined(value[prop as string])
  );
}

/**
 * Type assertion function that throws an error if condition is false
 */
export function assertCondition(
  condition: boolean,
  message = 'Assertion failed'
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * Type assertion function that throws if value is null or undefined
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message = 'Value is null or undefined'
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
}

/**
 * Safe type casting with runtime validation
 */
export function safeCast<T>(
  value: unknown,
  typeGuard: (val: unknown) => val is T,
  defaultValue?: T
): T {
  if (typeGuard(value)) {
    return value;
  }
  
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  
  throw new TypeError('Type cast failed');
}
