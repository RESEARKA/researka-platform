import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

export function AdminDashboard() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Helper function to determine if a nav link is active
  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-blue-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Researka Admin</h1>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
              />
            </svg>
          </button>
          
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm">Admin User</span>
            <Link 
              to="/" 
              className="text-blue-200 hover:text-white text-sm px-3 py-1 rounded-md"
            >
              Back to Site
            </Link>
            <button className="bg-red-700 hover:bg-red-800 text-white text-sm px-3 py-1 rounded-md">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation */}
          <aside className={`md:w-64 md:block ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
            <nav className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Admin Panel</h2>
              </div>
              <div className="px-2 py-3 space-y-1">
                <Link
                  to="/admin"
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/admin' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/content"
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/admin/content') 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Content Moderation
                </Link>
                <Link
                  to="/admin/users"
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/admin/users') 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  User Management
                </Link>
                <Link
                  to="/admin/analytics"
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/admin/analytics') 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Analytics
                </Link>
                <Link
                  to="/admin/settings"
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/admin/settings') 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Settings
                </Link>
              </div>
            </nav>
            
            {/* Mobile only logout */}
            <div className="mt-4 md:hidden flex flex-col space-y-2">
              <Link 
                to="/" 
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-center py-2 rounded-md"
              >
                Back to Site
              </Link>
              <button className="bg-red-700 hover:bg-red-800 text-white py-2 rounded-md">
                Logout
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 bg-white shadow rounded-lg p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
