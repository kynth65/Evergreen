import React, { useState, useEffect } from "react";
import { ArrowUpRight, X } from "lucide-react";
import beescapes from "../assets/beescapes layout.jpg";
import beesettings from "../assets/beesettings layout.jpg";
import jaikpark from "../assets/Jaika park layout.jpg";
import juanderland from "../assets/juanderland.png";

export default function FeaturedProjects() {
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
            <section
                id="featured-projects"
                className="py-24 lg:py-32 bg-[#fdfaf1] relative overflow-hidden scroll-mt-20"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-20">
                        <div className="inline-block mb-3">
                            <span className="text-[#081A0D]/60 text-sm font-semibold tracking-wider uppercase">
                                OUR PORTFOLIO
                            </span>
                        </div>
                        <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif text-[#081A0D] mb-8 max-w-4xl">
                            Featured <span className="italic">Projects</span>
                        </h2>
                        <p className="text-2xl md:text-3xl text-[#081A0D]/60 max-w-3xl leading-relaxed">
                            Explore our premium land development projects, each
                            designed with sustainability and future growth in
                            mind.
                        </p>
                    </div>

                    {/* Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                onClick={() =>
                                    openLightbox(project.image, project.title)
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

                    {/* View All Projects Button */}
                    <div className="mt-16 text-center">
                        <a
                            href="https://www.facebook.com/messages/t/101861274821233"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 bg-[#081A0D] hover:bg-[#081A0D]/90 text-[#fdfaf1] text-xl py-5 px-10 rounded-2xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                        >
                            Contact Us for More Details
                            <ArrowUpRight className="w-5 h-5" />
                        </a>
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
