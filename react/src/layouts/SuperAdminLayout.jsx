import { Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ChevronLeft,
  ChevronRight,
  Map,
  FolderOpen,
  Grid,
  PhilippinePeso,
  FileSpreadsheet,
  Calculator,
  Menu as MenuIcon,
  X,
  Bell,
  User,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import axiosClient from "../axios.client";
import LogoutConfirmation from "../components/Confirmation/LogoutConfirmation";

export default function SuperAdminLayout() {
  const { user, token, setToken, setUser: setContextUser } = useStateContext();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Added state for mobile notifications and profile menu
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Track screen width for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      // Set mobile view when width is less than 768px
      const mobileWidth = window.innerWidth < 768;
      setIsMobileView(mobileWidth);

      // Auto collapse sidebar when width is between 768px and 1024px
      if (window.innerWidth < 1024 && window.innerWidth >= 768) {
        setIsCollapsed(true);
      } else if (window.innerWidth >= 1024) {
        setIsCollapsed(false);
      }
    };

    // Initial check
    handleResize();

    // Add listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile sidebar when navigation occurs
  useEffect(() => {
    setShowMobileSidebar(false);
  }, [location.pathname]);

  // Added functions for notifications and user menu
  // Fetch notifications on component mount and periodically
  useEffect(() => {
    if (isMobileView) {
      fetchNotifications();

      // Fetch notifications every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isMobileView]);

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

  // Initiate logout - show confirmation dialog
  const initiateLogout = () => {
    setShowUserMenu(false); // Close the user menu
    setShowLogoutConfirm(true); // Show the logout confirmation
  };

  // Confirm logout
  const confirmLogout = async () => {
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

  // Cancel logout
  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    if (isMobileView) {
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
    }
  }, [showNotifications, showUserMenu, isMobileView]);

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

  // Redirect to login if not authenticated
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Redirect to appropriate dashboard if user is not a superadmin
  if (user && user.role && user.role !== "superadmin") {
    return <Navigate to={`/${user.role}`} />;
  }

  const menuItems = [
    {
      path: "/superadmin",
      name: "Dashboard",
      icon: <LayoutDashboard className="w-6 h-6" />,
      description: "System overview",
    },
    {
      path: "/superadmin/AccountManagement",
      name: "Account Management",
      icon: <Users className="w-6 h-6" />,
      description: "Manage user accounts",
    },
    {
      path: "/superadmin/file-manager-list",
      name: "File Manager",
      icon: <FolderOpen className="w-6 h-6" />,
      description: "Manage files and folders",
    },
    {
      path: "/superadmin/land-management",
      name: "Land Management",
      icon: <Map className="w-6 h-6" />,
      description: "Manage land properties",
    },
    {
      path: "/superadmin/lot-management",
      name: "Lot Management",
      icon: <Grid className="w-6 h-6" />,
      description: "Manage property lots",
    },
    {
      path: "/superadmin/residential-form",
      name: "Residential Form",
      icon: <FileSpreadsheet className="w-6 h-6" />,
      description: "Manage residential forms",
    },
    {
      path: "/superadmin/ocs-calculator",
      name: "OCS Calculator",
      icon: <Calculator className="w-6 h-6" />,
      description: "Create OCS for Client",
    },
    {
      path: "/superadmin/client-payment", // Add the new path
      name: "Client Payment", // Add the new name
      icon: <PhilippinePeso className="w-6 h-6" />, // Add the DollarSign icon
      description: "Manage client payments", // Add the new description
    },
  ];

  // Sidebar component - with different versions for mobile and desktop
  const DesktopSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-xl font-bold text-white">Evergreen</h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg cursor-pointer bg-opacity-20 text-white hover:bg-opacity-30 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/superadmin" &&
              location.pathname.startsWith(item.path + "/"));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 mb-1 transition-colors rounded-md mx-2
                ${
                  isActive
                    ? "bg-green-50 text-green-600"
                    : "text-gray-600 hover:bg-gray-50"
                }
              `}
            >
              <div
                className={`${isActive ? "text-green-600" : "text-gray-500"}`}
              >
                {item.icon}
              </div>
              {!isCollapsed && (
                <div className="ml-3">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <Link to="/superadmin/profile">
          <div className="flex items-center p-2 rounded-lg hover:bg-green-50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white">
              {user?.first_name?.[0]?.toUpperCase() ||
                user?.name?.[0]?.toUpperCase() ||
                "A"}
            </div>
            {!isCollapsed && (
              <div className="ml-3">
                <p className="font-medium text-sm">
                  {user?.first_name && user?.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user?.name || "Admin"}
                </p>
                <p className="text-xs text-gray-500">Super Administrator</p>
              </div>
            )}
          </div>
        </Link>
      </div>
    </div>
  );

  // Mobile sidebar is always expanded and doesn't have the collapse button
  const MobileSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Evergreen</h2>
          <button
            onClick={() => setShowMobileSidebar(false)}
            className="p-2 rounded-lg cursor-pointer bg-opacity-20 text-white hover:bg-opacity-30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation Links - always expanded in mobile */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/superadmin" &&
              location.pathname.startsWith(item.path + "/"));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 mb-1 transition-colors rounded-md mx-2
                ${
                  isActive
                    ? "bg-green-50 text-green-600"
                    : "text-gray-600 hover:bg-gray-50"
                }
              `}
            >
              <div
                className={`${isActive ? "text-green-600" : "text-gray-500"}`}
              >
                {item.icon}
              </div>
              <div className="ml-3">
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Info - always shows user details in mobile */}
      <div className="p-4 border-t border-gray-200">
        <Link to="/superadmin/profile">
          <div className="flex items-center p-2 rounded-lg hover:bg-green-50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white">
              {user?.first_name?.[0]?.toUpperCase() ||
                user?.name?.[0]?.toUpperCase() ||
                "A"}
            </div>
            <div className="ml-3">
              <p className="font-medium text-sm">
                {user?.first_name && user?.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : user?.name || "Admin"}
              </p>
              <p className="text-xs text-gray-500">Super Administrator</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Custom top bar for mobile view */}
      {isMobileView && (
        <div className="bg-white shadow-md w-full flex items-center p-4 justify-between z-20">
          <div className="flex items-center">
            <button
              onClick={() => setShowMobileSidebar(!showMobileSidebar)}
              className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors mr-4"
            >
              {showMobileSidebar ? (
                <X className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>
            <h2 className="text-xl font-bold text-green-600">Evergreen</h2>
          </div>

          {/* Added notification and profile icons for mobile */}
          <div className="flex items-center space-x-2">
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
                <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />
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
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
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
                className="flex items-center cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
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

                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={initiateLogout}
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
      )}

      <div className="flex flex-1 h-0 overflow-hidden">
        {/* Mobile Sidebar (overlay when shown) - Always expanded */}
        {isMobileView && (
          <div
            className={`fixed inset-0 z-30 bg-black bg-opacity-30 transition-opacity duration-300 ${
              showMobileSidebar
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setShowMobileSidebar(false)}
          >
            <div
              className={`absolute top-0 left-0 h-full bg-white shadow-xl transition-transform duration-300 w-64 transform ${
                showMobileSidebar ? "translate-x-0" : "-translate-x-full"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <MobileSidebarContent />
            </div>
          </div>
        )}

        {/* Desktop Sidebar (always visible, collapsible) */}
        {!isMobileView && (
          <div
            className={`bg-white shadow-lg transition-all duration-300 flex-shrink-0 ${
              isCollapsed ? "w-20" : "w-64"
            }`}
          >
            <DesktopSidebarContent />
          </div>
        )}

        {/* Main Content Container */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navbar with Notifications (only on desktop) */}
          {!isMobileView && <NavBar />}

          {/* Main Content */}
          <div className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="p-6">
              <Outlet />
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Component */}
      <LogoutConfirmation
        isOpen={showLogoutConfirm}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />

      {/* Decorative element - clover */}
      <div className="hidden lg:block fixed bottom-0 left-0 opacity-10 z-0 pointer-events-none">
        <svg
          width="180"
          height="180"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill="#047857">
            {/* Four-leaf clover design */}
            <path d="M60 30C60 13.4315 46.5685 0 30 0C13.4315 0 0 13.4315 0 30C0 46.5685 13.4315 60 30 60C46.5685 60 60 46.5685 60 30Z" />
            <path d="M60 90C60 73.4315 46.5685 60 30 60C13.4315 60 0 73.4315 0 90C0 106.569 13.4315 120 30 120C46.5685 120 60 106.569 60 90Z" />
            <path d="M90 60C73.4315 60 60 73.4315 60 90C60 106.569 73.4315 120 90 120C106.569 120 120 106.569 120 90C120 73.4315 106.569 60 90 60Z" />
            <path d="M90 0C73.4315 0 60 13.4315 60 30C60 46.5685 73.4315 60 90 60C106.569 60 120 46.5685 120 30C120 13.4315 106.569 0 90 0Z" />
            {/* Small circle in center */}
            <circle cx="60" cy="60" r="5" />
          </g>
        </svg>
      </div>
    </div>
  );
}
