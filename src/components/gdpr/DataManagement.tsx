import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface DataRequestFormProps {
  onSubmit: (requestType: string, email: string, details?: string) => Promise<void>;
}

/**
 * Component for users to submit GDPR data requests
 * Handles data access, deletion, and correction requests
 */
export const DataRequestForm: React.FC<DataRequestFormProps> = ({ onSubmit }) => {
  const { user } = useAuth();
  const [requestType, setRequestType] = useState<string>('access');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(requestType, email, details);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting your request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-md p-6 text-center">
        <h3 className="text-lg font-medium text-green-800 mb-2">Request Submitted</h3>
        <p className="text-green-700">
          Your data request has been submitted successfully. We will process your request and respond within 30 days as required by GDPR.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">GDPR Data Request</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="requestType">
            Request Type
          </label>
          <select
            id="requestType"
            value={requestType}
            onChange={(e) => setRequestType(e.target.value)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="access">Access My Data (Data Portability)</option>
            <option value="delete">Delete My Data (Right to be Forgotten)</option>
            <option value="correct">Correct My Data</option>
            <option value="restrict">Restrict Processing of My Data</option>
            <option value="object">Object to Processing of My Data</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            We need your email to verify your identity and process your request.
          </p>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="details">
            Additional Details
          </label>
          <textarea
            id="details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder={requestType === 'correct' ? 'Please specify what data needs to be corrected and how.' : 'Any additional information that will help us process your request.'}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

/**
 * Component to display user's current data and privacy settings
 */
export const PrivacySettings: React.FC = () => {
  const [marketingConsent, setMarketingConsent] = useState<boolean>(
    localStorage.getItem('researka-marketing-consent') === 'true'
  );
  const [analyticsConsent, setAnalyticsConsent] = useState<boolean>(
    localStorage.getItem('researka-analytics-disabled') !== 'true'
  );
  const [saved, setSaved] = useState<boolean>(false);

  // Update localStorage when consent changes
  useEffect(() => {
    const saveToLocalStorage = () => {
      // Save marketing preferences
      localStorage.setItem('researka-marketing-consent', marketingConsent.toString());
      
      // Save analytics preferences
      if (analyticsConsent) {
        localStorage.removeItem('researka-analytics-disabled');
      } else {
        localStorage.setItem('researka-analytics-disabled', 'true');
      }
    };

    // Only save when component mounts or when user explicitly clicks save
    if (saved) {
      saveToLocalStorage();
    }
  }, [marketingConsent, analyticsConsent, saved]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAnalyticsChange = () => {
    setAnalyticsConsent(!analyticsConsent);
  };

  const handleMarketingChange = () => {
    setMarketingConsent(!marketingConsent);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 pt-16 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center">Privacy Settings</h2>
      
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 text-center" role="alert">
          <p>Your privacy settings have been saved.</p>
        </div>
      )}
      
      <div className="space-y-6 max-w-md mx-auto">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative inline-block w-10 align-middle select-none">
              <input 
                type="checkbox" 
                id="analytics" 
                checked={analyticsConsent}
                onChange={handleAnalyticsChange}
                className="sr-only"
              />
              <div className={`block w-10 h-6 rounded-full transition-colors duration-200 ease-in-out ${analyticsConsent ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              <div className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ease-in-out transform ${analyticsConsent ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </div>
          </div>
          <div className="mt-2">
            <label htmlFor="analytics" className="font-medium text-gray-700 cursor-pointer">Analytics Cookies</label>
            <p className="text-gray-500 text-sm">Allow us to collect anonymous usage data to improve our services.</p>
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative inline-block w-10 align-middle select-none">
              <input 
                type="checkbox" 
                id="marketing" 
                checked={marketingConsent}
                onChange={handleMarketingChange}
                className="sr-only"
              />
              <div className={`block w-10 h-6 rounded-full transition-colors duration-200 ease-in-out ${marketingConsent ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              <div className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ease-in-out transform ${marketingConsent ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </div>
          </div>
          <div className="mt-2">
            <label htmlFor="marketing" className="font-medium text-gray-700 cursor-pointer">Marketing Communications</label>
            <p className="text-gray-500 text-sm">Receive updates about new features, events, and promotional offers.</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <button
          onClick={handleSave}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
};
