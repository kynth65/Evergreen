import { Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Map,
  FileSpreadsheet,
  Grid,
  Calculator,
  FolderOpen,
} from "lucide-react";
import { useState, useEffect } from "react";
import NavBar from "../components/NavBar";

export default function AdminLayout() {
  const { user, token } = useStateContext();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const location = useLocation();

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

  // Redirect to login if not authenticated
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Redirect to appropriate dashboard if user is not an admin
  if (user && user.role && user.role !== "admin") {
    return <Navigate to={`/${user.role}`} />;
  }

  const menuItems = [
    {
      path: "/admin",
      name: "Dashboard",
      icon: <LayoutDashboard className="w-6 h-6" />,
      description: "Admin overview",
    },
    {
      path: "/admin/tasks-management",
      name: "Task Management",
      icon: <CheckSquare className="w-6 h-6" />,
      description: "Manage tasks",
    },
    {
      path: "/admin/file-manager-list",
      name: "File Manager",
      icon: <FolderOpen className="w-6 h-6" />,
      description: "Manage files and folders",
    },
    {
      path: "/admin/land-management",
      name: "Land Management",
      icon: <Map className="w-6 h-6" />,
      description: "Manage land properties",
    },
    {
      path: "/admin/lot-management",
      name: "Lot Management",
      icon: <Grid className="w-6 h-6" />,
      description: "Manage property lots",
    },
    {
      path: "/admin/residential-form",
      name: "Residential Form",
      icon: <FileSpreadsheet className="w-6 h-6" />,
      description: "Manage residential forms",
    },
    {
      path: "/admin/ocs-calculator",
      name: "OCS Calculator",
      icon: <Calculator className="w-6 h-6" />,
      description: "Create OCS for Client",
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
            (item.path !== "/admin" &&
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
        <Link to="/admin/profile">
          <div className="flex items-center p-2 rounded-lg hover:bg-green-50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white">
              {user?.first_name?.[0]?.toUpperCase() ||
                user?.name?.[0]?.toUpperCase() ||
                "I"}
            </div>
            {!isCollapsed && (
              <div className="ml-3">
                <p className="font-medium text-sm">
                  {user?.first_name && user?.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user?.name || "admin"}
                </p>
                <p className="text-xs text-gray-500">Real Estate admin</p>
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
            (item.path !== "/admin" &&
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
        <Link to="/admin/profile">
          <div className="flex items-center p-2 rounded-lg hover:bg-green-50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white">
              {user?.first_name?.[0]?.toUpperCase() ||
                user?.name?.[0]?.toUpperCase() ||
                "I"}
            </div>
            <div className="ml-3">
              <p className="font-medium text-sm">
                {user?.first_name && user?.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : user?.name || "admin"}
              </p>
              <p className="text-xs text-gray-500">Real Estate admin</p>
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
