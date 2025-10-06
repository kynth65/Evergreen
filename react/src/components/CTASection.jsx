import React from "react";
import CTABackground from "../assets/homepage/dark-closeup-shot-house.png";

export default function CTASection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${CTABackground})`,
        }}
      />
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-[#081A0D]/85" />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-[#fdfaf1] mb-6 leading-tight font-playfair">
            Start Building Your Dream Land Investment Today
          </h2>
          <p className="text-xl md:text-2xl text-[#fdfaf1]/90 mb-10">
            Contact us for personalized assistance and land consultation with Evergreen Realty PH.
          </p>
          <a
            href="https://www.facebook.com/messages/t/101861274821233"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#fdfaf1] hover:bg-[#fdfaf1]/90 text-[#081A0D] py-4 px-10 rounded-lg transition-colors font-bold text-lg shadow-xl"
          >
            Schedule a Visit
          </a>
        </div>
      </div>
    </section>
  );
}
