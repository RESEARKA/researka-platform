import { useState, useEffect } from 'react';
import { UserProfile, ProfileData, updateProfile, verifyUserOrcid } from '../services/profileService';
import { isValidOrcidFormat } from '../services/orcidService';

interface EditProfileProps {
  userProfile: UserProfile;
  onSave: (updatedProfile: UserProfile) => void;
  onCancel: () => void;
}

export function EditProfile({ userProfile, onSave, onCancel }: EditProfileProps) {
  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    institution: '',
    bio: '',
    orcid: '',
    profilePicture: null
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orcidVerifying, setOrcidVerifying] = useState(false);
  const [orcidVerified, setOrcidVerified] = useState(false);
  const [orcidMessage, setOrcidMessage] = useState<string | null>(null);

  // Initialize form with user data
  useEffect(() => {
    setFormData({
      name: userProfile.name || '',
      institution: userProfile.institution || '',
      bio: userProfile.bio || '',
      orcid: userProfile.orcid || '',
      profilePicture: null
    });
    
    if (userProfile.profilePictureUrl) {
      setPreviewImage(userProfile.profilePictureUrl);
    }
    
    // Initialize ORCID verification status
    setOrcidVerified(userProfile.orcidVerified || false);
    if (userProfile.orcidVerified) {
      setOrcidMessage(`Verified on ${userProfile.orcidLastVerified || 'an unknown date'}`);
    }
  }, [userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Reset ORCID verification if ORCID is changed
    if (name === 'orcid' && value !== userProfile.orcid) {
      setOrcidVerified(false);
      setOrcidMessage(null);
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.match('image.*')) {
        setError('Please select an image file (JPEG, PNG)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      setFormData(prev => ({ ...prev, profilePicture: file }));
      setPreviewImage(URL.createObjectURL(file));
      setError(null);
    }
  };

  const verifyOrcid = async () => {
    if (!formData.orcid) {
      setOrcidMessage('Please enter an ORCID ID');
      return;
    }
    
    // Validate ORCID format
    if (!isValidOrcidFormat(formData.orcid)) {
      setOrcidMessage('Invalid ORCID format. It should be in the format: 0000-0000-0000-0000');
      return;
    }
    
    setOrcidVerifying(true);
    setOrcidMessage('Verifying ORCID...');
    
    try {
      const result = await verifyUserOrcid(formData.orcid);
      setOrcidVerified(result.success);
      setOrcidMessage(result.message);
    } catch (err) {
      setOrcidVerified(false);
      setOrcidMessage('Verification failed. Please try again.');
    } finally {
      setOrcidVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }
      
      // Validate ORCID format if provided
      if (formData.orcid && !isValidOrcidFormat(formData.orcid)) {
        throw new Error('Invalid ORCID format. It should be in the format: 0000-0000-0000-0000');
      }
      
      // Update profile
      const updatedProfile = await updateProfile(formData);
      onSave(updatedProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">Edit Profile</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Profile Picture */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">Profile Picture</label>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {previewImage ? (
                <img src={previewImage} alt="Profile preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-gray-400">
                  {formData.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <input
                type="file"
                id="profilePicture"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="profilePicture"
                className="bg-blue-600 text-white text-sm px-4 py-2 rounded cursor-pointer hover:bg-blue-700 transition"
              >
                Choose Image
              </label>
              <p className="text-xs text-gray-500 mt-1">
                JPEG or PNG, max 5MB
              </p>
            </div>
          </div>
        </div>
        
        {/* Name */}
        <div>
          <label htmlFor="name" className="block mb-1 font-medium">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        {/* Institution */}
        <div>
          <label htmlFor="institution" className="block mb-1 font-medium">
            Institution
          </label>
          <input
            type="text"
            id="institution"
            name="institution"
            value={formData.institution}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* ORCID ID */}
        <div>
          <label htmlFor="orcid" className="block mb-1 font-medium">
            ORCID ID
          </label>
          <div className="flex items-center">
            <input
              type="text"
              id="orcid"
              name="orcid"
              value={formData.orcid}
              onChange={handleChange}
              placeholder="0000-0000-0000-0000"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={verifyOrcid}
              disabled={orcidVerifying || !formData.orcid}
              className={`px-4 py-2 rounded-r-md text-white font-medium ${
                orcidVerified 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } disabled:opacity-50 disabled:cursor-not-allowed transition`}
            >
              {orcidVerifying ? 'Verifying...' : orcidVerified ? 'Verified' : 'Verify'}
            </button>
          </div>
          {orcidMessage && (
            <p className={`text-sm mt-1 ${orcidVerified ? 'text-green-600' : 'text-orange-500'}`}>
              {orcidMessage}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            <a href="https://orcid.org/register" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              Don't have an ORCID ID? Register for one here.
            </a>
          </p>
        </div>
        
        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block mb-1 font-medium">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
        
        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
