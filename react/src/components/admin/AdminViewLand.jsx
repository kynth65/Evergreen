import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Descriptions,
  Tag,
  Button,
  Spin,
  Alert,
  Space,
  Row,
  Col,
  Carousel,
  Empty,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  UserOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../axios.client";
import Modal from "antd/lib/modal/Modal";

const { Title, Text, Paragraph } = Typography;

export default function AdminViewLand() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [land, setLand] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // Define green color scheme (matching your dashboard)
  const colors = {
    primary: "#1da57a", // Primary green
    secondary: "#52c41a", // Secondary lighter green
    warning: "#faad14",
    success: "#52c41a",
    error: "#f5222d",
    lightBg: "#f6ffed", // Light green background
  };

  useEffect(() => {
    fetchLandDetails();
  }, [id]);

  const fetchLandDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.get(`/lands/${id}`);
      setLand(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching land details:", error);
      setError("Failed to load land details. Please try again later.");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axiosClient.delete(`/lands/${id}`);
      setDeleteModalVisible(false);
      navigate("/admin/land-management");
    } catch (error) {
      console.error("Error deleting land:", error);
      setError("Failed to delete land property. Please try again.");
    }
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

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <p style={{ marginTop: "20px" }}>Loading property details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        style={{ margin: "30px" }}
        action={
          <Button type="primary" onClick={fetchLandDetails}>
            Retry
          </Button>
        }
      />
    );
  }

  if (!land) {
    return (
      <Alert
        message="Not Found"
        description="The property you are looking for does not exist."
        type="error"
        style={{ margin: "30px" }}
        action={
          <Button
            type="primary"
            onClick={() => navigate("/admin/land-management")}
          >
            Back to Land Management
          </Button>
        }
      />
    );
  }

  return (
    <div className="admin-view-land">
      <Card>
        <div style={{ marginBottom: "24px" }}>
          <Space align="center">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/admin/land-management")}
            >
              Back to Land Management
            </Button>
          </Space>
        </div>

        <Row gutter={[24, 24]}>
          {/* Property Images */}
          <Col xs={24} md={12}>
            <Card title="Property Images">
              {land.images && land.images.length > 0 ? (
                <Carousel autoplay>
                  {land.images.map((image, index) => (
                    <div key={index}>
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL}/storage/${
                          image.image_path
                        }`}
                        alt={`Property ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "300px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  ))}
                </Carousel>
              ) : (
                <Empty description="No images available" />
              )}
            </Card>
          </Col>

          {/* Property Details */}
          <Col xs={24} md={12}>
            <Card title="Property Details">
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Name" className="uppercase font-bold">
                  {land.name}
                </Descriptions.Item>
                <Descriptions.Item label="Property ID">
                  {land.id}
                </Descriptions.Item>
                <Descriptions.Item label="Location">
                  <Space>
                    <EnvironmentOutlined style={{ color: colors.primary }} />
                    {land.location || "No location specified"}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Size" className="font-bold">
                  {land.size.toLocaleString()} sqm
                </Descriptions.Item>
                <Descriptions.Item label="Price per sqm">
                  <Space>
                    <DollarOutlined style={{ color: colors.primary }} />$
                    {land.price_per_sqm.toLocaleString()}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Total Price">
                  <Text strong>
                    ${(land.size * land.price_per_sqm).toLocaleString()}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  {renderStatusTag(land.status)}
                </Descriptions.Item>
                <Descriptions.Item label="Agent">
                  <Space>
                    <UserOutlined />
                    {land.agent ? land.agent.name : "No agent assigned"}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Date Added">
                  {new Date(land.created_at).toLocaleDateString()}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>

        {/* Description */}
        <Card title="Description" style={{ marginTop: "24px" }}>
          <Paragraph>
            {land.description || "No description available."}
          </Paragraph>
        </Card>

        {/* Property Features */}
        {land.features && land.features.length > 0 && (
          <Card title="Property Features" style={{ marginTop: "24px" }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {land.features.map((feature, index) => (
                <div className="flex items-start" key={index}>
                  <CheckOutlined
                    style={{
                      color: colors.success,
                      marginRight: "8px",
                      fontSize: "16px",
                      marginTop: "3px",
                    }}
                  />
                  <Text>{feature}</Text>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Actions */}
        <div style={{ marginTop: "24px", textAlign: "right" }}>
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/land-management/${id}/edit`)}
              style={{
                backgroundColor: colors.primary,
                borderColor: colors.primary,
              }}
            >
              Edit Property
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => setDeleteModalVisible(true)}
            >
              Delete Property
            </Button>
          </Space>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Property"
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onOk={handleDelete}
        okText="Yes, Delete"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
      >
        <p>
          Are you sure you want to delete this property? This action cannot be
          undone.
        </p>
      </Modal>
    </div>
  );
}
