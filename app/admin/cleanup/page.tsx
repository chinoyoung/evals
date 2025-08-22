'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { userService } from '@/lib/firestore';
import { ArrowLeft, Trash2, Users, AlertTriangle } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminCleanupPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ removed: number; kept: number } | null>(null);
  const [error, setError] = useState('');

  const handleCleanup = async () => {
    if (!confirm('This will remove duplicate users from the database. Are you sure you want to continue?')) {
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const cleanupResult = await userService.cleanupDuplicateUsers();
      setResult(cleanupResult);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cleanup duplicate users';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Database Cleanup</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
              <div>
                <h3 className="text-lg font-medium text-yellow-800">Important Warning</h3>
                <p className="text-yellow-700 mt-1">
                  This utility will permanently remove duplicate user accounts from your database. 
                  Make sure you have a backup before proceeding.
                </p>
              </div>
            </div>
          </div>

          {/* Cleanup Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">Remove Duplicate Users</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              This will scan your users collection and remove duplicate accounts based on email addresses. 
              For each duplicate email, it will keep the oldest account and remove the newer ones.
            </p>

            <button
              onClick={handleCleanup}
              disabled={loading}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Trash2 className="h-5 w-5" />
              )}
              <span>{loading ? 'Cleaning up...' : 'Start Cleanup'}</span>
            </button>

            {/* Results */}
            {result && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <h3 className="font-medium text-green-800">Cleanup Complete</h3>
                    <p className="text-green-700 mt-1">
                      Removed {result.removed} duplicate users, kept {result.kept} users.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Information */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-800 mb-3">How it works</h3>
            <ul className="text-blue-700 space-y-2 text-sm">
              <li>• Scans all users in the database</li>
              <li>• Groups users by email address</li>
              <li>• For each duplicate email, keeps the oldest account</li>
              <li>• Removes newer duplicate accounts</li>
              <li>• Uses Firestore batch operations for safety</li>
            </ul>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
