import React, { useState, useEffect } from "react";
import axiosClient from "../../axios.client";
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
  Spin,
  Alert,
  Space,
  Divider,
  Badge,
  Tooltip,
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
} from "@ant-design/icons";
import { useStateContext } from "../../context/ContextProvider";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Title, Paragraph, Text } = Typography;

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

  // Define green color scheme
  const colors = {
    primary: "#1da57a", // Primary green
    secondary: "#52c41a", // Secondary lighter green
    warning: "#faad14",
    success: "#52c41a",
    error: "#f5222d",
    lightBg: "#f6ffed", // Light green background
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call - replace with real API endpoint when available
      // const response = await axiosClient.get("/admin/dashboard");
      // setDashboardData(response.data);

      // Mock data for demonstration
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
            },
            {
              id: 2,
              task_name: "Website Redesign",
              status: "completed",
              due_date: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
              created_by: "Content Manager",
            },
            {
              id: 3,
              task_name: "API Documentation",
              status: "pending",
              due_date: dayjs().add(5, "day").format("YYYY-MM-DD"),
              created_by: "Admin User",
            },
            {
              id: 4,
              task_name: "Security Audit",
              status: "pending",
              due_date: dayjs().add(1, "day").format("YYYY-MM-DD"),
              created_by: "System Admin",
            },
            {
              id: 5,
              task_name: "Mobile App Testing",
              status: "completed",
              due_date: dayjs().subtract(2, "day").format("YYYY-MM-DD"),
              created_by: "QA Team",
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
        icon = <ExclamationCircleOutlined />;
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

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <p style={{ marginTop: "20px" }}>Loading dashboard information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        style={{ margin: "30px" }}
        action={
          <Button type="primary" onClick={fetchDashboardData}>
            Retry
          </Button>
        }
      />
    );
  }

  const { stats, recentTasks, pendingSubmissions } = dashboardData;

  return (
    <div className="admin-dashboard">
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>Admin Dashboard</Title>
        <Paragraph>
          Welcome to the admin dashboard. Here you can monitor task progress,
          manage submissions, and view system statistics.
        </Paragraph>
      </div>

      {/* Key Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={8} lg={8} xl={4}>
          <Card
            style={{ background: colors.lightBg, borderColor: colors.primary }}
          >
            <Statistic
              title="Total Tasks"
              value={stats.totalTasks}
              prefix={<FileOutlined />}
              valueStyle={{ color: colors.primary }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={4}>
          <Card
            style={{ background: colors.lightBg, borderColor: colors.primary }}
          >
            <Statistic
              title="Pending Tasks"
              value={stats.pendingTasks}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: colors.warning }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={4}>
          <Card
            style={{ background: colors.lightBg, borderColor: colors.primary }}
          >
            <Statistic
              title="Completed Tasks"
              value={stats.completedTasks}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: colors.success }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={4}>
          <Badge count={stats.submissionsNeedingReview} offset={[-5, 5]}>
            <Card
              style={{
                background: colors.lightBg,
                borderColor: colors.primary,
              }}
            >
              <Statistic
                title="Submissions to Review"
                value={stats.submissionsNeedingReview}
                prefix={<InboxOutlined />}
                valueStyle={{ color: colors.primary }}
              />
            </Card>
          </Badge>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={4}>
          <Card
            style={{ background: colors.lightBg, borderColor: colors.primary }}
          >
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: colors.primary }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={4}>
          <Card
            style={{ background: colors.lightBg, borderColor: colors.primary }}
          >
            <Statistic
              title="Total Interns"
              value={stats.totalInterns}
              prefix={<TeamOutlined />}
              valueStyle={{ color: colors.primary }}
            />
          </Card>
        </Col>
      </Row>

      {/* Task Progress */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={12}>
          <Card
            title={<Title level={4}>Task Progress</Title>}
            extra={
              <Button type="link" onClick={() => navigate("/admin/tasks")}>
                View All
              </Button>
            }
            style={{ height: "100%" }}
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
            <div>
              <Text strong>Task Status Breakdown:</Text>
              <div
                style={{
                  marginTop: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
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
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={<Title level={4}>Submissions Pending Review</Title>}
            extra={
              <Tooltip title="View all submissions that need review">
                <Button
                  type="primary"
                  ghost
                  icon={<EyeOutlined />}
                  onClick={() =>
                    navigate("/admin/tasks", {
                      state: { filterNeedsReview: true },
                    })
                  }
                >
                  Review All
                </Button>
              </Tooltip>
            }
            style={{ height: "100%" }}
          >
            {pendingSubmissions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Text>No submissions pending review</Text>
              </div>
            ) : (
              <List
                dataSource={pendingSubmissions}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button
                        type="link"
                        icon={<RightOutlined />}
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
                          <Text type="secondary">
                            Submitted by: {item.intern_name}
                          </Text>
                          <Text type="secondary">
                            Date:{" "}
                            {dayjs(item.submission_date).format(
                              "YYYY-MM-DD HH:mm"
                            )}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent Tasks */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title={<Title level={4}>Recent Tasks</Title>}
            extra={
              <Button type="link" onClick={() => navigate("/admin/tasks")}>
                View All Tasks
              </Button>
            }
          >
            <List
              dataSource={recentTasks}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      onClick={() => navigate(`/admin/tasks/${item.id}`)}
                    >
                      Details
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={<span>{item.task_name}</span>}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary">
                          Created by: {item.created_by}
                        </Text>
                        <Space size="small" align="center">
                          <CalendarOutlined style={{ fontSize: "12px" }} />
                          <Text type="secondary">Due: {item.due_date}</Text>
                        </Space>
                      </Space>
                    }
                  />
                  {renderStatusTag(item.status)}
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col span={24}>
          <Card>
            <Title level={4}>Quick Actions</Title>
            <Divider style={{ margin: "16px 0" }} />
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Button
                  type="primary"
                  block
                  size="large"
                  style={{
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                    height: "auto",
                    padding: "12px 0",
                  }}
                  onClick={() => navigate("/admin/tasks/new")}
                >
                  <Space direction="vertical" size={0}>
                    <FileOutlined style={{ fontSize: "24px" }} />
                    <span>Create New Task</span>
                  </Space>
                </Button>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Button
                  type="primary"
                  ghost
                  block
                  size="large"
                  style={{
                    borderColor: colors.primary,
                    color: colors.primary,
                    height: "auto",
                    padding: "12px 0",
                  }}
                  onClick={() =>
                    navigate("/admin/tasks", {
                      state: { filterNeedsReview: true },
                    })
                  }
                >
                  <Space direction="vertical" size={0}>
                    <InboxOutlined style={{ fontSize: "24px" }} />
                    <span>Review Submissions</span>
                  </Space>
                </Button>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Button
                  type="primary"
                  ghost
                  block
                  size="large"
                  style={{
                    borderColor: colors.primary,
                    color: colors.primary,
                    height: "auto",
                    padding: "12px 0",
                  }}
                  onClick={() => navigate("/admin/users")}
                >
                  <Space direction="vertical" size={0}>
                    <TeamOutlined style={{ fontSize: "24px" }} />
                    <span>Manage Users</span>
                  </Space>
                </Button>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Button
                  type="primary"
                  ghost
                  block
                  size="large"
                  style={{
                    borderColor: colors.primary,
                    color: colors.primary,
                    height: "auto",
                    padding: "12px 0",
                  }}
                  onClick={() => navigate("/admin/reports")}
                >
                  <Space direction="vertical" size={0}>
                    <FileOutlined style={{ fontSize: "24px" }} />
                    <span>Generate Reports</span>
                  </Space>
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
