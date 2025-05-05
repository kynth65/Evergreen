import { Menu, X } from "lucide-react";
import EvergreenLogo from "../assets/Evergreen Logo .png";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

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
    <>
      {/* Invisible spacer div that matches header height */}
      <div className="h-24"></div>{" "}
      {/* This accounts for py-4 (2rem) + h-16 (4rem) */}
      <header
        className={`evergreen-header font-grotesk py-4 fixed w-full top-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-white/70 backdrop-blur-md shadow-lg" : "bg-white/70"
        }`}
      >
        <nav className="evergreen-nav max-w-7xl mx-auto flex justify-between items-center px-4">
          {/* Logo */}
          <Link
            to="/"
            className="evergreen-logo font-grotesk font-bold text-2xl"
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
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="evergreen-mobile-menu fixed inset-0 bg-white/95 backdrop-blur-sm md:hidden z-40">
              <div className="flex flex-col items-center justify-center h-full">
                <ul className="flex flex-col gap-8 font-grotesk font-medium text-center">
                  <li>
                    <Link
                      to="/about"
                      className="hover:text-gray-600 text-2xl"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      About
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/services"
                      className="hover:text-gray-600 text-2xl"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Services
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contact"
                      className="hover:text-gray-600 text-2xl"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/login"
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition-colors text-2xl"
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
          <ul className="evergreen-desktop-menu !hidden md:!flex !items-center gap-8 font-grotesk text-black font-medium">
            <li>
              <Link to="/about" className="hover:text-gray-600 text-lg">
                About
              </Link>
            </li>
            <li>
              <Link
                to="/sell-your-land"
                className="hover:text-gray-600 text-lg"
              >
                Sell Your Land
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-gray-600 text-lg">
                Contact
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Login
              </Link>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}
