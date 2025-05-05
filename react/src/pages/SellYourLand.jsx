import React, { useState } from "react";
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
} from "lucide-react";

export default function SellYourLand() {
  // State for form fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    landSize: "",
    description: "",
    agreeTos: false,
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically integrate with your backend or email service
    console.log("Form submitted:", formData);
    alert(
      "Thank you for submitting your land details. We'll contact you soon!"
    );

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      location: "",
      landSize: "",
      description: "",
      agreeTos: false,
    });
  };

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
            </div>

            <div className="md:w-1/2 flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-6 w-6 text-green-300 mr-3" />
                    <span>15+ years of land brokerage experience</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-6 w-6 text-green-300 mr-3" />
                    <span>100+ successful land transactions</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-6 w-6 text-green-300 mr-3" />
                    <span>95% seller satisfaction rate</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-6 w-6 text-green-300 mr-3" />
                    <span>Network of pre-qualified agricultural investors</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="md:flex">
              {/* Form Side */}
              <div className="md:w-3/5 p-8 md:p-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 font-grotesk">
                  List Your <span className="text-green-700">Land</span> with Us
                </h2>
                <p className="text-gray-600 mb-8">
                  Fill out the form below and our land specialists will contact
                  you within 24 hours to discuss how we can help you sell your
                  property.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Full Name*
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email Address*
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Phone Number*
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="location"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Land Location*
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                        placeholder="City/Municipality, Province"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="landSize"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Approximate Land Size*
                    </label>
                    <input
                      type="text"
                      id="landSize"
                      name="landSize"
                      value={formData.landSize}
                      onChange={handleChange}
                      required
                      placeholder="e.g., 2 hectares, 5000 sqm"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Property Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Tell us about your land (current use, features, access to roads, water sources, etc.)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    ></textarea>
                  </div>

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="agreeTos"
                      name="agreeTos"
                      checked={formData.agreeTos}
                      onChange={handleChange}
                      required
                      className="h-4 w-4 text-green-600 border-gray-300 rounded mt-1"
                    />
                    <label
                      htmlFor="agreeTos"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      I agree that Evergreen may contact me regarding my
                      property listing request.
                    </label>
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="w-full bg-green-700 text-white py-3 px-6 rounded-md hover:bg-green-800 transition-colors font-medium flex items-center justify-center"
                    >
                      Submit Land Details
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
                  </div>
                </form>
              </div>

              {/* Info Side */}
              <div className="md:w-2/5 bg-green-700 text-white p-8 md:p-12">
                <h3 className="text-2xl font-bold mb-6 font-grotesk">
                  Why Partner with Evergreen?
                </h3>

                <ul className="space-y-6">
                  <li className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircle2 className="h-6 w-6 text-green-300" />
                    </div>
                    <div className="ml-3">
                      <p className="text-white font-medium">No upfront fees</p>
                      <p className="text-white/80 text-sm">
                        We only earn when you successfully sell your property
                      </p>
                    </div>
                  </li>

                  <li className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircle2 className="h-6 w-6 text-green-300" />
                    </div>
                    <div className="ml-3">
                      <p className="text-white font-medium">
                        Professional marketing
                      </p>
                      <p className="text-white/80 text-sm">
                        Your land gets showcased on our platform and social
                        media
                      </p>
                    </div>
                  </li>

                  <li className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircle2 className="h-6 w-6 text-green-300" />
                    </div>
                    <div className="ml-3">
                      <p className="text-white font-medium">
                        Qualified buyers network
                      </p>
                      <p className="text-white/80 text-sm">
                        Access to our database of serious agricultural investors
                      </p>
                    </div>
                  </li>

                  <li className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircle2 className="h-6 w-6 text-green-300" />
                    </div>
                    <div className="ml-3">
                      <p className="text-white font-medium">
                        Documentation assistance
                      </p>
                      <p className="text-white/80 text-sm">
                        Help with paperwork and legal requirements
                      </p>
                    </div>
                  </li>
                </ul>

                <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-lg">
                  <h4 className="font-bold text-xl mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Visit Our Office
                  </h4>
                  <p className="mb-2">123 Green Avenue, 3rd Floor</p>
                  <p className="mb-2">Norzagaray, Bulacan</p>
                  <p className="mb-2">Philippines 3024</p>
                  <p className="mb-2">+63 919 123 4567</p>
                  <p>contact@evergreen.ph</p>
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
        </div>
      </section>

      <Footer />
    </>
  );
}
