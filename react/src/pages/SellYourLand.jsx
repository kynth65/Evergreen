import React from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import {
  CheckCircle2,
  Handshake,
  Clock,
  PieChart,
  UserCheck,
  MapPin,
  ArrowRight,
  MessageCircle,
} from "lucide-react";

export default function SellYourLand() {
  // Benefits of selling through Evergreen
  const benefits = [
    {
      icon: <Handshake className="h-10 w-10 text-green-600" />,
      title: "Fair Value Assessment",
      description:
        "Our experts will help determine the best market price for your land.",
    },
    {
      icon: <UserCheck className="h-10 w-10 text-green-600" />,
      title: "Verified Buyers",
      description:
        "We work only with pre-qualified buyers interested in agricultural investments.",
    },
    {
      icon: <PieChart className="h-10 w-10 text-green-600" />,
      title: "No Upfront Costs",
      description:
        "Our commission is based solely on successful sales - no risk to you.",
    },
    {
      icon: <Clock className="h-10 w-10 text-green-600" />,
      title: "Faster Transactions",
      description:
        "Our streamlined process helps close deals in less time than traditional methods.",
    },
  ];

  // Process steps
  const steps = [
    {
      number: "01",
      title: "Initial Consultation",
      description:
        "We'll discuss your land details, documentation, and your selling goals.",
    },
    {
      number: "02",
      title: "Property Assessment",
      description:
        "Our team evaluates your land to determine its market value and potential.",
    },
    {
      number: "03",
      title: "Marketing Campaign",
      description:
        "We create professional listings and market your property to our network of buyers.",
    },
    {
      number: "04",
      title: "Buyer Introduction",
      description:
        "We facilitate meetings between you and qualified, interested buyers.",
    },
    {
      number: "05",
      title: "Paperwork & Closing",
      description:
        "We handle the documentation and guide you through the closing process.",
    },
  ];

  const messengerLink = "https://www.facebook.com/messages/t/101861274821233";

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-block bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-semibold mb-4">
              Land Selling Service
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-grotesk">
              Sell Your Land with{" "}
              <span className="text-green-700">Evergreen</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-600">
              Let us handle the complexities of selling your agricultural land
              while you focus on what matters most to you.
            </p>
            <div className="h-1 w-24 bg-green-600 mt-8 mx-auto"></div>
          </div>

          {/* Key benefits */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-3 bg-green-50 rounded-full mb-4 inline-block">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="text-center mt-12">
            <a
              href={messengerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-[#278336] text-white py-3 px-8 rounded-lg hover:bg-green-600 transition-colors font-medium shadow-md"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Contact Us to Sell Your Land
            </a>
          </div>
        </div>
      </section>

      {/* Our Process Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 font-grotesk">
              Our Selling <span className="text-green-700">Process</span>
            </h2>
            <p className="max-w-2xl mx-auto text-xl text-gray-600">
              A straightforward approach to help you sell your land efficiently.
            </p>
          </div>

          <div className="relative">
            {/* Process Steps */}
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row mb-12 relative"
              >
                {/* Number */}
                <div className="md:w-1/4 mb-4 md:mb-0">
                  <div className="bg-green-100 text-green-800 text-5xl font-bold w-20 h-20 rounded-full flex items-center justify-center mx-auto md:mx-0">
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <div className="md:w-3/4 md:pl-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-lg">{step.description}</p>

                  {/* Connector line (visible on desktop only) */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute left-10 top-20 w-px h-16 bg-green-300"></div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="text-center mt-8">
            <a
              href={messengerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-[#278336] text-white py-3 px-8 rounded-lg hover:bg-green-600 transition-colors font-medium shadow-md"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Start Your Land Selling Process
            </a>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 bg-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <div className="inline-block bg-white/20 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4">
                Success Story
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-grotesk">
                We Help Landowners Get{" "}
                <span className="text-green-200">Maximum Value</span>
              </h2>
              <div className="h-1 w-24 bg-white mt-8 mb-8"></div>
              <blockquote className="text-xl italic">
                "Evergreen made selling my farmland incredibly easy. Their team
                handled everything professionally, found qualified buyers
                quickly, and secured a better price than I expected. I highly
                recommend their service to any landowner."
              </blockquote>
              <div className="mt-4 font-bold">- Mario Santos, Bulacan</div>

              {/* CTA Button */}
              <div className="mt-8">
                <a
                  href={messengerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-white text-green-700 py-3 px-8 rounded-lg hover:bg-green-50 transition-colors font-medium shadow-md"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Message Us About Your Land
                </a>
              </div>
            </div>

            <div className="md:w-1/2 flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg w-full">
                <h3 className="text-2xl font-bold mb-6 font-grotesk">
                  Why Partner with Evergreen?
                </h3>

                <div className="flex flex-col space-y-6">
                  <div className="flex items-start">
                    <CheckCircle2 className="h-6 w-6 text-green-300 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium">No upfront fees</p>
                      <p className="text-white/80 text-sm">
                        We only earn when you successfully sell your property
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <CheckCircle2 className="h-6 w-6 text-green-300 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium">Professional marketing</p>
                      <p className="text-white/80 text-sm">
                        Your land gets showcased on our platform and social
                        media
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <CheckCircle2 className="h-6 w-6 text-green-300 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium">Qualified buyers network</p>
                      <p className="text-white/80 text-sm">
                        Access to our database of serious agricultural investors
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <CheckCircle2 className="h-6 w-6 text-green-300 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium">Documentation assistance</p>
                      <p className="text-white/80 text-sm">
                        Help with paperwork and legal requirements
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-lg">
                  <h4 className="font-bold text-xl mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Visit Our Office
                  </h4>
                  <p className="mb-2">
                    STA EVERGREEN 97, Pecson Ville Subdivision,
                  </p>
                  <p className="mb-2">
                    {" "}
                    Tungkong Mangga, San Jose Del Monte, 3023, Bulacan
                  </p>
                  <p className="mb-2">North Luzon, Philippines</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 font-grotesk">
              Frequently Asked <span className="text-green-700">Questions</span>
            </h2>
            <p className="max-w-2xl mx-auto text-xl text-gray-600">
              Get answers to common questions about selling your land through
              Evergreen.
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                How much does it cost to list my land with Evergreen?
              </h3>
              <p className="text-gray-700">
                There are no upfront costs to list your land with us. We work on
                a commission basis, which is only payable upon successful sale
                of your property. Our standard commission is discussed during
                the initial consultation.
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                How long does it typically take to sell a property?
              </h3>
              <p className="text-gray-700">
                Selling timelines vary based on factors like location, size,
                features, and market conditions. On average, agricultural
                properties sell within 3-6 months. Our team works diligently to
                market your property effectively to reduce waiting time.
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                What documents do I need to sell my land?
              </h3>
              <p className="text-gray-700">
                You'll need the original title, tax declaration, latest tax
                receipts, and a valid ID. Depending on your specific situation,
                additional documents may be required. Our team will guide you
                through the documentation process during the initial
                consultation.
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Can Evergreen help me sell land without a title?
              </h3>
              <p className="text-gray-700">
                We specialize in properties with clear titles. However, we can
                assess your situation and provide guidance on title acquisition
                if needed. In some cases, we can work with properties that have
                other forms of ownership documentation, subject to evaluation.
              </p>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center mt-12">
            <p className="text-xl text-gray-700 mb-6">
              Ready to partner with Evergreen to sell your land?
            </p>
            <a
              href={messengerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-[#278336] text-white py-3 px-8 rounded-lg hover:bg-green-600 transition-colors font-medium shadow-md"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Contact Us on Messenger
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
