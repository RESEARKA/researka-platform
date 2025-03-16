import { useState } from 'react';
import { DataRequestForm, PrivacySettings } from '../components/gdpr/DataManagement';

/**
 * Privacy Center page that combines data request functionality and privacy settings
 * This serves as a central hub for users to manage their privacy preferences and GDPR rights
 */
export function PrivacyCenter() {
  const [activeTab, setActiveTab] = useState<'settings' | 'requests'>('settings');

  // Mock function to handle data requests - in a real implementation, this would call your API
  const handleDataRequest = async (requestType: string, email: string, details?: string) => {
    console.log('Data request submitted:', { requestType, email, details });
    // In a real implementation, this would send the request to your backend
    return new Promise<void>((resolve) => {
      setTimeout(resolve, 1000); // Simulate API call
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Privacy Center</h1>
      <p className="text-gray-600 mb-8 text-center">
        Manage your privacy settings and exercise your data protection rights.
      </p>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex flex-col items-center space-y-4 mb-4">
          <button
            onClick={() => setActiveTab('settings')}
            className={`${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-2 px-4 border-b-2 font-medium text-sm`}
          >
            Privacy Settings
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`${
              activeTab === 'requests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-2 px-4 border-b-2 font-medium text-sm`}
          >
            Data Requests
          </button>
        </nav>
      </div>

      {/* Tab content */}
      <div className="mt-8">
        {activeTab === 'settings' ? (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-center">Your Privacy Settings</h2>
            <p className="text-gray-600 mb-6 text-center">
              Control how your data is used on Researka. These settings affect cookies, analytics tracking, and marketing communications.
            </p>
            <PrivacySettings />
            
            <div className="mt-12 bg-blue-50 border border-blue-200 rounded-md p-6">
              <h3 className="text-lg font-medium text-blue-800 mb-2 text-center">About Your Privacy</h3>
              <p className="text-blue-700 mb-4 text-center">
                At Researka, we're committed to transparency and giving you control over your data. You can learn more about how we handle your information in our:
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/privacy-policy" 
                  className="inline-flex items-center px-4 py-2 border border-blue-300 bg-white text-blue-700 rounded-md hover:bg-blue-50"
                >
                  Privacy Policy
                </a>
                <a 
                  href="/cookie-policy" 
                  className="inline-flex items-center px-4 py-2 border border-blue-300 bg-white text-blue-700 rounded-md hover:bg-blue-50"
                >
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Data Protection Requests</h2>
            <p className="text-gray-600 mb-6">
              Under the General Data Protection Regulation (GDPR), you have the right to access, correct, or delete your personal data.
              Use the form below to submit your request.
            </p>
            <DataRequestForm onSubmit={handleDataRequest} />
            
            <div className="mt-12 bg-gray-50 border border-gray-200 rounded-md p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-2">What to Expect</h3>
              <p className="text-gray-700 mb-2">
                After submitting your request:
              </p>
              <ul className="list-disc ml-6 text-gray-700">
                <li>We'll verify your identity to protect your privacy</li>
                <li>You'll receive an email confirmation of your request</li>
                <li>We'll process your request within 30 days as required by law</li>
                <li>You may be contacted if we need additional information</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PrivacyCenter;
