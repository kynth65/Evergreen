import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../axios.client"; // Assuming this path is correct
import { useStateContext } from "../../context/ContextProvider"; // Assuming this path is correct
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
  Tooltip,
  Modal,
  ConfigProvider,
  message,
  Popconfirm,
  Dropdown, // Added
  Menu, // Added
  Skeleton, // Added for skeleton loading
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CalendarOutlined,
  MoreOutlined, // Added
} from "@ant-design/icons";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

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
  const [filterPaymentType, setFilterPaymentType] = useState("all");
  const [dateRange, setDateRange] = useState(null);
  const [addFormVisible, setAddFormVisible] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // --- Screen Width State and Breakpoints ---
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const breakpoints = {
    xs: 480,
    sm: 576,
    md: 768, // Use this breakpoint for mobile/desktop switch
    lg: 992,
    xl: 1200,
    xxl: 1600,
  };
  const isMobile = screenWidth < breakpoints.md;

  // Update screen width on resize
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // --- End Screen Width ---

  // Fetch payments data
  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get("/client-payments");
        setPayments(response.data);
      } catch (error) {
        console.error("Error fetching client payment agreements:", error);
        message.error("Failed to load agreement data");
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [refreshKey]);

  // Navigation handlers
  const handleViewDetails = (id) => {
    navigate(`/${userRole}/client-payment/${id}/view`);
  };
  const handleViewEdit = (id) => {
    navigate(`/${userRole}/client-payment/${id}/edit`);
  };

  // Delete handler
  const handleDelete = async (id) => {
    // Confirm deletion before proceeding (especially needed for dropdown menu)
    Modal.confirm({
      title: "Delete this agreement?",
      content: "This action cannot be undone.",
      okText: "Yes, delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        setLoading(true);
        try {
          await axiosClient.delete(`/client-payments/${id}`);
          message.success("Payment agreement deleted successfully");
          setRefreshKey((prev) => prev + 1);
        } catch (error) {
          console.error("Error deleting payment agreement:", error);
          const errorMessage =
            error.response?.data?.message || "Failed to delete agreement";
          message.error(errorMessage);
        } finally {
          setLoading(false);
        }
      },
      onCancel() {
        // Optional: console.log('Delete cancelled');
      },
    });
  };

  // Add handler
  const handleAddClientPayment = () => {
    setAddFormVisible(true);
  };

  // Filter logic remains the same
  const filteredPayments = payments
    .filter((payment) => {
      if (
        filterPaymentType !== "all" &&
        payment.payment_type !== filterPaymentType
      )
        return false;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const startDate = dateRange[0].startOf("day");
        const endDate = dateRange[1].endOf("day");

        // Use next_payment_date if available, otherwise fall back to start_date
        const dateToCheck = payment.next_payment_date || payment.start_date;

        if (dateToCheck) {
          const paymentDate = dayjs(dateToCheck);
          if (
            paymentDate.isValid() &&
            !paymentDate.isBetween(startDate, endDate, "day", "[]")
          )
            return false;
        }
      }
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        let match = false;
        if (
          payment.client_name?.toLowerCase().includes(searchLower) ||
          payment.email?.toLowerCase().includes(searchLower) ||
          payment.contact_number?.includes(searchText)
        ) {
          match = true;
        }
        if (!match && payment.lots && payment.lots.length > 0) {
          match = payment.lots.some(
            (lot) =>
              lot.property_name?.toLowerCase().includes(searchLower) ||
              lot.block_lot_no?.toLowerCase().includes(searchLower)
          );
        }
        if (!match) return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Keep sorting logic as is
      const nameA = a.client_name || "";
      const nameB = b.client_name || "";
      if (nameA.localeCompare(nameB) !== 0) {
        return nameA.localeCompare(nameB);
      }
      const dateA = dayjs(a.start_date);
      const dateB = dayjs(b.start_date);
      if (dateA.isValid() && dateB.isValid()) return dateB.diff(dateA);
      if (dateA.isValid()) return -1;
      if (dateB.isValid()) return 1;
      return 0;
    });

  // --- Responsive Columns Function ---
  const getResponsiveColumns = () => {
    // Columns always visible
    const baseColumns = [
      {
        title: "Client",
        dataIndex: "client_name",
        key: "client_name",
        align: "left", // Explicitly align left
        render: (text, record) => (
          // Link to view details page
          <a
            onClick={() => handleViewDetails(record.id)}
            className="font-semibold hover:text-primary-theme"
          >
            {text || "N/A"}
            {record.contact_number && (
              <div className="text-xs text-gray-500 font-normal">
                {record.contact_number}
              </div>
            )}
          </a>
        ),
        // Removed sorter and sortDirections
      },
      {
        title: "Payment Type",
        dataIndex: "payment_type",
        key: "payment_type",
        width: 130, // Fixed width can help layout
        render: (text) => (
          <Tag color={text === "spot_cash" ? "green" : "cyan"}>
            {text === "spot_cash" ? "Spot Cash" : "Installment"}
          </Tag>
        ),
        // Removed filters and onFilter properties
      },
    ];

    // Columns hidden on smaller screens (below 'md' breakpoint)
    const desktopColumns = [
      {
        title: "Property / Lot(s)",
        key: "property_details",
        responsive: ["md"], // Hide below medium breakpoint
        render: (_, record) => (
          <div>
            {record.lots && record.lots.length > 0 ? (
              <>
                <Text strong>
                  {record.lots
                    .map((lot) => lot.property_name || "N/A")
                    .join(", ")}
                </Text>
                <div className="text-xs text-gray-500">
                  Lots:{" "}
                  {record.lots
                    .map((lot) => lot.block_lot_no || "N/A")
                    .join(", ")}
                </div>
                {record.lots.length > 1 && (
                  <Tag color="blue" className="mt-1">
                    {record.lots.length} Lots
                  </Tag>
                )}
              </>
            ) : (
              <Text type="secondary">No property data</Text>
            )}
          </div>
        ),
      },
      {
        title: "Total Contract Price",
        dataIndex: "total_amount",
        key: "total_amount",
        align: "right",
        responsive: ["lg"], // Hide below large breakpoint
        render: (text, record) => {
          let totalAmount = Number(text);
          if (isNaN(totalAmount) || totalAmount <= 0) {
            if (record.lots && record.lots.length > 0) {
              totalAmount = record.lots.reduce((sum, lot) => {
                const price = parseFloat(
                  lot.pivot?.custom_price || lot.total_contract_price || 0
                );
                return sum + (isNaN(price) ? 0 : price);
              }, 0);
            } else {
              totalAmount = 0;
            }
          }
          return (
            <Text strong>
              ₱
              {new Intl.NumberFormat("en-PH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(totalAmount)}
            </Text>
          );
        },
        sorter: (a, b) => {
          const amountA =
            Number(a.total_amount) ||
            a.lots?.reduce(
              (s, l) =>
                s +
                parseFloat(
                  l.pivot?.custom_price || l.total_contract_price || 0
                ),
              0
            ) ||
            0;
          const amountB =
            Number(b.total_amount) ||
            b.lots?.reduce(
              (s, l) =>
                s +
                parseFloat(
                  l.pivot?.custom_price || l.total_contract_price || 0
                ),
              0
            ) ||
            0;
          return amountA - amountB;
        },
        sortDirections: ["ascend", "descend"],
      },
      {
        title: "Due Date", // Changed from "Start Date" to "Due Date"
        dataIndex: "next_payment_date", // Changed from "start_date" to "next_payment_date"
        key: "due_date", // Changed key name to match new purpose
        responsive: ["lg"], // Keep the same responsive behavior
        render: (date, record) => {
          // For spot cash payments or completed payments, show N/A
          if (
            record.payment_type === "spot_cash" ||
            record.payment_status === "COMPLETED"
          ) {
            return <Text type="secondary">N/A</Text>;
          }

          // If we have a next payment date
          if (date) {
            const dueDate = dayjs(date);
            const isOverdue = dayjs().isAfter(dueDate);

            // Show different styling for overdue payments
            return (
              <div>
                <Text
                  type={isOverdue ? "danger" : undefined}
                  strong={isOverdue}
                >
                  {dueDate.format("MMM D, YYYY")}
                </Text>
                {isOverdue && (
                  <div>
                    <Tag color="error" style={{ marginTop: 4 }}>
                      Overdue
                    </Tag>
                  </div>
                )}
              </div>
            );
          }

          return <Text type="secondary">N/A</Text>;
        },
        sorter: (a, b) => {
          // Updated sorter to work with next_payment_date
          const dateA = a.next_payment_date ? dayjs(a.next_payment_date) : null;
          const dateB = b.next_payment_date ? dayjs(b.next_payment_date) : null;

          // Handle cases when one or both dates are null
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1; // Null dates go last
          if (!dateB) return -1;

          return dateA.diff(dateB);
        },
        sortDirections: ["ascend", "descend"],
      },
    ];

    // Actions column: Dropdown on mobile, Buttons on desktop
    const actionsColumn = {
      title: "Actions",
      key: "actions",
      fixed: "right", // Fix actions column to the right
      width: isMobile ? 60 : 100, // Smaller width for mobile dropdown trigger
      align: "center",
      render: (_, record) => {
        const actionItems = [
          {
            key: "view",
            label: "View Details",
            icon: <EyeOutlined />,
            onClick: () => handleViewDetails(record.id),
          },
          {
            key: "edit",
            label: "Edit Agreement",
            icon: <EditOutlined />,
            onClick: () => handleViewEdit(record.id),
          },
          {
            key: "delete",
            danger: true,
            label: "Delete Agreement",
            icon: <DeleteOutlined />,
            onClick: () => handleDelete(record.id), // Use modified handleDelete with Modal.confirm
          },
        ];

        if (isMobile) {
          const menu = <Menu items={actionItems} />;
          return (
            <Dropdown
              overlay={menu}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button type="text" icon={<MoreOutlined />} size="small" />
            </Dropdown>
          );
        } else {
          // Desktop: Use individual buttons within Space
          return (
            <Space size="small">
              <Tooltip title="View Details">
                <Button
                  type="text"
                  icon={<EyeOutlined className="text-blue-600" />}
                  onClick={() => handleViewDetails(record.id)}
                  size="small"
                />
              </Tooltip>
              <Tooltip title="Edit Agreement">
                <Button
                  type="text"
                  icon={<EditOutlined className="text-yellow-600" />}
                  onClick={() => handleViewEdit(record.id)}
                  size="small"
                />
              </Tooltip>
              {/* Use Popconfirm for delete on desktop for immediate feedback */}
              <Popconfirm
                title="Delete this agreement?"
                description="This action cannot be undone."
                onConfirm={() => handleDelete(record.id)} // Still calls the same handler
                okText="Yes, delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Tooltip title="Delete Agreement">
                  <Button
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    size="small"
                  />
                </Tooltip>
              </Popconfirm>
            </Space>
          );
        }
      },
    };

    // Combine columns
    return [...baseColumns, ...desktopColumns, actionsColumn];
  };
  // --- End Responsive Columns ---

  // Add global CSS for table alignment
  React.useEffect(() => {
    // Add a style tag to ensure all table content is left-aligned
    const styleElement = document.createElement("style");
    styleElement.innerHTML = `
      .left-aligned-table .ant-table-thead > tr > th,
      .left-aligned-table .ant-table-tbody > tr > td,
      .left-aligned-table .ant-table-column-title {
        text-align: left !important;
      }
      .left-aligned-table .ant-table-cell-fix-right {
        text-align: left !important;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Custom skeleton row reflecting responsive columns
  const SkeletonRow = () => (
    <tr className="ant-table-row">
      <td>
        <Skeleton.Input active size="small" style={{ width: "90%" }} />
        <div className="text-xs text-gray-500 mt-1">
          <Skeleton.Input active size="small" style={{ width: "60%" }} />
        </div>
      </td>
      <td>
        <Skeleton.Button active size="small" style={{ width: 80 }} />
      </td>
      {screenWidth >= breakpoints.md && (
        <td>
          <Skeleton.Input active size="small" style={{ width: "90%" }} />
          <div className="text-xs text-gray-500 mt-1">
            <Skeleton.Input active size="small" style={{ width: "70%" }} />
          </div>
        </td>
      )}
      {screenWidth >= breakpoints.lg && (
        <>
          <td>
            <Skeleton.Input active size="small" style={{ width: "70%" }} />
          </td>
          <td>
            <Skeleton.Input active size="small" style={{ width: "70%" }} />
          </td>
        </>
      )}
      <td>
        <Space>
          {isMobile ? (
            <Skeleton.Button active size="small" shape="circle" />
          ) : (
            <>
              {/* Match skeleton to text buttons */}
              <Skeleton.Button
                active
                size="small"
                shape="circle"
                style={{ width: 24 }}
              />
              <Skeleton.Button
                active
                size="small"
                shape="circle"
                style={{ width: 24 }}
              />
              <Skeleton.Button
                active
                size="small"
                shape="circle"
                style={{ width: 24 }}
              />
            </>
          )}
        </Space>
      </td>
    </tr>
  );

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#1da57a" } }}>
      {/* Header Section - Use conditional styles based on isMobile */}
      <div
        className="header-section"
        style={{
          marginBottom: isMobile ? "16px" : "20px",
          display: "flex",
          flexDirection: isMobile ? "row" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          gap: isMobile ? "12px" : "0", // Add gap for mobile column layout
        }}
      >
        <div>
          <Title
            level={isMobile ? 4 : 3}
            style={{ margin: 0, fontWeight: 700 }}
          >
            Client Payment
          </Title>
        </div>
        <div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddClientPayment}
            // Make button full width on mobile
            style={{ width: isMobile ? "100%" : "auto" }}
          >
            Add Agreement
          </Button>
        </div>
      </div>

      {/* Filter and Table Section */}
      <Card
        className="shadow-sm"
        bodyStyle={{ padding: isMobile ? "12px" : "24px" }}
      >
        {/* Filters Row */}
        <Row gutter={[16, 16]} className="mb-4">
          {/* Adjust Col spans for better layout on different screens */}
          <Col xs={24} sm={24} md={8} lg={7}>
            <Input
              placeholder="Search Client, Property, Lot..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined className="text-gray-400" />}
              allowClear
            />
          </Col>
          <Col xs={12} sm={12} md={5} lg={4}>
            <Select
              style={{ width: "100%" }}
              placeholder="Filter by Type"
              value={filterPaymentType}
              onChange={setFilterPaymentType}
              allowClear
              onClear={() => setFilterPaymentType("all")}
            >
              <Option value="all">All Types</Option>
              <Option value="installment">Installment</Option>
              <Option value="spot_cash">Spot Cash</Option>
            </Select>
          </Col>
          <Col xs={12} sm={12} md={8} lg={6}>
            <RangePicker
              style={{ width: "100%" }}
              onChange={setDateRange}
              placeholder={["Due Date From", "Due Date To"]}
              value={dateRange}
            />
          </Col>
          {/* Optional: Reset Button */}
          {/* <Col xs={24} sm={24} md={3} lg={3}>
                 <Button onClick={() => {setSearchText(''); setFilterPaymentType('all'); setDateRange(null);}} style={{ width: '100%' }}>Reset</Button>
            </Col> */}
        </Row>

        {/* Table - Use responsive columns */}
        <div
          className="responsive-table-container"
          style={{ overflowX: "auto" }}
        >
          <Table
            columns={getResponsiveColumns()}
            dataSource={filteredPayments}
            rowKey="id"
            loading={false} // Set to false since we're using custom skeleton
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} agreements`,
              size: isMobile ? "small" : "default", // Smaller pagination on mobile
            }}
            scroll={{ x: "max-content" }} // Important for horizontal scroll
            size={isMobile ? "small" : "middle"} // Smaller table cells on mobile
            className="ant-table-smooth-scroll left-aligned-table"
            tableLayout="fixed" // Added for better column width control
            style={{ textAlign: "left" }} // Force text alignment for the entire table
            components={{
              body: {
                wrapper: (props) => {
                  if (loading) {
                    return (
                      <tbody {...props}>
                        {Array(10)
                          .fill(null)
                          .map((_, index) => (
                            <SkeletonRow key={index} />
                          ))}
                      </tbody>
                    );
                  }
                  if (!loading && filteredPayments.length === 0) {
                    return (
                      <tbody {...props}>
                        <tr>
                          <td
                            colSpan={getResponsiveColumns().length}
                            style={{ textAlign: "center", padding: "40px" }}
                          >
                            <Text type="secondary">
                              No payment agreements found.
                            </Text>
                            {(searchText ||
                              filterPaymentType !== "all" ||
                              dateRange) && (
                              <div style={{ marginTop: "10px" }}>
                                <Button
                                  onClick={() => {
                                    setSearchText("");
                                    setFilterPaymentType("all");
                                    setDateRange(null);
                                  }}
                                  size="small"
                                >
                                  Clear Filters
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    );
                  }
                  return <tbody {...props} />;
                },
              },
            }}
          />
        </div>
        {/* Mobile hint */}
        {isMobile && (
          <div style={{ marginTop: "12px", textAlign: "center" }}>
            <Text type="secondary" style={{ fontSize: "11px" }}>
              Swipe table left/right if needed. Use{" "}
              <MoreOutlined style={{ verticalAlign: "middle" }} /> for actions.
            </Text>
          </div>
        )}
      </Card>

      {/* Add Modal (remains the same) */}
      <Modal
        title="Add New Client Agreement"
        open={addFormVisible}
        onCancel={() => setAddFormVisible(false)}
        width="90%"
        style={{ top: 20, maxWidth: "1000px" }}
        footer={null}
        destroyOnClose
        bodyStyle={{ padding: "0" }}
      >
        <ClientPaymentAddForm
          onSuccess={() => {
            setAddFormVisible(false);
            message.success("Client Agreement added successfully!");
            setRefreshKey((prev) => prev + 1);
          }}
          onCancel={() => setAddFormVisible(false)}
        />
      </Modal>
    </ConfigProvider>
  );
};

export default ClientPaymentList;
