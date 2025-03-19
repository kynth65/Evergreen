import React, { useState } from "react";
import { MessageSquare } from "lucide-react";
import Header from "../components/header";
import Footer from "../components/footer";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitStatus, setSubmitStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submissionData = {
      access_key: "6b38b5cc-df19-4c65-a6fb-e9f1cbe28bad",
      ...formData,
    };

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus("success");
        setFormData({
          name: "",
          email: "",
          message: "",
        });
        console.log("Success", result);
      } else {
        setSubmitStatus("error");
        console.log("Error", result);
      }
    } catch (error) {
      setSubmitStatus("error");
      console.log("Error", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      {" "}
      <Header />
      <div className="min-h-screen bg-[#f7fdf7] pt-20">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-8 mt-16">
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-6 h-6 text-green-600" />
                <h1 className="text-2xl font-bold text-gray-800">
                  Schedule a Land Visit
                </h1>
              </div>
              <p className="text-gray-600">
                Interested in viewing our available land properties? Fill out
                the form below to schedule a visit or request more information
                about our listings.
              </p>
              {submitStatus === "success" && (
                <div className="bg-green-100 text-green-700 p-3 rounded-lg">
                  Message sent successfully!
                </div>
              )}
              {submitStatus === "error" && (
                <div className="bg-red-100 text-red-700 p-3 rounded-lg">
                  Failed to send message. Please try again.
                </div>
              )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium text-gray-700"
                    htmlFor="name"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium text-gray-700"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-gray-700"
                  htmlFor="message"
                >
                  Your Message or Visit Request Details
                </label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Please include your preferred visit dates and times, or any specific questions about our land properties."
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition resize-none"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full md:w-auto px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition duration-200 ease-in-out cursor-pointer"
              >
                Send Request
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
