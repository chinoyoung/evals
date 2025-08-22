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
  ArrowLeft,
  Users,
  UserCheck,
  Calendar,
  FileText,
  Target,
  CheckCircle,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import SmartEvaluatorAssignment from "@/components/SmartEvaluatorAssignment";

export default function AdminAssignmentsPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [templates, setTemplates] = useState<EvaluationTemplate[]>([]);
  const [pendingEvaluations, setPendingEvaluations] = useState<Evaluation[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    try {
      const [usersData, questionsData, templatesData, pendingEvaluationsData] = await Promise.all([
        userService.getAllUsers(),
        questionService.getQuestions(),
        templateService.getTemplates(),
        evaluationService.getAllEvaluations(),
      ]);

      setUsers(usersData);
      setQuestions(questionsData);
      setTemplates(templatesData);
      setPendingEvaluations(pendingEvaluationsData.filter(e => e.status === "pending"));
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };



  const handleSmartAssignment = async (assignment: {
    evaluatorId: string;
    evaluateeIds: string[];
    type: string;
    templateId?: string;
    dueDate: string;
  }) => {
    try {
      setAssigning(true);
      console.log("Starting assignment process:", assignment);
      
      let selectedQuestions: Question[] = [];
      
      // If template is selected, use its questions
      if (assignment.templateId) {
        const template = templates.find(t => t.id === assignment.templateId);
        if (template) {
          selectedQuestions = template.questions;
          console.log("Using template questions:", selectedQuestions.length);
        }
      } else {
        // Use default questions or prompt for selection
        selectedQuestions = questions.slice(0, 5); // Default to first 5 questions
        console.log("Using default questions:", selectedQuestions.length);
      }

      // Create multiple evaluations - one for each evaluatee
      const evaluationPromises = assignment.evaluateeIds.map(async (evaluateeId) => {
        const evaluationData: Omit<Evaluation, "id" | "createdAt"> = {
          title: `Evaluation: ${assignment.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
          description: `Automatic evaluation assignment`,
          evaluatorId: assignment.evaluatorId,
          evaluateeId: evaluateeId,
          type: assignment.type as any,
          status: "pending",
          dueDate: new Date(assignment.dueDate),
          assignedDate: new Date(),
          questions: selectedQuestions,
          responses: [],
          createdBy: currentUser!.uid,
        };

        console.log("Creating evaluation for:", evaluateeId, evaluationData);
        return evaluationService.createEvaluation(evaluationData);
      });

      const results = await Promise.all(evaluationPromises);
      console.log("All evaluations created:", results);
      
      setSuccessMessage(`Successfully assigned ${assignment.evaluateeIds.length} evaluation${assignment.evaluateeIds.length > 1 ? 's' : ''}!`);
      
      // Refresh the data to show updated stats
      loadData();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      console.error("Error assigning evaluations:", error);
      alert("Failed to assign evaluations");
    } finally {
      setAssigning(false);
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
                         <div className="flex items-center h-16">
               <div className="flex items-center space-x-4">
                 <button
                   onClick={() => router.push("/dashboard")}
                   className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                 >
                   <ArrowLeft className="h-4 w-4" />
                   <span>Back to Dashboard</span>
                 </button>
                 <h1 className="text-2xl font-bold text-gray-900">
                   Assign Evaluations
                 </h1>
               </div>
             </div>
          </div>
        </header>

                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
           {/* Success Message */}
           {successMessage && (
             <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
               <div className="flex items-center space-x-2">
                 <CheckCircle className="h-5 w-5 text-green-600" />
                 <span className="text-green-800 font-medium">{successMessage}</span>
               </div>
             </div>
           )}
           
           {/* Smart Evaluator Assignment */}
           <div className="mb-8">
             <SmartEvaluatorAssignment
               users={users}
               templates={templates}
               assigning={assigning}
               onAssignment={handleSmartAssignment}
             />
           </div>

          

                     {/* Information Section */}
           <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
             <h3 className="text-lg font-medium text-green-800 mb-3">
               Smart Evaluation Assignment
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-green-700">
               <div className="flex items-start space-x-2">
                 <Users className="h-5 w-5 text-green-600 mt-0.5" />
                 <div>
                   <p className="font-medium">Multiple Assignments</p>
                   <p>Assign one person to evaluate multiple people</p>
                 </div>
               </div>
               <div className="flex items-start space-x-2">
                 <UserCheck className="h-5 w-5 text-green-600 mt-0.5" />
                 <div>
                   <p className="font-medium">Smart Suggestions</p>
                   <p>Get intelligent evaluatee recommendations</p>
                 </div>
               </div>
               <div className="flex items-start space-x-2">
                 <FileText className="h-5 w-5 text-green-600 mt-0.5" />
                 <div>
                   <p className="font-medium">Template Support</p>
                   <p>Use pre-built evaluation templates</p>
                 </div>
               </div>
               <div className="flex items-start space-x-2">
                 <Target className="h-5 w-5 text-green-600 mt-0.5" />
                 <div>
                   <p className="font-medium">Role-Based Logic</p>
                   <p>Follows organizational hierarchy automatically</p>
                 </div>
               </div>
             </div>
           </div>

           {/* Recent Assignments Info */}
           <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
             <h3 className="text-lg font-medium text-blue-800 mb-3">
               How It Works
             </h3>
             <div className="text-sm text-blue-700 space-y-2">
               <p><strong>Privacy Protected:</strong> When you assign evaluations, only the evaluator (person doing the evaluation) will see them on their dashboard.</p>
               <p><strong>Evaluatees are hidden:</strong> People being evaluated will NOT see evaluations about them - maintaining confidentiality.</p>
               <p><strong>Immediate visibility:</strong> Evaluators will see their assigned evaluations as soon as assignments are saved.</p>
               <p><strong>Department filtering:</strong> Use department filters to organize assignments by team or function.</p>
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
                    Pending Evaluations
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {pendingEvaluations.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Evaluations */}
          {pendingEvaluations.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Recent Assignments ({pendingEvaluations.length})
              </h3>
              <div className="space-y-3">
                {pendingEvaluations.slice(0, 5).map((evaluation) => {
                  const evaluator = users.find(u => u.uid === evaluation.evaluatorId);
                  const evaluatee = users.find(u => u.uid === evaluation.evaluateeId);
                  return (
                    <div key={evaluation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">
                            {evaluator?.displayName || evaluator?.email}
                          </span>
                          <span className="text-gray-500">→</span>
                          <span className="text-sm text-gray-600">
                            {evaluatee?.displayName || evaluatee?.email}
                          </span>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          evaluation.type === "manager_to_employee" ? "bg-blue-100 text-blue-800" :
                          evaluation.type === "employee_to_manager" ? "bg-green-100 text-green-800" :
                          evaluation.type === "peer" ? "bg-purple-100 text-purple-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {evaluation.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Due: {evaluation.dueDate.toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </div>
              {pendingEvaluations.length > 5 && (
                <p className="text-sm text-gray-500 mt-3 text-center">
                  Showing 5 of {pendingEvaluations.length} pending evaluations
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
