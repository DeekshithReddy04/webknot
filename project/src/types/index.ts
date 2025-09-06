export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'student';
  collegeId: string;
  createdAt: string;
}

export interface College {
  id: string;
  name: string;
  city: string;
  state: string;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: 'workshop' | 'hackathon' | 'tech-talk' | 'fest' | 'seminar' | 'other';
  venue: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxCapacity: number;
  collegeId: string;
  createdBy: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  createdAt: string;
  registrationCount?: number;
  attendanceCount?: number;
  averageRating?: number;
}

export interface Registration {
  id: string;
  eventId: string;
  studentId: string;
  registeredAt: string;
  status: 'registered' | 'cancelled';
}

export interface Attendance {
  id: string;
  eventId: string;
  studentId: string;
  checkedInAt: string;
  checkedInBy: string;
}

export interface Feedback {
  id: string;
  eventId: string;
  studentId: string;
  rating: number;
  comment?: string;
  submittedAt: string;
}

export interface EventStats {
  totalEvents: number;
  totalRegistrations: number;
  totalAttendance: number;
  averageRating: number;
  popularEvents: Array<{
    eventId: string;
    title: string;
    registrations: number;
    attendance: number;
    rating: number;
  }>;
  activeStudents: Array<{
    studentId: string;
    name: string;
    eventsAttended: number;
  }>;
}