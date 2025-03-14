import React, { useState, useEffect, useRef } from "react";
import { Eye, Download, ArrowLeft, Calculator } from "lucide-react";
import html2pdf from "html2pdf.js";
import "./OCSStyle.css"; // Import the CSS file

const OCSCalculator = () => {
  // View management state
  const [currentView, setCurrentView] = useState("calculator");
  const [appMode, setAppMode] = useState("full"); // 'full' or 'calculator-only'

  // Refs for PDF generation
  const pdfContentRef = useRef(null);

  // Form data state
  const [formData, setFormData] = useState({
    clientName: "",
    project: "BEESCAPES",
    phoneNumber: "",
    reservationDate: "",
    blockLot: "",
    pricePerSqm: "",
    lotArea: "",
    paymentType: "SPOTCASH",
    installmentYears: "2",
    paymentMonth: "",
    paymentDay: "",
    paymentYear: "",
  });

  // Form validation state
  const [formErrors, setFormErrors] = useState({});

  // Calculations state
  const [calculations, setCalculations] = useState({
    totalPrice: 0,
    downPayment: 0,
    monthlyPayment: 0,
    balancePayment: 0,
  });

  // Handler for input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Calculate prices based on form data
  const calculatePrices = () => {
    if (formData.pricePerSqm && formData.lotArea) {
      const basePrice =
        parseFloat(formData.pricePerSqm) * parseFloat(formData.lotArea);
      let downPayment = 0;
      let balance = 0;
      let monthlyPayment = 0;

      if (formData.paymentType === "INSTALLMENT") {
        downPayment = basePrice * 0.2;
        balance = basePrice - downPayment;
        const months = parseInt(formData.installmentYears) * 12;
        monthlyPayment = balance / months;
      }

      setCalculations({
        totalPrice: basePrice,
        downPayment,
        monthlyPayment,
        balancePayment: balance,
      });
    }
  };

  // Effect to recalculate when relevant form data changes
  useEffect(() => {
    calculatePrices();
  }, [
    formData.pricePerSqm,
    formData.lotArea,
    formData.paymentType,
    formData.installmentYears,
  ]);

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format date for display
  const formatDate = (dateString, yearOnly = false) => {
    if (!dateString) return "";
    const date = new Date(dateString);

    if (yearOnly) {
      return date.getFullYear().toString();
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate end date for installment (year only)
  const calculateEndDate = (startDate, years) => {
    if (!startDate) return "Not specified";

    const start = new Date(startDate);
    const endYear = start.getFullYear() + parseInt(years);

    return endYear.toString();
  };

  // Reset form to default values
  const handleReset = () => {
    setFormData({
      clientName: "",
      project: "BEESCAPES",
      phoneNumber: "",
      reservationDate: "",
      blockLot: "",
      pricePerSqm: "",
      lotArea: "",
      paymentType: "SPOTCASH",
      installmentYears: "2",
      paymentMonth: "",
      paymentDay: "",
      paymentYear: "",
    });
    setCalculations({
      totalPrice: 0,
      downPayment: 0,
      monthlyPayment: 0,
      balancePayment: 0,
    });
    setFormErrors({});
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {};

    // Required fields for both calculator-only and full mode
    if (!formData.pricePerSqm)
      errors.pricePerSqm = "Price per sq.m. is required";
    if (!formData.lotArea) errors.lotArea = "Lot area is required";

    // Additional required fields for full mode
    if (appMode === "full") {
      if (!formData.clientName) errors.clientName = "Client name is required";
      if (!formData.phoneNumber)
        errors.phoneNumber = "Contact number is required";
      if (!formData.reservationDate)
        errors.reservationDate = "Reservation date is required";
      if (!formData.blockLot)
        errors.blockLot = "Block and lot number is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission/create OCS
  const handleCreateOCS = () => {
    if (!validateForm()) {
      return; // Stop if validation fails
    }

    calculatePrices();

    if (appMode === "calculator-only") {
      return; // Just show calculations for calculator-only mode
    }

    setCurrentView("result");
  };

  // Fixed PDF generation function to handle the color function error
  const handleDownloadPDF = () => {
    // Show loading indicator or notify user
    const prevButton = document.activeElement;
    if (prevButton) prevButton.disabled = true;

    // Create a copy of the form to modify for PDF generation
    const printArea = pdfContentRef.current.cloneNode(true);

    // Apply PDF styling directly to avoid custom CSS with oklch
    printArea.style.width = "100%";
    printArea.style.maxWidth = "200mm"; // A4 width
    printArea.style.margin = "0";
    printArea.style.padding = "0";
    printArea.style.fontSize = "9px";
    printArea.style.lineHeight = "1.2";
    printArea.style.fontFamily = "Arial, sans-serif";
    printArea.style.border = "1px solid #000";
    printArea.style.borderWidth = "1px";
    printArea.style.borderStyle = "solid";
    printArea.style.borderColor = "#000";
    printArea.style.boxSizing = "border-box";

    // Fix oklch color issues by replacing them with standard hex colors
    // Find all elements with text-green-600, bg-green-600, etc. classes
    const greenTextElements = printArea.querySelectorAll(
      ".text-green-600, .text-green-700"
    );
    greenTextElements.forEach((el) => {
      el.style.color = "#16a34a"; // Replace with hex color
      el.className = el.className.replace(/text-green-[^ ]*/g, "");
    });

    const greenBgElements = printArea.querySelectorAll(
      ".bg-green-600, .bg-green-700, .bg-green-50"
    );
    greenBgElements.forEach((el) => {
      if (el.classList.contains("bg-green-50")) {
        el.style.backgroundColor = "#f0f8f0"; // Light green
      } else {
        el.style.backgroundColor = "#16a34a"; // Green for headers
        el.style.color = "#ffffff"; // White text for dark bg
      }
      el.className = el.className.replace(/bg-green-[^ ]*/g, "");
    });

    // Handle other tailwind classes that might use modern color functions
    const tailwindBorderElements =
      printArea.querySelectorAll("[class*='border-']");
    tailwindBorderElements.forEach((el) => {
      if (el.className.includes("border-green")) {
        el.style.borderColor = "#16a34a";
      } else if (el.className.includes("border-gray")) {
        el.style.borderColor = "#d1d5db";
      } else if (el.className.includes("border-red")) {
        el.style.borderColor = "#ef4444";
      }
    });

    // Style section titles for pdf
    const sectionTitles = printArea.querySelectorAll(".section-title");
    sectionTitles.forEach((title) => {
      title.style.padding = "0px 0px 6px 4px";
      title.style.fontSize = "10px";
      title.style.marginBottom = "0";
      title.style.marginTop = "0";
      title.style.textAlign = "center";
      title.style.backgroundColor = "#f0f0f0";
      title.style.fontWeight = "bold";
      title.style.border = "1px solid #000";
      title.style.color = "#000000"; // Ensure no oklch colors
    });

    // Fix tables
    const tables = printArea.querySelectorAll("table, .info-table, .border");
    tables.forEach((table) => {
      table.style.fontSize = "9px";
      table.style.marginBottom = "0";
      table.style.width = "100%";
      table.style.tableLayout = "fixed";
      table.style.borderCollapse = "collapse";
      table.style.border = "1px solid #000";
    });

    // Style table cells
    const tableCells = printArea.querySelectorAll(
      "td, th, .p-2, .grid-cols-4 > div"
    );
    tableCells.forEach((cell) => {
      cell.style.padding = "2px 4px";
      cell.style.border = "1px solid #000";
      cell.style.fontSize = "9px";
      cell.style.verticalAlign = "middle";
    });

    // Process all input elements in the document to replace with static content
    const processInputElements = (element) => {
      // Process all direct input children
      Array.from(element.querySelectorAll("input, select")).forEach((input) => {
        let textContent = "";

        if (input.tagName === "SELECT") {
          textContent = input.options[input.selectedIndex]?.text || "";
        } else if (input.type === "checkbox") {
          const span = document.createElement("span");
          span.innerHTML = input.checked ? "☑" : "☐";
          input.parentNode.replaceChild(span, input);
          return; // Skip the rest for checkboxes
        } else {
          textContent = input.value || "";
        }

        const span = document.createElement("span");
        span.style.fontSize = "9px";
        span.style.width = "100%";
        span.style.display = "inline-block";
        span.textContent = textContent;
        input.parentNode.replaceChild(span, input);
      });
    };

    // Process all input elements
    processInputElements(printArea);

    // Create configuration for jsPDF
    const opt = {
      margin: [5, 3, 5, 5], // Margins similar to Avida form
      filename: `EVERGREEN_OCS_${
        formData.clientName.replace(/\s+/g, "_") || "FORM"
      }.pdf`,
      image: { type: "jpeg", quality: 0.98 }, // High quality for clear text
      html2canvas: {
        scale: 2, // Higher scale for better quality
        letterRendering: true,
        useCORS: true,
        logging: false,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        compress: true,
      },
      // Force single page
      pagebreak: { mode: ["avoid-all"] },
    };

    // Use a try-catch block to handle any errors during PDF generation
    try {
      html2pdf()
        .from(printArea)
        .set(opt)
        .save()
        .then(() => {
          // Re-enable button after PDF generation completes
          if (prevButton) prevButton.disabled = false;
        })
        .catch((err) => {
          console.error("PDF generation error:", err);
          alert("There was an error generating the PDF. Please try again.");
          if (prevButton) prevButton.disabled = false;
        });
    } catch (err) {
      console.error("Error initiating PDF generation:", err);
      alert("Could not start PDF generation. Please try again.");
      if (prevButton) prevButton.disabled = false;
    }
  };

  // Generate installment breakdown for PDF
  const generateInstallmentBreakdown = () => {
    return (
      <div className="grid">
        <div className="payment-grid total-price-row">
          <div>TOTAL CONTRACT PRICE</div>
          <div className="text-right">
            ₱ {formatCurrency(calculations.totalPrice)}
          </div>
        </div>
        <div className="payment-grid highlight-coral">
          <div>DOWNPAYMENT (20%)</div>
          <div className="text-right">
            ₱ {formatCurrency(calculations.downPayment)}
          </div>
        </div>
        <div className="payment-grid">
          <div>Reservation Fee (Deductible from Downpayment)</div>
          <div className="text-right">₱ 20,000.00</div>
        </div>

        <div className="payment-grid highlight-coral">
          <div>BALANCE PAYMENT</div>
          <div className="text-right">
            ₱ {formatCurrency(calculations.balancePayment)}
          </div>
        </div>
        <div className="payment-grid">
          <div className="italic">{formData.installmentYears} years</div>
          <div className="text-right">Monthly Installment</div>
        </div>
        <div className="payment-grid">
          <div className="italic">Every 30th of the month</div>
          <div className="text-right highlighted">
            ₱ {formatCurrency(calculations.monthlyPayment)}
          </div>
        </div>
        <div className="payment-grid">
          <div className="italic">
            {parseInt(formData.installmentYears) * 12} months
          </div>
          <div></div>
        </div>
        <div className="payment-grid">
          <div>Start Year</div>
          <div className="text-right italic">
            {formatDate(formData.reservationDate, true) || "Not specified"}
          </div>
        </div>
        <div className="payment-grid">
          <div>End Year</div>
          <div className="text-right italic">
            {calculateEndDate(
              formData.reservationDate,
              formData.installmentYears
            )}
          </div>
        </div>
      </div>
    );
  };

  // Generate spotcash breakdown for PDF
  const generateSpotcashBreakdown = () => {
    return (
      <div className="grid">
        <div className="payment-grid total-price-row">
          <div>TOTAL CONTRACT PRICE</div>
          <div className="text-right">
            ₱ {formatCurrency(calculations.totalPrice)}
          </div>
        </div>
        <div className="payment-grid highlight-coral">
          <div>SPOTCASH</div>
          <div className="text-right">
            ₱ {formatCurrency(calculations.totalPrice)}
          </div>
        </div>
        <div className="payment-grid">
          <div className="italic" style={{ color: "#dc2626" }}>
            Total amount shall be payable within a month.
          </div>
          <div></div>
        </div>
        <div className="payment-grid">
          <div className="italic" style={{ color: "#dc2626" }}>
            Initial reservation fee of ₱20,000.00 is required and will be
            deducted from the total price.
          </div>
          <div></div>
        </div>
        <div className="payment-grid">
          <div>Total Amount</div>
          <div className="text-right">
            ₱ {formatCurrency(calculations.totalPrice)}
          </div>
        </div>
      </div>
    );
  };

  // Render calculator view
  const renderCalculatorView = () => (
    <div className="w-full" id="calculatorView">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-200 pb-4 mb-6">
          <h2 className="text-xl font-bold text-green-600 mb-4 md:mb-0">
            {appMode === "full"
              ? "Official Computation Sheet"
              : "Quick Calculator"}
          </h2>
          <div className="flex space-x-2">
            <button
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                appMode === "full"
                  ? "bg-green-600 text-white"
                  : "bg-green-50 text-green-600 border border-green-600"
              }`}
              onClick={() => setAppMode("full")}
            >
              Full OCS
            </button>
            <button
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                appMode === "calculator-only"
                  ? "bg-green-600 text-white"
                  : "bg-green-50 text-green-600 border border-green-600"
              }`}
              onClick={() => setAppMode("calculator-only")}
            >
              Calculator
            </button>
          </div>
        </div>

        <form className="space-y-6">
          {appMode === "full" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-medium text-green-600 mb-2">
                    Client Name*
                  </label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    className={`w-full h-12 px-4 py-3 text-base border ${
                      formErrors.clientName
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500`}
                    placeholder="Enter client name"
                    required
                  />
                  {formErrors.clientName && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.clientName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-base font-medium text-green-600 mb-2">
                    Project*
                  </label>
                  <input
                    type="text"
                    name="project"
                    value={formData.project}
                    onChange={handleInputChange}
                    className={`w-full h-12 px-4 py-3 text-base border ${
                      formErrors.project ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500`}
                    required
                  />
                  {formErrors.project && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.project}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-medium text-green-600 mb-2">
                    Contact Number*
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`w-full h-12 px-4 py-3 text-base border ${
                      formErrors.phoneNumber
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500`}
                    placeholder="Enter contact number"
                    required
                  />
                  {formErrors.phoneNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.phoneNumber}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-base font-medium text-green-600 mb-2">
                    Reservation Date*
                  </label>
                  <input
                    type="date"
                    name="reservationDate"
                    value={formData.reservationDate}
                    onChange={handleInputChange}
                    className={`w-full h-12 px-4 py-3 text-base border ${
                      formErrors.reservationDate
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500`}
                    required
                  />
                  {formErrors.reservationDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.reservationDate}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-base font-medium text-green-600 mb-2">
                  Block and Lot Number*
                </label>
                <input
                  type="text"
                  name="blockLot"
                  value={formData.blockLot}
                  onChange={handleInputChange}
                  className={`w-full h-12 px-4 py-3 text-base border ${
                    formErrors.blockLot ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500`}
                  placeholder="Enter Block and Lot"
                  required
                />
                {formErrors.blockLot && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.blockLot}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-medium text-green-600 mb-2">
                  Price per sq.m.*
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500 text-base">
                    ₱
                  </span>
                  <input
                    type="number"
                    name="pricePerSqm"
                    value={formData.pricePerSqm}
                    onChange={handleInputChange}
                    className={`w-full h-12 pl-8 pr-4 py-3 text-base border ${
                      formErrors.pricePerSqm
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500`}
                    placeholder="0.00"
                    required
                  />
                  {formErrors.pricePerSqm && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.pricePerSqm}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-base font-medium text-green-600 mb-2">
                  Lot Area (sq.m.)*
                </label>
                <input
                  type="number"
                  name="lotArea"
                  value={formData.lotArea}
                  onChange={handleInputChange}
                  className={`w-full h-12 px-4 py-3 text-base border ${
                    formErrors.lotArea ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500`}
                  placeholder="Enter lot area"
                  required
                />
                {formErrors.lotArea && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.lotArea}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-medium text-green-600 mb-2">
                  Payment Type*
                </label>
                <select
                  name="paymentType"
                  value={formData.paymentType}
                  onChange={handleInputChange}
                  className="w-full h-12 px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="SPOTCASH">Spot Cash</option>
                  <option value="INSTALLMENT">Installment</option>
                </select>
              </div>
              {formData.paymentType === "INSTALLMENT" && (
                <div>
                  <label className="block text-base font-medium text-green-600 mb-2">
                    Installment Period*
                  </label>
                  <select
                    name="installmentYears"
                    value={formData.installmentYears}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="2">2 Years (24 months)</option>
                    <option value="3">3 Years (36 months)</option>
                    <option value="4">4 Years (48 months)</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </form>

        {calculations.totalPrice > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-green-600 mb-4">
              BREAKDOWN OF PAYMENT
            </h2>
            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <h3 className="text-base font-semibold text-green-600 mb-4 border-b pb-2">
                {formData.paymentType === "INSTALLMENT"
                  ? "INSTALLMENT BREAKDOWN"
                  : "SPOTCASH PAYMENT"}
              </h3>

              <div className="flex justify-between items-baseline mb-3">
                <span className="text-sm text-gray-600 font-medium">
                  Total Contract Price:
                </span>
                <span className="text-xl font-bold text-green-600">
                  ₱ {formatCurrency(calculations.totalPrice)}
                </span>
              </div>

              {formData.paymentType === "INSTALLMENT" ? (
                <>
                  <div className="flex justify-between items-baseline mb-3">
                    <span className="text-sm text-gray-600 font-medium">
                      Down Payment (20%):
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      ₱ {formatCurrency(calculations.downPayment)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline mb-3">
                    <span className="text-sm text-gray-600 font-medium">
                      Balance:
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      ₱ {formatCurrency(calculations.balancePayment)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline mb-3">
                    <span className="text-sm text-gray-600 font-medium">
                      Monthly Payment:
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      ₱ {formatCurrency(calculations.monthlyPayment)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-4 pt-2 border-t">
                    Terms: {formData.installmentYears} years (
                    {parseInt(formData.installmentYears) * 12} months)
                    <br />
                    Initial reservation fee of ₱20,000.00 is required and will
                    be deducted from the 20% down payment.
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500 mt-4 pt-2 border-t">
                  Total amount shall be payable within a month.
                  <br />
                  Initial reservation fee of ₱20,000.00 is required and will be
                  deducted from the total contract price.
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={handleCreateOCS}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium transition-colors flex justify-center items-center btn btn-primary"
            type="button"
          >
            {appMode === "full" ? "Create OCS" : "Calculate"}
          </button>
          <button
            onClick={handleReset}
            className="flex-1 bg-white hover:bg-gray-50 text-green-600 border border-green-600 py-2 px-4 rounded-md font-medium transition-colors flex justify-center items-center btn btn-secondary"
            type="button"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );

  // Render result view with PDF content
  const renderResultView = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="border-b border-gray-200 p-4 md:p-6 form-actions">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl font-bold text-green-600">
            Official Computation Sheet Preview
          </h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium transition-colors btn btn-primary"
            >
              <Download size={16} className="mr-2" />
              Download PDF
            </button>
            <button
              onClick={() => setCurrentView("calculator")}
              className="inline-flex items-center justify-center bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 py-2 px-4 rounded-md font-medium transition-colors btn btn-secondary"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Calculator
            </button>
          </div>
        </div>
      </div>

      <div id="pdfContent" ref={pdfContentRef} className="p-8 bg-white">
        <div className="text-center mb-10 header-title">
          <h1 className="text-2xl font-bold text-green-600 mb-2">
            Evergreen Realty Philippines
          </h1>
          <h2 className="text-xl font-semibold text-green-600">
            Official Computation Sheet (OCS)
          </h2>
        </div>

        <div className="mb-8 ocs-section">
          <h3 className="section-title text-lg mb-4 text-green-600">
            Client Information
          </h3>
          <div className="border border-gray-200 rounded-md overflow-hidden info-table">
            <div className="grid grid-cols-4 border-b border-gray-200">
              <div className="p-2 border-r border-gray-200 bg-gray-50 font-medium label-cell">
                Client Name:
              </div>
              <div className="p-2 border-r border-gray-200">
                {formData.clientName}
              </div>
              <div className="p-2 border-r border-gray-200 bg-gray-50 font-medium label-cell">
                Contact Number:
              </div>
              <div className="p-2">{formData.phoneNumber}</div>
            </div>
            <div className="grid grid-cols-4">
              <div className="p-2 border-r border-gray-200 bg-gray-50 font-medium label-cell">
                Reservation Date:
              </div>
              <div className="p-2 border-r border-gray-200">
                {formatDate(formData.reservationDate)}
              </div>
              <div className="p-2 border-r border-gray-200 bg-gray-50 font-medium label-cell">
                Block and Lot Number:
              </div>
              <div className="p-2">{formData.blockLot}</div>
            </div>
          </div>
        </div>

        <div className="mb-8 ocs-section">
          <h3 className="section-title text-lg mb-4 text-green-600">
            Property Details
          </h3>
          <div className="border border-gray-200 rounded-md overflow-hidden info-table">
            <div className="grid grid-cols-4 border-b border-gray-200">
              <div className="p-2 border-r border-gray-200 bg-gray-50 font-medium label-cell">
                Project:
              </div>
              <div className="p-2 border-r border-gray-200">
                {formData.project}
              </div>
              <div className="p-2 border-r border-gray-200 bg-gray-50 font-medium label-cell">
                Lot Area:
              </div>
              <div className="p-2">{formData.lotArea} sq.m.</div>
            </div>
            <div className="grid grid-cols-4">
              <div className="p-2 border-r border-gray-200 bg-gray-50 font-medium label-cell">
                Price per sq.m.:
              </div>
              <div className="p-2 border-r border-gray-200">
                ₱ {formatCurrency(formData.pricePerSqm)}
              </div>
              <div className="p-2 border-r border-gray-200 bg-gray-50 font-medium label-cell">
                Type:
              </div>
              <div className="p-2">Agricultural</div>
            </div>
          </div>
        </div>

        <div className="ocs-section">
          <div className="bg-green-600 text-white p-4 text-center font-bold text-lg mb-6 rounded-t-md section-title">
            BREAKDOWN OF PAYMENT
          </div>
          <div className="border border-gray-200 border-t-0 rounded-b-md p-4 info-table">
            {formData.paymentType === "INSTALLMENT"
              ? generateInstallmentBreakdown()
              : generateSpotcashBreakdown()}
          </div>
        </div>

        <div className="mt-12 border-t border-gray-300 pt-6 signature-section">
          <div className="signature-box">
            <div className="signature-line"></div>
            <p className="signature-title">Prepared by</p>
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <p className="signature-title">
              Conforme: Client's Signature over Printed Name
            </p>
          </div>
        </div>

        <div className="mt-12 text-center text-xs text-gray-500 footer-text">
          <p>
            This document is computer-generated and does not require a signature
            to be official.
          </p>
          <p>Evergreen Realty Philippines © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="font-sans w-full min-h-screen max-w-6xl mx-auto bg-gray-50 p-4 container">
      {currentView === "calculator" && renderCalculatorView()}
      {currentView === "result" && renderResultView()}
    </div>
  );
};

export default OCSCalculator;
