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
  Image,
  Row,
  Col,
} from "antd";
import { ArrowLeftOutlined, EnvironmentOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const LandView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [land, setLand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

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
        <Skeleton active paragraph={{ rows: 10 }} />
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
    <div
      className="land-view"
      style={{ maxWidth: 1000, margin: "0 auto", padding: "20px" }}
    >
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16, padding: 0 }}
      >
        Back to Available Lands
      </Button>

      <Card>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            {land.images && land.images.length > 0 ? (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <Image
                    src={`${import.meta.env.VITE_API_BASE_URL}/storage/${
                      land.images[activeImage].image_path
                    }`}
                    alt={land.name}
                    style={{
                      width: "100%",
                      height: "auto",
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                </div>

                {land.images.length > 1 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {land.images.map((image, index) => (
                      <div
                        key={image.id}
                        onClick={() => setActiveImage(index)}
                        style={{
                          cursor: "pointer",
                          border:
                            activeImage === index
                              ? `2px solid ${colors.primary}`
                              : "2px solid transparent",
                          borderRadius: 4,
                          width: 80,
                          height: 60,
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={`${import.meta.env.VITE_API_BASE_URL}/storage/${
                            image.image_path
                          }`}
                          alt={`${land.name} ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  height: 300,
                  backgroundColor: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                }}
              >
                <Text type="secondary">No images available</Text>
              </div>
            )}
          </Col>

          <Col xs={24} md={12}>
            <div>
              <Title level={3} style={{ color: colors.primary, margin: 0 }}>
                {land.name}
              </Title>
              <Text
                style={{ fontSize: 16, display: "flex", alignItems: "center" }}
              >
                <EnvironmentOutlined style={{ marginRight: 8 }} />{" "}
                {land.location}
              </Text>
              <div style={{ marginTop: 12, marginBottom: 16 }}>
                <Tag
                  color="success"
                  style={{ fontSize: 14, padding: "4px 8px" }}
                >
                  AVAILABLE
                </Tag>
              </div>

              <div
                style={{
                  background: colors.lightBg,
                  padding: 16,
                  borderRadius: 8,
                  marginBottom: 24,
                }}
              >
                <Text type="secondary">Total Price</Text>
                <div>
                  <Text strong style={{ fontSize: 24 }}>
                    {formatPrice(land.price_per_sqm, land.size)}
                  </Text>
                </div>
                <Text type="secondary">
                  {land.price_per_sqm
                    ? new Intl.NumberFormat("en-PH", {
                        style: "currency",
                        currency: "PHP",
                        maximumFractionDigits: 0,
                      }).format(land.price_per_sqm)
                    : "-"}{" "}
                  per square meter
                </Text>
              </div>

              <Descriptions
                column={1}
                size="small"
                labelStyle={{ fontWeight: "bold" }}
              >
                <Descriptions.Item label="Land Size">
                  {land.size ? `${land.size.toLocaleString()} sqm` : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Date Listed">
                  {formatDate(land.created_at)}
                </Descriptions.Item>
              </Descriptions>

              {land.agent && (
                <div style={{ marginTop: 24 }}>
                  <Title level={5}>Contact Agent</Title>
                  <Card size="small">
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          backgroundColor: colors.primary,
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 16,
                        }}
                      >
                        {land.agent.name.substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <Text strong>{land.agent.name}</Text>
                        <div>
                          <Text type="secondary">Land Agent</Text>
                        </div>
                      </div>
                    </div>
                  </Card>
                  <div style={{ marginTop: 16 }}>
                    <Button
                      type="primary"
                      block
                      style={{
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      }}
                    >
                      Contact Agent
                    </Button>
                    <Button block style={{ marginTop: 8 }}>
                      Schedule Viewing
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Col>
        </Row>

        <Divider />

        <div>
          <Title level={4}>Property Details</Title>
          <Descriptions bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Land Name">{land.name}</Descriptions.Item>
            <Descriptions.Item label="Location">
              {land.location}
            </Descriptions.Item>
            <Descriptions.Item label="Land Area">
              {land.size ? `${land.size.toLocaleString()} sqm` : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Price per sqm">
              {land.price_per_sqm
                ? new Intl.NumberFormat("en-PH", {
                    style: "currency",
                    currency: "PHP",
                    maximumFractionDigits: 0,
                  }).format(land.price_per_sqm)
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Total Price">
              {formatPrice(land.price_per_sqm, land.size)}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color="success">AVAILABLE</Tag>
            </Descriptions.Item>
          </Descriptions>

          {land.description && (
            <div style={{ marginTop: 24 }}>
              <Title level={5}>Description</Title>
              <div style={{ whiteSpace: "pre-line" }}>{land.description}</div>
            </div>
          )}

          {land.features && land.features.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <Title level={5}>Features</Title>
              <Row gutter={[16, 16]}>
                {land.features.map((feature, index) => (
                  <Col xs={24} sm={12} md={8} key={index}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          backgroundColor: colors.lightBg,
                          color: colors.primary,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 8,
                          fontSize: 12,
                          fontWeight: "bold",
                        }}
                      >
                        ✓
                      </div>
                      <Text>{feature}</Text>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: 24,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button onClick={() => navigate(-1)}>Back to Available Lands</Button>

          {land.agent && (
            <Button
              type="primary"
              style={{
                backgroundColor: colors.primary,
                borderColor: colors.primary,
              }}
            >
              Contact Agent
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default LandView;
