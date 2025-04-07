import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../axios.client";
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
  Timeline,
  Tooltip,
  Badge,
  Tabs,
  ConfigProvider,
  message,
  Empty,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  Input,
  Radio,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CalendarOutlined,
  FileTextOutlined,
  UserOutlined,
  HomeOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
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

  // Fetch payment data
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
            (a, b) => a.payment_number - b.payment_number
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

    // Actually call the function to fetch data
    fetchPaymentDetails();
  }, [id, refreshKey]);

  // Calculate payment status and color
  const getPaymentStatus = (record) => {
    if (!record) return { status: "LOADING", color: "default" };

    if (record.payment_type === "spot_cash") {
      return { status: "PAID", color: "success" };
    }

    const completedPercent = Math.round(
      (record.completed_payments / (record.installment_years * 12)) * 100
    );

    if (completedPercent === 100) {
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
    if (!payment) return;

    setRecordPaymentModalVisible(true);

    // Get next payment info from the payment schedule
    const nextPaymentNumber = payment.completed_payments + 1;
    const nextPayment = payment.paymentSchedules?.find(
      (schedule) => schedule.payment_number === nextPaymentNumber
    );

    if (nextPayment) {
      recordPaymentForm.setFieldsValue({
        amount: nextPayment.amount,
        payment_date: dayjs(),
        payment_method: "CASH",
      });
    }
  };

  // Handle record payment
  const handleRecordPayment = async (values) => {
    if (!payment) return;

    try {
      await axiosClient.post(`/client-payments/${payment.id}/record-payment`, {
        ...values,
        payment_date: values.payment_date.format("YYYY-MM-DD"),
      });

      message.success("Payment recorded successfully");
      setRecordPaymentModalVisible(false);
      setRefreshKey((prev) => prev + 1); // Refresh data
    } catch (error) {
      console.error("Error recording payment:", error);
      message.error("Failed to record payment");
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
      return { percent: 100, completed: 1, total: 1 };
    }

    const totalPayments = payment.installment_years * 12;
    const completed = payment.completed_payments || 0;
    const percent = Math.round((completed / totalPayments) * 100);

    return { percent, completed, total: totalPayments };
  };

  const progress = calculateProgress();

  // Calculate total amounts
  const calculateTotalAmounts = () => {
    if (!payment) return { totalAmount: 0, paidAmount: 0, remainingAmount: 0 };

    const totalAmount = payment.total_amount;

    if (payment.payment_type === "spot_cash") {
      return { totalAmount, paidAmount: totalAmount, remainingAmount: 0 };
    }

    // For installment, calculate based on completed payments
    const totalPayments = payment.installment_years * 12;
    const monthlyPayment = totalAmount / totalPayments;
    const paidAmount = payment.completed_payments * monthlyPayment;
    const remainingAmount = totalAmount - paidAmount;

    return {
      totalAmount,
      paidAmount,
      remainingAmount,
    };
  };

  const { totalAmount, paidAmount, remainingAmount } = calculateTotalAmounts();

  // Transaction columns for the table
  const transactionColumns = [
    {
      title: "Payment #",
      dataIndex: "payment_number",
      key: "payment_number",
    },
    {
      title: "Date",
      dataIndex: "payment_date",
      key: "payment_date",
      render: (text) => dayjs(text).format("MMM D, YYYY"),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text) => <Text>₱{new Intl.NumberFormat().format(text)}</Text>,
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
          // Add default case for when payment_method might be null
          undefined: "default",
        };
        return (
          <Tag color={methodColors[text] || "default"}>{text || "N/A"}</Tag>
        );
      },
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

  // Schedule columns for the table
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
      render: (text) => <Text>₱{new Intl.NumberFormat().format(text)}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text, record) => {
        const today = dayjs();
        const dueDate = dayjs(record.due_date);
        let color = "default";
        let statusText = text;

        if (text === "PAID") {
          color = "success";
        } else if (text === "PENDING") {
          if (today.isAfter(dueDate)) {
            const daysDiff = today.diff(dueDate, "day");
            statusText = daysDiff > 30 ? "SUPER LATE" : "LATE";
            color = daysDiff > 30 ? "error" : "warning";
          }
        }

        return <Tag color={color}>{statusText}</Tag>;
      },
    },
  ];

  if (loading) {
    return (
      <Card loading={true}>
        <div style={{ minHeight: 400 }}></div>
      </Card>
    );
  }

  if (!payment) {
    return (
      <Card>
        <Empty description="Payment not found" />
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Button type="primary" onClick={handleBackToList}>
            Back to List
          </Button>
        </div>
      </Card>
    );
  }

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
                <Tag color={paymentStatus.color}>{paymentStatus.status}</Tag>
              </Space>
            </Col>
            <Col>
              <Space>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => {
                    // Navigate to edit page
                  }}
                >
                  Edit
                </Button>
                {payment.payment_type !== "spot_cash" &&
                  paymentStatus.status !== "COMPLETED" && (
                    <Button
                      type="primary"
                      icon={<DollarOutlined />}
                      onClick={openRecordPaymentModal}
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
                  <UserOutlined />
                  <span>Client Information</span>
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
                  <HomeOutlined />
                  <span>Property Information</span>
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              {payment.lots && payment.lots.length > 0 ? (
                <div>
                  {payment.lots.map((lot, index) => (
                    <div
                      key={index}
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
                          {new Intl.NumberFormat().format(
                            lot.total_contract_price
                          )}
                        </Descriptions.Item>
                        {lot.pivot &&
                          lot.pivot.custom_price &&
                          lot.pivot.custom_price !==
                            lot.total_contract_price && (
                            <Descriptions.Item label="Custom Price">
                              <Text type="success">
                                ₱
                                {new Intl.NumberFormat().format(
                                  lot.pivot.custom_price
                                )}
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
                <Empty description="No property information" />
              )}
            </Card>
          </Col>

          {/* Right column: Payment info and details */}
          <Col xs={24} lg={16}>
            {/* Payment Summary Card */}
            <Card
              title={
                <Space>
                  <DollarOutlined />
                  <span>Payment Summary</span>
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
                      `₱${new Intl.NumberFormat().format(value)}`
                    }
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Paid Amount"
                    value={paidAmount}
                    precision={2}
                    valueStyle={{ color: "#3f8600" }}
                    formatter={(value) =>
                      `₱${new Intl.NumberFormat().format(value)}`
                    }
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Remaining Amount"
                    value={remainingAmount}
                    precision={2}
                    valueStyle={{
                      color: remainingAmount > 0 ? "#cf1322" : "#3f8600",
                    }}
                    formatter={(value) =>
                      `₱${new Intl.NumberFormat().format(value)}`
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
                          {dayjs(payment.start_date).format("MMMM D, YYYY")}
                        </Descriptions.Item>
                        {payment.payment_type !== "spot_cash" && (
                          <>
                            <Descriptions.Item label="Installment Period">
                              {payment.installment_years}{" "}
                              {payment.installment_years > 1 ? "years" : "year"}{" "}
                              ({payment.installment_years * 12} months)
                            </Descriptions.Item>
                            <Descriptions.Item label="Monthly Payment">
                              ₱
                              {new Intl.NumberFormat().format(
                                (
                                  totalAmount /
                                  (payment.installment_years * 12)
                                ).toFixed(2)
                              )}
                            </Descriptions.Item>
                          </>
                        )}
                      </Descriptions>
                    </Col>
                    <Col xs={24} md={12}>
                      {payment.payment_type !== "spot_cash" && (
                        <>
                          <div style={{ marginBottom: 8 }}>
                            <Text strong>Payment Progress</Text>
                          </div>
                          <Progress
                            percent={progress.percent}
                            status={
                              progress.percent === 100 ? "success" : "active"
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
                              {progress.completed} of {progress.total} payments
                              completed ({progress.percent}%)
                            </Text>
                          </div>

                          {payment.next_payment_date &&
                            paymentStatus.status !== "COMPLETED" && (
                              <div style={{ marginTop: 16 }}>
                                <Text strong>Next Payment:</Text>{" "}
                                <Text
                                  type={
                                    paymentStatus.status === "LATE" ||
                                    paymentStatus.status === "SUPER LATE"
                                      ? "danger"
                                      : undefined
                                  }
                                >
                                  {dayjs(payment.next_payment_date).format(
                                    "MMMM D, YYYY"
                                  )}
                                  {(paymentStatus.status === "LATE" ||
                                    paymentStatus.status === "SUPER LATE") && (
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

            {/* Tabs for Payment Schedule and Transactions */}
            <Card>
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    borderBottom: "1px solid #f0f0f0",
                    padding: "12px 0",
                  }}
                >
                  <FileTextOutlined />
                  <span style={{ marginLeft: 8, fontWeight: "bold" }}>
                    Transaction History
                  </span>
                </div>
                <div style={{ padding: "16px 0" }}>
                  {payment.paymentTransactions &&
                  payment.paymentTransactions.length > 0 ? (
                    <Table
                      columns={transactionColumns}
                      dataSource={payment.paymentTransactions}
                      rowKey={(record) => record.id || record.payment_number}
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                      }}
                      size="small"
                    />
                  ) : (
                    <Empty description="No transactions found" />
                  )}
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Additional notes */}
        {payment.payment_notes && (
          <Card
            title={
              <Space>
                <FileTextOutlined />
                <span>Payment Notes</span>
              </Space>
            }
            style={{ marginTop: 16 }}
          >
            <Paragraph>{payment.payment_notes}</Paragraph>
          </Card>
        )}

        {/* Record Payment Modal */}
        <Modal
          title="Record Payment"
          open={recordPaymentModalVisible}
          onCancel={() => setRecordPaymentModalVisible(false)}
          footer={null}
        >
          <Form
            form={recordPaymentForm}
            layout="vertical"
            onFinish={handleRecordPayment}
          >
            <Form.Item
              name="amount"
              label="Payment Amount"
              rules={[
                { required: true, message: "Please enter payment amount" },
              ]}
            >
              <InputNumber
                prefix="₱"
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/₱\s?|(,*)/g, "")}
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

            <Form.Item name="reference_number" label="Reference Number">
              <Input placeholder="Optional reference number for the transaction" />
            </Form.Item>

            <Form.Item name="payment_notes" label="Payment Notes">
              <TextArea
                rows={3}
                placeholder="Optional notes about this payment"
              />
            </Form.Item>

            <div style={{ textAlign: "right" }}>
              <Button
                onClick={() => setRecordPaymentModalVisible(false)}
                style={{ marginRight: 8 }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<DollarOutlined />}
              >
                Record Payment
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default ClientPaymentDetails;
