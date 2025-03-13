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
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileOutlined,
} from "@ant-design/icons";
import { useStateContext } from "../../context/ContextProvider";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import axiosClient from "../../axios.client";

const { Search } = Input;
const { Option } = Select;

export default function LandManagement({ role = "admin" }) {
  const { token } = useStateContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [lands, setLands] = useState([]);
  const [filteredLands, setFilteredLands] = useState([]);
  const [locations, setLocations] = useState([]);

  // Define green color scheme
  const colors = {
    primary: "#1da57a", // Primary green
    secondary: "#52c41a", // Secondary lighter green
    warning: "#faad14",
    success: "#52c41a",
    error: "#f5222d",
    lightBg: "#f6ffed", // Light green background
  };

  // Check if we're on the exact land-management path (not a child route)
  const isExactPath = location.pathname === `/${role}/land-management`;

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    if (isExactPath) {
      fetchLandData();
    }
  }, [isExactPath, role]);

  // Effect to handle filtering
  useEffect(() => {
    if (lands.length > 0) {
      let result = [...lands];

      // Apply location filter
      if (filterLocation !== "all") {
        result = result.filter((land) => land.location === filterLocation);
      }

      // Apply search filter
      if (searchText) {
        const lowerSearchText = searchText.toLowerCase();
        result = result.filter(
          (land) =>
            land.name.toLowerCase().includes(lowerSearchText) ||
            (land.location &&
              land.location.toLowerCase().includes(lowerSearchText))
        );
      }

      setFilteredLands(result);
    }
  }, [lands, filterLocation, searchText]);

  const fetchLandData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get lands data
      const landsResponse = await axiosClient.get("/lands", {
        params: {
          per_page: 100,
          role: role,
        },
      });

      // Process data
      const landsData = landsResponse.data.data || [];

      // Extract unique locations for filter
      const locationsList = [
        ...new Set(landsData.map((land) => land.location).filter(Boolean)),
      ];

      setLands(landsData);
      setFilteredLands(landsData);
      setLocations(locationsList);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching land data:", err);
      setError("Failed to load land data");
      setLoading(false);
      message.error(
        "Failed to load lands: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const deleteLand = (id) => {
    axiosClient
      .delete(`/lands/${id}`)
      .then(() => {
        message.success("Land property deleted successfully");
        fetchLandData();
      })
      .catch((err) => {
        console.error("Error deleting land:", err);
        message.error("Failed to delete land property");
      });
  };

  // Reset all filters
  const resetFilters = () => {
    setFilterLocation("all");
    setSearchText("");
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
        <Skeleton.Input active size="small" style={{ width: 120 }} />
      </td>
      <td>
        <Skeleton.Input active size="small" style={{ width: 80 }} />
      </td>
      <td>
        <Skeleton.Input active size="small" style={{ width: 100 }} />
      </td>
      <td>
        <Skeleton.Input active size="small" style={{ width: 80 }} />
      </td>
      <td>
        <Space>
          <Skeleton.Button active size="small" shape="square" />
          <Skeleton.Button active size="small" shape="square" />
          <Skeleton.Button active size="small" shape="square" />
        </Space>
      </td>
    </tr>
  );

  const columns = [
    {
      title: "#",
      key: "index",
      width: 60,
      render: (text, record, index) => {
        return (pagination.current - 1) * pagination.pageSize + index + 1;
      },
    },
    {
      title: "Property Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Tooltip title="Click to view details">
          <a onClick={() => navigate(`/${role}/land-management/${record.id}`)}>
            {text}
          </a>
        </Tooltip>
      ),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Size (sqm)",
      dataIndex: "size",
      key: "size",
      render: (size) => size.toLocaleString(),
    },
    {
      title: "Price per sqm",
      dataIndex: "price_per_sqm",
      key: "price_per_sqm",
      render: (price) => `$${price.toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        switch (status.toLowerCase()) {
          case "available":
            color = "success";
            break;
          case "pending":
            color = "processing";
            break;
          case "sold":
            color = "default";
            break;
          default:
            break;
        }
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<FileOutlined />}
            size="small"
            onClick={() => navigate(`/${role}/land-management/${record.id}`)}
          >
            View
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() =>
              navigate(`/${role}/land-management/${record.id}/edit`)
            }
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this property?"
            onConfirm={() => deleteLand(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!isExactPath) {
    // If we're on a child route, just render the outlet
    return <Outlet />;
  }

  return (
    <div className="land-management">
      <div
        className="header-section"
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 className="text-2xl">Land Management</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{
            backgroundColor: colors.primary,
            borderColor: colors.primary,
          }}
          onClick={() => navigate(`/${role}/land-management/new`)}
        >
          Add Property
        </Button>
      </div>

      {/* Display table of lands if on main list view */}
      <Card>
        {/* Filters and Search Section */}
        <div style={{ marginBottom: 20 }}>
          <Row gutter={16} align="middle">
            <Col xs={24} sm={24} md={8} lg={8}>
              <Search
                placeholder="Search property name or location..."
                allowClear
                enterButton={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onSearch={(value) => setSearchText(value)}
              />
            </Col>
            <Col xs={12} sm={8} md={5} lg={4}>
              <Select
                placeholder="Filter by Location"
                style={{ width: "100%" }}
                value={filterLocation}
                onChange={setFilterLocation}
              >
                <Option value="all">All Locations</Option>
                {locations.map((location) => (
                  <Option key={location} value={location}>
                    {location}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={8} md={6} lg={4}>
              <Button onClick={resetFilters}>Reset Filters</Button>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={filteredLands}
          rowKey="id"
          loading={false} // We're handling our own loading state with skeletons
          pagination={{
            position: ["bottomRight"],
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} properties`,
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
        />
      </Card>

      {/* Outlet for child routes */}
      <Outlet />
    </div>
  );
}
