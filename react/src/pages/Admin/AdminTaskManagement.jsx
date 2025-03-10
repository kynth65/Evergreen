import React, { useState, useEffect } from "react";
import axiosClient from "../../axios.client";
import {
  Table,
  Button,
  Pagination,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  message,
  Space,
  Tag,
  Tooltip,
  Popconfirm,
  Badge,
  Tabs,
  Card,
  Descriptions,
  Typography,
  Divider,
  Skeleton,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UploadOutlined,
  FileOutlined,
  CheckOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useStateContext } from "../../context/ContextProvider";

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Paragraph, Text } = Typography;

export default function AdminTaskManagement() {
  const { token } = useStateContext();
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewSubmissionModalVisible, setIsViewSubmissionModalVisible] =
    useState(false);
  const [modalTitle, setModalTitle] = useState("Add New Task");
  const [selectedTask, setSelectedTask] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterNeedsReview, setFilterNeedsReview] = useState(false);
  const [markingAsChecked, setMarkingAsChecked] = useState(false);
  const noImageFallback =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMTUwIDE1MCI+PHJlY3Qgd2lkdGg9IjE1MCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSI3NSIgeT0iNzUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzg4OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PHBhdGggZD0iTTQwLDExMCBMNjAsODAgTDgwLDkwIEwxMDAsNjAgTDEyMCwxMTAgWiIgZmlsbD0iI2RkZCIgc3Ryb2tlPSIjY2NjIiAvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjEwIiBmaWxsPSIjZGRkIiAvPjwvc3ZnPg==";
  const baseUrl = "http://localhost:8000";

  const colors = {
    primary: "#1da57a", // Primary green
    secondary: "#52c41a", // Secondary lighter green
    warning: "#faad14",
    success: "#52c41a",
    error: "#f5222d",
    lightBg: "#f6ffed", // Light green background
  };

  useEffect(() => {
    fetchTasks();
  }, [
    pagination.current,
    pagination.pageSize,
    filterStatus,
    filterNeedsReview,
  ]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        per_page: pagination.pageSize,
      };

      if (filterStatus) {
        params.status = filterStatus;
      }

      if (filterNeedsReview) {
        params.needs_review = "true";
      }

      const response = await axiosClient.get("/admin/tasks", { params });

      if (response.data && response.data.data) {
        setTasks(response.data.data.data || []);
        setPagination({
          ...pagination,
          total: response.data.data.total || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      message.error(
        "Failed to load tasks: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination) => {
    setPagination({ ...pagination });
  };

  const showAddModal = () => {
    setModalTitle("Add New Task");
    setSelectedTask(null);
    form.resetFields();
    setFileList([]);
    setIsModalVisible(true);
  };

  const showEditModal = (task) => {
    setModalTitle("Edit Task");
    setSelectedTask(task);

    form.setFieldsValue({
      task_name: task.task_name,
      description: task.description,
      instructions: task.instructions,
      status: task.status,
      due_date: task.due_date ? dayjs(task.due_date) : null,
    });

    // Set file list if image exists
    if (task.image_path) {
      console.log("Image path from API:", task.image_path); // Debug log

      const imageUrl = getFullImageUrl(task.image_path);
      console.log("Computed image URL:", imageUrl); // Debug log

      setFileList([
        {
          uid: "-1",
          name: task.image_path.split("/").pop(),
          status: "done",
          url: imageUrl,
        },
      ]);
    } else {
      setFileList([]);
    }

    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();

    // Add all form values to FormData except image
    Object.keys(values).forEach((key) => {
      if (key === "due_date" && values[key]) {
        formData.append(key, values[key].format("YYYY-MM-DD HH:mm:ss"));
      } else if (key !== "image") {
        formData.append(key, values[key] || "");
      }
    });

    // Add image to FormData if exists
    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append("image", fileList[0].originFileObj);
    }

    setLoading(true);

    try {
      let response;

      if (selectedTask) {
        // Update existing task
        response = await axiosClient.post(
          `/admin/tasks/${selectedTask.id}?_method=PUT`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        message.success("Task updated successfully");
      } else {
        // Create new task
        response = await axiosClient.post("/admin/tasks", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        message.success("Task created successfully");
      }

      setIsModalVisible(false);
      fetchTasks();
    } catch (error) {
      console.error("Error saving task:", error);
      message.error(
        "Failed to save task: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axiosClient.delete(`/admin/tasks/${id}`);
      message.success("Task deleted successfully");
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      message.error("Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    setLoading(true);
    try {
      await axiosClient.patch(`/admin/tasks/${id}/status`, { status });
      message.success("Task status updated successfully");
      fetchTasks();
    } catch (error) {
      console.error("Error updating task status:", error);
      message.error("Failed to update task status");
    } finally {
      setLoading(false);
    }
  };

  const showSubmissionModal = (task) => {
    setSelectedTask(task);
    setIsViewSubmissionModalVisible(true);
  };

  const handleSubmissionModalCancel = () => {
    setIsViewSubmissionModalVisible(false);
  };

  const markSubmissionAsChecked = async (id) => {
    setMarkingAsChecked(true);
    try {
      await axiosClient.patch(`/admin/tasks/${id}/submission/check`);
      message.success("Submission marked as checked");
      setIsViewSubmissionModalVisible(false);
      fetchTasks();
    } catch (error) {
      console.error("Error marking submission as checked:", error);
      message.error("Failed to mark submission as checked");
    } finally {
      setMarkingAsChecked(false);
    }
  };

  // Helper function to get creator display name
  const getCreatorName = (creator) => {
    if (!creator) return "Unknown";
    if (creator.first_name && creator.last_name) {
      return `${creator.first_name} ${creator.last_name}`;
    }
    return creator.email || `User #${creator.id}`;
  };

  // Function to get proper file URL
  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    // Check if the path already has the full URL
    if (filePath.startsWith("http")) {
      return filePath;
    }

    // If path already includes /storage/, it's good to go
    if (filePath.startsWith("/storage/")) {
      return filePath;
    }

    // If path starts with storage/ (without leading slash), add the slash
    if (filePath.startsWith("storage/")) {
      return `/${filePath}`;
    }

    // Otherwise, prepend /storage/ to the path
    return `/storage/${filePath}`;
  };

  const getFullImageUrl = (filePath) => {
    if (!filePath) return noImageFallback;

    // If the path already starts with http, return it as is
    if (filePath.startsWith("http")) {
      return filePath;
    }

    // Update for Vite environment variable format
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || baseUrl;

    // If path starts with /storage or storage, append to base URL
    if (filePath.startsWith("/storage/") || filePath.startsWith("storage/")) {
      return filePath.startsWith("/")
        ? `${apiBaseUrl}${filePath}`
        : `${apiBaseUrl}/${filePath}`;
    }

    // For other paths, add /storage/ prefix
    return `${apiBaseUrl}/storage/${filePath}`;
  };

  const renderSubmissionStatus = (task) => {
    if (!task.submission_file_path) {
      return <Tag>No submission</Tag>;
    }

    if (task.is_submission_checked) {
      return (
        <Tag color="green" icon={<CheckCircleOutlined />}>
          Reviewed
        </Tag>
      );
    }

    return (
      <Badge
        status="processing"
        text={
          <Tag color="orange" icon={<ClockCircleOutlined />}>
            Needs Review
          </Tag>
        }
      />
    );
  };

  // Custom skeleton row for loading state
  const SkeletonRow = () => (
    <tr className="ant-table-row">
      <td>
        <Skeleton.Input active size="small" style={{ width: 150 }} />
      </td>
      <td>
        <Skeleton.Input active size="small" style={{ width: 80 }} />
      </td>
      <td>
        <Skeleton.Input active size="small" style={{ width: 100 }} />
      </td>
      <td>
        <Skeleton.Input active size="small" style={{ width: 100 }} />
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
      title: "Task Name",
      dataIndex: "task_name",
      key: "task_name",
      render: (text, record) => (
        <Tooltip title="Click to view details">
          <a onClick={() => showEditModal(record)}>{text}</a>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        let icon = null;

        switch (status) {
          case "completed":
            color = "success";
            icon = <CheckCircleOutlined />;
            break;
          case "failed":
            color = "error";
            icon = <CloseCircleOutlined />;
            break;
          case "pending":
            color = "processing";
            icon = <ClockCircleOutlined />;
            break;
          default:
            break;
        }

        return (
          <Tag color={color} icon={icon}>
            {status ? status.toUpperCase() : "UNKNOWN"}
          </Tag>
        );
      },
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: (date) =>
        date ? dayjs(date).format("YYYY-MM-DD") : "No due date",
    },
    {
      title: "Submission",
      key: "submission",
      render: (_, record) => renderSubmissionStatus(record),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => showEditModal(record)}
          />

          {record.submission_file_path && (
            <Button
              type="primary"
              ghost
              icon={<FileOutlined />}
              size="small"
              onClick={() => showSubmissionModal(record)}
            >
              {record.is_submission_checked ? "View Submission" : "Review"}
            </Button>
          )}

          <Popconfirm
            title="Are you sure you want to delete this task?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>

          {record.status !== "completed" && (
            <Button
              type="primary"
              ghost
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleStatusChange(record.id, "completed")}
            >
              Complete
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-task-management">
      <div
        className="header-section"
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h1 className="text-2xl">Task Management</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{
            backgroundColor: colors.primary,
            borderColor: colors.primary,
          }}
          onClick={showAddModal}
        >
          Add Task
        </Button>
      </div>

      <div className="filter-section" style={{ marginBottom: "20px" }}>
        <Space>
          <span>Filter by status:</span>
          <Select
            style={{ width: 150 }}
            placeholder="All statuses"
            allowClear
            value={filterStatus}
            onChange={(value) => setFilterStatus(value)}
            disabled={loading}
          >
            <Option value="pending">Pending</Option>
            <Option value="completed">Completed</Option>
            <Option value="failed">Failed</Option>
          </Select>

          <Tooltip title="Show only tasks with submissions that need review">
            <Button
              type={filterNeedsReview ? "primary" : "default"}
              icon={<InboxOutlined />}
              onClick={() => setFilterNeedsReview(!filterNeedsReview)}
              disabled={loading}
            >
              Needs Review
            </Button>
          </Tooltip>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={loading ? [] : tasks}
        rowKey="id"
        pagination={pagination}
        onChange={handleTableChange}
        loading={false} // We're handling our own loading state with skeletons
        components={{
          body: {
            wrapper: (props) => {
              // Add skeleton rows if loading
              if (loading) {
                return (
                  <tbody {...props}>
                    {Array(pagination.pageSize > 5 ? 5 : pagination.pageSize)
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

      {/* Add/Edit Task Modal */}
      <Modal
        title={modalTitle}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: "pending",
          }}
        >
          <Form.Item
            name="task_name"
            label="Task Name"
            rules={[{ required: true, message: "Please enter task name" }]}
          >
            <Input placeholder="Enter task name" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={4} placeholder="Enter task description" />
          </Form.Item>

          <Form.Item name="instructions" label="Instructions">
            <TextArea rows={4} placeholder="Enter task instructions" />
          </Form.Item>

          <Form.Item label="Image">
            <Upload
              listType="picture"
              maxCount={1}
              beforeUpload={() => false} // Prevent auto upload
              fileList={fileList}
              onRemove={() => setFileList([])}
              onChange={({ fileList }) => setFileList(fileList)}
              onPreview={() => {
                if (fileList.length > 0 && fileList[0].url) {
                  window.open(fileList[0].url, "_blank");
                }
              }}
            >
              <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>
            {fileList.length > 0 && fileList[0].url && (
              <div className="mt-2">
                <img
                  src={fileList[0].url}
                  alt="Preview"
                  style={{ maxWidth: "100%", maxHeight: "200px" }}
                  onError={(e) => {
                    console.error("Image failed to load:", fileList[0].url);
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src = noImageFallback;
                  }}
                />
              </div>
            )}
          </Form.Item>

          <Form.Item name="status" label="Status">
            <Select>
              <Option value="pending">Pending</Option>
              <Option value="completed">Completed</Option>
              <Option value="failed">Failed</Option>
            </Select>
          </Form.Item>

          <Form.Item name="due_date" label="Due Date">
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {selectedTask ? "Update Task" : "Create Task"}
              </Button>
              <Button onClick={handleCancel}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Submission Modal */}
      <Modal
        title="Review Task Submission"
        open={isViewSubmissionModalVisible}
        onCancel={handleSubmissionModalCancel}
        footer={[
          <Button key="close" onClick={handleSubmissionModalCancel}>
            Close
          </Button>,
          selectedTask &&
            selectedTask.submission_file_path &&
            !selectedTask.is_submission_checked && (
              <Button
                key="mark-checked"
                type="primary"
                icon={<CheckOutlined />}
                loading={markingAsChecked}
                onClick={() => markSubmissionAsChecked(selectedTask.id)}
              >
                Mark as Reviewed
              </Button>
            ),
        ]}
        width={800}
      >
        {selectedTask ? (
          <div>
            <Card title="Task Details">
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Task Name">
                  {selectedTask.task_name}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag
                    color={
                      selectedTask.status === "completed"
                        ? "success"
                        : selectedTask.status === "failed"
                        ? "error"
                        : "processing"
                    }
                  >
                    {selectedTask.status.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Due Date">
                  {selectedTask.due_date
                    ? dayjs(selectedTask.due_date).format("YYYY-MM-DD")
                    : "No due date"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Divider />

            <Card title="Submission Details">
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Submission Date">
                  {selectedTask.submission_date
                    ? dayjs(selectedTask.submission_date).format(
                        "YYYY-MM-DD HH:mm:ss"
                      )
                    : "Not recorded"}
                </Descriptions.Item>
                <Descriptions.Item label="Review Status">
                  {selectedTask.is_submission_checked ? (
                    <Tag color="green" icon={<CheckCircleOutlined />}>
                      Reviewed
                    </Tag>
                  ) : (
                    <Tag color="orange" icon={<ClockCircleOutlined />}>
                      Pending Review
                    </Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Submitted File">
                  <a
                    href={getFullImageUrl(selectedTask.submission_file_path)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download Submission
                  </a>
                </Descriptions.Item>
              </Descriptions>

              {!selectedTask.is_submission_checked && (
                <div style={{ marginTop: "20px" }}>
                  <Text type="warning">
                    <b>Note:</b> After reviewing this submission, click "Mark as
                    Reviewed" to indicate that you have checked this submission.
                  </Text>
                </div>
              )}
            </Card>
          </div>
        ) : (
          <div>
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
        )}
      </Modal>
    </div>
  );
}
