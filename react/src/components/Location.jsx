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
    <section className="py-16 md:py-24 bg-green-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          Find Us <span className="text-green-300">Here</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Image Gallery */}
          <div className="relative rounded-lg overflow-hidden shadow-2xl h-[350px] md:h-[450px] lg:h-[500px]">
            {/* Main Image */}
            <div className="absolute inset-0 bg-black">
              <img
                src={images[currentImageIndex].src}
                alt={images[currentImageIndex].alt}
                className="w-full h-full object-cover opacity-95"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <p className="text-white text-lg">
                  {images[currentImageIndex].caption}
                </p>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="absolute inset-0 flex items-center justify-between px-4">
              <button
                onClick={prevImage}
                className="bg-green-700/80 hover:bg-green-600 rounded-full p-2 text-white"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextImage}
                className="bg-green-700/80 hover:bg-green-600 rounded-full p-2 text-white"
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Image Indicators */}
            <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImageIndex
                      ? "bg-green-300 w-4"
                      : "bg-white/50"
                  } transition-all`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Location Details */}
          <div className="bg-green-700/40 rounded-lg p-8 shadow-xl">
            <h3 className="text-3xl font-bold mb-6 text-green-300">
              How to Reach Us
            </h3>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="text-green-300 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-xl mb-1">Address</h4>
                  <p className="text-green-100">123 Evergreen Road</p>
                  <p className="text-green-100">Norzagaray, Bulacan</p>
                  <p className="text-green-100">Philippines</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="text-green-300 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-xl mb-1">Office Hours</h4>
                  <p className="text-green-100">
                    Monday to Friday: 8:00 AM - 5:00 PM
                  </p>
                  <p className="text-green-100">Saturday: 8:00 AM - 12:00 PM</p>
                  <p className="text-green-100">Sunday: Closed</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="text-green-300 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-xl mb-1">Contact</h4>
                  <p className="text-green-100">Phone: (123) 456-7890</p>
                  <p className="text-green-100">
                    Email: info@evergreenfarms.com
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <h4 className="font-bold text-xl mb-2">Directions</h4>
                <p className="text-green-100 mb-4">
                  From Manila, take the North Luzon Expressway (NLEX) and exit
                  at Sta. Rita. Continue onto Plaridel Bypass Road then follow
                  signs to Norzagaray. Our office is located 2km past the town
                  center.
                </p>
                <button className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-md font-medium transition-colors inline-flex items-center gap-2">
                  <MapPin size={18} />
                  Get Directions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
