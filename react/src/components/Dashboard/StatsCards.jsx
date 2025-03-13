import React from "react";
import { Card, Statistic, Progress, Badge, Col } from "antd";
import { ClockCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";

const StatsCards = ({ stats }) => {
  // Theme colors
  const colors = {
    primary: "#1da57a", // Primary green
    warning: "#faad14",
    success: "#52c41a",
  };

  // Calculate completion percentage
  const completionPercentage =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // Card styles for consistent appearance
  const cardStyle = {
    height: "100%",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
    border: "1px solid #f0f0f0",
    borderRadius: "8px",
  };

  // Card body styles for consistent internal spacing
  const cardBodyStyle = {
    padding: "24px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

  // Title style for consistent header appearance
  const titleStyle = {
    fontSize: "14px",
    color: "#8c8c8c",
    marginBottom: "8px",
  };

  // Value style for the main statistic
  const valueStyle = {
    fontSize: "32px",
    fontWeight: "500",
    lineHeight: "1.2",
    marginBottom: "16px",
  };

  // Common footer style for the bottom message
  const footerStyle = {
    marginTop: "auto",
    paddingTop: "12px",
    fontSize: "12px",
    color: "#8c8c8c",
    borderTop: "1px solid #f0f0f0",
    minHeight: "40px",
    display: "flex",
    alignItems: "center",
  };

  return (
    <>
      {/* Task Completion Card */}
      <Col xs={24} md={8} lg={6} style={{ marginBottom: "16px" }}>
        <Card bodyStyle={cardBodyStyle} style={cardStyle} bordered={false}>
          <div>
            <div style={titleStyle}>Task Completion</div>
            <div style={{ ...valueStyle, color: colors.primary }}>
              {completionPercentage}%
            </div>
            <Progress
              percent={completionPercentage}
              strokeColor={colors.primary}
              showInfo={false}
              size="small"
              style={{ marginBottom: "8px" }}
            />
          </div>
          <div style={footerStyle}>
            {stats.completed} of {stats.total} tasks completed
          </div>
        </Card>
      </Col>

      {/* Pending Tasks Card */}
      <Col xs={24} md={8} lg={6} style={{ marginBottom: "16px" }}>
        <Card bodyStyle={cardBodyStyle} style={cardStyle} bordered={false}>
          <div>
            <div style={titleStyle}>Pending Tasks</div>
            <div style={{ ...valueStyle, color: colors.warning }}>
              <ClockCircleOutlined
                style={{ fontSize: "24px", marginRight: "8px" }}
              />
              {stats.pending}
            </div>
          </div>
          <div style={footerStyle}>
            {stats.upcomingDue > 0 ? (
              <>
                <Badge color={colors.warning} style={{ marginRight: "5px" }} />
                {stats.upcomingDue} {stats.upcomingDue === 1 ? "task" : "tasks"}{" "}
                due in the next 3 days
              </>
            ) : (
              "No upcoming tasks due soon"
            )}
          </div>
        </Card>
      </Col>

      {/* Completed Tasks Card */}
      <Col xs={24} md={8} lg={6} style={{ marginBottom: "16px" }}>
        <Card bodyStyle={cardBodyStyle} style={cardStyle} bordered={false}>
          <div>
            <div style={titleStyle}>Completed Tasks</div>
            <div style={{ ...valueStyle, color: colors.success }}>
              <CheckCircleOutlined
                style={{ fontSize: "24px", marginRight: "8px" }}
              />
              {stats.completed}
            </div>
          </div>
          <div style={footerStyle}>Great job keeping up with your tasks!</div>
        </Card>
      </Col>
    </>
  );
};

export default StatsCards;
