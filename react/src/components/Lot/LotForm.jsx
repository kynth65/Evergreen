// src/components/Lot/LotForm.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import axiosClient from "../../axios.client";
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Space,
  message,
  Skeleton,
  Typography,
  Divider,
} from "antd";

const { Option } = Select;
const { Title, Text } = Typography;

const LotForm = ({ role }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshLots } = useOutletContext() || { refreshLots: () => {} };
  const isAddMode = !id || id === "new";
  const isViewMode = id && window.location.pathname.includes("/view");

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("AVAILABLE");

  const colors = {
    primary: "#1da57a", // Primary green
    secondary: "#52c41a", // Secondary lighter green
    warning: "#faad14",
    success: "#52c41a",
    error: "#f5222d",
    lightBg: "#f6ffed", // Light green background
  };

  useEffect(() => {
    if (!isAddMode) {
      setLoading(true);
      axiosClient
        .get(`/lots/${id}`)
        .then((response) => {
          // Set form values from response data
          const lotData = response.data;
          form.setFieldsValue({
            property_name: lotData.property_name,
            block_lot_no: lotData.block_lot_no,
            lot_area: lotData.lot_area,
            total_contract_price: lotData.total_contract_price,
            status: lotData.status,
            client: lotData.client || "",
          });
          setCurrentStatus(lotData.status);
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
    }
  }, [id, isAddMode, form]);

  const onFinish = (values) => {
    setSubmitting(true);

    const data = {
      ...values,
      lot_area: parseInt(values.lot_area),
      total_contract_price: values.total_contract_price
        ? parseInt(values.total_contract_price)
        : null,
      client: values.client || null,
    };

    const savePromise = isAddMode
      ? axiosClient.post("/lots", data)
      : axiosClient.put(`/lots/${id}`, data);

    savePromise
      .then(() => {
        message.success(
          `Lot ${isAddMode ? "created" : "updated"} successfully`
        );
        // Refresh the parent list
        if (refreshLots) refreshLots();
        // Redirect back to list based on the role
        navigate(`/${role}/lot-management`);
      })
      .catch((err) => {
        setSubmitting(false);
        console.error("Error saving lot:", err);

        // Handle validation errors from backend
        if (err.response && err.response.data && err.response.data.errors) {
          // Set form errors
          const errorFields = Object.entries(err.response.data.errors).map(
            ([name, errors]) => ({
              name,
              errors: Array.isArray(errors) ? errors : [errors],
            })
          );
          form.setFields(errorFields);
        } else {
          message.error(
            "Failed to save lot: " +
              (err.response?.data?.message || err.message)
          );
        }
      });
  };

  // Status change handler
  const onStatusChange = (value) => {
    setCurrentStatus(value);
    // If status changes to something other than SOLD, clear client field
    if (value !== "SOLD") {
      form.setFieldValue("client", "");
    }
  };

  if (loading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    );
  }

  return (
    <Card
      title={
        <Title level={4}>
          {isAddMode
            ? "Add New Lot"
            : isViewMode
            ? "View Lot Details"
            : "Edit Lot"}
        </Title>
      }
      style={{ maxWidth: 800, margin: "0 auto" }}
    >
      {error && (
        <div style={{ marginBottom: 16, color: colors.error }}>{error}</div>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          status: "AVAILABLE",
        }}
        disabled={isViewMode}
      >
        <Form.Item
          name="property_name"
          label="Property Name"
          rules={[{ required: true, message: "Please enter property name" }]}
        >
          <Input placeholder="Enter property name" />
        </Form.Item>

        <Form.Item
          name="block_lot_no"
          label="Block & Lot No."
          rules={[
            { required: true, message: "Please enter block and lot number" },
          ]}
        >
          <Input placeholder="e.g. Blk 1 Lot 2" />
        </Form.Item>

        <Form.Item
          name="lot_area"
          label="Lot Area (Sqm)"
          rules={[
            { required: true, message: "Please enter lot area" },
            {
              type: "number",
              transform: (value) => (value ? Number(value) : undefined),
              message: "Lot area must be a number",
            },
          ]}
        >
          <Input type="number" placeholder="e.g. 250" />
        </Form.Item>

        <Form.Item
          name="total_contract_price"
          label="Total Contract Price"
          rules={[
            {
              type: "number",
              transform: (value) => (value ? Number(value) : undefined),
              message: "Total Contract Price must be a number",
            },
          ]}
        >
          <Input type="number" placeholder="Enter amount without commas" />
        </Form.Item>
        <Text
          type="secondary"
          style={{ marginTop: -16, display: "block", marginBottom: 16 }}
        >
          Property's total contract price in whole numbers
        </Text>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: "Please select status" }]}
        >
          <Select onChange={onStatusChange}>
            <Option value="AVAILABLE">AVAILABLE</Option>
            <Option value="SOLD">SOLD</Option>
            <Option value="EXCLUDED">EXCLUDED</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="client"
          label={
            <span
              style={{
                color: currentStatus === "SOLD" ? "#ff4d4f" : undefined,
              }}
            >
              Client{" "}
              {currentStatus === "SOLD" && (
                <span style={{ color: "#ff4d4f" }}>*</span>
              )}
            </span>
          }
          rules={[
            {
              required: currentStatus === "SOLD",
              message: "Client name is required for sold lots",
            },
          ]}
        >
          <Input
            placeholder="Enter client name"
            disabled={currentStatus !== "SOLD" || isViewMode}
          />
        </Form.Item>
        <Text
          type="secondary"
          style={{ marginTop: -16, display: "block", marginBottom: 16 }}
        >
          Required if status is SOLD
        </Text>

        <Divider />

        <Form.Item>
          <Space>
            {!isViewMode && (
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                style={{
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                }}
              >
                {isAddMode ? "Create Lot" : "Update Lot"}
              </Button>
            )}
            <Button onClick={() => navigate(`/${role}/lot-management`)}>
              {isViewMode ? "Back to List" : "Cancel"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default LotForm;
