import React from "react";
import AerialShot from "../assets/homepage/earial-shot-house.png";
import ForestShot from "../assets/homepage/forest-shot.png";
import DarkAerialForest from "../assets/homepage/dark-aerial-shot-forest.png";
import CloseHouseForest from "../assets/homepage/close-house-forest-shot.png";
import InsideHousePOV from "../assets/homepage/inside-house-pov.png";

export default function LandGallery() {
    return (
        <section className="py-24 lg:py-32 bg-[#081A0D]">
            <div className="px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
                {/* Section Header */}
                <div className="mb-20 max-w-5xl">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#fdfaf1] mb-8">
                        Find the Best Land of Your Dreams
                    </h2>
                    <p className="text-xl md:text-2xl lg:text-3xl text-[#fdfaf1]/60 max-w-4xl leading-relaxed">
                        Invest in your future with premium land properties in
                        the heart of nature.
                    </p>
                </div>

                <div className="space-y-12">
                    {/* Hero Image with Overlay Text */}
                    <div className="relative h-[70vh] lg:h-[80vh] rounded-3xl overflow-hidden group">
                        <img
                            src={AerialShot}
                            alt="Aerial view of property"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end">
                            <div className="p-8 lg:p-16 xl:p-20 max-w-6xl">
                                <blockquote className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif text-white leading-tight mb-4">
                                    "Land is the only thing in the world worth
                                    working for."
                                </blockquote>
                                <p className="text-lg md:text-xl lg:text-2xl text-white/80">
                                    Invest in something permanent, invest in
                                    land.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Split Layout - 2 Images with Text */}
                    <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
                        {/* Left - Image with Text Overlay */}
                        <div className="relative h-[60vh] lg:h-[70vh] rounded-3xl overflow-hidden group">
                            <img
                                src={ForestShot}
                                alt="Forest landscape"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                                <div className="p-8 lg:p-12 xl:p-16">
                                    <h3 className="text-2xl lg:text-3xl xl:text-4xl font-serif text-white leading-tight">
                                        "Own a piece of paradise where nature
                                        meets opportunity."
                                    </h3>
                                </div>
                            </div>
                        </div>

                        {/* Right - Text Block */}
                        <div className="bg-[#fdfaf1] rounded-3xl p-10 lg:p-16 xl:p-20 flex flex-col justify-center">
                            <h3 className="text-3xl lg:text-4xl xl:text-5xl font-serif text-[#081A0D] mb-6 leading-tight">
                                Your legacy starts with the land you choose
                                today.
                            </h3>
                            <p className="text-lg lg:text-xl xl:text-2xl text-[#081A0D]/60 leading-relaxed">
                                Every great journey begins with a single piece
                                of land. Make yours count.
                            </p>
                        </div>
                    </div>

                    {/* Asymmetric 3-Column Grid */}
                    <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                        {/* Large Card - Spans 2 Columns */}
                        <div className="lg:col-span-2 relative h-[50vh] lg:h-[70vh] rounded-3xl overflow-hidden group">
                            <img
                                src={CloseHouseForest}
                                alt="House in forest"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-transparent flex items-center">
                                <div className="p-8 lg:p-16 xl:p-20 max-w-4xl">
                                    <blockquote className="text-3xl lg:text-4xl xl:text-5xl font-serif text-white leading-tight">
                                        "Build your dream home surrounded by
                                        nature's beauty."
                                    </blockquote>
                                </div>
                            </div>
                        </div>

                        {/* Small Card */}
                        <div className="relative h-[50vh] lg:h-[70vh] rounded-3xl overflow-hidden group">
                            <img
                                src={DarkAerialForest}
                                alt="Aerial forest view"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-black/40"></div>
                        </div>
                    </div>

                    {/* Full Width Quote Banner */}
                    <div className="bg-[#fdfaf1] rounded-3xl p-12 lg:p-20 xl:p-24 text-center">
                        <blockquote className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif text-[#081A0D] leading-tight mb-6 max-w-6xl mx-auto">
                            "The best investment on Earth is Earth itself."
                        </blockquote>
                        <p className="text-xl md:text-2xl lg:text-3xl text-[#081A0D]/60 max-w-4xl mx-auto">
                            Secure your future with land that grows in value.
                        </p>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="mt-20 text-center">
                    <h3 className="text-3xl lg:text-4xl xl:text-5xl font-serif text-[#fdfaf1] mb-8">
                        Ready to Find Your Perfect Land?
                    </h3>
                    <a
                        href="https://www.facebook.com/messages/t/101861274821233"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 bg-[#fdfaf1] hover:bg-[#fdfaf1]/90 text-[#081A0D] text-lg lg:text-xl py-6 px-12 rounded-2xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                    >
                        Explore Available Properties
                    </a>
                </div>
            </div>
        </section>
    );
}
