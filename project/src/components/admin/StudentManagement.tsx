import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
  CalendarIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { User, Registration, Attendance, Event } from '../../types';
import { format } from 'date-fns';

interface StudentWithStats extends User {
  totalRegistrations: number;
  totalAttendance: number;
  attendanceRate: number;
  recentEvents: string[];
}

const StudentManagement: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentWithStats[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentWithStats[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'registrations' | 'attendance'>('name');
  const [filterBy, setFilterBy] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentWithStats | null>(null);
  const [studentEvents, setStudentEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, [user?.collegeId]);

  useEffect(() => {
    filterAndSortStudents();
  }, [students, searchTerm, sortBy, filterBy]);

  const fetchStudents = async () => {
    if (!user?.collegeId) return;
    
    try {
      // Get all users from localStorage
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const collegeStudents = allUsers.filter((u: User) => 
        u.role === 'student' && u.collegeId === user.collegeId
      );

      // Get registrations and attendances
      const [registrations, attendances, events] = await Promise.all([
        apiService.getRegistrations(),
        apiService.getAttendances(),
        apiService.getEvents(user.collegeId)
      ]);

      // Calculate stats for each student
      const studentsWithStats: StudentWithStats[] = collegeStudents.map((student: User) => {
        const studentRegistrations = registrations.filter(r => r.studentId === student.id);
        const studentAttendances = attendances.filter(a => a.studentId === student.id);
        
        const recentEventIds = studentRegistrations
          .slice(-3)
          .map(r => events.find(e => e.id === r.eventId)?.title || 'Unknown Event');

        return {
          ...student,
          totalRegistrations: studentRegistrations.length,
          totalAttendance: studentAttendances.length,
          attendanceRate: studentRegistrations.length > 0 
            ? (studentAttendances.length / studentRegistrations.length) * 100 
            : 0,
          recentEvents: recentEventIds,
        };
      });

      setStudents(studentsWithStats);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortStudents = () => {
    let filtered = [...students];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(student =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply activity filter
    if (filterBy === 'active') {
      filtered = filtered.filter(student => student.totalRegistrations > 0);
    } else if (filterBy === 'inactive') {
      filtered = filtered.filter(student => student.totalRegistrations === 0);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'registrations':
          return b.totalRegistrations - a.totalRegistrations;
        case 'attendance':
          return b.attendanceRate - a.attendanceRate;
        default:
          return 0;
      }
    });

    setFilteredStudents(filtered);
  };

  const handleViewStudent = async (student: StudentWithStats) => {
    setSelectedStudent(student);
    
    try {
      const [registrations, events] = await Promise.all([
        apiService.getRegistrations(undefined, student.id),
        apiService.getEvents(user?.collegeId)
      ]);

      const studentEventIds = registrations.map(r => r.eventId);
      const studentEventsData = events.filter(e => studentEventIds.includes(e.id));
      setStudentEvents(studentEventsData);
    } catch (error) {
      console.error('Error fetching student events:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.totalRegistrations > 0).length;
  const averageAttendanceRate = students.length > 0 
    ? students.reduce((sum, s) => sum + s.attendanceRate, 0) / students.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
        <p className="text-gray-600 mt-1">Monitor student engagement and participation</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Students</p>
              <p className="text-2xl font-bold text-gray-900">{activeStudents}</p>
              <p className="text-sm text-gray-500">
                {totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0}% of total
              </p>
            </div>
            <AcademicCapIcon className="h-8 w-8 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Attendance Rate</p>
              <p className="text-2xl font-bold text-gray-900">{averageAttendanceRate.toFixed(1)}%</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            >
              <option value="name">Sort by Name</option>
              <option value="registrations">Sort by Registrations</option>
              <option value="attendance">Sort by Attendance Rate</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as typeof filterBy)}
            >
              <option value="all">All Students</option>
              <option value="active">Active Students</option>
              <option value="inactive">Inactive Students</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registrations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          Joined {format(new Date(student.createdAt), 'MMM yyyy')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.totalRegistrations}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.totalAttendance}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(student.attendanceRate, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">
                        {student.attendanceRate.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewStudent(student)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <UserGroupIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria.' : 'No students have registered yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {selectedStudent.firstName.charAt(0)}{selectedStudent.lastName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </h2>
                    <p className="text-gray-600">{selectedStudent.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Student Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-indigo-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-indigo-600">{selectedStudent.totalRegistrations}</p>
                  <p className="text-sm text-gray-600">Total Registrations</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-emerald-600">{selectedStudent.totalAttendance}</p>
                  <p className="text-sm text-gray-600">Events Attended</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedStudent.attendanceRate.toFixed(0)}%</p>
                  <p className="text-sm text-gray-600">Attendance Rate</p>
                </div>
              </div>

              {/* Student Events */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Registered Events</h3>
                {studentEvents.length > 0 ? (
                  <div className="space-y-3">
                    {studentEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          <p className="text-sm text-gray-500">
                            {format(new Date(event.startDate), 'MMM dd, yyyy • h:mm a')}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                            {event.type.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No events registered yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;