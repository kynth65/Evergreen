import React, { useRef, useState, useEffect } from "react";
import {
  Modal,
  Form,
  InputNumber,
  DatePicker,
  Radio,
  Input,
  Button,
  message,
} from "antd";
import { DollarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import html2pdf from "html2pdf.js";
import AcknowledgementReceiptPDF from "./AcknowledgementReceiptPDF";
import axiosClient from "../../axios.client";
import { roundUpToWhole } from "../../utils/numberFormatters";

const { TextArea } = Input;

/**
 * Component for recording a new payment and handling PDF receipt generation
 */
const RecordPaymentSection = ({
  payment,
  paymentStatus,
  user,
  refreshData,
}) => {
  const [form] = Form.useForm();
  const [recordPaymentModalVisible, setRecordPaymentModalVisible] =
    useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [lastPaymentDataForReceipt, setLastPaymentDataForReceipt] =
    useState(null);
  const acknowledgementReceiptRef = useRef(null);
  const pdfGenerationAttempt = useRef(0);

  // PDF generation function
  const generateAcknowledgementReceiptPDF = (receiptData) => {
    // Safety checks
    if (!acknowledgementReceiptRef.current) {
      message.error("Receipt template not ready. Please try again.");
      console.error("AcknowledgementReceiptPDF ref is not available.");
      setIsGeneratingPdf(false);
      return;
    }

    if (!receiptData) {
      message.error("No payment data available for receipt generation.");
      console.error("receiptData is null or undefined.");
      setIsGeneratingPdf(false);
      return;
    }

    // Increment attempt counter
    pdfGenerationAttempt.current += 1;
    console.log(`PDF Generation Attempt #${pdfGenerationAttempt.current}`);

    const element = acknowledgementReceiptRef.current;
    const clientName =
      receiptData.clientName?.replace(/[^a-zA-Z0-9]/g, "_") || "Client";
    const paymentDateShort = dayjs(receiptData.paymentDate).format("YYYYMMDD");
    const filename = `AR_${clientName}_${paymentDateShort}_${receiptData.paymentNumber}.pdf`;

    const options = {
      filename: filename,
      margin: [10, 10, 10, 10],
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: true, // Enable logging for debug
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    // Log current HTML content for debugging
    console.log(
      "PDF Element Content:",
      element.innerHTML.substring(0, 100) + "..."
    );

    // Create a promise-based generation process
    message.loading({
      content: "Generating Acknowledgement Receipt...",
      key: "pdfgen",
      duration: 0,
    });

    // Use timeout to ensure DOM rendering is complete
    setTimeout(() => {
      html2pdf()
        .from(element)
        .set(options)
        .save()
        .then(() => {
          message.success({
            content: "Acknowledgement Receipt downloaded!",
            key: "pdfgen",
            duration: 3,
          });
          setIsGeneratingPdf(false);
          setLastPaymentDataForReceipt(null);
        })
        .catch((error) => {
          console.error("Error generating PDF:", error);
          message.error({
            content:
              "Failed to generate PDF. Please check console for details.",
            key: "pdfgen",
            duration: 3,
          });
          setIsGeneratingPdf(false);
        });
    }, 500); // Give extra time for rendering
  };

  // Simplified PDF generation trigger useEffect
  useEffect(() => {
    if (lastPaymentDataForReceipt) {
      console.log(
        "PDF generation requested with data:",
        lastPaymentDataForReceipt
      );
      setIsGeneratingPdf(true);

      // Short delay to ensure component is rendered
      setTimeout(() => {
        generateAcknowledgementReceiptPDF(lastPaymentDataForReceipt);
      }, 300);
    }
  }, [lastPaymentDataForReceipt]);

  // Open record payment modal
  const openRecordPaymentModal = () => {
    if (!payment || isGeneratingPdf) return;

    setRecordPaymentModalVisible(true);

    // Get next payment info
    const nextPaymentNumber = payment.completed_payments + 1;
    const nextScheduledPayment = payment.paymentSchedules?.find(
      (schedule) => schedule.payment_number === nextPaymentNumber
    );

    // Calculate expected payment
    const totalInstallments = payment.installment_years * 12;
    const expectedMonthlyAmount =
      totalInstallments > 0 ? payment.total_amount / totalInstallments : 0;

    // Round up to whole number
    const roundedAmount = nextScheduledPayment?.amount
      ? roundUpToWhole(nextScheduledPayment.amount)
      : roundUpToWhole(
          payment.payment_type !== "spot_cash"
            ? expectedMonthlyAmount
            : payment.total_amount
        );

    form.setFieldsValue({
      amount: roundedAmount,
      payment_date: dayjs(),
      payment_method: "CASH",
      reference_number: null,
      payment_notes: null,
    });
  };

  // Handle record payment
  const handleRecordPayment = async (values) => {
    if (!payment || isGeneratingPdf) return;

    // Round up the payment amount to ensure whole numbers
    const paymentAmount = roundUpToWhole(values.amount);
    const paymentDate = values.payment_date;

    // Prepare receipt data
    const receiptData = {
      clientName: payment.client_name,
      paymentDate: paymentDate,
      amount: paymentAmount,
      paymentMethod: values.payment_method,
      referenceNumber: values.reference_number,
      paymentNotes: values.payment_notes,
      propertyName:
        payment.lots && payment.lots.length > 0
          ? payment.lots[0].property_name
          : "N/A",
      blockLotNo:
        payment.lots && payment.lots.length > 0
          ? payment.lots[0].block_lot_no
          : "N/A",
      paymentNumber: (payment.completed_payments || 0) + 1,
    };

    try {
      // Record the payment in the API
      await axiosClient.post(`/client-payments/${payment.id}/record-payment`, {
        ...values,
        amount: paymentAmount,
        payment_date: paymentDate.format("YYYY-MM-DD"),
      });

      message.success("Payment recorded successfully");

      // Close modal before PDF generation
      setRecordPaymentModalVisible(false);
      form.resetFields();

      // Trigger PDF generation AFTER API call succeeds
      setLastPaymentDataForReceipt(receiptData);

      // Refresh data after a short delay (after PDF generation)
      setTimeout(() => {
        refreshData();
      }, 1000);
    } catch (error) {
      console.error("Error recording payment:", error);
      let errorMessage = "Failed to record payment";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      message.error(errorMessage);
      setIsGeneratingPdf(false);
    }
  };

  return (
    <>
      {/* Record Payment Button (only shown for installment payments that aren't completed) */}
      {payment.payment_type !== "spot_cash" &&
        paymentStatus?.status !== "COMPLETED" && (
          <Button
            type="primary"
            icon={<DollarOutlined />}
            onClick={openRecordPaymentModal}
            disabled={isGeneratingPdf}
            loading={isGeneratingPdf}
          >
            Record Payment
          </Button>
        )}

      {/* Record Payment Modal */}
      <Modal
        title="Record Payment"
        open={recordPaymentModalVisible}
        onCancel={() => {
          if (!isGeneratingPdf) {
            setRecordPaymentModalVisible(false);
            form.resetFields();
          } else {
            message.warning("Please wait for PDF generation to complete.");
          }
        }}
        footer={null}
        closable={!isGeneratingPdf}
        maskClosable={!isGeneratingPdf}
      >
        <Form form={form} layout="vertical" onFinish={handleRecordPayment}>
          <Form.Item
            name="amount"
            label="Payment Amount"
            rules={[
              { required: true, message: "Please enter payment amount" },
              {
                type: "number",
                min: 0.01,
                message: "Amount must be positive",
              },
            ]}
          >
            <InputNumber
              prefix="₱"
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value?.replace(/₱\s?|(,*)/g, "")}
              precision={0} // Ensure whole numbers
            />
          </Form.Item>

          <Form.Item
            name="payment_date"
            label="Payment Date"
            rules={[{ required: true, message: "Please select payment date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="payment_method"
            label="Payment Method"
            rules={[
              { required: true, message: "Please select payment method" },
            ]}
          >
            <Radio.Group>
              <Radio value="CASH">Cash</Radio>
              <Radio value="CHECK">Check</Radio>
              <Radio value="BANK_TRANSFER">Bank Transfer</Radio>
              <Radio value="ONLINE">Online Payment</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="reference_number"
            label="Reference Number (Optional)"
          >
            <Input placeholder="e.g., Check #, Transaction ID" />
          </Form.Item>

          <Form.Item name="payment_notes" label="Payment Notes (Optional)">
            <TextArea
              rows={3}
              placeholder="e.g., Payment for Month X, Late fee included"
            />
          </Form.Item>

          {/* Modal Footer Buttons */}
          <div style={{ textAlign: "right", marginTop: "20px" }}>
            <Button
              onClick={() => {
                if (!isGeneratingPdf) {
                  setRecordPaymentModalVisible(false);
                  form.resetFields();
                } else {
                  message.warning(
                    "Please wait for PDF generation to complete."
                  );
                }
              }}
              style={{ marginRight: 8 }}
              disabled={isGeneratingPdf}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<DollarOutlined />}
              loading={isGeneratingPdf}
              disabled={isGeneratingPdf}
            >
              {isGeneratingPdf ? "Generating..." : "Record Payment"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Hidden component for PDF Generation */}
      <AcknowledgementReceiptPDF
        ref={acknowledgementReceiptRef}
        receiptData={lastPaymentDataForReceipt}
        userInfo={user}
      />
    </>
  );
};

export default RecordPaymentSection;
