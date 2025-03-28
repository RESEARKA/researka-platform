/**
 * Naming Conventions for DecentraJournal Frontend
 * 
 * This file defines the naming conventions for components, hooks, and other entities
 * in the DecentraJournal frontend codebase. Following these conventions ensures
 * consistency and makes the codebase more maintainable.
 */

/**
 * Component Naming Conventions
 * 
 * - Use PascalCase for component names
 * - Use descriptive names that reflect the component's purpose
 * - Prefix components with their category if applicable (e.g., ProfileHeader)
 * - Suffix components with their type if applicable (e.g., UserAvatar)
 * 
 * Examples:
 * - Button, Card, Modal (generic components)
 * - ProfileHeader, ArticleCard, ReviewList (domain-specific components)
 * - UserAvatar, ArticleImage, ProfileBanner (specialized components)
 */
export const componentNamingRules = {
  /**
   * Validates a component name against the naming conventions
   * @param name The component name to validate
   * @returns Whether the name follows the conventions
   */
  validate: (name: string): boolean => {
    // Component names must be PascalCase
    return /^[A-Z][a-zA-Z0-9]*$/.test(name);
  },
  
  /**
   * Suggests a corrected component name based on the naming conventions
   * @param name The component name to correct
   * @returns A corrected component name
   */
  suggest: (name: string): string => {
    // Convert to PascalCase
    if (!name) return '';
    
    // If name has spaces, hyphens, or underscores, convert to PascalCase
    if (/[\s\-_]/.test(name)) {
      return name
        .split(/[\s\-_]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join('');
    }
    
    // If name is already camelCase, convert to PascalCase
    if (/^[a-z]/.test(name)) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    
    return name;
  }
};

/**
 * Hook Naming Conventions
 * 
 * - Use camelCase for hook names
 * - Prefix hooks with 'use'
 * - Use descriptive names that reflect the hook's purpose
 * 
 * Examples:
 * - useState, useEffect, useContext (React built-in hooks)
 * - useProfileData, useArticles, useReviews (domain-specific hooks)
 * - useLocalStorage, useDebounce, useMediaQuery (utility hooks)
 */
export const hookNamingRules = {
  /**
   * Validates a hook name against the naming conventions
   * @param name The hook name to validate
   * @returns Whether the name follows the conventions
   */
  validate: (name: string): boolean => {
    // Hook names must start with 'use' and be camelCase
    return /^use[A-Z][a-zA-Z0-9]*$/.test(name);
  },
  
  /**
   * Suggests a corrected hook name based on the naming conventions
   * @param name The hook name to correct
   * @returns A corrected hook name
   */
  suggest: (name: string): string => {
    // If name doesn't start with 'use', add it
    if (!name.startsWith('use')) {
      name = 'use' + name;
    }
    
    // If name has spaces, hyphens, or underscores, convert to camelCase
    if (/[\s\-_]/.test(name)) {
      return name
        .split(/[\s\-_]/)
        .map((part, index) => {
          if (index === 0) return part.toLowerCase();
          return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        })
        .join('');
    }
    
    // Ensure the first character after 'use' is uppercase
    if (name.length > 3) {
      return 'use' + name.charAt(3).toUpperCase() + name.slice(4);
    }
    
    return name;
  }
};

/**
 * Utility Function Naming Conventions
 * 
 * - Use camelCase for utility function names
 * - Use descriptive names that reflect the function's purpose
 * - Use verb-noun format for action functions (e.g., formatDate, validateEmail)
 * 
 * Examples:
 * - formatDate, validateEmail, calculateTotal (action functions)
 * - isValidEmail, hasPermission, shouldUpdate (predicate functions)
 * - getUser, findArticle, fetchData (getter functions)
 */
export const utilityFunctionNamingRules = {
  /**
   * Validates a utility function name against the naming conventions
   * @param name The utility function name to validate
   * @returns Whether the name follows the conventions
   */
  validate: (name: string): boolean => {
    // Utility function names must be camelCase
    return /^[a-z][a-zA-Z0-9]*$/.test(name);
  },
  
  /**
   * Suggests a corrected utility function name based on the naming conventions
   * @param name The utility function name to correct
   * @returns A corrected utility function name
   */
  suggest: (name: string): string => {
    // Convert to camelCase
    if (!name) return '';
    
    // If name has spaces, hyphens, or underscores, convert to camelCase
    if (/[\s\-_]/.test(name)) {
      return name
        .split(/[\s\-_]/)
        .map((part, index) => {
          if (index === 0) return part.toLowerCase();
          return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        })
        .join('');
    }
    
    // If name is PascalCase, convert to camelCase
    if (/^[A-Z]/.test(name)) {
      return name.charAt(0).toLowerCase() + name.slice(1);
    }
    
    return name;
  }
};

/**
 * Type and Interface Naming Conventions
 * 
 * - Use PascalCase for type and interface names
 * - Suffix interfaces with props when they represent component props (e.g., ButtonProps)
 * - Suffix interfaces with state when they represent component state (e.g., ProfileState)
 * 
 * Examples:
 * - User, Article, Review (domain models)
 * - ButtonProps, CardProps, ModalProps (component props)
 * - ProfileState, AuthState, AppState (component or application state)
 */
export const typeNamingRules = {
  /**
   * Validates a type or interface name against the naming conventions
   * @param name The type or interface name to validate
   * @returns Whether the name follows the conventions
   */
  validate: (name: string): boolean => {
    // Type and interface names must be PascalCase
    return /^[A-Z][a-zA-Z0-9]*$/.test(name);
  },
  
  /**
   * Suggests a corrected type or interface name based on the naming conventions
   * @param name The type or interface name to correct
   * @returns A corrected type or interface name
   */
  suggest: (name: string): string => {
    // Convert to PascalCase
    if (!name) return '';
    
    // If name has spaces, hyphens, or underscores, convert to PascalCase
    if (/[\s\-_]/.test(name)) {
      return name
        .split(/[\s\-_]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join('');
    }
    
    // If name is camelCase, convert to PascalCase
    if (/^[a-z]/.test(name)) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    
    return name;
  }
};

export default {
  componentNamingRules,
  hookNamingRules,
  utilityFunctionNamingRules,
  typeNamingRules
};
