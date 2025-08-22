"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { userService } from "@/lib/firestore";
import { User } from "@/types";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Users,
  ArrowRight,
} from "lucide-react";

export default function AdminSetupPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [promoting, setPromoting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!currentUser) {
      router.push("/");
      return;
    }
    loadUserProfile();
  }, [currentUser, router]);

  const loadUserProfile = async () => {
    try {
      const profile = await userService.getUser(currentUser!.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error("Error loading user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const promoteToAdmin = async () => {
    if (!currentUser || !userProfile) return;

    setPromoting(true);
    setMessage("");

    try {
      await userService.updateUser(currentUser.uid, { role: "admin" });
      setMessage("Successfully promoted to admin! Redirecting to dashboard...");

      // Reload profile and redirect
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error promoting to admin:", error);
      setMessage("Failed to promote to admin. Please try again.");
    } finally {
      setPromoting(false);
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in to continue.
          </p>
        </div>
      </div>
    );
  }

  // If already admin, redirect to dashboard
  if (userProfile.role === "admin") {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Admin Setup Required
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            This app needs an administrator to function properly
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <h3 className="text-lg font-medium text-gray-900">
                Current Status
              </h3>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span>
                  Signed in as:{" "}
                  <strong>
                    {userProfile.displayName || userProfile.email}
                  </strong>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-gray-400" />
                <span>
                  Current role:{" "}
                  <strong className="text-blue-600">{userProfile.role}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-medium text-gray-900">
                What This Does
              </h3>
            </div>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Promotes you to administrator role</li>
              <li>• Gives access to all admin features</li>
              <li>• Allows you to manage the system</li>
              <li>• Can be used to promote other users</li>
            </ul>
          </div>

          {message && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                message.includes("Successfully")
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          <button
            onClick={promoteToAdmin}
            disabled={promoting}
            className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {promoting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Shield className="h-5 w-5" />
                <span>Promote to Admin</span>
              </>
            )}
          </button>

          <div className="mt-4 text-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center space-x-1 mx-auto"
            >
              <span>Continue as Employee</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>This setup page will be removed once an admin is established</p>
        </div>
      </div>
    </div>
  );
}
