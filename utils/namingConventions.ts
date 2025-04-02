/**
 * Utility functions for enforcing consistent naming conventions across the codebase.
 * Defines rules for components, hooks, utility functions, and types/interfaces.
 */

// --- Helper Functions for Transformations ---

/**
 * Converts a string to PascalCase.
 * Handles spaces, hyphens, and underscores as delimiters.
 * Removes non-alphanumeric characters (excluding delimiters during split).
 * @param name The string to convert.
 * @returns The PascalCase string.
 */
function toPascalCase(name: string): string {
  if (!name) return '';
  // Remove special characters except delimiters used for splitting
  const cleanedName = name.replace(/[^a-zA-Z0-9\s\-_]/g, '');
  return cleanedName
    .split(/[\s\-_]/) // Split by space, hyphen, or underscore
    .filter(part => part.length > 0)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
}

/**
 * Converts a string to camelCase.
 * Uses the toPascalCase helper first.
 * @param name The string to convert.
 * @returns The camelCase string.
 */
function toCamelCase(name: string): string {
  if (!name) return '';
  const pascal = toPascalCase(name); // Handles cleaning and initial capitalization
  if (!pascal) return '';
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

// --- Naming Convention Rules ---

export const namingConventions = {
  components: {
    description: 'React components (including pages) should be in PascalCase.',
    regex: /^[A-Z][a-zA-Z0-9]*$/,
    /**
     * Validates a component name against the naming conventions
     * @param name The component name to validate
     * @returns Whether the name follows the conventions
     * @example
     * validate('MyComponent') // true
     * validate('myComponent') // false
     * validate('my-component') // false
     * validate('1Component') // false
     * validate('') // false
     */
    validate: (name: string): boolean => {
      if (!name || name.length > 60) return false; // Added length check
      return /^[A-Z][a-zA-Z0-9]*$/.test(name);
    },
    /**
     * Suggests a valid component name based on the input.
     * @param name The input name.
     * @returns A suggested PascalCase name.
     */
    suggest: (name: string): string => {
      return toPascalCase(name);
    },
  },
  hooks: {
    description: 'React hooks should be in camelCase and start with "use".',
    regex: /^use[A-Za-z][a-zA-Z0-9]*$/, // Corrected regex for camelCase
    /**
     * Validates a hook name against the naming conventions
     * @param name The hook name to validate
     * @returns Whether the name follows the conventions
     * @example
     * validate('useUserProfile') // true
     * validate('UseUserProfile') // false
     * validate('useprofile') // false
     * validate('fetchData') // false
     * validate('') // false
     */
    validate: (name: string): boolean => {
      if (!name || name.length > 60) return false; // Added length check
      return /^use[A-Za-z][a-zA-Z0-9]*$/.test(name); // Corrected regex
    },
     /**
     * Suggests a valid hook name based on the input.
     * Ensures the name starts with "use" and is camelCase.
     * @param name The input name.
     * @returns A suggested camelCase hook name starting with "use".
     */
    suggest: (name: string): string => {
       // Remove special characters first
      const cleanedName = name.replace(/[^a-zA-Z0-9\s\-_]/g, '');
      let baseName = cleanedName.startsWith('use')
        ? cleanedName.substring(3)
        : cleanedName;
      // Convert the base part to camelCase
      const camelCaseBase = toCamelCase(baseName);
      // Ensure it starts with "use" and the first letter after "use" is lowercase
      return 'use' + camelCaseBase.charAt(0).toUpperCase() + camelCaseBase.slice(1);
    },
  },
  utilities: {
    description: 'Utility functions should be in camelCase.',
    regex: /^[a-z][a-zA-Z0-9]*$/,
    /**
     * Validates a utility function name against the naming conventions
     * @param name The utility function name to validate
     * @returns Whether the name follows the conventions
     * @example
     * validate('formatDate') // true
     * validate('FormatDate') // false
     * validate('format_date') // false
     * validate('') // false
     */
    validate: (name: string): boolean => {
      if (!name || name.length > 60) return false; // Added length check
      return /^[a-z][a-zA-Z0-9]*$/.test(name);
    },
    /**
     * Suggests a valid utility function name based on the input.
     * @param name The input name.
     * @returns A suggested camelCase name.
     */
    suggest: (name: string): string => {
      return toCamelCase(name);
    },
  },
  typesInterfaces: {
    description: 'TypeScript types and interfaces should be in PascalCase.',
    regex: /^[A-Z][a-zA-Z0-9]*$/,
     /**
     * Validates a type/interface name against the naming conventions
     * @param name The type/interface name to validate
     * @returns Whether the name follows the conventions
     * @example
     * validate('UserProfile') // true
     * validate('userProfile') // false
     * validate('IUserProfile') // Often discouraged, but technically valid PascalCase
     * validate('TUserProfile') // Often discouraged, but technically valid PascalCase
     * validate('') // false
     */
    validate: (name: string): boolean => {
      if (!name || name.length > 60) return false; // Added length check
      // Allow optional I/T prefix for interfaces/types, though pure PascalCase is preferred
      return /^(I|T)?[A-Z][a-zA-Z0-9]*$/.test(name);
    },
     /**
     * Suggests a valid type/interface name based on the input.
     * Removes common incorrect prefixes like 'i' or 't' before PascalCasing.
     * @param name The input name.
     * @returns A suggested PascalCase name.
     */
    suggest: (name: string): string => {
       // Remove special characters first
      let baseName = name.replace(/[^a-zA-Z0-9\s\-_]/g, '');
      // Remove common incorrect prefixes before converting
      if (baseName.match(/^(i|t)[A-Z]/)) {
        baseName = baseName.substring(1);
      }
      return toPascalCase(baseName);
    },
  },
  // Add more rules as needed (e.g., constants, enums)
};

export default namingConventions;
