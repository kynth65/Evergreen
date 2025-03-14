import React, { useState, useEffect } from "react";
import { Bell, User, LogOut, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import axiosClient from "../axios.client";

export default function NavBar() {
  const { user, setToken, setUser: setContextUser } = useStateContext();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Fetch notifications on component mount and periodically
  useEffect(() => {
    fetchNotifications();

    // Fetch notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      // Use axiosClient instead of fetch for proper auth handling
      const response = await axiosClient.get("/notifications");
      if (response.data) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unread_count || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axiosClient.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosClient.put("/notifications/read-all");
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      await axiosClient.post("/logout");
    } catch (err) {
      console.error("Error during logout:", err);
    } finally {
      localStorage.removeItem("ACCESS_TOKEN");
      setToken(null);
      setContextUser({});
      navigate("/login");
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showNotifications &&
        !event.target.closest(".notification-dropdown-container")
      ) {
        setShowNotifications(false);
      }

      if (showUserMenu && !event.target.closest(".user-menu-container")) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showNotifications, showUserMenu]);

  // Get profile route based on user role
  const getProfileRoute = () => {
    if (!user || !user.role) return "/profile";
    return `/${user.role}/profile`;
  };

  // Safely parse JSON data
  const parseNotificationData = (notification) => {
    try {
      if (typeof notification.data === "string") {
        return JSON.parse(notification.data);
      }
      return notification.data; // If it's already an object
    } catch (error) {
      console.error("Error parsing notification data:", error);
      return { message: "Notification", type: "info" }; // Fallback
    }
  };

  // Format the notification date
  const formatNotificationDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.round(diffMs / (1000 * 60));

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} min ago`;

      const diffHrs = Math.round(diffMins / 60);
      if (diffHrs < 24) return `${diffHrs} hr ago`;

      return (
        date.toLocaleDateString() +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    } catch (e) {
      return "Unknown date";
    }
  };

  // Handle notification click and navigation
  const handleNotificationClick = (notification) => {
    // Mark the notification as read
    markAsRead(notification.id);

    // Parse the notification data
    const notificationData = parseNotificationData(notification);

    // Close the notification dropdown
    setShowNotifications(false);

    // Navigate based on notification content and user role
    if (notificationData.task_id) {
      // If there's a task involved, navigate to the appropriate task page
      if (user?.role === "admin") {
        // For admins, navigate to the admin tasks management with the specific task
        navigate(`/admin/tasks-management?taskId=${notificationData.task_id}`);
      } else if (user?.role === "superadmin") {
        // For superadmins who might also manage tasks
        navigate(`/admin/tasks-management?taskId=${notificationData.task_id}`);
      } else if (user?.role === "intern") {
        // For interns, navigate to the intern tasks page
        navigate(`/intern/tasks?taskId=${notificationData.task_id}`);
      }
    } else if (notificationData.needs_review) {
      // If it needs review, admin should go to task management with needs_review filter
      navigate("/admin/tasks-management?needs_review=true");
    } else if (user?.role === "admin") {
      // Default admin navigation
      navigate("/admin/tasks-management");
    } else if (user?.role === "superadmin") {
      // Default superadmin navigation
      navigate("/superadmin");
    } else if (user?.role === "intern") {
      // Default intern navigation
      navigate("/intern/tasks");
    } else if (user?.role === "agent") {
      // Default agent navigation
      navigate("/agent");
    } else {
      // Default fallback
      navigate("/");
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2.5 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-end items-center">
        {/* Right-side Icons */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <div className="relative notification-dropdown-container">
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition-colors relative focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              onClick={(e) => {
                e.stopPropagation();
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              aria-label={`${unreadCount} unread notifications`}
            >
              <Bell className="w-6 h-6 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm animate-pulse">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount > 9
                    ? "9+"
                    : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-200 max-w-[calc(100vw-2rem)]">
                <div className="p-3 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                  <h3 className="font-medium text-gray-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAllAsRead();
                      }}
                      className="text-sm text-green-600 hover:text-green-700 font-medium px-3 py-1 rounded hover:bg-green-50 transition-colors"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto overflow-x-hidden scrollbar-thin notification-list">
                  {notifications && notifications.length > 0 ? (
                    notifications.map((notification) => {
                      const notificationData =
                        parseNotificationData(notification);
                      return (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                            !notification.read_at ? "bg-green-50" : ""
                          }`}
                        >
                          <div className="flex items-start">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-800 break-words">
                                {notificationData.message}
                              </div>
                              {notificationData.task_name && (
                                <div className="text-xs text-gray-600 mt-1 flex items-center">
                                  <span className="truncate">
                                    Task: {notificationData.task_name}
                                  </span>
                                </div>
                              )}
                              <div className="text-xs text-gray-500 mt-1">
                                {formatNotificationDate(
                                  notification.created_at
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-10 text-center text-gray-500">
                      <div className="flex justify-center mb-3">
                        <Bell className="w-10 h-10 text-gray-300" />
                      </div>
                      <p>No notifications</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative user-menu-container">
            <button
              className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              onClick={(e) => {
                e.stopPropagation();
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-sm">
                {user?.first_name?.[0]?.toUpperCase() ||
                  user?.name?.[0]?.toUpperCase() ||
                  "U"}
              </div>
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-200 max-w-[calc(100vw-2rem)]">
                <div className="p-4 border-b bg-gray-50">
                  <p className="font-medium text-gray-800 truncate">
                    {user?.first_name && user?.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {user?.email || ""}
                  </p>
                  <div className="mt-2 text-xs inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    {user?.role
                      ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                      : "User"}
                  </div>
                </div>
                <div className="py-1">
                  <Link
                    to={getProfileRoute()}
                    className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                  >
                    <User className="w-4 h-4 mr-3 text-gray-500" />
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-3 text-gray-500" />
                    Settings
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  {/* Changed from Link to button for logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
