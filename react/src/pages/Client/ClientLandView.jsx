import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../axios.client";
import {
  Card,
  Button,
  Descriptions,
  Tag,
  Space,
  Skeleton,
  Typography,
  Divider,
  message,
} from "antd";
import { ArrowLeftOutlined, EnvironmentOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const ClientLandView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [land, setLand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const colors = {
    primary: "#1da57a", // Primary green
    secondary: "#52c41a", // Secondary lighter green
    warning: "#faad14",
    success: "#52c41a",
    error: "#f5222d",
    lightBg: "#f6ffed", // Light green background
  };

  useEffect(() => {
    setLoading(true);
    axiosClient
      .get(`/lands/${id}`)
      .then((response) => {
        setLand(response.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching land details:", err);
        setError("Failed to load land data");
        message.error(
          "Failed to load land data: " +
            (err.response?.data?.message || err.message)
        );
        setLoading(false);
      });
  }, [id]);

  // Format price
  const formatPrice = (price, size) => {
    const totalPrice = price * size;
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(totalPrice);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  if (loading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div style={{ color: colors.error }}>{error}</div>
      </Card>
    );
  }

  if (!land) {
    return (
      <Card>
        <div style={{ color: colors.warning }}>Land not found</div>
      </Card>
    );
  }

  return (
    <div className="land-view" style={{ maxWidth: 800, margin: "0 auto" }}>
      <Card
        title={<Title level={4}>Land Property Details</Title>}
        extra={
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/client/available-land")}
            style={{
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            }}
          >
            Back to List
          </Button>
        }
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div>
            <Title level={4} style={{ color: colors.primary, margin: 0 }}>
              {land.name}
            </Title>
            <Text
              style={{ fontSize: 16, display: "flex", alignItems: "center" }}
            >
              <EnvironmentOutlined style={{ marginRight: 8 }} />
              {land.location}
            </Text>
            <div style={{ marginTop: 8 }}>
              <Tag color="success">AVAILABLE</Tag>
            </div>
          </div>
          {land.price_per_sqm && land.size && (
            <div style={{ textAlign: "right" }}>
              <Text type="secondary">Total Price</Text>
              <div>
                <Text strong style={{ fontSize: 20 }}>
                  {formatPrice(land.price_per_sqm, land.size)}
                </Text>
              </div>
            </div>
          )}
        </div>

        <Divider />

        <Descriptions title="Property Information" bordered column={1}>
          <Descriptions.Item label="Property Name">
            {land.name}
          </Descriptions.Item>
          <Descriptions.Item label="Location">
            {land.location}
          </Descriptions.Item>
          <Descriptions.Item label="Land Area">
            {land.size ? land.size.toLocaleString() : "-"} sqm
          </Descriptions.Item>
          <Descriptions.Item label="Price per sqm">
            {land.price_per_sqm
              ? new Intl.NumberFormat("en-PH", {
                  style: "currency",
                  currency: "PHP",
                  maximumFractionDigits: 0,
                }).format(land.price_per_sqm)
              : "Not specified"}
          </Descriptions.Item>
          <Descriptions.Item label="Total Price">
            {formatPrice(land.price_per_sqm, land.size)}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color="success">AVAILABLE</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Date Listed">
            {formatDate(land.created_at)}
          </Descriptions.Item>
          {land.description && (
            <Descriptions.Item label="Description">
              {land.description}
            </Descriptions.Item>
          )}
        </Descriptions>

        {land.features && land.features.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <Title level={5}>Features</Title>
            <ul style={{ paddingLeft: 20 }}>
              {land.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        )}

        {land.agent && (
          <div style={{ marginTop: 24 }}>
            <Divider />
            <Title level={5}>Agent Information</Title>
            <Descriptions>
              <Descriptions.Item label="Agent Name">
                {land.agent.name}
              </Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 16 }}>
              <Button
                type="primary"
                style={{
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                }}
              >
                Contact Agent
              </Button>
              <Button style={{ marginLeft: 8 }}>Schedule Viewing</Button>
            </div>
          </div>
        )}

        <div style={{ marginTop: 24 }}>
          <Space>
            <Button
              type="primary"
              onClick={() => navigate("/client/available-land")}
              style={{
                backgroundColor: colors.primary,
                borderColor: colors.primary,
              }}
            >
              Back to Available Lands
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default ClientLandView;
