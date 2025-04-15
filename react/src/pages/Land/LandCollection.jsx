import React, { useState, useEffect } from "react";
import axiosClient from "../../axios.client";
import { Link } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, Map } from "lucide-react";
import Header from "../../components/header";
import Footer from "../../components/footer";

// Updated LandCard component with improved image URL handling
const LandCard = ({ land }) => {
  const [landDetails, setLandDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLandDetails = async () => {
      try {
        const response = await axiosClient.get(`/lands/${land.id}`);
        setLandDetails(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error(`Error fetching details for land ${land.id}:`, err);
        setLoading(false);
      }
    };

    fetchLandDetails();
  }, [land.id]);

  // Format price
  const formatPrice = (price, size) => {
    if (!price || !size) return "Price on request";

    const totalPrice = price * size;
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(totalPrice);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-56">
        {!loading &&
        landDetails &&
        landDetails.images &&
        landDetails.images.length > 0 ? (
          <img
            // Use the image_url property from the API response
            src={landDetails.images[0].image_url}
            alt={land.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("Image failed to load:", e.target.src);
              e.target.src =
                "https://via.placeholder.com/400x250?text=Image+Not+Available";
              e.target.alt = "Image not available";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-800"></div>
            ) : (
              <Map className="h-12 w-12 text-gray-400" />
            )}
          </div>
        )}

        <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-lg shadow-md">
          <p className="text-sm font-bold text-green-800">
            {formatPrice(land.price_per_sqm, land.size)}
          </p>
        </div>
        {land.status && (
          <div
            className={`absolute top-4 right-4 px-3 py-1 rounded-lg shadow-md ${
              land.status === "available"
                ? "bg-green-500 text-white"
                : land.status === "pending"
                ? "bg-yellow-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            <p className="text-sm font-bold capitalize">{land.status}</p>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-green-800 mb-2">{land.name}</h3>
        {land.location && (
          <p className="text-gray-600 mb-4">
            <span className="flex items-center gap-1">
              <Map className="h-4 w-4" />
              {land.location}
            </span>
          </p>
        )}

        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-500">Size</p>
            <p className="font-medium">
              {land.size ? land.size.toLocaleString() : "N/A"} sqm
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Price/sqm</p>
            <p className="font-medium">
              {land.price_per_sqm
                ? `₱${land.price_per_sqm.toLocaleString()}`
                : "N/A"}
            </p>
          </div>
        </div>

        <Link to={`/lands/${land.id}`} className="block w-full">
          <button className="w-full bg-green-800 text-white py-2 rounded-lg hover:bg-green-900 transition-colors cursor-pointer">
            View Details
          </button>
        </Link>
      </div>
    </div>
  );
};

const LandCollection = () => {
  // State management
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all lands without filtering initially
  const fetchLands = async () => {
    setLoading(true);
    try {
      // Get basic land listing
      const response = await axiosClient.get("/lands", {
        params: {
          page: currentPage,
          search: searchTerm,
        },
      });

      console.log("Lands API response:", response.data);

      if (response.data.data) {
        setLands(response.data.data);
        setTotalPages(
          Math.ceil(response.data.total / response.data.per_page) || 1
        );
      } else if (Array.isArray(response.data)) {
        setLands(response.data);
        setTotalPages(1);
      } else {
        console.error("Unexpected API response format:", response.data);
        setLands([]);
        setTotalPages(1);
      }

      setLoading(false);
    } catch (err) {
      setError("Failed to load lands. Please try again later.");
      setLoading(false);
      console.error("API Error:", err);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLands();
  };

  // Effect hook for pagination
  useEffect(() => {
    fetchLands();
  }, [currentPage]);

  // Initial data load
  useEffect(() => {
    fetchLands();
  }, []);

  return (
    <>
      <Header />
      <div className="bg-[#f7fdf7]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl md:text-5xl font-grotesk font-bold text-green-800 mb-2">
            Available Lands
          </h1>
          <p className="text-gray-600 mb-8">
            Find your perfect land property for development or investment
          </p>

          {/* Simple Search */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, location, etc."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <button
                type="submit"
                className="bg-green-800 text-white px-6 py-2 rounded-lg hover:bg-green-900 transition-colors cursor-pointer"
              >
                Search
              </button>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                    setTimeout(fetchLands, 0);
                  }}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Clear
                </button>
              )}
            </form>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-8">
              {error}
            </div>
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-800"></div>
            </div>
          )}

          {/* Land grid */}
          {!loading && lands.length === 0 && (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <p className="text-xl text-gray-600">
                No lands found matching your criteria.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                  setTimeout(fetchLands, 0);
                }}
                className="mt-4 bg-green-800 text-white px-6 py-2 rounded-lg hover:bg-green-900 transition-colors"
              >
                View All Properties
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {!loading &&
              lands.map((land) => <LandCard key={land.id} land={land} />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg mr-2 ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white text-green-800 hover:bg-gray-100"
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex space-x-1">
                  {[...Array(totalPages).keys()].map((page) => (
                    <button
                      key={page + 1}
                      onClick={() => setCurrentPage(page + 1)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === page + 1
                          ? "bg-green-800 text-white"
                          : "bg-white text-green-800 hover:bg-gray-100"
                      }`}
                    >
                      {page + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg ml-2 ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white text-green-800 hover:bg-gray-100"
                  }`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LandCollection;
