import React, { useState, useEffect } from "react";
import Header from "../components/header";
import { Link } from "react-router-dom";
import FarmLand from "../assets/Farm Land.png";
import Footer from "../components/footer";
import beescapes from "../assets/beescapes layout.jpg";
import beesettings from "../assets/beesettings layout.jpg";
import jaikpark from "../assets/Jaika park layout.jpg";
import juanderland from "../assets/juanderland.png";
import { X } from "lucide-react"; // Import X icon for close button
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
                  Connecting people with premium farmland since 2020. We believe
                  in sustainable agriculture and preserving natural landscapes
                  for future generations.
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
        <section>
          <Location />
        </section>

        {/* Key Projects Section */}
        <section className="py-16 md:py-24 bg-green-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-5xl font-bold text-green-800 mb-16 text-center">
              Key Projects
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`bg-white rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105 ${
                    project.image ? "cursor-pointer" : ""
                  }`}
                  onClick={() => openLightbox(project.image, project.title)}
                  role={project.image ? "button" : undefined}
                  aria-label={
                    project.image ? `View ${project.title} details` : undefined
                  }
                  tabIndex={project.image ? 0 : undefined}
                >
                  <div className="h-64 bg-green-100 overflow-hidden">
                    {project.image ? (
                      <img
                        src={project.image}
                        alt={`${project.title} layout`}
                        className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-green-200">
                        <span className="text-green-800 font-medium">
                          Image Placeholder
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {project.title}
                    </h3>
                    <p className="text-gray-700">{project.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lightbox Modal */}
        {lightboxImage && (
          <div
            className="fixed inset-0 bg-neutral-800 bg-opacity-80 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <div
              className="relative max-w-full max-h-full flex flex-col items-center"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on content
            >
              <button
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg z-10 cursor-pointer"
                onClick={closeLightbox}
                aria-label="Close lightbox"
              >
                <X className="w-6 h-6 text-gray-800" />
              </button>

              <div className="bg-white px-4 py-2 rounded-t-lg w-full text-center">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                  {lightboxTitle}
                </h3>
              </div>

              <div className="bg-white p-4 w-full h-full flex items-center justify-center rounded-b-lg overflow-hidden">
                <img
                  src={lightboxImage}
                  alt={`${lightboxTitle} layout large view`}
                  className="max-w-full max-h-[80vh] object-contain"
                />
              </div>

              <p className="mt-2 text-white text-center text-sm">
                Click outside or press ESC to close
              </p>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <section className="py-16 bg-green-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to find your perfect farmland?
            </h2>
            <p className="text-xl text-green-50 mb-12 max-w-3xl mx-auto">
              Schedule a free tour and let us help you discover the ideal
              property for your agricultural dreams.
            </p>
            <Link
              to="/contact"
              className="inline-block bg-white text-green-600 hover:bg-gray-100 font-medium px-8 py-4 rounded-md text-lg transition-colors"
            >
              Book a Free Tour Trip
            </Link>
            <p className="text-green-100 mt-6 text-sm">
              By clicking 'Book a Free Tour Trip' you acknowledge that you have
              read and agree to the Terms of Service
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
