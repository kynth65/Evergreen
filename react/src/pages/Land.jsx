import React from "react";
import Matitic from "../assets/Matictic.png";
import { MapPin, Square, CheckCircle } from "lucide-react";

const Header = () => {
  return (
    <div className="w-full bg-[#384438] py-10">
      <h1 className="text-4xl md:text-5xl text-center font-bold text-white">
        Available Lands
      </h1>
    </div>
  );
};

const Land = () => {
  const properties = [
    {
      id: 1,
      title: "Matictic, Norzagaray",
      price: "₱5,000",
      area: "500 sq.m.",
      image: Matitic,
      features: [
        "Complete Documents",
        "Flat Land",
        "Water and electricity ready",
        "Ideal for private rest house/small farming",
        "Ready for development",
      ],
      location: "Matictic, Norzagaray",
    },
    {
      id: 2,
      title: "San Mateo, Norzagaray",
      price: "₱9,000",
      area: "1,000 sq.m.",
      image: "/api/placeholder/800/600",
      features: ["Complete Documents", "Ready for development"],
      location: "San Mateo, Norzagaray",
    },
  ];

  return (
    <>
      <Header />
      <div className="bg-[#384438] min-h-screen">
        {properties.map((property, index) => (
          <section key={property.id} className="h-screen">
            <div className="max-w-7xl mx-auto px-6 h-full">
              <div
                className={`flex flex-col ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                } items-center gap-12 h-full py-8`}
              >
                {/* Image Section */}
                <div className="w-full md:w-2/3">
                  <div className="h-[70vh] md:h-[80vh] relative">
                    <div className="absolute top-4 left-4 bg-white px-6 py-3 rounded-lg shadow-lg z-10">
                      <p className="text-xl font-bold text-[#384438]">
                        {property.price} Per Month Only!
                      </p>
                    </div>
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-full object-cover rounded-lg shadow-xl"
                    />
                  </div>
                </div>

                {/* Info Section */}
                <div className="w-full md:w-1/3 space-y-8">
                  <h2 className="text-4xl md:text-5xl font-bold leading-tight text-white">
                    {property.title}
                  </h2>

                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 space-y-8 border border-white/20">
                    <div>
                      <h3 className="text-sm text-gray-300 mb-2 uppercase tracking-wider">
                        Land Area
                      </h3>
                      <p className="text-xl font-medium text-white">
                        {property.area}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm text-gray-300 mb-2 uppercase tracking-wider">
                        Features
                      </h3>
                      <ul className="space-y-3 text-lg text-white">
                        {property.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-sm text-gray-300 mb-2 uppercase tracking-wider">
                        Location
                      </h3>
                      <p className="text-xl font-medium text-white">
                        {property.location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
    </>
  );
};

export default Land;
