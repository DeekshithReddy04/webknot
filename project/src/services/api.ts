import { Event, Registration, Attendance, Feedback, EventStats, College } from '../types';

// Mock data storage service using localStorage
class ApiService {
  private getStorageKey(key: string): string {
    return `campus_events_${key}`;
  }

  private getFromStorage<T>(key: string): T[] {
    const data = localStorage.getItem(this.getStorageKey(key));
    return data ? JSON.parse(data) : [];
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    localStorage.setItem(this.getStorageKey(key), JSON.stringify(data));
  }

  // Initialize sample data
  initializeSampleData(): void {
    const colleges = this.getFromStorage<College>('colleges');
    if (colleges.length === 0) {
      const sampleColleges: College[] = [
        {
          id: 'college-1',
          name: 'MIT Technology Institute',
          city: 'Boston',
          state: 'Massachusetts',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'college-2',
          name: 'Stanford University',
          city: 'Stanford',
          state: 'California',
          createdAt: new Date().toISOString(),
        },
      ];
      this.saveToStorage('colleges', sampleColleges);
    }

    const events = this.getFromStorage<Event>('events');
    if (events.length === 0) {
      const sampleEvents: Event[] = [
        {
          id: 'event-1',
          title: 'AI/ML Workshop',
          description: 'Learn the fundamentals of Machine Learning and AI development',
          type: 'workshop',
          venue: 'Main Auditorium',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
          registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          maxCapacity: 100,
          collegeId: 'college-1',
          createdBy: 'admin-1',
          status: 'published',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'event-2',
          title: 'Annual Hackathon 2025',
          description: '48-hour coding marathon with exciting prizes',
          type: 'hackathon',
          venue: 'Tech Center',
          startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(),
          registrationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          maxCapacity: 200,
          collegeId: 'college-1',
          createdBy: 'admin-1',
          status: 'published',
          createdAt: new Date().toISOString(),
        },
      ];
      this.saveToStorage('events', sampleEvents);
    }
  }

  // College API
  async getColleges(): Promise<College[]> {
    return this.getFromStorage<College>('colleges');
  }

  // Event API
  async getEvents(collegeId?: string, type?: string): Promise<Event[]> {
    let events = this.getFromStorage<Event>('events');
    
    if (collegeId) {
      events = events.filter(event => event.collegeId === collegeId);
    }
    
    if (type) {
      events = events.filter(event => event.type === type);
    }

    // Add statistics to events
    const registrations = this.getFromStorage<Registration>('registrations');
    const attendances = this.getFromStorage<Attendance>('attendances');
    const feedbacks = this.getFromStorage<Feedback>('feedbacks');

    return events.map(event => ({
      ...event,
      registrationCount: registrations.filter(r => r.eventId === event.id && r.status === 'registered').length,
      attendanceCount: attendances.filter(a => a.eventId === event.id).length,
      averageRating: this.calculateAverageRating(event.id, feedbacks),
    }));
  }

  async getEvent(id: string): Promise<Event | null> {
    const events = await this.getEvents();
    return events.find(event => event.id === id) || null;
  }

  async createEvent(event: Omit<Event, 'id' | 'createdAt'>): Promise<Event> {
    const events = this.getFromStorage<Event>('events');
    const newEvent: Event = {
      ...event,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    events.push(newEvent);
    this.saveToStorage('events', events);
    return newEvent;
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | null> {
    const events = this.getFromStorage<Event>('events');
    const index = events.findIndex(event => event.id === id);
    if (index === -1) return null;

    events[index] = { ...events[index], ...updates };
    this.saveToStorage('events', events);
    return events[index];
  }

  // Registration API
  async registerForEvent(eventId: string, studentId: string): Promise<Registration> {
    const registrations = this.getFromStorage<Registration>('registrations');
    
    // Check if already registered
    const existing = registrations.find(r => r.eventId === eventId && r.studentId === studentId);
    if (existing && existing.status === 'registered') {
      throw new Error('Already registered for this event');
    }

    const registration: Registration = {
      id: Math.random().toString(36).substr(2, 9),
      eventId,
      studentId,
      registeredAt: new Date().toISOString(),
      status: 'registered',
    };

    registrations.push(registration);
    this.saveToStorage('registrations', registrations);
    return registration;
  }

  async getRegistrations(eventId?: string, studentId?: string): Promise<Registration[]> {
    let registrations = this.getFromStorage<Registration>('registrations');
    
    if (eventId) {
      registrations = registrations.filter(r => r.eventId === eventId);
    }
    
    if (studentId) {
      registrations = registrations.filter(r => r.studentId === studentId);
    }

    return registrations;
  }

  // Attendance API
  async markAttendance(eventId: string, studentId: string, checkedInBy: string): Promise<Attendance> {
    const attendances = this.getFromStorage<Attendance>('attendances');
    
    // Check if already marked
    const existing = attendances.find(a => a.eventId === eventId && a.studentId === studentId);
    if (existing) {
      throw new Error('Attendance already marked');
    }

    const attendance: Attendance = {
      id: Math.random().toString(36).substr(2, 9),
      eventId,
      studentId,
      checkedInAt: new Date().toISOString(),
      checkedInBy,
    };

    attendances.push(attendance);
    this.saveToStorage('attendances', attendances);
    return attendance;
  }

  async getAttendances(eventId?: string, studentId?: string): Promise<Attendance[]> {
    let attendances = this.getFromStorage<Attendance>('attendances');
    
    if (eventId) {
      attendances = attendances.filter(a => a.eventId === eventId);
    }
    
    if (studentId) {
      attendances = attendances.filter(a => a.studentId === studentId);
    }

    return attendances;
  }

  // Feedback API
  async submitFeedback(eventId: string, studentId: string, rating: number, comment?: string): Promise<Feedback> {
    const feedbacks = this.getFromStorage<Feedback>('feedbacks');
    
    // Check if feedback already exists
    const existing = feedbacks.find(f => f.eventId === eventId && f.studentId === studentId);
    if (existing) {
      throw new Error('Feedback already submitted');
    }

    const feedback: Feedback = {
      id: Math.random().toString(36).substr(2, 9),
      eventId,
      studentId,
      rating,
      comment,
      submittedAt: new Date().toISOString(),
    };

    feedbacks.push(feedback);
    this.saveToStorage('feedbacks', feedbacks);
    return feedback;
  }

  async getFeedbacks(eventId?: string): Promise<Feedback[]> {
    let feedbacks = this.getFromStorage<Feedback>('feedbacks');
    
    if (eventId) {
      feedbacks = feedbacks.filter(f => f.eventId === eventId);
    }

    return feedbacks;
  }

  // Analytics API
  async getEventStats(collegeId: string): Promise<EventStats> {
    const events = await this.getEvents(collegeId);
    const registrations = await this.getRegistrations();
    const attendances = await this.getAttendances();
    const feedbacks = await this.getFeedbacks();

    const collegeEvents = events.filter(e => e.collegeId === collegeId);
    const eventIds = collegeEvents.map(e => e.id);

    const totalRegistrations = registrations.filter(r => 
      eventIds.includes(r.eventId) && r.status === 'registered'
    ).length;

    const totalAttendance = attendances.filter(a => 
      eventIds.includes(a.eventId)
    ).length;

    const eventFeedbacks = feedbacks.filter(f => eventIds.includes(f.eventId));
    const averageRating = eventFeedbacks.length > 0 
      ? eventFeedbacks.reduce((sum, f) => sum + f.rating, 0) / eventFeedbacks.length 
      : 0;

    const popularEvents = collegeEvents
      .map(event => ({
        eventId: event.id,
        title: event.title,
        registrations: event.registrationCount || 0,
        attendance: event.attendanceCount || 0,
        rating: event.averageRating || 0,
      }))
      .sort((a, b) => b.registrations - a.registrations)
      .slice(0, 5);

    // Get active students
    const studentAttendances: { [key: string]: number } = {};
    attendances
      .filter(a => eventIds.includes(a.eventId))
      .forEach(a => {
        studentAttendances[a.studentId] = (studentAttendances[a.studentId] || 0) + 1;
      });

    const activeStudents = Object.entries(studentAttendances)
      .map(([studentId, count]) => ({
        studentId,
        name: `Student ${studentId.slice(0, 8)}`, // In real app, fetch actual names
        eventsAttended: count,
      }))
      .sort((a, b) => b.eventsAttended - a.eventsAttended)
      .slice(0, 10);

    return {
      totalEvents: collegeEvents.length,
      totalRegistrations,
      totalAttendance,
      averageRating,
      popularEvents,
      activeStudents,
    };
  }

  private calculateAverageRating(eventId: string, feedbacks: Feedback[]): number {
    const eventFeedbacks = feedbacks.filter(f => f.eventId === eventId);
    if (eventFeedbacks.length === 0) return 0;
    return eventFeedbacks.reduce((sum, f) => sum + f.rating, 0) / eventFeedbacks.length;
  }
}

export const apiService = new ApiService();