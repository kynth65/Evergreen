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
  Modal,
} from "antd";
import {
  SaveOutlined,
  ArrowLeftOutlined,
  PictureOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../axios.client";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;

export default function AdminEditLand() {
  const { id } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [agents, setAgents] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newFileList, setNewFileList] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [primaryImageId, setPrimaryImageId] = useState(null);

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
    fetchAgents();
  }, [id]);

  const fetchLandDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.get(`/lands/${id}`);
      const land = response.data.data;

      // Set form values
      form.setFieldsValue({
        name: land.name,
        size: land.size,
        price_per_sqm: land.price_per_sqm,
        location: land.location,
        description: land.description,
        status: land.status,
        agent_id: land.agent_id,
      });

      // Process existing images
      if (land.images && land.images.length > 0) {
        const images = land.images.map((img) => ({
          uid: img.id,
          id: img.id,
          name: img.image_path.split("/").pop(),
          status: "done",
          url: `${import.meta.env.VITE_API_BASE_URL}/storage/${img.image_path}`,
          is_primary: img.is_primary,
        }));

        setExistingImages(images);

        // Set primary image
        const primaryImage = land.images.find((img) => img.is_primary);
        if (primaryImage) {
          setPrimaryImageId(primaryImage.id);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching land details:", error);
      setError("Failed to load land details. Please try again later.");
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      // Fetch users with role Agent - adjust API endpoint based on your system
      const response = await axiosClient.get("/users", {
        params: { role: "agent" },
      });
      setAgents(response.data.data || []);
    } catch (error) {
      console.error("Error fetching agents:", error);
      message.warning(
        "Failed to load agents. You can continue without selecting an agent."
      );
    }
  };

  // Handle new file upload change
  const handleNewFileChange = ({ fileList }) => {
    // Limit to remaining slots (max 3 total)
    const availableSlots =
      3 -
      existingImages.filter((img) => !imagesToDelete.includes(img.id)).length;
    const limitedFileList = fileList.slice(0, availableSlots);
    setNewFileList(limitedFileList);
  };

  // Handle existing file removal
  const handleRemoveExistingFile = (file) => {
    confirm({
      title: "Remove image",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to remove this image?",
      onOk() {
        setImagesToDelete([...imagesToDelete, file.id]);

        // If removing primary image, reset primary
        if (file.id === primaryImageId) {
          setPrimaryImageId(null);
        }
      },
    });
    return false; // Prevent automatic removal
  };

  // Handle setting an image as primary
  const handleSetPrimary = (imageId) => {
    setPrimaryImageId(imageId);
    message.success("Primary image updated");
  };

  // Filtered existing images (excluding ones marked for deletion)
  const filteredExistingImages = existingImages.filter(
    (img) => !imagesToDelete.includes(img.id)
  );

  // Handle form submission
  const handleSubmit = async (values) => {
    setSubmitting(true);
    setError(null);

    try {
      // Create form data for file upload
      const formData = new FormData();

      // Use FormData's append method for all fields
      formData.append("_method", "PUT"); // Laravel requires this for PUT requests via FormData
      formData.append("name", values.name);
      formData.append("size", values.size);
      formData.append("price_per_sqm", values.price_per_sqm);
      formData.append("location", values.location);
      formData.append("description", values.description || "");
      formData.append("status", values.status);

      if (values.agent_id) {
        formData.append("agent_id", values.agent_id);
      }

      // Append images to delete
      if (imagesToDelete.length > 0) {
        imagesToDelete.forEach((imageId, index) => {
          formData.append(`remove_image_ids[${index}]`, imageId);
        });
      }

      // Set primary image
      if (primaryImageId) {
        formData.append("primary_image_id", primaryImageId);
      }

      // Append new image files
      newFileList.forEach((file, index) => {
        formData.append(`new_images[${index}]`, file.originFileObj);
      });

      // Send API request
      await axiosClient.post(`/lands/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      message.success("Land property updated successfully");
      navigate(`/admin/land-management/${id}`);
    } catch (error) {
      console.error("Error updating land:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to update land property";
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Upload buttons
  const uploadButton = (
    <div>
      <PictureOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <p style={{ marginTop: "20px" }}>Loading property details...</p>
      </div>
    );
  }

  return (
    <div className="admin-edit-land">
      <Card>
        <div style={{ marginBottom: "24px" }}>
          <Space align="center">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(`/admin/land-management/${id}`)}
            >
              Back to Property Details
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              Edit Land Property
            </Title>
          </Space>
          <Paragraph style={{ marginTop: "8px" }}>
            Update the property details below.
          </Paragraph>
        </div>

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            style={{ marginBottom: "24px" }}
            closable
          />
        )}

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
                <Select placeholder="Select an agent" allowClear>
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

          {/* Existing Images */}
          {filteredExistingImages.length > 0 && (
            <Form.Item label="Current Images">
              <div className="existing-images">
                <Row gutter={[16, 16]}>
                  {filteredExistingImages.map((image) => (
                    <Col key={image.id} xs={24} sm={12} md={8}>
                      <Card
                        hoverable
                        style={{
                          border:
                            image.id === primaryImageId
                              ? `2px solid ${colors.primary}`
                              : null,
                        }}
                        cover={
                          <div style={{ height: 200, overflow: "hidden" }}>
                            <img
                              alt={image.name}
                              src={image.url}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                        }
                        actions={[
                          <Button
                            type="link"
                            onClick={() => handleSetPrimary(image.id)}
                            disabled={image.id === primaryImageId}
                          >
                            {image.id === primaryImageId
                              ? "Primary Image"
                              : "Set as Primary"}
                          </Button>,
                          <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveExistingFile(image)}
                          >
                            Remove
                          </Button>,
                        ]}
                      >
                        <Card.Meta title={`Image ${image.id}`} />
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            </Form.Item>
          )}

          {/* Upload New Images */}
          <Form.Item
            label={`Add New Images (${
              3 - filteredExistingImages.length > 0
                ? `Up to ${3 - filteredExistingImages.length} more images`
                : "Maximum images reached"
            })`}
            name="new_images"
            extra="Upload additional images for the property."
          >
            <Upload
              listType="picture-card"
              fileList={newFileList}
              onChange={handleNewFileChange}
              beforeUpload={() => false} // Prevent auto upload
              disabled={filteredExistingImages.length >= 3}
            >
              {newFileList.length + filteredExistingImages.length >= 3
                ? null
                : uploadButton}
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
                Save Changes
              </Button>
              <Button
                onClick={() => navigate(`/admin/land-management/${id}`)}
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
