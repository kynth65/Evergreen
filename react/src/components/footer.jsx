import { Facebook, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-[#384438] text-white py-12">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Contact Information */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-medium mb-6">Contact Us</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5" />
                                <span>276173787</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5" />
                                <a
                                    href="mailto:evergreenrealty2020@gmail.com"
                                    className="hover:text-gray-300 transition-colors"
                                >
                                    evergreenrealty2020@gmail.com
                                </a>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 mt-1" />
                                <span>Bigte, Norzagaray, Bulacan</span>
                            </div>
                        </div>
                    </div>

                    {/* Social Media & Additional Info */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-medium mb-6">Follow Us</h3>
                        <div className="flex">
                            <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-gray-300 transition-colors"
                            >
                                <Facebook className="w-6 h-6 mr-2" />
                            </a>
                            <a href="">Evergreen Realty Philippines</a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-600 mt-12 pt-8 text-center text-sm text-gray-400">
                    <p>
                        &copy; {new Date().getFullYear()} Evergreen. All rights
                        reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
