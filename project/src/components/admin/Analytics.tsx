import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon,  // ✅ FIXED
  UserGroupIcon,
  CalendarIcon,
  StarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { EventStats, Event } from '../../types';

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<EventStats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'semester'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [user?.collegeId, timeRange]);

  const fetchAnalytics = async () => {
    if (!user?.collegeId) return;
    
    try {
      const [statsData, eventsData] = await Promise.all([
        apiService.getEventStats(user.collegeId),
        apiService.getEvents(user.collegeId)
      ]);
      
      setStats(statsData);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Prepare data for charts
  const eventTypeData = events.reduce((acc, event) => {
    const type = event.type.charAt(0).toUpperCase() + event.type.slice(1).replace('-', ' ');
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(eventTypeData).map(([type, count]) => ({
    name: type,
    value: count,
  }));

  const monthlyData = events.reduce((acc, event) => {
    const month = new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.events += 1;
      existing.registrations += event.registrationCount || 0;
    } else {
      acc.push({
        month,
        events: 1,
        registrations: event.registrationCount || 0,
      });
    }
    return acc;
  }, [] as Array<{ month: string; events: number; registrations: number }>);

  const COLORS = ['#3B82F6', '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const kpiData = [
    {
      title: 'Total Events',
      value: stats?.totalEvents || 0,
      change: '+12%',
      trend: 'up',
      icon: CalendarIcon,
      color: 'indigo',
    },
    {
      title: 'Total Registrations',
      value: stats?.totalRegistrations || 0,
      change: '+18%',
      trend: 'up',
      icon: UserGroupIcon,
      color: 'emerald',
    },
    {
      title: 'Attendance Rate',
      value: `${stats?.totalRegistrations ? Math.round((stats.totalAttendance / stats.totalRegistrations) * 100) : 0}%`,
      change: '+5%',
      trend: 'up',
      icon: ArrowTrendingUpIcon, // ✅ FIXED
      color: 'blue',
    },
    {
      title: 'Average Rating',
      value: stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0',
      change: '+0.3',
      trend: 'up',
      icon: StarIcon,
      color: 'yellow',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into your campus events</p>
        </div>
        <div className="flex space-x-2">
          {['week', 'month', 'semester'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as typeof timeRange)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                timeRange === range
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{kpi.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                <div className="flex items-center mt-2">
                  {kpi.trend === 'up' ? (
                    <ArrowUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    kpi.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {kpi.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last {timeRange}</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg bg-${kpi.color}-50`}>
                <kpi.icon className={`h-6 w-6 text-${kpi.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="events" 
                stackId="1" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.6}
                name="Events"
              />
              <Area 
                type="monotone" 
                dataKey="registrations" 
                stackId="2" 
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.6}
                name="Registrations"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Event Types Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Types Distribution</h3>
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

        {/* Popular Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Popular Events</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.popularEvents || []} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="title" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="registrations" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Engagement Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Registration Rate</p>
                <p className="text-sm text-gray-500">Average per event</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-indigo-600">
                  {events.length > 0 ? Math.round((stats?.totalRegistrations || 0) / events.length) : 0}
                </p>
                <p className="text-sm text-gray-500">students</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Show-up Rate</p>
                <p className="text-sm text-gray-500">Attendance vs Registration</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-600">
                  {stats?.totalRegistrations ? Math.round((stats.totalAttendance / stats.totalRegistrations) * 100) : 0}%
                </p>
                <p className="text-sm text-gray-500">attendance</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Satisfaction Score</p>
                <p className="text-sm text-gray-500">Average rating</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-yellow-600">
                  {stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
                </p>
                <p className="text-sm text-gray-500">out of 5</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Events</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registrations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats?.popularEvents.slice(0, 5).map((event, index) => (
                <tr key={event.eventId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-semibold">{index + 1}</span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">{event.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                      {events.find(e => e.id === event.eventId)?.type.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {event.registrations}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {event.attendance}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-900">{event.rating.toFixed(1)}</span>
                    </div>
                  </td>
                </tr>
              )) || []}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
