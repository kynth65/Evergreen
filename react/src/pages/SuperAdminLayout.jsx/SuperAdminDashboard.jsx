import React, { useState, useEffect } from "react";
import {
  BarChart2,
  Users,
  UserCheck,
  UserX,
  PieChart,
  Activity,
  Server,
  Shield,
  AlertTriangle,
  Calendar,
  Check,
  Clock,
  Settings,
  Database,
} from "lucide-react";
import axiosClient from "../../axios.client";

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    usersByRole: {
      admin: 0,
      agent: 0,
      intern: 0,
      customer: 0,
    },
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch users data
      const usersResponse = await axiosClient.get("/users");

      // Process users data
      const users = usersResponse.data || [];

      // Calculate statistics
      const activeUsers = users.filter((user) => user.status === "active");
      const inactiveUsers = users.filter((user) => user.status !== "active");

      // Group users by role
      const usersByRole = users.reduce((acc, user) => {
        const role = user.role || "unknown";
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {});

      // Get most recent users
      const sortedUsers = [...users]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      // Mock system alerts (would normally come from a separate API)
      const mockAlerts = [
        {
          id: 1,
          type: "warning",
          message: "Database storage at 78% capacity",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          type: "info",
          message: "System backup completed successfully",
          timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 3,
          type: "error",
          message: "Failed login attempts from IP 192.168.1.45",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      // Update state with fetched data
      setStats({
        totalUsers: users.length || 0,
        activeUsers: activeUsers.length || 0,
        inactiveUsers: inactiveUsers.length || 0,
        usersByRole: {
          admin: usersByRole.admin || 0,
          agent: usersByRole.agent || 0,
          intern: usersByRole.intern || 0,
          customer: usersByRole.customer || 0,
        },
      });

      setRecentUsers(sortedUsers);
      setSystemAlerts(mockAlerts);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again later.");

      // Set mock data for development/preview
      setMockData();
      setLoading(false);
    }
  };

  // Fallback to mock data if API fails
  const setMockData = () => {
    setStats({
      totalUsers: 86,
      activeUsers: 72,
      inactiveUsers: 14,
      usersByRole: {
        admin: 8,
        agent: 42,
        intern: 15,
        customer: 21,
      },
    });

    setRecentUsers([
      {
        id: 1,
        name: "Jane Cooper",
        email: "jane.cooper@example.com",
        role: "agent",
        status: "active",
        created_at: "2025-02-20T08:30:00.000Z",
      },
      {
        id: 2,
        name: "Robert Garcia",
        email: "robert.garcia@example.com",
        role: "admin",
        status: "active",
        created_at: "2025-02-19T14:45:00.000Z",
      },
      {
        id: 3,
        name: "Michael Smith",
        email: "michael.smith@example.com",
        role: "intern",
        status: "inactive",
        created_at: "2025-02-18T11:20:00.000Z",
      },
      {
        id: 4,
        name: "Olivia Johnson",
        email: "olivia.johnson@example.com",
        role: "customer",
        status: "active",
        created_at: "2025-02-18T09:15:00.000Z",
      },
      {
        id: 5,
        name: "William Chen",
        email: "william.chen@example.com",
        role: "agent",
        status: "active",
        created_at: "2025-02-17T16:05:00.000Z",
      },
    ]);
  };
  // Utility function to safely capitalize a string
  const safeCapitalize = (str) => {
    if (typeof str !== "string" || !str) {
      return "Unknown";
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "N/A";

    try {
      const now = new Date();
      const date = new Date(timestamp);
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

      if (diffInHours < 1) return "Just now";
      if (diffInHours === 1) return "1 hour ago";
      if (diffInHours < 24) return `${diffInHours} hours ago`;
      if (diffInHours < 48) return "Yesterday";
      return formatDate(timestamp);
    } catch (error) {
      console.error("Time ago calculation error:", error);
      return "Unknown time";
    }
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return "bg-gray-100 text-gray-800";

    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleBadgeIcon = (role) => {
    if (!role) return <Users className="h-3 w-3 mr-1" />;

    switch (role.toLowerCase()) {
      case "admin":
        return <Shield className="h-3 w-3 mr-1" />;
      case "agent":
        return <UserCheck className="h-3 w-3 mr-1" />;
      case "intern":
        return <Clock className="h-3 w-3 mr-1" />;
      case "customer":
        return <Users className="h-3 w-3 mr-1" />;
      default:
        return <Users className="h-3 w-3 mr-1" />;
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "info":
        return <Check className="h-4 w-4 text-green-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Super Admin Dashboard
      </h1>

      {/* Primary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Users */}
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-800">
                {stats.totalUsers}
              </h2>
              <p className="mt-1 text-sm text-green-600">+3 this week</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-800">
                {stats.activeUsers}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {Math.round((stats.activeUsers / stats.totalUsers) * 100)}% of
                total
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Inactive Users */}
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Inactive Users
              </p>
              <h2 className="mt-2 text-3xl font-bold text-gray-800">
                {stats.inactiveUsers}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {Math.round((stats.inactiveUsers / stats.totalUsers) * 100)}% of
                total
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <UserX className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">System Status</p>
              <h2 className="mt-2 text-lg font-bold text-green-600">
                Operational
              </h2>
              <p className="mt-1 text-sm text-gray-600">All services running</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Server className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Users By Role Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* User Distribution */}
        <div className="bg-white rounded-lg shadow-md p-5">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            User Distribution
          </h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[160px] p-4 border rounded-lg">
              <div className="flex items-center mb-2">
                <Shield className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  Admins
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {stats.usersByRole.admin}
              </p>
              <p className="text-sm text-gray-500">
                {Math.round((stats.usersByRole.admin / stats.totalUsers) * 100)}
                % of users
              </p>
            </div>

            <div className="flex-1 min-w-[160px] p-4 border rounded-lg">
              <div className="flex items-center mb-2">
                <UserCheck className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  Agents
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {stats.usersByRole.agent}
              </p>
              <p className="text-sm text-gray-500">
                {Math.round((stats.usersByRole.agent / stats.totalUsers) * 100)}
                % of users
              </p>
            </div>

            <div className="flex-1 min-w-[160px] p-4 border rounded-lg">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  Interns
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {stats.usersByRole.intern}
              </p>
              <p className="text-sm text-gray-500">
                {Math.round(
                  (stats.usersByRole.intern / stats.totalUsers) * 100
                )}
                % of users
              </p>
            </div>

            <div className="flex-1 min-w-[160px] p-4 border rounded-lg">
              <div className="flex items-center mb-2">
                <Users className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  Customers
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {stats.usersByRole.customer}
              </p>
              <p className="text-sm text-gray-500">
                {Math.round(
                  (stats.usersByRole.customer / stats.totalUsers) * 100
                )}
                % of users
              </p>
            </div>
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white rounded-lg shadow-md p-5">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            System Alerts
          </h2>
          <div className="space-y-3">
            {systemAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start p-3 border rounded-lg"
              >
                <div className="mr-3 mt-1">{getAlertIcon(alert.type)}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {getTimeAgo(alert.timestamp)}
                  </p>
                </div>
                <button className="text-gray-400 hover:text-gray-500">
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            ))}
            <div className="text-center mt-4">
              <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                View All Alerts
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Added Users */}
      <div className="bg-white rounded-lg shadow-md p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">
            Recently Added Users
          </h2>
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            Manage All Users
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Created
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || "Unnamed User"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex items-center text-xs leading-4 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getRoleBadgeIcon(user.role)}
                      {safeCapitalize(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex items-center text-xs leading-4 font-semibold rounded-full ${getStatusBadgeClass(
                        user.status
                      )}`}
                    >
                      {user.status && user.status.toLowerCase() === "active" ? (
                        <Check className="h-3 w-3 mr-1" />
                      ) : (
                        <Clock className="h-3 w-3 mr-1" />
                      )}
                      {safeCapitalize(user.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-green-600 hover:text-green-900">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="bg-white rounded-lg shadow-md p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          System Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-4 border rounded-lg flex items-start">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <Server className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-md font-semibold text-gray-700">
                Server Status
              </h3>
              <p className="text-2xl font-bold text-green-600">Online</p>
              <p className="text-sm text-gray-500 mt-1">
                100% uptime last 30 days
              </p>
            </div>
          </div>

          <div className="p-4 border rounded-lg flex items-start">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <Database className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-md font-semibold text-gray-700">Database</h3>
              <p className="text-2xl font-bold text-gray-800">78%</p>
              <p className="text-sm text-gray-500 mt-1">
                Storage capacity used
              </p>
            </div>
          </div>

          <div className="p-4 border rounded-lg flex items-start">
            <div className="p-3 bg-purple-100 rounded-full mr-4">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-md font-semibold text-gray-700">
                API Requests
              </h3>
              <p className="text-2xl font-bold text-gray-800">16,427</p>
              <p className="text-sm text-gray-500 mt-1">Last 24 hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
