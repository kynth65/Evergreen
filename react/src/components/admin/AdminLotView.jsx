// src/pages/Admin/AdminLotView.jsx
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
import { EditOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const AdminLotView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lot, setLot] = useState(null);
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
      .get(`/lots/${id}`)
      .then((response) => {
        setLot(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching lot details:", err);
        setError("Failed to load lot data");
        message.error(
          "Failed to load lot data: " +
            (err.response?.data?.message || err.message)
        );
        setLoading(false);
      });
  }, [id]);

  const getStatusColor = (status) => {
    switch (status) {
      case "AVAILABLE":
        return "success";
      case "SOLD":
        return "error";
      case "EXCLUDED":
        return "warning";
      default:
        return "default";
    }
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

  if (!lot) {
    return (
      <Card>
        <div style={{ color: colors.warning }}>Lot not found</div>
      </Card>
    );
  }

  return (
    <div className="admin-lot-view" style={{ maxWidth: 800, margin: "0 auto" }}>
      <Card
        title={<Title level={4}>Lot Details</Title>}
        extra={
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/lot-management/${id}/edit`)}
            style={{
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            }}
          >
            Edit
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
              {lot.property_name}
            </Title>
            <Text style={{ fontSize: 16 }}>{lot.block_lot_no}</Text>
            <div style={{ marginTop: 8 }}>
              <Tag color={getStatusColor(lot.status)}>{lot.status}</Tag>
            </div>
          </div>
          {lot.total_contract_price && (
            <div style={{ textAlign: "right" }}>
              <Text type="secondary">Total Contract Price</Text>
              <div>
                <Text strong style={{ fontSize: 20 }}>
                  ₱ {new Intl.NumberFormat().format(lot.total_contract_price)}
                </Text>
              </div>
            </div>
          )}
        </div>

        <Divider />

        <Descriptions title="Property Information" bordered column={1}>
          <Descriptions.Item label="Property Name">
            {lot.property_name}
          </Descriptions.Item>
          <Descriptions.Item label="Block & Lot No.">
            {lot.block_lot_no}
          </Descriptions.Item>
          <Descriptions.Item label="Lot Area">
            {lot.lot_area} sqm
          </Descriptions.Item>
          <Descriptions.Item label="Total Contract Price">
            {lot.total_contract_price
              ? `₱ ${new Intl.NumberFormat().format(lot.total_contract_price)}`
              : "Not specified"}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={getStatusColor(lot.status)}>{lot.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Client">
            {lot.client || "None"}
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 24 }}>
          <Space>
            <Button
              type="primary"
              onClick={() => navigate(`/admin/lot-management/${id}/edit`)}
              style={{
                backgroundColor: colors.warning,
                borderColor: colors.warning,
              }}
            >
              Edit
            </Button>
            <Button onClick={() => navigate("/admin/lot-management")}>
              Back to List
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default AdminLotView;
