import React from "react";
import Header from "../components/header";
import Hero from "../components/hero";
import PropertyHighlight from "../components/PropertyHighlight";
import CustomerFeedback from "../components/CustomerFeedback";
import Footer from "../components/footer";

export default function Home() {
    return (
        <>
            <div className="min-h-screen bg-[#f7fdf7]">
                <Header />
                <Hero />
                <PropertyHighlight />
                <CustomerFeedback />
                <Footer />
            </div>
        </>
    );
}
