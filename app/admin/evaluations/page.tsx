"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { evaluationService, userService } from "@/lib/firestore";
import { Evaluation, User } from "@/types";
import {
  ArrowLeft,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  UserCheck,
  FileText,
  Calendar,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminEvaluationsPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    if (!currentUser) return;
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    try {
      const [evaluationsData, usersData] = await Promise.all([
        evaluationService.getAllEvaluations(),
        userService.getAllUsers(),
      ]);

      setEvaluations(evaluationsData);
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserById = (uid: string): User | undefined => {
    return users.find((user) => user.uid === uid);
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "manager":
        return "Manager";
      case "employee":
        return "Employee";
      default:
        return role;
    }
  };

  const getEvaluationTypeDisplayName = (type: string) => {
    switch (type) {
      case "peer":
        return "Peer to Peer";
      case "manager_to_employee":
        return "Manager to Employee";
      case "employee_to_manager":
        return "Employee to Manager";
      default:
        return type;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        );
      case "in_progress":
        return <AlertCircle className="h-4 w-4 text-primary" />;
      case "completed":
        return (
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        );
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200";
      case "in_progress":
        return "bg-primary/10 text-primary";
      case "completed":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200";
      case "overdue":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filteredEvaluations = evaluations.filter((evaluation) => {
    const typeMatch = filterType === "all" || evaluation.type === filterType;
    const statusMatch =
      filterStatus === "all" || evaluation.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const getStats = () => {
    const total = evaluations.length;
    const pending = evaluations.filter((e) => e.status === "pending").length;
    const inProgress = evaluations.filter(
      (e) => e.status === "in_progress"
    ).length;
    const completed = evaluations.filter(
      (e) => e.status === "completed"
    ).length;
    const overdue = evaluations.filter((e) => e.status === "overdue").length;

    return { total, pending, inProgress, completed, overdue };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background transition-colors duration-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
                  All Evaluations
                </h1>
              </div>
              <button
                onClick={() => router.push("/admin/assignments")}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:filter hover:brightness-90 transition-colors cursor-pointer"
              >
                <Users className="h-4 w-4" />
                <span>Assign New</span>
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-primary" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total
                  </p>
                  <p className="text-2xl font-semibold text-foreground">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Pending
                  </p>
                  <p className="text-2xl font-semibold text-foreground">
                    {stats.pending}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-primary" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    In Progress
                  </p>
                  <p className="text-2xl font-semibold text-foreground">
                    {stats.inProgress}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Completed
                  </p>
                  <p className="text-2xl font-semibold text-foreground">
                    {stats.completed}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Overdue
                  </p>
                  <p className="text-2xl font-semibold text-foreground">
                    {stats.overdue}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-card rounded-lg border border-border p-4 mb-6">
            <div className="flex flex-wrap items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground bg-card"
                >
                  <option value="all">All Types</option>
                  <option value="peer">Peer to Peer</option>
                  <option value="manager_to_employee">
                    Manager to Employee
                  </option>
                  <option value="employee_to_manager">
                    Employee to Manager
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground bg-card"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>

          {/* Evaluations List */}
          <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-medium text-foreground">
                Evaluations ({filteredEvaluations.length})
              </h3>
            </div>
            <div className="divide-y divide-border">
              {filteredEvaluations.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  No evaluations found with the selected filters.
                </div>
              ) : (
                filteredEvaluations.map((evaluation) => {
                  const evaluator = getUserById(evaluation.evaluatorId);
                  const evaluatee = getUserById(evaluation.evaluateeId);

                  return (
                    <div
                      key={evaluation.id}
                      className="p-6 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h4 className="text-lg font-medium text-foreground">
                              {evaluation.title}
                            </h4>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                evaluation.status
                              )}`}
                            >
                              {getStatusIcon(evaluation.status)}
                              <span className="ml-1">
                                {evaluation.status.replace("_", " ")}
                              </span>
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200">
                              {getEvaluationTypeDisplayName(evaluation.type)}
                            </span>
                          </div>

                          {evaluation.description && (
                            <p className="text-muted-foreground mb-3">
                              {evaluation.description}
                            </p>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground/80">
                            <div className="flex items-center space-x-2">
                              <UserCheck className="h-4 w-4 text-primary" />
                              <span>
                                <strong>Evaluator:</strong>{" "}
                                {evaluator?.displayName || evaluator?.email} (
                                {getRoleDisplayName(evaluator?.role || "")})
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                              <span>
                                <strong>Evaluatee:</strong>{" "}
                                {evaluatee?.displayName || evaluatee?.email} (
                                {getRoleDisplayName(evaluatee?.role || "")})
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                              <span>
                                <strong>Due:</strong>{" "}
                                {evaluation.dueDate.toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 text-sm text-muted-foreground">
                            <span>
                              <strong>Questions:</strong>{" "}
                              {evaluation.questions.length}
                            </span>
                            {evaluation.responses.length > 0 && (
                              <span className="ml-4">
                                <strong>Responses:</strong>{" "}
                                {evaluation.responses.length}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
