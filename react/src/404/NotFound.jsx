import React, { useEffect, useState } from "react";
import { Button, Result, Typography, Space, Progress } from "antd";
import { useNavigate } from "react-router-dom";
import { HomeOutlined } from "@ant-design/icons";
import { useStateContext } from "../context/ContextProvider";

const { Paragraph, Text } = Typography;

export default function NotFound() {
  const navigate = useNavigate();
  const { user } = useStateContext();
  const [countdown, setCountdown] = useState(5);

  // Determine the dashboard route based on user role
  const getDashboardRoute = () => {
    if (!user) return "/login";

    switch (user.role) {
      case "admin":
        return "/admin/";
      case "client":
        return "/client/";
      case "intern":
        return "/intern/";
      case "superadmin":
        return "/superadmin/";
      default:
        return "/dashboard";
    }
  };

  const dashboardRoute = getDashboardRoute();

  // Automatic redirect after countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(timer);
          navigate(dashboardRoute);
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, dashboardRoute]);

  // Handle manual redirect
  const handleRedirect = () => {
    navigate(dashboardRoute);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "20px",
      }}
    >
      <Result
        status="404"
        title="404 - Page Not Found"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Space direction="vertical" align="center" style={{ width: "100%" }}>
            <Paragraph>
              You will be redirected to the dashboard in{" "}
              <Text strong>{countdown}</Text> seconds.
            </Paragraph>

            <Progress
              percent={((5 - countdown) / 5) * 100}
              showInfo={false}
              status="active"
              style={{ width: "80%", maxWidth: "300px" }}
            />

            <Button
              type="primary"
              icon={<HomeOutlined />}
              onClick={handleRedirect}
            >
              Go to Dashboard Now
            </Button>
          </Space>
        }
      />
    </div>
  );
}
