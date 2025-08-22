"use client";

import { useState, useEffect } from "react";
import { User, EvaluationTemplate } from "@/types";
import { 
  Users, 
  UserCheck, 
  Target, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Calendar
} from "lucide-react";

interface SmartEvaluatorAssignmentProps {
  users: User[];
  templates: EvaluationTemplate[];
  assigning?: boolean;
  onAssignment: (assignment: {
    evaluatorId: string;
    evaluateeIds: string[];
    type: string;
    templateId?: string;
    dueDate: string;
  }) => void;
}

export default function SmartEvaluatorAssignment({
  users,
  templates,
  assigning = false,
  onAssignment,
}: SmartEvaluatorAssignmentProps) {
  const [selectedEvaluator, setSelectedEvaluator] = useState<string>("");
  const [selectedEvaluatees, setSelectedEvaluatees] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [evaluationType, setEvaluationType] = useState<string>("");
  const [suggestedEvaluatees, setSuggestedEvaluatees] = useState<User[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [evaluateeDepartmentFilter, setEvaluateeDepartmentFilter] = useState<string | null>(null);

  // Auto-detect evaluation type when evaluator and evaluatees change
  useEffect(() => {
    if (selectedEvaluator && selectedEvaluatees.length > 0) {
      const evaluator = users.find(u => u.uid === selectedEvaluator);
      const firstEvaluatee = users.find(u => u.uid === selectedEvaluatees[0]);
      
      if (evaluator && firstEvaluatee) {
        let type = "";
        
        if (evaluator.uid === firstEvaluatee.uid) {
          type = "self";
        } else if (evaluator.role === "manager" && firstEvaluatee.role === "employee") {
          type = "manager_to_employee";
        } else if (evaluator.role === "employee" && firstEvaluatee.role === "manager") {
          type = "employee_to_manager";
        } else if (evaluator.role === firstEvaluatee.role) {
          type = "peer";
        } else if (evaluator.role === "admin") {
          type = "admin_review";
        } else if (firstEvaluatee.role === "admin") {
          type = "admin_feedback";
        } else {
          type = "cross_role";
        }
        
        setEvaluationType(type);
      }
    }
  }, [selectedEvaluator, selectedEvaluatees, users]);

  // Check for URL parameters to pre-select evaluator
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const evaluatorId = urlParams.get('evaluator');
    if (evaluatorId) {
      setSelectedEvaluator(evaluatorId);
    }
  }, []);

  // Suggest evaluatees based on selected evaluator
  useEffect(() => {
    if (selectedEvaluator) {
      const evaluator = users.find(u => u.uid === selectedEvaluator);
      if (evaluator) {
        let suggestions: User[] = [];
        
        // Filter out the evaluator themselves
        const otherUsers = users.filter(u => u.uid !== evaluator.uid);
        
        // Suggest based on role hierarchy
        switch (evaluator.role) {
          case "employee":
            // Suggest peers and managers for upward feedback
            suggestions = [
              ...otherUsers.filter(u => u.role === "employee"),
              ...otherUsers.filter(u => u.role === "manager"),
              ...otherUsers.filter(u => u.role === "admin")
            ];
            break;
          case "manager":
            // Suggest employees first, then peers
            suggestions = [
              ...otherUsers.filter(u => u.role === "employee"),
              ...otherUsers.filter(u => u.role === "manager"),
              ...otherUsers.filter(u => u.role === "admin")
            ];
            break;
          case "admin":
            // Suggest all other users
            suggestions = otherUsers;
            break;
          default:
            suggestions = otherUsers;
        }
        
        setSuggestedEvaluatees(suggestions);
      }
    }
  }, [selectedEvaluator, users]);

  const getEvaluationTypeDisplay = (type: string) => {
    switch (type) {
      case "manager_to_employee":
        return { label: "Manager to Employee", color: "bg-blue-100 text-blue-800", icon: UserCheck };
      case "employee_to_manager":
        return { label: "Employee to Manager", color: "bg-green-100 text-green-800", icon: Target };
      case "peer":
        return { label: "Peer to Peer", color: "bg-purple-100 text-purple-800", icon: Users };
      case "admin_review":
        return { label: "Admin Review", color: "bg-red-100 text-red-800", icon: UserCheck };
      case "admin_feedback":
        return { label: "Admin Feedback", color: "bg-orange-100 text-orange-800", icon: Target };
      case "cross_role":
        return { label: "Cross-Role Evaluation", color: "bg-indigo-100 text-indigo-800", icon: Users };
      case "self":
        return { label: "Self Evaluation", color: "bg-gray-100 text-gray-800", icon: Target };
      default:
        return { label: "Unknown", color: "bg-gray-100 text-gray-800", icon: Users };
    }
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "employee":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEvaluator || selectedEvaluatees.length === 0 || !dueDate) {
      alert("Please fill in all required fields");
      return;
    }

    if (!evaluationType) {
      alert("Please wait for evaluation type to be detected or select evaluatees first");
      return;
    }

    console.log("Submitting assignment:", {
      evaluatorId: selectedEvaluator,
      evaluateeIds: selectedEvaluatees,
      type: evaluationType,
      templateId: selectedTemplate,
      dueDate,
    });

    onAssignment({
      evaluatorId: selectedEvaluator,
      evaluateeIds: selectedEvaluatees,
      type: evaluationType,
      templateId: selectedTemplate,
      dueDate,
    });

    // Reset form
    setSelectedEvaluatees([]);
    setSelectedEvaluator("");
    setSelectedTemplate("");
    setDueDate("");
    setEvaluationType("");
  };

  const typeInfo = getEvaluationTypeDisplay(evaluationType);
  const TypeIcon = typeInfo.icon;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Smart Evaluator Assignment
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Select Evaluator */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Step 1: Select who will be doing the evaluations
          </label>
          
          {/* Department Filter */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Filter by Department (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {['All', 'Tech', 'Content', 'Admin', 'Sales'].map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setDepartmentFilter(dept === 'All' ? null : dept)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    (dept === 'All' && !departmentFilter) || departmentFilter === dept
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>
          
          <select
            value={selectedEvaluator}
            onChange={(e) => setSelectedEvaluator(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            required
          >
            <option value="">Choose an employee to assign evaluations to...</option>
            {users
              .filter(user => !departmentFilter || user.department === departmentFilter)
              .map((user) => (
                <option key={user.uid} value={user.uid}>
                  {user.displayName || user.email} ({getRoleDisplayName(user.role)}) - {user.department}
                </option>
              ))}
          </select>
        </div>

        {/* Step 2: Select People to Evaluate */}
        {selectedEvaluator && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Step 2: Select people to be evaluated (multiple selection)
            </label>
            
            {/* Department Filter for Evaluatees */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Filter by Department (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {['All', 'Tech', 'Content', 'Admin', 'Sales'].map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setEvaluateeDepartmentFilter(dept === 'All' ? null : dept)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      (dept === 'All' && !evaluateeDepartmentFilter) || evaluateeDepartmentFilter === dept
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Evaluation Type Display */}
            {evaluationType ? (
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${typeInfo.color} mb-3`}>
                <TypeIcon className="h-4 w-4 mr-2" />
                {typeInfo.label}
              </div>
            ) : (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600 mb-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Detecting evaluation type...
              </div>
            )}

            {/* Smart Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {suggestedEvaluatees
                .filter(user => !evaluateeDepartmentFilter || user.department === evaluateeDepartmentFilter)
                .map((user) => (
                <button
                  key={user.uid}
                  type="button"
                  onClick={() => {
                    if (selectedEvaluatees.includes(user.uid)) {
                      setSelectedEvaluatees(selectedEvaluatees.filter(id => id !== user.uid));
                    } else {
                      setSelectedEvaluatees([...selectedEvaluatees, user.uid]);
                    }
                  }}
                  className={`p-3 border rounded-lg text-left transition-all ${
                    selectedEvaluatees.includes(user.uid)
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      {user.displayName || user.email}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {getRoleDisplayName(user.role)}
                    </span>
                  </div>
                  {user.department && (
                    <p className="text-sm text-gray-500">{user.department}</p>
                  )}
                  <div className="mt-2 flex items-center text-xs text-gray-400">
                    {selectedEvaluatees.includes(user.uid) ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1 text-blue-600" />
                        Selected for evaluation
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Click to select
                      </>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Manual Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Or select manually:
              </label>
              <select
                multiple
                value={selectedEvaluatees}
                onChange={(e) => {
                  const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                  setSelectedEvaluatees(selectedOptions);
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 min-h-[120px]"
              >
                {users
                  .filter(u => u.uid !== selectedEvaluator)
                  .filter(user => !evaluateeDepartmentFilter || user.department === evaluateeDepartmentFilter)
                  .map((user) => (
                    <option key={user.uid} value={user.uid}>
                      {user.displayName || user.email} ({getRoleDisplayName(user.role)}) - {user.department}
                    </option>
                  ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Hold Ctrl/Cmd to select multiple people
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Template Selection */}
        {selectedEvaluator && selectedEvaluatees.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Step 3: Choose evaluation template (optional)
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="">No template (custom questions)</option>
              {templates
                .filter(t => t.type === evaluationType || t.type === "peer")
                .map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.questions.length} questions)
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Step 4: Due Date */}
        {selectedEvaluator && selectedEvaluatees.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Step 4: Set due date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              required
            />
          </div>
        )}

        {/* Submit Button */}
        {selectedEvaluator && selectedEvaluatees.length > 0 && dueDate && (
          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={assigning}
              className={`w-full px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center space-x-2 ${
                assigning 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {assigning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Assign {selectedEvaluatees.length} Evaluation{selectedEvaluatees.length > 1 ? 's' : ''}</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>

      {/* Help Information */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          How it works
        </h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• <strong>Manager to Employee:</strong> Managers evaluate their team members</p>
          <p>• <strong>Employee to Manager:</strong> Team members provide upward feedback</p>
          <p>• <strong>Peer to Peer:</strong> Colleagues at the same level evaluate each other</p>
          <p>• <strong>Admin Review:</strong> Administrators conduct comprehensive reviews</p>
          <p>• <strong>Multiple Assignments:</strong> One person can be assigned to evaluate multiple people</p>
        </div>
      </div>
    </div>
  );
}
