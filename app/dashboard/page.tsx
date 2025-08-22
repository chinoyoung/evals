"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { evaluationService, userService } from "@/lib/firestore";
import { Evaluation, User } from "@/types";
import {
  LogOut,
  User as UserIcon,
  ClipboardList,
  CheckCircle,
  Clock,
  Plus,
  BarChart3,
  Users,
  Trash2,
  FileText,
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser || !userProfile) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  Evals Dashboard
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-700">
                    {userProfile.displayName || userProfile.email}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {userProfile.role}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
                <ClipboardList className="h-6 w-6 text-blue-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">
                    Start Evaluation
                  </div>
                  <div className="text-sm text-gray-500">
                    Begin a new evaluation
                  </div>
                </div>
              </button>

              {userProfile.role === "admin" && (
                <>
                  <button
                    onClick={() => router.push("/admin/questions")}
                    className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <Plus className="h-6 w-6 text-green-600 mr-3" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">
                        Create Question
                      </div>
                      <div className="text-sm text-gray-500">
                        Add new evaluation questions
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push("/admin/assignments")}
                    className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <Users className="h-6 w-6 text-purple-600 mr-3" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">
                        Assign Evaluations
                      </div>
                      <div className="text-sm text-gray-500">
                        Set up evaluation assignments
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push("/admin/evaluations")}
                    className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <FileText className="h-6 w-6 text-orange-600 mr-3" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">
                        View All Evaluations
                      </div>
                      <div className="text-sm text-gray-500">
                        Monitor evaluation progress
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push("/admin/users")}
                    className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <Users className="h-6 w-6 text-indigo-600 mr-3" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">
                        Manage Users
                      </div>
                      <div className="text-sm text-gray-500">
                        User roles and permissions
                      </div>
                    </div>
                  </button>

                  <button className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
                    <BarChart3 className="h-6 w-6 text-indigo-600 mr-3" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">
                        View Reports
                      </div>
                      <div className="text-sm text-gray-500">
                        Analytics and insights
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push("/admin/cleanup")}
                    className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <Trash2 className="h-6 w-6 text-red-600 mr-3" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">
                        Database Cleanup
                      </div>
                      <div className="text-sm text-gray-500">
                        Remove duplicate users
                      </div>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Pending Evaluations */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Pending Evaluations
            </h2>
            {pendingEvaluations.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No pending evaluations
                </h3>
                <p className="text-gray-500">
                  You&apos;re all caught up! Check back later for new
                  evaluations.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {pendingEvaluations.map((evaluation) => (
                    <div
                      key={evaluation.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {evaluation.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Due: {evaluation.dueDate.toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Type: {evaluation.type.replace("_", " ")}
                          </p>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Start Evaluation
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Completed Evaluations */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Completed Evaluations
            </h2>
            {completedEvaluations.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No completed evaluations
                </h3>
                <p className="text-gray-500">
                  Complete your first evaluation to see it here.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {completedEvaluations.map((evaluation) => (
                    <div
                      key={evaluation.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {evaluation.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Completed:{" "}
                            {evaluation.completedDate?.toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Type: {evaluation.type.replace("_", " ")}
                          </p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
