import React, { useState, useEffect } from 'react';
import { 
  Cog6ToothIcon, 
  BuildingOfficeIcon,
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { College } from '../../types';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [college, setCollege] = useState<College | null>(null);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });
  const [collegeData, setCollegeData] = useState({
    name: '',
    city: '',
    state: '',
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    eventReminders: true,
    weeklyReports: false,
    marketingEmails: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCollegeData();
  }, [user?.collegeId]);

  const fetchCollegeData = async () => {
    if (!user?.collegeId) return;
    
    try {
      const colleges = await apiService.getColleges();
      const userCollege = colleges.find(c => c.id === user.collegeId);
      if (userCollege) {
        setCollege(userCollege);
        setCollegeData({
          name: userCollege.name,
          city: userCollege.city,
          state: userCollege.state,
        });
      }
    } catch (error) {
      console.error('Error fetching college data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      // In a real app, this would make an API call
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === user?.id);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...profileData };
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('user', JSON.stringify(users[userIndex]));
      }
      
      // Show success message (in a real app, you'd use a toast notification)
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCollegeSave = async () => {
    setSaving(true);
    try {
      // In a real app, this would make an API call
      const colleges = JSON.parse(localStorage.getItem('campus_events_colleges') || '[]');
      const collegeIndex = colleges.findIndex((c: any) => c.id === user?.collegeId);
      if (collegeIndex !== -1) {
        colleges[collegeIndex] = { ...colleges[collegeIndex], ...collegeData };
        localStorage.setItem('campus_events_colleges', JSON.stringify(colleges));
        setCollege(colleges[collegeIndex]);
      }
      
      alert('College information updated successfully!');
    } catch (error) {
      console.error('Error updating college:', error);
      alert('Error updating college information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationsSave = async () => {
    setSaving(true);
    try {
      // In a real app, this would make an API call to save notification preferences
      localStorage.setItem(`notifications_${user?.id}`, JSON.stringify(notifications));
      alert('Notification preferences updated successfully!');
    } catch (error) {
      console.error('Error updating notifications:', error);
      alert('Error updating notification preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and college preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            <a href="#profile" className="flex items-center px-4 py-3 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg">
              <UserIcon className="h-5 w-5 mr-3" />
              Profile Settings
            </a>
            <a href="#college" className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
              <BuildingOfficeIcon className="h-5 w-5 mr-3" />
              College Information
            </a>
            <a href="#notifications" className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
              <BellIcon className="h-5 w-5 mr-3" />
              Notifications
            </a>
            <a href="#security" className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
              <ShieldCheckIcon className="h-5 w-5 mr-3" />
              Security
            </a>
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <UserIcon className="h-6 w-6 text-indigo-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <button
                onClick={handleProfileSave}
                disabled={saving}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>

          {/* College Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <BuildingOfficeIcon className="h-6 w-6 text-indigo-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">College Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  value={collegeData.name}
                  onChange={(e) => setCollegeData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    value={collegeData.city}
                    onChange={(e) => setCollegeData(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    value={collegeData.state}
                    onChange={(e) => setCollegeData(prev => ({ ...prev, state: e.target.value }))}
                  />
                </div>
              </div>

              <button
                onClick={handleCollegeSave}
                disabled={saving}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save College Info'}
              </button>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <BellIcon className="h-6 w-6 text-indigo-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
            </div>

            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {key === 'emailNotifications' && 'Receive email notifications for important updates'}
                      {key === 'eventReminders' && 'Get reminders about upcoming events you\'re registered for'}
                      {key === 'weeklyReports' && 'Receive weekly summary reports of campus activities'}
                      {key === 'marketingEmails' && 'Receive promotional emails about new features'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={value}
                      onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              ))}

              <button
                onClick={handleNotificationsSave}
                disabled={saving}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <ShieldCheckIcon className="h-6 w-6 text-indigo-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
            </div>

            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Change Password</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Update your password to keep your account secure
                </p>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  Change Password
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Add an extra layer of security to your account
                </p>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                  Enable 2FA
                </button>
              </div>

              <div className="border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
                <p className="text-sm text-red-600 mb-4">
                  Permanently delete your account and all associated data
                </p>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;