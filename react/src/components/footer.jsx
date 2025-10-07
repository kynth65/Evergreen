import { Facebook, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-[#081A0D] text-[#fdfaf1] py-20 lg:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-16">
                    {/* Brand Section */}
                    <div className="lg:col-span-5">
                        <h2 className="text-4xl lg:text-5xl xl:text-6xl font-serif mb-6">
                            Evergreen Realty PH
                        </h2>
                        <p className="text-xl lg:text-2xl text-[#fdfaf1]/70 leading-relaxed max-w-xl">
                            Your trusted partner in finding the perfect piece of
                            land for your dreams.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="lg:col-span-3">
                        <h3 className="text-2xl lg:text-3xl font-serif mb-6">
                            Explore
                        </h3>
                        <ul className="space-y-4">
                            <li>
                                <a
                                    href="/about"
                                    className="text-xl lg:text-2xl text-[#fdfaf1]/80 hover:text-[#fdfaf1] transition-colors"
                                >
                                    About Us
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/sell-your-land"
                                    className="text-xl lg:text-2xl text-[#fdfaf1]/80 hover:text-[#fdfaf1] transition-colors"
                                >
                                    Land Listings
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/contact"
                                    className="text-xl lg:text-2xl text-[#fdfaf1]/80 hover:text-[#fdfaf1] transition-colors"
                                >
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="lg:col-span-4">
                        <h3 className="text-2xl lg:text-3xl font-serif mb-6">
                            Get in Touch
                        </h3>
                        <div className="space-y-5">
                            <div className="flex items-center gap-4">
                                <Phone className="w-6 h-6 text-[#fdfaf1]/60" />
                                <span className="text-xl lg:text-2xl text-[#fdfaf1]/80">
                                    276173787
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <Mail className="w-6 h-6 text-[#fdfaf1]/60" />
                                <a
                                    href="mailto:evergreenrealty2020@gmail.com"
                                    className="text-xl lg:text-2xl text-[#fdfaf1]/80 hover:text-[#fdfaf1] transition-colors"
                                >
                                    evergreenrealty2020@gmail.com
                                </a>
                            </div>
                            <div className="flex items-start gap-4">
                                <MapPin className="w-6 h-6 text-[#fdfaf1]/60 mt-1" />
                                <span className="text-xl lg:text-2xl text-[#fdfaf1]/80">
                                    Tungko, San Jose Del Monte Bulacan
                                </span>
                            </div>
                            <div className="pt-2">
                                <a
                                    href="https://www.facebook.com/evergreenrealtyph/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-3 text-xl lg:text-2xl text-[#fdfaf1]/80 hover:text-[#fdfaf1] transition-colors"
                                >
                                    <Facebook className="w-7 h-7" />
                                    <span>Follow us on Facebook</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-[#fdfaf1]/20 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-lg lg:text-xl text-[#fdfaf1]/60">
                            &copy; {new Date().getFullYear()} Evergreen Realty
                            PH. All rights reserved.
                        </p>
                        <p className="text-lg lg:text-xl text-[#fdfaf1]/60">
                            Making land ownership accessible for everyone.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
