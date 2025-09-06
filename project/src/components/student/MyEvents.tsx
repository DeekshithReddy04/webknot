import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Event, Registration, Attendance, Feedback } from '../../types';
import { format, isPast } from 'date-fns';

const MyEvents: React.FC = () => {
  const { user } = useAuth();
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    comment: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyEvents();
  }, [user?.id]);

  const fetchMyEvents = async () => {
    if (!user?.id) return;
    
    try {
      const [regs, events, atts, feeds] = await Promise.all([
        apiService.getRegistrations(undefined, user.id),
        apiService.getEvents(user.collegeId),
        apiService.getAttendances(undefined, user.id),
        apiService.getFeedbacks()
      ]);

      setRegistrations(regs);
      setAttendances(atts);
      setFeedbacks(feeds.filter(f => f.studentId === user.id));

      // Get events I'm registered for
      const registeredEventIds = regs.map(r => r.eventId);
      const myEvents = events.filter(e => registeredEventIds.includes(e.id));
      setRegisteredEvents(myEvents);
    } catch (error) {
      console.error('Error fetching my events:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAttended = (eventId: string) => {
    return attendances.some(att => att.eventId === eventId);
  };

  const hasFeedback = (eventId: string) => {
    return feedbacks.some(fb => fb.eventId === eventId);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !user?.id) return;

    try {
      await apiService.submitFeedback(
        selectedEvent.id,
        user.id,
        feedbackData.rating,
        feedbackData.comment
      );
      
      setShowFeedbackModal(false);
      setFeedbackData({ rating: 5, comment: '' });
      fetchMyEvents(); // Refresh to update feedback status
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback. Please try again.');
    }
  };

  const openFeedbackModal = (event: Event) => {
    setSelectedEvent(event);
    setShowFeedbackModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const upcomingEvents = registeredEvents.filter(event => !isPast(new Date(event.startDate)));
  const pastEvents = registeredEvents.filter(event => isPast(new Date(event.startDate)));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
        <p className="text-gray-600 mt-1">Track your registered events and provide feedback</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Registered</p>
              <p className="text-2xl font-bold text-gray-900">{registrations.length}</p>
            </div>
            <CalendarIcon className="h-8 w-8 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Attended</p>
              <p className="text-2xl font-bold text-gray-900">{attendances.length}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingEvents.length}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Feedback Given</p>
              <p className="text-2xl font-bold text-gray-900">{feedbacks.length}</p>
            </div>
            <StarIcon className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map(event => (
              <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Upcoming
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
                </div>

                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                    {event.type.replace('-', ' ')}
                  </span>
                  <div className="flex items-center text-emerald-600">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Registered</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map(event => {
              const attended = isAttended(event.id);
              const feedbackGiven = hasFeedback(event.id);
              
              return (
                <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      attended ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {attended ? 'Attended' : 'Missed'}
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
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                      {event.type.replace('-', ' ')}
                    </span>
                    
                    {attended && !feedbackGiven && (
                      <button
                        onClick={() => openFeedbackModal(event)}
                        className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                        Give Feedback
                      </button>
                    )}
                    
                    {feedbackGiven && (
                      <div className="flex items-center text-emerald-600">
                        <StarIcon className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">Feedback Given</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {registeredEvents.length === 0 && (
        <div className="text-center py-12">
          <CalendarIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events registered</h3>
          <p className="text-gray-500">You haven't registered for any events yet. Browse available events to get started!</p>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Feedback for {selectedEvent.title}
              </h2>
              
              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating (1-5 stars)
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackData(prev => ({ ...prev, rating: star }))}
                        className={`p-1 ${
                          star <= feedbackData.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        <StarIcon className="h-6 w-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comments (Optional)
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Share your thoughts about the event..."
                    value={feedbackData.comment}
                    onChange={(e) => setFeedbackData(prev => ({ ...prev, comment: e.target.value }))}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Submit Feedback
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
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
    </div>
  );
};

export default MyEvents;