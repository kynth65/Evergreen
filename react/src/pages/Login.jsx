import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../axios.client";
import { useStateContext } from "../context/ContextProvider";
import Header from "../components/header";
import { Mail, Lock, AlertCircle } from "lucide-react";
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

            setUser(data.user);
            setToken(data.token);

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
                        navigate("/agent");
                        break;
                }
            } else {
                navigate("/agent");
            }
        } catch (err) {
            console.error("Login error:", err);
            const message =
                err.response?.data?.message || "Invalid credentials";
            setError(message);

            if (passwordRef.current) {
                passwordRef.current.value = "";
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-[#fdfaf1] py-8 px-4 sm:px-6 lg:px-8">
                <Header />
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
                                fill="#081A0D"
                                opacity="0.1"
                            />
                        </svg>
                    </div>

                    {/* Card */}
                    <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
                        {/* Card header */}
                        <div className="bg-[#081A0D] px-6 py-8">
                            <div className="flex justify-center mb-4">
                                <div className="bg-[#fdfaf1] bg-opacity-20 rounded-full p-3">
                                    <img
                                        src={EvergreenLogo}
                                        alt="Evergreen Logo"
                                        className="h-16"
                                    />
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-[#fdfaf1] text-center">
                                Welcome <span className="italic">Back</span>
                            </h1>
                            <p className="mt-2 text-[#fdfaf1]/80 text-center">
                                Access your Evergreen properties dashboard
                            </p>
                        </div>

                        {/* Form section */}
                        <div className="px-6 py-8 md:px-8">
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
                                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                                    <div className="text-sm text-red-600">
                                        <p className="font-medium">{error}</p>
                                        {error.includes("password") && (
                                            <p className="mt-1">
                                                <Link
                                                    to="/forgot-password"
                                                    className="font-semibold text-red-600 hover:text-red-500 underline transition-colors"
                                                >
                                                    Forgot Password?
                                                </Link>
                                            </p>
                                        )}
                                    </div>
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
                                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-[#081A0D] focus:border-[#081A0D] sm:text-sm"
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
                                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-[#081A0D] focus:border-[#081A0D] sm:text-sm"
                                            placeholder="Enter your password"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm font-medium text-[#081A0D] hover:opacity-70 transition-opacity"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-[#fdfaf1] ${
                                        isLoading
                                            ? "bg-[#081A0D]/60 cursor-not-allowed"
                                            : "bg-[#081A0D] hover:bg-[#081A0D]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#081A0D]"
                                    } transition duration-150 ease-in-out`}
                                >
                                    {isLoading ? (
                                        <>
                                            <svg
                                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#fdfaf1]"
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
                                fill="#081A0D"
                                opacity="0.1"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </>
    );
}
