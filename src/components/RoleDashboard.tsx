import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import React, { useState, useEffect } from 'react';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  roles: ('admin' | 'editor' | 'reviewer' | 'author' | 'reader' | 'moderator')[];
}

export function RoleDashboard() {
  const { user } = useAuth();
  const userRole = user?.role || 'reader';
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Add animation styles to head on component mount
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .animate-fade-in {
        animation: fadeIn 0.5s ease-out forwards;
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  // Define role-specific actions
  const actions: ActionItem[] = [
    // Admin Actions
    {
      id: 'manage-users',
      title: 'Manage Users',
      description: 'View, edit, and manage user accounts and roles',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      link: '/admin/users',
      roles: ['admin']
    },
    {
      id: 'system-settings',
      title: 'System Settings',
      description: 'Configure platform settings and parameters',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      link: '/admin/settings',
      roles: ['admin']
    },
    {
      id: 'analytics-dashboard',
      title: 'Analytics Dashboard',
      description: 'View comprehensive platform metrics and reports',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 110 5m-4 0a2 2 0 110-5m-4 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012 2h2a2 2 0 012-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      link: '/admin/analytics',
      roles: ['admin']
    },
    
    // Editor Actions
    {
      id: 'content-management',
      title: 'Content Management',
      description: 'Curate content and manage editorial guidelines',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      link: '/editor/content',
      roles: ['admin', 'editor']
    },
    {
      id: 'review-assignments',
      title: 'Review Assignments',
      description: 'Assign reviewers and monitor review quality',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      link: '/editor/reviews',
      roles: ['admin', 'editor']
    },
    {
      id: 'publishing-queue',
      title: 'Publishing Queue',
      description: 'Approve peer-reviewed content and schedule publications',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      link: '/editor/publishing',
      roles: ['admin', 'editor']
    },
    
    // Reviewer Actions
    {
      id: 'pending-reviews',
      title: 'Pending Reviews',
      description: 'View assigned submissions and track review deadlines',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      link: '/reviewer/pending',
      roles: ['admin', 'editor', 'reviewer']
    },
    {
      id: 'completed-reviews',
      title: 'Completed Reviews',
      description: 'Access your review history and feedback',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      link: '/reviewer/completed',
      roles: ['admin', 'editor', 'reviewer']
    },
    {
      id: 'expertise-settings',
      title: 'Expertise Settings',
      description: 'Define areas of expertise and set availability for reviews',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      link: '/reviewer/expertise',
      roles: ['admin', 'editor', 'reviewer']
    },
    
    // Author Actions
    {
      id: 'my-submissions',
      title: 'My Submissions',
      description: 'Track submission status and respond to reviewer comments',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      link: '/author/submissions',
      roles: ['admin', 'editor', 'reviewer', 'author']
    },
    {
      id: 'create-article',
      title: 'Create New Article',
      description: 'Start writing a new article with rich text editor',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      link: '/submit',
      roles: ['admin', 'editor', 'reviewer', 'author']
    },
    {
      id: 'author-metrics',
      title: 'Author Metrics',
      description: 'View publication history and track article metrics',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      link: '/author/metrics',
      roles: ['admin', 'editor', 'reviewer', 'author']
    },
    
    // Reader Actions
    {
      id: 'my-library',
      title: 'My Library',
      description: 'Access your saved articles and collections',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      link: '/reader/library',
      roles: ['admin', 'editor', 'reviewer', 'author', 'reader']
    },
    {
      id: 'personalized-feed',
      title: 'Personalized Feed',
      description: 'View recommended articles based on your interests',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
      link: '/reader/feed',
      roles: ['admin', 'editor', 'reviewer', 'author', 'reader']
    },
    {
      id: 'token-wallet',
      title: 'Token Wallet',
      description: 'Manage your tokens and participate in the token economy',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      link: '/wallet',
      roles: ['admin', 'editor', 'reviewer', 'author', 'reader']
    },
    
    // Moderator Actions
    {
      id: 'moderation-queue',
      title: 'Moderation Queue',
      description: 'Review and moderate user comments and discussions',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      link: '/moderator/queue',
      roles: ['admin', 'moderator']
    },
    {
      id: 'community-discussions',
      title: 'Community Discussions',
      description: 'Create and manage discussion threads and events',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 002-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      ),
      link: '/moderator/discussions',
      roles: ['admin', 'moderator']
    }
  ];
  
  // Filter actions available for the current user's role
  const availableActions = actions.filter(action => 
    action.roles.includes(userRole as any)
  );

  // Group actions by role for filtering
  const actionCategories = [
    { id: 'all', label: 'All Actions' },
    { id: 'admin', label: 'Admin' },
    { id: 'editor', label: 'Editor' },
    { id: 'reviewer', label: 'Reviewer' },
    { id: 'author', label: 'Author' },
    { id: 'reader', label: 'Reader' },
    { id: 'moderator', label: 'Moderator' }
  ].filter(category => 
    category.id === 'all' || availableActions.some(action => action.roles.includes(category.id as any))
  );

  // Filter actions based on selected category
  const filteredActions = activeCategory === 'all' 
    ? availableActions 
    : availableActions.filter(action => action.roles.includes(activeCategory as any));
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
        <h2 className="text-2xl font-bold">Your Dashboard</h2>
        <p className="mt-1 opacity-90">
          Welcome back{user?.username ? `, ${user.username}` : ''}! Here are the actions available for your {userRole} role.
        </p>
      </div>
      
      {/* Category filters */}
      <div className="border-b border-gray-200 px-6 py-3 overflow-x-auto">
        <div className="flex space-x-2">
          {actionCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap ${
                activeCategory === category.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActions.length > 0 ? (
            filteredActions.map((action, index) => (
              <Link 
                key={action.id} 
                to={action.link}
                className="flex items-start p-5 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-lg transition-all duration-300 group animate-fade-in"
                style={{ 
                  animationDelay: `${index * 50}ms`
                }}
              >
                <div className="flex-shrink-0 mr-4 text-gray-500 group-hover:text-blue-500 transition-colors duration-300">
                  {action.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors duration-300">{action.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              No actions available for the selected category.
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center">
          <Link 
            to="/roles" 
            className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full transition-colors duration-200"
          >
            <span>View all available features by role</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
