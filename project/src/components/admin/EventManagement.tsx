import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  UserGroupIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Event, Registration, User } from '../../types';
import { format } from 'date-fns';

const EventManagement: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'workshop' as Event['type'],
    venue: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxCapacity: 50,
  });

  useEffect(() => {
    fetchEvents();
  }, [user?.collegeId]);

  const fetchEvents = async () => {
    if (!user?.collegeId) return;
    
    try {
      const eventsData = await apiService.getEvents(user.collegeId);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventRegistrations = async (eventId: string) => {
    try {
      const regs = await apiService.getRegistrations(eventId);
      setRegistrations(regs);
      
      // Fetch user details for registered students
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const registeredUserIds = regs.map(reg => reg.studentId);
      const registeredUsersData = users.filter((u: User) => 
        registeredUserIds.includes(u.id) && u.role === 'student'
      );
      setRegisteredUsers(registeredUsersData);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.collegeId || !user?.id) return;

    try {
      await apiService.createEvent({
        ...formData,
        collegeId: user.collegeId,
        createdBy: user.id,
        status: 'published',
      });
      
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        type: 'workshop',
        venue: '',
        startDate: '',
        endDate: '',
        registrationDeadline: '',
        maxCapacity: 50,
      });
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleViewRegistrations = (event: Event) => {
    setSelectedEvent(event);
    setShowRegistrations(true);
    fetchEventRegistrations(event.id);
  };

  const eventTypes = [
    { value: 'workshop', label: 'Workshop' },
    { value: 'hackathon', label: 'Hackathon' },
    { value: 'tech-talk', label: 'Tech Talk' },
    { value: 'fest', label: 'Fest' },
    { value: 'seminar', label: 'Seminar' },
    { value: 'other', label: 'Other' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
          <p className="text-gray-600 mt-1">Create and manage campus events</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Create Event</span>
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                  event.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                  event.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {event.status}
                </span>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                {event.type.replace('-', ' ')}
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

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
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleViewRegistrations(event)}
                className="flex-1 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center space-x-1"
              >
                <EyeIcon className="h-4 w-4" />
                <span>View ({event.registrationCount || 0})</span>
              </button>
              <button className="bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                <PencilIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Event Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Event</h2>
              
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Type
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Event['type'] }))}
                    >
                      {eventTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Venue
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.venue}
                      onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Deadline
                    </label>
                    <input
                      type="datetime-local"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.registrationDeadline}
                      onChange={(e) => setFormData(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Capacity
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.maxCapacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxCapacity: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Create Event
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Registrations Modal */}
      {showRegistrations && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.title}</h2>
                  <p className="text-gray-600">Registered Students ({registrations.length})</p>
                </div>
                <button
                  onClick={() => setShowRegistrations(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {registeredUsers.length > 0 ? (
                <div className="space-y-3">
                  {registeredUsers.map((user, index) => {
                    const registration = registrations.find(reg => reg.studentId === user.id);
                    return (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </h4>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            Registered: {registration ? format(new Date(registration.registeredAt), 'MMM dd, yyyy') : 'N/A'}
                          </p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            registration?.status === 'registered' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {registration?.status || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <UserGroupIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No registrations yet</h3>
                  <p className="text-gray-500">Students haven't registered for this event yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;