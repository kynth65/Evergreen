import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  List,
  Tag,
  Button,
  Typography,
  Spin,
  Alert,
  Space,
  Input,
  Select,
  Modal,
  notification,
  Skeleton,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EnvironmentOutlined,
  AreaChartOutlined,
  DollarOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useStateContext } from "../../context/ContextProvider";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import axiosClient from "../../axios.client";

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;

// Loading placeholder for land property item
const LandPropertySkeleton = () => (
  <List.Item>
    <Skeleton active avatar paragraph={{ rows: 3 }} />
  </List.Item>
);

export default function AdminLandManagement() {
  const { token } = useStateContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [refreshData, setRefreshData] = useState(false);

  // Check if we're on the exact land-management path (not a child route)
  const isExactPath = location.pathname === "/admin/land-management";

  // Define green color scheme (matching your dashboard)
  const colors = {
    primary: "#1da57a", // Primary green
    secondary: "#52c41a", // Secondary lighter green
    warning: "#faad14",
    success: "#52c41a",
    error: "#f5222d",
    lightBg: "#f6ffed", // Light green background
  };

  // Data for land properties
  const [landData, setLandData] = useState({
    lands: [],
    locations: [],
  });

  useEffect(() => {
    if (isExactPath) {
      fetchLandData();
    }
  }, [refreshData, isExactPath]);

  const fetchLandData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get lands data
      const landsResponse = await axiosClient.get("/lands", {
        params: {
          per_page: 100, // Get a large number to extract locations
        },
      });

      // Process data
      const lands = landsResponse.data.data;

      // Extract unique locations for filter
      const locations = [
        ...new Set(lands.map((land) => land.location).filter(Boolean)),
      ];

      setLandData({
        lands: lands,
        locations: locations,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching land data:", error);
      setError("Failed to load land data. Please try again later.");
      setLoading(false);
    }
  };

  const handleDeleteLand = (id) => {
    confirm({
      title: "Are you sure you want to delete this property?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        try {
          await axiosClient.delete(`/lands/${id}`);
          notification.success({
            message: "Success",
            description: "Property has been deleted successfully.",
          });
          setRefreshData(!refreshData); // Trigger reload
        } catch (error) {
          notification.error({
            message: "Error",
            description: "Failed to delete property. Please try again.",
          });
        }
      },
    });
  };

  const renderStatusTag = (status) => {
    let color = "default";
    let text = status.toUpperCase();

    switch (status) {
      case "available":
        color = "success";
        break;
      case "sold":
        color = "default";
        break;
      case "pending":
        color = "processing";
        break;
      default:
        break;
    }

    return <Tag color={color}>{text}</Tag>;
  };

  const filteredLands = landData.lands.filter((land) => {
    const matchesSearch =
      land.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (land.location &&
        land.location.toLowerCase().includes(searchText.toLowerCase()));
    const matchesLocation =
      filterLocation === "all" || land.location === filterLocation;

    return matchesSearch && matchesLocation;
  });

  if (!isExactPath) {
    // If we're on a child route, just render the outlet
    return <Outlet />;
  }

  // Render the UI regardless of loading state
  return (
    <div className="admin-land-management">
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>Land Management</Title>
        <Paragraph>
          Manage land properties, monitor land availability, and track property
          values.
        </Paragraph>
      </div>

      {/* Filters and Search */}
      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Title level={5}>Filter Properties</Title>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              style={{ width: "100%" }}
              placeholder="Filter by location"
              onChange={(value) => setFilterLocation(value)}
              defaultValue="all"
              disabled={loading}
            >
              <Option value="all">All Locations</Option>
              {landData.locations.map((location) => (
                <Option key={location} value={location}>
                  {location}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={12}>
            <Search
              placeholder="Search by property name or location"
              onSearch={(value) => setSearchText(value)}
              onChange={(e) => setSearchText(e.target.value)}
              enterButton
              disabled={loading}
            />
          </Col>
        </Row>
      </Card>

      {/* Land Properties List */}
      <Card
        title={<Title level={4}>Land Properties</Title>}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            }}
            onClick={() => navigate("new")}
          >
            Add New Property
          </Button>
        }
      >
        {error ? (
          <Alert
            message="Error"
            description={error}
            type="error"
            style={{ margin: "10px 0" }}
            action={
              <Button type="primary" onClick={fetchLandData}>
                Retry
              </Button>
            }
          />
        ) : (
          <List
            itemLayout="vertical"
            dataSource={loading ? Array(5).fill({}) : filteredLands}
            pagination={{
              pageSize: 5,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} properties`,
            }}
            locale={{ emptyText: "No properties found" }}
            renderItem={(land, index) => {
              // Render skeleton placeholders during loading
              if (loading) {
                return <LandPropertySkeleton key={index} />;
              }

              // Render actual land items when loaded
              return (
                <List.Item
                  key={land.id}
                  actions={[
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => navigate(`${land.id}`)}
                    >
                      View
                    </Button>,
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => navigate(`${land.id}/edit`)}
                    >
                      Edit
                    </Button>,
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteLand(land.id)}
                    >
                      Delete
                    </Button>,
                  ]}
                  extra={
                    <div style={{ textAlign: "right", minWidth: "120px" }}>
                      {renderStatusTag(land.status)}
                    </div>
                  }
                >
                  <List.Item.Meta
                    title={
                      <Row align="middle" gutter={8}>
                        <Col>
                          <Text strong style={{ fontSize: "16px" }}>
                            {land.name}
                          </Text>
                        </Col>
                      </Row>
                    }
                    description={
                      <Space direction="vertical" size={4}>
                        <Space>
                          <EnvironmentOutlined
                            style={{ color: colors.primary }}
                          />
                          <Text>
                            {land.location || "No location specified"}
                          </Text>
                        </Space>
                        <Space>
                          <AreaChartOutlined
                            style={{ color: colors.primary }}
                          />
                          <Text>{land.size.toLocaleString()} sqm</Text>
                        </Space>
                      </Space>
                    }
                  />
                  <Row style={{ marginTop: "8px" }}>
                    <Col span={12}>
                      <Text type="secondary">Price per sqm:</Text>
                      <Text
                        strong
                        style={{ marginLeft: "8px", color: colors.primary }}
                      >
                        ${land.price_per_sqm.toLocaleString()}
                      </Text>
                    </Col>
                    <Col span={12} style={{ textAlign: "right" }}>
                      <Text type="secondary">Total price:</Text>
                      <Text strong style={{ marginLeft: "8px" }}>
                        ${(land.size * land.price_per_sqm).toLocaleString()}
                      </Text>
                    </Col>
                  </Row>
                </List.Item>
              );
            }}
          />
        )}
      </Card>

      {/* Outlet for child routes */}
      <Outlet />
    </div>
  );
}
