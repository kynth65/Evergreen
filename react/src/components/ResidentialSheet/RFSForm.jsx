import React, { useEffect, useRef } from "react";
import html2pdf from "html2pdf.js";
import "./RFSStyle.css";

const ResidentInformationForm = () => {
  const printAreaRef = useRef(null);
  const formRef = useRef(null);
  const referenceNumberRef = useRef(null);

  useEffect(() => {
    // Make the EVERGREEN REALTY and PHILIPPINES text green in the header
    const logoSection = document.querySelector(".logo-section");
    if (logoSection) {
      const h1 = logoSection.querySelector("h1");
      const h2 = logoSection.querySelector("h2");
      if (h1) h1.style.color = "#4CAF50"; // Green color
      if (h2) h2.style.color = "#4CAF50"; // Green color
    }

    // Set initial reference number
    generateAndSetReferenceNumber();

    // Handle checkbox behavior for occupant type
    setupMutuallyExclusiveCheckboxes("occupantType");

    // Handle checkbox behavior for spouse salutation
    setupMutuallyExclusiveCheckboxes("spouseSalutation");

    // Handle checkbox behavior for parking included
    setupMutuallyExclusiveCheckboxes("parkingIncluded");
  }, []);

  const setupMutuallyExclusiveCheckboxes = (groupName) => {
    const checkboxes = document.querySelectorAll(`input[name="${groupName}"]`);
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", function () {
        // If this checkbox is checked, uncheck the others
        if (this.checked) {
          checkboxes.forEach((cb) => {
            if (cb !== this) {
              cb.checked = false;
            }
          });
        }
      });
    });
  };

  const generateAndSetReferenceNumber = () => {
    if (referenceNumberRef.current) {
      referenceNumberRef.current.textContent = generateReferenceNumber();
    }
  };

  const generateReferenceNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `Form-F-${year}${month}${day}-${hours}${minutes}${seconds}`;
  };

  const handleReset = () => {
    if (formRef.current) {
      formRef.current.reset();
      // Update reference number after reset
      generateAndSetReferenceNumber();
    }
  };

  const handleDownloadPDF = () => {
    // Create a copy of the form to modify for PDF generation
    const printArea = printAreaRef.current.cloneNode(true);

    // Fix layout issues before generating PDF
    printArea.style.width = "100%";
    printArea.style.maxWidth = "200mm"; // A4 width
    printArea.style.margin = "0";
    printArea.style.padding = "0";

    // Apply special styling for PDF output based on Avida Towers style
    printArea.style.fontSize = "9px";
    printArea.style.lineHeight = "1.2";
    printArea.style.fontFamily = "Arial, sans-serif";
    printArea.style.border = "1px solid #000";

    // Set EVERGREEN REALTY and PHILIPPINES to green in the PDF
    const headerSection = printArea.querySelector(".logo-section");
    if (headerSection) {
      const h1 = headerSection.querySelector("h1");
      const h2 = headerSection.querySelector("h2");
      if (h1) h1.style.color = "#4CAF50"; // Green color for PDF
      if (h2) h2.style.color = "#4CAF50"; // Green color for PDF
    }

    // Add border around the whole form
    printArea.style.borderWidth = "1px";
    printArea.style.borderStyle = "solid";
    printArea.style.borderColor = "#000";
    printArea.style.boxSizing = "border-box";

    // Reduce space between sections
    const sections = printArea.querySelectorAll(".section");
    sections.forEach((section) => {
      section.style.marginBottom = "0";
      section.style.paddingBottom = "0";
    });

    // Adjust the height of table rows to be compact like Avida's form
    const tableRows = printArea.querySelectorAll("tr");
    tableRows.forEach((row) => {
      // Make all rows compact
      row.style.height = "24px";
    });

    // Make all tables use fixed layout with proper borders
    const tables = printArea.querySelectorAll("table");
    tables.forEach((table) => {
      table.style.fontSize = "9px";
      table.style.marginBottom = "0";
      table.style.width = "100%";
      table.style.tableLayout = "fixed";
      table.style.borderCollapse = "collapse";
      table.style.border = "1px solid #000";
    });

    // Fix all table cells to have proper borders and padding like Avida form
    const tableCells = printArea.querySelectorAll("td, th");
    tableCells.forEach((cell) => {
      cell.style.padding = "2px 4px";
      cell.style.border = "1px solid #000";
      cell.style.fontSize = "9px";
      cell.style.verticalAlign = "middle";
    });

    // Fix the mobile and email fields layout specifically
    const contactDetails = printArea.querySelectorAll(".section-title");
    for (let i = 0; i < contactDetails.length; i++) {
      if (contactDetails[i].textContent.includes("CONTACT DETAILS")) {
        const contactTable =
          contactDetails[i].parentElement.querySelector("table");
        if (contactTable) {
          // Target the first row in the contact details table
          const firstRow = contactTable.querySelector("tr:first-child");
          if (firstRow) {
            // Get all cells in the first row
            const cells = firstRow.querySelectorAll("td");

            // Check if we have the right structure
            if (cells.length >= 7) {
              // Fix width for each cell
              cells[0].style.width = "15%"; // Mobile Numbers label
              cells[1].style.width = "15%"; // Mobile 1 input
              cells[2].style.width = "15%"; // Mobile 2 input
              cells[3].style.width = "15%"; // Email label
              cells[4].style.width = "20%"; // Email input
              cells[5].style.width = "10%"; // Phone label
              cells[6].style.width = "10%"; // Phone input

              // Set explicit no-wrap on labels to prevent stacking
              cells[0].style.whiteSpace = "nowrap";
              cells[3].style.whiteSpace = "nowrap";
              cells[5].style.whiteSpace = "nowrap";
            }
          }
        }
        break;
      }
    }

    // Apply equal width to label cells and data cells (50/50)
    const labelCells = printArea.querySelectorAll(".label-cell");
    labelCells.forEach((cell) => {
      // Skip the cells in contact details section which we've already adjusted above
      const isInContactDetails =
        cell.closest("table") &&
        cell.closest("table").parentElement &&
        cell.closest("table").parentElement.querySelector(".section-title") &&
        cell
          .closest("table")
          .parentElement.querySelector(".section-title")
          .textContent.includes("CONTACT DETAILS");

      if (!isInContactDetails) {
        cell.style.width = "50%";
        cell.style.fontWeight = "normal"; // Remove bold from labels

        // If there's a data cell next to this label, make it 50% too
        if (
          cell.nextElementSibling &&
          !cell.nextElementSibling.classList.contains("label-cell")
        ) {
          cell.nextElementSibling.style.width = "50%";
        }
      }
    });

    // Fix SPOUSE'S DATA section using standard DOM methods
    const sectionTitles = printArea.querySelectorAll(".section-title");
    let spouseSection = null;

    // Find the spouse section by title text content
    for (let i = 0; i < sectionTitles.length; i++) {
      if (sectionTitles[i].textContent.includes("SPOUSE")) {
        spouseSection = sectionTitles[i].parentElement;
        break;
      }
    }

    if (spouseSection) {
      // Get the table within the spouse section
      const spouseTable = spouseSection.querySelector("table");

      if (spouseTable) {
        // Fix Mr/Mrs checkboxes visibility
        const mrCheckbox = spouseTable.querySelector("#mr");
        const mrsCheckbox = spouseTable.querySelector("#mrs");

        if (mrCheckbox && mrCheckbox.parentElement) {
          mrCheckbox.parentElement.style.display = "inline-block";
          mrCheckbox.parentElement.style.visibility = "visible";
        }

        if (mrsCheckbox && mrsCheckbox.parentElement) {
          mrsCheckbox.parentElement.style.display = "inline-block";
          mrsCheckbox.parentElement.style.visibility = "visible";
        }

        // Find all cells with birthdate or profession to fix them
        const spouseCells = spouseTable.querySelectorAll("td");

        spouseCells.forEach((cell) => {
          // Fix any birthdate cell that contains profession text
          if (
            cell.textContent.includes("Birthdate") &&
            cell.textContent.includes("Profession")
          ) {
            cell.textContent = "Birthdate (mm/dd/yy):";
          }

          // Make sure every cell in spouse table is visible
          cell.style.display = "table-cell";
          cell.style.visibility = "visible";
        });

        // Find all checkboxes in the spouse section and ensure they're visible
        const spouseCheckboxes = spouseTable.querySelectorAll(
          'input[type="checkbox"]'
        );
        spouseCheckboxes.forEach((checkbox) => {
          checkbox.style.display = "inline-block";
          checkbox.style.visibility = "visible";

          if (checkbox.parentElement) {
            checkbox.parentElement.style.display = "inline-block";
            checkbox.parentElement.style.visibility = "visible";
          }
        });
      }
    }

    // Make section titles match Avida's style
    sectionTitles.forEach((title) => {
      title.style.padding = "2px 4px";
      title.style.fontSize = "9px";
      title.style.marginBottom = "0";
      title.style.marginTop = "0";
      title.style.textAlign = "center";
      title.style.backgroundColor = "#f0f0f0";
      title.style.fontWeight = "bold";
      title.style.border = "1px solid #000";
    });

    // Make authorization text more compact
    const compactTexts = printArea.querySelectorAll(".compact-text");
    compactTexts.forEach((text) => {
      text.style.fontSize = "8px";
      text.style.lineHeight = "1.1";
      text.style.marginBottom = "0";
      text.style.marginTop = "0";
      text.style.textAlign = "justify";
    });

    // Fix signature section to match Avida's style
    const signatureSection = printArea.querySelector(".signature-section");
    if (signatureSection) {
      signatureSection.style.marginTop = "0";

      const signatureTable = signatureSection.querySelector("table");
      if (signatureTable) {
        signatureTable.style.marginBottom = "0";
        signatureTable.style.borderCollapse = "collapse";
      }

      const signatureLines = signatureSection.querySelectorAll(
        ".signature-line, .date-line"
      );
      signatureLines.forEach((line) => {
        line.style.height = "15px";
        line.style.borderBottom = "1px solid #000";
      });

      // Make distribution text smaller
      const distributionText = signatureSection.querySelector(".distribution");
      if (distributionText) {
        distributionText.style.fontSize = "8px";
        distributionText.style.textAlign = "center";
        distributionText.style.marginTop = "2px";
      }
    }

    // Replace all input fields with spans (NO underlines like Avida form)
    const inputs = printArea.querySelectorAll("input");
    inputs.forEach((input) => {
      if (input.type === "checkbox") {
        const span = document.createElement("span");
        span.innerHTML = input.checked ? "☑" : "☐";
        input.parentNode.replaceChild(span, input);
      } else {
        const span = document.createElement("span");
        span.style.fontSize = "9px";
        span.style.width = "100%";
        span.style.display = "inline-block";
        // Use the value or leave blank (no underlines like Avida form)
        span.textContent = input.value || " ";
        input.parentNode.replaceChild(span, input);
      }
    });

    // Generate PDF with settings that match Avida's style
    const opt = {
      margin: [5, 3, 5, 5], // Margins similar to Avida form
      filename: "EVERGREEN_RESIDENT_INFORMATION.pdf",
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

    html2pdf().from(printArea).set(opt).save();
  };

  // Input validation functions
  const handleNumericInput = (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
  };

  const handleParkingInput = (e) => {
    e.target.value = e.target.value.replace(/[^0-9,\- ]/g, "");
  };

  return (
    <div id="formView" className="view active">
      <div className="container">
        <div className="form-actions">
          <button
            type="button"
            id="downloadPDF"
            className="btn btn-primary"
            onClick={handleDownloadPDF}
          >
            Download PDF
          </button>
          <button
            type="reset"
            id="resetForm"
            className="btn btn-secondary"
            onClick={handleReset}
          >
            Reset Form
          </button>
        </div>

        <div className="form-container" id="printArea" ref={printAreaRef}>
          {/* Header */}
          <div className="header">
            <div className="logo-section">
              <h1>EVERGREEN REALTY</h1>
              <h2>PHILIPPINES</h2>
            </div>
            <div className="title-section">
              <h2>RESIDENT INFORMATION SHEET</h2>
            </div>
            <div className="reference-section">
              <p id="referenceNumber" ref={referenceNumberRef}>
                Form-F-
              </p>
            </div>
          </div>

          {/* Occupant Type */}
          <div className="checkbox-row">
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="owner"
                name="occupantType"
                value="Owner"
              />
              <label htmlFor="owner">Owner</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="tenant"
                name="occupantType"
                value="Tenant"
              />
              <label htmlFor="tenant">Tenant</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="authorized"
                name="occupantType"
                value="Authorized Occupant"
              />
              <label htmlFor="authorized">Authorized Occupant</label>
            </div>
          </div>

          {/* Note */}
          <div className="note-container">
            <p>
              <span className="note-highlight">Note: (*)</span> are required
              information. Community-related updates, Statement of Accounts and
              other official communications shall be sent to the registered
              mobile numbers and email addresses.
            </p>
          </div>

          {/* Form */}
          <form id="residentForm" ref={formRef}>
            {/* PERTINENT DATA Section */}
            <div className="section">
              <h3 className="section-title">PERTINENT DATA</h3>
              <table className="form-table">
                <tbody>
                  <tr>
                    <td className="label-cell">
                      <label htmlFor="name">Name*</label>
                      <small>
                        (as it appeared on the Deed of Sale/Title for Owners, on
                        the Lease Contract for Tenants and on Authorization for
                        Guests)
                      </small>
                    </td>
                    <td>
                      <input type="text" id="name" name="name" required />
                    </td>
                    <td className="label-cell">
                      <label htmlFor="tower">Tower*:</label>
                    </td>
                    <td>
                      <input type="text" id="tower" name="tower" required />
                    </td>
                    <td className="label-cell">
                      <label htmlFor="unitNo">Unit No.*:</label>
                    </td>
                    <td>
                      <input
                        type="text"
                        id="unitNo"
                        name="unitNo"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        onInput={handleNumericInput}
                        required
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="label-cell">
                      <label htmlFor="representative">
                        Name of Authorized Representative*
                      </label>
                      <small>(Attach SPA / Secretary's Certificate)</small>
                    </td>
                    <td colSpan="3">
                      <input
                        type="text"
                        id="representative"
                        name="representative"
                        required
                      />
                    </td>
                    <td className="label-cell">
                      <label htmlFor="parkingSlot">Parking Slot No/s.*:</label>
                    </td>
                    <td colSpan="1">
                      <input
                        type="text"
                        id="parkingSlot"
                        name="parkingSlot"
                        pattern="[0-9,\- ]*"
                        inputMode="numeric"
                        onInput={handleParkingInput}
                        required
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="label-cell">
                      <label htmlFor="birthdate">Birthdate (mm/dd/yy):</label>
                    </td>
                    <td>
                      <input type="date" id="birthdate" name="birthdate" />
                    </td>
                    <td className="label-cell">
                      <label htmlFor="civilStatus">Civil Status:</label>
                    </td>
                    <td>
                      <input type="text" id="civilStatus" name="civilStatus" />
                    </td>
                    <td className="label-cell">
                      <label htmlFor="gender">Gender*:</label>
                    </td>
                    <td>
                      <input type="text" id="gender" name="gender" required />
                    </td>
                  </tr>
                  <tr>
                    <td className="label-cell">
                      <label htmlFor="employer">Employer's Name:</label>
                    </td>
                    <td>
                      <input type="text" id="employer" name="employer" />
                    </td>
                    <td className="label-cell">
                      <label htmlFor="nationality">Nationality*:</label>
                    </td>
                    <td>
                      <input
                        type="text"
                        id="nationality"
                        name="nationality"
                        required
                      />
                    </td>
                    <td className="label-cell">
                      <label htmlFor="acrNo">ACR No.* (if foreigner):</label>
                    </td>
                    <td>
                      <input type="text" id="acrNo" name="acrNo" />
                    </td>
                  </tr>
                  <tr>
                    <td className="label-cell"></td>
                    <td></td>
                    <td className="label-cell">
                      <label htmlFor="profession">Profession:</label>
                    </td>
                    <td>
                      <input type="text" id="profession" name="profession" />
                    </td>
                    <td className="label-cell">
                      <label htmlFor="tin">Tax Identification No.*:</label>
                    </td>
                    <td>
                      <input
                        type="text"
                        id="tin"
                        name="tin"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        onInput={handleNumericInput}
                        required
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* CONTACT DETAILS Section */}
            <div className="section">
              <h3 className="section-title">CONTACT DETAILS</h3>
              <table className="form-table">
                <tbody>
                  <tr>
                    <td className="label-cell">
                      <label htmlFor="mobile1">Mobile Numbers*:</label>
                    </td>
                    <td>
                      <input
                        type="tel"
                        id="mobile1"
                        name="mobile1"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        onInput={handleNumericInput}
                        placeholder="1"
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="tel"
                        id="mobile2"
                        name="mobile2"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        onInput={handleNumericInput}
                        placeholder="2"
                      />
                    </td>
                    <td className="label-cell">
                      <label htmlFor="email">E-mail Add*:</label>
                    </td>
                    <td>
                      <input type="email" id="email" name="email" required />
                    </td>
                    <td className="label-cell">
                      <label htmlFor="phone">Phone:</label>
                    </td>
                    <td>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        onInput={handleNumericInput}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="label-cell">
                      <label htmlFor="mailingAddress">
                        Mailing / Business Address*:
                      </label>
                    </td>
                    <td colSpan="6">
                      <input
                        type="text"
                        id="mailingAddress"
                        name="mailingAddress"
                        required
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SPOUSE'S DATA Section - Updated Structure */}
            <div className="section">
              <h3 className="section-title">
                SPOUSE'S DATA AND LIST OF DEPENDENTS
              </h3>
              <table className="form-table">
                <tbody>
                  <tr>
                    <td style={{ width: "50px" }}>
                      <div className="checkbox-item">
                        <input
                          type="checkbox"
                          id="mr"
                          name="spouseSalutation"
                          value="Mr."
                        />
                        <label htmlFor="mr">Mr.</label>
                      </div>
                    </td>
                    <td style={{ width: "50px" }}>
                      <div className="checkbox-item">
                        <input
                          type="checkbox"
                          id="mrs"
                          name="spouseSalutation"
                          value="Mrs."
                        />
                        <label htmlFor="mrs">Mrs.</label>
                      </div>
                    </td>
                    <td className="label-cell">
                      <label htmlFor="spouseLastName">Last Name:</label>
                    </td>
                    <td>
                      <input
                        type="text"
                        id="spouseLastName"
                        name="spouseLastName"
                      />
                    </td>
                    <td className="label-cell">
                      <label htmlFor="spouseFirstName">First Name:</label>
                    </td>
                    <td>
                      <input
                        type="text"
                        id="spouseFirstName"
                        name="spouseFirstName"
                      />
                    </td>
                    <td className="label-cell">
                      <label htmlFor="spouseMiddleName">Middle Name:</label>
                    </td>
                    <td>
                      <input
                        type="text"
                        id="spouseMiddleName"
                        name="spouseMiddleName"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="label-cell" colSpan="2">
                      <label htmlFor="spouseBirthdate">
                        Birthdate (mm/dd/yy):
                      </label>
                    </td>
                    <td colSpan="2">
                      <input
                        type="date"
                        id="spouseBirthdate"
                        name="spouseBirthdate"
                      />
                    </td>
                    <td className="label-cell">
                      <label htmlFor="spouseProfession">Profession:</label>
                    </td>
                    <td>
                      <input
                        type="text"
                        id="spouseProfession"
                        name="spouseProfession"
                      />
                    </td>
                    <td className="label-cell">
                      <label htmlFor="spouseNationality">Nationality:</label>
                    </td>
                    <td>
                      <input
                        type="text"
                        id="spouseNationality"
                        name="spouseNationality"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="label-cell" colSpan="2">
                      <label htmlFor="spouseAcrNo">
                        ACR No. (if foreigner):
                      </label>
                    </td>
                    <td colSpan="6">
                      <input type="text" id="spouseAcrNo" name="spouseAcrNo" />
                    </td>
                  </tr>
                  <tr>
                    <td className="label-cell" colSpan="2">
                      Dependents
                    </td>
                    <td>
                      1 <input type="text" id="dependent1" name="dependent1" />
                    </td>
                    <td>
                      2 <input type="text" id="dependent2" name="dependent2" />
                    </td>
                    <td>
                      3 <input type="text" id="dependent3" name="dependent3" />
                    </td>
                    <td>
                      4 <input type="text" id="dependent4" name="dependent4" />
                    </td>
                    <td>
                      5 <input type="text" id="dependent5" name="dependent5" />
                    </td>
                    <td>
                      6 <input type="text" id="dependent6" name="dependent6" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* CONTRACT DETAILS Section */}
            <div className="section">
              <h3 className="section-title">
                CONTRACT / AUTHORIZATION DETAILS (For Tenants and Guests only)
              </h3>
              <table className="form-table">
                <tbody>
                  <tr>
                    <td className="label-cell">
                      <label htmlFor="contractEndDate">
                        Contract /Authorization ends on:
                      </label>
                    </td>
                    <td>
                      <input
                        type="date"
                        id="contractEndDate"
                        name="contractEndDate"
                      />
                    </td>
                    <td className="label-cell">(Attach the document)</td>
                    <td className="label-cell">Parking Slot included:</td>
                    <td>
                      <div className="checkbox-item">
                        <input
                          type="checkbox"
                          id="parkingYes"
                          name="parkingIncluded"
                          value="Yes"
                        />
                        <label htmlFor="parkingYes">Yes</label>
                      </div>
                    </td>
                    <td>
                      <div className="checkbox-item">
                        <input
                          type="checkbox"
                          id="parkingNo"
                          name="parkingIncluded"
                          value="No"
                        />
                        <label htmlFor="parkingNo">No</label>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* PERSONS STAYING Section */}
            <div className="section">
              <h3 className="section-title">PERSONS STAYING IN THE UNIT</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name*</th>
                    <th>Gender*</th>
                    <th>Birthdate</th>
                    <th>Relation*</th>
                    <th>
                      Will Need Assistance During Emergencies (Yes or No)*
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <input type="text" name="personName1" />
                    </td>
                    <td>
                      <input type="text" name="personGender1" />
                    </td>
                    <td>
                      <input type="date" name="personBirthdate1" />
                    </td>
                    <td>
                      <input type="text" name="personRelation1" />
                    </td>
                    <td>
                      <input type="text" name="personAssistance1" />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <input type="text" name="personName2" />
                    </td>
                    <td>
                      <input type="text" name="personGender2" />
                    </td>
                    <td>
                      <input type="date" name="personBirthdate2" />
                    </td>
                    <td>
                      <input type="text" name="personRelation2" />
                    </td>
                    <td>
                      <input type="text" name="personAssistance2" />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <input type="text" name="personName3" />
                    </td>
                    <td>
                      <input type="text" name="personGender3" />
                    </td>
                    <td>
                      <input type="date" name="personBirthdate3" />
                    </td>
                    <td>
                      <input type="text" name="personRelation3" />
                    </td>
                    <td>
                      <input type="text" name="personAssistance3" />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <input type="text" name="personName4" />
                    </td>
                    <td>
                      <input type="text" name="personGender4" />
                    </td>
                    <td>
                      <input type="date" name="personBirthdate4" />
                    </td>
                    <td>
                      <input type="text" name="personRelation4" />
                    </td>
                    <td>
                      <input type="text" name="personAssistance4" />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <input type="text" name="personName5" />
                    </td>
                    <td>
                      <input type="text" name="personGender5" />
                    </td>
                    <td>
                      <input type="date" name="personBirthdate5" />
                    </td>
                    <td>
                      <input type="text" name="personRelation5" />
                    </td>
                    <td>
                      <input type="text" name="personAssistance5" />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <input type="text" name="personName6" />
                    </td>
                    <td>
                      <input type="text" name="personGender6" />
                    </td>
                    <td>
                      <input type="date" name="personBirthdate6" />
                    </td>
                    <td>
                      <input type="text" name="personRelation6" />
                    </td>
                    <td>
                      <input type="text" name="personAssistance6" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* EMERGENCY CONTACT Section */}
            <div className="section">
              <h3 className="section-title">
                PLEASE NOTIFY IN CASE OF EMERGENCY* (not living in the property)
              </h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Relation</th>
                    <th>Contact Number</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <input type="text" name="emergencyName1" />
                    </td>
                    <td>
                      <input type="text" name="emergencyRelation1" />
                    </td>
                    <td>
                      <input
                        type="tel"
                        name="emergencyContact1"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        onInput={handleNumericInput}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <input type="text" name="emergencyName2" />
                    </td>
                    <td>
                      <input type="text" name="emergencyRelation2" />
                    </td>
                    <td>
                      <input
                        type="tel"
                        name="emergencyContact2"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        onInput={handleNumericInput}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* AUTHORIZATION Section */}
            <div className="section">
              <h3 className="section-title">
                AUTHORIZATION TO ACCESS THE UNIT DURING EMERGENCIES
              </h3>
              <p className="compact-text">
                I hereby authorize the Board of the Evergreen Realty Philippines
                Condominium Corporation, and/or the Evergreen Property
                Management Corporation, through their authorized personnel, to
                enter my unit/property, by any means necessary, to prevent the
                spread of damage to the common areas or other units during an
                emergency such as fire, flooding or other life-threatening
                situations.
              </p>
              <p className="compact-text">
                I also hereby give my authorization to have my unit/property
                accessed by such authorized personnel, three (3) days after a
                notice was sent to my last known mailing address or to my email
                address, in the event that there is a situation inside my
                unit/property that has a potential to compromise the life,
                safety and health of other building occupants or neighbors.
              </p>
              <p className="compact-text">
                I hold the Board of Directors of the Evergreen Realty
                Philippines Condominium Corporation and Evergreen Property
                Management Corporation and their directors, officers, and
                authorized personnel, free and harmless from any and all loss,
                claim, injury, damage or liability I may sustain or incur in
                relation to the access to my unit during emergencies and
                life-threatening situations.
              </p>

              <h3 className="section-title">
                CERTIFICATION and DATA PRIVACY CONSENT
              </h3>
              <p className="compact-text">
                I certify that I am the person named on this form and that the
                data/information I have provided is true and correct.
              </p>
              <p className="compact-text">
                I hereby give my full consent to Evergreen Realty Philippines to
                collect, record, organize, store, update, use, consolidate,
                block, erase or otherwise process information, whether personal,
                sensitive or privileged, pertaining to myself which will be used
                for the purpose of identity verification, processing compliance
                with Evergreen Realty Philippines Condominium Corporation House
                Rules and Master Deed with Deed of Restriction, sending
                property-related announcements and notices, billing statements,
                reminder and demand letters for association dues, water dues,
                and other assessments, providing relevant product and
                promotional information, sending surveys or feedback forms for
                the improvement of property management services, and for other
                purposes referred to in the Data Privacy Policy of Evergreen
                Realty Philippines.
              </p>
              <p className="compact-text">
                I certify and warrant that I have secured the consent of those
                individuals whose personal data I submitted through this Form.
              </p>
            </div>

            {/* Signature Section */}
            <div className="signature-section">
              <table className="signature-table">
                <tbody>
                  <tr>
                    <td>
                      <div className="signature-line"></div>
                      <p>Owner or Authorized Representative</p>
                    </td>
                    <td>
                      <div className="signature-line"></div>
                      <p>Owner or Authorized Representative</p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p>Signature over Printed Name</p>
                    </td>
                    <td>
                      <div className="date-line"></div>
                      <p>Date</p>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p className="distribution">
                Distribution to (1) Owner (2) Admin Office - Owner's 201 File
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResidentInformationForm;
