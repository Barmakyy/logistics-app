import { useState, useEffect } from 'react';
import { FaUser, FaBuilding, FaBell, FaCheck } from 'react-icons/fa';
import api from '../api/axios';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { showNotification } = useNotification();
  const { user, setUser } = useAuth();
  const [settings, setSettings] = useState({
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    address: '',
    website: '',
    socialLinks: { facebook: '', whatsapp: '', instagram: '', linkedin: '' },
    notifications: {
      emailAlertsNewShipments: true,
      emailAlertsNewMessages: false,
      emailAlertsPaymentConfirmations: true,
      whatsappNotifications: false,
    },
  });
  const [adminProfile, setAdminProfile] = useState({ name: user?.name || 'Admin User', email: user?.email || 'admin@example.com', phone: user?.phone || '' });
  const [loading, setLoading] = useState(true);

  // State for password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  // State for image previews
  const [profilePicturePreview, setProfilePicturePreview] = useState(user?.profilePicture ? `http://localhost:5000${user.profilePicture}` : null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState(null);


  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [companyLogoFile, setCompanyLogoFile] = useState(null);
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        const fetchedSettings = response.data.data.settings;
        setSettings({
          companyName: fetchedSettings.companyName || '',
          companyEmail: fetchedSettings.companyEmail || '',
          companyPhone: fetchedSettings.companyPhone || '',
          address: fetchedSettings.address || '',
          website: fetchedSettings.website || '',
          logo: fetchedSettings.logo || '',
          socialLinks: { facebook: '', whatsapp: '', instagram: '', linkedin: '', ...fetchedSettings.socialLinks },
          notifications: { emailAlertsNewShipments: true, emailAlertsNewMessages: false, emailAlertsPaymentConfirmations: true, whatsappNotifications: false, ...fetchedSettings.notifications },
        });
        if (fetchedSettings.logo) setCompanyLogoPreview(`http://localhost:5000${fetchedSettings.logo}`);
      } catch (error) {
        showNotification('Failed to load settings.', 'error');
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchSettings();
    }
  }, [showNotification, user]);

  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    const [section, key] = name.split('.');

    if (section && key) {
      setSettings(prev => ({
        ...prev,
        [section]: { ...prev[section], [key]: type === 'checkbox' ? checked : value }
      }));
    } else {
      setSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveChanges = async () => {
    try {
      let updatedSettings = { ...settings };
      // Upload company logo if a new one is selected
      if (companyLogoFile) {
        const logoFormData = new FormData();
        logoFormData.append('companyLogo', companyLogoFile);
        const logoRes = await api.post('/uploads/company-logo', logoFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        updatedSettings.logo = logoRes.data.filePath;
      }

      let updatedAdminProfile = { ...adminProfile };

      // Upload profile picture if a new one is selected
      if (profilePictureFile) {
        const profileFormData = new FormData();
        profileFormData.append('profilePicture', profilePictureFile);
        const profileRes = await api.post('/uploads/profile-picture', profileFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        updatedAdminProfile.profilePicture = profileRes.data.filePath;
      }

      // Update admin profile info (name, email, phone, and new picture)
      const adminUpdateRes = await api.patch('/auth/update-me', updatedAdminProfile);
      setUser({ ...user, ...adminUpdateRes.data.data.user });

      // Save all other settings
      await api.put('/settings', updatedSettings);

      showNotification('Settings saved successfully!', 'success');
    } catch (error) {
      console.error('Failed to save settings:', error);
      showNotification(error.response?.data?.message || 'Failed to save settings.', 'error');
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePicturePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCompanyLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompanyLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCompanyLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== passwordConfirm) {
      showNotification('New passwords do not match.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showNotification('Password must be at least 8 characters long.', 'error');
      return;
    }

    try {
      await api.patch('/auth/update-password', {
        currentPassword,
        password: newPassword,
        passwordConfirm,
      });
      showNotification('Password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setPasswordConfirm('');
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to update password.', 'error');
    }
  };

  if (loading) {
    return <div className="text-center p-10">Loading settings...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-primary mb-8">Admin Settings</h1>

      {/* 1. Profile Settings */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center"><FaUser className="mr-2" /> Profile Settings</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Admin Name</label>
            <input type="text" value={adminProfile.name} onChange={(e) => setAdminProfile({ ...adminProfile, name: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" value={adminProfile.email} onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input type="text" value={adminProfile.phone} onChange={(e) => setAdminProfile({ ...adminProfile, phone: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
            <div className="mt-1 flex items-center space-x-4">
              {profilePicturePreview && (
                <img src={profilePicturePreview} alt="Profile Preview" className="w-16 h-16 rounded-full object-cover" />
              )}
              <input type="file" accept="image/*" onChange={handleProfilePictureChange} className="block w-full text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-dark file:text-white hover:file:bg-primary" />
            </div>
          </div>
          <form onSubmit={handlePasswordChange} className="space-y-3 border-t pt-4 mt-4">
            <label className="block text-sm font-medium text-gray-700">Change Password</label>
            <input type="password" placeholder="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            <input type="password" placeholder="Confirm New Password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            <button type="submit" className="w-full bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
              Update Password
            </button>
          </form>
        </div>
      </div>

      {/* 2. Company Information */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center"><FaBuilding className="mr-2" /> Company Information</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Name</label>
            <input type="text" name="companyName" value={settings.companyName} onChange={handleSettingChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="companyEmail" value={settings.companyEmail} onChange={handleSettingChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input type="text" name="companyPhone" value={settings.companyPhone} onChange={handleSettingChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input type="text" name="address" value={settings.address} onChange={handleSettingChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700">Website</label>
            <input type="url" name="website" value={settings.website} onChange={handleSettingChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Facebook</label>
            <input type="url" name="socialLinks.facebook" value={settings.socialLinks.facebook} onChange={handleSettingChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
            <input type="url" name="socialLinks.whatsapp" value={settings.socialLinks.whatsapp} onChange={handleSettingChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Instagram</label>
            <input type="url" name="socialLinks.instagram" value={settings.socialLinks.instagram} onChange={handleSettingChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
            <input type="url" name="socialLinks.linkedin" value={settings.socialLinks.linkedin} onChange={handleSettingChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Logo</label>
            <div className="mt-1 flex items-center space-x-4">
              {companyLogoPreview && (
                <img src={companyLogoPreview} alt="Logo Preview" className="w-16 h-16 object-contain" />
              )}
              <input type="file" accept="image/*" onChange={handleCompanyLogoChange} className="block w-full text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-dark file:text-white hover:file:bg-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Notification Settings */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center"><FaBell className="mr-2" /> Notification Settings</h2>
        <div className="space-y-3">
          <label className="inline-flex items-center">
            <input type="checkbox" name="notifications.emailAlertsNewShipments" checked={settings.notifications.emailAlertsNewShipments} onChange={handleSettingChange} className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary" />
            <span className="ml-2 text-gray-700">Email alerts for new shipments</span>
          </label>
          <label className="inline-flex items-center">
            <input type="checkbox" name="notifications.emailAlertsNewMessages" checked={settings.notifications.emailAlertsNewMessages} onChange={handleSettingChange} className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary" />
            <span className="ml-2 text-gray-700">Email alerts for new messages</span>
          </label>
          <label className="inline-flex items-center">
            <input type="checkbox" name="notifications.emailAlertsPaymentConfirmations" checked={settings.notifications.emailAlertsPaymentConfirmations} onChange={handleSettingChange} className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary" />
            <span className="ml-2 text-gray-700">Email alerts for payment confirmations</span>
          </label>
          <label className="inline-flex items-center">
            <input type="checkbox" name="notifications.whatsappNotifications" checked={settings.notifications.whatsappNotifications} onChange={handleSettingChange} className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary" />
            <span className="ml-2 text-gray-700">Enable WhatsApp notifications</span>
          </label>
        </div>
      </div>

      {/* 5. Save Changes Button */}
      <div className="text-center">
        <button onClick={handleSaveChanges} className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-colors flex items-center mx-auto">
          <FaCheck className="mr-2" /> Save Changes
        </button>
      </div>
    </div>
  );
};

export default Settings;