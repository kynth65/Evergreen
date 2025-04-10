import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../axios.client";
import html2pdf from "html2pdf.js";
import AcknowledgementReceiptPDF from "./AcknowledgementReceiptPDF";
import { useStateContext } from "../../context/ContextProvider";
import {
  Card,
  Row,
  Col,
  Typography,
  Descriptions,
  Tag,
  Button,
  Space,
  Table,
  Divider,
  Statistic,
  Progress,
  Empty,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  Input,
  Radio,
  message,
  ConfigProvider,
} from "antd";
import {
  ArrowLeftOutlined,
  DollarOutlined,
  FileTextOutlined,
  UserOutlined,
  HomeOutlined,
  EditOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ClientPaymentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useStateContext();
  const userRole = user?.role;

  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState(null);
  const [recordPaymentModalVisible, setRecordPaymentModalVisible] =
    useState(false);
  const [recordPaymentForm] = Form.useForm();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [lastPaymentDataForReceipt, setLastPaymentDataForReceipt] =
    useState(null);

  // Create a stable ref that won't change between renders
  const acknowledgementReceiptRef = useRef(null);

  // Track PDF generation attempts for debugging
  const pdfGenerationAttempt = useRef(0);

  // Fetch payment data
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      setLoading(true);
      try {
        console.log("Fetching payment details for ID:", id);
        const response = await axiosClient.get(`/client-payments/${id}`);

        // Fetch transactions separately
        const transactionsResponse = await axiosClient.get(
          `/client-payments/${id}/transactions`
        );
        console.log("Transactions response:", transactionsResponse.data);

        // Combine the data
        const paymentData = {
          ...response.data,
          paymentTransactions: transactionsResponse.data,
        };

        console.log("Combined payment data:", paymentData);

        // Sort paymentSchedules if they exist
        if (paymentData.paymentSchedules) {
          paymentData.paymentSchedules.sort(
            (a, b) => a.payment_number - b.payment_number
          );
        }
        // Sort paymentTransactions if they exist
        if (paymentData.paymentTransactions) {
          paymentData.paymentTransactions.sort(
            (a, b) =>
              new Date(a.payment_date || 0) - new Date(b.payment_date || 0) ||
              a.id - b.id
          );
        }

        setPayment(paymentData);
      } catch (error) {
        console.error("Error fetching payment details:", error);
        message.error("Failed to load payment details");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [id, refreshKey]);

  // More reliable PDF generation function
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

  // Calculate payment status and color
  const getPaymentStatus = (record) => {
    if (!record) return { status: "LOADING", color: "default" };

    if (record.payment_type === "spot_cash") {
      const paidTransaction = record.paymentTransactions?.find(
        (tx) => tx.amount >= record.total_amount
      );
      return {
        status: paidTransaction ? "PAID" : "PENDING",
        color: paidTransaction ? "success" : "default",
      };
    }

    const totalInstallments = record.installment_years * 12;
    const completedPayments = record.completed_payments || 0;

    if (completedPayments >= totalInstallments) {
      return { status: "COMPLETED", color: "success" };
    }

    const nextPaymentDate = record.next_payment_date
      ? dayjs(record.next_payment_date)
      : null;
    const today = dayjs();

    if (!nextPaymentDate) {
      return { status: "PENDING", color: "default" };
    }

    if (nextPaymentDate.isBefore(today, "day")) {
      const daysDiff = today.diff(nextPaymentDate, "day");
      if (daysDiff > 30) {
        return { status: "SUPER LATE", color: "error" };
      }
      return { status: "LATE", color: "warning" };
    }

    return { status: "CURRENT", color: "processing" };
  };

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

    recordPaymentForm.setFieldsValue({
      amount:
        nextScheduledPayment?.amount ??
        (payment.payment_type !== "spot_cash"
          ? expectedMonthlyAmount
          : payment.total_amount),
      payment_date: dayjs(),
      payment_method: "CASH",
      reference_number: null,
      payment_notes: null,
    });
  };

  // Handle record payment
  const handleRecordPayment = async (values) => {
    if (!payment || isGeneratingPdf) return;

    const paymentAmount = parseFloat(values.amount);
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
      recordPaymentForm.resetFields();

      // Trigger PDF generation AFTER API call succeeds
      setLastPaymentDataForReceipt(receiptData);

      // Refresh data after a short delay (after PDF generation)
      setTimeout(() => {
        setRefreshKey((prev) => prev + 1);
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

  // Handle return to list
  const handleBackToList = () => {
    navigate(`/${userRole}/client-payment`);
  };

  // Get payment status
  const paymentStatus = getPaymentStatus(payment);

  // Calculate progress
  const calculateProgress = () => {
    if (!payment) return { percent: 0, completed: 0, total: 0 };

    if (payment.payment_type === "spot_cash") {
      const paidTransaction = payment.paymentTransactions?.find(
        (tx) => tx.amount >= payment.total_amount
      );
      const completed = paidTransaction ? 1 : 0;
      return { percent: completed * 100, completed: completed, total: 1 };
    }

    const totalPayments = payment.installment_years * 12;
    const completed = payment.completed_payments || 0;
    const percent =
      totalPayments > 0 ? Math.round((completed / totalPayments) * 100) : 0;

    return { percent, completed, total: totalPayments };
  };

  const progress = calculateProgress();

  // Calculate total amounts
  const calculateTotalAmounts = () => {
    if (!payment) return { totalAmount: 0, paidAmount: 0, remainingAmount: 0 };

    const totalAmount = payment.total_amount;
    let paidAmount = 0;

    if (payment.payment_type === "spot_cash") {
      paidAmount =
        payment.paymentTransactions?.reduce(
          (sum, tx) => sum + parseFloat(tx.amount || 0),
          0
        ) || 0;
      paidAmount = Math.min(paidAmount, totalAmount);
      return {
        totalAmount,
        paidAmount: paidAmount,
        remainingAmount: Math.max(0, totalAmount - paidAmount),
      };
    }

    if (payment.paymentTransactions && payment.paymentTransactions.length > 0) {
      paidAmount = payment.paymentTransactions.reduce(
        (sum, tx) => sum + parseFloat(tx.amount || 0),
        0
      );
    } else {
      const totalInstallments = payment.installment_years * 12;
      const monthlyPayment =
        totalInstallments > 0 ? totalAmount / totalInstallments : 0;
      paidAmount = (payment.completed_payments || 0) * monthlyPayment;
    }

    paidAmount = Math.min(paidAmount, totalAmount);
    const remainingAmount = Math.max(0, totalAmount - paidAmount);

    return {
      totalAmount,
      paidAmount,
      remainingAmount,
    };
  };

  const { totalAmount, paidAmount, remainingAmount } = calculateTotalAmounts();

  // Transaction columns
  const transactionColumns = [
    {
      title: "Payment #",
      dataIndex: "payment_number",
      key: "payment_number",
      sorter: (a, b) => a.payment_number - b.payment_number,
    },
    {
      title: "Date",
      dataIndex: "payment_date",
      key: "payment_date",
      render: (text) => (text ? dayjs(text).format("MMM D, YYYY") : "N/A"),
      sorter: (a, b) =>
        dayjs(a.payment_date).unix() - dayjs(b.payment_date).unix(),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text) => (
        <Text>
          ₱
          {new Intl.NumberFormat("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(text || 0)}
        </Text>
      ),
    },
    {
      title: "Method",
      dataIndex: "payment_method",
      key: "payment_method",
      render: (text) => {
        const methodColors = {
          CASH: "green",
          CHECK: "blue",
          BANK_TRANSFER: "purple",
          ONLINE: "cyan",
          undefined: "default",
          null: "default",
        };
        return (
          <Tag color={methodColors[text] || "default"}>{text || "N/A"}</Tag>
        );
      },
      filters: [
        { text: "Cash", value: "CASH" },
        { text: "Check", value: "CHECK" },
        { text: "Bank Transfer", value: "BANK_TRANSFER" },
        { text: "Online", value: "ONLINE" },
      ],
      onFilter: (value, record) => record.payment_method === value,
    },
    {
      title: "Reference #",
      dataIndex: "reference_number",
      key: "reference_number",
      render: (text) => text || <Text type="secondary">N/A</Text>,
    },
    {
      title: "Notes",
      dataIndex: "payment_notes",
      key: "payment_notes",
      render: (text) => text || <Text type="secondary">-</Text>,
    },
  ];

  // Schedule columns
  const scheduleColumns = [
    {
      title: "Payment #",
      dataIndex: "payment_number",
      key: "payment_number",
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: (text) => dayjs(text).format("MMM D, YYYY"),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text) => (
        <Text>
          ₱
          {new Intl.NumberFormat("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(text || 0)}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text, record) => {
        const correspondingTransaction = payment?.paymentTransactions?.find(
          (tx) => tx.payment_number === record.payment_number
        );
        const today = dayjs();
        const dueDate = dayjs(record.due_date);
        let color = "default";
        let statusText = "PENDING";

        if (correspondingTransaction) {
          statusText = "PAID";
          color = "success";
        } else if (today.isAfter(dueDate, "day")) {
          const daysDiff = today.diff(dueDate, "day");
          statusText = daysDiff > 30 ? "SUPER LATE" : "LATE";
          color = daysDiff > 30 ? "error" : "warning";
        }

        return <Tag color={color}>{statusText}</Tag>;
      },
    },
  ];

  // Loading state UI
  if (loading) {
    return (
      <Card loading={true}>
        <div style={{ minHeight: 400 }}></div>
      </Card>
    );
  }

  // Not found state UI
  if (!payment) {
    return (
      <Card>
        <Empty description="Payment not found or failed to load." />
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Button type="primary" onClick={handleBackToList}>
            Back to List
          </Button>
        </div>
      </Card>
    );
  }

  // Main component render
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1da57a",
        },
      }}
    >
      <div style={{ padding: "0", maxWidth: "100%" }}>
        {/* Header with back button and actions */}
        <Card style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space size="middle">
                <Button icon={<ArrowLeftOutlined />} onClick={handleBackToList}>
                  Back to List
                </Button>
                <Title level={4} style={{ margin: 0 }}>
                  Payment Details
                </Title>
                {paymentStatus && (
                  <Tag color={paymentStatus.color}>{paymentStatus.status}</Tag>
                )}
              </Space>
            </Col>
            <Col>
              <Space>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => {
                    navigate(`/${userRole}/client-payment/edit/${id}`);
                  }}
                >
                  Edit
                </Button>
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
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Main content */}
        <Row gutter={[16, 16]}>
          {/* Left column: Client and property info */}
          <Col xs={24} lg={8}>
            {/* Client Info Card */}
            <Card
              title={
                <Space>
                  <UserOutlined /> <span>Client Information</span>
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="Client Name">
                  {payment.client_name}
                </Descriptions.Item>
                <Descriptions.Item label="Contact Number">
                  {payment.contact_number}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {payment.email || <Text type="secondary">Not provided</Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Address">
                  {payment.address || (
                    <Text type="secondary">Not provided</Text>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Property Info Card */}
            <Card
              title={
                <Space>
                  <HomeOutlined /> <span>Property Information</span>
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              {payment.lots && payment.lots.length > 0 ? (
                <div>
                  {payment.lots.map((lot, index) => (
                    <div
                      key={lot.id || index}
                      style={{
                        marginBottom:
                          index !== payment.lots.length - 1 ? 16 : 0,
                      }}
                    >
                      <Descriptions column={1} size="small" bordered>
                        <Descriptions.Item label="Property Name">
                          {lot.property_name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Block & Lot No">
                          {lot.block_lot_no}
                        </Descriptions.Item>
                        <Descriptions.Item label="Lot Area">
                          {lot.lot_area} sqm
                        </Descriptions.Item>
                        <Descriptions.Item label="Contract Price">
                          ₱
                          {new Intl.NumberFormat("en-PH", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(lot.total_contract_price || 0)}
                        </Descriptions.Item>
                        {/* Display custom price if different */}
                        {lot.pivot?.custom_price &&
                          parseFloat(lot.pivot.custom_price) !==
                            parseFloat(lot.total_contract_price) && (
                            <Descriptions.Item label="Agreed Price">
                              <Text type="success">
                                ₱
                                {new Intl.NumberFormat("en-PH", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }).format(lot.pivot.custom_price)}
                              </Text>
                            </Descriptions.Item>
                          )}
                      </Descriptions>
                      {index !== payment.lots.length - 1 && (
                        <Divider style={{ margin: "16px 0" }} />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Empty description="No property information associated" />
              )}
            </Card>
          </Col>

          {/* Right column: Payment info and details */}
          <Col xs={24} lg={16}>
            {/* Payment Summary Card (existing) */}
            <Card
              title={
                <Space>
                  {" "}
                  <DollarOutlined /> <span>Payment Summary</span>{" "}
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Total Amount"
                    value={totalAmount}
                    precision={2}
                    formatter={(value) =>
                      `₱${new Intl.NumberFormat("en-PH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(value)}`
                    }
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Total Paid"
                    value={paidAmount}
                    precision={2}
                    valueStyle={{ color: "#3f8600" }}
                    formatter={(value) =>
                      `₱${new Intl.NumberFormat("en-PH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(value)}`
                    }
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Remaining Balance"
                    value={remainingAmount}
                    precision={2}
                    valueStyle={{
                      color: remainingAmount > 0 ? "#cf1322" : "#3f8600",
                    }}
                    formatter={(value) =>
                      `₱${new Intl.NumberFormat("en-PH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(value)}`
                    }
                  />
                </Col>
                <Col xs={24}>
                  <Divider style={{ margin: "8px 0 16px" }} />
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="Payment Type">
                          <Tag
                            color={
                              payment.payment_type === "spot_cash"
                                ? "green"
                                : "blue"
                            }
                          >
                            {payment.payment_type === "spot_cash"
                              ? "Spot Cash"
                              : "Installment"}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Start Date">
                          {payment.start_date
                            ? dayjs(payment.start_date).format("MMMM D, YYYY")
                            : "N/A"}
                        </Descriptions.Item>
                        {payment.payment_type !== "spot_cash" && (
                          <>
                            <Descriptions.Item label="Installment Period">
                              {payment.installment_years}{" "}
                              {payment.installment_years > 1 ? "years" : "year"}{" "}
                              ({payment.installment_years * 12} months)
                            </Descriptions.Item>
                            {/* Calculate monthly payment based on total amount and period */}
                            {(() => {
                              const totalInstallments =
                                payment.installment_years * 12;
                              const monthly =
                                totalInstallments > 0
                                  ? payment.total_amount / totalInstallments
                                  : 0;
                              return (
                                <Descriptions.Item label="Expected Monthly">
                                  ₱
                                  {new Intl.NumberFormat("en-PH", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }).format(monthly)}
                                </Descriptions.Item>
                              );
                            })()}
                          </>
                        )}
                      </Descriptions>
                    </Col>
                    <Col xs={24} md={12}>
                      {payment.payment_type !== "spot_cash" && (
                        <>
                          <div style={{ marginBottom: 8 }}>
                            {" "}
                            <Text strong>Payment Progress</Text>{" "}
                          </div>
                          <Progress
                            percent={progress.percent}
                            status={
                              progress.percent === 100
                                ? "success"
                                : paymentStatus?.status === "LATE" ||
                                  paymentStatus?.status === "SUPER LATE"
                                ? "exception"
                                : "active"
                            }
                            strokeColor={
                              progress.percent < 30
                                ? "#f5222d"
                                : progress.percent < 70
                                ? "#faad14"
                                : "#52c41a"
                            }
                          />
                          <div style={{ marginTop: 8 }}>
                            <Text>
                              {" "}
                              {progress.completed} of {progress.total} payments
                              completed ({progress.percent}%){" "}
                            </Text>
                          </div>

                          {/* Show next payment due date */}
                          {payment.next_payment_date &&
                            paymentStatus?.status !== "COMPLETED" && (
                              <div style={{ marginTop: 16 }}>
                                <Text strong>Next Payment Due:</Text>{" "}
                                <Text
                                  type={
                                    paymentStatus?.status === "LATE" ||
                                    paymentStatus?.status === "SUPER LATE"
                                      ? "danger"
                                      : undefined
                                  }
                                >
                                  {dayjs(payment.next_payment_date).format(
                                    "MMMM D, YYYY"
                                  )}
                                  {(paymentStatus?.status === "LATE" ||
                                    paymentStatus?.status === "SUPER LATE") && (
                                    <Text type="danger"> (Overdue)</Text>
                                  )}
                                </Text>
                              </div>
                            )}
                        </>
                      )}
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>

            {/* Transaction History Table (using existing logic but refined columns) */}
            <Card>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderBottom: "1px solid #f0f0f0",
                  padding: "12px 0",
                  marginBottom: 16,
                }}
              >
                <FileTextOutlined />
                <span style={{ marginLeft: 8, fontWeight: "bold" }}>
                  {" "}
                  Transaction History{" "}
                </span>
              </div>
              {/* Ensure paymentTransactions is checked */}
              {payment.paymentTransactions &&
              payment.paymentTransactions.length > 0 ? (
                <Table
                  columns={transactionColumns}
                  dataSource={payment.paymentTransactions}
                  // Use a stable key, preferably the transaction's unique ID
                  rowKey={(record) =>
                    record.id ||
                    `${record.payment_number}-${record.payment_date}`
                  }
                  pagination={{ pageSize: 10, showSizeChanger: true }}
                  size="small"
                  scroll={{ x: 800 }} // Add horizontal scroll if needed
                />
              ) : (
                <Empty description="No transactions recorded yet" />
              )}
            </Card>

            {/* Optionally, add Payment Schedule Table if needed */}
            {payment.payment_type !== "spot_cash" &&
              payment.paymentSchedules &&
              payment.paymentSchedules.length > 0 && (
                <Card style={{ marginTop: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      borderBottom: "1px solid #f0f0f0",
                      padding: "12px 0",
                      marginBottom: 16,
                    }}
                  >
                    <CalendarOutlined />
                    <span style={{ marginLeft: 8, fontWeight: "bold" }}>
                      {" "}
                      Payment Schedule{" "}
                    </span>
                  </div>
                  <Table
                    columns={scheduleColumns}
                    dataSource={payment.paymentSchedules}
                    rowKey={(record) => record.id || record.payment_number}
                    pagination={{ pageSize: 5, showSizeChanger: false }} // Smaller pagination for schedule
                    size="small"
                    scroll={{ x: 600 }}
                  />
                </Card>
              )}
          </Col>
        </Row>

        {/* Additional notes (existing) */}
        {payment.payment_notes && (
          <Card
            title={
              <Space>
                {" "}
                <FileTextOutlined /> <span>General Payment Notes</span>{" "}
              </Space>
            }
            style={{ marginTop: 16 }}
          >
            <Paragraph style={{ whiteSpace: "pre-wrap" }}>
              {payment.payment_notes}
            </Paragraph>
          </Card>
        )}

        {/* Record Payment Modal (UPDATED with loading/disabled states) */}
        <Modal
          title="Record Payment"
          open={recordPaymentModalVisible}
          // Update onCancel (UPDATED)
          onCancel={() => {
            if (!isGeneratingPdf) {
              setRecordPaymentModalVisible(false);
              recordPaymentForm.resetFields();
            } else {
              message.warning("Please wait for PDF generation to complete.");
            }
          }}
          footer={null} // Keep footer null
          // Add closable/maskClosable (UPDATED)
          closable={!isGeneratingPdf}
          maskClosable={!isGeneratingPdf}
        >
          <Form
            form={recordPaymentForm}
            layout="vertical"
            onFinish={handleRecordPayment} // Uses updated function
          >
            {/* Form Items (existing) */}
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
                precision={2} // Ensure 2 decimal places
              />
            </Form.Item>

            <Form.Item
              name="payment_date"
              label="Payment Date"
              rules={[
                { required: true, message: "Please select payment date" },
              ]}
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

            {/* Modal Footer Buttons (UPDATED with loading/disabled states) */}
            <div style={{ textAlign: "right", marginTop: "20px" }}>
              <Button
                // Update onClick (UPDATED)
                onClick={() => {
                  if (!isGeneratingPdf) {
                    setRecordPaymentModalVisible(false);
                    recordPaymentForm.resetFields();
                  } else {
                    message.warning(
                      "Please wait for PDF generation to complete."
                    );
                  }
                }}
                style={{ marginRight: 8 }}
                // Add disabled state (UPDATED)
                disabled={isGeneratingPdf}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit" // Keep as submit
                icon={<DollarOutlined />}
                // Add loading and disabled states (UPDATED)
                loading={isGeneratingPdf}
                disabled={isGeneratingPdf}
              >
                {/* Update button text (UPDATED) */}
                {isGeneratingPdf ? "Generating..." : "Record Payment"}
              </Button>
            </div>
            {/* --- End Modal Footer Buttons --- */}
          </Form>
        </Modal>

        {/* Hidden component for PDF Generation (ADDED) */}
        {/* It renders based on lastPaymentDataForReceipt state */}
        {/* We pass ref, data, and user info */}
        <AcknowledgementReceiptPDF
          ref={acknowledgementReceiptRef}
          receiptData={lastPaymentDataForReceipt}
          userInfo={user} // Pass logged-in user info
          // companyInfo={{ name: "Your Custom Company Name" }} // Optional: Pass custom company info if needed
        />
      </div>
    </ConfigProvider>
  );
};

export default ClientPaymentDetails;
