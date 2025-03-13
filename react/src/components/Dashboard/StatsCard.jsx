import React from "react";
import { Card, Statistic, Progress, Badge, Col } from "antd";
import { ClockCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const StatsCards = ({ stats }) => {
  // Theme colors
  const colors = {
    primary: "#1da57a", // Primary green
    secondary: "#52c41a", // Secondary lighter green
    warning: "#faad14",
    success: "#52c41a",
    error: "#f5222d",
    lightBg: "#f6ffed", // Light green background
  };

  // Calculate completion percentage
  const completionPercentage =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <>
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
            <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#888" }}>
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
    </>
  );
};

export default StatsCards;
