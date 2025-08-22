"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  userService,
  questionService,
  evaluationService,
  templateService,
} from "@/lib/firestore";
import { User, Question, EvaluationTemplate, Evaluation } from "@/types";
import {
  Plus,
  ArrowLeft,
  Save,
  X,
  Users,
  UserCheck,
  Calendar,
  FileText,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminAssignmentsPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [templates, setTemplates] = useState<EvaluationTemplate[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "peer" as "peer" | "manager_to_employee" | "employee_to_manager",
    evaluatorId: "",
    evaluateeId: "",
    dueDate: "",
    questions: [] as string[],
  });

  useEffect(() => {
    if (!currentUser) return;
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    try {
      const [usersData, questionsData, templatesData] = await Promise.all([
        userService.getAllUsers(),
        questionService.getQuestions(),
        templateService.getTemplates(),
      ]);

      setUsers(usersData);
      setQuestions(questionsData);
      setTemplates(templatesData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.evaluatorId ||
      !formData.evaluateeId ||
      formData.questions.length === 0
    ) {
      alert("Please fill in all required fields and select questions");
      return;
    }

    try {
      // Get the selected questions
      const selectedQuestions = questions.filter((q) =>
        formData.questions.includes(q.id)
      );

      // Create the evaluation
      const evaluationData: Omit<Evaluation, "id" | "createdAt"> = {
        title: formData.title,
        description: formData.description,
        evaluatorId: formData.evaluatorId,
        evaluateeId: formData.evaluateeId,
        type: formData.type,
        status: "pending",
        dueDate: new Date(formData.dueDate),
        assignedDate: new Date(),
        questions: selectedQuestions,
        responses: [],
        createdBy: currentUser!.uid,
      };

      await evaluationService.createEvaluation(evaluationData);

      // Reset form
      setFormData({
        title: "",
        description: "",
        type: "peer",
        evaluatorId: "",
        evaluateeId: "",
        dueDate: "",
        questions: [],
      });
      setShowForm(false);

      alert("Evaluation assigned successfully!");
    } catch (error) {
      console.error("Error assigning evaluation:", error);
      alert("Failed to assign evaluation");
    }
  };

  const getUsersByRole = (role: string) => {
    return users.filter((user) => user.role === role);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  Assign Evaluations
                </h1>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Assign Evaluation</span>
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Assignment Form */}
          {showForm && (
            <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Assign New Evaluation
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Evaluation Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="e.g., Q1 Performance Review"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="type"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Evaluation Type *
                    </label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as
                            | "peer"
                            | "manager_to_employee"
                            | "employee_to_manager",
                        })
                      }
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                      <option value="peer">Peer to Peer</option>
                      <option value="manager_to_employee">
                        Manager to Employee
                      </option>
                      <option value="employee_to_manager">
                        Employee to Manager
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={2}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Optional description of the evaluation..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="evaluatorId"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Evaluator (Who will evaluate) *
                    </label>
                    <select
                      id="evaluatorId"
                      value={formData.evaluatorId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          evaluatorId: e.target.value,
                        })
                      }
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                      <option value="">Select Evaluator</option>
                      {users.map((user) => (
                        <option key={user.uid} value={user.uid}>
                          {user.displayName || user.email} (
                          {getRoleDisplayName(user.role)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="evaluateeId"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Evaluatee (Who will be evaluated) *
                    </label>
                    <select
                      id="evaluateeId"
                      value={formData.evaluateeId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          evaluateeId: e.target.value,
                        })
                      }
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                      <option value="">Select Evaluatee</option>
                      {users.map((user) => (
                        <option key={user.uid} value={user.uid}>
                          {user.displayName || user.email} (
                          {getRoleDisplayName(user.role)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="dueDate"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Due Date *
                    </label>
                    <input
                      type="date"
                      id="dueDate"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                      required
                      min={new Date().toISOString().split("T")[0]}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Questions *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                    {questions.map((question) => (
                      <label
                        key={question.id}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={formData.questions.includes(question.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                questions: [...formData.questions, question.id],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                questions: formData.questions.filter(
                                  (id) => id !== question.id
                                ),
                              });
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-900">
                          {question.text.substring(0, 50)}...
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            question.type === "slider"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {question.type}
                        </span>
                      </label>
                    ))}
                  </div>
                  {questions.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      No questions available. Please create questions first.
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        title: "",
                        description: "",
                        type: "peer",
                        evaluatorId: "",
                        evaluateeId: "",
                        dueDate: "",
                        questions: [],
                      });
                      setShowForm(false);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X className="h-4 w-4 inline mr-2" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formData.questions.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="h-4 w-4 inline mr-2" />
                    Assign Evaluation
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Information Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-blue-800 mb-3">
              How to Assign Evaluations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
              <div className="flex items-start space-x-2">
                <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Peer to Peer</p>
                  <p>Employees evaluate each other</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <UserCheck className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Manager to Employee</p>
                  <p>Managers evaluate their team members</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Employee to Manager</p>
                  <p>Employees provide feedback to managers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">
                    Total Users
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {users.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Questions</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {questions.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Templates</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {templates.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-indigo-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">
                    Ready to Assign
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">✓</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
