import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../axios.client";
import { useStateContext } from "../../context/ContextProvider";
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
  const { user } = useStateContext();

  // Screen size state
  const [screenSize, setScreenSize] = useState(window.innerWidth);

  // Data states
  const [stats, setStats] = useState({
    totalPaid: 0,
    totalDue: 0,
    nextPaymentDate: null,
    totalProperties: 0,
  });
  const [payments, setPayments] = useState([]);
  const [availableProperties, setAvailableProperties] = useState([]);
  const [cheapestProperties, setCheapestProperties] = useState([]);

  // Loading and error states
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [error, setError] = useState(null);

  // UI states
  const [propertyDetailsVisible, setPropertyDetailsVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

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

  // Fetch all data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setError(null);
    try {
      await Promise.all([
        fetchStats(),
        fetchPayments(),
        fetchAvailableProperties(),
      ]);
    } catch (err) {
      setError("Failed to load dashboard data. Please try again later.");
      console.error("Dashboard data loading error:", err);
    }
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      // Get client payments
      const paymentsResponse = await axiosClient.get(
        "/client-payments/my-payments"
      );
      const paymentsData = paymentsResponse.data || [];

      // Get available properties count
      const propertiesResponse = await axiosClient.get("/lands", {
        params: { status: "available", per_page: 100 },
      });
      const propertiesData = propertiesResponse.data.data || [];

      // Calculate total paid amount
      const totalPaid = paymentsData.reduce((sum, payment) => {
        // If payment is complete, add total amount
        if (payment.payment_status === "COMPLETED") {
          return sum + parseFloat(payment.total_amount || 0);
        }

        // For installments, add up paid schedules
        if (payment.payment_schedules) {
          const paidAmount = payment.payment_schedules
            .filter((schedule) => schedule.status === "PAID")
            .reduce(
              (total, schedule) => total + parseFloat(schedule.amount || 0),
              0
            );
          return sum + paidAmount;
        }

        return sum;
      }, 0);

      // Calculate total due amount
      const totalDue = paymentsData.reduce((sum, payment) => {
        // Skip completed payments
        if (payment.payment_status === "COMPLETED") {
          return sum;
        }

        // For installments, add up pending/unpaid schedules
        if (payment.payment_schedules) {
          const dueAmount = payment.payment_schedules
            .filter(
              (schedule) =>
                schedule.status === "PENDING" || schedule.status === "UNPAID"
            )
            .reduce(
              (total, schedule) => total + parseFloat(schedule.amount || 0),
              0
            );
          return sum + dueAmount;
        }

        return sum;
      }, 0);

      // Find next payment date (closest upcoming date)
      let nextPaymentDate = null;
      const today = new Date();

      // Find the earliest upcoming payment date
      paymentsData.forEach((payment) => {
        if (
          payment.payment_status !== "COMPLETED" &&
          payment.next_payment_date
        ) {
          const paymentDate = new Date(payment.next_payment_date);

          // Only consider future payment dates
          if (paymentDate >= today) {
            if (!nextPaymentDate || paymentDate < new Date(nextPaymentDate)) {
              nextPaymentDate = payment.next_payment_date;
            }
          }
        }
      });

      setStats({
        totalPaid,
        totalDue,
        nextPaymentDate,
        totalProperties: propertiesData.length,
      });
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch payments data
  const fetchPayments = async () => {
    setLoadingPayments(true);
    try {
      const response = await axiosClient.get("/client-payments/my-payments");
      let paymentsData = response.data || [];

      // Transform payment data to match component's expected format
      const transformedPayments = paymentsData.map((payment) => {
        // Get first lot for property name
        const lot =
          payment.lots && payment.lots.length > 0 ? payment.lots[0] : null;

        // Get next payment schedule if available
        const nextSchedule =
          payment.payment_schedules && payment.payment_schedules.length > 0
            ? payment.payment_schedules.find((s) => s.status === "PENDING")
            : null;

        return {
          id: payment.id,
          description:
            payment.description ||
            `Payment for ${lot ? lot.property_name : "Property"}`,
          amount: nextSchedule
            ? parseFloat(nextSchedule.amount)
            : parseFloat(payment.total_amount || 0),
          due_date: nextSchedule
            ? nextSchedule.due_date
            : payment.next_payment_date,
          status: payment.payment_status === "COMPLETED" ? "paid" : "pending",
          property_name: lot ? lot.property_name : "Unknown Property",
          payment_date: payment.last_payment_date || null,
        };
      });

      // Only keep pending payments since we removed the other tabs
      const pendingPayments = transformedPayments.filter(
        (payment) => payment.status === "pending"
      );
      setPayments(pendingPayments);
    } catch (err) {
      console.error("Error fetching payments:", err);
    } finally {
      setLoadingPayments(false);
    }
  };

  // Fetch available properties
  const fetchAvailableProperties = async () => {
    setLoadingProperties(true);
    try {
      // First fetch available lands
      const response = await axiosClient.get("/lands", {
        params: { status: "available", per_page: 100 },
      });

      const propertiesData = response.data.data || [];

      // Map API data to component's expected format
      const transformedProperties = propertiesData.map((property) => ({
        id: property.id,
        name: property.name || `Land ${property.id}`,
        location: property.location || "Unknown Location",
        price:
          parseFloat(property.price_per_sqm || 0) *
          parseFloat(property.size || 0),
        size: parseFloat(property.size || 0),
        size_unit: "sqm",
        type: property.type || "Residential",
        status: "Available",
        price_per_sqm: parseFloat(property.price_per_sqm || 0),
      }));

      // Find cheapest properties (up to 3)
      const sortedByPrice = [...transformedProperties].sort(
        (a, b) => a.price - b.price
      );
      const cheapestProps = sortedByPrice.slice(0, 3);

      setAvailableProperties(transformedProperties.slice(0, 3)); // Take first 3 for display
      setCheapestProperties(cheapestProps);
    } catch (err) {
      console.error("Error fetching available properties:", err);
    } finally {
      setLoadingProperties(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate days remaining until a date
  const getDaysRemaining = (dateString) => {
    if (!dateString) return 0;

    const dueDate = new Date(dateString);
    const today = new Date();

    // Reset time to compare just dates
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

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

  const showPropertyDetails = (property) => {
    setSelectedProperty(property);
    setPropertyDetailsVisible(true);
  };

  // Render loading skeleton for stats cards
  const renderStatsCardSkeleton = () => (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-gray-100">
          <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
        <div className="ml-4">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 w-32 bg-gray-200 rounded mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  // Open Facebook Messenger link for property inquiry
  const handleInquireClick = () => {
    window.open(
      "https://www.facebook.com/messages/t/101861274821233",
      "_blank"
    );
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header Section */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Client Dashboard</h1>
      </div>

      {/* Error message */}
      {error && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
          role="alert"
        >
          <p>{error}</p>
        </div>
      )}

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Paid Card */}
        {loadingStats ? (
          renderStatsCardSkeleton()
        ) : (
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
        )}

        {/* Amount Due Card */}
        {loadingStats ? (
          renderStatsCardSkeleton()
        ) : (
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
        )}

        {/* Next Payment Card */}
        {loadingStats ? (
          renderStatsCardSkeleton()
        ) : (
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Next Payment
                </p>
                <p className="text-lg font-semibold text-gray-800">
                  {stats.nextPaymentDate
                    ? formatDate(stats.nextPaymentDate)
                    : "No upcoming payments"}
                </p>
                {stats.nextPaymentDate && (
                  <p className="text-xs text-gray-500">
                    {getDaysRemaining(stats.nextPaymentDate)} days remaining
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Available Properties Card */}
        {loadingStats ? (
          renderStatsCardSkeleton()
        ) : (
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
                  className="text-xs text-emerald-600 hover:underline cursor-pointer"
                >
                  View all properties
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* My Payments Section */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">My Pending Payments</h2>
          <Link
            to="/client/payment-list"
            className="text-sm text-emerald-600 hover:underline"
          >
            View All
          </Link>
        </div>

        {/* Just showing Pending tab header */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <div className="py-4 px-6 text-sm font-medium border-b-2 border-emerald-500 text-emerald-600">
              <Clock className="w-4 h-4 inline mr-2" />
              Pending
            </div>
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loadingPayments
                ? // Loading skeleton
                  Array(3)
                    .fill()
                    .map((_, index) => (
                      <tr key={`skeleton-${index}`} className="animate-pulse">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 w-40 bg-gray-200 rounded"></div>
                          <div className="h-3 w-24 bg-gray-200 rounded mt-2"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 w-20 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 w-24 bg-gray-200 rounded"></div>
                          <div className="h-3 w-16 bg-gray-200 rounded mt-2"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-6 w-16 bg-gray-200 rounded"></div>
                        </td>
                      </tr>
                    ))
                : payments.map((payment) => (
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
                        {payment.due_date && (
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
                    </tr>
                  ))}
              {!loadingPayments && payments.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-10 text-center text-sm text-gray-500"
                  >
                    No pending payments found
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
                className="text-sm text-emerald-600 cursor-pointer hover:underline"
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
                  {loadingProperties
                    ? // Loading skeleton
                      Array(3)
                        .fill()
                        .map((_, index) => (
                          <tr
                            key={`property-skeleton-${index}`}
                            className="animate-pulse"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 w-32 bg-gray-200 rounded"></div>
                              <div className="h-3 w-20 bg-gray-200 rounded mt-2"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 w-40 bg-gray-200 rounded"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 w-16 bg-gray-200 rounded"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 w-24 bg-gray-200 rounded"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="h-8 w-16 bg-gray-200 rounded ml-auto"></div>
                            </td>
                          </tr>
                        ))
                    : availableProperties.map((property) => (
                        <tr
                          key={property.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => showPropertyDetails(property)}
                        >
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
                              {property.size.toLocaleString()}{" "}
                              {property.size_unit}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ₱{property.price.toFixed(2)}
                            </div>
                          </td>
                          <td
                            className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => showPropertyDetails(property)}
                              className="text-emerald-600 cursor-pointer hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-md"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                  {!loadingProperties && availableProperties.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-10 text-center text-sm text-gray-500"
                      >
                        No available properties found
                      </td>
                    </tr>
                  )}
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
              {loadingProperties ? (
                // Loading skeleton
                <ul className="divide-y divide-gray-200">
                  {Array(3)
                    .fill()
                    .map((_, index) => (
                      <li
                        key={`cheapest-skeleton-${index}`}
                        className="py-3 animate-pulse"
                      >
                        <div className="h-5 w-48 bg-gray-200 rounded"></div>
                        <div className="h-4 w-40 bg-gray-200 rounded mt-2"></div>
                        <div className="h-4 w-32 bg-gray-200 rounded mt-2"></div>
                      </li>
                    ))}
                </ul>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {cheapestProperties.map((property) => (
                    <li
                      key={property.id}
                      className="py-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => showPropertyDetails(property)}
                    >
                      <div className="flex justify-between items-center">
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
                              • {property.size.toLocaleString()}{" "}
                              {property.size_unit}
                            </span>
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            showPropertyDetails(property);
                          }}
                          className="text-emerald-600 cursor-pointer hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-md text-xs"
                        >
                          View
                        </button>
                      </div>
                    </li>
                  ))}
                  {cheapestProperties.length === 0 && (
                    <li className="py-6 text-center text-gray-500">
                      No properties available
                    </li>
                  )}
                </ul>
              )}
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
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-4 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 backdrop-blur-sm bg-transparent bg-opacity-40 transition-opacity"
              aria-hidden="true"
              onClick={() => setPropertyDetailsVisible(false)}
            ></div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
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
                            {selectedProperty.size.toLocaleString()}{" "}
                            {selectedProperty.size_unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Price per sqm</p>
                          <p className="text-sm font-medium">
                            ₱{selectedProperty.price_per_sqm.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Price</p>
                          <p className="text-base font-bold text-emerald-600 bg-emerald-50 p-2 rounded-md text-center">
                            ₱{selectedProperty.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <p className="text-sm text-gray-500">Description</p>
                        <p className="text-sm mt-1">
                          This {selectedProperty.size.toLocaleString()}{" "}
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
                  className="w-full inline-flex justify-center cursor-pointer rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleInquireClick}
                >
                  Inquire Now
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center cursor-pointer rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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
