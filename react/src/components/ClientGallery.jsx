import React from "react";
import { Users, Star } from "lucide-react";
import ClientSold from "../assets/client sold.jpg";
import ClientSold2 from "../assets/client sold 2.jpg";
import ClientSold3 from "../assets/client sold 3.jpg";

export default function ClientGallery() {
  const clients = [
    {
      id: 1,
      image: ClientSold,
      name: "Client Name",
      location: "Norzagaray, Bulacan",
      testimonial: "Proud Evergreen landowner since 2024",
    },
    {
      id: 2,
      image: ClientSold2,
      name: "Client Name",
      location: "Norzagaray, Bulacan",
      testimonial: "My dream farm is now a reality",
    },
    {
      id: 3,
      image: ClientSold3,
      name: "Client Name",
      location: "Norzagaray, Bulacan",
      testimonial: "Seamless land purchase experience",
    },
  ];

  return (
    <section className="py-16 bg-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-semibold mb-4">
            Our Happy Landowners
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6 font-grotesk">
            Join Our Growing <span className="text-green-700">Community</span>
          </h2>
          <p className="max-w-2xl mx-auto text-xl text-gray-600">
            Meet some of the proud landowners who have invested in their future
            with Evergreen.
          </p>
          <div className="h-1 w-24 bg-green-600 mt-8 mx-auto"></div>
        </div>

        {/* Client photos grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {clients.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={client.image}
                  alt={`${client.name} - Evergreen landowner`}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <div className="flex items-center space-x-1 text-yellow-400 mb-2">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                  <p className="text-white/80 text-sm flex items-center">
                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    {client.location}
                  </p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-700 italic">"{client.testimonial}"</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats banner */}
        <div className="mt-16 bg-green-700 text-white rounded-xl p-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <p>Happy Landowners</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100+</div>
              <p>lots & land Sold</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5</div>
              <p>Years of Excellence</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-xl text-gray-700 mb-6">
            Ready to join our community of satisfied landowners?
          </p>
          <a
            href="https://www.facebook.com/messages/t/101861274821233"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-[#278336] text-white py-3 px-8 rounded-lg hover:bg-green-600 transition-colors font-medium shadow-md"
          >
            <Users className="mr-2 h-5 w-5" />
            Book Your Land Tour Today
          </a>
        </div>
      </div>
    </section>
  );
}
