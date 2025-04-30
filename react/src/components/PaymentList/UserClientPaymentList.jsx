import React, { useState, useEffect } from "react";
import {
  Search,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  MoreVertical,
  ChevronDown,
  Filter,
  Calendar,
  Calendar as CalendarIcon,
  ArrowLeft,
} from "lucide-react";
import axiosClient from "../../axios.client";
import { useStateContext } from "../../context/ContextProvider";
import UserClientPaymentDetailsInfo from "./UserClientPaymentDetailsInfo";

export default function UserClientPaymentList() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const { user } = useStateContext();

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

  // Get current date info for filtering
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Add styles for row click animation
  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = `
      .row-clickable {
        transition: transform 0.15s ease, background-color 0.15s ease;
      }
      
      .row-clickable:active {
        transform: scale(0.99);
        background-color: rgba(209, 213, 219, 0.5) !important;
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

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

    // Add capture phase to ensure this runs before other click handlers
    document.addEventListener("mousedown", handleClickOutside, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [openDropdown]);

  // Fetch client payments
  useEffect(() => {
    fetchPayments();
  }, []);

  // Function to fetch payments from API
  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.get("/client-payments/my-payments");
      setPayments(response.data);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError("Failed to load your payments. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch payment transactions for a specific payment
  const fetchPaymentTransactions = async (paymentId) => {
    setLoadingTransactions(true);
    try {
      const response = await axiosClient.get(
        `/client-payments/${paymentId}/transactions`
      );
      return response.data;
    } catch (err) {
      console.error("Error fetching payment transactions:", err);
      return [];
    } finally {
      setLoadingTransactions(false);
    }
  };

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

  const viewPaymentDetails = async (payment) => {
    // Fetch transactions before setting the selected payment
    const transactions = await fetchPaymentTransactions(payment.id);

    // Create a new payment object with transactions included
    const paymentWithTransactions = {
      ...payment,
      paymentTransactions: transactions,
    };

    setSelectedPayment(paymentWithTransactions);
  };

  const backToList = () => {
    setSelectedPayment(null);
  };

  // Check if a payment is past due
  const isPastDue = (payment) => {
    if (payment.payment_status === "COMPLETED" || !payment.next_payment_date) {
      return false;
    }

    const nextPaymentDate = new Date(payment.next_payment_date);
    const today = new Date();

    // Reset time to compare just the dates
    nextPaymentDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return nextPaymentDate < today;
  };

  // Get the last payment date from transactions or payment schedules
  const getLastPaymentDate = (payment) => {
    if (payment.payment_status === "COMPLETED") {
      // For completed payments, return completion date if available
      return payment.payment_schedules && payment.payment_schedules.length > 0
        ? formatDate(
            payment.payment_schedules[payment.payment_schedules.length - 1]
              .due_date
          )
        : "—";
    }

    // For ongoing payments, find the last paid schedule
    if (payment.payment_schedules && payment.payment_schedules.length > 0) {
      const paidSchedules = payment.payment_schedules
        .filter((schedule) => schedule.status === "PAID")
        .sort((a, b) => new Date(b.due_date) - new Date(a.due_date));

      if (paidSchedules.length > 0) {
        return formatDate(paidSchedules[0].due_date);
      }
    }

    return "—";
  };

  // Calculate total amount paid so far
  const getTotalPaid = (payment) => {
    if (payment.payment_status === "COMPLETED") {
      return payment.total_amount;
    }

    if (payment.payment_type === "installment" && payment.payment_schedules) {
      const paidAmount = payment.payment_schedules
        .filter((schedule) => schedule.status === "PAID")
        .reduce((sum, schedule) => sum + parseFloat(schedule.amount), 0);

      return paidAmount;
    }

    return 0;
  };

  // Get next payment amount
  const getNextPaymentAmount = (payment) => {
    if (
      payment.payment_status === "COMPLETED" ||
      payment.payment_type === "spot_cash"
    ) {
      return null;
    }

    if (payment.payment_schedules && payment.payment_schedules.length > 0) {
      const nextPaymentNumber = payment.completed_payments + 1;
      const nextSchedule = payment.payment_schedules.find(
        (s) => s.payment_number === nextPaymentNumber
      );

      if (nextSchedule) {
        return nextSchedule.amount;
      }
    }

    // Fallback - estimate based on total amount and installment years
    if (payment.installment_years && payment.total_amount) {
      return Math.floor(
        payment.total_amount / (payment.installment_years * 12)
      );
    }

    return null;
  };

  // Render payment status badge
  const renderPaymentStatus = (payment) => {
    // First check if payment is past due
    if (isPastDue(payment)) {
      return (
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
          <AlertCircle className="w-3 h-3 mr-1" /> Past Due
        </span>
      );
    }

    // Then check regular status
    let displayStatus = "pending";

    if (payment.payment_status === "COMPLETED") displayStatus = "paid";
    else if (payment.payment_status === "ONGOING") displayStatus = "pending";
    else if (
      payment.payment_status === "LATE" ||
      payment.payment_status === "SUPER LATE"
    )
      displayStatus = "overdue";

    switch (displayStatus) {
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
            {payment.payment_status}
          </span>
        );
    }
  };

  // Render action buttons or dropdown based on screen size
  const renderActions = (payment) => {
    // Display buttons directly on larger screens
    if (!isMobile && !isSmall) {
      return (
        <div className="flex items-center justify-end space-x-2">
          <button
            className="px-3 py-1.5 text-xs rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center"
            onClick={(e) => {
              e.stopPropagation();
              viewPaymentDetails(payment);
            }}
          >
            <Eye size={14} className="mr-1" />
            <span>View</span>
          </button>
          {payment.payment_status === "COMPLETED" && (
            <button
              className="px-3 py-1.5 text-xs rounded-md bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                console.log("Download receipt", payment);
              }}
            >
              <Download size={14} className="mr-1" />
              <span>Receipt</span>
            </button>
          )}
        </div>
      );
    }

    // Use dropdown for mobile/small screens
    return (
      <div className={`relative dropdown-${payment.id}`}>
        <button
          className="p-1 rounded-full hover:bg-gray-200 focus:outline-none cursor-pointer"
          onClick={(e) => toggleDropdown(payment.id, e)}
          aria-label="Open actions menu"
        >
          <MoreVertical size={20} />
        </button>
        {openDropdown === payment.id && (
          <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg overflow-hidden z-50 w-40">
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                viewPaymentDetails(payment);
              }}
            >
              <Eye size={16} className="mr-2" />
              <span>View Details</span>
            </button>
            {payment.payment_status === "COMPLETED" && (
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("Download receipt", payment);
                }}
              >
                <Download size={16} className="mr-2" />
                <span>Download Receipt</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render expanded row details for mobile view
  const renderExpandedDetails = (payment) => {
    // Get the first lot in the payment
    const lot =
      payment.lots && payment.lots.length > 0 ? payment.lots[0] : null;

    const totalPaid = getTotalPaid(payment);
    const nextPaymentAmount = getNextPaymentAmount(payment);
    const lastPaymentDate = getLastPaymentDate(payment);

    return (
      <tr className="bg-gray-50">
        <td colSpan="4" className="px-4 py-3">
          <div className="grid grid-cols-2 gap-4">
            {lot && (
              <>
                <div>
                  <div className="text-xs font-medium text-gray-500">
                    Property
                  </div>
                  <div className="text-sm">{lot.property_name}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500">
                    Block & Lot
                  </div>
                  <div className="text-sm">{lot.block_lot_no || "—"}</div>
                </div>
              </>
            )}

            <div>
              <div className="text-xs font-medium text-gray-500">
                Total Paid
              </div>
              <div className="text-sm">
                ₱{new Intl.NumberFormat().format(totalPaid)}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-gray-500">
                Last Payment Date
              </div>
              <div className="text-sm">{lastPaymentDate}</div>
            </div>

            <div>
              <div className="text-xs font-medium text-gray-500">
                Payment Type
              </div>
              <div className="text-sm">
                {payment.payment_type === "spot_cash"
                  ? "Spot Cash"
                  : "Installment"}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-gray-500">
                Total Amount
              </div>
              <div className="text-sm">
                ₱{new Intl.NumberFormat().format(payment.total_amount)}
              </div>
            </div>

            {payment.payment_type === "installment" && nextPaymentAmount && (
              <>
                <div>
                  <div className="text-xs font-medium text-gray-500">
                    Next Payment Date
                  </div>
                  <div className="text-sm">
                    {formatDate(payment.next_payment_date)}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500">
                    Next Payment Amount
                  </div>
                  <div className="text-sm">
                    ₱{new Intl.NumberFormat().format(nextPaymentAmount)}
                  </div>
                </div>
              </>
            )}

            {payment.payment_notes && (
              <div className="col-span-2">
                <div className="text-xs font-medium text-gray-500">Notes</div>
                <div className="text-sm">{payment.payment_notes}</div>
              </div>
            )}
          </div>
        </td>
      </tr>
    );
  };

  // Filter and search payments
  const filteredPayments = payments.filter((payment) => {
    // Get property name from first lot if available
    const lot =
      payment.lots && payment.lots.length > 0 ? payment.lots[0] : null;
    const propertyName = lot ? lot.property_name || "" : "";

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      propertyName.toLowerCase().includes(searchLower) ||
      payment.client_name?.toLowerCase().includes(searchLower) ||
      payment.payment_type?.toLowerCase().includes(searchLower);

    // Filter by time period
    if (filterPeriod === "all") {
      return matchesSearch;
    } else if (filterPeriod === "thisMonth") {
      const paymentDate = new Date(payment.start_date);
      return (
        matchesSearch &&
        paymentDate.getMonth() === currentMonth &&
        paymentDate.getFullYear() === currentYear
      );
    } else if (filterPeriod === "lastMonth") {
      const paymentDate = new Date(payment.start_date);
      return (
        matchesSearch &&
        paymentDate.getMonth() === lastMonth &&
        paymentDate.getFullYear() === lastMonthYear
      );
    } else if (filterPeriod === "thisYear") {
      const paymentDate = new Date(payment.start_date);
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

  // If a payment is selected, display the payment details instead of the list
  if (selectedPayment) {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={backToList}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={16} className="mr-1" />
            <span>Back to Payment List</span>
          </button>
        </div>
        <UserClientPaymentDetailsInfo
          payment={selectedPayment}
          paymentStatus={{ status: selectedPayment.payment_status }}
        />
      </div>
    );
  }

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
                placeholder="Search properties..."
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
                    Property
                  </th>
                  {!isMobile && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Payment
                    </th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Paid
                  </th>
                  {!isSmall && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Payment
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
                  filteredPayments.map((payment) => {
                    // Get first lot for display
                    const lot =
                      payment.lots && payment.lots.length > 0
                        ? payment.lots[0]
                        : null;
                    const propertyName = lot
                      ? lot.property_name
                      : "Unknown Property";

                    const totalPaid = getTotalPaid(payment);
                    const nextPaymentAmount = getNextPaymentAmount(payment);
                    const lastPaymentDate = getLastPaymentDate(payment);

                    return (
                      <React.Fragment key={payment.id}>
                        <tr
                          className={`row-clickable hover:bg-gray-50 cursor-pointer ${
                            isPastDue(payment) ? "bg-red-50" : ""
                          }`}
                          onClick={(e) => {
                            // Add a brief visual feedback when clicking
                            const row = e.currentTarget;
                            row.style.backgroundColor =
                              "rgba(209, 213, 219, 0.5)";

                            // Use setTimeout to allow the visual feedback to be visible before navigation
                            setTimeout(() => {
                              viewPaymentDetails(payment);
                            }, 150);
                          }}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="ml-0">
                                <div className="text-sm font-medium text-gray-900">
                                  {propertyName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {payment.payment_type === "installment"
                                    ? `${payment.completed_payments}/${
                                        payment.installment_years * 12
                                      } payments`
                                    : "Full Payment"}
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
                              <div className="text-sm text-gray-900 flex items-center">
                                <CalendarIcon className="w-3 h-3 mr-1" />
                                {lastPaymentDate}
                              </div>
                            </td>
                          )}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              ₱ {new Intl.NumberFormat().format(totalPaid)}
                            </div>
                          </td>
                          {!isSmall && (
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {payment.next_payment_date ? (
                                  <div>
                                    <div className="flex items-center">
                                      <Calendar className="w-3 h-3 mr-1" />
                                      {formatDate(payment.next_payment_date)}
                                    </div>
                                    {nextPaymentAmount && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        ₱
                                        {new Intl.NumberFormat().format(
                                          nextPaymentAmount
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ) : payment.payment_status === "COMPLETED" ? (
                                  "Completed"
                                ) : (
                                  "—"
                                )}
                              </div>
                            </td>
                          )}
                          <td className="px-4 py-3 whitespace-nowrap">
                            {renderPaymentStatus(payment)}
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile information note */}
          {(isMobile || isSmall) && !loading && filteredPayments.length > 0 && (
            <div className="mt-4 text-center">
              <span className="text-xs text-gray-500">
                Tap a row to see payment details. Tap the menu icon (⋮) to view
                actions.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
