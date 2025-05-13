import React from "react";
import BackgroundImage from "../../assets/login-split-image.webp";

export default function LoginSplitImage() {
  return (
    <div className="h-full w-full relative overflow-hidden">
      {/* Background Image */}
      <img
        src={BackgroundImage}
        alt="Mountains and clouds"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay gradient for better text visibility */}
      <div className="absolute inset-0 "></div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-white text-center px-8">
        <h2 className="text-3xl font-bold mb-4">
          Evergreen Realty Philippines
        </h2>
        <p className="text-lg mb-8 max-w-md">Welcome Back</p>

        {/* Feature highlights */}

        {/* Bottom attribution - small and subtle */}
        <div className="absolute bottom-4 left-0 w-full text-center">
          <p className="text-xs text-white/70">Evergreen Realty © 2025</p>
        </div>
      </div>
    </div>
  );
}
