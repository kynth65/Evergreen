import React from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import {
    HandshakeIcon,
    DollarSign,
    Clock,
    FileCheck,
    ArrowRight,
} from "lucide-react";
import CTABackground from "../assets/homepage/dark-closeup-shot-house.png";

export default function SellYourLand() {
    const benefits = [
        {
            icon: DollarSign,
            title: "Best Market Value",
            description:
                "We offer competitive prices based on current market rates and land potential.",
        },
        {
            icon: Clock,
            title: "Fast Transactions",
            description:
                "Quick and hassle-free process to get your land sold without delays.",
        },
        {
            icon: FileCheck,
            title: "Legal Assistance",
            description:
                "Complete support with documentation and legal requirements.",
        },
        {
            icon: HandshakeIcon,
            title: "Trusted Partner",
            description:
                "Professional service with transparent dealings and ethical practices.",
        },
    ];

    const steps = [
        {
            number: "01",
            title: "Contact Us",
            description:
                "Reach out to our team with details about your property.",
        },
        {
            number: "02",
            title: "Property Assessment",
            description:
                "We'll visit and evaluate your land's potential and market value.",
        },
        {
            number: "03",
            title: "Receive Offer",
            description:
                "Get a fair and competitive offer based on our assessment.",
        },
        {
            number: "04",
            title: "Complete Transaction",
            description:
                "Finalize paperwork and receive payment for your property.",
        },
    ];

    return (
        <>
            <Header />
            <main className="bg-[#fdfaf1] min-h-screen">
                {/* Hero Section */}
                <section className="py-20 md:py-28 lg:py-32 relative overflow-hidden">
                    <div className="px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
                        <div className="text-center max-w-5xl mx-auto">
                            <div className="inline-block bg-[#081A0D] text-[#fdfaf1] px-6 py-2 rounded-full text-sm lg:text-base font-semibold mb-8 uppercase tracking-wider">
                                Sell With Confidence
                            </div>
                            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif text-[#081A0D] mb-8 leading-tight">
                                Sell Your{" "}
                                <span className="italic">Land to Us</span>
                            </h1>
                            <p className="text-xl md:text-2xl lg:text-3xl text-[#081A0D]/70 mb-10 leading-relaxed">
                                Looking to sell your farmland or property?
                                Evergreen Realty PH offers a straightforward,
                                transparent process with fair market prices.
                            </p>
                            <a
                                href="https://www.facebook.com/messages/t/101861274821233"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 bg-[#081A0D] hover:bg-[#081A0D]/90 text-[#fdfaf1] text-lg lg:text-xl py-5 px-10 rounded-2xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                            >
                                Get Started Today
                                <ArrowRight className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </section>

                {/* Why Choose Us Section */}
                <section className="py-20 lg:py-28 bg-[#081A0D]">
                    <div className="px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
                        <div className="mb-16">
                            <div className="inline-block mb-4">
                                <span className="text-[#fdfaf1]/70 text-sm lg:text-base font-semibold tracking-wider uppercase">
                                    Why Sell To Us
                                </span>
                            </div>
                            <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif text-[#fdfaf1] mb-6 max-w-4xl">
                                Your Benefits{" "}
                                <span className="italic">Matter</span>
                            </h2>
                            <p className="text-xl md:text-2xl lg:text-3xl text-[#fdfaf1]/70 max-w-3xl leading-relaxed">
                                We make selling your land easy, fair, and
                                rewarding.
                            </p>
                        </div>

                        {/* Asymmetric Grid */}
                        <div className="space-y-6">
                            {/* First Row - 2 Cards */}
                            <div className="grid lg:grid-cols-2 gap-6">
                                {benefits.slice(0, 2).map((benefit, index) => {
                                    const Icon = benefit.icon;
                                    return (
                                        <div
                                            key={index}
                                            className="bg-[#fdfaf1] p-10 lg:p-14 rounded-3xl hover:shadow-2xl transition-all duration-300 group"
                                        >
                                            <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                                                <Icon className="h-12 w-12 lg:h-14 lg:w-14 text-[#081A0D]" />
                                            </div>
                                            <h3 className="text-3xl lg:text-4xl font-serif text-[#081A0D] mb-4">
                                                {benefit.title}
                                            </h3>
                                            <p className="text-lg lg:text-xl text-[#081A0D]/70 leading-relaxed">
                                                {benefit.description}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Second Row - 2 Cards */}
                            <div className="grid lg:grid-cols-2 gap-6">
                                {benefits.slice(2, 4).map((benefit, index) => {
                                    const Icon = benefit.icon;
                                    return (
                                        <div
                                            key={index}
                                            className="bg-[#fdfaf1] p-10 lg:p-14 rounded-3xl hover:shadow-2xl transition-all duration-300 group"
                                        >
                                            <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                                                <Icon className="h-12 w-12 lg:h-14 lg:w-14 text-[#081A0D]" />
                                            </div>
                                            <h3 className="text-3xl lg:text-4xl font-serif text-[#081A0D] mb-4">
                                                {benefit.title}
                                            </h3>
                                            <p className="text-lg lg:text-xl text-[#081A0D]/70 leading-relaxed">
                                                {benefit.description}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-20 lg:py-28 bg-[#fdfaf1]">
                    <div className="px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
                        <div className="mb-16">
                            <div className="inline-block mb-4">
                                <span className="text-[#081A0D]/60 text-sm lg:text-base font-semibold tracking-wider uppercase">
                                    Simple Process
                                </span>
                            </div>
                            <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif text-[#081A0D] mb-6 max-w-4xl">
                                How It <span className="italic">Works</span>
                            </h2>
                            <p className="text-xl md:text-2xl lg:text-3xl text-[#081A0D]/60 max-w-3xl leading-relaxed">
                                Four simple steps to sell your land with ease.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {steps.map((step, index) => (
                                <div
                                    key={index}
                                    className="bg-[#081A0D] p-8 lg:p-10 rounded-3xl hover:shadow-2xl transition-all duration-300 group"
                                >
                                    <div className="text-6xl lg:text-7xl font-serif text-[#fdfaf1] mb-5">
                                        {step.number}
                                    </div>
                                    <h3 className="text-2xl lg:text-3xl font-serif text-[#fdfaf1] mb-4">
                                        {step.title}
                                    </h3>
                                    <p className="text-base lg:text-lg text-[#fdfaf1]/80 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="relative py-24 lg:py-32 overflow-hidden">
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
                    <div className="px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-10">
                        <div className="text-center max-w-4xl mx-auto">
                            <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif text-[#fdfaf1] mb-6 leading-tight">
                                Ready to{" "}
                                <span className="italic">Sell Your Land?</span>
                            </h2>
                            <p className="text-xl md:text-2xl lg:text-3xl text-[#fdfaf1]/90 mb-10 leading-relaxed">
                                Contact us today for a free property assessment
                                and get a fair offer for your land.
                            </p>
                            <a
                                href="https://www.facebook.com/messages/t/101861274821233"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 bg-[#fdfaf1] hover:bg-[#fdfaf1]/90 text-[#081A0D] py-5 px-10 rounded-2xl transition-all duration-300 font-semibold text-lg lg:text-xl shadow-xl hover:shadow-2xl hover:scale-105"
                            >
                                Contact Us Now
                                <ArrowRight className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
