import React, { useState, useEffect } from "react";
import Header from "../components/header";
import { Link } from "react-router-dom";
import FarmLand from "../assets/Farm Land.png";
import Footer from "../components/footer";
import beescapes from "../assets/beescapes layout.jpg";
import beesettings from "../assets/beesettings layout.jpg";
import jaikpark from "../assets/Jaika park layout.jpg";
import juanderland from "../assets/juanderland.png";
import { X, Leaf, Eye, ArrowRight } from "lucide-react"; // Added more icons
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
      <main className="bg-gray-50 min-h-screen ">
        {/* Hero Section - Enhanced with decorative elements and improved layout */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-white to-green-50 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 pt-10 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
            <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-green-500"></div>
            <div className="absolute top-1/3 -right-12 w-48 h-48 rounded-full bg-green-400"></div>
            <div className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full bg-green-300"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div className="relative">
                <div className="inline-block bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-semibold mb-6">
                  Est. 2020
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  About <span className="text-green-700">Evergreen</span> Farms
                </h1>
                <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                  Connecting people with premium farmland since 2020. We believe
                  in sustainable agriculture and preserving natural landscapes
                  for future generations.
                </p>
                <div className="h-1 w-24 bg-green-600 mb-8"></div>
                <div className="flex items-center text-green-700 font-medium">
                  <Leaf className="mr-2 h-5 w-5" />
                  <span>Committed to sustainable land development</span>
                </div>
              </div>
              <div className="mt-12 lg:mt-0 relative">
                <div className="absolute -top-6 -left-6 w-full h-full bg-green-200 rounded-lg transform -rotate-3"></div>
                <img
                  src={FarmLand}
                  alt="Scenic farmland view"
                  className="rounded-lg shadow-xl object-cover h-full w-full relative z-10"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Location Section - Let the component handle its own styling */}
        <section>
          <Location />
        </section>

        {/* Key Projects Section - Enhanced with better cards and visual interest */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-green-50 to-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-green-800 mb-4">
                Key Projects
              </h2>
              <div className="h-1 w-24 bg-green-500 mx-auto mb-6"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Explore our premium land development projects, each designed
                with sustainability and community in mind.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                    project.image ? "cursor-pointer group" : ""
                  }`}
                  onClick={() => openLightbox(project.image, project.title)}
                  role={project.image ? "button" : undefined}
                  aria-label={
                    project.image ? `View ${project.title} details` : undefined
                  }
                  tabIndex={project.image ? 0 : undefined}
                >
                  <div className="h-64 bg-green-100 overflow-hidden relative">
                    {project.image ? (
                      <>
                        <img
                          src={project.image}
                          alt={`${project.title} layout`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-green-900 bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="bg-white rounded-full p-3">
                            <Eye className="w-6 h-6 text-green-800" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-green-200">
                        <span className="text-green-800 font-medium">
                          Image Placeholder
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 border-t border-green-100">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-2xl font-bold text-green-800">
                        {project.title}
                      </h3>
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-green-700" />
                      </div>
                    </div>
                    <p className="text-gray-700">{project.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lightbox Modal - Enhanced with smoother animations */}
        {lightboxImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 animate-fadeIn"
            onClick={closeLightbox}
          >
            <div
              className="relative max-w-full max-h-full flex flex-col items-center animate-scaleIn"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on content
            >
              <button
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg z-10 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={closeLightbox}
                aria-label="Close lightbox"
              >
                <X className="w-6 h-6 text-gray-800" />
              </button>

              <div className="bg-white px-4 py-2 rounded-t-xl w-full text-center">
                <h3 className="text-xl md:text-2xl font-bold text-green-800">
                  {lightboxTitle}
                </h3>
              </div>

              <div className="bg-white p-4 w-full h-full flex items-center justify-center rounded-b-xl overflow-hidden">
                <img
                  src={lightboxImage}
                  alt={`${lightboxTitle} layout large view`}
                  className="max-w-full max-h-[80vh] object-contain"
                />
              </div>

              <p className="mt-4 text-white text-center text-sm bg-black bg-opacity-50 px-4 py-2 rounded-full">
                Click outside or press ESC to close
              </p>
            </div>
          </div>
        )}

        {/* CTA Section - Enhanced with more engaging design */}
        <section className="py-20 bg-gradient-to-br from-green-800 to-green-900 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-32 bg-white opacity-5"></div>
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full border-4 border-green-300 opacity-20"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full border-4 border-green-300 opacity-10"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-block bg-green-700 text-green-100 px-6 py-2 rounded-full text-sm font-bold mb-6 uppercase tracking-wider">
              Take The Next Step
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 max-w-3xl mx-auto leading-tight">
              Ready to find your perfect farmland?
            </h2>
            <p className="text-xl text-green-100 mb-12 max-w-3xl mx-auto">
              Schedule a free tour and let us help you discover the ideal
              property for your agricultural dreams.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center bg-white text-green-700 hover:bg-green-50 font-medium px-8 py-4 rounded-full text-lg transition-all shadow-lg hover:shadow-xl group"
            >
              Book a Free Tour Trip
              <ArrowRight className="ml-2 group-hover:ml-3 transition-all" />
            </Link>
            <p className="text-green-200 mt-6 text-sm max-w-lg mx-auto">
              By clicking 'Book a Free Tour Trip' you acknowledge that you have
              read and agree to the Terms of Service
            </p>
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
