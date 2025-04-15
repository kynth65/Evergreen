import React, { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  MoreVertical,
  ChevronDown,
  Filter,
  Calendar,
  FileText,
  Home,
} from "lucide-react";

export default function UserClientPaymentList() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [paymentDetailsVisible, setPaymentDetailsVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Responsive breakpoints
  const breakpoints = {
    xs: 480, // Extra small devices
    sm: 576, // Small devices
    md: 768, // Medium devices
    lg: 992, // Large devices
    xl: 1200, // Extra large devices
  };

  // Colors - matching theme
  const colors = {
    primary: "#1da57a", // Primary green
    secondary: "#52c41a", // Secondary lighter green
    warning: "#faad14",
    success: "#52c41a",
    error: "#f5222d",
    lightBg: "#f6ffed", // Light green background
  };

  // Check if we're on a mobile device
  const isMobile = screenWidth < breakpoints.md;
  // Check if we're on a small device
  const isSmall = screenWidth < breakpoints.lg;

  // Current client info - hardcoded for demo
  const currentClient = {
    id: 201,
    name: "Carlos Reyes",
    email: "carlos.reyes@example.com",
  };

  // Get current date info for filtering
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Mock data for client payments
  const mockPayments = [
    {
      id: 1,
      property_name: "Green Valley Lot 123",
      property_type: "Residential Lot",
      property_size: "150 sqm",
      property_location: "Block 5, Green Valley Subdivision",
      amount: 10000.0,
      due_date: new Date(currentYear, currentMonth, 15)
        .toISOString()
        .split("T")[0],
      payment_date: new Date(currentYear, currentMonth, 10)
        .toISOString()
        .split("T")[0],
      status: "paid",
      payment_method: "Bank Transfer",
      reference_no: "BT123456789",
      invoice_no: "INV-2025-001-A",
      description: "Monthly amortization for Green Valley Lot 123",
      payment_type: "Monthly Amortization",
      payment_period: "April 2025",
      receipt_url: "/receipts/receipt-001.pdf",
    },
    {
      id: 2,
      property_name: "Green Valley Lot 123",
      property_type: "Residential Lot",
      property_size: "150 sqm",
      property_location: "Block 5, Green Valley Subdivision",
      amount: 10000.0,
      due_date: new Date(currentYear, currentMonth, 15)
        .toISOString()
        .split("T")[0],
      payment_date: null,
      status: "pending",
      payment_method: null,
      reference_no: null,
      invoice_no: "INV-2025-002-A",
      description: "Monthly amortization for Green Valley Lot 123",
      payment_type: "Monthly Amortization",
      payment_period: "May 2025",
      receipt_url: null,
    },
    {
      id: 3,
      property_name: "Green Valley Lot 123",
      property_type: "Residential Lot",
      property_size: "150 sqm",
      property_location: "Block 5, Green Valley Subdivision",
      amount: 10000.0,
      due_date: new Date(currentYear, lastMonth, 15)
        .toISOString()
        .split("T")[0],
      payment_date: new Date(currentYear, lastMonth, 12)
        .toISOString()
        .split("T")[0],
      status: "paid",
      payment_method: "Online Banking",
      reference_no: "OB87654321",
      invoice_no: "INV-2025-003-A",
      description: "Monthly amortization for Green Valley Lot 123",
      payment_type: "Monthly Amortization",
      payment_period: "March 2025",
      receipt_url: "/receipts/receipt-002.pdf",
    },
    {
      id: 4,
      property_name: "Green Valley Lot 123",
      property_type: "Residential Lot",
      property_size: "150 sqm",
      property_location: "Block 5, Green Valley Subdivision",
      amount: 10000.0,
      due_date: new Date(currentYear, currentMonth - 2, 15)
        .toISOString()
        .split("T")[0],
      payment_date: new Date(currentYear, currentMonth - 2, 14)
        .toISOString()
        .split("T")[0],
      status: "paid",
      payment_method: "Cheque",
      reference_no: "CHK-12345",
      invoice_no: "INV-2025-004-A",
      description: "Monthly amortization for Green Valley Lot 123",
      payment_type: "Monthly Amortization",
      payment_period: "February 2025",
      receipt_url: "/receipts/receipt-003.pdf",
    },
    {
      id: 5,
      property_name: "Green Valley Lot 123",
      property_type: "Residential Lot",
      property_size: "150 sqm",
      property_location: "Block 5, Green Valley Subdivision",
      amount: 10000.0,
      due_date: new Date(currentYear, currentMonth - 3, 15)
        .toISOString()
        .split("T")[0],
      payment_date: new Date(currentYear, currentMonth - 3, 10)
        .toISOString()
        .split("T")[0],
      status: "paid",
      payment_method: "Bank Transfer",
      reference_no: "BT-98765",
      invoice_no: "INV-2025-005-A",
      description: "Monthly amortization for Green Valley Lot 123",
      payment_type: "Monthly Amortization",
      payment_period: "January 2025",
      receipt_url: "/receipts/receipt-004.pdf",
    },
    {
      id: 6,
      property_name: "Sunview Residences Lot 45",
      property_type: "Residential Lot",
      property_size: "200 sqm",
      property_location: "Block 2, Sunview Residences",
      amount: 15000.0,
      due_date: new Date(currentYear, currentMonth + 1, 10)
        .toISOString()
        .split("T")[0],
      payment_date: null,
      status: "upcoming",
      payment_method: null,
      reference_no: null,
      invoice_no: "INV-2025-006-B",
      description: "Monthly amortization for Sunview Residences Lot 45",
      payment_type: "Monthly Amortization",
      payment_period: "June 2025",
      receipt_url: null,
    },
    {
      id: 7,
      property_name: "Green Valley Lot 123",
      property_type: "Residential Lot",
      property_size: "150 sqm",
      property_location: "Block 5, Green Valley Subdivision",
      amount: 50000.0,
      due_date: new Date(currentYear - 1, 11, 20).toISOString().split("T")[0],
      payment_date: new Date(currentYear - 1, 11, 15)
        .toISOString()
        .split("T")[0],
      status: "paid",
      payment_method: "Bank Transfer",
      reference_no: "BT-112233",
      invoice_no: "INV-2024-007-A",
      description: "Downpayment for Green Valley Lot 123",
      payment_type: "Downpayment",
      payment_period: "December 2024",
      receipt_url: "/receipts/receipt-005.pdf",
    },
  ];

  // Update screen width on window resize
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest(`.dropdown-${openDropdown}`)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  // Simulate loading payments
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setPayments(mockPayments);
      setLoading(false);
    }, 1000);
  }, []);

  const toggleDropdown = (paymentId, e) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === paymentId ? null : paymentId);
  };

  const toggleRowExpand = (paymentId) => {
    setExpandedRow(expandedRow === paymentId ? null : paymentId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setPayments(mockPayments);
      setLoading(false);
    }, 1000);
  };

  const showPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setPaymentDetailsVisible(true);
  };

  // Render payment status badge
  const renderPaymentStatus = (status) => {
    switch (status) {
      case "paid":
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" /> Paid
          </span>
        );
      case "pending":
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </span>
        );
      case "overdue":
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" /> Overdue
          </span>
        );
      case "upcoming":
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
            <Calendar className="w-3 h-3 mr-1" /> Upcoming
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  // Render action buttons or dropdown based on screen size
  const renderActions = (payment) => {
    return (
      <div className={`relative dropdown-${payment.id}`}>
        <button
          className="p-1 rounded-full hover:bg-gray-200 focus:outline-none cursor-pointer"
          onClick={(e) => toggleDropdown(payment.id, e)}
        >
          <MoreVertical size={20} />
        </button>
        {openDropdown === payment.id && (
          <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg overflow-hidden z-10 w-40">
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center cursor-pointer"
              onClick={() => showPaymentDetails(payment)}
            >
              <Eye size={16} className="mr-2" />
              <span>View Details</span>
            </button>
            {payment.status === "paid" && (
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center cursor-pointer"
                onClick={() => console.log("Download receipt", payment)}
              >
                <Download size={16} className="mr-2" />
                <span>Download Receipt</span>
              </button>
            )}
            {(payment.status === "pending" ||
              payment.status === "upcoming") && (
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center cursor-pointer text-green-600"
                onClick={() => console.log("Pay now", payment)}
              >
                <CreditCard size={16} className="mr-2" />
                <span>Pay Now</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render expanded row details for mobile view
  const renderExpandedDetails = (payment) => {
    return (
      <tr className="bg-gray-50">
        <td colSpan="4" className="px-4 py-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-gray-500">Property</div>
              <div className="text-sm">{payment.property_name}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500">
                Property Type
              </div>
              <div className="text-sm">{payment.property_type}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500">Due Date</div>
              <div className="text-sm">{formatDate(payment.due_date)}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500">
                Payment Type
              </div>
              <div className="text-sm">{payment.payment_type}</div>
            </div>

            {payment.status === "paid" && (
              <>
                <div>
                  <div className="text-xs font-medium text-gray-500">
                    Payment Date
                  </div>
                  <div className="text-sm">
                    {formatDate(payment.payment_date)}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500">
                    Payment Method
                  </div>
                  <div className="text-sm">{payment.payment_method || "—"}</div>
                </div>
              </>
            )}

            <div>
              <div className="text-xs font-medium text-gray-500">Invoice #</div>
              <div className="text-sm">{payment.invoice_no}</div>
            </div>
            <div className="col-span-2">
              <div className="text-xs font-medium text-gray-500">
                Description
              </div>
              <div className="text-sm">{payment.description}</div>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  // Filter and search payments
  const filteredPayments = payments.filter((payment) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      payment.property_name.toLowerCase().includes(searchLower) ||
      payment.invoice_no.toLowerCase().includes(searchLower) ||
      payment.description.toLowerCase().includes(searchLower) ||
      payment.payment_period.toLowerCase().includes(searchLower);

    // Filter by time period
    if (filterPeriod === "all") {
      return matchesSearch;
    } else if (filterPeriod === "thisMonth") {
      const paymentDate = new Date(payment.due_date);
      return (
        matchesSearch &&
        paymentDate.getMonth() === currentMonth &&
        paymentDate.getFullYear() === currentYear
      );
    } else if (filterPeriod === "lastMonth") {
      const paymentDate = new Date(payment.due_date);
      return (
        matchesSearch &&
        paymentDate.getMonth() === lastMonth &&
        paymentDate.getFullYear() === lastMonthYear
      );
    } else if (filterPeriod === "thisYear") {
      const paymentDate = new Date(payment.due_date);
      return matchesSearch && paymentDate.getFullYear() === currentYear;
    }
    return matchesSearch;
  });

  // Render skeleton loading state
  const renderSkeleton = () => {
    return Array(5)
      .fill(null)
      .map((_, index) => (
        <tr key={index} className="animate-pulse">
          <td className="px-4 py-3 whitespace-nowrap">
            <div className="h-4 w-28 bg-gray-200 rounded"></div>
            <div className="h-3 w-20 bg-gray-200 rounded mt-2"></div>
          </td>
          {!isMobile && (
            <td className="px-4 py-3 whitespace-nowrap">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
            </td>
          )}
          <td className="px-4 py-3 whitespace-nowrap">
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
          </td>
          {!isSmall && (
            <td className="px-4 py-3 whitespace-nowrap">
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
            </td>
          )}
          <td className="px-4 py-3 whitespace-nowrap">
            <div className="h-5 w-16 bg-gray-200 rounded"></div>
          </td>
          <td className="px-4 py-3 whitespace-nowrap text-right">
            <div className="h-6 w-6 bg-gray-200 rounded-full ml-auto"></div>
          </td>
        </tr>
      ));
  };

  return (
    <div className="">
      {/* Header Section */}
      <div
        className="header-section"
        style={{
          marginBottom: isMobile ? "16px" : "20px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          gap: isMobile ? "12px" : "0",
        }}
      >
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
          My Payments
        </h1>
      </div>

      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        {/* Search and Filters Section */}
        <div
          className="p-4 sm:p-6 border-b border-gray-200"
          style={{ backgroundColor: "white" }}
        >
          <div className="flex flex-col sm:flex-row w-full space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search payments..."
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  borderColor: colors.primary,
                }}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            </div>

            <div className="relative">
              <select
                className="pl-4 pr-8 py-2 border rounded-lg appearance-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                style={{ borderColor: colors.primary }}
              >
                <option value="all">All Time</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="thisYear">This Year</option>
              </select>
              <Filter className="absolute right-3 top-2.5 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>

            <button
              className="flex items-center justify-center px-3 py-2 rounded-lg border border-gray-300 transition-colors bg-white cursor-pointer"
              onClick={handleRefresh}
            >
              <RefreshCw size={18} />
              <span className="ml-1 hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
            {error}
          </div>
        )}

        {/* Payments Table */}
        <div className="overflow-x-auto p-4 pt-6 sm:p-10">
          <div className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property / Period
                  </th>
                  {!isMobile && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Type
                    </th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  {!isSmall && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  renderSkeleton()
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      No payments found
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <React.Fragment key={payment.id}>
                      <tr
                        className={`hover:bg-gray-50 ${
                          isMobile || isSmall ? "cursor-pointer" : ""
                        }`}
                        onClick={() =>
                          (isMobile || isSmall) && toggleRowExpand(payment.id)
                        }
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-0">
                              <div className="text-sm font-medium text-gray-900">
                                {payment.property_name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {payment.payment_period}
                                {(isMobile || isSmall) &&
                                  expandedRow === payment.id && (
                                    <ChevronDown
                                      size={16}
                                      className="ml-1 inline"
                                    />
                                  )}
                              </div>
                            </div>
                          </div>
                        </td>
                        {!isMobile && (
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {payment.payment_type}
                            </div>
                          </td>
                        )}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ₱{payment.amount.toFixed(2)}
                          </div>
                        </td>
                        {!isSmall && (
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(payment.due_date)}
                            </div>
                          </td>
                        )}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {renderPaymentStatus(payment.status)}
                        </td>
                        <td
                          className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {renderActions(payment)}
                        </td>
                      </tr>
                      {(isMobile || isSmall) &&
                        expandedRow === payment.id &&
                        renderExpandedDetails(payment)}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile information note */}
          {(isMobile || isSmall) && !loading && filteredPayments.length > 0 && (
            <div className="mt-4 text-center">
              <span className="text-xs text-gray-500">
                Tap a row to see more details. Tap the menu icon (⋮) to view
                actions.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Payment Detail Modal */}
      {paymentDetailsVisible && selectedPayment && (
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
              onClick={() => setPaymentDetailsVisible(false)}
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
                  onClick={() => setPaymentDetailsVisible(false)}
                >
                  <span className="sr-only">Close</span>✕
                </button>
              </div>

              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-center">
                      <h3
                        className="text-lg leading-6 font-medium text-gray-900"
                        id="modal-title"
                      >
                        Payment Details
                      </h3>
                      <div>{renderPaymentStatus(selectedPayment.status)}</div>
                    </div>

                    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Home className="text-green-600 w-5 h-5 mr-2" />
                        <h4 className="text-md font-medium">
                          Property Information
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 gap-3 ml-7">
                        <div>
                          <p className="text-xs text-gray-500">Name</p>
                          <p className="text-sm">
                            {selectedPayment.property_name}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Type</p>
                          <p className="text-sm">
                            {selectedPayment.property_type}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Size</p>
                          <p className="text-sm">
                            {selectedPayment.property_size}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="text-sm">
                            {selectedPayment.property_location}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <CreditCard className="text-green-600 w-5 h-5 mr-2" />
                        <h4 className="text-md font-medium">
                          Payment Information
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 gap-3 ml-7">
                        <div>
                          <p className="text-xs text-gray-500">Amount</p>
                          <p className="text-sm font-medium">
                            ₱{selectedPayment.amount.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Period</p>
                          <p className="text-sm">
                            {selectedPayment.payment_period}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Payment Type</p>
                          <p className="text-sm">
                            {selectedPayment.payment_type}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Due Date</p>
                          <p className="text-sm">
                            {formatDate(selectedPayment.due_date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Invoice #</p>
                          <p className="text-sm">
                            {selectedPayment.invoice_no}
                          </p>
                        </div>
                        {selectedPayment.status === "paid" && (
                          <>
                            <div>
                              <p className="text-xs text-gray-500">
                                Payment Date
                              </p>
                              <p className="text-sm">
                                {formatDate(selectedPayment.payment_date)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">
                                Payment Method
                              </p>
                              <p className="text-sm">
                                {selectedPayment.payment_method}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">
                                Reference #
                              </p>
                              <p className="text-sm">
                                {selectedPayment.reference_no}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center mb-2">
                        <FileText className="text-green-600 w-5 h-5 mr-2" />
                        <h4 className="text-md font-medium">Description</h4>
                      </div>
                      <p className="text-sm ml-7">
                        {selectedPayment.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {selectedPayment.status === "paid" && (
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Receipt
                  </button>
                )}
                {(selectedPayment.status === "pending" ||
                  selectedPayment.status === "upcoming") && (
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay Now
                  </button>
                )}
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setPaymentDetailsVisible(false)}
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
}
