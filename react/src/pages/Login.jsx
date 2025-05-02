import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../axios.client";
import { useStateContext } from "../context/ContextProvider";
import Header from "../components/header";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import EvergreenLogo from "../assets/Logo/evergreen logo.png";

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser, setToken } = useStateContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const payload = {
      email: emailRef.current.value,
      password: passwordRef.current.value,
    };

    try {
      const { data } = await axiosClient.post("/login", payload);

      // Store token and user info
      setUser(data.user);
      setToken(data.token);

      // Redirect to agent dashboard
      if (data.user && data.user.role) {
        switch (data.user.role) {
          case "superadmin":
            navigate("/superadmin");
            break;
          case "admin":
            navigate("/admin");
            break;
          case "agent":
            navigate("/agent");
            break;
          case "intern":
            navigate("/intern");
            break;
          default:
            // Default fallback if role is unknown
            navigate("/agent");
            break;
        }
      } else {
        // Fallback if role is not provided
        navigate("/agent");
      }
    } catch (err) {
      console.error("Login error:", err);
      const message = err.response?.data?.message || "Invalid credentials";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-[#f7fdf7] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full relative">
          {/* Decorative element - top leaf */}
          <div className="hidden lg:block absolute -top-8 -right-8 opacity-60">
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M60 0C60 33.1371 33.1371 60 0 60C33.1371 60 60 86.8629 60 120C60 86.8629 86.8629 60 120 60C86.8629 60 60 33.1371 60 0Z"
                fill="#A7F3D0"
              />
            </svg>
          </div>

          {/* Login Card */}
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
            {/* Card header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8">
              <div className="flex justify-center mb-4">
                <div className="bg-white bg-opacity-20 rounded-full p-3">
                  <img src={EvergreenLogo} alt="" className="h-16" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white text-center">
                Sign in to your account
              </h2>
              <p className="mt-2 text-green-50 text-center">
                Access your Evergreen properties dashboard
              </p>
            </div>

            {/* Form section */}
            <div className="px-6 py-8 md:px-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      ref={emailRef}
                      type="email"
                      id="email"
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      ref={passwordRef}
                      type="password"
                      id="password"
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Remember me
                    </label>
                  </div>

                  {/* <div className="text-sm">
                    <a
                      href="#"
                      className="font-medium text-green-600 hover:text-green-500"
                    >
                      Forgot password?
                    </a>
                  </div> */}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                    isLoading
                      ? "bg-green-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  } transition duration-150 ease-in-out`}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </form>

              {/* Removed the signup link section */}
            </div>
          </div>

          {/* Decorative element - bottom leaf */}
          <div className="hidden lg:block absolute -bottom-8 -left-8 opacity-60">
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M60 0C60 33.1371 33.1371 60 0 60C33.1371 60 60 86.8629 60 120C60 86.8629 86.8629 60 120 60C86.8629 60 60 33.1371 60 0Z"
                fill="#A7F3D0"
              />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}
