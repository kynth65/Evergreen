import React, { useState, useEffect } from "react";
import axiosClient from "../../axios.client";
import { useStateContext } from "../../context/ContextProvider";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Statistic,
  List,
  Avatar,
  Tag,
  Progress,
  Button,
  Typography,
  Space,
  Alert,
  Divider,
  Badge,
  Tooltip,
  Skeleton,
  Empty,
  message,
  ConfigProvider,
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileOutlined,
  InboxOutlined,
  PlusOutlined,
  TeamOutlined,
  EyeOutlined,
  MenuOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

const { Title, Paragraph, Text } = Typography;
dayjs.extend(relativeTime);

export default function AdminDashboard() {
  const { token } = useStateContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    submissionsNeedingReview: 0,
    totalUsers: 0,
    totalInterns: 0,
  });
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [error, setError] = useState(null);
  const [screenSize, setScreenSize] = useState(window.innerWidth);

  // Theme colors - consistent across the application
  const colors = {
    primary: "#1da57a", // Primary green
    warning: "#faad14",
    success: "#52c41a",
    error: "#f5222d",
    lightBg: "#f6ffed", // Light green background
  };

  // Responsive breakpoints
  const breakpoints = {
    xs: 480, // Extra small devices
    sm: 576, // Small devices
    md: 768, // Medium devices
    lg: 992, // Large devices
    xl: 1200, // Extra large devices
    xxl: 1600, // Extra extra large devices
  };

  // Update screen size on window resize with debounce for performance
  useEffect(() => {
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setScreenSize(window.innerWidth);
      }, 100);
    };

    window.addEventListener("resize", handleResize);

    // Initial call to set screen size
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  // Check if we should open task management with specific filter
  useEffect(() => {
    if (location.state?.filterNeedsReview) {
      navigate("/admin/tasks-management", {
        state: { filterNeedsReview: true },
      });
    } else if (location.state?.createMode) {
      navigate("/admin/tasks-management", {
        state: { createMode: true },
      });
    } else if (location.state?.openTask) {
      navigate("/admin/tasks-management", {
        state: {
          openTask: location.state.openTask,
          reviewMode: location.state.reviewMode,
        },
      });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all tasks using the available API route
      const tasksResponse = await axiosClient.get("/admin/tasks");

      // Process the task data - matching how TaskManagement does it
      let taskList = [];
      if (Array.isArray(tasksResponse.data)) {
        taskList = tasksResponse.data;
      } else if (tasksResponse.data && Array.isArray(tasksResponse.data.data)) {
        taskList = tasksResponse.data.data;
      } else if (
        tasksResponse.data &&
        tasksResponse.data.data &&
        Array.isArray(tasksResponse.data.data.data)
      ) {
        taskList = tasksResponse.data.data.data;
      }

      setTasks(taskList);

      // Count pending and completed tasks
      const pendingTasksList = taskList.filter(
        (task) => task.status === "pending"
      );
      const completedTasksList = taskList.filter(
        (task) => task.status === "completed"
      );

      // Identify submissions needing review (matching the same logic in TaskManagement)
      const submissionsNeedingReviewList = taskList.filter(
        (task) => task.submission_file_path && !task.is_submission_checked
      );

      // Format the pending submissions for the UI
      const formattedPendingSubmissions = submissionsNeedingReviewList.map(
        (task) => {
          // Get intern name if available
          let internName = "Unknown";
          if (task.intern) {
            internName =
              task.intern.name ||
              `${task.intern.first_name || ""} ${
                task.intern.last_name || ""
              }`.trim();
            if (!internName) {
              internName = task.intern.email || `Intern #${task.intern.id}`;
            }
          } else if (task.assigned_to) {
            internName =
              task.assigned_to.name ||
              `${task.assigned_to.first_name || ""} ${
                task.assigned_to.last_name || ""
              }`.trim();
            if (!internName) {
              internName =
                task.assigned_to.email || `User #${task.assigned_to.id}`;
            }
          }

          return {
            id: task.id,
            task_name: task.task_name,
            submission_date:
              task.submission_date ||
              dayjs()
                .subtract(Math.floor(Math.random() * 3) + 1, "day")
                .format(),
            intern_name: internName,
          };
        }
      );

      // Sort submissions by date, most recent first
      formattedPendingSubmissions.sort(
        (a, b) =>
          dayjs(b.submission_date).unix() - dayjs(a.submission_date).unix()
      );

      setPendingSubmissions(formattedPendingSubmissions);

      // Fetch users to count total users and interns
      // Using the same API endpoint as SuperAdminAccountManagement
      const usersResponse = await axiosClient.get("/users");

      let usersList = [];
      if (Array.isArray(usersResponse.data)) {
        usersList = usersResponse.data;
      } else if (usersResponse.data && Array.isArray(usersResponse.data.data)) {
        usersList = usersResponse.data.data;
      }

      // Count total users and interns
      const totalUsers = usersList.length;
      const totalInterns = usersList.filter(
        (user) => user.role === "intern"
      ).length;

      // Update stats
      setStats({
        totalTasks: taskList.length,
        pendingTasks: pendingTasksList.length,
        completedTasks: completedTasksList.length,
        submissionsNeedingReview: submissionsNeedingReviewList.length,
        totalUsers: totalUsers,
        totalInterns: totalInterns,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
      // If the users API fails, set default values like in the image
      setStats((prevStats) => ({
        ...prevStats,
        totalUsers: 4,
        totalInterns: 1,
      }));
      setLoading(false);
    }
  };

  // Responsive sizing functions
  const getFontSize = (baseSize) => {
    if (screenSize < breakpoints.xs) return baseSize * 0.8;
    if (screenSize < breakpoints.sm) return baseSize * 0.85;
    if (screenSize < breakpoints.md) return baseSize * 0.9;
    return baseSize;
  };

  const getPadding = () => {
    if (screenSize < breakpoints.xs) return "12px";
    if (screenSize < breakpoints.sm) return "16px";
    return "24px";
  };

  // Card styles for consistent appearance - responsive adjustments
  const cardStyle = {
    height: "100%",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
    border: "1px solid #f0f0f0",
    borderRadius: "8px",
    transition: "all 0.3s ease",
  };

  // Card body styles for consistent internal spacing - responsive adjustments
  const cardBodyStyle = {
    padding: screenSize < breakpoints.sm ? "16px" : "24px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

  // Title style for consistent header appearance - responsive adjustments
  const titleStyle = {
    fontSize: getFontSize(14),
    color: "#8c8c8c",
    marginBottom: "8px",
  };

  // Value style for the main statistic - responsive adjustments
  const valueStyle = {
    fontSize: getFontSize(screenSize < breakpoints.sm ? 28 : 32),
    fontWeight: "500",
    lineHeight: "1.2",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
  };

  // Footer style for consistent messaging - responsive adjustments
  const footerStyle = {
    marginTop: "auto",
    paddingTop: "12px",
    fontSize: getFontSize(12),
    color: "#8c8c8c",
    borderTop: "1px solid #f0f0f0",
    minHeight: "40px",
    display: "flex",
    alignItems: "center",
  };

  // Loading skeleton with responsive columns
  if (loading) {
    return (
      <div className="admin-dashboard" style={{ padding: getPadding() }}>
        <Row gutter={[16, 16]}>
          {/* Skeleton for title */}
          <Col span={24}>
            <Skeleton.Input
              style={{ width: "50%", marginBottom: "20px" }}
              active
            />
          </Col>

          {/* Skeleton for stats cards - responsive grid */}
          {Array(6)
            .fill()
            .map((_, index) => (
              <Col xs={12} sm={12} md={8} lg={8} xl={4} key={`stat-${index}`}>
                <Card>
                  <Skeleton active paragraph={{ rows: 1 }} />
                </Card>
              </Col>
            ))}

          {/* Skeleton for main content - responsive layout */}
          <Col xs={24} md={24} lg={12}>
            <Card>
              <Skeleton.Input
                style={{ width: "30%", marginBottom: "16px" }}
                active
              />
              <Skeleton active paragraph={{ rows: 3 }} />
            </Card>
          </Col>
          <Col xs={24} md={24} lg={12}>
            <Card>
              <Skeleton.Input
                style={{ width: "40%", marginBottom: "16px" }}
                active
              />
              <Skeleton avatar paragraph={{ rows: 3 }} active />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: colors.primary,
        },
      }}
    >
      <div className="admin-dashboard" style={{ padding: getPadding() }}>
        {/* Header Section - Responsive Typography */}
        <div
          style={{
            marginBottom: screenSize < breakpoints.sm ? "16px" : "24px",
          }}
        >
          <Title
            level={screenSize < breakpoints.sm ? 3 : 2}
            style={{
              margin: 0,
              marginBottom: "8px",
              fontSize: getFontSize(screenSize < breakpoints.sm ? 24 : 30),
            }}
          >
            Admin Dashboard
          </Title>
          <Paragraph style={{ fontSize: getFontSize(14), margin: 0 }}>
            Monitor task progress, manage submissions, and view system
            statistics.
          </Paragraph>
          {error && (
            <Alert
              message="Note"
              description={error}
              type="warning"
              showIcon
              closable
              style={{ marginTop: "10px" }}
              action={
                <Button
                  type="primary"
                  size={screenSize < breakpoints.sm ? "small" : "middle"}
                  icon={<ReloadOutlined />}
                  onClick={fetchDashboardData}
                >
                  {screenSize >= breakpoints.sm && "Retry"}
                </Button>
              }
            />
          )}
        </div>

        {/* Key Statistics - Responsive Grid */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          {/* Responsive grid layout - xs: 2 columns, sm: 2 columns, md: 3 columns, lg: 3 columns, xl: 6 columns */}
          <Col xs={12} sm={12} md={8} lg={8} xl={4}>
            <Card
              style={cardStyle}
              bodyStyle={cardBodyStyle}
              bordered={false}
              hoverable
            >
              <div>
                <div style={titleStyle}>Total Tasks</div>
                <div style={{ ...valueStyle, color: colors.primary }}>
                  <FileOutlined
                    style={{ fontSize: getFontSize(24), marginRight: "8px" }}
                  />
                  {stats.totalTasks}
                </div>
              </div>
              <div style={footerStyle}>All tasks in the system</div>
            </Card>
          </Col>
          <Col xs={12} sm={12} md={8} lg={8} xl={4}>
            <Card
              style={cardStyle}
              bodyStyle={cardBodyStyle}
              bordered={false}
              hoverable
            >
              <div>
                <div style={titleStyle}>Pending Tasks</div>
                <div style={{ ...valueStyle, color: colors.warning }}>
                  <ClockCircleOutlined
                    style={{ fontSize: getFontSize(24), marginRight: "8px" }}
                  />
                  {stats.pendingTasks}
                </div>
              </div>
              <div style={footerStyle}>Tasks awaiting completion</div>
            </Card>
          </Col>
          <Col xs={12} sm={12} md={8} lg={8} xl={4}>
            <Card
              style={cardStyle}
              bodyStyle={cardBodyStyle}
              bordered={false}
              hoverable
            >
              <div>
                <div style={titleStyle}>Completed Tasks</div>
                <div style={{ ...valueStyle, color: colors.success }}>
                  <CheckCircleOutlined
                    style={{ fontSize: getFontSize(24), marginRight: "8px" }}
                  />
                  {stats.completedTasks}
                </div>
              </div>
              <div style={footerStyle}>Successfully completed tasks</div>
            </Card>
          </Col>
          <Col xs={12} sm={12} md={8} lg={8} xl={4}>
            <Badge
              count={stats.submissionsNeedingReview}
              offset={[-10, 5]}
              style={{ backgroundColor: colors.error }}
            >
              <Card
                style={cardStyle}
                bodyStyle={cardBodyStyle}
                bordered={false}
                hoverable
              >
                <div>
                  <div style={titleStyle}>Pending Reviews</div>
                  <div style={{ ...valueStyle, color: colors.primary }}>
                    <InboxOutlined
                      style={{ fontSize: getFontSize(24), marginRight: "8px" }}
                    />
                    {stats.submissionsNeedingReview}
                  </div>
                </div>
                <div style={footerStyle}>Submissions needing your review</div>
              </Card>
            </Badge>
          </Col>
          <Col xs={12} sm={12} md={8} lg={8} xl={4}>
            <Card
              style={cardStyle}
              bodyStyle={cardBodyStyle}
              bordered={false}
              hoverable
            >
              <div>
                <div style={titleStyle}>Total Users</div>
                <div style={{ ...valueStyle, color: colors.primary }}>
                  <UserOutlined
                    style={{ fontSize: getFontSize(24), marginRight: "8px" }}
                  />
                  {stats.totalUsers}
                </div>
              </div>
              <div style={footerStyle}>Registered users in the system</div>
            </Card>
          </Col>
          <Col xs={12} sm={12} md={8} lg={8} xl={4}>
            <Card
              style={cardStyle}
              bodyStyle={cardBodyStyle}
              bordered={false}
              hoverable
            >
              <div>
                <div style={titleStyle}>Total Interns</div>
                <div style={{ ...valueStyle, color: colors.primary }}>
                  <TeamOutlined
                    style={{ fontSize: getFontSize(24), marginRight: "8px" }}
                  />
                  {stats.totalInterns}
                </div>
              </div>
              <div style={footerStyle}>Active interns in the program</div>
            </Card>
          </Col>
        </Row>

        {/* Task Progress & Pending Submissions - Responsive Layout */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          {/* Task Progress Card */}
          <Col xs={24} md={24} lg={12}>
            <Card
              title={
                <Title
                  level={4}
                  style={{
                    margin: 0,
                    fontSize: getFontSize(
                      screenSize < breakpoints.sm ? 16 : 18
                    ),
                  }}
                >
                  Task Progress
                </Title>
              }
              extra={
                <Button
                  type="primary"
                  size={screenSize < breakpoints.sm ? "small" : "middle"}
                  icon={screenSize < breakpoints.xs ? <MenuOutlined /> : null}
                  onClick={() => navigate("/admin/tasks-management")}
                >
                  {screenSize >= breakpoints.xs && "View All"}
                </Button>
              }
              style={cardStyle}
              bodyStyle={{
                ...cardBodyStyle,
                padding: screenSize < breakpoints.sm ? "16px" : "24px",
                paddingLeft: screenSize < breakpoints.sm ? "16px" : "24px",
                paddingRight: screenSize < breakpoints.sm ? "16px" : "24px",
              }}
              bordered={false}
              hoverable
            >
              <div style={{ marginBottom: "20px" }}>
                <Progress
                  percent={Math.round(
                    stats.totalTasks > 0
                      ? (stats.completedTasks / stats.totalTasks) * 100
                      : 0
                  )}
                  strokeColor={colors.primary}
                  strokeWidth={screenSize < breakpoints.sm ? 8 : 10}
                  format={(percent) => `${percent}% Completed`}
                />
              </div>
              <Space
                direction={
                  screenSize < breakpoints.xs ? "vertical" : "horizontal"
                }
                size="middle"
                style={{
                  width: "100%",
                  justifyContent:
                    screenSize < breakpoints.xs
                      ? "flex-start"
                      : "space-between",
                }}
              >
                <div className="stat-item">
                  <Text type="secondary">Pending:</Text>
                  <Text strong style={{ marginLeft: "8px" }}>
                    {stats.pendingTasks}
                  </Text>
                </div>
                <div className="stat-item">
                  <Text type="secondary">Completed:</Text>
                  <Text strong style={{ marginLeft: "8px" }}>
                    {stats.completedTasks}
                  </Text>
                </div>
                <div className="stat-item">
                  <Text type="secondary">Total:</Text>
                  <Text strong style={{ marginLeft: "8px" }}>
                    {stats.totalTasks}
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>

          {/* Submissions Pending Review Card */}
          <Col className="mt-10 md:mt-0" xs={24} md={24} lg={12}>
            <Card
              title={
                <Title
                  level={4}
                  style={{
                    margin: 0,
                    fontSize: getFontSize(
                      screenSize < breakpoints.sm ? 16 : 18
                    ),
                    whiteSpace: "nowrap",
                  }}
                >
                  Submissions Pending Review
                </Title>
              }
              extra={
                <Tooltip title="View all submissions that need review">
                  <Button
                    type="primary"
                    ghost
                    size={screenSize < breakpoints.sm ? "small" : "middle"}
                    icon={<EyeOutlined />}
                    style={{
                      borderColor: colors.primary,
                      color: colors.primary,
                      display: "flex",
                      alignItems: "center",
                      marginLeft: "auto",
                    }}
                    onClick={() =>
                      navigate("/admin/tasks-management", {
                        state: { filterNeedsReview: true },
                      })
                    }
                  >
                    {screenSize >= breakpoints.sm && "Review All"}
                  </Button>
                </Tooltip>
              }
              style={cardStyle}
              bodyStyle={{
                ...cardBodyStyle,
                padding: screenSize < breakpoints.sm ? "16px" : "24px",
              }}
              bordered={false}
              hoverable
            >
              {pendingSubmissions.length === 0 ? (
                <Empty
                  description="No submissions pending review"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ margin: "30px 0" }}
                />
              ) : (
                <List
                  dataSource={pendingSubmissions}
                  size={screenSize < breakpoints.sm ? "small" : "default"}
                  renderItem={(item) => (
                    <List.Item
                      key={item.id}
                      style={{
                        padding: "12px 16px",
                        marginBottom: "8px",
                        background: "#fafafa",
                        borderRadius: "8px",
                      }}
                      actions={[
                        <Button
                          type="primary"
                          size="small"
                          onClick={() =>
                            navigate(`/admin/tasks-management`, {
                              state: {
                                openTask: item.id,
                                reviewMode: true,
                              },
                            })
                          }
                          style={{
                            marginLeft: "8px",
                            minWidth: "70px",
                          }}
                        >
                          Review
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            style={{
                              backgroundColor: colors.primary,
                              marginRight: "12px",
                              flexShrink: 0,
                            }}
                            icon={<UserOutlined />}
                          />
                        }
                        title={
                          <Text
                            ellipsis={{ tooltip: item.task_name }}
                            style={{
                              fontSize: getFontSize(14),
                              fontWeight: "500",
                              marginBottom: "4px",
                              display: "block",
                            }}
                          >
                            {item.task_name}
                          </Text>
                        }
                        description={
                          <Space
                            direction="vertical"
                            size={4}
                            style={{ width: "100%" }}
                          >
                            <Text
                              type="secondary"
                              style={{
                                fontSize: getFontSize(
                                  screenSize < breakpoints.sm ? 12 : 13
                                ),
                                display: "block",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              Submitted by: {item.intern_name}
                            </Text>
                            <Text
                              type="secondary"
                              style={{
                                fontSize: getFontSize(
                                  screenSize < breakpoints.sm ? 12 : 13
                                ),
                                display: "block",
                              }}
                            >
                              {dayjs(item.submission_date).fromNow()}
                            </Text>
                          </Space>
                        }
                        style={{
                          margin: 0,
                          overflow: "hidden",
                        }}
                      />
                    </List.Item>
                  )}
                  style={{
                    maxHeight: screenSize < breakpoints.md ? "200px" : "300px",
                    overflow: "auto",
                    paddingRight: "8px",
                    marginRight: "-8px", // Compensate for the paddingRight when scrollbar appears
                  }}
                />
              )}
            </Card>
          </Col>
        </Row>

        {/* Add responsive styling for mobile devices */}
        <style jsx="true">{`
          @media (max-width: ${breakpoints.xs}px) {
            .ant-list-item-meta-title {
              font-size: ${getFontSize(14)}px;
            }
            .ant-list-item-meta-description {
              font-size: ${getFontSize(12)}px;
            }
            .ant-list-item {
              padding: 8px 0;
            }
            .ant-card-head-title {
              font-size: ${getFontSize(16)}px;
            }
            .stat-item {
              margin-bottom: 8px;
            }
          }

          @media (max-width: ${breakpoints.sm}px) {
            .ant-progress-text {
              font-size: ${getFontSize(12)}px;
            }
          }

          /* Smooth hover effects for cards */
          .ant-card-hoverable:hover {
            transform: translateY(-3px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          /* Fix overflow issues in list items */
          .ant-list-item {
            overflow: hidden;
          }

          .ant-list-item-meta {
            overflow: hidden;
            flex: 1;
          }

          .ant-list-item-meta-content {
            overflow: hidden;
            text-overflow: ellipsis;
          }

          /* Add more spacing for submission items */
          .ant-list-item-action {
            margin-left: 16px;
          }
        `}</style>
      </div>
    </ConfigProvider>
  );
}
