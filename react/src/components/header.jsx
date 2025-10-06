import { Menu, X } from "lucide-react";
import EvergreenLogo from "../assets/Evergreen Logo .png";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const location = useLocation();

    // Detect if mobile and track scroll position
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        // Initial check
        checkIfMobile();

        // Add event listeners
        window.addEventListener("resize", checkIfMobile);
        window.addEventListener("scroll", handleScroll);

        // Clean up
        return () => {
            window.removeEventListener("resize", checkIfMobile);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // Scroll to top when route changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return (
        <>
            {/* Invisible spacer div that matches header height */}
            <div className="h-16"></div>

            <header
                className={`evergreen-header py-4 fixed w-full top-0 z-50 transition-all duration-300 ${
                    isMobile
                        ? "bg-[#fdfaf1] shadow-md"
                        : isScrolled
                        ? "bg-[#fdfaf1]/95 backdrop-blur-md shadow-md"
                        : "bg-[#fdfaf1]"
                }`}
            >
                <nav className="evergreen-nav max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="evergreen-logo font-bold text-2xl text-[#081A0D]"
                    >
                        <img
                            src={EvergreenLogo}
                            alt="Evergreen Logo"
                            className="w-16 h-16"
                        />
                    </Link>

                    {/* Hamburger Menu - Show ONLY on small screens */}
                    <button
                        className="evergreen-menu-btn md:hidden z-50"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>

                    {/* Mobile Menu */}
                    {isMenuOpen && (
                        <div className="evergreen-mobile-menu fixed inset-0 bg-[#fdfaf1] md:hidden z-40">
                            <div className="flex flex-col items-center justify-center h-full">
                                <ul className="flex flex-col gap-8 font-medium text-center">
                                    <li>
                                        <Link
                                            to="/about"
                                            className="text-[#081A0D] hover:opacity-70 text-2xl transition-opacity"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            About
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/sell-your-land"
                                            className="text-[#081A0D] hover:opacity-70 text-2xl transition-opacity"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Sell Your Land
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/contact"
                                            className="text-[#081A0D] hover:opacity-70 text-2xl transition-opacity"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Contact
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/login"
                                            className="bg-[#081A0D] hover:bg-[#081A0D]/90 text-[#fdfaf1] px-6 py-3 rounded-lg transition-colors text-xl font-semibold"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Login
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Desktop Navigation Links */}
                    <ul className="evergreen-desktop-menu !hidden md:!flex !items-center gap-8 text-[#081A0D] font-semibold">
                        <li>
                            <Link
                                to="/about"
                                className="hover:opacity-70 transition-opacity"
                            >
                                About
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/sell-your-land"
                                className="hover:opacity-70 transition-opacity"
                            >
                                Lands for Sale
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/contact"
                                className="hover:opacity-70 transition-opacity"
                            >
                                Contact
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/login"
                                className="bg-[#081A0D] hover:bg-[#081A0D]/90 text-[#fdfaf1] px-5 py-3 rounded-lg transition-colors font-semibold"
                            >
                                login
                            </Link>
                        </li>
                    </ul>
                </nav>
            </header>
        </>
    );
}
