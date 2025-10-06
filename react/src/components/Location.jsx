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
    <section className="py-24 lg:py-32 bg-[#fdfaf1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-20">
          <div className="inline-block mb-3">
            <span className="text-[#081A0D]/60 text-sm font-semibold tracking-wider uppercase">
              Visit Our Office
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif text-[#081A0D] mb-8 max-w-4xl">
            Find Us <span className="italic">Here</span>
          </h2>
        </div>

        {/* Stack on mobile, grid on larger screens */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Image Gallery */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl w-full h-[250px] sm:h-[350px] md:h-[400px] lg:h-[500px] bg-[#081A0D]">
            {/* Main Image */}
            <div className="absolute inset-0">
              <img
                src={images[currentImageIndex].src}
                alt={images[currentImageIndex].alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#081A0D]/90 to-transparent px-4 py-4 sm:p-6">
                <p className="text-[#fdfaf1] text-lg sm:text-xl font-medium">
                  {images[currentImageIndex].caption}
                </p>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="absolute inset-0 flex items-center justify-between px-3 sm:px-4">
              <button
                onClick={prevImage}
                className="bg-[#fdfaf1] hover:bg-white rounded-full p-2 sm:p-3 text-[#081A0D] cursor-pointer shadow-lg transition-all hover:scale-110"
                aria-label="Previous image"
              >
                <ChevronLeft size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={nextImage}
                className="bg-[#fdfaf1] hover:bg-white rounded-full p-2 sm:p-3 text-[#081A0D] cursor-pointer shadow-lg transition-all hover:scale-110"
                aria-label="Next image"
              >
                <ChevronRight size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Image Indicators */}
            <div className="absolute bottom-12 sm:bottom-16 left-0 right-0 flex justify-center gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentImageIndex
                      ? "bg-[#fdfaf1] w-8"
                      : "bg-[#fdfaf1]/50 w-2"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Location Details */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 lg:p-12 shadow-2xl border border-[#081A0D]/5 w-full">
            <h3 className="text-3xl lg:text-4xl font-serif text-[#081A0D] mb-8">
              How to Reach Us
            </h3>

            <div className="space-y-6 sm:space-y-8">
              {/* Address */}
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="w-12 h-12 bg-[#081A0D] rounded-2xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-[#fdfaf1] w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-xl sm:text-2xl mb-2 text-[#081A0D]">
                    Address
                  </h4>
                  <p className="text-[#081A0D]/70 text-base sm:text-lg leading-relaxed">
                    STA EVERGREEN 97, Pecson Ville Subdivision,
                  </p>
                  <p className="text-[#081A0D]/70 text-base sm:text-lg leading-relaxed">
                    Tungkong Mangga, San Jose Del Monte, 3023, Bulacan
                  </p>
                  <p className="text-[#081A0D]/70 text-base sm:text-lg leading-relaxed">
                    North Luzon, Philippines
                  </p>
                </div>
              </div>

              {/* Office Hours */}
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="w-12 h-12 bg-[#081A0D] rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Clock className="text-[#fdfaf1] w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-xl sm:text-2xl mb-2 text-[#081A0D]">
                    Office Hours
                  </h4>
                  <p className="text-[#081A0D]/70 text-base sm:text-lg leading-relaxed">
                    Monday to Friday: 8:00 AM - 5:00 PM
                  </p>
                  <p className="text-[#081A0D]/70 text-base sm:text-lg leading-relaxed">
                    Saturday, Sunday: Closed
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="w-12 h-12 bg-[#081A0D] rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Phone className="text-[#fdfaf1] w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-xl sm:text-2xl mb-2 text-[#081A0D]">
                    Contact
                  </h4>
                  <p className="text-[#081A0D]/70 text-base sm:text-lg leading-relaxed">
                    Phone: 276173787
                  </p>
                  <p className="text-[#081A0D]/70 text-base sm:text-lg leading-relaxed">
                    Email:{" "}
                    <a
                      href="mailto:evergreenrealty2020@gmail.com"
                      className="text-[#081A0D] hover:underline font-medium"
                    >
                      evergreenrealty2020@gmail.com
                    </a>
                  </p>
                </div>
              </div>

              {/* Directions */}
              <div className="pt-6 border-t border-[#081A0D]/10">
                <h4 className="font-bold text-xl sm:text-2xl mb-3 text-[#081A0D]">
                  Directions
                </h4>
                <p className="text-[#081A0D]/70 text-base sm:text-lg mb-6 leading-relaxed">
                  From SM Tungko, walk towards Petron gas station near Brigino
                  Hospital. Continue straight until you reach the first street
                  on the front. Evergreen Office is located in the white
                  building on that middle street.
                </p>
                <a
                  href="https://maps.app.goo.gl/Ukomqa5fgGyoa2mQ7"
                  target="_blank"
                  className="inline-flex items-center gap-3 bg-[#081A0D] hover:bg-[#081A0D]/90 text-[#fdfaf1] px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-base sm:text-lg"
                >
                  <MapPin className="w-5 h-5" />
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
