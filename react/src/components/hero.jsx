import React from "react";
import HeroImage from "../assets/homepage/house-forest-shot.png";
import { ArrowRight } from "lucide-react";

export default function Hero() {
    return (
        <section className="min-h-screen bg-[#fdfaf1]">
            {/* Text Section - Centered and Above Image */}
            <div className="flex items-center justify-center px-4 py-20 md:py-32">
                <h1 className="text-[#081A0D] text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-serif text-center max-w-6xl leading-tight">
                    Find Your Perfect Piece{" "}
                    <span className="italic">of Land.</span>
                </h1>
            </div>

            {/* Image Section with Overlay */}
            <div className="relative w-full h-[50vh] md:h-[70vh] group overflow-hidden">
                {/* Image */}
                <img
                    src={HeroImage}
                    alt="Forest landscape"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="text-center text-[#fdfaf1] px-4">
                        <p className="text-xl md:text-2xl lg:text-3xl mb-8 font-light">
                            Discover pristine land waiting for you
                        </p>
                        <a
                            href="#featured-projects"
                            className="bg-[#fdfaf1] text-[#081A0D] px-8 py-4 text-lg font-medium hover:bg-opacity-90 transition-all hover:scale-105 flex items-center gap-2 mx-auto"
                        >
                            Explore Properties
                            <ArrowRight className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
