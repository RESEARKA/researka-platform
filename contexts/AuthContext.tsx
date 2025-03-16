import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

// User type definition
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'author' | 'reviewer' | 'editor' | 'admin';
  name?: string;
  profileImage?: string;
  bio?: string;
  institution?: string;
  interests?: string[];
  submissions?: any[];
  reviews?: any[];
  citations?: number;
  walletAddress?: string;
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
  confirmPassword: string;
}

// Mock authentication service functions
// In a real app, these would connect to your backend API
const mockUsers: User[] = [
  {
    id: '1',
    username: 'researcher',
    email: 'researcher@example.com',
    role: 'author',
    name: 'John Researcher',
    bio: 'Blockchain researcher focusing on ZK proofs and layer 2 scaling solutions',
    institution: 'Blockchain Research Institute',
    interests: ['Blockchain', 'Cryptography', 'ZK Proofs', 'Layer 2'],
    submissions: [{id: 's1', title: 'ZK Proofs in Academic Publishing'}],
    reviews: [{id: 'r1', title: 'Review of Layer 2 Solutions'}],
    citations: 12
  },
  {
    id: '2',
    username: 'reviewer',
    email: 'reviewer@example.com',
    role: 'reviewer',
    name: 'Alice Reviewer',
    institution: 'Crypto University'
  },
  {
    id: '3',
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    name: 'Admin User'
  }
];

// Auth context interface
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  logout: () => void;
  connectWallet: (address: string) => Promise<void>;
  clearError: () => void;
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  connectWallet: async () => {},
  clearError: () => {}
});

interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Compute isAuthenticated from user state
  const isAuthenticated = useMemo(() => user !== null, [user]);
  
  // Initialize auth state on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);
  
  // Login function
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find user with matching credentials
      const foundUser = mockUsers.find(u => u.username === credentials.username);
      
      if (foundUser && credentials.password === 'password') { // In a real app, you'd verify the password hash
        setUser(foundUser);
        localStorage.setItem('user', JSON.stringify(foundUser));
        return;
      }
      
      throw new Error('Invalid username or password');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Register function
  const register = async (data: RegistrationData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if passwords match
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      // Check if username already exists
      if (mockUsers.some(u => u.username === data.username)) {
        throw new Error('Username already exists');
      }
      
      // Create new user
      const newUser: User = {
        id: String(mockUsers.length + 1),
        username: data.username,
        email: data.email,
        role: 'author'
      };
      
      // Add to mock users (in a real app, you'd save to database)
      mockUsers.push(newUser);
      
      // Auto-login the new user
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };
  
  // Connect wallet function
  const connectWallet = async (address: string) => {
    if (!user) {
      setError('You must be logged in to connect a wallet');
      throw new Error('Not authenticated');
    }
    
    setIsLoading(true);
    try {
      // Update user with wallet address
      const updatedUser = {
        ...user,
        walletAddress: address
      };
      
      // Save updated user
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Clear error function
  const clearError = () => {
    setError(null);
  };
  
  // Create the context value object using useMemo to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    connectWallet,
    clearError
  }), [user, isLoading, error, isAuthenticated]);
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}
