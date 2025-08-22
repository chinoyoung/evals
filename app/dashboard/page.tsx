"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "next/navigation";
import { userService, evaluationService } from "@/lib/firestore";
import { User, Evaluation } from "@/types";
import {
  Clock,
  CheckCircle,
  LogOut,
  Plus,
  BarChart3,
  Users,
  Trash2,
  FileText,
  Building2,
  Settings,
  UserCheck,
  Moon,
  Sun,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardPage() {
  const { currentUser, signOutUser } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [pendingEvaluations, setPendingEvaluations] = useState<Evaluation[]>(
    []
  );
  const [completedEvaluations, setCompletedEvaluations] = useState<
    Evaluation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const { setTheme, isDark } = useTheme();

  useEffect(() => {
    if (!currentUser) return;

    const loadDashboardData = async () => {
      try {
        // Load user profile - check if it already exists
        let profile = await userService.getUser(currentUser.uid);

        if (!profile) {
          // Only create a new profile if one doesn't exist
          console.log("Creating new user profile for:", currentUser.uid);
          const newProfile: Omit<User, "createdAt"> = {
            uid: currentUser.uid,
            email: currentUser.email || "",
            displayName: currentUser.displayName || "",
            role: "employee", // Default role
            department: "",
          };
          await userService.createUser(newProfile);
          profile = await userService.getUser(currentUser.uid);
        } else {
          console.log("Found existing user profile for:", currentUser.uid);
        }

        if (profile) {
          setUserProfile(profile);
        }

        // Load evaluations
        const pending = await evaluationService.getUserEvaluations(
          currentUser.uid,
          "pending"
        );
        const completed = await evaluationService.getUserEvaluations(
          currentUser.uid,
          "completed"
        );

        setPendingEvaluations(pending);
        setCompletedEvaluations(completed);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [currentUser]);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser || !userProfile) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Welcome back, {userProfile?.displayName || userProfile?.email}
                  !
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Here&apos;s what&apos;s happening with your evaluations
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/settings")}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </button>

              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {isDark ? (
                  <>
                    <Sun className="h-5 w-5" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-5 w-5" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>

              <button
                onClick={signOutUser}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => router.push("/evaluations")}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      View Evaluations
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Check your assigned evaluations
                    </p>
                  </div>
                </div>
              </button>

              {userProfile?.role === "admin" && (
                <>
                  <button
                    onClick={() => router.push("/admin/questions")}
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <Plus className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Manage Questions
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Create and edit evaluation questions
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push("/admin/assignments")}
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                        <UserCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Assign Evaluations
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Assign evaluations to team members
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push("/admin/evaluations")}
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          View All Evaluations
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Monitor all evaluation progress
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push("/admin/users")}
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Manage Users
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Manage user roles and permissions
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push("/admin/cleanup")}
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                        <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Database Cleanup
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Clean up duplicate user accounts
                        </p>
                      </div>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Pending Evaluations
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {pendingEvaluations.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Completed Evaluations
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {completedEvaluations.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Your Role
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white capitalize">
                    {userProfile?.role}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Evaluations */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Recent Evaluations
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {pendingEvaluations.length === 0 &&
              completedEvaluations.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-lg font-medium">No evaluations yet</p>
                  <p className="text-sm">
                    {userProfile?.role === "admin"
                      ? "Start by creating questions and assigning evaluations"
                      : "You don't have any evaluations assigned yet"}
                  </p>
                </div>
              ) : (
                [...pendingEvaluations, ...completedEvaluations]
                  .slice(0, 5)
                  .map((evaluation) => (
                    <div
                      key={evaluation.id}
                      className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {evaluation.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Due: {evaluation.dueDate.toLocaleDateString()}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                evaluation.status === "completed"
                                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                  : evaluation.status === "pending"
                                  ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                                  : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                              }`}
                            >
                              {evaluation.status.replace("_", " ")}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                              {evaluation.type.replace("_", " ")}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            router.push(`/evaluations/${evaluation.id}`)
                          }
                          className="ml-4 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
