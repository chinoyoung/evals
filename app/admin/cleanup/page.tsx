"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { userService } from "@/lib/firestore";
import { ArrowLeft, Trash2, Users, AlertTriangle } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminCleanupPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    removed: number;
    kept: number;
  } | null>(null);
  const [error, setError] = useState("");

  const handleCleanup = async () => {
    if (
      !confirm(
        "This will remove duplicate users from the database. Are you sure you want to continue?"
      )
    ) {
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const cleanupResult = await userService.cleanupDuplicateUsers();
      setResult(cleanupResult);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to cleanup duplicate users";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-background transition-colors duration-200">
        {/* Header */}
        <header className="bg-card shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </button>
                <h1 className="text-2xl font-bold text-foreground">
                  Database Cleanup
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Warning */}
          <div className="bg-yellow-100/10 border border-yellow-200/50 rounded-lg p-6 mb-8">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              <div>
                <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-300">
                  Important Warning
                </h3>
                <p className="text-yellow-700 dark:text-yellow-400/90 mt-1">
                  This utility will permanently remove duplicate user accounts
                  from your database. Make sure you have a backup before
                  proceeding.
                </p>
              </div>
            </div>
          </div>

          {/* Cleanup Section */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Trash2 className="h-6 w-6 text-destructive" />
              <h2 className="text-xl font-semibold text-foreground">
                Remove Duplicate Users
              </h2>
            </div>

            <p className="text-muted-foreground mb-6">
              This will scan your users collection and remove duplicate accounts
              based on email addresses. For each duplicate email, it will keep
              the oldest account and remove the newer ones.
            </p>

            <button
              onClick={handleCleanup}
              disabled={loading}
              className="px-6 py-3 bg-destructive text-destructive-foreground rounded-lg hover:filter hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-destructive-foreground"></div>
              ) : (
                <Trash2 className="h-5 w-5" />
              )}
              <span>{loading ? "Cleaning up..." : "Start Cleanup"}</span>
            </button>

            {/* Results */}
            {result && (
              <div className="mt-6 p-4 bg-green-100/10 border border-green-200/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <h3 className="font-medium text-green-800 dark:text-green-300">
                      Cleanup Complete
                    </h3>
                    <p className="text-green-700 dark:text-green-400/90 mt-1">
                      Removed {result.removed} duplicate users, kept{" "}
                      {result.kept} users.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-6 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>

          {/* Information */}
          <div className="mt-8 bg-primary/10 border border-primary/20 rounded-lg p-6">
            <h3 className="text-lg font-medium text-primary mb-3">
              How it works
            </h3>
            <ul className="text-primary/80 space-y-2 text-sm">
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
