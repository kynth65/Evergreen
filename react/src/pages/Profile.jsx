import React, { useEffect, useState, useRef } from "react";
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
  UserCircle,
  Hash,
  Cake,
  Eye,
  EyeOff,
  Lock,
  Check,
  X,
  AlertTriangle,
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
  const modalRef = useRef(null);

  // Password change form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    current_password_confirmation: "",
    new_password: "",
  });
  const [viewPassword, setViewPassword] = useState({
    current: false,
    confirmation: false,
    new: false,
  });
  const [passwordFormError, setPasswordFormError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    // Fetch user data from the API
    fetchUserData();
  }, []);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

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

  const initiateLogout = () => {
    setShowLogoutConfirm(true);
  };

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

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Open password change modal
  const openModal = () => {
    setIsModalOpen(true);
    setPasswordFormError(null);
    setPasswordSuccess(false);
  };

  // Close password change modal and reset form
  const closeModal = () => {
    setIsModalOpen(false);
    setPasswordFormError(null);
    setPasswordSuccess(false);
    setPasswordData({
      current_password: "",
      current_password_confirmation: "",
      new_password: "",
    });
    setViewPassword({
      current: false,
      confirmation: false,
      new: false,
    });
  };

  // Handle password change form input
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setViewPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Submit password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordFormError(null);
    setPasswordSuccess(false);

    // Validate passwords
    if (
      passwordData.current_password !==
      passwordData.current_password_confirmation
    ) {
      setPasswordFormError("Current password confirmation does not match.");
      return;
    }

    if (passwordData.new_password.length < 8) {
      setPasswordFormError("New password must be at least 8 characters long.");
      return;
    }

    // Send to API
    try {
      setPasswordLoading(true);
      await axiosClient.put("/user/profile", {
        password: passwordData.current_password,
        new_password: passwordData.new_password,
      });

      // Reset form
      setPasswordData({
        current_password: "",
        current_password_confirmation: "",
        new_password: "",
      });

      setPasswordSuccess(true);
      setTimeout(() => {
        closeModal();
      }, 3000);
    } catch (err) {
      console.error("Error updating password:", err);
      setPasswordFormError(
        err.response?.data?.message ||
          "Failed to update password. Please try again."
      );
    } finally {
      setPasswordLoading(false);
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
                    onClick={openModal}
                    className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm text-sm cursor-pointer"
                  >
                    <Lock className="h-3.5 w-3.5 mr-1.5" />
                    Change Password
                  </button>
                  <button
                    onClick={initiateLogout}
                    className="flex items-center px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors shadow-sm text-sm cursor-pointer"
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
        </div>
      </div>

      {/* Password Change Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-transparent backdrop-blur-sm bg-black bg-opacity-30">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 transition-all transform"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-green-600" />
                  Change Password
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Success Message */}
              {passwordSuccess && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center">
                  <Check className="h-5 w-5 mr-2 text-green-500" />
                  Password updated successfully!
                </div>
              )}

              {/* Error Message */}
              {passwordFormError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  {passwordFormError}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit}>
                <div className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password *
                    </label>
                    <div className="relative">
                      <input
                        type={viewPassword.current ? "text" : "password"}
                        name="current_password"
                        value={passwordData.current_password}
                        onChange={handlePasswordChange}
                        className="w-full p-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                        onClick={() => togglePasswordVisibility("current")}
                      >
                        {viewPassword.current ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Current Password Confirmation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Re-enter Current Password *
                    </label>
                    <div className="relative">
                      <input
                        type={viewPassword.confirmation ? "text" : "password"}
                        name="current_password_confirmation"
                        value={passwordData.current_password_confirmation}
                        onChange={handlePasswordChange}
                        className="w-full p-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                        onClick={() => togglePasswordVisibility("confirmation")}
                      >
                        {viewPassword.confirmation ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={viewPassword.new ? "text" : "password"}
                        name="new_password"
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                        className="w-full p-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                        onClick={() => togglePasswordVisibility("new")}
                      >
                        {viewPassword.new ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Password must be at least 8 characters long.
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors text-sm font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium flex items-center cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {passwordLoading ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Update Password
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-transparent backdrop-blur-sm bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 transition-all transform p-6">
            <div className="flex items-center justify-center mb-4 text-amber-500">
              <AlertTriangle size={48} />
            </div>

            <h3 className="text-lg font-semibold text-center text-gray-800 mb-2">
              Are You Sure?
            </h3>

            <p className="text-center text-gray-600 mb-6">
              Are you sure you want to log out of your account?
            </p>

            <div className="flex justify-center space-x-4">
              <button
                onClick={cancelLogout}
                className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors text-sm font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-5 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium cursor-pointer"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
