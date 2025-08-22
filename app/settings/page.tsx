'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Moon, 
  Sun, 
  Monitor, 
  User, 
  Shield, 
  Bell,
  Palette,
  Settings as SettingsIcon
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function SettingsPage() {
  const { currentUser } = useAuth();
  const { theme, setTheme, isDark } = useTheme();
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);

  const themeOptions = [
    {
      value: 'light' as const,
      label: 'Light',
      icon: Sun,
      description: 'Clean, bright interface'
    },
    {
      value: 'dark' as const,
      label: 'Dark',
      icon: Moon,
      description: 'Easy on the eyes'
    },
    {
      value: 'system' as const,
      label: 'System',
      icon: Monitor,
      description: 'Follows your device'
    }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </button>
            <div className="flex items-center space-x-3">
              <SettingsIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Navigation Sidebar */}
            <div className="lg:col-span-1">
              <nav className="space-y-2">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Preferences
                  </h3>
                  <div className="space-y-1">
                    <button className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
                      <Palette className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>Appearance</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
                      <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>Notifications</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
                      <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>Profile</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
                      <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>Privacy & Security</span>
                    </button>
                  </div>
                </div>
              </nav>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Appearance Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Palette className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Appearance</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Choose your theme
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {themeOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = theme === option.value;
                        
                        return (
                          <button
                            key={option.value}
                            onClick={() => setTheme(option.value)}
                            className={`relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                          >
                            <div className="flex flex-col items-center space-y-3">
                              <div className={`p-3 rounded-full ${
                                isSelected 
                                  ? 'bg-blue-100 dark:bg-blue-800' 
                                  : 'bg-gray-100 dark:bg-gray-700'
                              }`}>
                                <Icon className={`h-6 w-6 ${
                                  isSelected 
                                    ? 'text-blue-600 dark:text-blue-400' 
                                    : 'text-gray-600 dark:text-gray-400'
                                }`} />
                              </div>
                              <div className="text-center">
                                <div className={`font-medium ${
                                  isSelected 
                                    ? 'text-blue-900 dark:text-blue-100' 
                                    : 'text-gray-900 dark:text-white'
                                }`}>
                                  {option.label}
                                </div>
                                <div className={`text-sm ${
                                  isSelected 
                                    ? 'text-blue-700 dark:text-blue-300' 
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                  {option.description}
                                </div>
                              </div>
                            </div>
                            
                            {isSelected && (
                              <div className="absolute top-2 right-2">
                                <div className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Preview</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          See how your theme looks
                        </p>
                      </div>
                      <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        isDark 
                          ? 'bg-gray-800 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        {isDark ? 'Dark Mode' : 'Light Mode'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifications Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notifications</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive notifications about evaluations and updates
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications}
                        onChange={(e) => setNotifications(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Email Updates</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Get email notifications for important events
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={emailUpdates}
                        onChange={(e) => setEmailUpdates(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* User Info Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">User Information</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {currentUser?.email}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Display Name
                    </label>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {currentUser?.displayName || 'Not set'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      User ID
                    </label>
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {currentUser?.uid}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
