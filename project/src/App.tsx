import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthForm from './components/auth/AuthForm';
import Layout from './components/common/Layout';
import AdminDashboard from './components/admin/AdminDashboard';
import EventManagement from './components/admin/EventManagement';
import Analytics from './components/admin/Analytics';
import StudentManagement from './components/admin/StudentManagement';
import Settings from './components/admin/Settings';
import StudentDashboard from './components/student/StudentDashboard';
import MyEvents from './components/student/MyEvents';
import Profile from './components/student/Profile';
import { apiService } from './services/api';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentSection, setCurrentSection] = React.useState('dashboard');

  useEffect(() => {
    // Initialize sample data and demo users
    apiService.initializeSampleData();
    
    // Create demo users if they don't exist
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.length === 0) {
      const demoUsers = [
        {
          id: 'admin-1',
          email: 'admin@mit.edu',
          firstName: 'John',
          lastName: 'Admin',
          role: 'admin',
          collegeId: 'college-1',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'student-1',
          email: 'student@mit.edu',
          firstName: 'Jane',
          lastName: 'Student',
          role: 'student',
          collegeId: 'college-1',
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem('users', JSON.stringify(demoUsers));
    }
  }, []);

  useEffect(() => {
    // Set default section based on user role
    if (user) {
      setCurrentSection(user.role === 'admin' ? 'dashboard' : 'events');
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const renderContent = () => {
    if (user.role === 'admin') {
      switch (currentSection) {
        case 'dashboard':
          return <AdminDashboard />;
        case 'events':
          return <EventManagement />;
        case 'analytics':
          return <Analytics />;
        case 'students':
          return <StudentManagement />;
        case 'settings':
          return <Settings />;
        default:
          return <AdminDashboard />;
      }
    } else {
      switch (currentSection) {
        case 'events':
          return <StudentDashboard />;
        case 'my-events':
          return <MyEvents />;
        case 'profile':
          return <Profile />;
        default:
          return <StudentDashboard />;
      }
    }
  };

  return (
    <Layout currentSection={currentSection} onSectionChange={setCurrentSection}>
      {renderContent()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;