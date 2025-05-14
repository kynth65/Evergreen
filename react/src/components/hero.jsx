import React from "react";
import HeroImage from "../assets/hero photo.jpg";
import ScrollVelocity from "../TextAnimations/ScrollVelocity/ScrollVelocity";
import { Leaf, MapPin } from "lucide-react"; // Import icons

export default function Hero() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-green-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 pt-10 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-green-500"></div>
        <div className="absolute top-1/3 -right-12 w-48 h-48 rounded-full bg-green-400"></div>
        <div className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full bg-green-300"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="relative">
            <div className="inline-block bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-semibold mb-6">
              Premium land
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight font-grotesk">
              Find your Dream Land{" "}
              <span className="text-green-700">
                here in Evergreen Realty PH
              </span>
            </h1>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed max-w-xl">
              We specialize in selling premium land properties. With a deep
              commitment to nature and our clients, we help you find the perfect
              piece of land while preserving our natural heritage.
            </p>
            <div className="h-1 w-24 bg-green-600 mb-8"></div>
            <div className="flex items-center text-green-700 font-medium mb-8">
              <Leaf className="mr-2 h-5 w-5" />
              <span>Committed to sustainable land development</span>
            </div>

            {/* CTA Button */}
            <a
              href="https://www.facebook.com/messages/t/101861274821233"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto bg-[#278336] text-white py-3 px-8 rounded-lg hover:bg-green-600 transition-colors font-medium shadow-md"
            >
              Book a Free Tour Trip
            </a>
          </div>

          {/* Right Content - Image with Location Card */}
          <div className="mt-12 lg:mt-0 relative">
            <div className="absolute -top-6 -left-6 w-full h-full bg-green-200 rounded-lg transform -rotate-3"></div>
            <div className="relative z-10">
              <img
                src={HeroImage}
                alt="Solar Panel Farm"
                className="w-full rounded-lg shadow-xl"
              />

              {/* Location Card - Redesigned */}
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2 mb-2 bg-green-700 text-white py-2 px-4 rounded-md">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">Location</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="font-medium text-gray-800">Norzagaray</div>
                  <div className="text-sm text-gray-600">Bulacan</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
