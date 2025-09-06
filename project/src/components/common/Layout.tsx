import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  HomeIcon, 
  CalendarIcon, 
  ChartBarIcon, 
  UserGroupIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentSection, onSectionChange }) => {
  const { user, logout } = useAuth();

  const navigation = user?.role === 'admin' ? [
    { name: 'Dashboard', id: 'dashboard', icon: HomeIcon },
    { name: 'Events', id: 'events', icon: CalendarIcon },
    { name: 'Analytics', id: 'analytics', icon: ChartBarIcon },
    { name: 'Students', id: 'students', icon: UserGroupIcon },
    { name: 'Settings', id: 'settings', icon: Cog6ToothIcon },
  ] : [
    { name: 'Events', id: 'events', icon: CalendarIcon },
    { name: 'My Events', id: 'my-events', icon: UserGroupIcon },
    { name: 'Profile', id: 'profile', icon: Cog6ToothIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 border-b border-gray-200">
            <CalendarIcon className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">EventHub</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => onSectionChange(item.id)}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  currentSection === item.id
                    ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className={`h-5 w-5 mr-3 ${
                  currentSection === item.id ? 'text-indigo-600' : 'text-gray-400'
                }`} />
                {item.name}
              </button>
            ))}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-3">
              <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.firstName.charAt(0)}{user?.lastName.charAt(0)}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;