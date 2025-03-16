import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'editor' | 'reviewer' | 'author' | 'reader' | 'moderator';
}

/**
 * A wrapper component that protects routes requiring authentication
 * Redirects to login if user is not authenticated
 * Optionally checks for specific user roles
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // If still loading auth state, return null (or a loading spinner)
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    // Save the location the user was trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a role is required, check if the user has that role
  if (requiredRole && user?.role !== requiredRole) {
    // Check for role hierarchy
    const hasAccess = checkRoleAccess(user?.role, requiredRole);
    
    if (!hasAccess) {
      // User doesn't have the required role
      return (
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-700 mb-4">
            You don't have the required permissions to access this page.
          </p>
          <p className="text-gray-700 mb-4">
            Required role: <span className="font-semibold">{requiredRole}</span>
          </p>
          <p className="text-gray-700 mb-4">
            Your role: <span className="font-semibold">{user?.role}</span>
          </p>
          <p className="text-gray-700">
            Please contact an administrator if you believe this is an error.
          </p>
        </div>
      );
    }
  }

  // User is authenticated and has the required role (if any)
  return <>{children}</>;
}

/**
 * Helper function to check if a user's role has access to a required role
 * based on role hierarchy
 */
function checkRoleAccess(userRole?: string, requiredRole?: string): boolean {
  if (!userRole || !requiredRole) return false;
  
  // Role hierarchy
  const roleHierarchy: Record<string, string[]> = {
    'admin': ['admin', 'editor', 'reviewer', 'author', 'reader', 'moderator'],
    'editor': ['editor', 'reviewer', 'author', 'reader', 'moderator'],
    'reviewer': ['reviewer', 'author', 'reader', 'moderator'],
    'author': ['author', 'reader', 'moderator'],
    'reader': ['reader', 'moderator'],
    'moderator': ['moderator']
  };
  
  // Check if the user's role has access to the required role
  return roleHierarchy[userRole]?.includes(requiredRole) || false;
}
