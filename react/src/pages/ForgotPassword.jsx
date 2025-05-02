import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../axios.client";
import { Mail, ArrowLeft, AlertCircle } from "lucide-react";
import EvergreenLogo from "../assets/Logo/evergreen logo.png";
import Header from "../components/header";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);

  // Auto-redirect after successful code sending
  useEffect(() => {
    if (isCodeSent) {
      const timer = setTimeout(() => {
        navigate("/verify-code", { state: { email } });
      }, 2000); // 2 second delay to show the success message
      return () => clearTimeout(timer);
    }
  }, [isCodeSent, navigate, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await axiosClient.post("/forgot-password", { email });
      setMessage(response.data.message);
      setIsCodeSent(true);
    } catch (error) {
      setError(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
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

          {/* Card */}
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
            {/* Card header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8">
              <div className="flex justify-center mb-4">
                <div className="bg-white bg-opacity-20 rounded-full p-3">
                  <img src={EvergreenLogo} alt="" className="h-16" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white text-center">
                Forgot Your Password?
              </h2>
              <p className="mt-2 text-green-50 text-center">
                Enter your email address and we'll send you a reset code
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

              {!isCodeSent ? (
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
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                      isSubmitting
                        ? "bg-green-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    } transition duration-150 ease-in-out`}
                  >
                    {isSubmitting ? (
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
                        Sending...
                      </>
                    ) : (
                      "Send Reset Code"
                    )}
                  </button>

                  <div className="mt-4 text-center">
                    <Link
                      to="/login"
                      className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-500"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back to login
                    </Link>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="bg-green-50 border-l-4 border-green-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-green-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700">{message}</p>
                        <p className="text-sm text-green-700 mt-1">
                          Redirecting to verification page...
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <Link
                      to="/login"
                      className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-500"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back to login
                    </Link>
                  </div>
                </div>
              )}
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
};

export default ForgotPassword;
