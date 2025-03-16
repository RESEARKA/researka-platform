import { useState } from 'react';

export function Settings() {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Researka',
    siteDescription: 'A decentralized academic publishing platform',
    contactEmail: 'admin@researka.io',
    maxUploadSize: 10,
    defaultLanguage: 'en'
  });
  
  const [tokenSettings, setTokenSettings] = useState({
    submissionFee: 50,
    reviewerReward: 20,
    curatorReward: 5,
    transactionFeePercent: 0.1,
    minWithdrawal: 10
  });
  
  const [emailSettings, setEmailSettings] = useState({
    enableNotifications: true,
    welcomeEmail: true,
    submissionUpdates: true,
    reviewAssignments: true,
    weeklyDigest: false
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  const handleGeneralSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setGeneralSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };
  
  const handleTokenSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setTokenSettings(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };
  
  const handleEmailSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    setEmailSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would save to a database
      setSaveMessage({
        type: 'success',
        text: 'Settings saved successfully'
      });
    } catch (error) {
      setSaveMessage({
        type: 'error',
        text: 'Failed to save settings'
      });
    } finally {
      setIsSaving(false);
      
      // Clear success message after 3 seconds
      if (saveMessage?.type === 'success') {
        setTimeout(() => {
          setSaveMessage(null);
        }, 3000);
      }
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Platform Settings</h2>
      
      {saveMessage && (
        <div className={`mb-6 p-4 rounded-md ${
          saveMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {saveMessage.text}
        </div>
      )}
      
      <div className="space-y-8">
        {/* General Settings */}
        <div className="bg-white border rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">
                Site Name
              </label>
              <input
                type="text"
                id="siteName"
                name="siteName"
                value={generalSettings.siteName}
                onChange={handleGeneralSettingsChange}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={generalSettings.contactEmail}
                onChange={handleGeneralSettingsChange}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Site Description
              </label>
              <textarea
                id="siteDescription"
                name="siteDescription"
                value={generalSettings.siteDescription}
                onChange={handleGeneralSettingsChange}
                rows={3}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="maxUploadSize" className="block text-sm font-medium text-gray-700 mb-1">
                Max Upload Size (MB)
              </label>
              <input
                type="number"
                id="maxUploadSize"
                name="maxUploadSize"
                value={generalSettings.maxUploadSize}
                onChange={handleGeneralSettingsChange}
                min={1}
                max={100}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="defaultLanguage" className="block text-sm font-medium text-gray-700 mb-1">
                Default Language
              </label>
              <select
                id="defaultLanguage"
                name="defaultLanguage"
                value={generalSettings.defaultLanguage}
                onChange={handleGeneralSettingsChange}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Token Settings */}
        <div className="bg-white border rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Token Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="submissionFee" className="block text-sm font-medium text-gray-700 mb-1">
                Submission Fee (DJOUR)
              </label>
              <input
                type="number"
                id="submissionFee"
                name="submissionFee"
                value={tokenSettings.submissionFee}
                onChange={handleTokenSettingsChange}
                min={0}
                step={1}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="reviewerReward" className="block text-sm font-medium text-gray-700 mb-1">
                Reviewer Reward (DJOUR)
              </label>
              <input
                type="number"
                id="reviewerReward"
                name="reviewerReward"
                value={tokenSettings.reviewerReward}
                onChange={handleTokenSettingsChange}
                min={0}
                step={1}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="curatorReward" className="block text-sm font-medium text-gray-700 mb-1">
                Curator Reward (DJOUR)
              </label>
              <input
                type="number"
                id="curatorReward"
                name="curatorReward"
                value={tokenSettings.curatorReward}
                onChange={handleTokenSettingsChange}
                min={0}
                step={1}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="transactionFeePercent" className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Fee (%)
              </label>
              <input
                type="number"
                id="transactionFeePercent"
                name="transactionFeePercent"
                value={tokenSettings.transactionFeePercent}
                onChange={handleTokenSettingsChange}
                min={0}
                max={10}
                step={0.1}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="minWithdrawal" className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Withdrawal (DJOUR)
              </label>
              <input
                type="number"
                id="minWithdrawal"
                name="minWithdrawal"
                value={tokenSettings.minWithdrawal}
                onChange={handleTokenSettingsChange}
                min={0}
                step={1}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        
        {/* Email Notification Settings */}
        <div className="bg-white border rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Enable Email Notifications</h4>
                <p className="text-sm text-gray-500">Master toggle for all email notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="enableNotifications"
                  checked={emailSettings.enableNotifications}
                  onChange={handleEmailSettingsChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="welcomeEmail" className="text-sm text-gray-700">Welcome Email</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="welcomeEmail"
                      name="welcomeEmail"
                      checked={emailSettings.welcomeEmail}
                      onChange={handleEmailSettingsChange}
                      disabled={!emailSettings.enableNotifications}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 ${!emailSettings.enableNotifications ? 'bg-gray-100' : 'bg-gray-200'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <label htmlFor="submissionUpdates" className="text-sm text-gray-700">Submission Status Updates</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="submissionUpdates"
                      name="submissionUpdates"
                      checked={emailSettings.submissionUpdates}
                      onChange={handleEmailSettingsChange}
                      disabled={!emailSettings.enableNotifications}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 ${!emailSettings.enableNotifications ? 'bg-gray-100' : 'bg-gray-200'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <label htmlFor="reviewAssignments" className="text-sm text-gray-700">Review Assignments</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="reviewAssignments"
                      name="reviewAssignments"
                      checked={emailSettings.reviewAssignments}
                      onChange={handleEmailSettingsChange}
                      disabled={!emailSettings.enableNotifications}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 ${!emailSettings.enableNotifications ? 'bg-gray-100' : 'bg-gray-200'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <label htmlFor="weeklyDigest" className="text-sm text-gray-700">Weekly Digest</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="weeklyDigest"
                      name="weeklyDigest"
                      checked={emailSettings.weeklyDigest}
                      onChange={handleEmailSettingsChange}
                      disabled={!emailSettings.enableNotifications}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 ${!emailSettings.enableNotifications ? 'bg-gray-100' : 'bg-gray-200'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 mr-3"
        >
          Reset to Defaults
        </button>
        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
