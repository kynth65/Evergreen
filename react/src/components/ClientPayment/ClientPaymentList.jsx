// src/components/ClientPayment/ClientPaymentList.jsx
import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../../axios.client";
import { useStateContext } from "../../context/ContextProvider";
import {
  Table,
  Button,
  Tag,
  Space,
  Tooltip,
  Popconfirm,
  Skeleton,
  message,
  Input,
  Select,
  Row,
  Col,
  Card,
  Typography,
  Dropdown,
  Menu,
  ConfigProvider,
  Progress,
  Modal,
  Alert,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileOutlined,
  SearchOutlined,
  MoreOutlined,
  EyeOutlined,
  DollarOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

// Fallback mock data in case the API fails
const MOCK_CLIENT_PAYMENTS = [
  {
    id: 1,
    client_name: "John Doe",
    payment_status: "IN_PROGRESS",
    lot_details: {
      property_name: "Green Valley Subdivision",
      block_lot_no: "Block 5, Lot 12",
    },
    completed_payments: 12,
    total_payments: 60,
    next_payment_date: "2025-02-15",
  },
  {
    id: 2,
    client_name: "Jane Smith",
    payment_status: "COMPLETED",
    lot_details: {
      property_name: "Sunshine Estates",
      block_lot_no: "Block 2, Lot 7",
    },
    completed_payments: 120,
    total_payments: 120,
    next_payment_date: null,
  },
  {
    id: 3,
    client_name: "Robert Johnson",
    payment_status: "NOT_STARTED",
    lot_details: {
      property_name: "Palm Grove Village",
      block_lot_no: "Block 3, Lot 9",
    },
    completed_payments: 0,
    total_payments: 60,
    next_payment_date: "2025-03-01",
  },
];

const ClientPaymentList = ({ role: propRole }) => {
  const { user: contextUser } = useStateContext();
  const [clientPayments, setClientPayments] = useState([]);
  const [filteredClientPayments, setFilteredClientPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentSort, setPaymentSort] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [userRole, setUserRole] = useState(propRole || "superadmin");
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const colors = {
    primary: "#1da57a", // Primary green
    secondary: "#52c41a", // Secondary lighter green
    warning: "#faad14",
    success: "#52c41a",
    error: "#f5222d",
    lightBg: "#f6ffed", // Light green background
  };

  // Responsive breakpoints
  const breakpoints = {
    xs: 480,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1600,
  };

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Update screen width on window resize
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch user data to verify role
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosClient.get("/user");
        if (response.data && response.data.role) {
          setUserRole(response.data.role);
        } else if (contextUser && contextUser.role) {
          setUserRole(contextUser.role);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        if (contextUser && contextUser.role) {
          setUserRole(contextUser.role);
        }
      }
    };

    fetchUserData();
  }, [contextUser]);

  // Fetch client payments data from API
  useEffect(() => {
    fetchClientPayments();
  }, []);

  // Effect to handle filtering and sorting
  useEffect(() => {
    if (clientPayments.length > 0) {
      let result = [...clientPayments];

      // Apply status filter
      if (statusFilter !== "ALL") {
        result = result.filter(
          (client) => client.payment_status === statusFilter
        );
      }

      // Apply search filter
      if (searchText) {
        const lowerSearchText = searchText.toLowerCase();
        result = result.filter(
          (client) =>
            client.client_name?.toLowerCase().includes(lowerSearchText) ||
            client.lot_details?.property_name
              ?.toLowerCase()
              .includes(lowerSearchText) ||
            client.lot_details?.block_lot_no
              ?.toLowerCase()
              .includes(lowerSearchText)
        );
      }

      // Apply payment progress sorting
      if (paymentSort === "asc") {
        result.sort((a, b) => {
          const progressA = a.completed_payments / a.total_payments || 0;
          const progressB = b.completed_payments / b.total_payments || 0;
          return progressA - progressB;
        });
      } else if (paymentSort === "desc") {
        result.sort((a, b) => {
          const progressA = a.completed_payments / a.total_payments || 0;
          const progressB = b.completed_payments / b.total_payments || 0;
          return progressB - progressA;
        });
      }

      setFilteredClientPayments(result);
      setPagination((prev) => ({
        ...prev,
        total: result.length,
      }));
    }
  }, [clientPayments, statusFilter, paymentSort, searchText]);

  // Fetch client payments from API with error handling
  const fetchClientPayments = () => {
    setLoading(true);
    setError(null);
    setUsingMockData(false);

    axiosClient
      .get("/client-payments")
      .then((response) => {
        console.log("API Response:", response.data);
        setClientPayments(response.data);
        setFilteredClientPayments(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching client payments:", err);
        setError(
          `Failed to load client payments: ${
            err.response?.data?.message || err.message
          }`
        );

        // Fall back to mock data if API fails
        setClientPayments(MOCK_CLIENT_PAYMENTS);
        setFilteredClientPayments(MOCK_CLIENT_PAYMENTS);
        setUsingMockData(true);
        setLoading(false);

        message.error(
          "Failed to load client payments from API. Using mock data for display."
        );
      });
  };

  // Delete client payment
  const deleteClientPayment = (id) => {
    if (usingMockData) {
      // Mock delete for demo purposes
      setClientPayments((prevPayments) =>
        prevPayments.filter((payment) => payment.id !== id)
      );
      message.success("Client payment record deleted successfully (mock)");
      return;
    }

    // Real API call
    axiosClient
      .delete(`/client-payments/${id}`)
      .then(() => {
        message.success("Client payment record deleted successfully");
        fetchClientPayments(); // Refresh data
      })
      .catch((err) => {
        console.error("Error deleting client payment:", err);
        message.error(
          "Failed to delete client payment record: " +
            (err.response?.data?.message || err.message)
        );
      });
  };

  // Process payment
  const processPayment = (clientId, paymentData) => {
    if (usingMockData) {
      // Mock payment processing
      message.success("Payment processed successfully (mock)");

      // Update client's completed payments in mock data
      setClientPayments((prevPayments) =>
        prevPayments.map((payment) => {
          if (payment.id === clientId) {
            const updatedPayment = {
              ...payment,
              completed_payments: payment.completed_payments + 1,
            };

            // Update payment status if needed
            if (
              updatedPayment.completed_payments >= updatedPayment.total_payments
            ) {
              updatedPayment.payment_status = "COMPLETED";
            } else if (updatedPayment.payment_status === "NOT_STARTED") {
              updatedPayment.payment_status = "IN_PROGRESS";
            }

            return updatedPayment;
          }
          return payment;
        })
      );

      setPaymentModalVisible(false);
      return;
    }

    // Real API call
    axiosClient
      .post(`/client-payments/${clientId}/pay`, paymentData)
      .then((response) => {
        message.success("Payment processed successfully");
        setPaymentData(response.data.payment_data);
        fetchClientPayments(); // Refresh data
        setPaymentModalVisible(false);
        setReceiptModalVisible(true);
      })
      .catch((err) => {
        console.error("Error processing payment:", err);
        message.error(
          "Failed to process payment: " +
            (err.response?.data?.message || err.message)
        );
      });
  };

  // Show payment modal
  const showPaymentModal = (client) => {
    setCurrentClient(client);
    setPaymentModalVisible(true);
  };

  // Reset all filters
  const resetFilters = () => {
    setStatusFilter("ALL");
    setPaymentSort(null);
    setSearchText("");
  };

  // Check if the user is an intern
  const isIntern = userRole === "intern";

  // Check if we're on a mobile device
  const isMobile = screenWidth < breakpoints.md;

  // Function to render payment progress
  const renderPaymentProgress = (completed, total) => {
    const percent = Math.round((completed / total) * 100);
    let strokeColor = colors.success;

    if (percent < 30) {
      strokeColor = colors.error;
    } else if (percent < 70) {
      strokeColor = colors.warning;
    }

    return (
      <div>
        <Progress
          percent={percent}
          size="small"
          strokeColor={strokeColor}
          format={() => `${completed}/${total}`}
        />
      </div>
    );
  };

  // Payment status tag renderer
  const renderPaymentStatus = (status) => {
    let color = "default";
    switch (status) {
      case "COMPLETED":
        color = "success";
        break;
      case "IN_PROGRESS":
        color = "processing";
        break;
      case "OVERDUE":
        color = "error";
        break;
      case "NOT_STARTED":
        color = "default";
        break;
      default:
        break;
    }
    return <Tag color={color}>{status.replace(/_/g, " ")}</Tag>;
  };

  // Responsive columns logic
  const getResponsiveColumns = () => {
    // Base columns for all screen sizes
    const baseColumns = [
      {
        title: "#",
        key: "index",
        width: 60,
        render: (text, record, index) => {
          return (pagination.current - 1) * pagination.pageSize + index + 1;
        },
      },
      {
        title: "Client Name",
        dataIndex: "client_name",
        key: "client_name",
        render: (text, record) => (
          <Tooltip title="Click to view details">
            <a
              onClick={() =>
                navigate(`/${userRole}/client-payment/${record.id}/view`)
              }
            >
              {text}
            </a>
          </Tooltip>
        ),
      },
      {
        title: "Payment Status",
        dataIndex: "payment_status",
        key: "payment_status",
        render: (status) => renderPaymentStatus(status),
      },
    ];

    // Desktop-only columns
    const desktopColumns = [
      {
        title: "Property Name",
        dataIndex: ["lot_details", "property_name"],
        key: "property_name",
        responsive: ["md"],
      },
      {
        title: "Block & Lot No.",
        dataIndex: ["lot_details", "block_lot_no"],
        key: "block_lot_no",
        responsive: ["md"],
      },
      {
        title: "Payment Progress",
        key: "payment_progress",
        responsive: ["lg"],
        render: (_, record) =>
          renderPaymentProgress(
            record.completed_payments,
            record.total_payments
          ),
      },
      {
        title: "Next Payment",
        dataIndex: "next_payment_date",
        key: "next_payment_date",
        responsive: ["xl"],
      },
    ];

    // Actions column with dropdown for mobile
    const actionsColumn = {
      title: "Actions",
      key: "actions",
      fixed: isMobile ? "right" : false,
      render: (_, record) => {
        // For mobile: render a dropdown menu with actions
        if (isMobile) {
          const actionItems = [
            {
              key: "view",
              label: "View",
              icon: <EyeOutlined />,
              onClick: () =>
                navigate(`/${userRole}/client-payment/${record.id}/view`),
            },
            {
              key: "edit",
              label: "Edit",
              icon: <EditOutlined />,
              onClick: () =>
                navigate(`/${userRole}/client-payment/${record.id}/edit`),
            },
            {
              key: "pay",
              label: "Pay",
              icon: <DollarOutlined />,
              onClick: () => showPaymentModal(record),
            },
          ];

          // Only add delete option if not an intern
          if (!isIntern) {
            actionItems.push({
              key: "delete",
              danger: true,
              label: "Delete",
              icon: <DeleteOutlined />,
              onClick: () => {
                // Confirm deletion
                Modal.confirm({
                  title: "Delete Confirmation",
                  content:
                    "Are you sure you want to delete this client payment record?",
                  okText: "Yes",
                  okType: "danger",
                  cancelText: "No",
                  onOk: () => deleteClientPayment(record.id),
                });
              },
            });
          }

          return (
            <Dropdown
              menu={{ items: actionItems }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          );
        }

        // For desktop: render all action buttons
        return (
          <Space size="small">
            <Button
              type="primary"
              icon={<FileOutlined />}
              size="small"
              onClick={() =>
                navigate(`/${userRole}/client-payment/${record.id}/view`)
              }
            >
              View
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() =>
                navigate(`/${userRole}/client-payment/${record.id}/edit`)
              }
            >
              Edit
            </Button>
            <Button
              style={{ backgroundColor: "#1890ff", color: "white" }}
              icon={<DollarOutlined />}
              size="small"
              onClick={() => showPaymentModal(record)}
            >
              Pay
            </Button>
            {/* Only render delete button if the user is NOT an intern */}
            {!isIntern && (
              <Popconfirm
                title="Are you sure you want to delete this client payment record?"
                onConfirm={() => deleteClientPayment(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button danger icon={<DeleteOutlined />} size="small">
                  Delete
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    };

    // Combine columns based on screen size
    return [...baseColumns, ...desktopColumns, actionsColumn];
  };

  // Custom skeleton row for loading state
  const SkeletonRow = () => (
    <tr className="ant-table-row">
      <td>
        <Skeleton.Input active size="small" style={{ width: 40 }} />
      </td>
      <td>
        <Skeleton.Input active size="small" style={{ width: 150 }} />
      </td>
      <td>
        <Skeleton.Input active size="small" style={{ width: 80 }} />
      </td>
      {screenWidth >= breakpoints.md && (
        <>
          <td>
            <Skeleton.Input active size="small" style={{ width: 100 }} />
          </td>
          <td>
            <Skeleton.Input active size="small" style={{ width: 80 }} />
          </td>
        </>
      )}
      {screenWidth >= breakpoints.lg && (
        <td>
          <Skeleton.Input active size="small" style={{ width: 120 }} />
        </td>
      )}
      {screenWidth >= breakpoints.xl && (
        <td>
          <Skeleton.Input active size="small" style={{ width: 100 }} />
        </td>
      )}
      <td>
        <Space>
          {isMobile ? (
            <Skeleton.Button active size="small" shape="circle" />
          ) : (
            <>
              <Skeleton.Button active size="small" shape="square" />
              <Skeleton.Button active size="small" shape="square" />
              <Skeleton.Button active size="small" shape="square" />
              {!isIntern && (
                <Skeleton.Button active size="small" shape="square" />
              )}
            </>
          )}
        </Space>
      </td>
    </tr>
  );

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: colors.primary,
        },
      }}
    >
      <div
        className="client-payment-management"
        style={{ padding: isMobile ? "0px" : "0px" }}
      >
        <div
          className="header-section"
          style={{
            marginBottom: isMobile ? "16px" : "20px",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "center",
            gap: isMobile ? "12px" : "0",
          }}
        >
          <Title
            level={isMobile ? 4 : 3}
            style={{ margin: 0, fontWeight: 700 }}
          >
            Client Payment Management
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            }}
            onClick={() => navigate(`/${userRole}/client-payment/new`)}
          >
            Add Client Payment
          </Button>
        </div>

        {/* Alert for mock data */}
        {usingMockData && (
          <Alert
            message="Using Mock Data"
            description={
              <div>
                <p>
                  Could not connect to the API. Using mock data for display.
                  <div>Error: {error}</div>
                </p>
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={fetchClientPayments}
                  size="small"
                >
                  Retry API Connection
                </Button>
              </div>
            }
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Card with table */}
        <Card bodyStyle={{ padding: isMobile ? "12px" : "24px" }}>
          {/* Filters and Search Section - Responsive */}
          <div style={{ marginBottom: 20 }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={24} md={12} lg={8}>
                <Search
                  placeholder="Search client, property, lot..."
                  allowClear
                  enterButton={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={(value) => setSearchText(value)}
                />
              </Col>

              <Col xs={12} sm={8} md={6} lg={4}>
                <Select
                  placeholder="Filter by Status"
                  style={{ width: "100%" }}
                  value={statusFilter}
                  onChange={setStatusFilter}
                >
                  <Option value="ALL">All Status</Option>
                  <Option value="COMPLETED">Completed</Option>
                  <Option value="IN_PROGRESS">In Progress</Option>
                  <Option value="OVERDUE">Overdue</Option>
                  <Option value="NOT_STARTED">Not Started</Option>
                </Select>
              </Col>

              <Col xs={12} sm={8} md={6} lg={4}>
                <Select
                  placeholder="Sort by Progress"
                  style={{ width: "100%" }}
                  value={paymentSort}
                  onChange={setPaymentSort}
                >
                  <Option value={null}>Original Order</Option>
                  <Option value="asc">Progress: Low to High</Option>
                  <Option value="desc">Progress: High to Low</Option>
                </Select>
              </Col>

              <Col xs={24} sm={8} md={6} lg={4}>
                <Button
                  onClick={resetFilters}
                  style={{ width: isMobile ? "100%" : "auto" }}
                >
                  Reset Filters
                </Button>
              </Col>
            </Row>
          </div>

          <div
            className="responsive-table-container"
            style={{ overflowX: "auto" }}
          >
            <Table
              columns={getResponsiveColumns()}
              dataSource={filteredClientPayments}
              rowKey="id"
              loading={loading}
              scroll={{ x: "max-content" }}
              size={isMobile ? "small" : "middle"}
              pagination={{
                position: ["bottomRight"],
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50", "100"],
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} client payment records`,
                size: isMobile ? "small" : "default",
                onChange: (page, pageSize) => {
                  setPagination({
                    ...pagination,
                    current: page,
                    pageSize: pageSize,
                  });
                },
                onShowSizeChange: (current, size) => {
                  setPagination({
                    ...pagination,
                    current: 1, // Reset to first page when changing page size
                    pageSize: size,
                  });
                },
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: filteredClientPayments.length,
              }}
              components={{
                body: {
                  wrapper: (props) => {
                    // Add skeleton rows if loading
                    if (loading) {
                      return (
                        <tbody {...props}>
                          {Array(5)
                            .fill(null)
                            .map((_, index) => (
                              <SkeletonRow key={index} />
                            ))}
                        </tbody>
                      );
                    }
                    return <tbody {...props} />;
                  },
                },
              }}
            />
          </div>

          {/* Mobile information note */}
          {isMobile && (
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Swipe left/right to see more details. Tap the menu icon to view
                actions.
              </Text>
            </div>
          )}
        </Card>

        {/* Payment Modal */}
        {paymentModalVisible && currentClient && (
          <Modal
            title={`Process Payment - ${currentClient.client_name}`}
            open={paymentModalVisible}
            onCancel={() => setPaymentModalVisible(false)}
            footer={null}
            width={600}
          >
            <Form
              layout="vertical"
              onFinish={(values) => processPayment(currentClient.id, values)}
              initialValues={{
                amount: Math.round(
                  (currentClient.total_contract_price || 0) /
                    currentClient.total_payments
                ),
                payment_date: null,
                payment_method: "cash",
                payment_for: `Monthly Payment ${
                  currentClient.completed_payments + 1
                }/${currentClient.total_payments}`,
                remarks: "",
              }}
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item
                    name="payment_for"
                    label="Payment For"
                    rules={[
                      {
                        required: true,
                        message: "Please enter payment description",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="payment_date"
                    label="Payment Date"
                    rules={[
                      { required: true, message: "Please select payment date" },
                    ]}
                  >
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="amount"
                    label="Amount"
                    rules={[{ required: true, message: "Please enter amount" }]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      formatter={(value) =>
                        `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/₱\s?|(,*)/g, "")}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="payment_method"
                    label="Payment Method"
                    rules={[
                      {
                        required: true,
                        message: "Please select payment method",
                      },
                    ]}
                  >
                    <Radio.Group>
                      <Radio.Button value="cash">Cash</Radio.Button>
                      <Radio.Button value="check">Check</Radio.Button>
                      <Radio.Button value="bank">Bank Transfer</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="remarks" label="Remarks">
                    <Input.TextArea rows={3} />
                  </Form.Item>
                </Col>
              </Row>
              <Divider />
              <div style={{ textAlign: "right" }}>
                <Button
                  onClick={() => setPaymentModalVisible(false)}
                  style={{ marginRight: 8 }}
                >
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  Process Payment & Generate AR
                </Button>
              </div>
            </Form>
          </Modal>
        )}

        {/* Receipt Modal */}
        {receiptModalVisible && paymentData && (
          <Modal
            title="Accounts Receivable (AR) Receipt"
            open={receiptModalVisible}
            onCancel={() => setReceiptModalVisible(false)}
            footer={[
              <Button key="close" onClick={() => setReceiptModalVisible(false)}>
                Close
              </Button>,
              <Button
                key="download"
                type="primary"
                icon={<FileOutlined />}
                onClick={() =>
                  message.info("Download functionality will be implemented")
                }
              >
                Download PDF
              </Button>,
              <Button
                key="print"
                type="primary"
                icon={<DollarOutlined />}
                onClick={() =>
                  message.info("Print functionality will be implemented")
                }
              >
                Print Receipt
              </Button>,
            ]}
            width={800}
          >
            <div
              className="ar-receipt"
              style={{ padding: "20px", border: "1px solid #f0f0f0" }}
            >
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <Title level={3}>EVERGREEN DEVELOPMENT CORPORATION</Title>
                <div>123 Real Estate Avenue, Metro Manila, Philippines</div>
                <div>Tel: (02) 8123-4567 | Email: payments@evergreen.com</div>
                <Title level={4} style={{ marginTop: "20px" }}>
                  ACCOUNTS RECEIVABLE RECEIPT
                </Title>
              </div>

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div>
                    <strong>Receipt No:</strong> {paymentData.receipt_number}
                  </div>
                  <div>
                    <strong>Date:</strong> {paymentData.payment_date}
                  </div>
                  <div>
                    <strong>Time:</strong> {paymentData.payment_time}
                  </div>
                </Col>
                <Col span={12} style={{ textAlign: "right" }}>
                  <div>
                    <strong>Payment Status:</strong>{" "}
                    <Tag color="success">PAID</Tag>
                  </div>
                  <div>
                    <strong>Payment Method:</strong>{" "}
                    {paymentData.payment_method.toUpperCase()}
                  </div>
                </Col>
              </Row>

              <Divider />

              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div>
                    <strong>Client Name:</strong>{" "}
                    {paymentData.client.client_name}
                  </div>
                  <div>
                    <strong>Property:</strong>{" "}
                    {paymentData.client.lot_details.property_name}
                  </div>
                  <div>
                    <strong>Block & Lot No:</strong>{" "}
                    {paymentData.client.lot_details.block_lot_no}
                  </div>
                </Col>
              </Row>

              <Divider />

              <Table
                dataSource={[
                  {
                    key: "1",
                    description: paymentData.payment_for,
                    amount: paymentData.amount,
                  },
                ]}
                columns={[
                  {
                    title: "Description",
                    dataIndex: "description",
                    key: "description",
                  },
                  {
                    title: "Amount",
                    dataIndex: "amount",
                    key: "amount",
                    render: (amount) =>
                      `₱ ${amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}`,
                  },
                ]}
                pagination={false}
                summary={() => (
                  <Table.Summary>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>
                        <strong>Total Amount Paid</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <strong>
                          ₱{" "}
                          {paymentData.amount.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />

              <div style={{ marginTop: "30px" }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <div
                      style={{
                        borderTop: "1px solid #000",
                        marginTop: "40px",
                        paddingTop: "8px",
                      }}
                    >
                      Client Signature
                    </div>
                  </Col>
                  <Col span={12}>
                    <div
                      style={{
                        borderTop: "1px solid #000",
                        marginTop: "40px",
                        paddingTop: "8px",
                      }}
                    >
                      Authorized Signature
                    </div>
                  </Col>
                </Row>
              </div>

              <div style={{ marginTop: "40px", textAlign: "center" }}>
                <div>
                  <strong>
                    Payment {paymentData.new_payment_number} of{" "}
                    {paymentData.client.total_payments}
                  </strong>
                </div>
                <Progress
                  percent={Math.round(
                    (paymentData.new_payment_number /
                      paymentData.client.total_payments) *
                      100
                  )}
                  size="small"
                  style={{ maxWidth: "300px", margin: "0 auto" }}
                />
                <div style={{ marginTop: "20px", color: "#389e0d" }}>
                  Thank you for your payment!
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* Add responsive styles */}
        <style jsx="true">{`
          .client-payment-management .ant-table-thead > tr > th {
            white-space: nowrap;
          }

          @media (max-width: ${breakpoints.md}px) {
            .client-payment-management .ant-table {
              font-size: 13px;
            }

            .client-payment-management .ant-btn-sm {
              font-size: 12px;
              padding: 0 8px;
            }

            .client-payment-management .ant-table-pagination {
              flex-wrap: wrap;
            }
          }

          @media (max-width: ${breakpoints.sm}px) {
            .client-payment-management .ant-pagination-options {
              display: none;
            }

            .client-payment-management .ant-table-pagination-right {
              justify-content: center;
            }
          }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default ClientPaymentList;
