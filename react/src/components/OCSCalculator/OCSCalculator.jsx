import React, { useState, useEffect, useRef } from "react";
import { Eye, Download, ArrowLeft, Calculator } from "lucide-react";
import html2pdf from "html2pdf.js";
import "./OCSStyle.css"; // Import the scoped CSS file

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

  // Fixed PDF generation function with improved styling
  const handleDownloadPDF = () => {
    // Show loading indicator or notify user
    const prevButton = document.activeElement;
    if (prevButton) prevButton.disabled = true;

    // Create a copy of the form to modify for PDF generation
    const printArea = pdfContentRef.current.cloneNode(true);

    // Set explicit font family on the printArea
    printArea.style.fontFamily =
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    printArea.style.color = "#000000";

    // Add PDF-specific styles to header section
    const headerTitle = printArea.querySelector(".ocs-header-title");
    if (headerTitle) {
      headerTitle.style.textAlign = "center";
      headerTitle.style.width = "100%";
      headerTitle.style.paddingTop = "30px";
      headerTitle.style.marginBottom = "30px";

      const h1 = headerTitle.querySelector("h1");
      if (h1) {
        h1.style.fontFamily =
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        h1.style.fontSize = "24px";
        h1.style.marginBottom = "10px";
        h1.style.color = "#16a34a";
        h1.style.fontWeight = "bold";
        h1.style.textAlign = "center";
      }

      const h2 = headerTitle.querySelector("h2");
      if (h2) {
        h2.style.fontFamily =
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        h2.style.fontSize = "18px";
        h2.style.marginBottom = "20px";
        h2.style.color = "#16a34a";
        h2.style.fontWeight = "600";
        h2.style.textAlign = "center";
      }
    }

    // Style all section titles
    const sectionTitles = printArea.querySelectorAll(".ocs-section-title");
    sectionTitles.forEach((title) => {
      title.style.padding = "8px 12px";
      title.style.marginTop = "15px";
      title.style.marginBottom = "8px";
      title.style.fontSize = "12px";
      title.style.fontFamily =
        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

      if (title.classList.contains("ocs-payment-title")) {
        title.style.backgroundColor = "#16a34a";
        title.style.color = "#ffffff";
        title.style.padding = "10px";
        title.style.textAlign = "center";
        title.style.fontWeight = "bold";
      }
    });

    // Add better styling to grid cells
    const gridCells = printArea.querySelectorAll(".ocs-grid-cell");
    gridCells.forEach((cell) => {
      cell.style.padding = "8px";
      cell.style.fontSize = "11px";
      cell.style.fontFamily =
        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

      if (cell.classList.contains("ocs-label-cell")) {
        cell.style.backgroundColor = "#f9fafb";
      }
    });

    // Style payment grids
    const paymentGrids = printArea.querySelectorAll(".ocs-payment-grid");
    paymentGrids.forEach((grid) => {
      grid.style.padding = "8px 10px";
      grid.style.fontSize = "11px";
      grid.style.fontFamily =
        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

      if (grid.classList.contains("ocs-total-price-row")) {
        grid.style.fontWeight = "bold";
      }

      if (grid.classList.contains("ocs-highlight-row")) {
        grid.style.fontWeight = "bold";
      }
    });

    // Style signature section
    const signatureSection = printArea.querySelector(".ocs-signature-section");
    if (signatureSection) {
      signatureSection.style.marginTop = "50px";

      const signatureTitles = signatureSection.querySelectorAll(
        ".ocs-signature-title"
      );
      signatureTitles.forEach((title) => {
        title.style.fontSize = "11px";
        title.style.textAlign = "center";
        title.style.fontFamily =
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      });
    }

    // Style footer text
    const footerText = printArea.querySelector(".ocs-footer-text");
    if (footerText) {
      footerText.style.marginTop = "40px";
      footerText.style.textAlign = "center";
      footerText.style.fontSize = "10px";
      footerText.style.fontFamily =
        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    }

    // Fix any oklch colors that html2pdf can't process
    const convertOklchColors = (element) => {
      // Replace any potential oklch color with standard hex
      const colorProperties = [
        "color",
        "backgroundColor",
        "borderColor",
        "borderLeftColor",
        "borderRightColor",
        "borderTopColor",
        "borderBottomColor",
      ];

      // Process all elements
      Array.from(element.querySelectorAll("*")).forEach((el) => {
        // Apply specific color overrides to avoid tailwind oklch values
        if (el.classList.contains("text-green-600")) {
          el.style.color = "#16a34a"; // Standard hex for green-600
        }

        if (el.classList.contains("bg-green-600")) {
          el.style.backgroundColor = "#16a34a"; // Standard hex for green-600
        }

        if (el.classList.contains("border-green-600")) {
          el.style.borderColor = "#16a34a"; // Standard hex for green-600
        }

        // Ensure all button backgrounds use standard colors
        if (el.classList.contains("ocs-btn-primary")) {
          el.style.backgroundColor = "#16a34a"; // Standard green
          el.style.color = "#ffffff"; // Standard white
        }

        // Fix text colors
        if (el.classList.contains("text-gray-600")) {
          el.style.color = "#4b5563"; // Standard hex for gray-600
        }

        if (el.classList.contains("text-gray-500")) {
          el.style.color = "#6b7280"; // Standard hex for gray-500
        }
      });
    };

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
        span.style.fontSize = "10px";
        span.style.width = "100%";
        span.style.display = "inline-block";
        span.textContent = textContent;
        input.parentNode.replaceChild(span, input);
      });
    };

    // First convert all oklch colors to standard hex
    convertOklchColors(printArea);

    // Then process all input elements
    processInputElements(printArea);

    // Add direct styles to override any Tailwind styles that might use oklch
    const overrideStyles = document.createElement("style");
    overrideStyles.textContent = `
      .ocs-pdf-content * {
        color: #000000;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      }
      .ocs-pdf-content .ocs-header-title {
        padding-top: 30px !important;
        margin-bottom: 30px !important;
        text-align: center !important;
        width: 100% !important;
      }
      .ocs-pdf-content .ocs-header-title h1 {
        font-size: 24px !important;
        margin-bottom: 10px !important;
        color: #16a34a !important;
        font-weight: bold !important;
        text-align: center !important;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      }
      .ocs-pdf-content .ocs-header-title h2 {
        font-size: 18px !important;
        margin-bottom: 20px !important;
        color: #16a34a !important;
        font-weight: 600 !important;
        text-align: center !important;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      }
      .ocs-pdf-content h1, 
      .ocs-pdf-content h2, 
      .ocs-pdf-content .text-green-600, 
      .ocs-pdf-content .ocs-highlighted {
        color: #16a34a !important;
      }
      .ocs-pdf-content .ocs-section-title.ocs-payment-title,
      .ocs-pdf-content .bg-green-600 {
        background-color: #16a34a !important;
        color: #ffffff !important;
        padding: 10px !important;
        font-size: 12px !important;
        text-align: center !important;
        font-weight: bold !important;
      }
      .ocs-pdf-content .ocs-warning-text {
        color: #dc2626 !important;
      }
      .ocs-pdf-content .text-gray-500,
      .ocs-pdf-content .ocs-footer-text {
        color: #6b7280 !important;
      }
      .ocs-pdf-content .ocs-label-cell {
        background-color: #f9fafb !important;
        padding: 8px !important;
        font-size: 11px !important;
      }
      .ocs-pdf-content .ocs-grid-cell {
        padding: 8px !important;
        font-size: 11px !important;
      }
      .ocs-pdf-content .ocs-section-title {
        padding: 8px 12px !important;
        margin-top: 15px !important;
        margin-bottom: 8px !important;
        font-size: 12px !important;
      }
      .ocs-pdf-content .ocs-info-table {
        margin-bottom: 25px !important;
        width: 100% !important;
      }
      .ocs-pdf-content .ocs-payment-grid {
        padding: 8px 10px !important;
        font-size: 11px !important;
      }
      .ocs-pdf-content .ocs-payment-grid.ocs-total-price-row {
        font-weight: bold !important;
      }
      .ocs-pdf-content .ocs-payment-grid.ocs-highlight-row {
        font-weight: bold !important;
      }
      .ocs-pdf-content .ocs-highlighted {
        color: #16a34a !important;
      }
      .ocs-pdf-content .ocs-signature-section {
        margin-top: 50px !important;
      }
      .ocs-pdf-content .ocs-signature-line {
        margin-bottom: 5px !important;
      }
      .ocs-pdf-content .ocs-signature-title {
        font-size: 11px !important;
        text-align: center !important;
      }
      .ocs-pdf-content .ocs-footer-text {
        margin-top: 40px !important;
        text-align: center !important;
        font-size: 10px !important;
      }
    `;
    printArea.appendChild(overrideStyles);

    // Create configuration for jsPDF
    const opt = {
      margin: [10, 10, 10, 10], // Add some margin for better readability
      filename: `EVERGREEN_OCS_${
        formData.clientName.replace(/\s+/g, "_") || "FORM"
      }.pdf`,
      image: { type: "jpeg", quality: 0.98 }, // High quality for clear text
      html2canvas: {
        scale: 2, // Higher scale for better quality
        letterRendering: true,
        useCORS: true,
        logging: false,
        ignoreElements: (element) => {
          // Ignore any elements that might cause problems with color functions
          return (
            element.tagName === "STYLE" && element.textContent.includes("oklch")
          );
        },
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
      <div>
        <div className="ocs-payment-grid ocs-total-price-row">
          <div>TOTAL CONTRACT PRICE</div>
          <div className="ocs-text-right">
            ₱ {formatCurrency(calculations.totalPrice)}
          </div>
        </div>
        <div className="ocs-payment-grid ocs-highlight-row">
          <div>DOWNPAYMENT (20%)</div>
          <div className="ocs-text-right">
            ₱ {formatCurrency(calculations.downPayment)}
          </div>
        </div>
        <div className="ocs-payment-grid">
          <div>Reservation Fee (Deductible from Downpayment)</div>
          <div className="ocs-text-right">₱ 20,000.00</div>
        </div>

        <div className="ocs-payment-grid ocs-highlight-row">
          <div>BALANCE PAYMENT</div>
          <div className="ocs-text-right">
            ₱ {formatCurrency(calculations.balancePayment)}
          </div>
        </div>
        <div className="ocs-payment-grid">
          <div className="ocs-italic">{formData.installmentYears} years</div>
          <div className="ocs-text-right">Monthly Installment</div>
        </div>
        <div className="ocs-payment-grid">
          <div className="ocs-italic">Every 30th of the month</div>
          <div className="ocs-text-right ocs-highlighted">
            ₱ {formatCurrency(calculations.monthlyPayment)}
          </div>
        </div>
        <div className="ocs-payment-grid">
          <div className="ocs-italic">
            {parseInt(formData.installmentYears) * 12} months
          </div>
          <div></div>
        </div>
        <div className="ocs-payment-grid">
          <div>Start Year</div>
          <div className="ocs-text-right ocs-italic">
            {formatDate(formData.reservationDate, true) || "Not specified"}
          </div>
        </div>
        <div className="ocs-payment-grid">
          <div>End Year</div>
          <div className="ocs-text-right ocs-italic">
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
      <div>
        <div className="ocs-payment-grid ocs-total-price-row">
          <div>TOTAL CONTRACT PRICE</div>
          <div className="ocs-text-right">
            ₱ {formatCurrency(calculations.totalPrice)}
          </div>
        </div>
        <div className="ocs-payment-grid ocs-highlight-row">
          <div>SPOTCASH</div>
          <div className="ocs-text-right">
            ₱ {formatCurrency(calculations.totalPrice)}
          </div>
        </div>
        <div className="ocs-payment-grid">
          <div className="ocs-warning-text">
            Total amount shall be payable within a month.
          </div>
          <div></div>
        </div>
        <div className="ocs-payment-grid">
          <div className="ocs-warning-text">
            Initial reservation fee of ₱20,000.00 is required and will be
            deducted from the total price.
          </div>
          <div></div>
        </div>
        <div className="ocs-payment-grid">
          <div>Total Amount</div>
          <div className="ocs-text-right">
            ₱ {formatCurrency(calculations.totalPrice)}
          </div>
        </div>
      </div>
    );
  };

  // Render calculator view
  const renderCalculatorView = () => (
    <>
      {" "}
      <div className="flex flex-col md:flex-row justify-between items-center border-gray-200 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-black mb-4 md:mb-0">
          {appMode === "full"
            ? "Official Computation Sheet"
            : "Quick Calculator"}
        </h2>
        <div className="flex space-x-2">
          <button
            className={`ocs-btn ${
              appMode === "full"
                ? "ocs-btn-primary"
                : "bg-white text-gray-600 border border-gray-300 hover:text-[#1da57a] hover:border-[#1da57a]"
            } px-3 py-1 text-sm rounded-md transition-colors flex items-center justify-center h-8`}
            onClick={() => setAppMode("full")}
          >
            Full OCS
          </button>
          <button
            className={`ocs-btn ${
              appMode === "calculator-only"
                ? "ocs-btn-primary"
                : "bg-white text-gray-600 border border-gray-300 hover:text-[#1da57a] hover:border-[#1da57a]"
            } px-3 py-1 text-sm rounded-md transition-colors flex items-center justify-center h-8`}
            onClick={() => setAppMode("calculator-only")}
          >
            Calculator
          </button>
        </div>
      </div>
      <div className="ocs-calculator w-full" id="calculatorView">
        <div className="bg-white rounded-lg shadow-md p-6">
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
                        formErrors.project
                          ? "border-red-500"
                          : "border-gray-300"
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
                    Initial reservation fee of ₱20,000.00 is required and will
                    be deducted from the total contract price.
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              onClick={handleCreateOCS}
              className="ocs-btn ocs-btn-primary flex-1 py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
              type="button"
            >
              <span className="flex items-center">
                {appMode === "full" ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="2"
                        ry="2"
                      ></rect>
                      <line x1="12" y1="8" x2="12" y2="16"></line>
                      <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                    Create OCS
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                    Calculate
                  </>
                )}
              </span>
            </button>
            <button
              onClick={handleReset}
              className="ocs-btn ocs-btn-secondary flex-1 py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                <path d="M16 21h5v-5"></path>
              </svg>
              Reset
            </button>
          </div>
        </div>
      </div>
    </>
  );

  // Render result view with PDF content
  const renderResultView = () => (
    <>
      {" "}
      <div className="flex flex-col justify-between mb-10 sm:flex-row gap-2">
        <h2 className="text-2xl font-bold">Preview</h2>
        <div className="flex gap-2">
          {" "}
          <button
            onClick={() => setCurrentView("calculator")}
            className="ocs-btn ocs-btn-secondary inline-flex items-center justify-center gap-2 py-1 px-4 rounded-md font-medium transition-colors h-8"
          >
            <ArrowLeft size={14} className="mr-1" />
            <span>Back to Calculator</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="ocs-btn ocs-btn-primary inline-flex items-center justify-center gap-2 py-1 px-4 rounded-md font-medium transition-colors h-8"
          >
            <Download size={14} className="mr-1" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>
      <div className="ocs-calculator bg-white rounded-lg shadow-md overflow-hidden">
        <div
          id="pdfContent"
          ref={pdfContentRef}
          className="ocs-pdf-content p-8 bg-white"
        >
          <div className="ocs-header-title text-center mb-8 pt-4">
            <h1 className="text-2xl font-bold text-green-600 mb-3">
              Evergreen Realty Philippines
            </h1>
            <h2 className="text-xl font-semibold text-green-600 mb-4">
              Official Computation Sheet (OCS)
            </h2>
          </div>

          <div className="mb-6 ocs-section">
            <h3 className="ocs-section-title font-medium mb-2">
              Client Information
            </h3>
            <div className="ocs-info-table border border-gray-200 rounded-md overflow-hidden">
              <div className="ocs-grid-row">
                <div className="ocs-grid-cell ocs-label-cell">Client Name:</div>
                <div className="ocs-grid-cell">{formData.clientName}</div>
                <div className="ocs-grid-cell ocs-label-cell">
                  Contact Number:
                </div>
                <div className="ocs-grid-cell">{formData.phoneNumber}</div>
              </div>
              <div className="ocs-grid-row">
                <div className="ocs-grid-cell ocs-label-cell">
                  Reservation Date:
                </div>
                <div className="ocs-grid-cell">
                  {formatDate(formData.reservationDate)}
                </div>
                <div className="ocs-grid-cell ocs-label-cell">
                  Block and Lot Number:
                </div>
                <div className="ocs-grid-cell">{formData.blockLot}</div>
              </div>
            </div>
          </div>

          <div className="mb-6 ocs-section">
            <h3 className="ocs-section-title font-medium mb-2">
              Property Details
            </h3>
            <div className="ocs-info-table border border-gray-200 rounded-md overflow-hidden">
              <div className="ocs-grid-row">
                <div className="ocs-grid-cell ocs-label-cell">Project:</div>
                <div className="ocs-grid-cell">{formData.project}</div>
                <div className="ocs-grid-cell ocs-label-cell">Lot Area:</div>
                <div className="ocs-grid-cell">{formData.lotArea} sq.m.</div>
              </div>
              <div className="ocs-grid-row">
                <div className="ocs-grid-cell ocs-label-cell">
                  Price per sq.m.:
                </div>
                <div className="ocs-grid-cell">
                  ₱ {formatCurrency(formData.pricePerSqm)}
                </div>
                <div className="ocs-grid-cell ocs-label-cell">Type:</div>
                <div className="ocs-grid-cell">Agricultural</div>
              </div>
            </div>
          </div>

          <div className="ocs-section">
            <div className="ocs-section-title ocs-payment-title">
              BREAKDOWN OF PAYMENT
            </div>
            <div className="ocs-info-table border border-gray-200 border-t-0 rounded-b-md p-4">
              {formData.paymentType === "INSTALLMENT"
                ? generateInstallmentBreakdown()
                : generateSpotcashBreakdown()}
            </div>
          </div>

          <div className="ocs-signature-section mt-10 border-t border-gray-300 pt-6">
            <div className="ocs-signature-box">
              <div className="ocs-signature-line"></div>
              <p className="ocs-signature-title">Prepared by</p>
            </div>
            <div className="ocs-signature-box">
              <div className="ocs-signature-line"></div>
              <p className="ocs-signature-title">
                Conforme: Client's Signature over Printed Name
              </p>
            </div>
          </div>

          <div className="ocs-footer-text mt-10 text-center text-xs text-gray-500">
            <p>
              This document is computer-generated and does not require a
              signature to be official.
            </p>
            <p>Evergreen Realty Philippines © {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="ocs-calculator font-sans w-full min-h-screen max-w-6xl bg-gray-50 ">
      {currentView === "calculator" && renderCalculatorView()}
      {currentView === "result" && renderResultView()}
    </div>
  );
};

export default OCSCalculator;
