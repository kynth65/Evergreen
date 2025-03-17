import React, { useState, useEffect } from "react";
import axiosClient from "../../axios.client";
import {
  Table,
  Button,
  Modal,
  Space,
  Tag,
  Tooltip,
  message,
  Empty,
  Card,
  Spin,
  Descriptions,
  Image,
  Typography,
  Upload,
  Form,
  Skeleton,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  UploadOutlined,
  FileDoneOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useStateContext } from "../../context/ContextProvider";

const { Title, Paragraph, Text } = Typography;

// Base URL for your API (adjust as needed)
const baseUrl = "http://localhost:8000";

export default function InternTasks() {
  const { token } = useStateContext();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [viewingTask, setViewingTask] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitModalVisible, setIsSubmitModalVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [filterStatus, setFilterStatus] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTasks();
  }, [pagination.current, pagination.pageSize, filterStatus]);

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
      const response = await axiosClient.get("/intern/tasks", {
        params,
      });
      if (response.data && response.data.data) {
        console.log("Tasks received:", response.data.data.data); // Debug log
        setTasks(response.data.data.data || []);
        setPagination({
          ...pagination,
          total: response.data.data.total || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      message.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination) => {
    setPagination({
      ...pagination,
    });
  };

  const showTaskDetails = (task) => {
    setViewingTask(task);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const showSubmitModal = (task) => {
    setViewingTask(task);
    setFileList([]);
    form.resetFields();
    setIsSubmitModalVisible(true);
  };

  const handleSubmitCancel = () => {
    setIsSubmitModalVisible(false);
  };

  const handleSubmitWork = async () => {
    if (fileList.length === 0) {
      message.error("Please upload a file to submit");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("submission_file", fileList[0].originFileObj);

    try {
      const response = await axiosClient.post(
        `/intern/tasks/${viewingTask.id}/submit`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      message.success(response.data.message || "Work submitted successfully");
      setIsSubmitModalVisible(false);
      fetchTasks(); // Refresh the task list
    } catch (error) {
      console.error("Error submitting work:", error);
      message.error(
        "Failed to submit work: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusTag = (status) => {
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
  };

  const renderSubmissionStatus = (task) => {
    if (!task.submission_file_path) {
      return <Tag>Not Submitted</Tag>;
    }

    if (task.is_submission_checked) {
      return (
        <Tag color="green" icon={<CheckCircleOutlined />}>
          Reviewed
        </Tag>
      );
    }

    return (
      <Tag color="orange" icon={<ClockCircleOutlined />}>
        Pending Review
      </Tag>
    );
  };

  // Function to get full URL for images
  const getFullImageUrl = (filePath) => {
    if (!filePath) return null;

    // If the path already starts with http, return it as is
    if (filePath.startsWith("http")) {
      return filePath;
    }

    // If path starts with /storage or storage, append to base URL
    if (filePath.startsWith("/storage/") || filePath.startsWith("storage/")) {
      return filePath.startsWith("/")
        ? `${baseUrl}${filePath}`
        : `${baseUrl}/${filePath}`;
    }

    // For other paths, add /storage/ prefix
    return `${baseUrl}/storage/${filePath}`;
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
          <a onClick={() => showTaskDetails(record)}>{text}</a>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => renderStatusTag(status),
      filters: [
        { text: "Pending", value: "pending" },
        { text: "Completed", value: "completed" },
        { text: "Failed", value: "failed" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: (date) =>
        date ? dayjs(date).format("YYYY-MM-DD") : "No due date",
      sorter: (a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return dayjs(a.due_date).unix() - dayjs(b.due_date).unix();
      },
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
            icon={<EyeOutlined />}
            size="small"
            onClick={() => showTaskDetails(record)}
          >
            View
          </Button>
          {record.status !== "completed" && !record.submission_file_path && (
            <Button
              type="primary"
              ghost
              icon={<UploadOutlined />}
              size="small"
              onClick={() => showSubmitModal(record)}
            >
              Submit
            </Button>
          )}
          {record.submission_file_path && !record.is_submission_checked && (
            <Button
              type="dashed"
              icon={<UploadOutlined />}
              size="small"
              onClick={() => showSubmitModal(record)}
            >
              Resubmit
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="intern-tasks">
      <div style={{ marginBottom: "20px" }}>
        <span className="text-2xl font-bold">My Tasks</span>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={loading ? [] : tasks}
          rowKey="id"
          pagination={pagination}
          onChange={handleTableChange}
          loading={false} // We're handling our own loading state with skeletons
          locale={{
            emptyText: !loading && (
              <Empty
                description="No tasks assigned to you yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
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
      </Card>

      {/* Task Details Modal */}
      <Modal
        title={viewingTask?.task_name}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="close" onClick={handleCancel}>
            Close
          </Button>,
          viewingTask &&
            viewingTask.status !== "completed" &&
            !viewingTask.submission_file_path && (
              <Button
                key="submit"
                type="primary"
                icon={<UploadOutlined />}
                onClick={() => {
                  handleCancel();
                  showSubmitModal(viewingTask);
                }}
              >
                Submit Work
              </Button>
            ),
        ]}
        width={800}
      >
        {viewingTask ? (
          <div>
            <Card>
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Status">
                  {renderStatusTag(viewingTask.status)}
                </Descriptions.Item>
                <Descriptions.Item label="Due Date">
                  {viewingTask.due_date
                    ? dayjs(viewingTask.due_date).format("YYYY-MM-DD")
                    : "No due date"}
                </Descriptions.Item>
                <Descriptions.Item label="Description">
                  {viewingTask.description || "No description provided"}
                </Descriptions.Item>
                <Descriptions.Item label="Instructions">
                  {viewingTask.instructions || "No instructions provided"}
                </Descriptions.Item>
                {viewingTask.submission_file_path && (
                  <Descriptions.Item label="Submission Status">
                    {viewingTask.is_submission_checked ? (
                      <Tag color="green" icon={<CheckCircleOutlined />}>
                        Reviewed by admin
                      </Tag>
                    ) : (
                      <Tag color="orange" icon={<ClockCircleOutlined />}>
                        Pending admin review
                      </Tag>
                    )}
                  </Descriptions.Item>
                )}
                {viewingTask.submission_file_path && (
                  <Descriptions.Item label="Submission Date">
                    {viewingTask.submission_date
                      ? dayjs(viewingTask.submission_date).format(
                          "YYYY-MM-DD HH:mm:ss"
                        )
                      : "Not recorded"}
                  </Descriptions.Item>
                )}
              </Descriptions>

              {viewingTask.image_path && (
                <div style={{ marginTop: "20px" }}>
                  <Text strong>Task Image:</Text>
                  <div style={{ marginTop: "10px" }}>
                    {getFullImageUrl(viewingTask.image_path) ? (
                      <Image
                        src={getFullImageUrl(viewingTask.image_path)}
                        alt={viewingTask.task_name}
                        style={{ maxWidth: "100%" }}
                        fallback={
                          <FileImageOutlined
                            style={{ fontSize: 64, color: "#d9d9d9" }}
                          />
                        }
                      />
                    ) : (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "20px",
                          background: "#f5f5f5",
                          borderRadius: "4px",
                        }}
                      >
                        <FileImageOutlined
                          style={{ fontSize: 64, color: "#d9d9d9" }}
                        />
                        <div style={{ marginTop: "8px", color: "#8c8c8c" }}>
                          No image available
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {viewingTask.submission_file_path && (
                <div style={{ marginTop: "20px" }}>
                  <Text strong>Your Submission:</Text>
                  <div style={{ marginTop: "10px" }}>
                    <p>
                      <a
                        href={getFullImageUrl(viewingTask.submission_file_path)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download your submitted file
                      </a>
                    </p>
                    {!viewingTask.is_submission_checked && (
                      <Text type="warning">
                        Your submission is pending review by an admin.
                      </Text>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>
        ) : (
          <Skeleton active paragraph={{ rows: 6 }} />
        )}
      </Modal>

      {/* Task Submission Modal */}
      <Modal
        title={`Submit Work for: ${viewingTask?.task_name}`}
        open={isSubmitModalVisible}
        onCancel={handleSubmitCancel}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitWork}>
          <div style={{ marginBottom: "20px" }}>
            <Text>
              Please upload your completed work for this task. Accepted file
              formats include PDF, Word documents, images, or ZIP files.
            </Text>
          </div>

          <Form.Item
            name="submission_file"
            label="Upload your work"
            rules={[{ required: true, message: "Please upload a file" }]}
          >
            <Upload
              listType="text"
              maxCount={1}
              beforeUpload={() => false} // Prevent auto upload
              fileList={fileList}
              onRemove={() => setFileList([])}
              onChange={({ fileList }) => setFileList(fileList)}
            >
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>

          <div style={{ marginTop: "24px", textAlign: "right" }}>
            <Space>
              <Button onClick={handleSubmitCancel}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                disabled={fileList.length === 0}
              >
                Submit Work
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
