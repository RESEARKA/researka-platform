/**
 * Utility functions for handling author data
 */

/**
 * Checks if a string appears to be a wallet address
 * 
 * @param str - The string to check
 * @returns boolean - True if the string appears to be a wallet address
 */
export const isWalletAddress = (str?: string): boolean => {
  if (!str) return false;
  
  // Check for typical wallet address patterns
  const ethereumPattern = /^(0x)?[0-9a-fA-F]{40}$/;
  
  // Check for other wallet-like patterns (long alphanumeric strings without spaces)
  // This is a simplified check that looks for strings that are likely wallet addresses
  const otherWalletPattern = /^[a-zA-Z0-9]{30,50}$/;
  
  return ethereumPattern.test(str) || 
         (otherWalletPattern.test(str) && !str.includes(' '));
};

/**
 * Gets a display name for an author, handling wallet addresses and empty values
 * 
 * @param displayName - The author's display name (from Firebase Auth)
 * @param name - The author's name (from Firestore)
 * @param userId - The author's user ID (usually a wallet address)
 * @returns string - A human-readable display name
 */
export const getAuthorDisplayName = (
  displayName?: string, 
  name?: string, 
  userId?: string
): string => {
  // Try displayName first
  if (displayName && !isWalletAddress(displayName)) {
    return displayName;
  }
  
  // Then try name
  if (name && !isWalletAddress(name)) {
    return name;
  }
  
  // If we have a userId but it looks like a wallet address, return Anonymous
  if (userId && isWalletAddress(userId)) {
    return 'Anonymous Author';
  }
  
  // Fall back to Anonymous Author
  return 'Anonymous Author';
};
