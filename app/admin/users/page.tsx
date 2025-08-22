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
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "employee":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case "Tech":
        return "bg-blue-100 text-blue-800";
      case "Content":
        return "bg-green-100 text-green-800";
      case "Admin":
        return "bg-purple-100 text-purple-800";
      case "Sales":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
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

    return { total, admins, managers, employees, tech, content, adminDept, sales };
  };

  const stats = getStats();

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
                  className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  Manage Users
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                     {/* Stats Cards */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
             <div className="bg-white rounded-lg border border-gray-200 p-4">
               <div className="flex items-center">
                 <Users className="h-8 w-8 text-blue-600" />
                 <div className="ml-3">
                   <p className="text-sm font-medium text-gray-500">
                     Total Users
                   </p>
                   <p className="text-2xl font-semibold text-gray-900">
                     {stats.total}
                   </p>
                 </div>
               </div>
             </div>
             <div className="bg-white rounded-lg border border-gray-200 p-4">
               <div className="flex items-center">
                 <Shield className="h-8 w-8 text-red-600" />
                 <div className="ml-3">
                   <p className="text-sm font-medium text-gray-500">Admins</p>
                   <p className="text-2xl font-semibold text-gray-900">
                     {stats.admins}
                   </p>
                 </div>
               </div>
             </div>
             <div className="bg-white rounded-lg border border-gray-200 p-4">
               <div className="flex items-center">
                 <UserCheck className="h-8 w-8 text-blue-600" />
                 <div className="ml-3">
                   <p className="text-sm font-medium text-gray-500">Managers</p>
                   <p className="text-2xl font-semibold text-gray-900">
                     {stats.managers}
                   </p>
                 </div>
               </div>
             </div>
             <div className="bg-white rounded-lg border border-gray-200 p-4">
               <div className="flex items-center">
                 <Users className="h-8 w-8 text-green-600" />
                 <div className="ml-3">
                   <p className="text-sm font-medium text-gray-500">Employees</p>
                   <p className="text-2xl font-semibold text-gray-900">
                     {stats.employees}
                   </p>
                 </div>
               </div>
             </div>
           </div>

           {/* Department Stats */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
             <div className="bg-white rounded-lg border border-gray-200 p-4">
               <div className="flex items-center">
                 <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                   <span className="text-blue-600 font-bold text-sm">T</span>
                 </div>
                 <div className="ml-3">
                   <p className="text-sm font-medium text-gray-500">Tech</p>
                   <p className="text-2xl font-semibold text-gray-900">
                     {stats.tech}
                   </p>
                 </div>
               </div>
             </div>
             <div className="bg-white rounded-lg border border-gray-200 p-4">
               <div className="flex items-center">
                 <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                   <span className="text-green-600 font-bold text-sm">C</span>
                 </div>
                 <div className="ml-3">
                   <p className="text-sm font-medium text-gray-500">Content</p>
                   <p className="text-2xl font-semibold text-gray-900">
                     {stats.content}
                   </p>
                 </div>
               </div>
             </div>
             <div className="bg-white rounded-lg border border-gray-200 p-4">
               <div className="flex items-center">
                 <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                   <span className="text-purple-600 font-bold text-sm">A</span>
                 </div>
                 <div className="ml-3">
                   <p className="text-sm font-medium text-gray-500">Admin</p>
                   <p className="text-2xl font-semibold text-gray-900">
                     {stats.adminDept}
                   </p>
                 </div>
               </div>
             </div>
             <div className="bg-white rounded-lg border border-gray-200 p-4">
               <div className="flex items-center">
                 <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
                   <span className="text-orange-600 font-bold text-sm">S</span>
                 </div>
                 <div className="ml-3">
                   <p className="text-sm font-medium text-gray-500">Sales</p>
                   <p className="text-2xl font-semibold text-gray-900">
                     {stats.sales}
                   </p>
                 </div>
               </div>
             </div>
           </div>

                     {/* Department Filter */}
           <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
             <h3 className="text-lg font-medium text-gray-900 mb-3">
               Filter by Department
             </h3>
             <div className="flex flex-wrap gap-2">
               {['All', 'Tech', 'Content', 'Admin', 'Sales'].map((dept) => (
                 <button
                   key={dept}
                   onClick={() => setDepartmentFilter(dept === 'All' ? null : dept)}
                   className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
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

           {/* Users List */}
           <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-200">
               <h3 className="text-lg font-medium text-gray-900">
                 User Management
               </h3>
             </div>
                         <div className="divide-y divide-gray-200">
               {users
                 .filter(user => !departmentFilter || user.department === departmentFilter)
                 .map((user) => (
                <div
                  key={user.uid}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  {editingUser?.uid === user.uid ? (
                    // Edit Form
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 transition-colors"
                          >
                            <option value="employee">Employee</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                                                 <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                             Department
                           </label>
                           <select
                             value={editForm.department}
                             onChange={(e) =>
                               setEditForm({
                                 ...editForm,
                                 department: e.target.value as "Tech" | "Content" | "Admin" | "Sales",
                               })
                             }
                             className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
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
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <X className="h-4 w-4 inline mr-2" />
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
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
                           <h4 className="text-lg font-medium text-gray-900">
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span>{user.email}</span>
                          </div>
                          {user.department && (
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span>{user.department}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>
                              Joined: {user.createdAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Edit User"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/assignments?evaluator=${user.uid}`)}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors cursor-pointer"
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
