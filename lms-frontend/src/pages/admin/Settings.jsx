import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { changePassword, updateProfile } from '../../api/auth.api';
import { User, Mail, Lock, Camera } from 'lucide-react';
import { Loader } from '../../components/common/Loader';
import toast from 'react-hot-toast';
import DefaultAvatar from '../../assets/default-avatar.png';


const Settings = () => {

  const { user, setUser } = useAuth();

  const getAvatar = () => {
    return user?.avatar?.url || DefaultAvatar;
  };

  const [avatarPreview, setAvatarPreview] = useState(DefaultAvatar);

  useEffect(() => {
    setAvatarPreview(getAvatar());
  }, [user]);


  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // const [avatarPreview, setAvatarPreview] = useState(user?.avatar?.url || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Handle avatar selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name || '');
    formDataToSend.append('email', formData.email || '');
    if (formData.phone) formDataToSend.append('phone', formData.phone);
    if (formData.bio) formDataToSend.append('bio', formData.bio);

    if (avatarFile) {
      formDataToSend.append('avatar', avatarFile);
    }

    for (let pair of formDataToSend.entries()) {
    }

    const response = await updateProfile(formDataToSend);


    if (response.success) {
      setUser(response.data.user);  
      toast.success('Profile updated successfully!');
      setAvatarFile(null);
    } else {
      toast.error(response.message || 'Failed to update profile');
    }
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    const errorMessage = error.response?.data?.message 
      || error.message 
      || 'Failed to update profile';
    
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};


  // Handle password change
  const handlePasswordChange = async (e) => {
  e.preventDefault();
  
  // Extract password data from state
  const { currentPassword, newPassword, confirmPassword } = passwordData;

  // Check if both passwords are provided
  if (!currentPassword || !newPassword) {
    toast.error('Both current and new passwords are required');
    return;
  }

  // Ensure newPassword and confirmPassword match
  if (newPassword !== confirmPassword) {
    toast.error('Passwords do not match');
    return;
  }

  // Check new password length
  if (newPassword.length < 6) {
    toast.error('Password must be at least 6 characters');
    return;
  }

  setPasswordLoading(true);

  try {
    const response = await changePassword({
      currentPassword,
      newPassword,
    });


    if (response.success) {
      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  } catch (error) {
    console.error('❌ Password change error:', error);
    toast.error(error.message || 'Failed to change password');
  } finally {
    setPasswordLoading(false);
  }
};


  return (
    <div className="space-y-6 w-full">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="card w-full">
          <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
          
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-dark-700 border-4 border-white dark:border-dark-800 shadow-lg">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = DefaultAvatar;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full shadow-lg transition-all transform hover:scale-110"
                >
                  <Camera className="w-5 h-5" />
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center">
                Click the camera icon to upload a new photo
                <br />
                <span className="text-xs">Max size: 5MB (JPG, PNG, GIF)</span>
              </p>
            </div>

            {/* Form Fields */}
            <div>
              <label className="label">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  className="input pl-10"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  minLength={2}
                />
              </div>
            </div>

            <div>
              <label className="label">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  className="input pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Phone Number (Optional)</label>
              <input
                type="tel"
                className="input"
                placeholder="+91 1234567890"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Bio (Optional)</label>
              <textarea
                className="input min-h-[100px] resize-none"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.bio.length}/500 characters
              </p>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader size="sm" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card w-full">
          <h2 className="text-xl font-semibold mb-6">Change Password</h2>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="label">Current Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  className="input pl-10"
                  placeholder="Enter current password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">New Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  className="input pl-10"
                  placeholder="Enter new password (min 6 characters)"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="label">Confirm New Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  className="input pl-10"
                  placeholder="Confirm new password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={passwordLoading}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              {passwordLoading ? (
                <>
                  <Loader size="sm" />
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;