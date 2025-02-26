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
  Camera,
  Shield,
  LayoutDashboard,
} from "lucide-react";

export default function Profile() {
  const { user, token, setToken, setUser: setContextUser } = useStateContext();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    created_at: "",
    role: "",
    bio: "",
    specialties: [],
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
        name: response.data.name || "",
        email: response.data.email || "",
        created_at: response.data.created_at || "",
        role: response.data.role || "",
        bio: response.data.bio || "",
        specialties: response.data.specialties || [],
      });

      setLoading(false);
    } catch (err) {
      console.error("Error fetching user data:", err);

      // Use context data as fallback
      if (user) {
        setUserData({
          name: user.name || "",
          email: user.email || "",
          created_at: user.created_at || "",
          role: user.role || "",
          bio: user.bio || "",
          specialties: user.specialties || [],
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

  const getRoleIcon = () => {
    return <Shield className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />;
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Profile Header with Cover Image */}
        <div className="relative h-48 bg-gradient-to-r from-green-500 to-emerald-600">
          <button className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors">
            <Camera className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        {/* Profile Information */}
        <div className="relative px-6 py-10 sm:px-10">
          {/* Profile Picture */}
          <div className="absolute -top-16 left-10">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-green-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                <User className="h-16 w-16 text-green-600" />
              </div>
              <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors">
                <Edit className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
          {/* Actions */}
          <div className="flex justify-end gap-3 mb-4">
            <button
              onClick={() => navigate(getDashboardUrl())}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors shadow-sm"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors shadow-sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
          {/* Basic Info */}
          <div className="mt-6">
            <h1 className="text-3xl font-bold text-gray-800">
              {userData.name || "User"}
            </h1>
            <p className="text-gray-600 mt-1">{formatRole(userData.role)}</p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
                  Contact Information
                </h2>
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-800">
                      {userData.email || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="text-gray-800">
                      {userData.created_at
                        ? formatDate(userData.created_at)
                        : "Not available"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
                  Professional Details
                </h2>
                <div className="flex items-start">
                  {getRoleIcon()}
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="text-gray-800">{formatRole(userData.role)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Bio</p>
                  <p className="text-gray-800">
                    {userData.bio || "No bio available"}
                  </p>
                </div>
                {userData.specialties && userData.specialties.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Specialties</p>
                    <div className="flex flex-wrap gap-2">
                      {userData.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Edit Profile Button */}
          <div className="mt-8">
            <button className="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium shadow-sm flex items-center justify-center">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
