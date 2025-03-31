import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  Select,
  Row,
  Col,
  Card,
  Typography,
  Dropdown,
  Menu,
  Breadcrumb,
  message,
  ConfigProvider,
  Progress,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileOutlined,
  FolderOutlined,
  FolderAddOutlined,
  UploadOutlined,
  DownloadOutlined,
  SearchOutlined,
  MoreOutlined,
  ArrowLeftOutlined,
  EyeOutlined,
  InboxOutlined,
} from "@ant-design/icons";

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const FileManagerList = ({ role: propRole = "admin" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // State for file system data
  const [fileSystem, setFileSystem] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null); // null means root
  const [currentItems, setCurrentItems] = useState([]);
  const [breadcrumbPath, setBreadcrumbPath] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("newFolder"); // "newFolder", "rename"
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // File upload state and refs
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Styling to match the existing component
  const colors = {
    primary: "#1da57a", // Primary green
    warning: "#faad14",
    success: "#52c41a",
    error: "#f5222d",
  };

  // Responsive breakpoints
  const breakpoints = {
    xs: 480,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
  };

  // Check if we're on a mobile device
  const isMobile = screenWidth < breakpoints.md;

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "50"],
  });

  // Update screen width on window resize
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update breadcrumb path when changing folders
  useEffect(() => {
    if (currentFolder === null) {
      setBreadcrumbPath([]);
      return;
    }
    fetchBreadcrumbPath(currentFolder);
  }, [currentFolder]);

  // Fetch data when folder changes or search/sort is applied
  useEffect(() => {
    fetchCurrentItems();
  }, [currentFolder, searchText, sortField, sortOrder]);

  // Placeholder for API call to fetch files/folders in current directory
  const fetchCurrentItems = () => {
    setLoading(true);

    // This will be replaced with an actual API call
    // Example: apiClient.get(`/files?parent=${currentFolder}&search=${searchText}`)

    // Simulate API call for now
    setTimeout(() => {
      setCurrentItems([]);
      setLoading(false);
    }, 500);
  };

  // Placeholder for API call to fetch breadcrumb path
  const fetchBreadcrumbPath = (folderId) => {
    // This will be replaced with an actual API call
    // Example: apiClient.get(`/folders/${folderId}/path`)

    // Simulate API call for now
    setBreadcrumbPath([{ id: folderId, name: "Folder" }]);
  };

  // Handler for going to a folder
  const navigateToFolder = (folderId) => {
    setCurrentFolder(folderId);
    setPagination({ ...pagination, current: 1 });
  };

  // Handler for going up one level
  const navigateUp = () => {
    if (currentFolder === null) return;
    setCurrentFolder(null);
    setPagination({ ...pagination, current: 1 });
  };

  // Handler for going to a specific level via breadcrumb
  const navigateToBreadcrumb = (folderId) => {
    setCurrentFolder(folderId);
    setPagination({ ...pagination, current: 1 });
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === null || bytes === undefined) return "-";

    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Byte";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Get icon based on file type
  const getFileIcon = (item) => {
    if (item.type === "folder") {
      return <FolderOutlined style={{ color: colors.warning }} />;
    } else {
      return <FileOutlined />;
    }
  };

  // Handler for opening the modal
  const showModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setModalVisible(true);

    if (type === "rename" && item) {
      itemForm.setFieldsValue({ name: item.name });
    } else {
      itemForm.resetFields();
    }
  };

  // Handler for creating a new folder
  const createFolder = (values) => {
    // To be replaced with API call
    // Example: apiClient.post('/folders', { name: values.name, parent: currentFolder })

    message.success(
      `Folder "${values.name}" will be created (API integration pending)`
    );
    setModalVisible(false);
  };

  // Handler for renaming an item
  const renameItem = (values) => {
    if (!selectedItem) return;

    // To be replaced with API call
    // Example: apiClient.put(`/${selectedItem.type}s/${selectedItem.id}`, { name: values.name })

    message.success(
      `Item will be renamed to "${values.name}" (API integration pending)`
    );
    setModalVisible(false);
  };

  // Handler for deleting an item
  const deleteItem = (item) => {
    Modal.confirm({
      title: `Delete ${item.type === "folder" ? "Folder" : "File"}`,
      content: `Are you sure you want to delete "${item.name}"? ${
        item.type === "folder" ? "All contents inside will be deleted too." : ""
      }`,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => {
        // To be replaced with API call
        // Example: apiClient.delete(`/${item.type}s/${item.id}`)

        message.success(
          `"${item.name}" will be deleted (API integration pending)`
        );
      },
    });
  };

  // File upload handling
  const handleUpload = (file) => {
    if (!file) {
      message.error("Please select a file to upload");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const fileName = file.name;

    message.loading({
      content: `Uploading ${fileName}...`,
      key: "upload",
      duration: 0,
    });

    // To be replaced with API call
    // Example:
    // const formData = new FormData();
    // formData.append('file', file);
    // formData.append('parent', currentFolder);
    // apiClient.post('/files', formData, {
    //   onUploadProgress: (progressEvent) => {
    //     const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    //     setUploadProgress(percentCompleted);
    //   }
    // })

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        setUploading(false);
        message.success({
          content: `${fileName} upload will be implemented with API`,
          key: "upload",
          duration: 2,
        });

        fetchCurrentItems();
      }
      setUploadProgress(progress);
    }, 200);
  };

  // Trigger file input click
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file change from input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleUpload(file);
    }
    e.target.value = null;
  };

  // Reset search and sort
  const resetFilters = () => {
    setSearchText("");
    setSortField("name");
    setSortOrder("asc");
  };

  // Table columns
  const getColumns = () => {
    const baseColumns = [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        render: (text, record) => (
          <Space>
            {getFileIcon(record)}
            {record.type === "folder" ? (
              <a onClick={() => navigateToFolder(record.id)}>{text}</a>
            ) : (
              <span>{text}</span>
            )}
          </Space>
        ),
      },
      {
        title: "Type",
        dataIndex: "type",
        key: "type",
        responsive: ["md"],
        render: (type) => (type === "folder" ? "Folder" : "File"),
      },
    ];

    const desktopColumns = [
      {
        title: "Size",
        dataIndex: "size",
        key: "size",
        responsive: ["md"],
        render: formatFileSize,
      },
      {
        title: "Last Modified",
        dataIndex: "updatedAt",
        key: "updatedAt",
        responsive: ["lg"],
        render: formatDate,
      },
    ];

    const actionsColumn = {
      title: "Actions",
      key: "actions",
      fixed: isMobile ? "right" : false,
      render: (_, record) => {
        // For mobile: render a dropdown menu with actions
        if (isMobile) {
          const actionItems = [
            {
              key: "rename",
              label: "Rename",
              icon: <EditOutlined />,
              onClick: () => showModal("rename", record),
            },
            {
              key: "delete",
              label: "Delete",
              icon: <DeleteOutlined />,
              danger: true,
              onClick: () => deleteItem(record),
            },
          ];

          if (record.type === "folder") {
            actionItems.unshift({
              key: "open",
              label: "Open",
              icon: <FolderOutlined />,
              onClick: () => navigateToFolder(record.id),
            });
          } else {
            actionItems.unshift({
              key: "view",
              label: "View",
              icon: <EyeOutlined />,
              onClick: () =>
                message.info("View functionality would be implemented here"),
            });

            actionItems.push({
              key: "download",
              label: "Download",
              icon: <DownloadOutlined />,
              onClick: () =>
                message.info(`Download for "${record.name}" would happen here`),
            });
          }

          const menu = <Menu items={actionItems} />;

          return (
            <Dropdown
              overlay={menu}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          );
        }

        // For desktop: render all action buttons
        return (
          <Space size="small">
            {record.type === "folder" ? (
              <Button
                type="primary"
                icon={<FolderOutlined />}
                size="small"
                onClick={() => navigateToFolder(record.id)}
              >
                Open
              </Button>
            ) : (
              <Button
                type="primary"
                icon={<EyeOutlined />}
                size="small"
                onClick={() =>
                  message.info("View functionality would be implemented here")
                }
              >
                View
              </Button>
            )}
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => showModal("rename", record)}
            >
              Rename
            </Button>
            {record.type === "file" && (
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                size="small"
                onClick={() =>
                  message.info(
                    `Download for "${record.name}" would happen here`
                  )
                }
              >
                Download
              </Button>
            )}
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => deleteItem(record)}
            >
              Delete
            </Button>
          </Space>
        );
      },
    };

    return [...baseColumns, ...desktopColumns, actionsColumn];
  };

  // Generate the current breadcrumb
  const breadcrumbItems = [
    {
      title: <a onClick={() => navigateToBreadcrumb(null)}>Home</a>,
      key: "home",
    },
    ...breadcrumbPath.map((item) => ({
      title: <a onClick={() => navigateToBreadcrumb(item.id)}>{item.name}</a>,
      key: item.id,
    })),
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: colors.primary,
        },
      }}
    >
      <div
        className="file-manager"
        style={{
          padding: isMobile ? "0px" : "0px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className="header-section"
          style={{
            marginBottom: isMobile ? "16px" : "20px",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "center",
            gap: isMobile ? "12px" : "0",
          }}
        >
          <Title
            level={isMobile ? 4 : 3}
            style={{ margin: 0, fontWeight: 700 }}
          >
            File Manager
          </Title>
          <Space>
            <Button
              type="primary"
              icon={<FolderAddOutlined />}
              style={{
                backgroundColor: colors.primary,
                borderColor: colors.primary,
              }}
              onClick={() => showModal("newFolder")}
            >
              New Folder
            </Button>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              style={{
                backgroundColor: colors.primary,
                borderColor: colors.primary,
              }}
              onClick={triggerFileUpload}
            >
              Upload Files
            </Button>
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
              accept="*/*"
            />
          </Space>
        </div>

        <Card
          bodyStyle={{ padding: isMobile ? "12px" : "24px" }}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Breadcrumb navigation */}
          <div
            style={{ marginBottom: 16, display: "flex", alignItems: "center" }}
          >
            {currentFolder !== null && (
              <Button
                icon={<ArrowLeftOutlined />}
                style={{ marginRight: 8 }}
                onClick={navigateUp}
              />
            )}
            <Breadcrumb items={breadcrumbItems} />
          </div>

          {/* Filters and Search Section */}
          <div style={{ marginBottom: 20, flex: "0 0 auto" }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={24} md={12} lg={8}>
                <Search
                  placeholder="Search files and folders..."
                  allowClear
                  enterButton={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={(value) => setSearchText(value)}
                />
              </Col>

              <Col xs={12} sm={8} md={6} lg={4}>
                <Select
                  placeholder="Sort by"
                  style={{ width: "100%" }}
                  value={sortField}
                  onChange={setSortField}
                >
                  <Option value="name">Name</Option>
                  <Option value="date">Date</Option>
                  <Option value="size">Size</Option>
                </Select>
              </Col>

              <Col xs={12} sm={8} md={6} lg={4}>
                <Select
                  placeholder="Sort order"
                  style={{ width: "100%" }}
                  value={sortOrder}
                  onChange={setSortOrder}
                >
                  <Option value="asc">Ascending</Option>
                  <Option value="desc">Descending</Option>
                </Select>
              </Col>

              <Col xs={24} sm={8} md={6} lg={4}>
                <Button
                  onClick={resetFilters}
                  style={{ width: isMobile ? "100%" : "auto" }}
                >
                  Reset Filters
                </Button>
              </Col>
            </Row>
          </div>

          <div
            className="responsive-table-container"
            style={{
              overflowX: "auto",
              height: "calc(100vh - 300px)",
              minHeight: "400px",
            }}
          >
            <Table
              columns={getColumns()}
              dataSource={currentItems}
              rowKey="id"
              scroll={{ x: "max-content" }}
              size={isMobile ? "small" : "middle"}
              loading={loading}
              pagination={{
                position: ["bottomRight"],
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`,
                size: isMobile ? "small" : "default",
                locale: { items_per_page: "/ page" },
                onChange: (page, pageSize) => {
                  setPagination({
                    ...pagination,
                    current: page,
                    pageSize: pageSize,
                  });
                },
                onShowSizeChange: (current, size) => {
                  setPagination({
                    ...pagination,
                    current: 1,
                    pageSize: size,
                  });
                },
              }}
              locale={{
                emptyText: " ",
              }}
            />

            {/* Mobile information note */}
            {isMobile && (
              <div style={{ marginTop: "16px", textAlign: "center" }}>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Swipe left/right to see more details. Tap the menu icon to
                  view actions.
                </Text>
              </div>
            )}

            {/* Empty state for table */}
            {currentItems.length === 0 && !loading && (
              <div
                style={{
                  margin: "40px 0",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "40px 20px",
                  border: "2px dashed #d9d9d9",
                  borderRadius: "8px",
                  background: "#fafafa",
                  cursor: "pointer",
                }}
                onClick={triggerFileUpload}
              >
                <InboxOutlined
                  style={{
                    fontSize: 48,
                    color: colors.primary,
                    marginBottom: 16,
                  }}
                />
                <p style={{ fontSize: 16, marginBottom: 8 }}>
                  No files or folders found
                </p>
                <p style={{ color: "#888", marginBottom: 16 }}>
                  Click to browse your files
                </p>
                <Space>
                  <Button
                    type="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      showModal("newFolder");
                    }}
                  >
                    Create Folder
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerFileUpload();
                    }}
                  >
                    Browse Files
                  </Button>
                </Space>
              </div>
            )}
          </div>

          {/* Info tip for browser selection */}
          <div style={{ marginTop: 8, marginBottom: 16, textAlign: "center" }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              <a onClick={triggerFileUpload} style={{ color: colors.primary }}>
                Click here to browse your computer for files to upload
              </a>
            </Text>
          </div>
        </Card>

        {/* Upload Progress Modal */}
        {uploading && (
          <Modal
            title="Uploading File"
            open={uploading}
            footer={null}
            closable={false}
            maskClosable={false}
          >
            <div style={{ marginBottom: 20 }}>
              <Progress percent={Math.round(uploadProgress)} status="active" />
            </div>
            <p style={{ textAlign: "center" }}>
              Please wait while your file is being uploaded...
            </p>
          </Modal>
        )}

        {/* Modal for Create Folder / Rename */}
        <Modal
          title={
            modalType === "newFolder" ? "Create New Folder" : "Rename Item"
          }
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          <Form
            form={itemForm}
            layout="vertical"
            onFinish={(values) => {
              if (modalType === "newFolder") {
                createFolder(values);
              } else if (modalType === "rename") {
                renameItem(values);
              }
            }}
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[
                { required: true, message: "Please input a name!" },
                {
                  validator: (_, value) => {
                    if (
                      value &&
                      currentItems.some(
                        (item) =>
                          item.name === value &&
                          (modalType !== "rename" ||
                            item.id !== selectedItem?.id)
                      )
                    ) {
                      return Promise.reject(
                        new Error(
                          "This name already exists in the current folder"
                        )
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input
                placeholder={
                  modalType === "newFolder"
                    ? "Enter folder name"
                    : "Enter new name"
                }
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
              <Space>
                <Button onClick={() => setModalVisible(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit">
                  {modalType === "newFolder" ? "Create" : "Rename"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Add responsive styles */}
        <style jsx="true">{`
          .file-manager .ant-table-thead > tr > th {
            white-space: nowrap;
            background-color: #fafafa;
          }

          .file-manager .ant-pagination {
            display: flex;
            align-items: center;
          }

          .file-manager .ant-pagination-item {
            border-radius: 4px;
            border-color: #1da57a;
          }

          .file-manager .ant-pagination-item-active {
            background-color: #1da57a;
            border-color: #1da57a;
          }

          .file-manager .ant-pagination-item-active a {
            color: white;
          }

          .file-manager .ant-select-selection-item {
            color: #333;
          }

          .file-manager .ant-pagination-options {
            margin-left: 16px;
          }

          @media (max-width: 768px) {
            .file-manager .ant-table {
              font-size: 13px;
            }

            .file-manager .ant-btn-sm {
              font-size: 12px;
              padding: 0 8px;
            }

            .file-manager .ant-pagination {
              font-size: 12px;
            }

            .file-manager .ant-pagination-item {
              min-width: 24px;
              height: 24px;
              line-height: 22px;
            }
          }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default FileManagerList;
