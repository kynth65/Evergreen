import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../axios.client";
import { useStateContext } from "../../context/ContextProvider";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Empty,
  message,
  ConfigProvider,
} from "antd";
import { ArrowLeftOutlined, DollarOutlined } from "@ant-design/icons";
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
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);

  // Fetch payment data
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/client-payments/${id}`);
        // Fetch transactions separately
        const transactionsResponse = await axiosClient.get(
          `/client-payments/${id}/transactions`
        );

        // Combine the data
        const paymentData = {
          ...response.data,
          paymentTransactions: transactionsResponse.data,
        };

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

  // Calculate payment status and color (without showing the status in the header)
  const getPaymentStatus = (record) => {
    if (!record) return { status: "", color: "default" };

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

    return { status: "", color: "processing" }; // Removed "CURRENT" status
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

  // Handle record payment button click
  const handleRecordPaymentClick = () => {
    setShowRecordPaymentModal(true);
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
        {/* Responsive Header Section */}
        <div className="mb-4">
          <Card bodyStyle={{ padding: 0 }}>
            <div className="flex flex-col  md:flex-row justify-between items-start md:items-center w-full p-4">
              {/* Left section with back button and title */}
              <div className="flex items-center mb-4 md:mb-0">
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={handleBackToList}
                  className="mr-3"
                >
                  Back to List
                </Button>
                <Title level={4} style={{ margin: 0 }}>
                  Payment Details
                </Title>
              </div>

              {/* Right section with Record Payment button */}
              <div>
                <Button
                  type="primary"
                  icon={<DollarOutlined />}
                  onClick={handleRecordPaymentClick}
                >
                  Record Payment
                </Button>
              </div>
            </div>
          </Card>
        </div>

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

        {/* Record Payment Modal */}
        {showRecordPaymentModal && (
          <RecordPaymentSection
            payment={payment}
            paymentStatus={paymentStatus}
            user={user}
            refreshData={handleRefreshData}
            visible={showRecordPaymentModal}
            onClose={() => setShowRecordPaymentModal(false)}
          />
        )}
      </div>
    </ConfigProvider>
  );
};

export default ClientPaymentDetails;
