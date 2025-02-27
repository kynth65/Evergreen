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
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useStateContext } from "../../context/ContextProvider";

const { Title, Paragraph, Text } = Typography;

export default function InternTasks() {
  const { token } = useStateContext();
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [viewingTask, setViewingTask] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState(null);

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

  // Function to get proper image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // Check if the path already has the full URL
    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // Check if the path already includes /storage/
    if (imagePath.startsWith("/storage/")) {
      return imagePath;
    }

    // Otherwise, prepend /storage/ to the path
    return `/storage/${imagePath}`;
  };

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
        </Space>
      ),
    },
  ];

  return (
    <div className="intern-tasks">
      <div style={{ marginBottom: "20px" }}>
        <Title level={2}>My Tasks</Title>
        <Paragraph>View your assigned tasks.</Paragraph>
      </div>

      {loading && tasks.length === 0 ? (
        <div
          style={{ display: "flex", justifyContent: "center", padding: "40px" }}
        >
          <Spin size="large" />
        </div>
      ) : tasks.length === 0 ? (
        <Empty
          description="No tasks assigned to you yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          pagination={pagination}
          onChange={handleTableChange}
          loading={loading}
        />
      )}

      <Modal
        title={viewingTask?.task_name}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="close" onClick={handleCancel}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {viewingTask && (
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
              </Descriptions>

              {viewingTask.image_path && (
                <div style={{ marginTop: "20px" }}>
                  <Text strong>Task Image:</Text>
                  <div style={{ marginTop: "10px" }}>
                    <Text>
                      Attempting to load from:{" "}
                      {getImageUrl(viewingTask.image_path)}
                    </Text>
                    <br />
                    <Image
                      src={`public/storage/${viewingTask.image_path}`}
                      alt={viewingTask.task_name}
                      style={{ maxWidth: "100%" }}
                      fallback="data:image/png;base64,..."
                    />
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
}
