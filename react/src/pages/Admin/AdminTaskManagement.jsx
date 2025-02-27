import React, { useState, useEffect } from "react";
import axiosClient from "../../axios.client";
import {
  Table,
  Button,
  Pagination,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  message,
  Space,
  Tag,
  Tooltip,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useStateContext } from "../../context/ContextProvider";

const { TextArea } = Input;
const { Option } = Select;

export default function AdminTaskManagement() {
  const { token } = useStateContext();
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("Add New Task");
  const [selectedTask, setSelectedTask] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
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

      const response = await axiosClient.get("/admin/tasks", { params });

      if (response.data && response.data.data) {
        setTasks(response.data.data.data || []);
        setPagination({
          ...pagination,
          total: response.data.data.total || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      message.error(
        "Failed to load tasks: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination) => {
    setPagination({ ...pagination });
  };

  const showAddModal = () => {
    setModalTitle("Add New Task");
    setSelectedTask(null);
    form.resetFields();
    setFileList([]);
    setIsModalVisible(true);
  };

  const showEditModal = (task) => {
    setModalTitle("Edit Task");
    setSelectedTask(task);

    form.setFieldsValue({
      task_name: task.task_name,
      description: task.description,
      instructions: task.instructions,
      status: task.status,
      due_date: task.due_date ? dayjs(task.due_date) : null,
    });

    // Set file list if image exists
    if (task.image_path) {
      setFileList([
        {
          uid: "-1",
          name: task.image_path.split("/").pop(),
          status: "done",
          url: `/storage/${task.image_path}`,
        },
      ]);
    } else {
      setFileList([]);
    }

    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();

    // Add all form values to FormData except image
    Object.keys(values).forEach((key) => {
      if (key === "due_date" && values[key]) {
        formData.append(key, values[key].format("YYYY-MM-DD HH:mm:ss"));
      } else if (key !== "image") {
        formData.append(key, values[key] || "");
      }
    });

    // Add image to FormData if exists
    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append("image", fileList[0].originFileObj);
    }

    setLoading(true);

    try {
      let response;

      if (selectedTask) {
        // Update existing task
        response = await axiosClient.post(
          `/admin/tasks/${selectedTask.id}?_method=PUT`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        message.success("Task updated successfully");
      } else {
        // Create new task
        response = await axiosClient.post("/admin/tasks", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        message.success("Task created successfully");
      }

      setIsModalVisible(false);
      fetchTasks();
    } catch (error) {
      console.error("Error saving task:", error);
      message.error(
        "Failed to save task: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axiosClient.delete(`/admin/tasks/${id}`);
      message.success("Task deleted successfully");
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      message.error("Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    setLoading(true);
    try {
      await axiosClient.patch(`/admin/tasks/${id}/status`, { status });
      message.success("Task status updated successfully");
      fetchTasks();
    } catch (error) {
      console.error("Error updating task status:", error);
      message.error("Failed to update task status");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get creator display name
  const getCreatorName = (creator) => {
    if (!creator) return "Unknown";
    if (creator.first_name && creator.last_name) {
      return `${creator.first_name} ${creator.last_name}`;
    }
    return creator.email || `User #${creator.id}`;
  };

  const columns = [
    {
      title: "Task Name",
      dataIndex: "task_name",
      key: "task_name",
      render: (text, record) => (
        <Tooltip title="Click to view details">
          <a onClick={() => showEditModal(record)}>{text}</a>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
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
      },
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: (date) =>
        date ? dayjs(date).format("YYYY-MM-DD") : "No due date",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => showEditModal(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this task?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
          {record.status !== "completed" && (
            <Button
              type="primary"
              ghost
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleStatusChange(record.id, "completed")}
            >
              Complete
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-task-management">
      <div
        className="header-section"
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h1>Task Management</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Add Task
        </Button>
      </div>

      <div className="filter-section" style={{ marginBottom: "20px" }}>
        <Space>
          <span>Filter by status:</span>
          <Select
            style={{ width: 150 }}
            placeholder="All statuses"
            allowClear
            onChange={(value) => setFilterStatus(value)}
          >
            <Option value="pending">Pending</Option>
            <Option value="completed">Completed</Option>
            <Option value="failed">Failed</Option>
          </Select>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={tasks}
        rowKey="id"
        pagination={pagination}
        onChange={handleTableChange}
        loading={loading}
      />

      <Modal
        title={modalTitle}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: "pending",
          }}
        >
          <Form.Item
            name="task_name"
            label="Task Name"
            rules={[{ required: true, message: "Please enter task name" }]}
          >
            <Input placeholder="Enter task name" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={4} placeholder="Enter task description" />
          </Form.Item>

          <Form.Item name="instructions" label="Instructions">
            <TextArea rows={4} placeholder="Enter task instructions" />
          </Form.Item>

          <Form.Item label="Image">
            <Upload
              listType="picture"
              maxCount={1}
              beforeUpload={() => false} // Prevent auto upload
              fileList={fileList}
              onRemove={() => setFileList([])}
              onChange={({ fileList }) => setFileList(fileList)}
            >
              <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>
          </Form.Item>

          <Form.Item name="status" label="Status">
            <Select>
              <Option value="pending">Pending</Option>
              <Option value="completed">Completed</Option>
              <Option value="failed">Failed</Option>
            </Select>
          </Form.Item>

          <Form.Item name="due_date" label="Due Date">
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {selectedTask ? "Update Task" : "Create Task"}
              </Button>
              <Button onClick={handleCancel}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
