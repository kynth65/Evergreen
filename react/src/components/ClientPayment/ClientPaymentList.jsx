import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../axios.client";
import { useStateContext } from "../../context/ContextProvider";
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Typography,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Badge,
  Tooltip,
  Modal,
  ConfigProvider,
  message,
  Popconfirm,
  Form,
  Radio,
  InputNumber,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileExcelOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import ClientPaymentAddForm from "./ClientPaymentAddForm";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ClientPaymentList = () => {
  const navigate = useNavigate();
  const { user } = useStateContext();
  const userRole = user?.role;
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateRange, setDateRange] = useState(null);
  const [addFormVisible, setAddFormVisible] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [recordPaymentModalVisible, setRecordPaymentModalVisible] =
    useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [recordPaymentForm] = Form.useForm();

  // Fetch payments data
  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get("/client-payments");
        setPayments(response.data);
      } catch (error) {
        console.error("Error fetching payments:", error);
        message.error("Failed to load payment data");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [refreshKey]);

  // Handle viewing payment details
  const handleViewDetails = (id) => {
    navigate(`/${userRole}/client-payment/${id}/view`);
  };

  const handleViewEdit = (id) => {
    navigate(`/${userRole}/client-payment/${id}/edit`);
  };

  // Handle delete payment
  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/client-payments/${id}`);
      message.success("Payment record deleted successfully");
      setRefreshKey((prev) => prev + 1); // Refresh data
    } catch (error) {
      console.error("Error deleting payment:", error);
      message.error("Failed to delete payment record");
    }
  };

  // Open record payment modal
  const openRecordPaymentModal = (record) => {
    setSelectedPayment(record);
    setRecordPaymentModalVisible(true);

    // Get next payment info from the payment schedule
    const nextPaymentNumber = record.completed_payments + 1;
    const nextPayment = record.paymentSchedules?.find(
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
    if (!selectedPayment) return;

    try {
      await axiosClient.post(
        `/client-payments/${selectedPayment.id}/record-payment`,
        {
          ...values,
          payment_date: values.payment_date.format("YYYY-MM-DD"),
        }
      );

      message.success("Payment recorded successfully");
      setRecordPaymentModalVisible(false);
      setRefreshKey((prev) => prev + 1); // Refresh data
    } catch (error) {
      console.error("Error recording payment:", error);
      message.error("Failed to record payment");
    }
  };

  // Handle add new client payment
  const handleAddClientPayment = () => {
    setAddFormVisible(true);
  };

  // Calculate payment status and color
  const getPaymentStatus = (record) => {
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

  // Handle filter and search
  const filteredPayments = payments
    .filter((payment) => {
      // Status filter
      if (filterStatus !== "all") {
        const paymentStatus = getPaymentStatus(payment).status;
        if (
          filterStatus === "late" &&
          !["LATE", "SUPER LATE"].includes(paymentStatus)
        ) {
          return false;
        } else if (filterStatus !== "late" && paymentStatus !== filterStatus) {
          return false;
        }
      }

      // Date range filter
      if (dateRange && dateRange[0] && dateRange[1]) {
        const startDate = dateRange[0].startOf("day");
        const endDate = dateRange[1].endOf("day");
        const paymentDate = dayjs(payment.start_date);
        if (!paymentDate.isBetween(startDate, endDate, null, "[]")) {
          return false;
        }
      }

      // Search text filter
      if (searchText) {
        const searchLower = searchText.toLowerCase();

        // Check client details
        if (
          payment.client_name?.toLowerCase().includes(searchLower) ||
          payment.email?.toLowerCase().includes(searchLower) ||
          payment.contact_number?.includes(searchText)
        ) {
          return true;
        }

        // Check lot details
        if (payment.lots && payment.lots.length > 0) {
          return payment.lots.some(
            (lot) =>
              lot.property_name?.toLowerCase().includes(searchLower) ||
              lot.block_lot_no?.toLowerCase().includes(searchLower)
          );
        }

        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Sort by status (late payments first)
      const statusA = getPaymentStatus(a).status;
      const statusB = getPaymentStatus(b).status;

      const priorityOrder = {
        "SUPER LATE": 1,
        LATE: 2,
        CURRENT: 3,
        PENDING: 4,
        COMPLETED: 5,
        PAID: 5,
      };

      return priorityOrder[statusA] - priorityOrder[statusB];
    });

  // Table columns
  const columns = [
    {
      title: "Client",
      dataIndex: "client_name",
      key: "client_name",
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <div>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {record.contact_number}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Property",
      dataIndex: "property_details",
      key: "property_details",
      render: (_, record) => (
        <div>
          {record.lots && record.lots.length > 0 ? (
            <>
              <Text strong>
                {record.lots.map((lot) => lot.property_name).join(", ")}
              </Text>
              <div>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {record.lots.map((lot) => lot.block_lot_no).join(", ")}
                </Text>
              </div>
              {record.lots.length > 1 && (
                <Tag color="blue">{record.lots.length} Lots</Tag>
              )}
            </>
          ) : (
            <Text type="secondary">No property data</Text>
          )}
        </div>
      ),
    },
    {
      title: "Payment Type",
      dataIndex: "payment_type",
      key: "payment_type",
      render: (text) => (
        <Tag color={text === "spot_cash" ? "green" : "blue"}>
          {text === "spot_cash" ? "Spot Cash" : "Installment"}
        </Tag>
      ),
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (text, record) => {
        // Use total_amount from the record if available, otherwise calculate from lots
        const totalAmount =
          text || record.lots
            ? record.lots.reduce((sum, lot) => {
                // Use pivot.custom_price if available, otherwise use lot.total_contract_price
                const price =
                  lot.pivot?.custom_price || lot.total_contract_price || 0;
                return sum + parseInt(price);
              }, 0)
            : 0;

        return (
          <Text strong>₱{new Intl.NumberFormat().format(totalAmount)}</Text>
        );
      },
    },
    {
      title: "Progress",
      key: "progress",
      render: (_, record) => {
        if (record.payment_type === "spot_cash") {
          return <Tag color="success">PAID</Tag>;
        }

        const totalPayments = record.installment_years * 12;
        const completed = record.completed_payments || 0;
        const percentage = Math.round((completed / totalPayments) * 100);

        return (
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <div>
              <Text>
                {completed}/{totalPayments} ({percentage}%)
              </Text>
            </div>
            <div
              style={{
                width: "100%",
                height: "8px",
                backgroundColor: "#f0f0f0",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${percentage}%`,
                  height: "100%",
                  backgroundColor:
                    percentage === 100
                      ? "#52c41a"
                      : percentage > 50
                      ? "#1890ff"
                      : "#faad14",
                }}
              />
            </div>
          </Space>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const { status, color } = getPaymentStatus(record);
        return (
          <Space>
            {color === "error" || color === "warning" ? (
              <Badge status={color} />
            ) : null}
            <Tag color={color}>{status}</Tag>
          </Space>
        );
      },
    },
    {
      title: "Next Payment",
      dataIndex: "next_payment_date",
      key: "next_payment_date",
      render: (date, record) => {
        if (record.payment_type === "spot_cash" || !date) {
          return <Text type="secondary">N/A</Text>;
        }

        const nextDate = dayjs(date);
        const today = dayjs();
        const daysDiff = nextDate.diff(today, "day");

        if (daysDiff < 0) {
          // Late
          return (
            <Tooltip title={`${Math.abs(daysDiff)} days overdue`}>
              <Text type="danger">
                <ClockCircleOutlined /> {nextDate.format("MMM D, YYYY")}
                <div>
                  <Text type="danger" style={{ fontSize: "12px" }}>
                    {Math.abs(daysDiff)} days overdue
                  </Text>
                </div>
              </Text>
            </Tooltip>
          );
        } else if (daysDiff <= 7) {
          // Due soon
          return (
            <Tooltip title={`Due in ${daysDiff} days`}>
              <Text type="warning">
                <CalendarOutlined /> {nextDate.format("MMM D, YYYY")}
                <div>
                  <Text type="warning" style={{ fontSize: "12px" }}>
                    Due in {daysDiff} days
                  </Text>
                </div>
              </Text>
            </Tooltip>
          );
        }

        return (
          <Text>
            <CalendarOutlined /> {nextDate.format("MMM D, YYYY")}
          </Text>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record.id)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleViewEdit(record.id)}
            />
          </Tooltip>
          <Tooltip title="Record Payment">
            <Button
              type="text"
              icon={<CheckCircleOutlined />}
              disabled={
                record.payment_type === "spot_cash" ||
                getPaymentStatus(record).status === "COMPLETED"
              }
              onClick={() => openRecordPaymentModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this payment record?"
            description="This action cannot be undone."
            okText="Yes, delete it"
            cancelText="Cancel"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger type="text" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1da57a",
        },
      }}
    >
      <Card>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16 }}
        >
          <Col>
            <Title level={3}>Client Payments</Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddClientPayment}
            >
              Add Client Payment
            </Button>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Search by client name, contact, property..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={5}>
            <Select
              style={{ width: "100%" }}
              placeholder="Filter by status"
              value={filterStatus}
              onChange={setFilterStatus}
            >
              <Option value="all">All Statuses</Option>
              <Option value="CURRENT">Current</Option>
              <Option value="late">Late Payments</Option>
              <Option value="COMPLETED">Completed</Option>
              <Option value="PENDING">Pending</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={10} lg={8}>
            <RangePicker
              style={{ width: "100%" }}
              onChange={setDateRange}
              placeholder={["Start Date", "End Date"]}
            />
          </Col>
          <Col xs={24} sm={12} md={4} lg={5}>
            <Button icon={<FileExcelOutlined />} style={{ width: "100%" }}>
              Export
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredPayments}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} payments`,
          }}
          // Summary row removed as requested
        />

        {/* Modal for adding new payment */}
        <Modal
          title="Add New Client Payment"
          open={addFormVisible}
          onCancel={() => setAddFormVisible(false)}
          width="90%"
          style={{ top: 20 }}
          footer={null}
          bodyStyle={{ padding: "0" }}
        >
          <ClientPaymentAddForm
            onSuccess={() => {
              setAddFormVisible(false);
              setRefreshKey((prev) => prev + 1); // Refresh data
            }}
          />
        </Modal>

        {/* Modal for recording a payment */}
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
              <Input.TextArea
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
      </Card>
    </ConfigProvider>
  );
};

export default ClientPaymentList;
