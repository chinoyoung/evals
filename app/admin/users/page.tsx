"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { userService } from "@/lib/firestore";
import { User } from "@/types";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Users,
  UserCheck,
  Shield,
  Mail,
  Calendar,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminUsersPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    displayName: "",
    role: "employee" as "admin" | "employee" | "manager",
    department: "Tech" as "Tech" | "Content" | "Admin" | "Sales",
  });

  useEffect(() => {
    if (!currentUser) return;
    loadUsers();
  }, [currentUser]);

  const loadUsers = async () => {
    try {
      const usersData = await userService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({
      displayName: user.displayName || "",
      role: user.role,
      department: user.department || "",
    });
  };

  const handleSave = async () => {
    if (!editingUser) return;

    try {
      await userService.updateUser(editingUser.uid, editForm);
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user");
    }
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditForm({
      displayName: "",
      role: "employee",
      department: "Tech",
    });
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
        return "bg-destructive/10 text-destructive";
      case "manager":
        return "bg-primary/10 text-primary";
      case "employee":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case "Tech":
        return "bg-primary/10 text-primary";
      case "Content":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200";
      case "Admin":
        return "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200";
      case "Sales":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStats = () => {
    const total = users.length;
    const admins = users.filter((u) => u.role === "admin").length;
    const managers = users.filter((u) => u.role === "manager").length;
    const employees = users.filter((u) => u.role === "employee").length;
    const tech = users.filter((u) => u.department === "Tech").length;
    const content = users.filter((u) => u.department === "Content").length;
    const adminDept = users.filter((u) => u.department === "Admin").length;
    const sales = users.filter((u) => u.department === "Sales").length;

    return {
      total,
      admins,
      managers,
      employees,
      tech,
      content,
      adminDept,
      sales,
    };
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
                  Manage Users
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-primary" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Users
                  </p>
                  <p className="text-2xl font-semibold text-foreground">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-destructive" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Admins
                  </p>
                  <p className="text-2xl font-semibold text-foreground">
                    {stats.admins}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-primary" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Managers
                  </p>
                  <p className="text-2xl font-semibold text-foreground">
                    {stats.managers}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Employees
                  </p>
                  <p className="text-2xl font-semibold text-foreground">
                    {stats.employees}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Department Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">T</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Tech
                  </p>
                  <p className="text-2xl font-semibold text-foreground">
                    {stats.tech}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 font-bold text-sm">
                    C
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Content
                  </p>
                  <p className="text-2xl font-semibold text-foreground">
                    {stats.content}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">
                    A
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Admin
                  </p>
                  <p className="text-2xl font-semibold text-foreground">
                    {stats.adminDept}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 dark:text-orange-400 font-bold text-sm">
                    S
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Sales
                  </p>
                  <p className="text-2xl font-semibold text-foreground">
                    {stats.sales}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Department Filter */}
          <div className="mb-6 bg-card rounded-lg border border-border p-4 shadow-sm">
            <h3 className="text-lg font-medium text-foreground mb-3">
              Filter by Department
            </h3>
            <div className="flex flex-wrap gap-2">
              {["All", "Tech", "Content", "Admin", "Sales"].map((dept) => (
                <button
                  key={dept}
                  onClick={() =>
                    setDepartmentFilter(dept === "All" ? null : dept)
                  }
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    (dept === "All" && !departmentFilter) ||
                    departmentFilter === dept
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-muted border-border text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Users List */}
          <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-medium text-foreground">
                User Management
              </h3>
            </div>
            <div className="divide-y divide-border">
              {users
                .filter(
                  (user) =>
                    !departmentFilter || user.department === departmentFilter
                )
                .map((user) => (
                  <div
                    key={user.uid}
                    className="p-6 hover:bg-muted/50 transition-colors"
                  >
                    {editingUser?.uid === user.uid ? (
                      // Edit Form
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                              Display Name
                            </label>
                            <input
                              type="text"
                              value={editForm.displayName}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  displayName: e.target.value,
                                })
                              }
                              className="block w-full px-3 py-2 border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground bg-card"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                              Role
                            </label>
                            <select
                              value={editForm.role}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  role: e.target.value as
                                    | "admin"
                                    | "manager"
                                    | "employee",
                                })
                              }
                              className="block w-full px-3 py-2 border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground bg-card transition-colors"
                            >
                              <option value="employee">Employee</option>
                              <option value="manager">Manager</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                              Department
                            </label>
                            <select
                              value={editForm.department}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  department: e.target.value as
                                    | "Tech"
                                    | "Content"
                                    | "Admin"
                                    | "Sales",
                                })
                              }
                              className="block w-full px-3 py-2 border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground bg-card transition-colors"
                            >
                              <option value="Tech">Tech</option>
                              <option value="Content">Content</option>
                              <option value="Admin">Admin</option>
                              <option value="Sales">Sales</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={cancelEdit}
                            className="px-4 py-2 border border-border text-muted-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                          >
                            <X className="h-4 w-4 inline mr-2" />
                            Cancel
                          </button>
                          <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:filter hover:brightness-90 transition-colors cursor-pointer"
                          >
                            <Save className="h-4 w-4 inline mr-2" />
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Display Mode
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-medium text-foreground">
                              {user.displayName || "No Name Set"}
                            </h4>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                                user.role
                              )}`}
                            >
                              {getRoleDisplayName(user.role)}
                            </span>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDepartmentColor(
                                user.department
                              )}`}
                            >
                              {user.department}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-muted-foreground/60" />
                              <span>{user.email}</span>
                            </div>
                            {user.department && (
                              <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4 text-muted-foreground/60" />
                                <span>{user.department}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-muted-foreground/60" />
                              <span>
                                Joined: {user.createdAt.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                            title="Edit User"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              router.push(
                                `/admin/assignments?evaluator=${user.uid}`
                              )
                            }
                            className="p-2 text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer"
                            title="Assign Evaluations To This Person"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
