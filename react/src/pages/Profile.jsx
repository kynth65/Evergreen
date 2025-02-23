import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../axios.client"; // Make sure the path is correct
import { useStateContext } from "../context/ContextProvider";
import {
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Award,
    LogOut,
    Edit,
    Camera,
} from "lucide-react";

export default function Profile() {
    const [userData, setUserData] = useState({
        name: "",
        email: "",
        created_at: "",
    });

    // Mock data that doesn't require database changes
    const mockProfileData = {
        phone: "(555) 123-4567",
        address: "123 Evergreen Ave, Westview, CA",
        role: "Real Estate Agent",
        experience: "3 years",
        bio: "Dedicated real estate agent with expertise in residential properties. Focused on helping families find their dream homes and investors secure valuable properties.",
        specialties: ["Residential", "Commercial", "Land"],
    };

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { setToken, setUser: setContextUser } = useStateContext();
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch user data from the API
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get("/user");

            // Update state with real user data
            setUserData({
                name: response.data.name || "Agent",
                email: response.data.email || "agent@example.com",
                created_at:
                    response.data.created_at || new Date().toISOString(),
            });

            setLoading(false);
        } catch (err) {
            console.error("Error fetching user data:", err);
            setError("Failed to load profile information");
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await axiosClient.post("/logout");
        } catch (err) {
            console.error("Error during logout:", err);
        } finally {
            // Always clear the token and user data, even if the API call fails
            localStorage.removeItem("ACCESS_TOKEN");
            setToken(null);
            setContextUser({});
            navigate("/login");
        }
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
                    <div className="flex justify-end mb-4">
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
                            {userData.name}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {mockProfileData.role}
                        </p>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
                                    Contact Information
                                </h2>

                                <div className="flex items-start">
                                    <Mail className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Email
                                        </p>
                                        <p className="text-gray-800">
                                            {userData.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <Phone className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Phone
                                        </p>
                                        <p className="text-gray-800">
                                            {mockProfileData.phone}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Address
                                        </p>
                                        <p className="text-gray-800">
                                            {mockProfileData.address}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Member Since
                                        </p>
                                        <p className="text-gray-800">
                                            {formatDate(userData.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
                                    Professional Details
                                </h2>

                                <div className="flex items-start">
                                    <Award className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Experience
                                        </p>
                                        <p className="text-gray-800">
                                            {mockProfileData.experience}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500 mb-2">
                                        Bio
                                    </p>
                                    <p className="text-gray-800">
                                        {mockProfileData.bio}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500 mb-2">
                                        Specialties
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {mockProfileData.specialties.map(
                                            (specialty, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                                                >
                                                    {specialty}
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>
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
