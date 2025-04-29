import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  Modal,
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
  EnvironmentOutlined,
} from "@ant-design/icons";

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const AvailableLand = () => {
  const { user } = useStateContext();
  const [lands, setLands] = useState([]);
  const [filteredLands, setFilteredLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locations, setLocations] = useState([]);
  const [locationFilter, setLocationFilter] = useState("");
  const [priceSort, setPriceSort] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const navigate = useNavigate();
  const location = useLocation();

  // Using exact same color scheme as LotList
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

  // Fetch lands data
  useEffect(() => {
    fetchLands();
    fetchLocations();
  }, []);

  // Effect to handle filtering and sorting
  useEffect(() => {
    if (lands.length > 0) {
      let result = [...lands];

      // Apply location filter
      if (locationFilter) {
        result = result.filter((land) => land.location === locationFilter);
      }

      // Apply search filter
      if (searchText) {
        const lowerSearchText = searchText.toLowerCase();
        result = result.filter(
          (land) =>
            land.name?.toLowerCase().includes(lowerSearchText) ||
            land.location?.toLowerCase().includes(lowerSearchText) ||
            String(land.size).includes(lowerSearchText) ||
            String(land.price_per_sqm).includes(lowerSearchText)
        );
      }

      // Apply price sorting
      if (priceSort === "asc") {
        result.sort((a, b) => {
          const priceA = a.price_per_sqm * a.size || 0;
          const priceB = b.price_per_sqm * b.size || 0;
          return priceA - priceB;
        });
      } else if (priceSort === "desc") {
        result.sort((a, b) => {
          const priceA = a.price_per_sqm * a.size || 0;
          const priceB = b.price_per_sqm * b.size || 0;
          return priceB - priceA;
        });
      }

      setFilteredLands(result);
      setPagination((prev) => ({
        ...prev,
        total: result.length,
      }));
    }
  }, [lands, locationFilter, priceSort, searchText]);

  const fetchLocations = async () => {
    try {
      const response = await axiosClient.get("/lands/stats");
      if (
        response.data &&
        response.data.data &&
        response.data.data.locationCounts
      ) {
        setLocations(Object.keys(response.data.data.locationCounts));
      }
    } catch (err) {
      console.error("Error fetching locations:", err);
    }
  };

  const fetchLands = () => {
    setLoading(true);
    axiosClient
      .get("/lands", {
        params: {
          status: "available", // Only fetch available lands
          per_page: 100, // Get a large number to handle client-side pagination
        },
      })
      .then((response) => {
        const availableLands = response.data.data || [];
        setLands(availableLands);
        setFilteredLands(availableLands);
        setPagination((prev) => ({
          ...prev,
          total: availableLands.length,
        }));
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load available lands");
        setLoading(false);
        console.error("Error fetching lands:", err);
        message.error(
          "Failed to load available lands: " +
            (err.response?.data?.message || err.message)
        );
      });
  };

  // Format price
  const formatPrice = (price, size) => {
    const totalPrice = price * size;
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(totalPrice);
  };

  // Reset all filters
  const resetFilters = () => {
    setLocationFilter("");
    setPriceSort(null);
    setSearchText("");
  };

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
        title: "Land Name",
        dataIndex: "name",
        key: "name",
        render: (text, record) => (
          <Tooltip title="Click to view details">
            <a onClick={() => navigate(`/lands/${record.id}`)}>{text}</a>
          </Tooltip>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status) => {
          return <Tag color="success">AVAILABLE</Tag>;
        },
      },
    ];

    // Desktop-only columns
    const desktopColumns = [
      {
        title: "Location",
        dataIndex: "location",
        key: "location",
        responsive: ["md"],
        render: (location) => (
          <Tooltip title={location}>
            <span>
              <EnvironmentOutlined style={{ marginRight: 4 }} />
              {location && location.length > 25
                ? `${location.substring(0, 25)}...`
                : location}
            </span>
          </Tooltip>
        ),
      },
      {
        title: "Land Size (sqm)",
        dataIndex: "size",
        key: "size",
        responsive: ["md"],
        render: (size) => (size ? size.toLocaleString() : "-"),
      },
      {
        title: "Price/sqm",
        dataIndex: "price_per_sqm",
        key: "price_per_sqm",
        responsive: ["lg"],
        render: (price) =>
          price
            ? new Intl.NumberFormat("en-PH", {
                style: "currency",
                currency: "PHP",
                maximumFractionDigits: 0,
              }).format(price)
            : "-",
      },
      {
        title: "Total Price",
        key: "total_price",
        responsive: ["lg"],
        render: (_, record) => formatPrice(record.price_per_sqm, record.size),
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
              onClick: () => navigate(`/lands/${record.id}`),
            },
          ];

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

        // For desktop: render action buttons
        return (
          <Space size="small">
            <Button
              type="primary"
              icon={<FileOutlined />}
              size="small"
              onClick={() => navigate(`/lands/${record.id}`)}
            >
              View
            </Button>
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
            <Skeleton.Input active size="small" style={{ width: 120 }} />
          </td>
          <td>
            <Skeleton.Input active size="small" style={{ width: 80 }} />
          </td>
        </>
      )}
      {screenWidth >= breakpoints.lg && (
        <>
          <td>
            <Skeleton.Input active size="small" style={{ width: 100 }} />
          </td>
          <td>
            <Skeleton.Input active size="small" style={{ width: 120 }} />
          </td>
        </>
      )}
      <td>
        <Space>
          {isMobile ? (
            <Skeleton.Button active size="small" shape="circle" />
          ) : (
            <Skeleton.Button active size="small" shape="square" />
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
            Available Land Properties
          </Title>
          <Button
            type="primary"
            icon={<FileOutlined />}
            style={{
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            }}
            onClick={() => navigate("/lands")}
          >
            View All Lands
          </Button>
        </div>

        <Card bodyStyle={{ padding: isMobile ? "12px" : "24px" }}>
          {/* Filters and Search Section - Responsive */}
          <div style={{ marginBottom: 20 }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={24} md={12} lg={8}>
                <Search
                  placeholder="Search land, location..."
                  allowClear
                  enterButton={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={(value) => setSearchText(value)}
                />
              </Col>

              <Col xs={12} sm={8} md={6} lg={4}>
                <Select
                  placeholder="Filter by Location"
                  style={{ width: "100%" }}
                  value={locationFilter}
                  onChange={setLocationFilter}
                  allowClear
                >
                  {locations.map((location) => (
                    <Option key={location} value={location}>
                      {location}
                    </Option>
                  ))}
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
              dataSource={filteredLands}
              rowKey="id"
              loading={false}
              scroll={{ x: "max-content" }}
              size={isMobile ? "small" : "middle"}
              pagination={{
                position: ["bottomRight"],
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50", "100"],
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} properties`,
                size: isMobile ? "small" : "default",
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                onChange: (page, pageSize) => {
                  setPagination({
                    ...pagination,
                    current: page,
                    pageSize: pageSize,
                    total: filteredLands.length,
                  });
                },
                onShowSizeChange: (current, size) => {
                  setPagination({
                    ...pagination,
                    current: 1, // Reset to first page when changing page size
                    pageSize: size,
                    total: filteredLands.length,
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
              locale={{
                emptyText: error ? (
                  <div style={{ padding: "24px 0" }}>
                    <Text type="danger">{error}</Text>
                  </div>
                ) : (
                  <div style={{ padding: "24px 0" }}>
                    <Text>No available land properties found</Text>
                  </div>
                ),
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

export default AvailableLand;
