// src/components/Lot/LotList.jsx
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
  theme,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  MoreOutlined,
  EyeOutlined,
} from "@ant-design/icons";

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const LotList = ({ role: propRole }) => {
  const { user: contextUser } = useStateContext();
  const [lots, setLots] = useState([]);
  const [filteredLots, setFilteredLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priceSort, setPriceSort] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [userRole, setUserRole] = useState(propRole);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
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
    xs: 480, // Extra small devices
    sm: 576, // Small devices
    md: 768, // Medium devices
    lg: 992, // Large devices
    xl: 1200, // Extra large devices
    xxl: 1600, // Extra extra large devices
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

  // Fetch user data to verify role - happens in parallel with other data loading
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosClient.get("/user");

        // Update user role with data from API
        if (response.data && response.data.role) {
          setUserRole(response.data.role);
        } else if (contextUser && contextUser.role) {
          // Fallback to context if API doesn't return role
          setUserRole(contextUser.role);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        // If API call fails, fallback to the role from props or context
        if (contextUser && contextUser.role) {
          setUserRole(contextUser.role);
        }
      }
    };

    fetchUserData();
  }, [contextUser]);

  // Fetch lots data
  useEffect(() => {
    fetchLots();
  }, []);

  // Effect to handle filtering and sorting
  useEffect(() => {
    if (lots.length > 0) {
      let result = [...lots];

      // Apply status filter
      if (statusFilter !== "ALL") {
        result = result.filter((lot) => lot.status === statusFilter);
      }

      // Apply search filter
      if (searchText) {
        const lowerSearchText = searchText.toLowerCase();
        result = result.filter(
          (lot) =>
            lot.property_name?.toLowerCase().includes(lowerSearchText) ||
            lot.block_lot_no?.toLowerCase().includes(lowerSearchText) ||
            lot.client?.toLowerCase().includes(lowerSearchText) ||
            String(lot.lot_area).includes(lowerSearchText) ||
            String(lot.total_contract_price).includes(lowerSearchText)
        );
      }

      // Apply price sorting
      if (priceSort === "asc") {
        result.sort((a, b) => {
          const priceA = a.total_contract_price || 0;
          const priceB = b.total_contract_price || 0;
          return priceA - priceB;
        });
      } else if (priceSort === "desc") {
        result.sort((a, b) => {
          const priceA = a.total_contract_price || 0;
          const priceB = b.total_contract_price || 0;
          return priceB - priceA;
        });
      }

      setFilteredLots(result);
    }
  }, [lots, statusFilter, priceSort, searchText]);

  const fetchLots = () => {
    setLoading(true);
    axiosClient
      .get("/lots")
      .then((response) => {
        setLots(response.data);
        setFilteredLots(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load lots data");
        setLoading(false);
        console.error("Error fetching lots:", err);
        message.error(
          "Failed to load lots: " + (err.response?.data?.message || err.message)
        );
      });
  };

  const deleteLot = (id) => {
    axiosClient
      .delete(`/lots/${id}`)
      .then(() => {
        message.success("Lot deleted successfully");
        fetchLots();
      })
      .catch((err) => {
        console.error("Error deleting lot:", err);
        message.error("Failed to delete lot");
      });
  };

  // Determine if we should show the main list view based on the current URL pathname
  const basePath = `/${userRole}/lot-management`;
  const showMainList = location.pathname === basePath;

  // Reset all filters
  const resetFilters = () => {
    setStatusFilter("ALL");
    setPriceSort(null);
    setSearchText("");
  };

  // Check if the user is an intern
  const isIntern = userRole === "intern";

  // Check if we're on a mobile device
  const isMobile = screenWidth < breakpoints.md;

  // Responsive columns logic
  const getResponsiveColumns = () => {
    // Base columns for all screen sizes
    const baseColumns = [
      {
        title: "#",
        key: "index",
        width: 60,
        render: (text, record, index) => {
          // Calculate the continuous row number based on pagination
          return (pagination.current - 1) * pagination.pageSize + index + 1;
        },
      },
      {
        title: "Property Name",
        dataIndex: "property_name",
        key: "property_name",
        render: (text, record) => (
          <Tooltip title="Click to view details">
            <a
              onClick={() =>
                navigate(`/${userRole}/lot-management/${record.id}/view`)
              }
            >
              {text}
            </a>
          </Tooltip>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status) => {
          let color = "default";
          switch (status) {
            case "AVAILABLE":
              color = "success";
              break;
            case "SOLD":
              color = "error";
              break;
            case "EXCLUDED":
              color = "warning";
              break;
            default:
              break;
          }
          return <Tag color={color}>{status}</Tag>;
        },
      },
    ];

    // Desktop-only columns
    const desktopColumns = [
      {
        title: "Block & Lot No.",
        dataIndex: "block_lot_no",
        key: "block_lot_no",
        responsive: ["md"],
      },
      {
        title: "Lot Area (Sqm)",
        dataIndex: "lot_area",
        key: "lot_area",
        responsive: ["md"],
      },
      {
        title: "Total Contract Price",
        dataIndex: "total_contract_price",
        key: "total_contract_price",
        responsive: ["lg"],
        render: (price) =>
          price ? new Intl.NumberFormat().format(price) : "-",
      },
      {
        title: "Client",
        dataIndex: "client",
        key: "client",
        responsive: ["lg"],
        render: (client) => client || "-",
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
                navigate(`/${userRole}/lot-management/${record.id}/view`),
            },
            {
              key: "edit",
              label: "Edit",
              icon: <EditOutlined />,
              onClick: () =>
                navigate(`/${userRole}/lot-management/${record.id}/edit`),
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
                  content: "Are you sure you want to delete this lot?",
                  okText: "Yes",
                  okType: "danger",
                  cancelText: "No",
                  onOk: () => deleteLot(record.id),
                });
              },
            });
          }

          const menu = <Menu items={actionItems} />;

          return (
            <Dropdown
              overlay={menu}
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
                navigate(`/${userRole}/lot-management/${record.id}/view`)
              }
            >
              View
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() =>
                navigate(`/${userRole}/lot-management/${record.id}/edit`)
              }
            >
              Edit
            </Button>
            {/* Only render delete button if the user is NOT an intern */}
            {!isIntern && (
              <Popconfirm
                title="Are you sure you want to delete this lot?"
                onConfirm={() => deleteLot(record.id)}
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
            <Skeleton.Input active size="small" style={{ width: 80 }} />
          </td>
          <td>
            <Skeleton.Input active size="small" style={{ width: 100 }} />
          </td>
        </>
      )}
      {screenWidth >= breakpoints.lg && (
        <>
          <td>
            <Skeleton.Input active size="small" style={{ width: 100 }} />
          </td>
          <td>
            <Skeleton.Input active size="small" style={{ width: 100 }} />
          </td>
        </>
      )}
      <td>
        <Space>
          {isMobile ? (
            <Skeleton.Button active size="small" shape="circle" />
          ) : (
            <>
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
        className="lot-management"
        style={{ padding: isMobile ? "0px" : "0px" }}
      >
        <div
          className="header-section"
          style={{
            marginBottom: isMobile ? "16px" : "20px",
            display: "flex",
            flexDirection: isMobile ? "row" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "center",
            gap: isMobile ? "12px" : "0",
          }}
        >
          <Title
            level={isMobile ? 4 : 3}
            style={{ margin: 0, fontWeight: 700 }}
          >
            Lot Management
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            }}
            onClick={() => navigate(`/${userRole}/lot-management/new`)}
          >
            Add Lot
          </Button>
        </div>

        {/* Display table of lots if on main list view */}
        {showMainList ? (
          <Card bodyStyle={{ padding: isMobile ? "12px" : "24px" }}>
            {/* Filters and Search Section - Responsive */}
            <div style={{ marginBottom: 20 }}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={24} md={12} lg={8}>
                  <Search
                    placeholder="Search property, lot, client..."
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
                    <Option value="AVAILABLE">Available</Option>
                    <Option value="SOLD">Sold</Option>
                    <Option value="EXCLUDED">Excluded</Option>
                  </Select>
                </Col>

                <Col xs={12} sm={8} md={6} lg={4}>
                  <Select
                    placeholder="Sort by Price"
                    style={{ width: "100%" }}
                    value={priceSort}
                    onChange={setPriceSort}
                  >
                    <Option value={null}>Original Order</Option>
                    <Option value="asc">Price: Low to High</Option>
                    <Option value="desc">Price: High to Low</Option>
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
                dataSource={filteredLots}
                rowKey="id"
                loading={false}
                scroll={{ x: "max-content" }}
                size={isMobile ? "small" : "middle"}
                pagination={{
                  position: ["bottomRight"],
                  showSizeChanger: true,
                  pageSizeOptions: ["10", "20", "50", "100"],
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} lots`,
                  size: isMobile ? "small" : "default",
                  onChange: (page, pageSize) => {
                    setPagination({
                      ...pagination,
                      current: page,
                      pageSize: pageSize,
                      total: filteredLots.length,
                    });
                  },
                  onShowSizeChange: (current, size) => {
                    setPagination({
                      ...pagination,
                      current: 1, // Reset to first page when changing page size
                      pageSize: size,
                      total: filteredLots.length,
                    });
                  },
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
                  Swipe left/right to see more details. Tap the menu icon to
                  view actions.
                </Text>
              </div>
            )}
          </Card>
        ) : (
          // Outlet for child routes (LotForm, LotView)
          <Outlet context={{ refreshLots: fetchLots, userRole }} />
        )}

        {/* Add responsive styles */}
        <style jsx="true">{`
          .lot-management .ant-table-thead > tr > th {
            white-space: nowrap;
          }

          @media (max-width: ${breakpoints.md}px) {
            .lot-management .ant-table {
              font-size: 13px;
            }

            .lot-management .ant-btn-sm {
              font-size: 12px;
              padding: 0 8px;
            }

            .lot-management .ant-table-pagination {
              flex-wrap: wrap;
            }
          }

          @media (max-width: ${breakpoints.sm}px) {
            .lot-management .ant-pagination-options {
              display: none;
            }

            .lot-management .ant-table-pagination-right {
              justify-content: center;
            }
          }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default LotList;
