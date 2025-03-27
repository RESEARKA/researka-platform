'use client';

import React from 'react';
import useAuthInitialization, { AuthStatus } from '../hooks/useAuthInitialization';

/**
 * Demo component to show the usage of useAuthInitialization hook
 * This is for demonstration purposes only
 */
const AuthInitializationDemo: React.FC = () => {
  const { 
    status, 
    error, 
    user, 
    isAnonymous 
  } = useAuthInitialization({
    enableLogging: true,
    timeoutMs: 8000
  });

  // Render different UI based on initialization status
  const renderContent = () => {
    switch (status) {
      case AuthStatus.INITIALIZING:
        return (
          <div className="p-4 bg-blue-100 rounded-md">
            <h3 className="text-lg font-semibold text-blue-700">Initializing Authentication...</h3>
            <div className="mt-2 flex items-center">
              <div className="animate-spin h-5 w-5 mr-3 border-2 border-blue-700 border-t-transparent rounded-full"></div>
              <p className="text-blue-700">Please wait while authentication is being initialized</p>
            </div>
          </div>
        );
      
      case AuthStatus.READY:
        return (
          <div className="p-4 bg-green-100 rounded-md">
            <h3 className="text-lg font-semibold text-green-700">Authentication Ready</h3>
            {user ? (
              <div className="mt-2 text-green-700">
                <p><strong>User:</strong> {user.displayName || 'No display name'}</p>
                <p><strong>Email:</strong> {user.email || 'No email'}</p>
                <p><strong>UID:</strong> {user.uid}</p>
                <p><strong>Anonymous:</strong> {isAnonymous ? 'Yes' : 'No'}</p>
                <p><strong>Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}</p>
              </div>
            ) : (
              <p className="mt-2 text-green-700">No user is currently signed in</p>
            )}
          </div>
        );
      
      case AuthStatus.ERROR:
        return (
          <div className="p-4 bg-red-100 rounded-md">
            <h3 className="text-lg font-semibold text-red-700">Authentication Error</h3>
            <p className="mt-2 text-red-700">{error?.message || 'Unknown error occurred'}</p>
            <button 
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        );
      
      case AuthStatus.TIMEOUT:
        return (
          <div className="p-4 bg-yellow-100 rounded-md">
            <h3 className="text-lg font-semibold text-yellow-700">Authentication Initialization Timed Out</h3>
            <p className="mt-2 text-yellow-700">
              Authentication initialization took too long. This might be due to network issues.
            </p>
            <button 
              className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        );
      
      case AuthStatus.UNAVAILABLE:
        return (
          <div className="p-4 bg-gray-100 rounded-md">
            <h3 className="text-lg font-semibold text-gray-700">Authentication Unavailable</h3>
            <p className="mt-2 text-gray-700">
              Authentication is not available in this environment (likely server-side rendering).
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto my-8 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Authentication Initialization Demo</h2>
      {renderContent()}
      <div className="mt-4 text-sm text-gray-500">
        <p>Current status: <span className="font-mono">{status}</span></p>
        <p className="mt-1">This component demonstrates the useAuthInitialization hook.</p>
      </div>
    </div>
  );
};

export default AuthInitializationDemo;
