import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../axios.client";
import { useStateContext } from "../../context/ContextProvider";
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Space,
  Empty,
  message,
  ConfigProvider,
} from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

// Import custom components
import ClientPropertyInfo from "./ClientPropertyInfo";
import PaymentDetailsInfo from "./PaymentDetailsInfo";
import PaymentNotesCard from "./PaymentNotesCard";
import RecordPaymentSection from "./RecordPaymentSection";

dayjs.extend(isBetween);
const { Title } = Typography;

const ClientPaymentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useStateContext();
  const userRole = user?.role;

  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

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

  // Handle return to list
  const handleBackToList = () => {
    navigate(`/${userRole}/client-payment`);
  };

  // Get payment status
  const paymentStatus = getPaymentStatus(payment);

  // Handle data refresh (for after payment recording)
  const handleRefreshData = () => {
    setRefreshKey((prev) => prev + 1);
  };

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
                {/* <Button
                  icon={<EditOutlined />}
                  onClick={() => {
                    navigate(`/${userRole}/client-payment/edit/${id}`);
                  }}
                >
                  Edit
                </Button> */}

                {/* Record Payment Button via RecordPaymentSection component */}
                <RecordPaymentSection
                  payment={payment}
                  paymentStatus={paymentStatus}
                  user={user}
                  refreshData={handleRefreshData}
                />
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Main content */}
        <Row gutter={[16, 16]}>
          {/* Left column: Client and property info */}
          <ClientPropertyInfo payment={payment} />

          {/* Right column: Payment info and details */}
          <PaymentDetailsInfo payment={payment} paymentStatus={paymentStatus} />
        </Row>

        {/* Additional notes */}
        {payment.payment_notes && (
          <PaymentNotesCard notes={payment.payment_notes} />
        )}
      </div>
    </ConfigProvider>
  );
};

export default ClientPaymentDetails;
