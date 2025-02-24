import React, { useEffect, useRef } from "react";
import Header from "../components/header";
import Hero from "../components/hero";
import PropertyHighlight from "../components/PropertyHighlight";
import CustomerFeedback from "../components/CustomerFeedback";
import Footer from "../components/footer";

const AnimatedSection = ({ children, delay = 0 }) => {
    const elementRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    // Add animation class when element comes into view
                    setTimeout(() => {
                        entry.target.classList.add("animate-fade-up");
                    }, delay);
                    observer.unobserve(entry.target);
                }
            },
            {
                threshold: 0.1, // Trigger when 10% of the element is visible
                rootMargin: "50px", // Start animation slightly before element comes into view
            }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => {
            if (elementRef.current) {
                observer.unobserve(elementRef.current);
            }
        };
    }, [delay]);

    return (
        <div ref={elementRef} className="opacity-0 translate-y-6">
            {children}
        </div>
    );
};

export default function Home() {
    useEffect(() => {
        // Add required animation classes to stylesheet
        const style = document.createElement("style");
        style.textContent = `
      @keyframes fade-up {
        from {
          opacity: 0;
          transform: translateY(40px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-fade-up {
        animation: fade-up 0.8s ease-out forwards;
      }
    `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    return (
        <div className="min-h-screen bg-[#f7fdf7]">
            <Header />

            <div className="mb-40">
                <AnimatedSection delay={200}>
                    <Hero />
                </AnimatedSection>
            </div>

            <AnimatedSection delay={400}>
                <PropertyHighlight />
            </AnimatedSection>

            <AnimatedSection delay={600}>
                <CustomerFeedback />
            </AnimatedSection>

            <AnimatedSection delay={800}>
                <Footer />
            </AnimatedSection>
        </div>
    );
}
