import React, { useState, useEffect } from 'react';
import { FaUser, FaBuilding, FaBell, FaPalette, FaCheck } from 'react-icons/fa';
import api from '../api/axios';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
  const { showNotification } = useNotification();
  const { theme: currentTheme, toggleTheme } = useTheme();
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
    theme: { darkMode: false, accentColor: 'yellow' },
  });
  const [adminProfile, setAdminProfile] = useState({ name: 'Admin User', email: 'admin@example.com', phone: '' });
  const [loading, setLoading] = useState(true);

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
          socialLinks: fetchedSettings.socialLinks || { facebook: '', whatsapp: '', instagram: '', linkedin: '' },
          notifications: fetchedSettings.notifications || { emailAlertsNewShipments: true, emailAlertsNewMessages: false, emailAlertsPaymentConfirmations: true, whatsappNotifications: false },
          theme: fetchedSettings.theme || { darkMode: false, accentColor: 'yellow' },
        });
      } catch (error) {
        showNotification('Failed to load settings.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [showNotification]);

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
    // Before saving, update the theme based on the toggle
    const newSettings = { ...settings, theme: { ...settings.theme, darkMode: currentTheme === 'dark' } };

    api.put('/settings', newSettings)
      .then(() => {
        showNotification('Settings saved successfully!', 'success');
        // Apply theme change immediately
        document.documentElement.classList.toggle('dark', newSettings.theme.darkMode);
      })
      .catch(() => {
        showNotification('Failed to save settings.', 'error');
      });
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
            <input type="file" className="mt-1 block w-full text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Change Password</label>
            <input type="password" placeholder="New Password" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
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
            <input type="file" className="mt-1 block w-full text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
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

      {/* 4. Theme Preferences */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center"><FaPalette className="mr-2" /> Theme Preferences</h2>
        <div className="space-y-3">
          <label className="inline-flex items-center">
            <input type="checkbox" checked={currentTheme === 'dark'} onChange={toggleTheme} className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary" />
            <span className="ml-2 text-gray-700">Dark Mode</span>
          </label>
          <div>
            <label className="block text-sm font-medium text-gray-700">Accent Color</label>
            <select name="theme.accentColor" value={settings.theme.accentColor} onChange={handleSettingChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
              <option value="yellow">Yellow</option>
              <option value="blue">Blue</option>
              <option value="green">Green</option>
            </select>
          </div>
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