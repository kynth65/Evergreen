import { Menu, X } from "lucide-react";
import EvergreenLogo from "../assets/Evergreen Logo .png";
import { useState, useEffect } from "react";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`font-grotesk py-4 sticky top-0 z-50 transition-all duration-300 ${
                isScrolled
                    ? "bg-white/70 backdrop-blur-md shadow-lg"
                    : "bg-transparent"
            }`}
        >
            <nav className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Logo */}
                <div className="font-grotesk font-bold text-2xl">
                    <img src={EvergreenLogo} alt="" className="w-16 h-16" />
                </div>

                {/* Hamburger Menu - Show on mobile, hide on lg screens */}
                <button
                    className="lg:hidden z-50"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <Menu className="w-6 h-6" />
                    )}
                </button>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="fixed inset-0 bg-white/95 backdrop-blur-sm lg:hidden z-40">
                        <div className="flex flex-col items-center justify-center h-full">
                            <ul className="flex flex-col gap-8 font-grotesk font-medium text-center">
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-gray-600 text-2xl"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        About
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-gray-600 text-2xl"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Services
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-gray-600 text-2xl"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Contact
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Desktop Navigation Links */}
                <ul className="hidden lg:flex gap-8 font-grotesk font-medium">
                    <li>
                        <a href="#" className="hover:text-gray-600 text-lg">
                            About
                        </a>
                    </li>
                    <li>
                        <a href="#" className="hover:text-gray-600 text-lg">
                            Land
                        </a>
                    </li>
                    <li>
                        <a href="#" className="hover:text-gray-600 text-lg">
                            Contact
                        </a>
                    </li>
                </ul>
            </nav>
        </header>
    );
}
