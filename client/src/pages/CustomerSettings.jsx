import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaCamera, FaSpinner, FaSave } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../api/axios';

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 font-semibold rounded-t-lg border-b-2 transition-colors ${
      active ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary'
    }`}
  >
    {children}
  </button>
);

const ProfileSettings = () => {
  const { user, setUser } = useContext(AuthContext);
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.patch('/auth/update-me', formData);
      setUser(res.data.data.user);
      showNotification('Profile updated successfully!', 'success');
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('profilePicture', file);
    setIsUploading(true);

    try {
      const uploadRes = await api.post('/uploads/customer-profile-picture', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updateRes = await api.patch('/auth/update-me', { profilePicture: uploadRes.data.filePath });
      setUser(updateRes.data.data.user);
      showNotification('Profile picture updated!', 'success');
    } catch (err) {
      showNotification('Failed to upload picture.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <form onSubmit={handleProfileUpdate} className="space-y-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <img
              src={user?.profilePicture ? `http://localhost:5000${user.profilePicture}` : `https://ui-avatars.com/api/?name=${user?.name}&background=FBBF24&color=0B1D3A`}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
            <label htmlFor="picture-upload" className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-opacity-90">
              {isUploading ? <FaSpinner className="animate-spin" /> : <FaCamera />}
            </label>
            <input id="picture-upload" type="file" className="hidden" onChange={handlePictureUpload} accept="image/*" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
        </div>
        <div className="text-right">
          <button type="submit" disabled={isSaving} className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center ml-auto disabled:bg-primary/70">
            {isSaving ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
            Save Changes
          </button>
        </div>
      </form>
    </motion.div>
  );
};

const SecuritySettings = () => {
  const { showNotification } = useNotification();
  const [passwords, setPasswords] = useState({ currentPassword: '', password: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.password !== confirmPassword) {
      showNotification('New passwords do not match.', 'error');
      return;
    }
    setIsSaving(true);
    try {
      await api.patch('/auth/update-password', passwords);
      showNotification('Password updated successfully!', 'success');
      setPasswords({ currentPassword: '', password: '' });
      setConfirmPassword('');
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to update password.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700">Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={passwords.currentPassword}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">New Password</label>
          <input
            type="password"
            name="password"
            value={passwords.password}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            required
          />
        </div>
        <div className="text-right">
          <button type="submit" disabled={isSaving} className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center ml-auto disabled:bg-primary/70">
            {isSaving ? <FaSpinner className="animate-spin mr-2" /> : <FaLock className="mr-2" />}
            Update Password
          </button>
        </div>
      </form>
    </motion.div>
  );
};

const CustomerSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="bg-gray-50 p-4 md:p-8 min-h-full">
      <h1 className="text-3xl font-bold text-primary mb-8">Account Settings</h1>

      <div className="bg-white p-6 rounded-2xl shadow-md">
        <div className="flex border-b mb-6">
          <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>
            <FaUser className="inline mr-2" /> Profile
          </TabButton>
          <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')}>
            <FaLock className="inline mr-2" /> Security
          </TabButton>
        </div>

        <div>
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'security' && <SecuritySettings />}
        </div>
      </div>
    </div>
  );
};

export default CustomerSettings;