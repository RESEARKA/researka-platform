import { useState, useEffect } from 'react';
import { getAnalytics, AnalyticsData } from '../../services/mockAdminService';

export function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  
  useEffect(() => {
    const fetchAnalytics = async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const data = getAnalytics();
      setAnalytics(data);
      setIsLoading(false);
    };
    
    fetchAnalytics();
  }, [timeRange]);
  
  if (isLoading || !analytics) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded mb-6"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Time Range:</span>
          <select
            className="border rounded-md text-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>
      
      {/* User Metrics */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">User Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-800 mr-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.userMetrics.totalUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-800 mr-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">New Users (Today)</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.userMetrics.newUsersToday}</p>
              </div>
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
                <p className="text-sm font-medium text-gray-600">Active Users (Today)</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.userMetrics.activeUsersToday}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-800 mr-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">User Roles</p>
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded">
                    Admin: {analytics.userMetrics.usersByRole.admin}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">
                    Editor: {analytics.userMetrics.usersByRole.editor}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded">
                    Reviewer: {analytics.userMetrics.usersByRole.reviewer}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Metrics */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Content Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-800 mr-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Articles</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.contentMetrics.totalArticles}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-800 mr-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">New Submissions (Today)</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.contentMetrics.submissionsToday}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-800 mr-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.contentMetrics.pendingReviews}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-800 mr-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Review Time</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.contentMetrics.averageReviewTime} days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Token Metrics */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Token Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-800 mr-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.tokenMetrics.totalTransactions}</p>
                <p className="text-xs text-gray-500 mt-1">Today: {analytics.tokenMetrics.transactionsToday}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-800 mr-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tokens in Circulation</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {(analytics.tokenMetrics.totalTokensInCirculation / 1000000).toFixed(2)}M
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Staked: {(analytics.tokenMetrics.totalTokensStaked / 1000000).toFixed(2)}M
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-800 mr-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Transaction Value</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.tokenMetrics.averageTransactionValue} DJOUR</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border rounded-lg shadow-sm p-6">
          <h4 className="text-base font-medium text-gray-900 mb-4">User Growth</h4>
          <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
            <p className="text-gray-500">User Growth Chart Placeholder</p>
          </div>
        </div>
        
        <div className="bg-white border rounded-lg shadow-sm p-6">
          <h4 className="text-base font-medium text-gray-900 mb-4">Article Submissions</h4>
          <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
            <p className="text-gray-500">Article Submissions Chart Placeholder</p>
          </div>
        </div>
      </div>
      
      {/* Category Distribution */}
      <div className="bg-white border rounded-lg shadow-sm p-6 mb-8">
        <h4 className="text-base font-medium text-gray-900 mb-4">Articles by Category</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(analytics.contentMetrics.articlesByCategory).map(([category, count]) => (
            <div key={category} className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm font-medium text-gray-900">{category}</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ 
                    width: `${Math.min(100, (count / analytics.contentMetrics.totalArticles) * 100)}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{count} articles</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Export Options */}
      <div className="flex justify-end">
        <button className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 mr-3">
          Export as CSV
        </button>
        <button className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Export as PDF
        </button>
      </div>
    </div>
  );
}
