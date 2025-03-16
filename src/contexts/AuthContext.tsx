import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  LoginCredentials, 
  RegistrationData,
  login as authLogin,
  register as authRegister,
  logout as authLogout,
  getCurrentUser,
  isAuthenticated,
  connectWallet
} from '../services/authService';

// Auth context interface
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  logout: () => void;
  connectWalletToAccount: (walletAddress: string) => Promise<void>;
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
  connectWalletToAccount: async () => {},
  clearError: () => {}
});

// Auth provider props interface
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        if (isAuthenticated()) {
          const currentUser = getCurrentUser();
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError('Failed to initialize authentication');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);
  
  // Login function
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const loggedInUser = await authLogin(credentials);
      setUser(loggedInUser);
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
      const registeredUser = await authRegister(data);
      setUser(registeredUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    authLogout();
    setUser(null);
  };
  
  // Connect wallet function
  const connectWalletToAccount = async (walletAddress: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedUser = await connectWallet(walletAddress);
      setUser(updatedUser);
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
  
  // Context value
  const value = {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    connectWalletToAccount,
    clearError
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
