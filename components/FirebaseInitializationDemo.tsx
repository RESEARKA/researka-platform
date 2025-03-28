'use client';

import React from 'react';
import { useFirebaseInitialization, FirebaseStatus } from '../hooks/useFirebaseInitialization';
import useClient from '../hooks/useClient';
import ClientLoadingSkeleton from './ui/ClientLoadingSkeleton';

/**
 * Demo component to show the usage of useFirebaseInitialization hook
 * This is for demonstration purposes only
 */
const FirebaseInitializationDemo: React.FC = () => {
  const isClient = useClient();
  const { 
    status, 
    error, 
    auth, 
    db,
    retry 
  } = useFirebaseInitialization({
    enableLogging: true,
    timeoutMs: 8000,
    maxAttempts: 2
  });

  // If not on client, show a loading skeleton
  if (!isClient) {
    return <ClientLoadingSkeleton count={4} height="40px" />;
  }

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
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
            <button 
              className="mt-3 ml-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              onClick={retry}
            >
              Retry Initialization
            </button>
          </div>
        );
      
      case FirebaseStatus.TIMEOUT:
        return (
          <div className="p-4 bg-yellow-100 rounded-md">
            <h3 className="text-lg font-semibold text-yellow-700">Firebase Initialization Timed Out</h3>
            <p className="mt-2 text-yellow-700">The initialization process took too long to complete.</p>
            <button 
              className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
            <button 
              className="mt-3 ml-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              onClick={retry}
            >
              Retry Initialization
            </button>
          </div>
        );
      
      default:
        return (
          <div className="p-4 bg-gray-100 rounded-md">
            <h3 className="text-lg font-semibold text-gray-700">Firebase Status: {status}</h3>
            <p className="mt-2 text-gray-700">Unknown status encountered.</p>
          </div>
        );
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Firebase Initialization Demo</h2>
      {renderContent()}
    </div>
  );
};

export default FirebaseInitializationDemo;
