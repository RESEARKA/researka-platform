// Authentication service for handling login, registration, and session management
import { jwtDecode } from 'jwt-decode';

// User interface
export interface User {
  id: string;
  username: string;
  email: string;
  walletAddress?: string;
  orcidId?: string;
  institution?: string;
  isVerified: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  role: 'admin' | 'editor' | 'reviewer' | 'author' | 'reader' | 'moderator';
}

// JWT Token interface
interface JwtPayload {
  sub: string;
  username: string;
  email: string;
  walletAddress?: string;
  orcidId?: string;
  institution?: string;
  isVerified: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  role: 'admin' | 'editor' | 'reviewer' | 'author' | 'reader' | 'moderator';
  exp: number;
}

// Login credentials interface
export interface LoginCredentials {
  username: string;
  password: string;
}

// Registration data interface
export interface RegistrationData {
  username: string;
  email: string;
  password: string;
  orcidId?: string;
  institution?: string;
  additionalDocuments?: File[];
}

// Local storage keys
const TOKEN_KEY = 'researka_token';
const USER_KEY = 'researka_user';

/**
 * Login with username and password
 */
export async function login(credentials: LoginCredentials): Promise<User> {
  try {
    // For demo purposes, we're simulating an API call
    // In production, replace this with a real API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock successful login response
    if (credentials.username && credentials.password) {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcm5hbWUiOiJqb2huZG9lIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwicm9sZSI6InJlYWRlciIsImV4cCI6MTY5MzUyMzYwMH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      
      const mockUser: User = {
        id: '123456789',
        username: credentials.username,
        email: `${credentials.username}@example.com`,
        role: 'author',
        isVerified: false,
        verificationStatus: 'pending'
      };
      
      // Store token and user in local storage
      localStorage.setItem(TOKEN_KEY, mockToken);
      localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
      
      return mockUser;
    }
    
    throw new Error('Invalid credentials');
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Specialized admin login with username and password
 * This enforces stricter validation and only returns admin users
 */
export async function adminLogin(credentials: LoginCredentials): Promise<User> {
  try {
    // For demo purposes, we're simulating an API call
    // In production, replace this with a real API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock admin credentials check
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5OTk5OTk5OTkiLCJ1c2VybmFtZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkBkZWNlbnRyYWpvdXJuYWwuY29tIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNjkzNTIzNjAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      
      const mockUser: User = {
        id: '999999999',
        username: 'admin',
        email: 'admin@researka.com',
        role: 'admin',
        isVerified: true,
        verificationStatus: 'verified'
      };
      
      // Store token and user in local storage
      localStorage.setItem(TOKEN_KEY, mockToken);
      localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
      
      return mockUser;
    }
    
    // Mock editor credentials check
    if (credentials.username === 'editor' && credentials.password === 'editor123') {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4ODg4ODg4ODgiLCJ1c2VybmFtZSI6ImVkaXRvciIsImVtYWlsIjoiZWRpdG9yQGRlY2VudHJham91cm5hbC5jb20iLCJyb2xlIjoiZWRpdG9yIiwiZXhwIjoxNjkzNTIzNjAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      
      const mockUser: User = {
        id: '888888888',
        username: 'editor',
        email: 'editor@researka.com',
        role: 'editor',
        isVerified: true,
        verificationStatus: 'verified'
      };
      
      // Store token and user in local storage
      localStorage.setItem(TOKEN_KEY, mockToken);
      localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
      
      return mockUser;
    }
    
    throw new Error('Invalid admin credentials');
  } catch (error) {
    console.error('Admin login error:', error);
    throw error;
  }
}

/**
 * Register a new user
 */
export async function register(data: RegistrationData): Promise<User> {
  try {
    // For demo purposes, we're simulating an API call
    // In production, replace this with a real API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful registration response
    if (data.username && data.email && data.password) {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5ODc2NTQzMjEiLCJ1c2VybmFtZSI6ImRhdGEudXNlcm5hbWUiLCJlbWFpbCI6ImRhdGEuZW1haWwiLCJyb2xlIjoidXNlciIsImV4cCI6MTY5MzUyMzYwMH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      
      // Check if email is from an educational institution
      const isInstitutionalEmail = checkInstitutionalEmail(data.email);
      
      // Determine verification status based on email and ORCID
      const verificationStatus = determineVerificationStatus(data.email, data.orcidId);
      
      const mockUser: User = {
        id: '987654321',
        username: data.username,
        email: data.email,
        orcidId: data.orcidId,
        institution: data.institution,
        role: 'author',
        isVerified: isInstitutionalEmail,
        verificationStatus: verificationStatus
      };
      
      // Store token and user in local storage
      localStorage.setItem(TOKEN_KEY, mockToken);
      localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
      
      return mockUser;
    }
    
    throw new Error('Invalid registration data');
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

/**
 * Check if email is from an educational institution
 */
function checkInstitutionalEmail(email: string): boolean {
  if (!email) return false;
  
  // Check for common educational domain patterns
  const eduDomains = [
    /\.edu$/,                 // US educational institutions
    /\.ac\.[a-z]{2,}$/,       // Academic institutions in many countries (ac.uk, ac.jp, etc.)
    /\.edu\.[a-z]{2,}$/       // Educational institutions in some countries
  ];
  
  return eduDomains.some(pattern => pattern.test(email.toLowerCase()));
}

/**
 * Determine verification status based on email and ORCID
 */
function determineVerificationStatus(email: string, orcidId?: string): 'pending' | 'verified' | 'rejected' {
  // Institutional email automatically gets verified status
  if (checkInstitutionalEmail(email)) {
    return 'verified';
  }
  
  // Non-institutional email with ORCID ID gets pending status
  if (orcidId) {
    return 'pending';
  }
  
  // Non-institutional email without ORCID ID gets rejected status
  return 'rejected';
}

/**
 * Logout the current user
 */
export function logout(): void {
  // Remove token and user from local storage
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Get the current authenticated user
 */
export function getCurrentUser(): User | null {
  try {
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) return null;
    
    return JSON.parse(userJson) as User;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Check if the user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;
  
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    if (decoded.exp < currentTime) {
      // Token is expired, remove from storage
      logout();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

/**
 * Check if the user has a specific role
 */
export function hasRole(role: 'admin' | 'editor' | 'reviewer' | 'author' | 'reader' | 'moderator'): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Admin role has access to everything
  if (user.role === 'admin') return true;
  
  // Editor role has access to editor and below
  if (user.role === 'editor' && (role === 'editor' || role === 'reviewer' || role === 'author' || role === 'reader' || role === 'moderator')) return true;
  
  // Reviewer role has access to reviewer and below
  if (user.role === 'reviewer' && (role === 'reviewer' || role === 'author' || role === 'reader' || role === 'moderator')) return true;
  
  // Author role has access to author and below
  if (user.role === 'author' && (role === 'author' || role === 'reader' || role === 'moderator')) return true;
  
  // Reader role has access to reader and below
  if (user.role === 'reader' && (role === 'reader' || role === 'moderator')) return true;
  
  // Moderator role only has access to moderator level
  if (user.role === 'moderator' && role === 'moderator') return true;
  
  return false;
}

/**
 * Get the authentication token
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Connect wallet address to user account
 */
export async function connectWallet(walletAddress: string): Promise<User> {
  try {
    // For demo purposes, we're simulating an API call
    // In production, replace this with a real API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    // Update user with wallet address
    const updatedUser: User = {
      ...currentUser,
      walletAddress
    };
    
    // Update user in local storage
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    
    return updatedUser;
  } catch (error) {
    console.error('Connect wallet error:', error);
    throw error;
  }
}
