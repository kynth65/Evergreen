import React, { useState, useEffect } from "react";
import {
  Table,
  Row,
  Col,
  Card,
  Button,
  Tag,
  Space,
  Tooltip,
  Popconfirm,
  Skeleton,
  message,
  Input,
  Select,
  Typography,
  Dropdown,
  Menu,
  ConfigProvider,
  Modal,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { useStateContext } from "../../context/ContextProvider"; // Adjust path if needed
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import axiosClient from "../../axios.client"; // Adjust path if needed

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

export default function LandManagement({ role: propRole = "admin" }) {
  const { token, user: contextUser } = useStateContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [lands, setLands] = useState([]);
  const [filteredLands, setFilteredLands] = useState([]);
  const [locations, setLocations] = useState([]);
  const [userRole, setUserRole] = useState(propRole);

  // --- Screen Width State and Breakpoints ---
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const breakpoints = {
    xs: 480,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1600,
  };
  const isMobile = screenWidth < breakpoints.md;

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // --- End Screen Width ---

  // Define green color scheme
  const colors = {
    primary: "#1da57a", // Primary green
    secondary: "#52c41a", // Secondary lighter green (used for 'Available' status) - Antd 'green'
    warning: "#faad14", // Standard warning - Antd 'yellow'/'warning'
    error: "#f5222d", // Standard error - Antd 'red'/'error'
    lightBg: "#f6ffed",
    textLinkHover: "#1a8c60",
    textSecondary: "#8c8c8c",
  };

  const isExactPath = location.pathname === `/${userRole}/land-management`;

  useEffect(() => {
    if (propRole) {
      setUserRole(propRole);
    } else if (contextUser && contextUser.role) {
      setUserRole(contextUser.role);
    } else {
      setUserRole("admin");
    }
  }, [propRole, contextUser]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    if (isExactPath && userRole) {
      fetchLandData();
    }
  }, [isExactPath, userRole]);

  useEffect(() => {
    let result = [...lands];
    if (filterLocation !== "all") {
      result = result.filter((land) => land.location === filterLocation);
    }
    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      result = result.filter(
        (land) =>
          land.name?.toLowerCase().includes(lowerSearchText) ||
          land.location?.toLowerCase().includes(lowerSearchText)
      );
    }
    setFilteredLands(result);
    setPagination((prev) => ({ ...prev, total: result.length, current: 1 }));
  }, [lands, filterLocation, searchText]);

  const fetchLandData = async () => {
    setLoading(true);
    setError(null);
    try {
      const landsResponse = await axiosClient.get("/lands");
      const landsData = landsResponse.data?.data || landsResponse.data || [];
      const locationsList = [
        ...new Set(landsData.map((land) => land.location).filter(Boolean)),
      ];
      setLands(landsData);
      setLocations(locationsList);
    } catch (err) {
      console.error("Error fetching land data:", err);
      setError("Failed to load land data");
      message.error(
        "Failed to load lands: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteLand = (id) => {
    Modal.confirm({
      title: "Delete this property?",
      content: "This action cannot be undone.",
      okText: "Yes, delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await axiosClient.delete(`/lands/${id}`);
          message.success("Land property deleted successfully");
          fetchLandData();
        } catch (err) {
          console.error("Error deleting land:", err);
          message.error(
            "Failed to delete land property: " +
              (err.response?.data?.message || err.message)
          );
        }
      },
    });
  };

  const resetFilters = () => {
    setFilterLocation("all");
    setSearchText("");
  };

  // --- Responsive Columns Function ---
  const getResponsiveColumns = () => {
    const baseColumns = [
      {
        title: "#",
        key: "index",
        width: 60,
        render: (text, record, index) =>
          (pagination.current - 1) * pagination.pageSize + index + 1,
      },
      {
        title: "Property Name",
        dataIndex: "name",
        key: "name",
        render: (text, record) => (
          <Tooltip title="Click to view details">
            <a
              onClick={() =>
                navigate(`/${userRole}/land-management/${record.id}`)
              }
              style={{ color: colors.primary, fontWeight: 500 }}
              className="hover:!text-[#1a8c60]" // Optional: Tailwind hover class
            >
              {text || "Unnamed Property"}
            </a>
          </Tooltip>
        ),
      },
    ];

    const desktopColumns = [
      {
        title: "Location",
        dataIndex: "location",
        key: "location",
        responsive: ["md"],
      },
      {
        title: "Size (sqm)",
        dataIndex: "size",
        key: "size",
        responsive: ["md"],
        render: (size) => (size ? size.toLocaleString() : "-"),
      },
      {
        title: "Price per sqm",
        dataIndex: "price_per_sqm",
        key: "price_per_sqm",
        responsive: ["lg"],
        render: (price) =>
          price
            ? `₱${Number(price).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : "-",
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        responsive: ["lg"],
        render: (status) => {
          let color = "default";
          const lowerStatus = status?.toLowerCase() || "unknown";
          switch (lowerStatus) {
            case "available":
              // Use the secondary green color, matching Antd's 'green' tag color
              color = colors.secondary;
              break;
            case "pending":
              color = colors.warning;
              break;
            case "sold":
              color = colors.error;
              break;
          }
          // Use Antd's built-in color names for consistency if preferred
          // e.g., color = "green" for available
          return (
            <Tag
              color={
                lowerStatus === "available"
                  ? "green"
                  : lowerStatus === "pending"
                  ? "warning"
                  : lowerStatus === "sold"
                  ? "error"
                  : "default"
              }
            >
              {status?.toUpperCase() || "N/A"}
            </Tag>
          );
        },
      },
    ];

    const actionsColumn = {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: isMobile ? 60 : 100,
      align: "center",
      render: (_, record) => {
        const actionItems = [
          {
            key: "view",
            label: "View Details",
            icon: <EyeOutlined />,
            onClick: () =>
              navigate(`/${userRole}/land-management/${record.id}`),
          },
          {
            key: "edit",
            label: "Edit Property",
            icon: <EditOutlined />,
            onClick: () =>
              navigate(`/${userRole}/land-management/${record.id}/edit`),
          },
          {
            key: "delete",
            danger: true,
            label: "Delete Property",
            icon: <DeleteOutlined />,
            onClick: () => deleteLand(record.id),
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
          // Desktop: Use type="text" buttons with specific icon colors
          return (
            <Space size="small">
              <Tooltip title="View Details">
                <Button
                  type="text" // Changed from link to text
                  icon={<EyeOutlined style={{}} />} // Apply color directly to icon
                  onClick={() =>
                    navigate(`/${userRole}/land-management/${record.id}`)
                  }
                  size="small"
                  // No explicit style needed for button text color with type="text"
                />
              </Tooltip>
              <Tooltip title="Edit Property">
                <Button
                  type="text" // Changed from link to text
                  icon={<EditOutlined style={{}} />} // Apply color directly to icon
                  onClick={() =>
                    navigate(`/${userRole}/land-management/${record.id}/edit`)
                  }
                  size="small"
                />
              </Tooltip>
              <Popconfirm
                title="Delete this property?"
                description="This action cannot be undone."
                onConfirm={() => deleteLand(record.id)}
                okText="Yes, delete"
                cancelText="No"
                okButtonProps={{ danger: true }}
              >
                <Tooltip title="Delete Property">
                  <Button
                    danger // Use danger prop for styling
                    type="text" // Changed from link to text
                    icon={<DeleteOutlined />} // Icon inherits danger color
                    size="small"
                  />
                </Tooltip>
              </Popconfirm>
            </Space>
          );
        }
      },
    };

    return [...baseColumns, ...desktopColumns, actionsColumn];
  };
  // --- End Responsive Columns ---

  // Custom skeleton row reflecting responsive columns
  const SkeletonRow = () => (
    <tr className="ant-table-row">
      <td>
        <Skeleton.Input active size="small" style={{ width: "80%" }} />
      </td>
      <td>
        <Skeleton.Input active size="small" style={{ width: "90%" }} />
      </td>
      {!isMobile && (
        <>
          <td>
            <Skeleton.Input active size="small" style={{ width: "80%" }} />
          </td>
          <td>
            <Skeleton.Input active size="small" style={{ width: "70%" }} />
          </td>
        </>
      )}
      {screenWidth >= breakpoints.lg && (
        <>
          <td>
            <Skeleton.Input active size="small" style={{ width: "70%" }} />
          </td>
          <td>
            <Skeleton.Input active size="small" style={{ width: "60%" }} />
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

  if (!isExactPath) {
    return <Outlet context={{ refreshLandData: fetchLandData, userRole }} />;
  }

  return (
    <ConfigProvider theme={{ token: { colorPrimary: colors.primary } }}>
      <div className="land-management">
        {/* Header Section */}
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
            Land Management
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate(`/${userRole}/land-management/new`)}
            style={{ width: isMobile ? "100%" : "auto" }}
          >
            Add Property
          </Button>
        </div>

        <Card bodyStyle={{ padding: isMobile ? "12px" : "24px" }}>
          {/* Filters Section */}
          <div style={{ marginBottom: 20 }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={24} md={10} lg={8}>
                <Search
                  placeholder="Search property name or location..."
                  allowClear
                  enterButton={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </Col>
              <Col xs={12} sm={12} md={6} lg={5}>
                <Select
                  placeholder="Filter by Location"
                  style={{ width: "100%" }}
                  value={filterLocation}
                  onChange={setFilterLocation}
                  allowClear
                  onClear={() => setFilterLocation("all")}
                >
                  <Option value="all">All Locations</Option>
                  {locations.map((location) => (
                    <Option key={location} value={location}>
                      {location}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={12} sm={12} md={4} lg={3}>
                <Button onClick={resetFilters} style={{ width: "100%" }}>
                  Reset
                </Button>
              </Col>
            </Row>
          </div>

          {/* Table Section */}
          <div
            className="responsive-table-container"
            style={{ overflowX: "auto" }}
          >
            <Table
              columns={getResponsiveColumns()}
              dataSource={filteredLands}
              rowKey="id"
              loading={false}
              pagination={{
                ...pagination,
                pageSizeOptions: ["10", "20", "50", "100"],
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} properties`,
                size: isMobile ? "small" : "default",
                onChange: (page, pageSize) => {
                  setPagination((prev) => ({
                    ...prev,
                    current: page,
                    pageSize: pageSize,
                  }));
                },
              }}
              scroll={{ x: "max-content" }}
              size={isMobile ? "small" : "middle"}
              components={{
                body: {
                  wrapper: (props) => {
                    if (loading) {
                      return (
                        <tbody {...props}>
                          {Array(pagination.pageSize)
                            .fill(null)
                            .map((_, index) => (
                              <SkeletonRow key={index} />
                            ))}
                        </tbody>
                      );
                    }
                    if (!loading && filteredLands.length === 0) {
                      return (
                        <tbody {...props}>
                          <tr>
                            <td
                              colSpan={getResponsiveColumns().length}
                              style={{ textAlign: "center", padding: "40px" }}
                            >
                              <Text type="secondary">
                                No land properties found.
                              </Text>
                              {(searchText || filterLocation !== "all") && (
                                <div style={{ marginTop: "10px" }}>
                                  <Button onClick={resetFilters} size="small">
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
                <MoreOutlined style={{ verticalAlign: "middle" }} /> for
                actions.
              </Text>
            </div>
          )}
        </Card>
      </div>
    </ConfigProvider>
  );
}
