import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

interface FeatureItem {
  id: string;
  name: string;
  description: string;
  availableFor: ('admin' | 'editor' | 'reviewer' | 'author' | 'reader' | 'moderator')[];
}

// Define features for each role
const features: FeatureItem[] = [
  // Admin Features
  {
    id: 'system-config',
    name: 'System Configuration',
    description: 'Manage platform settings, token economics, and system parameters',
    availableFor: ['admin']
  },
  {
    id: 'user-management',
    name: 'User Management',
    description: 'Assign/revoke roles and manage user accounts',
    availableFor: ['admin']
  },
  {
    id: 'content-oversight',
    name: 'Content Oversight',
    description: 'Override content decisions and manage platform content',
    availableFor: ['admin']
  },
  {
    id: 'admin-analytics',
    name: 'Full Analytics Dashboard',
    description: 'View comprehensive platform metrics and generate reports',
    availableFor: ['admin']
  },
  {
    id: 'financial-management',
    name: 'Financial Management',
    description: 'Manage token distribution, rewards, and view financial reports',
    availableFor: ['admin']
  },
  
  // Editor Features
  {
    id: 'content-management',
    name: 'Content Management',
    description: 'Curate content, manage categories, and create editorial guidelines',
    availableFor: ['admin', 'editor']
  },
  {
    id: 'review-management',
    name: 'Review Management',
    description: 'Assign reviewers and monitor review quality',
    availableFor: ['admin', 'editor']
  },
  {
    id: 'publishing-controls',
    name: 'Publishing Controls',
    description: 'Approve peer-reviewed content and schedule publications',
    availableFor: ['admin', 'editor']
  },
  {
    id: 'editor-analytics',
    name: 'Content Analytics',
    description: 'View content performance metrics and submission trends',
    availableFor: ['admin', 'editor']
  },
  {
    id: 'quality-assurance',
    name: 'Quality Assurance',
    description: 'Enforce editorial standards and provide feedback',
    availableFor: ['admin', 'editor']
  },
  
  // Reviewer Features
  {
    id: 'review-dashboard',
    name: 'Review Dashboard',
    description: 'View assigned submissions and track review deadlines',
    availableFor: ['admin', 'editor', 'reviewer']
  },
  {
    id: 'review-tools',
    name: 'Review Tools',
    description: 'Use structured review forms and provide detailed feedback',
    availableFor: ['admin', 'editor', 'reviewer']
  },
  {
    id: 'expertise-management',
    name: 'Expertise Management',
    description: 'Define areas of expertise and set availability for reviews',
    availableFor: ['admin', 'editor', 'reviewer']
  },
  {
    id: 'reviewer-communication',
    name: 'Reviewer Communication',
    description: 'Communicate anonymously with authors and consult with editors',
    availableFor: ['admin', 'editor', 'reviewer']
  },
  {
    id: 'learning-resources',
    name: 'Learning Resources',
    description: 'Access reviewer guidelines and training materials',
    availableFor: ['admin', 'editor', 'reviewer']
  },
  
  // Author Features
  {
    id: 'submission-management',
    name: 'Submission Management',
    description: 'Track submission status and respond to reviewer comments',
    availableFor: ['admin', 'editor', 'reviewer', 'author']
  },
  {
    id: 'author-dashboard',
    name: 'Author Dashboard',
    description: 'View publication history and track article metrics',
    availableFor: ['admin', 'editor', 'reviewer', 'author']
  },
  {
    id: 'content-creation',
    name: 'Content Creation Tools',
    description: 'Use rich text editor with academic formatting and reference management',
    availableFor: ['admin', 'editor', 'reviewer', 'author']
  },
  {
    id: 'author-rewards',
    name: 'Token Rewards',
    description: 'Earn tokens for published articles and track earnings',
    availableFor: ['admin', 'editor', 'reviewer', 'author']
  },
  {
    id: 'collaboration-tools',
    name: 'Collaboration Tools',
    description: 'Invite co-authors and manage manuscript versions',
    availableFor: ['admin', 'editor', 'reviewer', 'author']
  },
  
  // Reader Features
  {
    id: 'personalized-feed',
    name: 'Personalized Feed',
    description: 'Get customized content recommendations and follow topics',
    availableFor: ['admin', 'editor', 'reviewer', 'author', 'reader']
  },
  {
    id: 'interaction-tools',
    name: 'Interaction Tools',
    description: 'Comment on articles and participate in discussions',
    availableFor: ['admin', 'editor', 'reviewer', 'author', 'reader']
  },
  {
    id: 'knowledge-management',
    name: 'Knowledge Management',
    description: 'Create personal collections and export citations',
    availableFor: ['admin', 'editor', 'reviewer', 'author', 'reader']
  },
  {
    id: 'token-participation',
    name: 'Token Economy Participation',
    description: 'Earn tokens for quality contributions and stake on valuable content',
    availableFor: ['admin', 'editor', 'reviewer', 'author', 'reader']
  },
  {
    id: 'discovery-tools',
    name: 'Discovery Tools',
    description: 'Use advanced search and topic exploration tools',
    availableFor: ['admin', 'editor', 'reviewer', 'author', 'reader']
  },
  
  // Moderator Features
  {
    id: 'discussion-management',
    name: 'Discussion Management',
    description: 'Monitor and moderate comments and enforce community guidelines',
    availableFor: ['admin', 'moderator']
  },
  {
    id: 'community-building',
    name: 'Community Building',
    description: 'Create discussion threads and organize virtual events',
    availableFor: ['admin', 'moderator']
  },
  {
    id: 'user-support',
    name: 'User Support',
    description: 'Answer platform usage questions and collect feedback',
    availableFor: ['admin', 'moderator']
  }
];

export function RoleFeatures() {
  const { user } = useAuth();
  const userRole = user?.role || 'reader';
  const [selectedRole, setSelectedRole] = useState<string>(userRole);
  
  // Filter features available for the current user's role
  const availableFeatures = features.filter(feature => 
    feature.availableFor.includes(userRole as any)
  );
  
  // Group features by role for display
  const featuresByRole: Record<string, FeatureItem[]> = {
    admin: features.filter(f => f.availableFor.includes('admin')),
    editor: features.filter(f => f.availableFor.includes('editor') && !f.availableFor.includes('admin')),
    reviewer: features.filter(f => f.availableFor.includes('reviewer') && !f.availableFor.includes('editor') && !f.availableFor.includes('admin')),
    author: features.filter(f => f.availableFor.includes('author') && !f.availableFor.includes('reviewer') && !f.availableFor.includes('editor') && !f.availableFor.includes('admin')),
    reader: features.filter(f => f.availableFor.includes('reader') && !f.availableFor.includes('author') && !f.availableFor.includes('reviewer') && !f.availableFor.includes('editor') && !f.availableFor.includes('admin')),
    moderator: features.filter(f => f.availableFor.includes('moderator') && !f.availableFor.includes('admin'))
  };

  // Role color mapping
  const roleColors = {
    admin: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      border: 'border-purple-200',
      highlight: 'bg-purple-600'
    },
    editor: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-800',
      border: 'border-indigo-200',
      highlight: 'bg-indigo-600'
    },
    reviewer: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200',
      highlight: 'bg-blue-600'
    },
    author: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
      highlight: 'bg-green-600'
    },
    reader: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      highlight: 'bg-yellow-600'
    },
    moderator: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
      highlight: 'bg-red-600'
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-5 mb-8 animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Your Available Features</h2>
          <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-medium">
            {availableFeatures.length} Features
          </div>
        </div>
        
        <div className="bg-indigo-50 p-4 rounded-lg mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <p className="text-indigo-800 font-medium">
                Current role: <span className="font-bold">{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</span>
              </p>
              <p className="text-indigo-600 text-sm mt-1">
                You have access to features based on your role in the platform.
              </p>
            </div>
            <div className="mt-3 sm:mt-0">
              <span className={`inline-block px-4 py-1.5 rounded-full ${roleColors[userRole as keyof typeof roleColors].bg} ${roleColors[userRole as keyof typeof roleColors].text} font-medium text-sm`}>
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Access
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableFeatures.map((feature, index) => (
            <div 
              key={feature.id} 
              className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${0.05 * index}s` }}
            >
              <div className="flex items-start">
                <div className={`mt-1 mr-3 w-8 h-8 rounded-full flex items-center justify-center ${roleColors[userRole as keyof typeof roleColors].highlight} text-white flex-shrink-0`}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{feature.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-5 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-xl font-bold text-gray-800 mb-6">All Platform Features by Role</h2>
        
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
          {Object.keys(featuresByRole).map(role => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                selectedRole === role 
                  ? `${roleColors[role as keyof typeof roleColors].bg} ${roleColors[role as keyof typeof roleColors].text} shadow-sm` 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
              {role === userRole && (
                <span className="ml-1 text-xs bg-white bg-opacity-50 px-1.5 py-0.5 rounded-full">
                  You
                </span>
              )}
            </button>
          ))}
        </div>
        
        <div className="space-y-8">
          {Object.entries(featuresByRole)
            .filter(([role]) => role === selectedRole)
            .map(([role, roleFeatures]) => (
            <div key={role} className="animate-fade-in-up">
              <div className={`p-4 rounded-lg mb-4 ${roleColors[role as keyof typeof roleColors].bg}`}>
                <h3 className={`text-lg font-semibold ${roleColors[role as keyof typeof roleColors].text}`}>
                  {role.charAt(0).toUpperCase() + role.slice(1)} Features
                  {role === userRole && (
                    <span className="ml-2 text-sm bg-white bg-opacity-50 px-2 py-0.5 rounded-full">
                      Your Role
                    </span>
                  )}
                </h3>
                <p className={`text-sm mt-1 ${roleColors[role as keyof typeof roleColors].text} opacity-80`}>
                  {role === 'admin' && 'Full platform control with access to all features and settings.'}
                  {role === 'editor' && 'Content oversight and quality control capabilities.'}
                  {role === 'reviewer' && 'Evaluate submissions for quality, accuracy, and relevance.'}
                  {role === 'author' && 'Create and manage your own content submissions.'}
                  {role === 'reader' && 'Consume content and participate in the community.'}
                  {role === 'moderator' && 'Help maintain a healthy community environment.'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roleFeatures.map((feature, index) => (
                  <div 
                    key={feature.id} 
                    className={`p-4 rounded-lg border transition-all duration-300 animate-fade-in-up ${
                      feature.availableFor.includes(userRole as any) 
                        ? `${roleColors[role as keyof typeof roleColors].border} bg-white` 
                        : 'border-gray-200 bg-gray-50 opacity-80'
                    }`}
                    style={{ animationDelay: `${0.1 + 0.05 * index}s` }}
                  >
                    <div className="flex items-start">
                      <div className={`mt-0.5 mr-3 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        feature.availableFor.includes(userRole as any) 
                          ? roleColors[role as keyof typeof roleColors].highlight
                          : 'bg-gray-300'
                      } text-white`}>
                        {feature.availableFor.includes(userRole as any) ? (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{feature.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                        {feature.availableFor.includes(userRole as any) && (
                          <span className="inline-block mt-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            Available for you
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
