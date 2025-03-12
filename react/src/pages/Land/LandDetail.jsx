import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axiosClient from "../../axios.client";
import Header from "../../components/header";
import Footer from "../../components/footer";
import {
  ArrowLeft,
  Map,
  User,
  Calendar,
  Phone,
  Mail,
  Check,
} from "lucide-react";

const LandDetail = () => {
  const { id } = useParams();
  const [land, setLand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  // Fetch land data
  useEffect(() => {
    const fetchLand = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/lands/${id}`);
        console.log("Land detail response:", response.data);
        setLand(response.data.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load land details. Please try again later.");
        setLoading(false);
        console.error(err);
      }
    };
    fetchLand();
  }, [id]);

  // Format price
  const formatPrice = (price, size) => {
    const totalPrice = price * size;
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(totalPrice);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#384438]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
        <Link
          to="/lands"
          className="inline-flex items-center mt-4 text-[#384438] hover:underline"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to land listings
        </Link>
      </div>
    );
  }

  if (!land) return null;

  return (
    <div className="bg-[#f7fdf7] min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Link
          to="/lands"
          className="inline-flex items-center mb-6 text-[#384438] hover:underline"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to land listings
        </Link>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Image gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="space-y-4">
              {land.images && land.images.length > 0 ? (
                <>
                  <div className="h-96 overflow-hidden rounded-lg">
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}/storage/${
                        land.images[activeImage].image_path
                      }`}
                      alt={land.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {land.images.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {land.images.map((image, index) => (
                        <button
                          key={image.id}
                          onClick={() => setActiveImage(index)}
                          className={`h-20 w-20 flex-shrink-0 rounded-md overflow-hidden ${
                            activeImage === index ? "ring-2 ring-[#384438]" : ""
                          }`}
                        >
                          <img
                            src={`${
                              import.meta.env.VITE_API_BASE_URL
                            }/storage/${image.image_path}`}
                            alt={`${land.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="h-96 bg-gray-200 flex items-center justify-center rounded-lg">
                  <Map className="h-20 w-20 text-gray-400" />
                </div>
              )}
            </div>
            {/* Land details */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h1 className="text-3xl font-bold text-[#384438]">
                    {land.name}
                  </h1>
                  <div
                    className={`px-3 py-1 rounded-lg ${
                      land.status === "available"
                        ? "bg-green-500 text-white"
                        : land.status === "pending"
                        ? "bg-yellow-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    <p className="text-sm font-bold capitalize">
                      {land.status}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 flex items-center">
                  <Map className="h-4 w-4 mr-1" /> {land.location}
                </p>
              </div>
              <div className="border-t border-b border-gray-200 py-4">
                <div className="text-3xl font-bold text-[#384438]">
                  {formatPrice(land.price_per_sqm, land.size)}
                </div>
                <p className="text-gray-600 text-sm">
                  {land.price_per_sqm.toLocaleString()} PHP per square meter
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Land Size</p>
                  <p className="text-xl font-medium">
                    {land.size.toLocaleString()} sqm
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Listed Date</p>
                  <p className="text-lg font-medium">
                    {formatDate(land.created_at)}
                  </p>
                </div>
              </div>
              {land.description && (
                <div>
                  <h3 className="text-lg font-medium text-[#384438] mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600">{land.description}</p>
                </div>
              )}
              {/* Agent information */}
              {land.agent && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-medium text-[#384438] mb-2">
                    Contact Agent
                  </h3>
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-[#384438] text-white rounded-full flex items-center justify-center mr-4">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">{land.agent.name}</p>
                      <p className="text-gray-600 text-sm">Land Agent</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <button className="w-full bg-[#384438] text-white py-2 rounded-lg hover:bg-[#2a332a] transition-colors">
                      Contact Agent
                    </button>
                    <button className="w-full bg-white border border-[#384438] text-[#384438] py-2 rounded-lg hover:bg-gray-50 transition-colors">
                      Schedule Viewing
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Features */}
          <div className="px-6 py-8 border-t border-gray-200">
            <h3 className="text-xl font-bold text-[#384438] mb-4">
              Property Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {land.features && land.features.length > 0 ? (
                land.features.map((feature, index) => (
                  <div className="flex items-start" key={index}>
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <p>{feature}</p>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <p>Complete documentation available</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <p>Ready for development</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <p>Accessible location</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <p>Flat terrain</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <p>Utilities available nearby</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <p>Clear title</p>
                  </div>
                </>
              )}
            </div>
          </div>
          {/* Location Map Placeholder */}
          <div className="px-6 py-8 border-t border-gray-200">
            <h3 className="text-xl font-bold text-[#384438] mb-4">Location</h3>
            <div className="h-80 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Map className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">
                  Map view would be displayed here
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LandDetail;
