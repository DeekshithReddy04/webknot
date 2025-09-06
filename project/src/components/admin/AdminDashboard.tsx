import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  PlusIcon,
  StarIcon 
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { EventStats, Event } from '../../types';
import { format } from 'date-fns';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<EventStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.collegeId) return;
      
      try {
        const [statsData, eventsData] = await Promise.all([
          apiService.getEventStats(user.collegeId),
          apiService.getEvents(user.collegeId)
        ]);
        
        setStats(statsData);
        setRecentEvents(eventsData.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.collegeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const eventTypeData = recentEvents.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(eventTypeData).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count,
  }));

  const COLORS = ['#3B82F6', '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.firstName}! Here's what's happening with your events.
          </p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <PlusIcon className="h-5 w-5" />
          <span>New Event</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalEvents || 0}</p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Registrations</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalRegistrations || 0}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Attendance</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalAttendance || 0}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
              </p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <StarIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Events Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Events</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.popularEvents || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="registrations" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Event Types Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Types</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Events & Top Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Events</h3>
          <div className="space-y-4">
            {recentEvents.map(event => (
              <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{event.title}</h4>
                  <p className="text-sm text-gray-500">
                    {format(new Date(event.startDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {event.registrationCount || 0} registered
                  </p>
                  <p className="text-sm text-gray-500 capitalize">{event.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Students */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Active Students</h3>
          <div className="space-y-4">
            {stats?.activeStudents.slice(0, 5).map((student, index) => (
              <div key={student.studentId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{student.name}</h4>
                    <p className="text-sm text-gray-500">Student ID: {student.studentId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {student.eventsAttended} events
                  </p>
                </div>
              </div>
            )) || []}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;