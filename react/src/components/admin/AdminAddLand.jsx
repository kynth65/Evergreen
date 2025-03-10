import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Card,
  Typography,
  Upload,
  Row,
  Col,
  message,
  Spin,
  Alert,
  Space,
  Divider,
  Tag,
  Tooltip,
  Input as AntInput,
} from "antd";
import {
  SaveOutlined,
  UploadOutlined,
  ArrowLeftOutlined,
  PictureOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../axios.client";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function AdminAddLand() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [agents, setAgents] = useState([]);
  const [fileList, setFileList] = useState([]);

  // For handling feature tags
  const [features, setFeatures] = useState([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = React.useRef(null);

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
    fetchAgents();
  }, []);

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  const fetchAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch users with role Agent - adjust API endpoint based on your system
      const response = await axiosClient.get("/users", {
        params: { role: "agent" },
      });
      setAgents(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching agents:", error);
      setError(
        "Failed to load agents. You can continue without selecting an agent."
      );
      setLoading(false);
    }
  };

  // Handle file upload change
  const handleUploadChange = ({ fileList: newFileList }) => {
    // Limit to 3 images max
    const limitedFileList = newFileList.slice(0, 3);
    setFileList(limitedFileList);
  };

  // Remove file
  const handleRemoveFile = (file) => {
    const newFileList = fileList.filter((item) => item.uid !== file.uid);
    setFileList(newFileList);
  };

  // Feature tag handlers
  const handleClose = (removedTag) => {
    const newTags = features.filter((tag) => tag !== removedTag);
    setFeatures(newTags);
  };

  const showInput = () => {
    setInputVisible(true);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    if (inputValue && !features.includes(inputValue)) {
      setFeatures([...features, inputValue]);
    }
    setInputVisible(false);
    setInputValue("");
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    setSubmitting(true);
    setError(null);
    try {
      // Create form data for file upload
      const formData = new FormData();

      // Append all form fields
      formData.append("name", values.name);
      formData.append("size", values.size);
      formData.append("price_per_sqm", values.price_per_sqm);
      formData.append("location", values.location);
      formData.append("description", values.description || "");
      formData.append("status", values.status);

      // Add features as JSON
      formData.append("features", JSON.stringify(features));

      if (values.agent_id) {
        formData.append("agent_id", values.agent_id);
      }

      // Append image files
      fileList.forEach((file, index) => {
        formData.append(`images[${index}]`, file.originFileObj);
      });

      // Send API request
      await axiosClient.post("/lands", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      message.success("Land property added successfully");
      navigate("/admin/land-management");
    } catch (error) {
      console.error("Error adding land:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to add land property";
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Upload button
  const uploadButton = (
    <div>
      <PictureOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <div className="admin-add-land">
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/land-management")}
          >
            Back to Land Management
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            Add New Land Property
          </Title>
        </div>

        <Paragraph style={{ marginTop: "8px", marginBottom: "24px" }}>
          Fill in the details below to add a new land property.
        </Paragraph>

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            style={{ marginBottom: "24px" }}
            closable
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: "available",
          }}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Property Name"
                rules={[
                  { required: true, message: "Please enter the property name" },
                ]}
              >
                <Input placeholder="Enter property name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="location"
                label="Location"
                rules={[
                  {
                    required: true,
                    message: "Please enter the property location",
                  },
                ]}
              >
                <Input placeholder="Enter property location" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="size"
                label="Size (sqm)"
                rules={[
                  { required: true, message: "Please enter the property size" },
                  {
                    type: "number",
                    min: 1,
                    message: "Size must be greater than 0",
                  },
                ]}
              >
                <InputNumber
                  placeholder="Enter size in square meters"
                  style={{ width: "100%" }}
                  min={1}
                  step={1}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="price_per_sqm"
                label="Price per Square Meter"
                rules={[
                  {
                    required: true,
                    message: "Please enter the price per square meter",
                  },
                  {
                    type: "number",
                    min: 1,
                    message: "Price must be greater than 0",
                  },
                ]}
              >
                <InputNumber
                  placeholder="Enter price per square meter"
                  style={{ width: "100%" }}
                  min={1}
                  step={1}
                  formatter={(value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[
                  {
                    required: true,
                    message: "Please select the property status",
                  },
                ]}
              >
                <Select placeholder="Select property status">
                  <Option value="available">Available</Option>
                  <Option value="pending">Pending</Option>
                  <Option value="sold">Sold</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="agent_id" label="Assigned Agent">
                <Select
                  placeholder="Select an agent"
                  allowClear
                  loading={loading}
                >
                  {agents.map((agent) => (
                    <Option key={agent.id} value={agent.id}>
                      {agent.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <TextArea rows={4} placeholder="Enter property description" />
          </Form.Item>

          {/* Property Features */}
          <Form.Item label="Property Features">
            <Card title="Add Property Features" bordered={false}>
              <div style={{ marginBottom: "16px" }}>
                <Text>
                  Enter features like "Flat terrain", "Complete documentation
                  available", etc.
                </Text>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {features.map((tag, index) => (
                  <Tag
                    key={tag}
                    closable
                    onClose={() => handleClose(tag)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "5px 10px",
                      backgroundColor: colors.lightBg,
                      color: colors.primary,
                    }}
                  >
                    {tag}
                  </Tag>
                ))}

                {inputVisible ? (
                  <AntInput
                    ref={inputRef}
                    type="text"
                    size="small"
                    style={{ width: 150 }}
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputConfirm}
                    onPressEnter={handleInputConfirm}
                  />
                ) : (
                  <Tag
                    onClick={showInput}
                    style={{
                      borderStyle: "dashed",
                      padding: "5px 10px",
                      cursor: "pointer",
                    }}
                  >
                    <PlusOutlined /> Add Feature
                  </Tag>
                )}
              </div>
            </Card>
          </Form.Item>

          <Form.Item
            label="Property Images (Up to 3 images)"
            name="images"
            extra="The first uploaded image will be used as the primary image."
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              onRemove={handleRemoveFile}
              beforeUpload={() => false} // Prevent auto upload
              maxCount={3}
            >
              {fileList.length >= 3 ? null : uploadButton}
            </Upload>
          </Form.Item>

          <Divider />

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={submitting}
                style={{
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                }}
              >
                Save Property
              </Button>
              <Button
                onClick={() => navigate("/admin/land-management")}
                icon={<ArrowLeftOutlined />}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
