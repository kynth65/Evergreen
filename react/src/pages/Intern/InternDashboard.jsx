import React, { useState, useEffect } from "react";
import axiosClient from "../../axios.client";
import { useStateContext } from "../../context/ContextProvider";
import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Button,
  Skeleton,
  Space,
  Tooltip,
  Tabs,
  Upload,
  Modal,
  Form,
  Input,
  message,
  Empty,
  Alert,
  Typography,
} from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  CalendarOutlined,
  InboxOutlined,
  EyeOutlined,
  UploadOutlined,
  FileImageOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// Import the StatsCards component
import StatsCards from "../../components/Dashboard/StatsCards";
import TaskDetails from "../../components/Dashboard/TaskDetails";

dayjs.extend(relativeTime);

const { TabPane } = Tabs;
const { Dragger } = Upload;
const { TextArea } = Input;
const { Title } = Typography;

const InternDashboard = () => {
  const { user } = useStateContext();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    completed: 0,
    total: 0,
    upcomingDue: 0,
  });
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();
  const [screenSize, setScreenSize] = useState(window.innerWidth);

  // Base URL for the application
  const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;

  // Theme colors
  const colors = {
    primary: "#1da57a", // Primary green
    secondary: "#52c41a", // Secondary lighter green
    warning: "#faad14",
    success: "#52c41a",
    error: "#f5222d",
    lightBg: "#f6ffed", // Light green background
  };

  // Update screen size on window resize
  useEffect(() => {
    const handleResize = () => {
      setScreenSize(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch tasks assigned to the intern
        const tasksResponse = await axiosClient.get("/intern/tasks");

        // Handle different response structures
        let taskData = [];
        if (Array.isArray(tasksResponse.data)) {
          taskData = tasksResponse.data;
        } else if (
          tasksResponse.data &&
          Array.isArray(tasksResponse.data.data)
        ) {
          taskData = tasksResponse.data.data;
        } else if (
          tasksResponse.data &&
          tasksResponse.data.data &&
          Array.isArray(tasksResponse.data.data.data)
        ) {
          taskData = tasksResponse.data.data.data;
        } else {
          console.error("Unexpected task data structure:", tasksResponse.data);
          taskData = []; // Fallback to empty array if structure is unexpected
        }

        setTasks(taskData);

        // Calculate stats
        const pendingCount = taskData.filter(
          (task) => task.status === "pending"
        ).length;
        const completedCount = taskData.filter(
          (task) => task.status === "completed"
        ).length;
        const upcomingDueCount = taskData.filter((task) => {
          if (!task.due_date || task.status !== "pending") return false;
          const dueDate = dayjs(task.due_date);
          const today = dayjs();
          return (
            dueDate.diff(today, "day") <= 3 && dueDate.diff(today, "day") >= 0
          );
        }).length;

        setStats({
          pending: pendingCount,
          completed: completedCount,
          total: taskData.length,
          upcomingDue: upcomingDueCount,
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          "Failed to load dashboard data. Please try refreshing the page."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const showUploadModal = (task) => {
    setSelectedTask(task);
    setSubmissionFile(null);
    setComment("");
    setIsUploadModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsUploadModalVisible(false);
    setSelectedTask(null);
    setSubmissionFile(null);
    setComment("");
  };

  const beforeUpload = (file) => {
    // Prevent auto upload and just set the file
    setSubmissionFile(file);
    return false;
  };

  const handleSubmitTask = async () => {
    if (!submissionFile) {
      message.error("Please select a file to upload");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("submission_file", submissionFile);

    // Make sure to use "comments" field name to match backend controller
    if (comment) {
      formData.append("comments", comment);
    }

    try {
      await axiosClient.post(
        `/intern/tasks/${selectedTask.id}/submit`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      message.success("Task submitted successfully");
      setIsUploadModalVisible(false);

      // Refresh tasks to show updated status
      const tasksResponse = await axiosClient.get("/intern/tasks");

      // Extract task data safely
      let taskData = [];
      if (Array.isArray(tasksResponse.data)) {
        taskData = tasksResponse.data;
      } else if (tasksResponse.data && Array.isArray(tasksResponse.data.data)) {
        taskData = tasksResponse.data.data;
      } else if (
        tasksResponse.data &&
        tasksResponse.data.data &&
        Array.isArray(tasksResponse.data.data.data)
      ) {
        taskData = tasksResponse.data.data.data;
      }

      setTasks(taskData);

      // Update stats
      const pendingCount = taskData.filter(
        (task) => task.status === "pending"
      ).length;
      const completedCount = taskData.filter(
        (task) => task.status === "completed"
      ).length;
      setStats({
        ...stats,
        pending: pendingCount,
        completed: completedCount,
        total: taskData.length,
      });
    } catch (err) {
      console.error("Error submitting task:", err);
      message.error(
        "Failed to submit task: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to get full image URL
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

  // Render task status badge
  const renderTaskStatus = (status) => {
    switch (status) {
      case "completed":
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Completed
          </Tag>
        );
      case "pending":
        return (
          <Tag color="processing" icon={<ClockCircleOutlined />}>
            Pending
          </Tag>
        );
      case "failed":
        return <Tag color="error">Failed</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  // Render submission status
  const renderSubmissionStatus = (task) => {
    if (!task.submission_file_path) {
      return <Tag>Not Submitted</Tag>;
    }

    if (task.is_submission_checked) {
      return (
        <Tag color="success" icon={<CheckCircleOutlined />}>
          Reviewed
        </Tag>
      );
    }

    return <Tag color="warning">Pending Review</Tag>;
  };

  // Define responsive columns for different screen sizes
  const getTaskColumns = () => {
    // Base columns for all screen sizes
    const baseColumns = [
      {
        title: "Task Name",
        dataIndex: "task_name",
        key: "task_name",
        render: (text, record) => (
          <div>
            <div style={{ fontWeight: "500" }}>{text}</div>
            <small style={{ color: "#888" }}>
              {record.due_date && (
                <>
                  <CalendarOutlined style={{ marginRight: 5 }} />
                  Due: {dayjs(record.due_date).format("MMM D, YYYY")}
                  {dayjs().isAfter(dayjs(record.due_date)) &&
                    record.status === "pending" && (
                      <Tag color="error" style={{ marginLeft: 5 }}>
                        Overdue
                      </Tag>
                    )}
                </>
              )}
            </small>
          </div>
        ),
        ellipsis: screenSize < 768,
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status) => renderTaskStatus(status),
      },
      {
        title: "Submission",
        key: "submission",
        render: (_, record) => renderSubmissionStatus(record),
      },
    ];

    // Only add actions column on larger screens or merge with compact view on small screens
    if (screenSize >= 576) {
      baseColumns.push({
        title: "Actions",
        key: "actions",
        render: (_, record) => (
          <Space>
            <Tooltip title="View Details">
              <Button
                type="primary"
                size="small"
                ghost
                icon={<EyeOutlined />}
                onClick={() => showTaskDetails(record)}
              />
            </Tooltip>
            {record.status === "pending" && (
              <Tooltip title="Submit Task">
                <Button
                  type="primary"
                  size="small"
                  icon={<UploadOutlined />}
                  onClick={() => showUploadModal(record)}
                />
              </Tooltip>
            )}
          </Space>
        ),
      });
    } else {
      // For very small screens, add a single actions column with a dropdown menu
      baseColumns.push({
        title: "",
        key: "compact-actions",
        width: 48,
        render: (_, record) => (
          <Button
            type="text"
            icon={<MoreOutlined />}
            onClick={() => showTaskDetails(record)}
          />
        ),
      });
    }

    return baseColumns;
  };

  // Show task details modal
  const [isTaskDetailsVisible, setIsTaskDetailsVisible] = useState(false);
  const [taskDetails, setTaskDetails] = useState(null);

  const showTaskDetails = (task) => {
    setTaskDetails(task);
    setIsTaskDetailsVisible(true);
  };

  const closeTaskDetails = () => {
    setIsTaskDetailsVisible(false);
    setTaskDetails(null);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="intern-dashboard" style={{ padding: "20px" }}>
        <Row gutter={[16, 16]}>
          {/* Skeleton for stats cards */}
          <Col xs={24} md={8}>
            <Card>
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          </Col>

          {/* Skeleton for tasks */}
          <Col span={24}>
            <Card>
              <Skeleton active paragraph={{ rows: 6 }} />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div className="intern-dashboard" style={{ padding: "16px" }}>
      {/* Stats Cards Section (without profile card) */}
      <Row gutter={[16, 16]}>
        <StatsCards stats={stats} />
      </Row>

      {/* Tasks Section */}
      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
        <Col span={24}>
          <Card
            title={
              <Title
                level={4}
                style={{
                  margin: 0,
                  fontSize: screenSize < 576 ? "16px" : "18px",
                }}
              >
                My Tasks
              </Title>
            }
            className="task-card"
            bodyStyle={{ padding: screenSize < 576 ? "12px" : "24px" }}
          >
            <Tabs
              defaultActiveKey="active"
              size={screenSize < 576 ? "small" : "middle"}
              tabBarStyle={{ marginBottom: "16px" }}
            >
              <TabPane
                tab={
                  <span>
                    <ClockCircleOutlined />
                    {screenSize > 480 && " Active Tasks"}
                  </span>
                }
                key="active"
              >
                <Table
                  columns={getTaskColumns()}
                  dataSource={tasks.filter((task) => task.status === "pending")}
                  rowKey="id"
                  pagination={{
                    pageSize: 5,
                    size: screenSize < 576 ? "small" : "default",
                    hideOnSinglePage: true,
                  }}
                  size={screenSize < 576 ? "small" : "middle"}
                  scroll={{ x: screenSize < 768 ? true : undefined }}
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No active tasks at the moment"
                      />
                    ),
                  }}
                  onRow={(record) => ({
                    onClick: () => {
                      if (screenSize < 576) {
                        showTaskDetails(record);
                      }
                    },
                    style: { cursor: screenSize < 576 ? "pointer" : "default" },
                  })}
                />
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <CheckCircleOutlined />
                    {screenSize > 480 && " Completed"}
                  </span>
                }
                key="completed"
              >
                <Table
                  columns={getTaskColumns()}
                  dataSource={tasks.filter(
                    (task) => task.status === "completed"
                  )}
                  rowKey="id"
                  pagination={{
                    pageSize: 5,
                    size: screenSize < 576 ? "small" : "default",
                    hideOnSinglePage: true,
                  }}
                  size={screenSize < 576 ? "small" : "middle"}
                  scroll={{ x: screenSize < 768 ? true : undefined }}
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No completed tasks yet"
                      />
                    ),
                  }}
                  onRow={(record) => ({
                    onClick: () => {
                      if (screenSize < 576) {
                        showTaskDetails(record);
                      }
                    },
                    style: { cursor: screenSize < 576 ? "pointer" : "default" },
                  })}
                />
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <FileTextOutlined />
                    {screenSize > 480 && " All Tasks"}
                  </span>
                }
                key="all"
              >
                <Table
                  columns={getTaskColumns()}
                  dataSource={tasks}
                  rowKey="id"
                  pagination={{
                    pageSize: 5,
                    size: screenSize < 576 ? "small" : "default",
                    hideOnSinglePage: true,
                  }}
                  size={screenSize < 576 ? "small" : "middle"}
                  scroll={{ x: screenSize < 768 ? true : undefined }}
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No tasks assigned yet"
                      />
                    ),
                  }}
                  onRow={(record) => ({
                    onClick: () => {
                      if (screenSize < 576) {
                        showTaskDetails(record);
                      }
                    },
                    style: { cursor: screenSize < 576 ? "pointer" : "default" },
                  })}
                />
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* Upload Modal */}
      <Modal
        title="Submit Task"
        open={isUploadModalVisible}
        onCancel={handleModalCancel}
        centered
        width={screenSize < 576 ? "95%" : 520}
        footer={[
          <Button key="cancel" onClick={handleModalCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleSubmitTask}
            loading={submitting}
            disabled={!submissionFile}
          >
            Submit
          </Button>,
        ]}
      >
        {selectedTask && (
          <div>
            <p>
              <strong>Task:</strong> {selectedTask.task_name}
            </p>
            {selectedTask.due_date && (
              <p>
                <strong>Due Date:</strong>{" "}
                {dayjs(selectedTask.due_date).format("MMMM D, YYYY")}
                {dayjs().isAfter(dayjs(selectedTask.due_date)) && (
                  <Tag color="error" style={{ marginLeft: 8 }}>
                    Overdue
                  </Tag>
                )}
              </p>
            )}

            <Dragger
              name="file"
              multiple={false}
              beforeUpload={beforeUpload}
              onRemove={() => setSubmissionFile(null)}
              fileList={submissionFile ? [submissionFile] : []}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
              <p className="ant-upload-hint">
                Supported file types: PDF, Word, Excel, Images
              </p>
            </Dragger>

            <div style={{ marginTop: 16 }}>
              <p>
                <strong>Additional Comment (Optional):</strong>
              </p>
              <TextArea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add any notes or comments about your submission..."
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Task Details Modal */}
      <Modal
        title="Task Details"
        open={isTaskDetailsVisible}
        onCancel={closeTaskDetails}
        centered
        width={screenSize < 576 ? "95%" : 700}
        footer={[
          <Button key="close" onClick={closeTaskDetails}>
            Close
          </Button>,
          taskDetails && taskDetails.status === "pending" && (
            <Button
              key="submit"
              type="primary"
              onClick={() => {
                closeTaskDetails();
                showUploadModal(taskDetails);
              }}
            >
              Submit Task
            </Button>
          ),
        ]}
      >
        {taskDetails && (
          <TaskDetails
            taskDetails={taskDetails}
            colors={colors}
            baseUrl={baseUrl}
            noImageFallback={
              <FileImageOutlined
                style={{ fontSize: 48, color: colors.primary }}
              />
            }
          />
        )}
      </Modal>
    </div>
  );
};

export default InternDashboard;
