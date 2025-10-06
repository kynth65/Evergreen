import React from "react";
import { MessageSquare, Phone, Mail, MapPin } from "lucide-react";
import Header from "../components/header";
import Footer from "../components/footer";

export default function ContactUs() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#fdfaf1] py-16 pb-24 px-4 sm:px-6 lg:py-20 lg:pb-32">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-10 h-10 text-[#081A0D]" />
              <h1 className="text-5xl md:text-6xl font-serif text-[#081A0D]">
                Get In Touch
              </h1>
            </div>
            <p className="text-2xl text-[#081A0D]/70 leading-relaxed max-w-3xl">
              We're here to help with any questions about our land properties.
              For the fastest response, message us directly on Facebook
              Messenger.
            </p>
          </div>

          {/* Messenger Card */}
          <div className="bg-[#081A0D] rounded-3xl p-8 lg:p-12 mb-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <svg
                  className="w-20 h-20"
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
                <h3 className="text-3xl font-serif text-[#fdfaf1] mb-3">
                  Message Us on Facebook
                </h3>
                <p className="text-xl text-[#fdfaf1]/80 mb-6 leading-relaxed">
                  Get a faster response through our Facebook Messenger
                </p>
                <a
                  href="https://www.facebook.com/messages/t/101861274821233"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-[#fdfaf1] hover:bg-[#fdfaf1]/90 text-[#081A0D] px-8 py-4 rounded-xl transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <MessageSquare className="w-6 h-6" />
                  <span>Open Messenger</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-[#fdfaf1] border-2 border-[#081A0D]/10 rounded-3xl p-8 lg:p-12 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-3xl font-serif text-[#081A0D] mb-8">Contact Information</h2>
            <div className="space-y-8">
              <div className="flex items-center gap-4 group">
                <Phone className="w-7 h-7 text-[#081A0D] group-hover:scale-110 transition-transform" />
                <span className="text-xl text-[#081A0D]/80">276173787</span>
              </div>

              <div className="flex items-center gap-4 group">
                <Mail className="w-7 h-7 text-[#081A0D] group-hover:scale-110 transition-transform" />
                <a
                  href="mailto:evergreenrealty2020@gmail.com"
                  className="text-xl text-[#081A0D]/80 hover:text-[#081A0D] transition-colors"
                >
                  evergreenrealty2020@gmail.com
                </a>
              </div>

              <div className="flex items-start gap-4 group">
                <MapPin className="w-7 h-7 text-[#081A0D] mt-1 group-hover:scale-110 transition-transform" />
                <span className="text-xl text-[#081A0D]/80">
                  Tungko, San Jose Del Monte Bulacan
                </span>
              </div>
            </div>
          </div>

          {/* Schedule Visit Optional Section */}
          <div className="mt-12 p-8 lg:p-10 bg-[#081A0D]/5 rounded-3xl border border-[#081A0D]/10">
            <h3 className="text-2xl font-serif text-[#081A0D] mb-4">
              Prefer to schedule a visit?
            </h3>
            <p className="text-xl text-[#081A0D]/70 leading-relaxed">
              If you'd like to see our properties in person, you can also
              message us on Facebook or call our phone number to arrange a
              convenient time.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
