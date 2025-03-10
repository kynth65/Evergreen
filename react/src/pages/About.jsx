import React from "react";
import Header from "../components/header"; // Adjust path if needed
import { Link } from "react-router-dom";
import FarmLand from "../assets/Farm Land.png";

export default function About() {
    return (
        <>
            <Header />
            <main className="bg-gray-50 min-h-screen">
                {/* Hero Section */}
                <section className="py-16 md:py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                            <div>
                                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                                    About Evergreen Farms
                                </h1>
                                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                    Connecting people with premium farmland
                                    since 2010. We believe in sustainable
                                    agriculture and preserving natural
                                    landscapes for future generations.
                                </p>
                                <div className="h-1 w-24 bg-green-600 mb-8"></div>
                            </div>
                            <div className="mt-12 lg:mt-0">
                                <img
                                    src={FarmLand}
                                    alt="Scenic farmland view"
                                    className="rounded-lg shadow-xl object-cover h-full w-full"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Our Mission */}
                <section className="py-16 bg-green-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                Our Mission
                            </h2>
                            <div className="h-1 w-24 bg-green-600 mx-auto"></div>
                        </div>
                        <div className="max-w-3xl mx-auto">
                            <p className="text-xl text-gray-700 mb-8 leading-relaxed text-center">
                                We specialize in buying and selling premium
                                farmland properties. With a deep commitment to
                                nature and our clients, we help you find the
                                perfect piece of land while preserving our
                                natural heritage.
                            </p>
                            <p className="text-xl text-gray-700 leading-relaxed text-center">
                                Our goal is to connect passionate agricultural
                                enthusiasts with sustainable farmland
                                opportunities that benefit both people and the
                                planet.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Our Values */}
                <section className="py-16 md:py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
                            Our Values
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-green-50 rounded-lg p-8 shadow-md transition-transform hover:scale-105">
                                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-8 w-8 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                                    Sustainability
                                </h3>
                                <p className="text-gray-700">
                                    We prioritize ecological balance and
                                    sustainable farming practices in all the
                                    properties we represent.
                                </p>
                            </div>

                            <div className="bg-green-50 rounded-lg p-8 shadow-md transition-transform hover:scale-105">
                                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-8 w-8 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                                    Community
                                </h3>
                                <p className="text-gray-700">
                                    We build lasting relationships with farmers,
                                    buyers, and local communities to create
                                    thriving agricultural ecosystems.
                                </p>
                            </div>

                            <div className="bg-green-50 rounded-lg p-8 shadow-md transition-transform hover:scale-105">
                                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-8 w-8 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                                    Integrity
                                </h3>
                                <p className="text-gray-700">
                                    We operate with transparency and honesty,
                                    ensuring fair deals for both buyers and
                                    sellers of farmland.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Our Team */}
                <section className="py-16 md:py-24 bg-green-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                Our Team
                            </h2>
                            <div className="h-1 w-24 bg-green-600 mx-auto"></div>
                            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
                                Meet the dedicated professionals behind
                                Evergreen Farms.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-12">
                            <div className="text-center">
                                <div className="relative mb-6 mx-auto w-48 h-48 rounded-full overflow-hidden">
                                    <img
                                        src="/api/placeholder/200/200"
                                        alt="Team member"
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                                    Maria Rodriguez
                                </h3>
                                <p className="text-green-600 font-medium mb-4">
                                    Founder & CEO
                                </p>
                                <p className="text-gray-600">
                                    With 15+ years in sustainable agriculture,
                                    Maria leads our mission to connect people
                                    with the perfect farmland.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="relative mb-6 mx-auto w-48 h-48 rounded-full overflow-hidden">
                                    <img
                                        src="/api/placeholder/200/200"
                                        alt="Team member"
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                                    David Chen
                                </h3>
                                <p className="text-green-600 font-medium mb-4">
                                    Land Specialist
                                </p>
                                <p className="text-gray-600">
                                    David assesses farmland quality and
                                    sustainability potential to ensure we offer
                                    only premium agricultural properties.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="relative mb-6 mx-auto w-48 h-48 rounded-full overflow-hidden">
                                    <img
                                        src="/api/placeholder/200/200"
                                        alt="Team member"
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                                    Sarah Johnson
                                </h3>
                                <p className="text-green-600 font-medium mb-4">
                                    Client Relations
                                </p>
                                <p className="text-gray-600">
                                    Sarah works closely with buyers and sellers
                                    to create meaningful connections and smooth
                                    transactions.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 bg-green-600">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Ready to find your perfect farmland?
                        </h2>
                        <p className="text-xl text-green-50 mb-12 max-w-3xl mx-auto">
                            Schedule a free tour and let us help you discover
                            the ideal property for your agricultural dreams.
                        </p>
                        <Link
                            to="/contact"
                            className="inline-block bg-white text-green-600 hover:bg-gray-100 font-medium px-8 py-4 rounded-md text-lg transition-colors"
                        >
                            Book a Free Tour Trip
                        </Link>
                        <p className="text-green-100 mt-6 text-sm">
                            By clicking 'Book a Free Tour Trip' you acknowledge
                            that you have read and agree to the Terms of Service
                        </p>
                    </div>
                </section>
            </main>
        </>
    );
}
