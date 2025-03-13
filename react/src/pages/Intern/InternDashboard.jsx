import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../axios.client";
import { useStateContext } from "../../context/ContextProvider";
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Tag,
  Button,
  Skeleton,
  Space,
  Tooltip,
  Badge,
  Tabs,
  Upload,
  Modal,
  Form,
  Input,
  message,
  Empty,
  Alert,
} from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  InboxOutlined,
  EditOutlined,
  EyeOutlined,
  UploadOutlined,
  LoadingOutlined,
  FileOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { TabPane } = Tabs;
const { Dragger } = Upload;
const { TextArea } = Input;

const InternDashboard = () => {
  const { user } = useStateContext();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
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

  // Theme colors
  const colors = {
    primary: "#1da57a", // Primary green
    secondary: "#52c41a", // Secondary lighter green
    warning: "#faad14",
    success: "#52c41a",
    error: "#f5222d",
    lightBg: "#f6ffed", // Light green background
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch user profile data
        const profileResponse = await axiosClient.get("/user");
        setProfileData(profileResponse.data);

        // Fetch tasks assigned to the intern
        const tasksResponse = await axiosClient.get("/intern/tasks");

        // Check the structure of the response and extract the array properly
        console.log("Tasks response:", tasksResponse.data); // Debug log

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

        // Calculate stats - only if taskData is properly initialized as an array
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

  // Get file icon based on file type
  const getFileIcon = (fileName) => {
    if (!fileName) return <FileOutlined />;

    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FileImageOutlined style={{ color: colors.primary }} />;
      case "pdf":
        return <FilePdfOutlined style={{ color: "#ff4d4f" }} />;
      case "doc":
      case "docx":
        return <FileWordOutlined style={{ color: "#1890ff" }} />;
      case "xls":
      case "xlsx":
        return <FileExcelOutlined style={{ color: "#52c41a" }} />;
      default:
        return <FileOutlined />;
    }
  };

  // Format full name
  const getFullName = () => {
    if (!profileData) return "User";

    let fullName = profileData.first_name || "";
    if (profileData.middle_initial)
      fullName += ` ${profileData.middle_initial}.`;
    if (profileData.last_name) fullName += ` ${profileData.last_name}`;

    return fullName || "User";
  };

  // Generate random colors for avatar based on user ID or name
  const getRandomAvatarColors = () => {
    if (!profileData) return "linear-gradient(to right, #1da57a, #52c41a)";

    // Use user ID or name as seed for consistent colors for the same user
    const seed = profileData.id || getFullName() || "default";
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate 2 colors for gradient
    const color1 = `hsl(${hash % 360}, 70%, 60%)`;
    const color2 = `hsl(${(hash + 40) % 360}, 70%, 50%)`;

    return `linear-gradient(to right, ${color1}, ${color2})`;
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!profileData) return "U";

    let initials = profileData.first_name ? profileData.first_name[0] : "";
    if (profileData.last_name) initials += profileData.last_name[0];

    return initials.toUpperCase() || "U";
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

  // Active tasks columns
  const taskColumns = [
    {
      title: "Task Name",
      dataIndex: "task_name",
      key: "task_name",
      render: (text, record) => (
        <div>
          <div>{text}</div>
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
    {
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
    },
  ];

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
          <Col xs={24} lg={6}>
            <Card>
              <Skeleton avatar active paragraph={{ rows: 2 }} />
            </Card>
          </Col>
          <Col xs={24} sm={8} lg={6}>
            <Card>
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          </Col>
          <Col xs={24} sm={8} lg={6}>
            <Card>
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          </Col>
          <Col xs={24} sm={8} lg={6}>
            <Card>
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          </Col>
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

  // Calculate completion percentage
  const completionPercentage =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="intern-dashboard" style={{ padding: "20px" }}>
      {/* Profile and Stats Section */}
      <Row gutter={[16, 16]}>
        {/* Profile Card */}
        <Col xs={24} lg={6}>
          <Card style={{ overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: getRandomAvatarColors(),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "24px",
                  fontWeight: "bold",
                  marginRight: "16px",
                }}
              >
                {getUserInitials()}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px" }}>{getFullName()}</h3>
                <p style={{ margin: 0, color: "#888" }}>
                  {profileData?.role
                    ? profileData.role.charAt(0).toUpperCase() +
                      profileData.role.slice(1)
                    : "Intern"}
                </p>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "12px",
                    color: "#888",
                  }}
                >
                  {profileData?.email}
                </p>
              </div>
            </div>
            <div style={{ marginTop: "16px" }}>
              <Link to="/intern/profile">
                <Button
                  type="primary"
                  ghost
                  icon={<EditOutlined />}
                  style={{ width: "100%" }}
                >
                  View Profile
                </Button>
              </Link>
            </div>
          </Card>
        </Col>

        {/* Task Completion Card */}
        <Col xs={24} sm={8} lg={6}>
          <Card>
            <Statistic
              title="Task Completion"
              value={completionPercentage}
              suffix="%"
              valueStyle={{
                color: colors.primary,
              }}
            />
            <Progress
              percent={completionPercentage}
              strokeColor={colors.primary}
              size="small"
              style={{ marginTop: "8px" }}
            />
            <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#888" }}>
              {stats.completed} of {stats.total} tasks completed
            </p>
          </Card>
        </Col>

        {/* Pending Tasks Card */}
        <Col xs={24} sm={8} lg={6}>
          <Card>
            <Statistic
              title="Pending Tasks"
              value={stats.pending}
              valueStyle={{
                color: colors.warning,
              }}
              prefix={<ClockCircleOutlined />}
            />
            {stats.upcomingDue > 0 && (
              <p
                style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#888" }}
              >
                <Badge color={colors.warning} />
                {stats.upcomingDue} {stats.upcomingDue === 1 ? "task" : "tasks"}{" "}
                due in the next 3 days
              </p>
            )}
          </Card>
        </Col>

        {/* Completed Tasks Card */}
        <Col xs={24} sm={8} lg={6}>
          <Card>
            <Statistic
              title="Completed Tasks"
              value={stats.completed}
              valueStyle={{
                color: colors.success,
              }}
              prefix={<CheckCircleOutlined />}
            />
            <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#888" }}>
              Great job keeping up with your tasks!
            </p>
          </Card>
        </Col>
      </Row>

      {/* Tasks Section */}
      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
        <Col span={24}>
          <Card title="My Tasks">
            <Tabs defaultActiveKey="active">
              <TabPane
                tab={
                  <span>
                    <ClockCircleOutlined />
                    Active Tasks
                  </span>
                }
                key="active"
              >
                <Table
                  columns={taskColumns}
                  dataSource={tasks.filter((task) => task.status === "pending")}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No active tasks at the moment"
                      />
                    ),
                  }}
                />
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <CheckCircleOutlined />
                    Completed Tasks
                  </span>
                }
                key="completed"
              >
                <Table
                  columns={taskColumns}
                  dataSource={tasks.filter(
                    (task) => task.status === "completed"
                  )}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No completed tasks yet"
                      />
                    ),
                  }}
                />
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <FileTextOutlined />
                    All Tasks
                  </span>
                }
                key="all"
              >
                <Table
                  columns={taskColumns}
                  dataSource={tasks}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No tasks assigned yet"
                      />
                    ),
                  }}
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
        width={700}
      >
        {taskDetails && (
          <div>
            <Card bordered={false} style={{ marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: colors.primary }}>
                {taskDetails.task_name}
              </h3>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 8,
                }}
              >
                <div>
                  <p>
                    <strong>Status:</strong>{" "}
                    {renderTaskStatus(taskDetails.status)}
                  </p>
                  {taskDetails.due_date && (
                    <p>
                      <strong>Due Date:</strong>{" "}
                      {dayjs(taskDetails.due_date).format("MMMM D, YYYY")}
                      {dayjs().isAfter(dayjs(taskDetails.due_date)) &&
                        taskDetails.status === "pending" && (
                          <Tag color="error" style={{ marginLeft: 8 }}>
                            Overdue
                          </Tag>
                        )}
                    </p>
                  )}
                </div>
                <div>
                  <p>
                    <strong>Submission:</strong>{" "}
                    {renderSubmissionStatus(taskDetails)}
                  </p>
                  {taskDetails.submission_date && (
                    <p>
                      <strong>Submitted:</strong>{" "}
                      {dayjs(taskDetails.submission_date).format(
                        "MMMM D, YYYY"
                      )}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            <Card
              title="Task Description"
              bordered={false}
              style={{ marginBottom: 16 }}
            >
              <div style={{ whiteSpace: "pre-wrap" }}>
                {taskDetails.description || "No description provided."}
              </div>
            </Card>

            <Card
              title="Instructions"
              bordered={false}
              style={{ marginBottom: 16 }}
            >
              <div style={{ whiteSpace: "pre-wrap" }}>
                {taskDetails.instructions ||
                  "No specific instructions provided."}
              </div>
            </Card>

            {taskDetails.submission_file_path && (
              <Card title="Your Submission" bordered={false}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  {getFileIcon(taskDetails.submission_file_path)}
                  <a
                    href={taskDetails.submission_file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginLeft: 8 }}
                  >
                    {taskDetails.submission_file_path.split("/").pop() ||
                      "Download Submission"}
                  </a>
                </div>
                {taskDetails.submission_comments && (
                  <div style={{ marginTop: 16 }}>
                    <strong>Your Comment:</strong>
                    <div style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>
                      {taskDetails.submission_comments}
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InternDashboard;
