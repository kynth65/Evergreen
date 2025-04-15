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
  MoreVertical,
  ChevronDown,
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
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [expandedRow, setExpandedRow] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Responsive breakpoints matching LotList
  const breakpoints = {
    xs: 480, // Extra small devices
    sm: 576, // Small devices
    md: 768, // Medium devices
    lg: 992, // Large devices
    xl: 1200, // Extra large devices
    xxl: 1600, // Extra extra large devices
  };

  // Colors - matching LotList
  const colors = {
    primary: "#1da57a", // Primary green
    secondary: "#52c41a", // Secondary lighter green
    warning: "#faad14",
    success: "#52c41a",
    error: "#f5222d",
    lightBg: "#f6ffed", // Light green background
  };

  // Check if we're on a mobile device
  const isMobile = screenWidth < breakpoints.md;
  // Check if we're on a small device
  const isSmall = screenWidth < breakpoints.lg;

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

  // Update screen width on window resize
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest(`.dropdown-${openDropdown}`)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
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
      const response = await axiosClient.post("/users", formData);
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
      setOpenDropdown(null);
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
    setOpenDropdown(null);
  };

  const togglePasswordVisibility = (userId) => {
    setViewPassword((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const toggleRowExpand = (userId) => {
    setExpandedRow(expandedRow === userId ? null : userId);
  };

  const toggleDropdown = (userId, e) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === userId ? null : userId);
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

  // Render action buttons or dropdown based on screen size
  const renderActions = (user) => {
    return (
      <div className={`relative dropdown-${user.id}`}>
        <button
          className="p-1 rounded-full hover:bg-gray-200 focus:outline-none cursor-pointer"
          onClick={(e) => toggleDropdown(user.id, e)}
        >
          <MoreVertical size={20} />
        </button>
        {openDropdown === user.id && (
          <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg overflow-hidden z-10 w-32">
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center cursor-pointer"
              onClick={() => startEditing(user)}
            >
              <Edit size={16} className="mr-2" />
              <span>Edit</span>
            </button>
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600 flex items-center cursor-pointer"
              onClick={() => handleDeleteUser(user.id)}
            >
              <Trash2 size={16} className="mr-2" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render role tag with appropriate color (similar to LotList)
  const renderRoleTag = (role) => {
    let bgColor = "bg-blue-100";
    let textColor = "text-blue-800";

    switch (role) {
      case "superadmin":
        bgColor = "bg-purple-100";
        textColor = "text-purple-800";
        break;
      case "admin":
        bgColor = "bg-red-100";
        textColor = "text-red-800";
        break;
      case "agent":
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        break;
      case "intern":
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
        break;
      default:
        break;
    }

    return (
      <span
        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}
      >
        {role}
      </span>
    );
  };

  // Render expanded row details for mobile view
  const renderExpandedDetails = (user) => {
    return (
      <tr className="bg-gray-50">
        <td colSpan="4" className="px-4 py-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-gray-500">Age</div>
              <div className="text-sm">{user.age || "-"}</div>
            </div>
            {isMobile && (
              <div>
                <div className="text-xs font-medium text-gray-500">Email</div>
                <div className="text-sm overflow-x-auto">{user.email}</div>
              </div>
            )}
            <div>
              <div className="text-xs font-medium text-gray-500">Password</div>
              <div className="text-sm">••••••••</div>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  // Render skeleton loading state
  const renderSkeleton = () => {
    return Array(5)
      .fill(null)
      .map((_, index) => (
        <tr key={index} className="animate-pulse">
          <td className="px-4 py-3 whitespace-nowrap">
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
          </td>
          {!isMobile && (
            <td className="px-4 py-3 whitespace-nowrap">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </td>
          )}
          {!isSmall && (
            <>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="h-4 w-12 bg-gray-200 rounded"></div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </td>
            </>
          )}
          <td className="px-4 py-3 whitespace-nowrap">
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
          </td>
          <td className="px-4 py-3 whitespace-nowrap text-right">
            <div className="h-6 w-8 bg-gray-200 rounded ml-auto"></div>
          </td>
        </tr>
      ));
  };

  return (
    <div className="container mx-auto px-2 sm:px-4">
      <div
        className="bg-white shadow rounded-lg overflow-hidden"
        style={{ boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)" }}
      >
        {/* Header Section */}
        <div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b border-gray-200"
          style={{ backgroundColor: "white" }}
        >
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
            Account Management
          </h1>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  borderColor: colors.primary,
                  outlineColor: colors.primary,
                }}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            </div>
            <div className="flex space-x-2">
              <button
                className="flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors cursor-pointer"
                onClick={() => {
                  setIsCreating(true);
                  setIsEditing(null);
                }}
                style={{
                  backgroundColor: colors.primary,
                  color: "white",
                }}
              >
                <Plus size={18} />
                <span>Create User</span>
              </button>
              <button
                className="flex items-center justify-center space-x-1 px-3 py-2 rounded-lg border border-gray-300 transition-colors bg-white cursor-pointer"
                onClick={fetchUsers}
              >
                <RefreshCw size={18} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
            {error}
          </div>
        )}

        {/* Create User Form */}
        {isCreating && (
          <div className="bg-gray-50 p-4 m-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Create New User</h2>
              <button
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
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
                  className="w-full p-2 border rounded focus:ring-2 focus:border-transparent"
                  required
                  value={formData.first_name}
                  onChange={handleInputChange}
                  style={{
                    "--tw-ring-color": colors.primary,
                    borderColor: "rgb(209, 213, 219)",
                  }}
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
                  className="w-full p-2 border rounded focus:ring-2 focus:border-transparent"
                  value={formData.middle_initial}
                  onChange={handleInputChange}
                  style={{
                    "--tw-ring-color": colors.primary,
                    borderColor: "rgb(209, 213, 219)",
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="last_name"
                  className="w-full p-2 border rounded focus:ring-2 focus:border-transparent"
                  required
                  value={formData.last_name}
                  onChange={handleInputChange}
                  style={{
                    "--tw-ring-color": colors.primary,
                    borderColor: "rgb(209, 213, 219)",
                  }}
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
                  className="w-full p-2 border rounded focus:ring-2 focus:border-transparent"
                  value={formData.age}
                  onChange={handleInputChange}
                  style={{
                    "--tw-ring-color": colors.primary,
                    borderColor: "rgb(209, 213, 219)",
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  className="w-full p-2 border rounded focus:ring-2 focus:border-transparent"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  style={{
                    "--tw-ring-color": colors.primary,
                    borderColor: "rgb(209, 213, 219)",
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  name="role"
                  className="w-full p-2 border rounded focus:ring-2 focus:border-transparent"
                  required
                  value={formData.role}
                  onChange={handleInputChange}
                  style={{
                    "--tw-ring-color": colors.primary,
                    borderColor: "rgb(209, 213, 219)",
                  }}
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
                    className="w-full p-2 border rounded focus:ring-2 focus:border-transparent"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    style={{
                      "--tw-ring-color": colors.primary,
                      borderColor: "rgb(209, 213, 219)",
                    }}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700 cursor-pointer"
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
                  className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white cursor-pointer hover:bg-gray-50"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white cursor-pointer hover:bg-green-700"
                  style={{ backgroundColor: colors.primary }}
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users Table */}
        <div className="overflow-x-auto p-4 pt-6 sm:p-10">
          {loading ? (
            <div className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    {!isMobile && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                    )}
                    {!isSmall && (
                      <>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Age
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Password
                        </th>
                      </>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {renderSkeleton()}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    {!isMobile && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                    )}
                    {!isSmall && (
                      <>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Age
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Password
                        </th>
                      </>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-4 py-3 text-center text-gray-500"
                      >
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <React.Fragment key={user.id}>
                        <tr
                          className={`hover:bg-gray-50 ${
                            isMobile || isSmall ? "cursor-pointer" : ""
                          }`}
                          onClick={() =>
                            (isMobile || isSmall) && toggleRowExpand(user.id)
                          }
                        >
                          {isEditing === user.id ? (
                            <td colSpan="6" className="px-4 py-3">
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
                                    className="w-full p-2 border rounded focus:ring-2 focus:border-transparent"
                                    required
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    style={{
                                      "--tw-ring-color": colors.primary,
                                      borderColor: "rgb(209, 213, 219)",
                                    }}
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
                                    className="w-full p-2 border rounded focus:ring-2 focus:border-transparent"
                                    value={formData.middle_initial}
                                    onChange={handleInputChange}
                                    style={{
                                      "--tw-ring-color": colors.primary,
                                      borderColor: "rgb(209, 213, 219)",
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Last Name
                                  </label>
                                  <input
                                    type="text"
                                    name="last_name"
                                    className="w-full p-2 border rounded focus:ring-2 focus:border-transparent"
                                    required
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    style={{
                                      "--tw-ring-color": colors.primary,
                                      borderColor: "rgb(209, 213, 219)",
                                    }}
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
                                    className="w-full p-2 border rounded focus:ring-2 focus:border-transparent"
                                    value={formData.age}
                                    onChange={handleInputChange}
                                    style={{
                                      "--tw-ring-color": colors.primary,
                                      borderColor: "rgb(209, 213, 219)",
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Email
                                  </label>
                                  <input
                                    type="email"
                                    name="email"
                                    className="w-full p-2 border rounded focus:ring-2 focus:border-transparent"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    style={{
                                      "--tw-ring-color": colors.primary,
                                      borderColor: "rgb(209, 213, 219)",
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Role
                                  </label>
                                  <select
                                    name="role"
                                    className="w-full p-2 border rounded focus:ring-2 focus:border-transparent"
                                    required
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    style={{
                                      "--tw-ring-color": colors.primary,
                                      borderColor: "rgb(209, 213, 219)",
                                    }}
                                  >
                                    <option value="agent">Agent</option>
                                    <option value="admin">Admin</option>
                                    <option value="intern">Intern</option>
                                    <option value="superadmin">
                                      Super Admin
                                    </option>
                                  </select>
                                </div>
                                <div className="relative">
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    New Password (Optional)
                                  </label>
                                  <div className="relative">
                                    <input
                                      type={
                                        viewPassword[user.id]
                                          ? "text"
                                          : "password"
                                      }
                                      name="password"
                                      placeholder="Leave blank to keep current"
                                      className="w-full p-2 border rounded focus:ring-2 focus:border-transparent"
                                      value={formData.password}
                                      onChange={handleInputChange}
                                      style={{
                                        "--tw-ring-color": colors.primary,
                                        borderColor: "rgb(209, 213, 219)",
                                      }}
                                    />
                                    <button
                                      type="button"
                                      className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700 cursor-pointer"
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
                                    className="mr-2 inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md bg-white text-gray-700 cursor-pointer hover:bg-gray-50"
                                    onClick={() => setIsEditing(null)}
                                  >
                                    <X size={16} className="mr-1" />
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white cursor-pointer hover:bg-green-700"
                                    style={{ backgroundColor: colors.primary }}
                                  >
                                    <Check size={16} className="mr-1" />
                                    Save Changes
                                  </button>
                                </div>
                              </form>
                            </td>
                          ) : (
                            <>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="ml-0">
                                    <div className="text-sm font-medium text-gray-900">
                                      {user.first_name}{" "}
                                      {user.middle_initial &&
                                        `${user.middle_initial}. `}
                                      {user.last_name}
                                    </div>
                                    {(isMobile || isSmall) &&
                                      expandedRow === user.id && (
                                        <div className="text-xs text-gray-500 mt-1">
                                          {isSmall && !isMobile
                                            ? user.email
                                            : ""}
                                          {expandedRow === user.id && (
                                            <ChevronDown
                                              size={16}
                                              className="ml-1 inline"
                                            />
                                          )}
                                        </div>
                                      )}
                                  </div>
                                </div>
                              </td>
                              {!isMobile && (
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {user.email}
                                  </div>
                                </td>
                              )}
                              {!isSmall && (
                                <>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      {user.age || "-"}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                      ••••••••
                                    </div>
                                  </td>
                                </>
                              )}
                              <td className="px-4 py-3 whitespace-nowrap">
                                {renderRoleTag(user.role)}
                              </td>
                              <td
                                className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {renderActions(user)}
                              </td>
                            </>
                          )}
                        </tr>
                        {(isMobile || isSmall) &&
                          expandedRow === user.id &&
                          !isEditing &&
                          renderExpandedDetails(user)}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile information note */}
          {(isMobile || isSmall) && !loading && filteredUsers.length > 0 && (
            <div className="mt-4 text-center">
              <span className="text-xs text-gray-500">
                Tap a row to see more details. Tap the menu icon (⋮) to view
                actions.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
