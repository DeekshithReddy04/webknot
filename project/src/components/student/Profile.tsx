import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  EnvelopeIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ChartBarIcon,
  StarIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Registration, Attendance, Feedback, College } from '../../types';
import { format } from 'date-fns';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [college, setCollege] = useState<College | null>(null);
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    totalAttendance: 0,
    attendanceRate: 0,
    averageRating: 0,
    feedbackCount: 0,
  });
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, [user?.id, user?.collegeId]);

  const fetchProfileData = async () => {
    if (!user?.id || !user?.collegeId) return;
    
    try {
      const [registrations, attendances, feedbacks, colleges] = await Promise.all([
        apiService.getRegistrations(undefined, user.id),
        apiService.getAttendances(undefined, user.id),
        apiService.getFeedbacks(),
        apiService.getColleges()
      ]);

      const userFeedbacks = feedbacks.filter(f => f.studentId === user.id);
      const userCollege = colleges.find(c => c.id === user.collegeId);
      
      setCollege(userCollege || null);
      setStats({
        totalRegistrations: registrations.length,
        totalAttendance: attendances.length,
        attendanceRate: registrations.length > 0 ? (attendances.length / registrations.length) * 100 : 0,
        averageRating: userFeedbacks.length > 0 
          ? userFeedbacks.reduce((sum, f) => sum + f.rating, 0) / userFeedbacks.length 
          : 0,
        feedbackCount: userFeedbacks.length,
      });
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
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
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
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
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Manage your personal information and view your activity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="h-24 w-24 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">
                  {user?.firstName.charAt(0)}{user?.lastName.charAt(0)}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-gray-600">{user?.email}</p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                  {college?.name || 'Unknown College'}
                </div>
                <div className="flex items-center justify-center text-sm text-gray-500 mt-1">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Joined {format(new Date(user?.createdAt || ''), 'MMM yyyy')}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-indigo-600 mr-3" />
                  <span className="text-sm text-gray-600">Events Registered</span>
                </div>
                <span className="font-semibold text-gray-900">{stats.totalRegistrations}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AcademicCapIcon className="h-5 w-5 text-emerald-600 mr-3" />
                  <span className="text-sm text-gray-600">Events Attended</span>
                </div>
                <span className="font-semibold text-gray-900">{stats.totalAttendance}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ChartBarIcon className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-sm text-gray-600">Attendance Rate</span>
                </div>
                <span className="font-semibold text-gray-900">{stats.attendanceRate.toFixed(0)}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <StarIcon className="h-5 w-5 text-yellow-600 mr-3" />
                  <span className="text-sm text-gray-600">Avg. Rating Given</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
            
            <div className="space-y-6">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  value={college?.name || 'Unknown College'}
                  disabled
                />
                <p className="text-sm text-gray-500 mt-1">
                  Contact your administrator to change your college affiliation
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 capitalize"
                  value={user?.role || 'student'}
                  disabled
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Achievement Badges */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Achievements</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {stats.totalRegistrations >= 5 && (
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <div className="h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CalendarIcon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-medium text-gray-900">Event Explorer</h4>
                  <p className="text-sm text-gray-600">Registered for 5+ events</p>
                </div>
              )}
              
              {stats.attendanceRate >= 80 && stats.totalAttendance >= 3 && (
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <div className="h-12 w-12 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <AcademicCapIcon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-medium text-gray-900">Reliable Attendee</h4>
                  <p className="text-sm text-gray-600">80%+ attendance rate</p>
                </div>
              )}
              
              {stats.feedbackCount >= 3 && (
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="h-12 w-12 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <StarIcon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-medium text-gray-900">Feedback Champion</h4>
                  <p className="text-sm text-gray-600">Provided 3+ feedbacks</p>
                </div>
              )}
            </div>
            
            {stats.totalRegistrations < 5 && stats.attendanceRate < 80 && stats.feedbackCount < 3 && (
              <div className="text-center py-8">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <StarIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Start Your Journey</h4>
                <p className="text-gray-600">Participate in events to unlock achievements!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;