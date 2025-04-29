import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../axios.client";
import Header from "../../components/header";
import Footer from "../../components/footer";
import {
  Map,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Loader,
} from "lucide-react";

const AvailableLand = () => {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [locations, setLocations] = useState([]);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(9);

  // Fetch lands data
  useEffect(() => {
    const fetchLands = async () => {
      setLoading(true);
      try {
        const params = {
          status: "available", // Only fetch available lands
          page: currentPage,
          per_page: perPage,
          sort_by: sortBy,
          sort_dir: sortDir,
        };

        // Add search term if it exists
        if (searchTerm) {
          params.search = searchTerm;
        }

        // Add location filter if selected
        if (location) {
          params.location = location;
        }

        const response = await axiosClient.get("/lands", { params });
        setLands(response.data.data);
        setTotalPages(Math.ceil(response.data.total / response.data.per_page));
        setLoading(false);
      } catch (err) {
        setError("Failed to load land listings. Please try again later.");
        setLoading(false);
        console.error(err);
      }
    };

    fetchLands();
  }, [searchTerm, location, sortBy, sortDir, currentPage, perPage]);

  // Fetch unique locations for filter
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axiosClient.get("/lands/stats");
        const locationData = response.data.data.locationCounts;
        setLocations(Object.keys(locationData));
      } catch (err) {
        console.error("Failed to load locations:", err);
      }
    };

    fetchLocations();
  }, []);

  // Format price
  const formatPrice = (price, size) => {
    const totalPrice = price * size;
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(totalPrice);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setLocation("");
    setSortBy("created_at");
    setSortDir("desc");
    setCurrentPage(1);
  };

  // Handle pagination
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-[#f7fdf7] min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#384438]">
              Available Land Properties
            </h1>
            <p className="text-gray-600 mt-2">
              Browse our collection of available land properties for sale
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-[#384438] text-white rounded-lg hover:bg-[#2a332a] transition-colors"
          >
            {showFilters ? (
              <X className="h-4 w-4 mr-2" />
            ) : (
              <Filter className="h-4 w-4 mr-2" />
            )}
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {showFilters && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label
                    htmlFor="search"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Search
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name or description"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-[#384438] focus:border-[#384438]"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Location
                  </label>
                  <select
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#384438] focus:border-[#384438]"
                  >
                    <option value="">All Locations</option>
                    {locations.map((loc, index) => (
                      <option key={index} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="sort"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Sort By
                  </label>
                  <div className="flex space-x-2">
                    <select
                      id="sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#384438] focus:border-[#384438]"
                    >
                      <option value="created_at">Date Listed</option>
                      <option value="price_per_sqm">Price</option>
                      <option value="size">Size</option>
                    </select>
                    <button
                      type="button"
                      onClick={() =>
                        setSortDir(sortDir === "asc" ? "desc" : "asc")
                      }
                      className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
                    >
                      {sortDir === "asc" ? "↑" : "↓"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Reset Filters
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#384438] text-white rounded-lg hover:bg-[#2a332a]"
                >
                  Apply Filters
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 animate-spin text-[#384438]" />
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
        ) : lands.length === 0 ? (
          <div className="bg-yellow-50 p-8 text-center rounded-lg">
            <h3 className="text-xl font-medium text-yellow-800 mb-2">
              No lands available
            </h3>
            <p className="text-yellow-700">
              No properties match your search criteria. Try adjusting your
              filters or check back later.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {lands.map((land) => (
                <Link
                  to={`/lands/${land.id}`}
                  key={land.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 relative">
                    {land.primary_image ? (
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL}/storage/${
                          land.primary_image.image_path
                        }`}
                        alt={land.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Map className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-bold capitalize">
                        Available
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h2 className="text-xl font-bold text-[#384438] mb-1">
                      {land.name}
                    </h2>
                    <p className="text-gray-600 mb-2 flex items-center">
                      <Map className="h-4 w-4 mr-1" /> {land.location}
                    </p>
                    <div className="flex justify-between items-end mt-4">
                      <div>
                        <p className="text-sm text-gray-500">Land Size</p>
                        <p className="font-medium">
                          {land.size.toLocaleString()} sqm
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Price</p>
                        <p className="text-lg font-bold text-[#384438]">
                          {formatPrice(land.price_per_sqm, land.size)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${
                      currentPage === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-[#384438] hover:bg-gray-100"
                    }`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {[...Array(totalPages).keys()].map((number) => {
                    const page = number + 1;
                    // Show at most 5 page numbers
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`px-4 py-2 rounded-md ${
                            currentPage === page
                              ? "bg-[#384438] text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      (page === currentPage - 2 && currentPage > 3) ||
                      (page === currentPage + 2 && currentPage < totalPages - 2)
                    ) {
                      return <span key={page}>...</span>;
                    }
                    return null;
                  })}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md ${
                      currentPage === totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-[#384438] hover:bg-gray-100"
                    }`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AvailableLand;
