import React, { useState, useEffect } from "react";
import axiosClient from "../../axios.client";
import { useStateContext } from "../../context/ContextProvider";
import { useNavigate } from "react-router-dom";
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
  Spin,
  Alert,
  Divider,
  Badge,
  Tooltip,
  Skeleton,
  Empty,
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileOutlined,
  InboxOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  TeamOutlined,
  RightOutlined,
  EyeOutlined,
  PlusOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

const { Title, Paragraph, Text } = Typography;
dayjs.extend(relativeTime);

export default function AdminDashboard() {
  const { token } = useStateContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalTasks: 0,
      pendingTasks: 0,
      completedTasks: 0,
      submissionsNeedingReview: 0,
      totalUsers: 0,
      totalInterns: 0,
    },
    recentTasks: [],
    pendingSubmissions: [],
  });
  const [error, setError] = useState(null);
  const [screenSize, setScreenSize] = useState(window.innerWidth);

  // Theme colors - same as intern dashboard
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
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API response
      setTimeout(() => {
        setDashboardData({
          stats: {
            totalTasks: 48,
            pendingTasks: 23,
            completedTasks: 25,
            submissionsNeedingReview: 7,
            totalUsers: 37,
            totalInterns: 21,
          },
          recentTasks: [
            {
              id: 1,
              task_name: "Database Migration Project",
              status: "pending",
              due_date: dayjs().add(2, "day").format("YYYY-MM-DD"),
              created_by: "Admin User",
              assigned_to: 5,
            },
            {
              id: 2,
              task_name: "Website Redesign",
              status: "completed",
              due_date: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
              created_by: "Content Manager",
              assigned_to: 8,
            },
            {
              id: 3,
              task_name: "API Documentation",
              status: "pending",
              due_date: dayjs().add(5, "day").format("YYYY-MM-DD"),
              created_by: "Admin User",
              assigned_to: 3,
            },
            {
              id: 4,
              task_name: "Security Audit",
              status: "pending",
              due_date: dayjs().add(1, "day").format("YYYY-MM-DD"),
              created_by: "System Admin",
              assigned_to: 2,
            },
            {
              id: 5,
              task_name: "Mobile App Testing",
              status: "completed",
              due_date: dayjs().subtract(2, "day").format("YYYY-MM-DD"),
              created_by: "QA Team",
              assigned_to: 6,
            },
          ],
          pendingSubmissions: [
            {
              id: 101,
              task_name: "Database Schema Design",
              submission_date: dayjs()
                .subtract(1, "day")
                .format("YYYY-MM-DD HH:mm:ss"),
              intern_name: "John Smith",
            },
            {
              id: 102,
              task_name: "User Interface Mockups",
              submission_date: dayjs()
                .subtract(2, "day")
                .format("YYYY-MM-DD HH:mm:ss"),
              intern_name: "Sarah Johnson",
            },
            {
              id: 103,
              task_name: "Customer Survey Analysis",
              submission_date: dayjs()
                .subtract(3, "hour")
                .format("YYYY-MM-DD HH:mm:ss"),
              intern_name: "David Lee",
            },
            {
              id: 104,
              task_name: "Content Migration Plan",
              submission_date: dayjs()
                .subtract(5, "hour")
                .format("YYYY-MM-DD HH:mm:ss"),
              intern_name: "Emily Chen",
            },
          ],
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again later.");
      setLoading(false);
    }
  };

  // Card styles for consistent appearance - same as intern dashboard
  const cardStyle = {
    height: "100%",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
    border: "1px solid #f0f0f0",
    borderRadius: "8px",
  };

  // Card body styles for consistent internal spacing
  const cardBodyStyle = {
    padding: screenSize < 576 ? "16px" : "24px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

  // Render status tag for tasks
  const renderStatusTag = (status) => {
    switch (status) {
      case "completed":
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            COMPLETED
          </Tag>
        );
      case "pending":
        return (
          <Tag color="processing" icon={<ClockCircleOutlined />}>
            PENDING
          </Tag>
        );
      case "failed":
        return (
          <Tag color="error" icon={<ExclamationCircleOutlined />}>
            FAILED
          </Tag>
        );
      default:
        return <Tag>{status ? status.toUpperCase() : "UNKNOWN"}</Tag>;
    }
  };

  // Loading skeleton - matches intern dashboard style
  if (loading) {
    return (
      <div className="admin-dashboard" style={{ padding: "20px" }}>
        <Row gutter={[16, 16]}>
          {/* Skeleton for stats cards */}
          <Col xs={24} sm={12} md={8} lg={8} xl={4}>
            <Card>
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={4}>
            <Card>
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={4}>
            <Card>
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={4}>
            <Card>
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={4}>
            <Card>
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={4}>
            <Card>
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          </Col>

          {/* Skeleton for main content */}
          <Col xs={24} lg={12}>
            <Card>
              <Skeleton active paragraph={{ rows: 3 }} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card>
              <Skeleton active avatar paragraph={{ rows: 3 }} />
            </Card>
          </Col>

          {/* Skeleton for tasks list */}
          <Col span={24}>
            <Card>
              <Skeleton active avatar paragraph={{ rows: 6 }} />
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
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={fetchDashboardData}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  const { stats, recentTasks, pendingSubmissions } = dashboardData;

  return (
    <div className="admin-dashboard" style={{ padding: "16px" }}>
      {/* Header Section */}
      <div style={{ marginBottom: screenSize < 576 ? "16px" : "24px" }}>
        <Title
          level={screenSize < 576 ? 3 : 2}
          style={{ margin: 0, marginBottom: "8px" }}
        >
          Admin Dashboard
        </Title>
        <Paragraph>
          Monitor task progress, manage submissions, and view system statistics.
        </Paragraph>
      </div>

      {/* Key Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={8} lg={8} xl={4}>
          <Card style={cardStyle} bodyStyle={cardBodyStyle} bordered={false}>
            <Statistic
              title={
                <div style={{ fontSize: "14px", color: "#8c8c8c" }}>
                  Total Tasks
                </div>
              }
              value={stats.totalTasks}
              prefix={
                <FileOutlined
                  style={{ color: colors.primary, marginRight: "8px" }}
                />
              }
              valueStyle={{
                color: colors.primary,
                fontSize: screenSize < 576 ? "28px" : "32px",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={4}>
          <Card style={cardStyle} bodyStyle={cardBodyStyle} bordered={false}>
            <Statistic
              title={
                <div style={{ fontSize: "14px", color: "#8c8c8c" }}>
                  Pending Tasks
                </div>
              }
              value={stats.pendingTasks}
              prefix={
                <ClockCircleOutlined
                  style={{ color: colors.warning, marginRight: "8px" }}
                />
              }
              valueStyle={{
                color: colors.warning,
                fontSize: screenSize < 576 ? "28px" : "32px",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={4}>
          <Card style={cardStyle} bodyStyle={cardBodyStyle} bordered={false}>
            <Statistic
              title={
                <div style={{ fontSize: "14px", color: "#8c8c8c" }}>
                  Completed Tasks
                </div>
              }
              value={stats.completedTasks}
              prefix={
                <CheckCircleOutlined
                  style={{ color: colors.success, marginRight: "8px" }}
                />
              }
              valueStyle={{
                color: colors.success,
                fontSize: screenSize < 576 ? "28px" : "32px",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={4}>
          <Badge count={stats.submissionsNeedingReview} offset={[-10, 5]}>
            <Card style={cardStyle} bodyStyle={cardBodyStyle} bordered={false}>
              <Statistic
                title={
                  <div style={{ fontSize: "14px", color: "#8c8c8c" }}>
                    Pending Reviews
                  </div>
                }
                value={stats.submissionsNeedingReview}
                prefix={
                  <InboxOutlined
                    style={{ color: colors.primary, marginRight: "8px" }}
                  />
                }
                valueStyle={{
                  color: colors.primary,
                  fontSize: screenSize < 576 ? "28px" : "32px",
                }}
              />
            </Card>
          </Badge>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={4}>
          <Card style={cardStyle} bodyStyle={cardBodyStyle} bordered={false}>
            <Statistic
              title={
                <div style={{ fontSize: "14px", color: "#8c8c8c" }}>
                  Total Users
                </div>
              }
              value={stats.totalUsers}
              prefix={
                <UserOutlined
                  style={{ color: colors.primary, marginRight: "8px" }}
                />
              }
              valueStyle={{
                color: colors.primary,
                fontSize: screenSize < 576 ? "28px" : "32px",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={4}>
          <Card style={cardStyle} bodyStyle={cardBodyStyle} bordered={false}>
            <Statistic
              title={
                <div style={{ fontSize: "14px", color: "#8c8c8c" }}>
                  Total Interns
                </div>
              }
              value={stats.totalInterns}
              prefix={
                <TeamOutlined
                  style={{ color: colors.primary, marginRight: "8px" }}
                />
              }
              valueStyle={{
                color: colors.primary,
                fontSize: screenSize < 576 ? "28px" : "32px",
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Task Progress & Pending Submissions */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Title
                level={4}
                style={{
                  margin: 0,
                  fontSize: screenSize < 576 ? "16px" : "18px",
                }}
              >
                Task Progress
              </Title>
            }
            extra={
              <Button
                type="primary"
                size={screenSize < 576 ? "small" : "middle"}
                style={{
                  background: colors.primary,
                  borderColor: colors.primary,
                }}
                onClick={() => navigate("/admin/tasks")}
              >
                View All
              </Button>
            }
            style={cardStyle}
            bodyStyle={cardBodyStyle}
            bordered={false}
          >
            <div style={{ marginBottom: "20px" }}>
              <Progress
                percent={Math.round(
                  (stats.completedTasks / stats.totalTasks) * 100
                )}
                strokeColor={colors.primary}
                format={(percent) => `${percent}% Completed`}
              />
            </div>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <Text type="secondary">Pending:</Text>
                  <Text strong style={{ marginLeft: "8px" }}>
                    {stats.pendingTasks}
                  </Text>
                </div>
                <div>
                  <Text type="secondary">Completed:</Text>
                  <Text strong style={{ marginLeft: "8px" }}>
                    {stats.completedTasks}
                  </Text>
                </div>
                <div>
                  <Text type="secondary">Total:</Text>
                  <Text strong style={{ marginLeft: "8px" }}>
                    {stats.totalTasks}
                  </Text>
                </div>
              </div>

              <Divider style={{ margin: "12px 0" }} />

              <Button
                type="primary"
                icon={<PlusOutlined />}
                size={screenSize < 576 ? "middle" : "large"}
                style={{
                  background: colors.primary,
                  borderColor: colors.primary,
                }}
                onClick={() => navigate("/admin/tasks/new")}
                block
              >
                Create New Task
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Title
                level={4}
                style={{
                  margin: 0,
                  fontSize: screenSize < 576 ? "16px" : "18px",
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
                  size={screenSize < 576 ? "small" : "middle"}
                  icon={<EyeOutlined />}
                  style={{ borderColor: colors.primary, color: colors.primary }}
                  onClick={() =>
                    navigate("/admin/tasks", {
                      state: { filterNeedsReview: true },
                    })
                  }
                >
                  {screenSize >= 576 && "Review All"}
                </Button>
              </Tooltip>
            }
            style={cardStyle}
            bodyStyle={cardBodyStyle}
            bordered={false}
          >
            {pendingSubmissions.length === 0 ? (
              <Empty description="No submissions pending review" />
            ) : (
              <List
                dataSource={pendingSubmissions}
                size={screenSize < 576 ? "small" : "default"}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button
                        type="primary"
                        size="small"
                        style={{
                          background: colors.primary,
                          borderColor: colors.primary,
                        }}
                        onClick={() => navigate(`/admin/tasks/${item.id}`)}
                      >
                        Review
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{ backgroundColor: colors.primary }}
                          icon={<UserOutlined />}
                        />
                      }
                      title={item.task_name}
                      description={
                        <Space direction="vertical" size={0}>
                          <Text
                            type="secondary"
                            style={{
                              fontSize: screenSize < 576 ? "12px" : "14px",
                            }}
                          >
                            Submitted by: {item.intern_name}
                          </Text>
                          <Text
                            type="secondary"
                            style={{
                              fontSize: screenSize < 576 ? "12px" : "14px",
                            }}
                          >
                            {dayjs(item.submission_date).fromNow()}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
                style={{
                  maxHeight: screenSize < 576 ? "200px" : "300px",
                  overflow: "auto",
                  paddingRight: "8px",
                }}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent Tasks */}
      <Row gutter={[16, 16]}>
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
                Recent Tasks
              </Title>
            }
            extra={
              <Space>
                <Button
                  type="primary"
                  ghost
                  size={screenSize < 576 ? "small" : "middle"}
                  icon={<BarChartOutlined />}
                  style={{ borderColor: colors.primary, color: colors.primary }}
                  onClick={() => navigate("/admin/reports")}
                >
                  {screenSize >= 576 && "Reports"}
                </Button>
                <Button
                  type="link"
                  size={screenSize < 576 ? "small" : "middle"}
                  onClick={() => navigate("/admin/tasks")}
                >
                  View All
                </Button>
              </Space>
            }
            style={cardStyle}
            bodyStyle={cardBodyStyle}
            bordered={false}
          >
            <List
              dataSource={recentTasks}
              size={screenSize < 576 ? "small" : "default"}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      size={screenSize < 576 ? "small" : "middle"}
                      onClick={() => navigate(`/admin/tasks/${item.id}`)}
                    >
                      Details
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <span style={{ marginRight: "8px" }}>
                          {item.task_name}
                        </span>
                        {renderStatusTag(item.status)}
                      </div>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Text
                          type="secondary"
                          style={{
                            fontSize: screenSize < 576 ? "12px" : "14px",
                          }}
                        >
                          Created by: {item.created_by}
                        </Text>
                        <Space size="small" align="center">
                          <CalendarOutlined style={{ fontSize: "12px" }} />
                          <Text
                            type="secondary"
                            style={{
                              fontSize: screenSize < 576 ? "12px" : "14px",
                            }}
                          >
                            {item.status === "completed"
                              ? "Completed"
                              : `Due ${dayjs(item.due_date).fromNow()}`}
                          </Text>
                          {dayjs().isAfter(dayjs(item.due_date)) &&
                            item.status === "pending" && (
                              <Tag
                                color="error"
                                style={{ fontSize: "10px", padding: "0 4px" }}
                              >
                                Overdue
                              </Tag>
                            )}
                        </Space>
                      </Space>
                    }
                  />
                  <div style={{ textAlign: "center", minWidth: "50px" }}>
                    <Badge
                      count={item.assigned_to}
                      style={{ backgroundColor: colors.primary }}
                    />
                    <div style={{ fontSize: "10px", marginTop: "4px" }}>
                      Assigned
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
