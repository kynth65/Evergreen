// src/components/pdf/AcknowledgementReceiptPDF.js
import React, { forwardRef } from "react";
import dayjs from "dayjs";
import numWords from "num-words";
// Import logo
// import Logo from "../../assets/Logo/evergreen-logo.png";

// Updated CSS with refined layout to match the image
const styles = `
  body { 
    font-family: Arial, sans-serif; 
    font-size: 11pt; 
    color: #000; 
    line-height: 1.4;
  }
  .receipt-container { 
    width: 100%; 
    max-width: 800px; 
    margin: 0 auto; 
    padding: 0; 
    position: relative;
    background-color: white;
  }
  .header-bar {
    background-color: #8ebb7e;
    height: 25px;
    width: 100%;
    margin-bottom: 20px;
  }
  .footer-area {
    position: relative;
    margin-top: 30px;
  }
  .footer-bar {
    background-color: #8ebb7e;
    height: 25px;
    width: 100%;
  }
  .footer-triangle {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 0 80px 80px;
    border-color: transparent transparent #8ebb7e transparent;
    transform: rotate(180deg);
  }
  .content-wrapper {
    padding: 0 30px;
  }
  .header { 
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }
  .logo-container {
    width: 80px;
    margin-right: 20px;
  }
  .logo {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: #ffe066;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #59a14f;
    font-size: 10pt;
    overflow: hidden;
  }
  .header-text {
    flex: 1;
    text-align: center;
  }
  .company-name { 
    margin: 0; 
    font-size: 20pt; 
    font-weight: bold;
    color: #000;
    text-transform: uppercase;
    line-height: 1.2;
  }
  .company-address { 
    margin: 5px 0; 
    font-size: 10pt;
    color: #333;
  }
  .receipt-title { 
    text-align: center; 
    font-size: 16pt; 
    font-weight: bold; 
    margin: 25px 0;
    text-decoration: underline;
    text-transform: uppercase;
  }
  .receipt-intro {
    font-weight: bold;
    margin-bottom: 15px;
    font-size: 11pt;
  }
  .receipt-body {
    font-size: 11pt;
    line-height: 1.5;
    margin-bottom: 20px;
    text-align: justify;
  }
  .highlight {
    background-color: #00ff00;
    padding: 0 3px;
    font-weight: bold;
  }
  .signature-section {
    margin-top: 40px;
    text-align: center;
  }
  .signature-label {
    margin-bottom: 10px;
    font-style: italic;
  }
  .signature-line {
    border-bottom: 1px solid #000;
    width: 250px;
    margin: 40px auto 0;
    text-align: center;
  }
  .signature-image {
    width: 150px;
    height: 60px;
    margin: 0 auto;
    display: block;
  }
  .signatory-name {
    font-weight: bold;
    margin-top: 5px;
    font-size: 11pt;
  }
  .signatory-title {
    font-size: 10pt;
  }
  .receipt-footer {
    margin-top: 25px;
    font-size: 10pt;
  }
  .receipt-metadata {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0.1;
    z-index: -1;
    font-size: 60pt;
    color: #8ebb7e;
    font-weight: bold;
    text-transform: uppercase;
  }
  .disclaimer {
    margin-top: 20px;
    font-size: 8pt;
    text-align: center;
    color: #444;
  }
  .disclaimer p {
    margin: 2px 0;
  }
  .divider {
    border-top: 1px solid #ddd;
    margin: 10px 0;
  }
  .contact-footer {
    display: flex;
    justify-content: space-between;
    padding: 15px 30px;
    font-size: 9pt;
    border-top: 1px solid #ddd;
    margin-top: 15px;
  }
  .contact-item {
    display: flex;
    align-items: center;
  }
  .contact-icon {
    margin-right: 5px;
    font-weight: bold;
  }
  .centered-text {
    text-align: center;
  }
`;

const AcknowledgementReceiptPDF = forwardRef(
  ({ receiptData, companyInfo, userInfo }, ref) => {
    if (!receiptData) {
      return <div ref={ref}></div>;
    }

    const {
      clientName,
      paymentDate,
      amount,
      paymentMethod,
      referenceNumber,
      paymentNotes,
      propertyName,
      blockLotNo,
      paymentNumber,
      totalMonths,
      currentPayment,
      propertySize,
      propertyLocation,
    } = receiptData;

    // Format amount
    const numberValue = parseFloat(amount) || 0;
    const formattedNumber = numberValue.toLocaleString("en-PH");
    const formattedAmount = `(PHP ${formattedNumber}.00)`;

    // Convert amount to words (uppercase for the main amount display)
    const amountInWords = numWords(Math.floor(numberValue))
      .toUpperCase()
      .replace(/-/g, " ");

    // Updated company info
    const defaultCompanyInfo = {
      name: "E-VERGREEN REAL ESTATE SERVICES",
      address: "CITY OF SAN JOSE DEL MONTE, BULACAN",
      contact: "09667898610",
      email: "evergreenrealty2020@gmail.com",
      facebook: "@EvergreenRealtyPH",
      phone: "(02) 7617-3787",
    };
    const currentCompanyInfo = { ...defaultCompanyInfo, ...companyInfo };

    // Generate receipt number based on client reference
    const receiptNo =
      referenceNumber ||
      `AYCO-${String(paymentNumber || "000").padStart(3, "0")}`;

    // Format date using ordinal format
    const formattedDate = paymentDate
      ? dayjs(paymentDate).format("Do [of] MMMM YYYY")
      : "20th of March 2025";

    return (
      <div ref={ref}>
        <style>{styles}</style>
        <div className="receipt-container">
          {/* Watermark */}
          <div className="watermark">E-VERGREEN</div>

          {/* Green header bar */}
          <div className="header-bar"></div>

          <div className="content-wrapper">
            <div className="header">
              <div className="logo-container">
                {/* Replace with actual logo or create a circular placeholder */}
                <div className="logo">
                  <img
                    src="/path/to/evergreen-logo.png"
                    alt="Evergreen Realty"
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
              </div>
              <div className="header-text">
                <h1 className="company-name">{currentCompanyInfo.name}</h1>
                <p className="company-address">{currentCompanyInfo.address}</p>
              </div>
            </div>

            <div className="receipt-title">ACKNOWLEDGEMENT RECEIPT</div>

            <div className="receipt-intro">KNOW ALL MEN BY THESE PRESENTS:</div>

            <div className="receipt-body">
              This is to acknowledge receipt the amount of {amountInWords}{" "}
              {formattedAmount} PESOS from {clientName || "JOEY JAY AYCO"}, of
              legal age, Filipino citizen, and resident of{" "}
              {propertyLocation
                ? propertyLocation.split(",")[0]
                : "City of San Jose Del Monte, Bulacan"}
              , tagged as{" "}
              <span className="highlight">
                {currentPayment || "5"} OF {totalMonths || "60"} MONTHLY
                AMORTIZATION
              </span>{" "}
              for farm lot situated in {blockLotNo || "Blk 1 Lot 2"},{" "}
              {propertyName || "JUANDERLAND"},
              {propertyLocation
                ? propertyLocation.split(",").slice(1).join(",")
                : "Brgy. San Mateo, Norzagaray, Bulacan"}
              , containing a total area of{" "}
              {propertySize || "Two Hundred Forty (240) Square Meters"}, more or
              less. This is non-refundable but deductible to the Total Contract
              Price.
            </div>

            <p className="centered-text">
              {formattedDate}, at City of San Jose del Monte, Bulacan.
            </p>

            <div className="signature-section">
              <p className="signature-label">Received by:</p>
              <div className="signature-image">
                {/* Add actual signature image here */}
                <img
                  src="/path/to/signature.png"
                  alt="Signature"
                  style={{ width: "100%" }}
                />
              </div>
              <p className="signatory-name">
                {userInfo?.name || "JAIKA BEATRIX LELIS, MBA"}
              </p>
              <p className="signatory-title">
                E-vergreen Real Estate Services, Seller
              </p>
            </div>

            <div className="receipt-footer">
              <div className="receipt-metadata">
                <p>AR No.: {receiptNo || "AYCO-012"}</p>
                <p>
                  Recorded by: {userInfo?.recorder || "Reniella Torrecampo"}
                </p>
              </div>
            </div>

            <div className="disclaimer">
              <p>
                DISCLAIMER: This is electronically generated, digital signature
                stamped.
              </p>
              <p>
                Should verification be needed to determine the authenticity of
                the information stated in this document, please contact
              </p>
              <p>
                {currentCompanyInfo.email} or {currentCompanyInfo.contact}.
              </p>
              <p>
                Copyright {dayjs().format("YYYY")} © E-vergreen Real Estate
                Services, Inc.
              </p>
              <p>All Rights Reserved. Highly Confidential.</p>
            </div>

            <div className="contact-footer">
              <div className="contact-item">
                <span className="contact-icon">f</span> @EvergreenRealtyPH
              </div>
              <div className="contact-item">
                <span className="contact-icon">✉</span>{" "}
                evergreenrealty2020@gmail.com
              </div>
              <div className="contact-item">
                <span className="contact-icon">✆</span> (02) 7617-3787
              </div>
            </div>
          </div>

          {/* Footer area with triangle */}
          <div className="footer-area">
            <div className="footer-triangle"></div>
            <div className="footer-bar"></div>
          </div>
        </div>
      </div>
    );
  }
);

export default AcknowledgementReceiptPDF;
