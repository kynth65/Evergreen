import React from "react";
import {
    ShieldCheck,
    HandCoins,
    CalendarClock,
    BanknoteIcon,
    MapPin,
} from "lucide-react";

export default function FeatureHighlights() {
    const features = [
        {
            icon: <ShieldCheck className="h-12 w-12 text-[#081A0D]" />,
            title: "Reliable Service",
            description:
                "Trust in our expertise with years of experience in farmland sales",
        },
        {
            icon: <HandCoins className="h-12 w-12 text-[#081A0D]" />,
            title: "Easy Transactions",
            description:
                "Simplified paperwork and smooth processing from start to finish",
        },
        {
            icon: <CalendarClock className="h-12 w-12 text-[#081A0D]" />,
            title: "5-Year Installment Plans",
            description:
                "Flexible payment options to suit your financial situation",
        },
        {
            icon: <BanknoteIcon className="h-12 w-12 text-[#081A0D]" />,
            title: "Zero Interest",
            description:
                "No hidden fees or interest charges on installment plans",
        },
        {
            icon: <MapPin className="h-12 w-12 text-[#081A0D]" />,
            title: "Free Site Visits",
            description:
                "Experience your future investment with complimentary guided tours",
        },
    ];

    return (
        <section className="py-24 lg:py-32 bg-[#fdfaf1]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section header */}
                <div className="mb-20">
                    <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif text-[#081A0D] mb-8 max-w-4xl">
                        Why Choose Evergreen Realty PH
                    </h2>
                    <p className="text-2xl md:text-3xl text-[#081A0D]/60 max-w-3xl leading-relaxed">
                        We're committed to making land ownership accessible with
                        transparent terms and exceptional service.
                    </p>
                </div>

                {/* Modern asymmetric layout */}
                <div className="space-y-6">
                    {/* First row - 2 cards */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white p-10 lg:p-12 rounded-3xl hover:shadow-2xl transition-all duration-300 group border border-[#081A0D]/5">
                            <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                                {features[0].icon}
                            </div>
                            <h3 className="text-3xl lg:text-4xl font-serif text-[#081A0D] mb-4">
                                {features[0].title}
                            </h3>
                            <p className="text-xl text-[#081A0D]/70 leading-relaxed">
                                {features[0].description}
                            </p>
                        </div>

                        <div className="bg-[#081A0D] text-white p-10 lg:p-12 rounded-3xl hover:shadow-2xl transition-all duration-300 group">
                            <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                                <HandCoins className="h-12 w-12 text-white" />
                            </div>
                            <h3 className="text-3xl lg:text-4xl font-serif mb-4">
                                {features[1].title}
                            </h3>
                            <p className="text-xl text-white/80 leading-relaxed">
                                {features[1].description}
                            </p>
                        </div>
                    </div>

                    {/* Second row - 3 cards */}
                    <div className="grid md:grid-cols-3 gap-6">
                        {features.slice(2).map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white p-10 rounded-3xl hover:shadow-2xl transition-all duration-300 group border border-[#081A0D]/5"
                            >
                                <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl lg:text-3xl font-serif text-[#081A0D] mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-lg text-[#081A0D]/70 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Button */}
                <div className="mt-16">
                    <a
                        href="https://www.facebook.com/messages/t/101861274821233"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 bg-[#081A0D] hover:bg-[#081A0D]/90 text-[#fdfaf1] text-xl py-5 px-10 rounded-2xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                    >
                        Learn More About Our Process
                    </a>
                </div>
            </div>
        </section>
    );
}
