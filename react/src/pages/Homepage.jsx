import React from "react";
import Header from "../components/header";
import Hero from "../components/hero";
import FeaturedProjects from "../components/FeaturedProjects";
import LandGallery from "../components/LandGallery";
import FeatureHighlights from "../components/FeatureHighlights";
import CTASection from "../components/CTASection";
import Footer from "../components/footer";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <FeaturedProjects />
      <LandGallery />
      <FeatureHighlights />
      <CTASection />
      <Footer />
    </>
  );
}
