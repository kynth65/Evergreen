import React from "react";
import { MessageSquare, Phone, Mail, MapPin } from "lucide-react";
import Header from "../components/header";
import Footer from "../components/footer";

export default function ContactUs() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f7fdf7] py-2 pb-20 px-4 sm:px-6 lg:py-2 lg:pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-8 mt-16">
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-6 h-6 text-green-600" />
                <h1 className="text-2xl font-bold text-gray-800">
                  Get In Touch
                </h1>
              </div>
              <p className="text-gray-600">
                We're here to help with any questions about our land properties.
                For the fastest response, message us directly on Facebook
                Messenger.
              </p>
            </div>

            {/* Messenger Card */}
            <div className="bg-blue-50 rounded-lg p-6 mb-8 border border-blue-100">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <svg
                    className="w-16 h-16"
                    viewBox="0 0 36 36"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 0C8.0748 0 0 7.5495 0 16.8613C0 21.7682 2.2449 26.1219 5.99071 29.0704V36L12.7258 32.5484C14.3957 33.0612 16.1618 33.3402 18 33.3402C27.9252 33.3402 36 25.7907 36 16.4789C36 7.16711 27.9252 0 18 0Z"
                      fill="#0084FF"
                    />
                    <path
                      d="M19.9383 22.0656L14.9319 16.6604L5.34961 22.0656L15.9851 10.9512L21.0684 16.3564L30.5738 10.9512L19.9383 22.0656Z"
                      fill="white"
                    />
                  </svg>
                </div>
                <div className="flex-grow text-center md:text-left">
                  <h3 className="text-xl font-semibold text-blue-800 mb-2">
                    Message Us on Facebook
                  </h3>
                  <p className="text-blue-700 mb-4">
                    Get a faster response through our Facebook Messenger
                  </p>
                  <a
                    href="https://www.facebook.com/messages/t/101861274821233"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-200"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>Open Messenger</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h2 className="text-xl font-medium mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">276173787</span>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-green-600" />
                  <a
                    href="mailto:evergreenrealty2020@gmail.com"
                    className="text-gray-700 hover:text-green-600 transition-colors"
                  >
                    evergreenrealty2020@gmail.com
                  </a>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-green-600 mt-1" />
                  <span className="text-gray-700">
                    Tungko, San Jose Del Monte Bulacan
                  </span>
                </div>
              </div>
            </div>

            {/* Schedule Visit Optional Section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Prefer to schedule a visit?
              </h3>
              <p className="text-gray-600 mb-4">
                If you'd like to see our properties in person, you can also
                message us on Facebook or call our phone number to arrange a
                convenient time.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
