import React, { useState } from "react";
import axiosClient from "../axios.client";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewPassword, setViewPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    middle_initial: "",
    last_name: "",
    age: "",
    email: "",
    role: "agent", // Default role
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setViewPassword(!viewPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Using the new /register endpoint for non-superadmin users
      await axiosClient.post("/register", formData);
      // Redirect to login page after successful registration
      navigate("/login");
    } catch (err) {
      setError(
        "Registration failed: " + (err.response?.data?.message || err.message)
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-md py-10">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-600 mt-2">
            Sign up to get started with our services
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                type={viewPassword ? "text" : "password"}
                name="password"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
                value={formData.password}
                onChange={handleInputChange}
              />
              <button
                type="button"
                className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700"
                onClick={togglePasswordVisibility}
              >
                {viewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </div>

          <div className="text-center mt-4 text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-green-600 hover:text-green-700">
              Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
