import React from "react";
import Header from "../components/header";
import Hero from "../components/hero";
import PropertyHighlight from "../components/PropertyHighlight";
import CustomerFeedback from "../components/CustomerFeedback";
import FeatureHighlights from "../components/FeatureHighlights";
import ClientGallery from "../components/ClientGallery";

import Footer from "../components/footer";

export default function Home() {
  return (
    <>
      <Header />

      <Hero />
      <FeatureHighlights />
      <ClientGallery />

      <Footer />
    </>
  );
}
