import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAnalytics, getPendingSubmissions, getUsers } from '../../services/mockAdminService';

export function AdminHome() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingSubmissions: 0,
    totalUsers: 0,
    activeUsersToday: 0,
    submissionsToday: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      // Simulate API loading delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const analytics = getAnalytics();
      const pendingSubmissions = getPendingSubmissions();
      const users = getUsers();
      
      setStats({
        pendingSubmissions: pendingSubmissions.length,
        totalUsers: users.length,
        activeUsersToday: analytics.userMetrics.activeUsersToday,
        submissionsToday: analytics.contentMetrics.submissionsToday
      });
      
      setIsLoading(false);
    };
    
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded mb-6"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-800 mr-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Submissions</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingSubmissions}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/admin/content" 
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all submissions →
            </Link>
          </div>
        </div>
        
        <div className="bg-white border rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-800 mr-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/admin/users" 
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Manage users →
            </Link>
          </div>
        </div>
        
        <div className="bg-white border rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-800 mr-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users Today</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeUsersToday}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/admin/analytics" 
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View analytics →
            </Link>
          </div>
        </div>
        
        <div className="bg-white border rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-800 mr-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">New Submissions Today</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.submissionsToday}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/admin/content" 
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Review submissions →
            </Link>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white border rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/content"
            className="flex items-center p-4 border rounded-lg hover:bg-blue-50 transition-colors"
          >
            <div className="p-2 rounded-full bg-blue-100 text-blue-800 mr-3">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">Approve Submissions</span>
          </Link>
          
          <Link
            to="/admin/users"
            className="flex items-center p-4 border rounded-lg hover:bg-blue-50 transition-colors"
          >
            <div className="p-2 rounded-full bg-green-100 text-green-800 mr-3">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">Add New User</span>
          </Link>
          
          <Link
            to="/admin/content?filter=pending"
            className="flex items-center p-4 border rounded-lg hover:bg-blue-50 transition-colors"
          >
            <div className="p-2 rounded-full bg-yellow-100 text-yellow-800 mr-3">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">Assign Reviewers</span>
          </Link>
          
          <Link
            to="/admin/analytics"
            className="flex items-center p-4 border rounded-lg hover:bg-blue-50 transition-colors"
          >
            <div className="p-2 rounded-full bg-purple-100 text-purple-800 mr-3">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">View Reports</span>
          </Link>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white border rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-start p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
            <div className="mr-4">
              <div className="p-2 rounded-full bg-blue-100 text-blue-800">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">New article submitted</p>
              <p className="text-sm text-gray-600">
                "Quantum Computing Applications in Cryptography" by Emily Davis
              </p>
              <p className="text-xs text-gray-500 mt-1">10 minutes ago</p>
            </div>
          </div>
          
          <div className="flex items-start p-4 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
            <div className="mr-4">
              <div className="p-2 rounded-full bg-green-100 text-green-800">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">New user registered</p>
              <p className="text-sm text-gray-600">
                Michael Wilson (michael.wilson@example.com)
              </p>
              <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
            </div>
          </div>
          
          <div className="flex items-start p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded-r-lg">
            <div className="mr-4">
              <div className="p-2 rounded-full bg-yellow-100 text-yellow-800">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Review completed</p>
              <p className="text-sm text-gray-600">
                Robert Johnson reviewed "Advances in Neural Networks"
              </p>
              <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-start p-4 border-l-4 border-purple-500 bg-purple-50 rounded-r-lg">
            <div className="mr-4">
              <div className="p-2 rounded-full bg-purple-100 text-purple-800">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Article published</p>
              <p className="text-sm text-gray-600">
                "Climate Change Impact on Marine Ecosystems" by Jane Smith
              </p>
              <p className="text-xs text-gray-500 mt-1">Yesterday</p>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all activity →
          </button>
        </div>
      </div>
    </div>
  );
}
