"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { questionService } from "@/lib/firestore";
import { Question } from "@/types";
import { Plus, Edit, Trash2, ArrowLeft, Save, X } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminQuestionsPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    text: "",
    type: "slider" as "slider" | "paragraph",
    category: "",
    required: true,
    order: 0,
  });

  useEffect(() => {
    if (!currentUser) return;
    loadQuestions();
  }, [currentUser]);

  const loadQuestions = async () => {
    try {
      const questionsData = await questionService.getQuestions();
      setQuestions(questionsData);
    } catch (error) {
      console.error("Error loading questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingQuestion) {
        await questionService.updateQuestion(editingQuestion.id, formData);
        setEditingQuestion(null);
      } else {
        await questionService.createQuestion({
          ...formData,
          createdBy: currentUser!.uid,
        });
      }

      setFormData({
        text: "",
        type: "slider",
        category: "",
        required: true,
        order: 0,
      });
      setShowForm(false);
      loadQuestions();
    } catch (error) {
      console.error("Error saving question:", error);
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      text: question.text,
      type: question.type,
      category: question.category,
      required: question.required,
      order: question.order,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      try {
        await questionService.deleteQuestion(id);
        loadQuestions();
      } catch (error) {
        console.error("Error deleting question:", error);
      }
    }
  };

  const handleCancel = () => {
    setEditingQuestion(null);
    setFormData({
      text: "",
      type: "slider",
      category: "",
      required: true,
      order: 0,
    });
    setShowForm(false);
  };

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
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </button>
              <h1 className="text-3xl font-bold text-foreground">
                Manage Questions
              </h1>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:filter hover:brightness-90 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Question</span>
            </button>
          </div>

          {/* Question Form */}
          {showForm && (
            <div className="mb-8 bg-card rounded-lg border border-border p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                {editingQuestion ? "Edit Question" : "Add New Question"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="text"
                    className="block text-sm font-medium text-foreground/80 mb-2"
                  >
                    Question Text
                  </label>
                  <textarea
                    id="text"
                    value={formData.text}
                    onChange={(e) =>
                      setFormData({ ...formData, text: e.target.value })
                    }
                    required
                    rows={3}
                    className="block w-full px-3 py-2 border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground bg-card transition-colors"
                    placeholder="Enter your question here..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="type"
                      className="block text-sm font-medium text-foreground/80 mb-2"
                    >
                      Question Type
                    </label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as "slider" | "paragraph",
                        })
                      }
                      className="block w-full px-3 py-2 border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground bg-card transition-colors"
                    >
                      <option value="slider">Slider (1-10)</option>
                      <option value="paragraph">Paragraph</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-foreground/80 mb-2"
                    >
                      Category
                    </label>
                    <input
                      type="text"
                      id="category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="block w-full px-3 py-2 border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground bg-card transition-colors"
                      placeholder="e.g., Leadership, Communication"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="order"
                      className="block text-sm font-medium text-foreground/80 mb-2"
                    >
                      Display Order
                    </label>
                    <input
                      type="number"
                      id="order"
                      value={formData.order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          order: parseInt(e.target.value),
                        })
                      }
                      min="0"
                      className="block w-full px-3 py-2 border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground bg-card transition-colors"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="required"
                      checked={formData.required}
                      onChange={(e) =>
                        setFormData({ ...formData, required: e.target.checked })
                      }
                      className="h-4 w-4 text-primary focus:ring-ring border-input rounded bg-card transition-colors"
                    />
                    <label
                      htmlFor="required"
                      className="ml-2 block text-sm text-foreground"
                    >
                      Required question
                    </label>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:filter hover:brightness-90 transition-colors cursor-pointer"
                  >
                    <Save className="h-4 w-4 inline mr-2" />
                    {editingQuestion ? "Update Question" : "Save Question"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Questions List */}
          <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-medium text-foreground">
                Evaluation Questions
              </h3>
            </div>
            <div className="divide-y divide-border">
              {questions.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  No questions created yet. Add your first question to get
                  started.
                </div>
              ) : (
                questions.map((question) => (
                  <div
                    key={question.id}
                    className="p-6 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-medium text-foreground">
                            {question.text}
                          </h4>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              question.type === "slider"
                                ? "bg-primary/10 text-primary"
                                : "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                            }`}
                          >
                            {question.type}
                          </span>
                          {question.required && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                              Required
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>
                            Category: {question.category || "Uncategorized"}
                          </p>
                          <p>Order: {question.order}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(question)}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(question.id)}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
