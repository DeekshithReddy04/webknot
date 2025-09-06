import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon,
  UserGroupIcon,
  StarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Event, Registration } from '../../types';
import { format } from 'date-fns';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.collegeId || !user?.id) return;
      
      try {
        const [eventsData, registrationsData] = await Promise.all([
          apiService.getEvents(user.collegeId),
          apiService.getRegistrations(undefined, user.id)
        ]);
        
        setEvents(eventsData.filter(event => event.status === 'published'));
        setMyRegistrations(registrationsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.collegeId, user?.id]);

  const handleRegister = async (eventId: string) => {
    if (!user?.id) return;
    
    try {
      await apiService.registerForEvent(eventId, user.id);
      const updatedRegistrations = await apiService.getRegistrations(undefined, user.id);
      setMyRegistrations(updatedRegistrations);
    } catch (error) {
      console.error('Error registering for event:', error);
    }
  };

  const isRegistered = (eventId: string) => {
    return myRegistrations.some(reg => 
      reg.eventId === eventId && reg.status === 'registered'
    );
  };

  const filteredEvents = events.filter(event => 
    selectedCategory === 'all' || event.type === selectedCategory
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const categories = [
    { id: 'all', name: 'All Events' },
    { id: 'workshop', name: 'Workshops' },
    { id: 'hackathon', name: 'Hackathons' },
    { id: 'tech-talk', name: 'Tech Talks' },
    { id: 'fest', name: 'Fests' },
    { id: 'seminar', name: 'Seminars' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Events</h1>
        <p className="text-gray-600 mt-1">
          Discover and register for exciting events at your campus
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available Events</p>
              <p className="text-2xl font-bold text-gray-900">{events.length}</p>
            </div>
            <CalendarIcon className="h-8 w-8 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">My Registrations</p>
              <p className="text-2xl font-bold text-gray-900">{myRegistrations.length}</p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">
                {events.filter(event => {
                  const eventDate = new Date(event.startDate);
                  const now = new Date();
                  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                  return eventDate >= now && eventDate <= weekFromNow;
                }).length}
              </p>
            </div>
            <ClockIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map(event => (
          <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                    {event.type.replace('-', ' ')}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{event.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {format(new Date(event.startDate), 'MMM dd, yyyy • h:mm a')}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  {event.venue}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <UserGroupIcon className="h-4 w-4 mr-2" />
                  {event.registrationCount || 0} / {event.maxCapacity} registered
                </div>
                {event.averageRating > 0 && (
                  <div className="flex items-center text-sm text-gray-500">
                    <StarIcon className="h-4 w-4 mr-2" />
                    {event.averageRating.toFixed(1)} rating
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                {isRegistered(event.id) ? (
                  <div className="flex items-center text-emerald-600">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">Registered</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleRegister(event.id)}
                    disabled={event.registrationCount >= event.maxCapacity}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed"
                  >
                    {event.registrationCount >= event.maxCapacity ? 'Full' : 'Register'}
                  </button>
                )}
                
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    Deadline: {format(new Date(event.registrationDeadline), 'MMM dd')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <CalendarIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500">
            {selectedCategory === 'all' 
              ? 'There are no events available at the moment.' 
              : `No ${selectedCategory.replace('-', ' ')} events available.`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;