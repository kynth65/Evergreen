import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../axios.client";
import { useStateContext } from "../context/ContextProvider";
import {
  User,
  Mail,
  Calendar,
  LogOut,
  Edit,
  Shield,
  LayoutDashboard,
  UserCircle,
  Hash,
  Cake,
} from "lucide-react";

export default function Profile() {
  const { user, token, setToken, setUser: setContextUser } = useStateContext();
  const [userData, setUserData] = useState({
    id: "",
    first_name: "",
    middle_initial: "",
    last_name: "",
    age: "",
    email: "",
    role: "",
    created_at: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user data from the API
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get("/user");

      // Update state with user data from API
      setUserData({
        id: response.data.id || "",
        first_name: response.data.first_name || "",
        middle_initial: response.data.middle_initial || "",
        last_name: response.data.last_name || "",
        age: response.data.age || "",
        email: response.data.email || "",
        role: response.data.role || "",
        created_at: response.data.created_at || "",
      });

      setLoading(false);
    } catch (err) {
      console.error("Error fetching user data:", err);

      // Use context data as fallback
      if (user) {
        setUserData({
          id: user.id || "",
          first_name: user.first_name || "",
          middle_initial: user.middle_initial || "",
          last_name: user.last_name || "",
          age: user.age || "",
          email: user.email || "",
          role: user.role || "",
          created_at: user.created_at || "",
        });

        setLoading(false);
      } else {
        setError("Failed to load profile information");
        setLoading(false);
      }
    }
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen ">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen ">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Capitalize role for display
  const formatRole = (role) => {
    if (!role) return "User";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Get the base URL for returning to dashboard
  const getDashboardUrl = () => {
    return `/${userData.role || ""}`;
  };

  // Get full name
  const getFullName = () => {
    const { first_name, middle_initial, last_name } = userData;
    if (!first_name && !last_name) return "User";

    let fullName = first_name || "";
    if (middle_initial) fullName += ` ${middle_initial}.`;
    if (last_name) fullName += ` ${last_name}`;

    return fullName;
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    const { first_name, last_name } = userData;
    if (!first_name && !last_name) return "U";

    let initials = first_name ? first_name[0] : "";
    if (last_name) initials += last_name[0];

    return initials.toUpperCase();
  };

  // Generate random colors for avatar based on user ID or name
  const getRandomAvatarColors = () => {
    // Use user ID or name as seed for consistent colors for the same user
    const seed = userData.id || getFullName() || "default";
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate 2 colors for gradient
    const color1 = `hsl(${hash % 360}, 70%, 60%)`;
    const color2 = `hsl(${(hash + 40) % 360}, 70%, 50%)`;

    return `linear-gradient(to right, ${color1}, ${color2})`;
  };

  return (
    <div className="container mx-auto py-6 px-4 ">
      <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-3xl mx-auto">
        {/* Profile Information */}
        <div className="px-6 py-6 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center">
            {/* Profile Picture */}
            <div className="relative mb-4 sm:mb-0">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center border-2 border-white shadow-md overflow-hidden text-white text-2xl font-bold"
                style={{ background: getRandomAvatarColors() }}
              >
                {getUserInitials()}
              </div>
              <button className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-sm hover:bg-gray-100 transition-colors">
                <Edit className="h-3.5 w-3.5 text-gray-600" />
              </button>
            </div>

            {/* Name and Actions */}
            <div className="sm:ml-6 flex-1">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {getFullName()}
                  </h1>
                  <div className="flex items-center mt-1">
                    <span className="px-2.5 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                      {formatRole(userData.role)}
                    </span>
                    {userData.id && (
                      <span className="text-gray-500 text-xs ml-2">
                        ID: {userData.id}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-4 sm:mt-0">
                  <button
                    onClick={() => navigate(getDashboardUrl())}
                    className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm text-sm"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" />
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors shadow-sm text-sm"
                  >
                    <LogOut className="h-3.5 w-3.5 mr-1.5" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3.5">
                <h2 className="text-lg font-semibold text-green-700 border-b border-green-100 pb-2">
                  Personal Information
                </h2>
                <div className="flex items-start">
                  <UserCircle className="h-4.5 w-4.5 text-green-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="text-sm text-gray-800">{getFullName()}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Cake className="h-4.5 w-4.5 text-green-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Age</p>
                    <p className="text-sm text-gray-800">
                      {userData.age ? `${userData.age} years` : "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="h-4.5 w-4.5 text-green-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-800">
                      {userData.email || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3.5">
                <h2 className="text-lg font-semibold text-green-700 border-b border-green-100 pb-2">
                  Account Details
                </h2>
                <div className="flex items-start">
                  <Shield className="h-4.5 w-4.5 text-green-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="text-sm text-gray-800">
                      {formatRole(userData.role)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Hash className="h-4.5 w-4.5 text-green-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">User ID</p>
                    <p className="text-sm text-gray-800">
                      {userData.id || "Not available"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="h-4.5 w-4.5 text-green-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Member Since</p>
                    <p className="text-sm text-gray-800">
                      {userData.created_at
                        ? formatDate(userData.created_at)
                        : "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Button */}
          <div className="mt-6">
            <button className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors font-medium shadow-sm flex items-center justify-center text-sm">
              <Edit className="h-3.5 w-3.5 mr-2" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
