import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdminRouteProps {
  children: ReactNode;
}

/**
 * A specialized route component that protects admin routes
 * Redirects to admin login if user is not authenticated or not an admin
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // If still loading auth state, show loading spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated at all, redirect to admin login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If authenticated but not an admin, show access denied
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Admin Access Denied</h2>
        <p className="text-gray-700 mb-4">
          This area is restricted to administrators only.
        </p>
        <p className="text-gray-700 mb-4">
          Your current role: <span className="font-semibold">{user?.role}</span>
        </p>
        <p className="text-gray-700">
          If you believe this is an error, please contact the system administrator.
        </p>
      </div>
    );
  }

  // User is authenticated and is an admin
  return <>{children}</>;
}
