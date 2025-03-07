import React, { useState, useEffect } from "react";
import { Bell, User, LogOut, Settings, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import axiosClient from "../axios.client";

export default function NavBar() {
  const { user } = useStateContext();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Get notification type color
  const getNotificationTypeColor = (type) => {
    switch (type) {
      case "success":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      case "info":
      default:
        return "bg-blue-500";
    }
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

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex justify-end items-center">
        {/* Right-side Icons */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <div className="relative notification-dropdown-container">
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
              onClick={(e) => {
                e.stopPropagation();
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
            >
              <Bell className="w-6 h-6 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-200">
                <div className="p-3 border-b flex justify-between items-center">
                  <h3 className="font-medium text-gray-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto notification-list">
                  {notifications && notifications.length > 0 ? (
                    notifications.map((notification) => {
                      const notificationData =
                        parseNotificationData(notification);
                      return (
                        <div
                          key={notification.id}
                          onClick={() => markAsRead(notification.id)}
                          className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                            !notification.read_at ? "bg-green-50" : ""
                          }`}
                        >
                          <div className="flex items-start">
                            <div
                              className={`${getNotificationTypeColor(
                                notificationData.type
                              )} w-2 h-2 rounded-full mt-2 mr-2`}
                            ></div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-800">
                                {notificationData.message}
                              </div>
                              {notificationData.task_name && (
                                <div className="text-xs text-gray-600 mt-1">
                                  Task: {notificationData.task_name}
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
                    <div className="p-6 text-center text-gray-500">
                      No notifications
                    </div>
                  )}
                </div>
                {notifications && notifications.length > 5 && (
                  <div className="p-2 border-t text-center">
                    <Link
                      to="/notifications"
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      View all notifications
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative user-menu-container">
            <button
              className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white">
                {user?.first_name?.[0]?.toUpperCase() ||
                  user?.name?.[0]?.toUpperCase() ||
                  "U"}
              </div>
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-200">
                <div className="p-3 border-b">
                  <p className="font-medium text-gray-800">
                    {user?.first_name && user?.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {user?.email || ""}
                  </p>
                </div>
                <div className="py-1">
                  <Link
                    to={getProfileRoute()}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                  <hr className="my-1" />
                  <Link
                    to="/logout"
                    className="px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
