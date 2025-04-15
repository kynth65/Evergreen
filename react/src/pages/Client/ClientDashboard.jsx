import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CreditCard,
  Clock,
  Calendar,
  Home,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Eye,
  ChevronDown,
  MapPin,
} from "lucide-react";

const ClientDashboard = () => {
  const [screenSize, setScreenSize] = useState(window.innerWidth);

  // Update screen size on window resize
  useEffect(() => {
    const handleResize = () => {
      setScreenSize(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Mock data for the dashboard
  const stats = {
    totalPaid: 12500.0,
    totalDue: 2750.0,
    nextPaymentDate: "2025-05-15",
    totalProperties: 8,
  };

  // Mock data for payments
  const payments = [
    {
      id: 1,
      description: "Downpayment for Lot 123",
      amount: 5000.0,
      due_date: "2025-04-01",
      status: "paid",
      property_name: "Evergreen Lot 123",
      payment_date: "2025-03-29",
    },
    {
      id: 2,
      description: "1st Installment for Lot 123",
      amount: 2500.0,
      due_date: "2025-05-01",
      status: "paid",
      property_name: "Evergreen Lot 123",
      payment_date: "2025-04-28",
    },
    {
      id: 3,
      description: "2nd Installment for Lot 123",
      amount: 2500.0,
      due_date: "2025-06-01",
      status: "pending",
      property_name: "Evergreen Lot 123",
    },
    {
      id: 4,
      description: "3rd Installment for Lot 123",
      amount: 2500.0,
      due_date: "2025-07-01",
      status: "pending",
      property_name: "Evergreen Lot 123",
    },
  ];

  // Mock data for available properties
  const availableProperties = [
    {
      id: 101,
      name: "Evergreen Lot 456",
      location: "Block 4, Evergreen Subdivision",
      price: 75000.0,
      size: 150,
      size_unit: "sqm",
      type: "Residential",
      status: "Available",
    },
    {
      id: 102,
      name: "Evergreen Lot 457",
      location: "Block 4, Evergreen Subdivision",
      price: 80000.0,
      size: 160,
      size_unit: "sqm",
      type: "Residential",
      status: "Available",
    },
    {
      id: 103,
      name: "Evergreen Lot 458",
      location: "Block 4, Evergreen Subdivision",
      price: 90000.0,
      size: 180,
      size_unit: "sqm",
      type: "Residential",
      status: "Available",
    },
  ];

  // Mock data for cheapest properties
  const cheapestProperties = [
    {
      id: 201,
      name: "Evergreen Lot 789",
      location: "Block 7, Evergreen Subdivision",
      price: 65000.0,
      size: 120,
      size_unit: "sqm",
      type: "Residential",
      status: "Available",
    },
    {
      id: 202,
      name: "Evergreen Lot 790",
      location: "Block 7, Evergreen Subdivision",
      price: 67500.0,
      size: 125,
      size_unit: "sqm",
      type: "Residential",
      status: "Available",
    },
    {
      id: 203,
      name: "Evergreen Lot 791",
      location: "Block 7, Evergreen Subdivision",
      price: 70000.0,
      size: 130,
      size_unit: "sqm",
      type: "Residential",
      status: "Available",
    },
  ];

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate days remaining until a date
  const getDaysRemaining = (dateString) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Render payment status badge
  const renderPaymentStatus = (status) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case "late":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Late
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const [activeTab, setActiveTab] = useState("pending");
  const [propertyDetailsVisible, setPropertyDetailsVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const showPropertyDetails = (property) => {
    setSelectedProperty(property);
    setPropertyDetailsVisible(true);
  };

  return (
    <div className="p-4 md:p-6">
      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Paid Card */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Paid</p>
              <p className="text-lg font-semibold text-gray-800">
                ₱{stats.totalPaid.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Amount Due Card */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-100 text-amber-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Amount Due</p>
              <p className="text-lg font-semibold text-gray-800">
                ₱{stats.totalDue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Next Payment Card */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Next Payment</p>
              <p className="text-lg font-semibold text-gray-800">
                {formatDate(stats.nextPaymentDate)}
              </p>
              <p className="text-xs text-gray-500">
                {getDaysRemaining(stats.nextPaymentDate)} days remaining
              </p>
            </div>
          </div>
        </div>

        {/* Available Properties Card */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
              <Home className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Available Properties
              </p>
              <p className="text-lg font-semibold text-gray-800">
                {stats.totalProperties}
              </p>
              <Link
                to="/client/available-lands"
                className="text-xs text-emerald-600 hover:underline"
              >
                View all properties
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* My Payments Section */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">My Payments</h2>
          <Link
            to="/client/payment-list"
            className="text-sm text-emerald-600 hover:underline"
          >
            View All
          </Link>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("pending")}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === "pending"
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Pending
            </button>
            <button
              onClick={() => setActiveTab("paid")}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === "paid"
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <CheckCircle className="w-4 h-4 inline mr-2" />
              Paid
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === "all"
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              All
            </button>
          </nav>
        </div>

        {/* Payment Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments
                .filter((payment) => {
                  if (activeTab === "pending")
                    return payment.status === "pending";
                  if (activeTab === "paid") return payment.status === "paid";
                  return true; // "all" tab
                })
                .map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.description}
                      </div>
                      <div className="text-xs text-gray-500">
                        {payment.property_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₱{payment.amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(payment.due_date)}
                      </div>
                      {payment.status === "pending" && (
                        <div className="text-xs text-gray-500">
                          {getDaysRemaining(payment.due_date) <= 0
                            ? "Overdue"
                            : `${getDaysRemaining(
                                payment.due_date
                              )} days remaining`}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderPaymentStatus(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {payment.status === "pending" ? (
                        <Link
                          to={`/client/payment/${payment.id}`}
                          className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-md"
                        >
                          Pay Now
                        </Link>
                      ) : (
                        <button className="text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1 rounded-md">
                          Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              {payments.filter((payment) => {
                if (activeTab === "pending")
                  return payment.status === "pending";
                if (activeTab === "paid") return payment.status === "paid";
                return true;
              }).length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-10 text-center text-sm text-gray-500"
                  >
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Available Properties Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Available Properties</h2>
              <Link
                to="/client/available-lands"
                className="text-sm text-emerald-600 hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {availableProperties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {property.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {property.type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {property.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {property.size} {property.size_unit}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ₱{property.price.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => showPropertyDetails(property)}
                          className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-md"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Cheapest Properties Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow h-full">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Cheapest Properties</h2>
            </div>
            <div className="p-4">
              <ul className="divide-y divide-gray-200">
                {cheapestProperties.map((property) => (
                  <li key={property.id} className="py-3">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {property.name}
                        </h3>
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {property.location}
                        </p>
                        <p className="text-sm text-gray-900 mt-1">
                          <span className="font-semibold text-emerald-600">
                            ₱{property.price.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            • {property.size} {property.size_unit}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={() => showPropertyDetails(property)}
                        className="text-emerald-600 hover:text-emerald-900 text-xs"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Property Detail Modal */}
      {propertyDetailsVisible && selectedProperty && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={() => setPropertyDetailsVisible(false)}
            ></div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => setPropertyDetailsVisible(false)}
                >
                  <span className="sr-only">Close</span>✕
                </button>
              </div>
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3
                      className="text-lg leading-6 font-medium text-gray-900"
                      id="modal-title"
                    >
                      {selectedProperty.name}
                    </h3>
                    <div className="mt-4">
                      <div className="mb-4 bg-gray-100 h-40 flex items-center justify-center rounded-lg">
                        <Home className="w-16 h-16 text-gray-400" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="text-sm font-medium">
                            {selectedProperty.location}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Size</p>
                          <p className="text-sm font-medium">
                            {selectedProperty.size} {selectedProperty.size_unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Type</p>
                          <p className="text-sm font-medium">
                            {selectedProperty.type}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Price</p>
                          <p className="text-sm font-medium text-emerald-600">
                            ₱{selectedProperty.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <p className="text-sm text-gray-500">Description</p>
                        <p className="text-sm mt-1">
                          This {selectedProperty.size}{" "}
                          {selectedProperty.size_unit}{" "}
                          {selectedProperty.type.toLowerCase()} lot is located
                          in a prime location at {selectedProperty.location}.
                          Perfect for building your dream home.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Inquire Now
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setPropertyDetailsVisible(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
