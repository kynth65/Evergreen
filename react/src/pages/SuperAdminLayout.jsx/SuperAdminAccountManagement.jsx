import React, { useState, useEffect } from "react";
import axiosClient from "../../axios.client";
import {
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Plus,
  Check,
  X,
  Search,
  RefreshCw,
} from "lucide-react";

export default function SuperAdminAccountManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [viewPassword, setViewPassword] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // New user form
  const [formData, setFormData] = useState({
    first_name: "",
    middle_initial: "",
    last_name: "",
    age: "",
    email: "",
    role: "agent",
    password: "",
  });

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Make sure this endpoint matches your routes
      const response = await axiosClient.get("/users");
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError(
        "Failed to fetch users: " + (err.response?.data?.message || err.message)
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      // Make sure this endpoint matches your routes
      const response = await axiosClient.post("/users", formData);
      // Add console.log to see the response
      console.log("Create user response:", response.data);

      setUsers((prev) => [response.data.user, ...prev]);
      setFormData({
        first_name: "",
        middle_initial: "",
        last_name: "",
        age: "",
        email: "",
        role: "agent",
        password: "",
      });
      setIsCreating(false);
    } catch (err) {
      setError(
        "Failed to create user: " + (err.response?.data?.message || err.message)
      );
      console.error(err);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosClient.put(`/users/${isEditing}`, formData);
      setUsers((prev) =>
        prev.map((user) => (user.id === isEditing ? response.data.user : user))
      );
      setIsEditing(null);
    } catch (err) {
      setError("Failed to update user");
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axiosClient.delete(`/users/${userId}`);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (err) {
      setError("Failed to delete user");
      console.error(err);
    }
  };

  const startEditing = (user) => {
    setFormData({
      first_name: user.first_name,
      middle_initial: user.middle_initial || "",
      last_name: user.last_name,
      age: user.age || "",
      email: user.email,
      role: user.role,
      password: "", // Don't include the password in the form
    });
    setIsEditing(user.id);
  };

  const togglePasswordVisibility = (userId) => {
    setViewPassword((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.first_name.toLowerCase().includes(searchLower) ||
      user.last_name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="container mx-auto px-4">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Account Management
          </h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            </div>
            <button
              className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              onClick={() => {
                setIsCreating(true);
                setIsEditing(null);
              }}
            >
              <Plus size={18} />
              <span>Create User</span>
            </button>
            <button
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
              onClick={fetchUsers}
            >
              <RefreshCw size={18} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {isCreating && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Create New User</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsCreating(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={handleCreateUser}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  name="first_name"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                  value={formData.first_name}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Middle Initial
                </label>
                <input
                  type="text"
                  name="middle_initial"
                  maxLength="1"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={formData.middle_initial}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="last_name"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                  value={formData.last_name}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  min="18"
                  max="100"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={formData.age}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  name="role"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="agent">Agent</option>
                  <option value="admin">Admin</option>
                  <option value="intern">Intern</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={viewPassword.new ? "text" : "password"}
                    name="password"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700"
                    onClick={() => togglePasswordVisibility("new")}
                  >
                    {viewPassword.new ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
              <div className="col-span-full flex justify-end mt-4">
                <button
                  type="button"
                  className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Password
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      {isEditing === user.id ? (
                        <td colSpan="6" className="px-6 py-4">
                          <form
                            onSubmit={handleUpdateUser}
                            className="grid grid-cols-1 md:grid-cols-3 gap-4"
                          >
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                First Name
                              </label>
                              <input
                                type="text"
                                name="first_name"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                required
                                value={formData.first_name}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Middle Initial
                              </label>
                              <input
                                type="text"
                                name="middle_initial"
                                maxLength="1"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                value={formData.middle_initial}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Last Name
                              </label>
                              <input
                                type="text"
                                name="last_name"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                required
                                value={formData.last_name}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Age
                              </label>
                              <input
                                type="number"
                                name="age"
                                min="18"
                                max="100"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                value={formData.age}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Email
                              </label>
                              <input
                                type="email"
                                name="email"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Role
                              </label>
                              <select
                                name="role"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                required
                                value={formData.role}
                                onChange={handleInputChange}
                              >
                                <option value="agent">Agent</option>
                                <option value="admin">Admin</option>
                                <option value="intern">Intern</option>
                                <option value="superadmin">Super Admin</option>
                              </select>
                            </div>
                            <div className="relative">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                New Password (Optional)
                              </label>
                              <div className="relative">
                                <input
                                  type={
                                    viewPassword[user.id] ? "text" : "password"
                                  }
                                  name="password"
                                  placeholder="Leave blank to keep current"
                                  className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                  value={formData.password}
                                  onChange={handleInputChange}
                                />
                                <button
                                  type="button"
                                  className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700"
                                  onClick={() =>
                                    togglePasswordVisibility(user.id)
                                  }
                                >
                                  {viewPassword[user.id] ? (
                                    <EyeOff size={18} />
                                  ) : (
                                    <Eye size={18} />
                                  )}
                                </button>
                              </div>
                            </div>
                            <div className="col-span-full flex justify-end mt-2">
                              <button
                                type="button"
                                className="mr-2 inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50"
                                onClick={() => setIsEditing(null)}
                              >
                                <X size={16} className="mr-1" />
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700"
                              >
                                <Check size={16} className="mr-1" />
                                Save Changes
                              </button>
                            </div>
                          </form>
                        </td>
                      ) : (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="ml-0">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.first_name}{" "}
                                  {user.middle_initial &&
                                    `${user.middle_initial}. `}
                                  {user.last_name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.age || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                            ${
                                                              user.role ===
                                                              "superadmin"
                                                                ? "bg-purple-100 text-purple-800"
                                                                : user.role ===
                                                                  "admin"
                                                                ? "bg-red-100 text-red-800"
                                                                : user.role ===
                                                                  "agent"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-blue-100 text-blue-800"
                                                            }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              ••••••••
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                className="text-green-600 hover:text-green-900"
                                onClick={() => startEditing(user)}
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
