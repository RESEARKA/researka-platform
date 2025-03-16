import { useState, useEffect } from 'react';
import { RoleFeatures } from '../components/RoleFeatures';
import { useAuth } from '../contexts/AuthContext';
import { adminLogin } from '../services/authService';

export function RolesAndPermissions() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'features'>('overview');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Add animation styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .animate-fade-in-up {
        animation: fadeInUp 0.5s ease-out forwards;
      }
      
      .role-card {
        animation-fill-mode: both;
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Function to demo login as different roles
  const loginAsRole = async (role: string) => {
    setIsLoggingIn(true);
    setLoginError(null);
    
    try {
      // Map roles to demo credentials
      const credentials = {
        admin: { username: 'admin', password: 'admin123' },
        editor: { username: 'editor', password: 'editor123' },
        // Add other role credentials as needed
      }[role];
      
      if (credentials) {
        await adminLogin(credentials);
      } else {
        setLoginError(`Demo login not available for ${role} role`);
      }
    } catch (error) {
      setLoginError('Failed to login with demo credentials');
      console.error('Demo login error:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Role descriptions
  const roleDescriptions = {
    admin: {
      title: 'Administrator',
      description: 'Full platform control with access to all features and settings. Administrators manage users, content, and system configuration.',
      responsibilities: [
        'Manage user roles and permissions',
        'Configure platform settings and parameters',
        'Override content decisions when necessary',
        'Monitor platform health and analytics',
        'Manage token economics and financial aspects'
      ]
    },
    editor: {
      title: 'Editor',
      description: 'Content oversight and quality control. Editors manage the review process and ensure content quality.',
      responsibilities: [
        'Curate content and manage categories',
        'Assign reviewers to submissions',
        'Make final publishing decisions',
        'Enforce editorial standards',
        'Create and manage special collections'
      ]
    },
    reviewer: {
      title: 'Reviewer',
      description: 'Subject matter experts who evaluate submissions for quality, accuracy, and relevance.',
      responsibilities: [
        'Evaluate assigned submissions',
        'Provide constructive feedback to authors',
        'Recommend accept/revise/reject decisions',
        'Maintain review quality and timeliness',
        'Collaborate with editors on complex cases'
      ]
    },
    author: {
      title: 'Author',
      description: 'Content creators who submit articles and papers to the platform.',
      responsibilities: [
        'Create and submit original content',
        'Respond to reviewer feedback',
        'Submit revisions when requested',
        'Collaborate with co-authors',
        'Maintain academic integrity and standards'
      ]
    },
    reader: {
      title: 'Reader',
      description: 'Basic users who consume content and participate in the community.',
      responsibilities: [
        'Read and interact with published content',
        'Participate in discussions and comments',
        'Create personal collections',
        'Provide feedback on content quality',
        'Participate in the token economy'
      ]
    },
    moderator: {
      title: 'Community Moderator',
      description: 'Users who help maintain a healthy community by moderating discussions and supporting users.',
      responsibilities: [
        'Monitor and moderate comments and discussions',
        'Enforce community guidelines',
        'Organize community events and discussions',
        'Provide user support and answer questions',
        'Report issues to administrators'
      ]
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden animate-fade-in-up mb-8">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6 text-white">
          <h1 className="text-2xl font-bold">Roles and Permissions</h1>
          <p className="mt-1 opacity-90">
            Researka uses a role-based access control system to manage user permissions and features.
          </p>
        </div>
        
        {loginError && (
          <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded animate-fade-in-up">
            {loginError}
          </div>
        )}
        
        <div className="border-b border-gray-200">
          <div className="px-6 flex overflow-x-auto">
            <button
              className={`py-3 px-4 font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === 'overview' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Role Overview
            </button>
            <button
              className={`py-3 px-4 font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === 'features' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('features')}
            >
              Feature Access
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {activeTab === 'overview' ? (
            <div className="space-y-8">
              <div className="bg-indigo-50 p-5 rounded-lg mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-lg font-semibold text-indigo-800">Role Hierarchy</h2>
                <p className="text-indigo-600 mb-4">
                  Higher-level roles inherit access to features available to lower-level roles.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                  <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-medium shadow-sm">Admin</div>
                  <div className="text-gray-400">→</div>
                  <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full font-medium shadow-sm">Editor</div>
                  <div className="text-gray-400">→</div>
                  <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium shadow-sm">Reviewer</div>
                  <div className="text-gray-400">→</div>
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium shadow-sm">Author</div>
                  <div className="text-gray-400">→</div>
                  <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-medium shadow-sm">Reader</div>
                  <div className="ml-4 bg-red-100 text-red-800 px-4 py-2 rounded-full font-medium shadow-sm">Moderator</div>
                  <div className="text-xs text-gray-500 ml-1">(Special role)</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(roleDescriptions).map(([role, { title, description, responsibilities }], index) => (
                  <div 
                    key={role} 
                    className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 role-card animate-fade-in-up ${
                      user?.role === role ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-gray-200'
                    }`}
                    style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                  >
                    <div className={`p-4 ${getRoleHeaderColor(role)}`}>
                      <h3 className="font-bold text-white text-lg">{title}</h3>
                      {user?.role === role && (
                        <span className="inline-block mt-1 text-xs bg-white bg-opacity-30 text-white px-2 py-0.5 rounded-full">
                          Your Current Role
                        </span>
                      )}
                    </div>
                    
                    <div className="p-5">
                      <p className="text-gray-600 mb-4">{description}</p>
                      
                      <h4 className="font-medium text-gray-800 mb-2">Key Responsibilities:</h4>
                      <ul className="text-sm text-gray-600 space-y-2 mb-4">
                        {responsibilities.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-indigo-500 mr-2 flex-shrink-0">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {role !== user?.role && ['admin', 'editor'].includes(role) && (
                        <button
                          onClick={() => loginAsRole(role)}
                          disabled={isLoggingIn}
                          className="mt-2 w-full text-center py-2 px-4 border border-indigo-500 text-indigo-500 rounded-md hover:bg-indigo-50 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        >
                          {isLoggingIn ? 'Logging in...' : `Demo Login as ${title}`}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <RoleFeatures />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to get role-specific header colors
function getRoleHeaderColor(role: string): string {
  const colors = {
    admin: 'bg-gradient-to-r from-purple-600 to-purple-700',
    editor: 'bg-gradient-to-r from-indigo-600 to-indigo-700',
    reviewer: 'bg-gradient-to-r from-blue-600 to-blue-700',
    author: 'bg-gradient-to-r from-green-600 to-green-700',
    reader: 'bg-gradient-to-r from-yellow-600 to-yellow-700',
    moderator: 'bg-gradient-to-r from-red-600 to-red-700'
  };
  
  return colors[role as keyof typeof colors] || 'bg-gradient-to-r from-gray-600 to-gray-700';
}
