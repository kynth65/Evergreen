import React, { useState, useEffect } from "react";
import Header from "../components/header";
import { Link } from "react-router-dom";
import FarmLand from "../assets/Farm Land.png";
import Footer from "../components/footer";
import beescapes from "../assets/beescapes layout.jpg";
import beesettings from "../assets/beesettings layout.jpg";
import jaikpark from "../assets/Jaika park layout.jpg";
import juanderland from "../assets/juanderland.png";
import Office from "../assets/homepage/office.png";
import {
    X,
    Leaf,
    ArrowRight,
    ShieldCheck,
    Recycle,
    Users,
    ArrowUpRight,
} from "lucide-react";
import Location from "../components/Location";

export default function About() {
    // State to track which image is being viewed in lightbox
    const [lightboxImage, setLightboxImage] = useState(null);
    const [lightboxTitle, setLightboxTitle] = useState("");

    // Handle opening the lightbox
    const openLightbox = (image, title) => {
        if (!image) return; // Don't open lightbox if there's no image
        setLightboxImage(image);
        setLightboxTitle(title);
        // Prevent scrolling when lightbox is open
        document.body.style.overflow = "hidden";
    };

    // Handle closing the lightbox
    const closeLightbox = () => {
        setLightboxImage(null);
        setLightboxTitle("");
        // Re-enable scrolling
        document.body.style.overflow = "auto";
    };

    // Add keyboard event listener to close lightbox with ESC key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && lightboxImage) {
                closeLightbox();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            // Clean up overflow style on component unmount
            document.body.style.overflow = "auto";
        };
    }, [lightboxImage]);

    // Project data for consistency
    const projects = [
        {
            id: 1,
            title: "BEESCAPES",
            image: beescapes,
            description:
                "Sustainable farm plots designed for ecological balance and biodiversity.",
        },
        {
            id: 2,
            title: "JUANDERLAND",
            image: juanderland,
            description:
                "Premium farmland development with modern agricultural infrastructure.",
        },
        {
            id: 3,
            title: "BEE SETTING",
            image: beesettings,
            description:
                "Apiculture-focused land development promoting pollinator health.",
        },
        {
            id: 4,
            title: "JAIKA PARK",
            image: jaikpark,
            description:
                "Community-oriented agricultural space with recreational facilities.",
        },
    ];

    return (
        <>
            <Header />
            <main className="bg-[#fdfaf1] min-h-screen">
                {/* Hero Section */}
                <section className="py-20 md:py-32 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                            <div className="relative">
                                <div className="inline-block bg-[#081A0D] text-[#fdfaf1] px-6 py-2 rounded-full text-sm font-semibold mb-8 uppercase tracking-wider">
                                    Est. 2020
                                </div>
                                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-[#081A0D] mb-8 leading-tight">
                                    About{" "}
                                    <span className="italic">Evergreen</span>{" "}
                                    Realty PH
                                </h1>
                                <p className="text-xl md:text-2xl text-[#081A0D]/70 mb-10 leading-relaxed">
                                    Connecting people with premium farmland
                                    since 2020. Whether you're looking to buy or
                                    sell, we believe in sustainable agriculture
                                    and preserving natural landscapes for future
                                    generations. If you are trying to sell your
                                    land, we are willing to help you sell it
                                    faster and easier.
                                </p>
                                <div className="flex items-center text-[#081A0D] font-medium text-lg">
                                    <Leaf className="mr-3 h-6 w-6" />
                                    <span>
                                        Committed to sustainable land
                                        development
                                    </span>
                                </div>
                            </div>
                            <div className="mt-12 lg:mt-0 relative">
                                <img
                                    src={Office}
                                    alt="Office view"
                                    className="rounded-3xl shadow-2xl object-cover h-full w-full hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Core Values Section */}
                <section className="py-24 lg:py-32 bg-[#fdfaf1]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mb-20">
                            <div className="inline-block mb-3">
                                <span className="text-[#081A0D]/60 text-sm font-semibold tracking-wider uppercase">
                                    What Drives Us
                                </span>
                            </div>
                            <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif text-[#081A0D] mb-8 max-w-4xl">
                                Our Core <span className="italic">Values</span>
                            </h2>
                            <p className="text-2xl md:text-3xl text-[#081A0D]/60 max-w-3xl leading-relaxed">
                                We are dedicated to providing exceptional
                                service for all your real estate needs. Our
                                values ensure a smooth and ethical process for
                                every client.
                            </p>
                        </div>

                        {/* Modern asymmetric layout like homepage */}
                        <div className="space-y-6">
                            {/* First row - 2 cards */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white p-10 lg:p-12 rounded-3xl hover:shadow-2xl transition-all duration-300 group border border-[#081A0D]/5">
                                    <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                                        <ShieldCheck className="h-12 w-12 text-[#081A0D]" />
                                    </div>
                                    <h3 className="text-3xl lg:text-4xl font-serif text-[#081A0D] mb-4">
                                        Integrity
                                    </h3>
                                    <p className="text-xl text-[#081A0D]/70 leading-relaxed">
                                        Honest and transparent dealings are at
                                        the heart of our business. We ensure
                                        fair practices and build trust through
                                        every interaction.
                                    </p>
                                </div>

                                <div className="bg-[#081A0D] text-white p-10 lg:p-12 rounded-3xl hover:shadow-2xl transition-all duration-300 group">
                                    <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                                        <Recycle className="h-12 w-12 text-white" />
                                    </div>
                                    <h3 className="text-3xl lg:text-4xl font-serif mb-4">
                                        Sustainability
                                    </h3>
                                    <p className="text-xl text-white/80 leading-relaxed">
                                        We promote sustainable development
                                        practices that protect the environment
                                        and ensure the long-term value of your
                                        investment.
                                    </p>
                                </div>
                            </div>

                            {/* Second row - single card */}
                            <div className="bg-white p-10 lg:p-12 rounded-3xl hover:shadow-2xl transition-all duration-300 group border border-[#081A0D]/5">
                                <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                                    <Users className="h-12 w-12 text-[#081A0D]" />
                                </div>
                                <h3 className="text-3xl lg:text-4xl font-serif text-[#081A0D] mb-4">
                                    Community
                                </h3>
                                <p className="text-xl text-[#081A0D]/70 leading-relaxed">
                                    We build strong relationships with our
                                    clients and support local communities
                                    through responsible land development and
                                    stewardship.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Location Section - Let the component handle its own styling */}
                <section>
                    <Location />
                </section>

                {/* Key Projects Section */}
                <section className="py-24 lg:py-32 bg-[#fdfaf1] relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mb-20">
                            <div className="inline-block mb-3">
                                <span className="text-[#081A0D]/60 text-sm font-semibold tracking-wider uppercase">
                                    OUR PORTFOLIO
                                </span>
                            </div>
                            <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif text-[#081A0D] mb-8 max-w-4xl">
                                Featured{" "}
                                <span className="italic">Projects</span>
                            </h2>
                            <p className="text-2xl md:text-3xl text-[#081A0D]/60 max-w-3xl leading-relaxed">
                                Explore our premium land development projects,
                                each designed with sustainability and future
                                growth in mind.
                            </p>
                        </div>

                        {/* Grid Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    onClick={() =>
                                        openLightbox(
                                            project.image,
                                            project.title
                                        )
                                    }
                                    className="group relative overflow-hidden rounded-3xl cursor-pointer h-[50vh] bg-[#081A0D]"
                                >
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:opacity-75"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#081A0D] via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300">
                                        <div className="absolute bottom-0 left-0 right-0 p-8">
                                            <h3 className="text-2xl md:text-3xl font-serif text-white mb-2">
                                                {project.title}
                                            </h3>
                                            <p className="text-white/80 text-lg">
                                                {project.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Lightbox Modal */}
                {lightboxImage && (
                    <div
                        className="fixed inset-0 bg-[#081A0D]/95 z-50 flex items-center justify-center p-4 animate-fadeIn"
                        onClick={closeLightbox}
                    >
                        <div
                            className="relative max-w-full max-h-full flex flex-col items-center animate-scaleIn"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="absolute -top-12 right-0 bg-[#fdfaf1] rounded-full p-3 shadow-xl z-10 cursor-pointer hover:bg-white transition-colors"
                                onClick={closeLightbox}
                                aria-label="Close lightbox"
                            >
                                <X className="w-6 h-6 text-[#081A0D]" />
                            </button>

                            <div className="bg-[#fdfaf1] px-6 py-4 rounded-t-3xl w-full text-center">
                                <h3 className="text-2xl md:text-3xl font-serif text-[#081A0D]">
                                    {lightboxTitle}
                                </h3>
                            </div>

                            <div className="bg-white p-6 w-full h-full flex items-center justify-center rounded-b-3xl overflow-hidden">
                                <img
                                    src={lightboxImage}
                                    alt={`${lightboxTitle} layout large view`}
                                    className="max-w-full max-h-[80vh] object-contain"
                                />
                            </div>

                            <p className="mt-6 text-[#fdfaf1] text-center text-sm bg-[#081A0D]/50 px-6 py-3 rounded-full">
                                Click outside or press ESC to close
                            </p>
                        </div>
                    </div>
                )}

                {/* CTA Section */}
                <section className="relative py-24 overflow-hidden bg-[#081A0D]">
                    {/* Content */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center max-w-3xl mx-auto">
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#fdfaf1] mb-6 leading-tight">
                                Ready to invest in your{" "}
                                <span className="italic">future?</span>
                            </h2>
                            <p className="text-xl md:text-2xl text-[#fdfaf1]/90 mb-10 leading-relaxed">
                                Schedule a free tour and let us help you
                                discover the ideal property for your future
                                development plans and investment goals.
                            </p>
                            <Link
                                to="/contact"
                                className="inline-flex items-center gap-3 bg-[#fdfaf1] hover:bg-[#fdfaf1]/90 text-[#081A0D] py-5 px-10 rounded-2xl transition-all duration-300 font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-105"
                            >
                                Book a Free Tour Trip
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />

            {/* Add animation keyframes for the lightbox */}
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                @keyframes scaleIn {
                    from {
                        transform: scale(0.9);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out forwards;
                }
            `}</style>
        </>
    );
}
