import React, { useState } from "react";
import OfficeLayout from "../assets/Office_Layout.jpg";
import OfficeOutside from "../assets/office_outside.jpg";
import OfficeOutsideWide from "../assets/office_outside_wide.jpg";
import { ChevronLeft, ChevronRight, MapPin, Clock, Phone } from "lucide-react";

export default function Location() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [
    {
      src: OfficeOutsideWide,
      alt: "Evergreen Farms Office Building - Front View",
      caption: "Our main office building",
    },
    {
      src: OfficeOutside,
      alt: "Evergreen Farms Office Entrance",
      caption: "Office entrance",
    },
    {
      src: OfficeLayout,
      alt: "Evergreen Farms Office Layout",
      caption: "Office layout",
    },
  ];

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-green-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-12 lg:mb-16">
          Find Us <span className="text-green-300">Here</span>
        </h2>

        {/* Stack on mobile, grid on larger screens */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Image Gallery - Improved responsiveness */}
          <div className="relative rounded-lg overflow-hidden shadow-2xl w-full h-[250px] sm:h-[350px] md:h-[400px] lg:h-[450px]">
            {/* Main Image */}
            <div className="absolute inset-0 bg-black">
              <img
                src={images[currentImageIndex].src}
                alt={images[currentImageIndex].alt}
                className="w-full h-full object-cover opacity-95"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2 sm:p-4">
                <p className="text-white text-base sm:text-lg">
                  {images[currentImageIndex].caption}
                </p>
              </div>
            </div>

            {/* Navigation Controls - Enlarged for mobile touch */}
            <div className="absolute inset-0 flex items-center justify-between px-2 sm:px-4">
              <button
                onClick={prevImage}
                className="bg-green-700/80 hover:bg-green-600 rounded-full p-1 sm:p-2 text-white cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={nextImage}
                className="bg-green-700/80 hover:bg-green-600 rounded-full p-1 sm:p-2 text-white cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Image Indicators - Better spacing on small screens */}
            <div className="absolute bottom-8 sm:bottom-12 left-0 right-0 flex justify-center gap-1 sm:gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentImageIndex
                      ? "bg-green-300 w-4"
                      : "bg-white/50 w-2"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Location Details - Better spacing and text sizing */}
          <div className="backdrop-blur-md bg-green-700/50 rounded-xl p-5 sm:p-6 md:p-8 shadow-xl border border-white/10 text-white w-full">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-white">
              How to Reach Us
            </h3>

            <div className="space-y-4 sm:space-y-6">
              {/* Address */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <MapPin className="text-green-200 w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-lg sm:text-xl mb-1 text-white">
                    Address
                  </h4>
                  <p className="text-green-50/90 text-sm sm:text-base">
                    STA EVERGREEN 97, Pecson Ville Subdivision,
                  </p>
                  <p className="text-green-50/90 text-sm sm:text-base">
                    Tungkong Mangga, San Jose Del Monte, 3023, Bulacan
                  </p>
                  <p className="text-green-50/90 text-sm sm:text-base">
                    North Luzon, Philippines
                  </p>
                </div>
              </div>

              {/* Office Hours */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <Clock className="text-green-200 w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-lg sm:text-xl mb-1 text-white">
                    Office Hours
                  </h4>
                  <p className="text-green-50/90 text-sm sm:text-base">
                    Monday to Friday: 8:00 AM - 5:00 PM
                  </p>
                  <p className="text-green-50/90 text-sm sm:text-base">
                    Saturday, Sunday: Closed
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <Phone className="text-green-200 w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-lg sm:text-xl mb-1 text-white">
                    Contact
                  </h4>
                  <p className="text-green-50/90 text-sm sm:text-base">
                    Phone: 276173787
                  </p>
                  <p className="text-green-50/90 text-sm sm:text-base">
                    Email:{" "}
                    <a
                      href="mailto:evergreenrealty2020@gmail.com"
                      className="text-green-200 hover:underline"
                    >
                      evergreenrealty2020@gmail.com
                    </a>
                  </p>
                </div>
              </div>

              {/* Directions */}
              <div className="pt-4 border-t border-white/20">
                <h4 className="font-bold text-lg sm:text-xl mb-2 text-white">
                  Directions
                </h4>
                <p className="text-green-50/90 text-sm sm:text-base mb-4">
                  From SM Tungko, walk towards Petron gas station near Brigino
                  Hospital. Continue straight until you reach the first street
                  on the front. Evergreen Office is located in the white
                  building on that middle street.
                </p>
                <a
                  href="https://maps.app.goo.gl/Ukomqa5fgGyoa2mQ7"
                  target="_blank"
                  className="bg-green-600 hover:bg-green-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md font-medium transition-colors inline-flex items-center gap-2 shadow-lg backdrop-blur-sm bg-opacity-80 border border-green-500/30 hover:border-green-400/50 text-sm sm:text-base"
                >
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
