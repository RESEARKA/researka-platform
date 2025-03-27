'use client';

import React from 'react';
import useFirebaseInitialization, { FirebaseStatus } from '../hooks/useFirebaseInitialization';

/**
 * Demo component to show the usage of useFirebaseInitialization hook
 * This is for demonstration purposes only
 */
const FirebaseInitializationDemo: React.FC = () => {
  const { 
    status, 
    error, 
    app, 
    auth, 
    db 
  } = useFirebaseInitialization({
    enableLogging: true,
    timeoutMs: 8000,
    maxAttempts: 2
  });

  // Render different UI based on initialization status
  const renderContent = () => {
    switch (status) {
      case FirebaseStatus.INITIALIZING:
        return (
          <div className="p-4 bg-blue-100 rounded-md">
            <h3 className="text-lg font-semibold text-blue-700">Initializing Firebase...</h3>
            <div className="mt-2 flex items-center">
              <div className="animate-spin h-5 w-5 mr-3 border-2 border-blue-700 border-t-transparent rounded-full"></div>
              <p className="text-blue-700">Please wait while Firebase services are being initialized</p>
            </div>
          </div>
        );
      
      case FirebaseStatus.INITIALIZED:
        return (
          <div className="p-4 bg-green-100 rounded-md">
            <h3 className="text-lg font-semibold text-green-700">Firebase Initialized Successfully</h3>
            <ul className="mt-2 list-disc list-inside text-green-700">
              <li>Firebase App: {app ? 'Available' : 'Not available'}</li>
              <li>Firebase Auth: {auth ? 'Available' : 'Not available'}</li>
              <li>Firebase Firestore: {db ? 'Available' : 'Not available'}</li>
            </ul>
          </div>
        );
      
      case FirebaseStatus.ERROR:
        return (
          <div className="p-4 bg-red-100 rounded-md">
            <h3 className="text-lg font-semibold text-red-700">Firebase Initialization Error</h3>
            <p className="mt-2 text-red-700">{error?.message || 'Unknown error occurred'}</p>
            <button 
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        );
      
      case FirebaseStatus.TIMEOUT:
        return (
          <div className="p-4 bg-yellow-100 rounded-md">
            <h3 className="text-lg font-semibold text-yellow-700">Firebase Initialization Timed Out</h3>
            <p className="mt-2 text-yellow-700">
              Firebase initialization took too long. This might be due to network issues.
            </p>
            <button 
              className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        );
      
      case FirebaseStatus.UNAVAILABLE:
        return (
          <div className="p-4 bg-gray-100 rounded-md">
            <h3 className="text-lg font-semibold text-gray-700">Firebase Unavailable</h3>
            <p className="mt-2 text-gray-700">
              Firebase is not available in this environment (likely server-side rendering).
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto my-8 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Firebase Initialization Demo</h2>
      {renderContent()}
      <div className="mt-4 text-sm text-gray-500">
        <p>Current status: <span className="font-mono">{status}</span></p>
        <p className="mt-1">This component demonstrates the useFirebaseInitialization hook.</p>
      </div>
    </div>
  );
};

export default FirebaseInitializationDemo;
