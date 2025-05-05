import React from "react";
import {
  ShieldCheck,
  HandCoins,
  CalendarClock,
  BanknoteIcon,
  MapPin,
} from "lucide-react";

export default function FeatureHighlights() {
  const features = [
    {
      icon: <ShieldCheck className="h-10 w-10 text-green-600" />,
      title: "Reliable Service",
      description:
        "Trust in our expertise with years of experience in farmland sales",
    },
    {
      icon: <HandCoins className="h-10 w-10 text-green-600" />,
      title: "Easy Transactions",
      description:
        "Simplified paperwork and smooth processing from start to finish",
    },
    {
      icon: <CalendarClock className="h-10 w-10 text-green-600" />,
      title: "5-Year Installment Plans",
      description: "Flexible payment options to suit your financial situation",
    },
    {
      icon: <BanknoteIcon className="h-10 w-10 text-green-600" />,
      title: "Zero Interest",
      description: "No hidden fees or interest charges on installment plans",
    },
    {
      icon: <MapPin className="h-10 w-10 text-green-600" />,
      title: "Free Site Visits",
      description:
        "Experience your future investment with complimentary guided tours",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-semibold mb-4">
            Why Choose Evergreen
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6 font-grotesk">
            Land Ownership <span className="text-green-700">Made Simple</span>
          </h2>
          <p className="max-w-2xl mx-auto text-xl text-gray-600">
            At Evergreen, we're committed to making farmland ownership
            accessible with transparent terms and exceptional service.
          </p>
          <div className="h-1 w-24 bg-green-600 mt-8 mx-auto"></div>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center"
            >
              <div className="p-3 bg-green-50 rounded-full mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center mt-12">
          <a
            href="https://www.facebook.com/messages/t/101861274821233"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#278336] text-white py-3 px-8 rounded-lg hover:bg-green-600 transition-colors font-medium shadow-md"
          >
            Learn More About Our Process
          </a>
        </div>
      </div>
    </section>
  );
}
