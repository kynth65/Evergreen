import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../axios.client";
import { useStateContext } from "../context/ContextProvider";
import Header from "../components/header";
import {
    User,
    Mail,
    Lock,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
    UserPlus,
} from "lucide-react";

export default function Signup() {
    const nameRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();
    const confirmPasswordRef = useRef();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const { setUser, setToken } = useStateContext();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Basic validation
        if (passwordRef.current.value !== confirmPasswordRef.current.value) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        if (passwordRef.current.value.length < 8) {
            setError("Password must be at least 8 characters long");
            setIsLoading(false);
            return;
        }

        const payload = {
            username: nameRef.current.value, // This matches your SignupRequest validation rules
            email: emailRef.current.value,
            password: passwordRef.current.value,
            password_confirmation: confirmPasswordRef.current.value,
        };

        try {
            const { data } = await axiosClient.post("/signup", payload);
            setUser(data.user);
            setToken(data.token);

            // Redirect to dashboard
            navigate("/agent");
        } catch (error) {
            console.error("Signup error:", error);
            const message =
                error.response?.data?.message ||
                error.response?.data?.error ||
                "An error occurred during signup";
            setError(message);

            // If there are validation errors, show the first one
            if (error.response?.data?.errors) {
                const firstError = Object.values(error.response.data.errors)[0];
                setError(
                    Array.isArray(firstError) ? firstError[0] : firstError
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
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

                    {/* Signup Card */}
                    <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
                        {/* Card header */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8">
                            <div className="flex justify-center mb-4">
                                <div className="bg-white bg-opacity-20 rounded-full p-3">
                                    <UserPlus className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-white text-center">
                                Create Your Evergreen Account
                            </h2>
                            <p className="mt-2 text-green-50 text-center">
                                Join our community for exclusive properties
                            </p>
                        </div>

                        {/* Form section */}
                        <div className="px-6 py-8 md:px-8">
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
                                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                                    <p className="text-sm text-red-600">
                                        {error}
                                    </p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            ref={nameRef}
                                            type="text"
                                            id="name"
                                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>
                                </div>

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
                                            placeholder="Minimum 8 characters"
                                            required
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Password must be at least 8 characters
                                        long
                                    </p>
                                </div>

                                <div>
                                    <label
                                        htmlFor="confirmPassword"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <CheckCircle className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            ref={confirmPasswordRef}
                                            type="password"
                                            id="confirmPassword"
                                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                            placeholder="Re-enter password"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center bg-green-50 p-3 rounded-lg">
                                    <input
                                        id="terms"
                                        name="terms"
                                        type="checkbox"
                                        required
                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                    />
                                    <label
                                        htmlFor="terms"
                                        className="ml-2 block text-sm text-gray-700"
                                    >
                                        I agree to the{" "}
                                        <a
                                            href="#"
                                            className="font-medium text-green-600 hover:text-green-500"
                                        >
                                            Terms of Service
                                        </a>{" "}
                                        and{" "}
                                        <a
                                            href="#"
                                            className="font-medium text-green-600 hover:text-green-500"
                                        >
                                            Privacy Policy
                                        </a>
                                    </label>
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
                                            Creating Account...
                                        </>
                                    ) : (
                                        "Create Account"
                                    )}
                                </button>
                            </form>

                            <div className="mt-8 flex items-center justify-center">
                                <ArrowLeft className="h-4 w-4 text-gray-500 mr-2" />
                                <p className="text-center text-sm text-gray-600">
                                    Already have an account?{" "}
                                    <Link
                                        to="/login"
                                        className="font-medium text-green-600 hover:text-green-500"
                                    >
                                        Sign in
                                    </Link>
                                </p>
                            </div>
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
