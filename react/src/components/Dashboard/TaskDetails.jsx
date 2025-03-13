import React from "react";
import { Card, Tag, Image, Typography } from "antd";
import {
  CheckCircleOutlined,
  FileOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

const TaskDetails = ({ taskDetails, colors, baseUrl, noImageFallback }) => {
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

  // Helper function to get full image URL
  const getFullImageUrl = (filePath) => {
    if (!filePath) return noImageFallback;

    // If the path already starts with http, return it as is
    if (filePath.startsWith("http")) {
      return filePath;
    }

    // Log the image path for debugging
    console.log("Processing image path:", filePath);

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
        return <Tag color="processing">Pending</Tag>;
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

  if (!taskDetails) return null;

  return (
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
              <strong>Status:</strong> {renderTaskStatus(taskDetails.status)}
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
              <strong>Submission:</strong> {renderSubmissionStatus(taskDetails)}
            </p>
            {taskDetails.submission_date && (
              <p>
                <strong>Submitted:</strong>{" "}
                {dayjs(taskDetails.submission_date).format("MMMM D, YYYY")}
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

      {/* Task Image */}
      {taskDetails.image_path && (
        <Card title="Task Image" bordered={false} style={{ marginBottom: 16 }}>
          <div style={{ marginTop: "10px" }}>
            <Image
              src={getFullImageUrl(taskDetails.image_path)}
              alt={taskDetails.task_name}
              style={{ maxWidth: "100%" }}
              fallback={noImageFallback}
              onError={(e) => {
                console.error("Image failed to load:", taskDetails.image_path);
              }}
            />
          </div>
        </Card>
      )}

      <Card title="Instructions" bordered={false} style={{ marginBottom: 16 }}>
        <div style={{ whiteSpace: "pre-wrap" }}>
          {taskDetails.instructions || "No specific instructions provided."}
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
  );
};

export default TaskDetails;
