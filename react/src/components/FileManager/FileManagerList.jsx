import React, { useState, useEffect } from "react";
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
  Tooltip,
  message,
  ConfigProvider,
  Empty,
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
  SortAscendingOutlined,
  SortDescendingOutlined,
  MoreOutlined,
  ArrowLeftOutlined,
  FileImageOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  FileUnknownOutlined,
  EyeOutlined,
} from "@ant-design/icons";

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const FileManagerList = ({ role: propRole = "admin" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Mock data structure - this would be replaced with API calls in production
  const [fileSystem, setFileSystem] = useState([
    {
      id: "1",
      name: "Documents",
      type: "folder",
      createdAt: "2025-03-15T09:00:00",
      updatedAt: "2025-03-15T09:00:00",
      size: null,
      parent: null,
    },
    {
      id: "2",
      name: "Images",
      type: "folder",
      createdAt: "2025-03-15T09:30:00",
      updatedAt: "2025-03-15T09:30:00",
      size: null,
      parent: null,
    },
    {
      id: "3",
      name: "Project Report.pdf",
      type: "file",
      fileType: "pdf",
      createdAt: "2025-03-20T10:15:00",
      updatedAt: "2025-03-20T10:15:00",
      size: 2500000,
      parent: "1",
    },
    {
      id: "4",
      name: "Contracts",
      type: "folder",
      createdAt: "2025-03-25T11:20:00",
      updatedAt: "2025-03-25T11:20:00",
      size: null,
      parent: "1",
    },
    {
      id: "5",
      name: "Agreement.docx",
      type: "file",
      fileType: "doc",
      createdAt: "2025-03-26T14:10:00",
      updatedAt: "2025-03-26T14:10:00",
      size: 350000,
      parent: "4",
    },
  ]);

  const [currentFolder, setCurrentFolder] = useState(null); // null means root
  const [breadcrumbPath, setBreadcrumbPath] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("newFolder"); // "newFolder", "rename", "upload"
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemForm] = Form.useForm();
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // Styling to match the existing component
  const colors = {
    primary: "#1da57a", // Primary green
    secondary: "#52c41a", // Secondary lighter green
    warning: "#faad14",
    success: "#52c41a",
    error: "#f5222d",
    lightBg: "#f6ffed", // Light green background
  };

  // Responsive breakpoints to match existing component
  const breakpoints = {
    xs: 480, // Extra small devices
    sm: 576, // Small devices
    md: 768, // Medium devices
    lg: 992, // Large devices
    xl: 1200, // Extra large devices
    xxl: 1600, // Extra extra large devices
  };

  // Check if we're on a mobile device
  const isMobile = screenWidth < breakpoints.md;

  // Update screen width on window resize
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "50"],
    locale: { items_per_page: "/ page" },
  });

  // Update breadcrumb path when changing folders
  useEffect(() => {
    if (currentFolder === null) {
      setBreadcrumbPath([]);
      return;
    }

    // Build the breadcrumb path by traversing parents
    const buildPath = (folderId) => {
      const folder = fileSystem.find((item) => item.id === folderId);
      if (!folder) return [];

      if (folder.parent === null) {
        return [{ id: folder.id, name: folder.name }];
      } else {
        return [
          ...buildPath(folder.parent),
          { id: folder.id, name: folder.name },
        ];
      }
    };

    setBreadcrumbPath(buildPath(currentFolder));
  }, [currentFolder, fileSystem]);

  // Get the current displayed items based on current folder and search/sort
  const getCurrentItems = () => {
    // Filter items that are in the current folder
    let items = fileSystem.filter((item) => item.parent === currentFolder);

    // Apply search if there's a search term
    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      items = items.filter((item) =>
        item.name.toLowerCase().includes(lowerSearchText)
      );
    }

    // Sort the items
    items = [...items].sort((a, b) => {
      // Always sort folders before files
      if (a.type === "folder" && b.type === "file") return -1;
      if (a.type === "file" && b.type === "folder") return 1;

      // Then sort by the selected field
      if (sortField === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortField === "date") {
        const dateA = new Date(a.updatedAt);
        const dateB = new Date(b.updatedAt);
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else if (sortField === "size") {
        const sizeA = a.size || 0;
        const sizeB = b.size || 0;
        return sortOrder === "asc" ? sizeA - sizeB : sizeB - sizeA;
      }
      return 0;
    });

    return items;
  };

  // Handler for going to a folder
  const navigateToFolder = (folderId) => {
    setCurrentFolder(folderId);
    setPagination({ ...pagination, current: 1 }); // Reset to first page
  };

  // Handler for going up one level
  const navigateUp = () => {
    if (currentFolder === null) return;

    const currentFolderData = fileSystem.find(
      (item) => item.id === currentFolder
    );
    if (currentFolderData) {
      setCurrentFolder(currentFolderData.parent);
      setPagination({ ...pagination, current: 1 }); // Reset to first page
    }
  };

  // Handler for going to a specific level via breadcrumb
  const navigateToBreadcrumb = (folderId) => {
    if (folderId === null) {
      setCurrentFolder(null);
    } else {
      setCurrentFolder(folderId);
    }
    setPagination({ ...pagination, current: 1 }); // Reset to first page
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
    }

    switch (item.fileType) {
      case "pdf":
        return <FilePdfOutlined style={{ color: colors.error }} />;
      case "doc":
      case "docx":
        return <FileTextOutlined style={{ color: "#2a5699" }} />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FileImageOutlined style={{ color: colors.primary }} />;
      default:
        return <FileUnknownOutlined />;
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
    const newFolder = {
      id: Date.now().toString(), // In a real app, this would come from the server
      name: values.name,
      type: "folder",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      size: null,
      parent: currentFolder,
    };

    setFileSystem([...fileSystem, newFolder]);
    setModalVisible(false);
    message.success(`Folder "${values.name}" created successfully`);
  };

  // Handler for renaming an item
  const renameItem = (values) => {
    if (!selectedItem) return;

    const updatedFileSystem = fileSystem.map((item) => {
      if (item.id === selectedItem.id) {
        return {
          ...item,
          name: values.name,
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });

    setFileSystem(updatedFileSystem);
    setModalVisible(false);
    message.success(`Item renamed successfully`);
  };

  // Handler for deleting an item
  const deleteItem = (item) => {
    // In a real app, you'd need recursive deletion for folders
    Modal.confirm({
      title: `Delete ${item.type === "folder" ? "Folder" : "File"}`,
      content: `Are you sure you want to delete "${item.name}"? ${
        item.type === "folder" ? "All contents inside will be deleted too." : ""
      }`,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => {
        // First, get all IDs that need to be removed
        // For a folder, that includes the folder itself and all items inside it (recursively)
        const getAllItemsToDelete = (parentId) => {
          // Get the item itself
          const idsToRemove = [parentId];

          // If it's a folder, also get all items that have this folder as parent
          if (item.type === "folder") {
            // Find all items that have this folder as parent
            const childItems = fileSystem.filter((i) => i.parent === parentId);

            // For each child item, if it's a folder, recursively get its children
            childItems.forEach((childItem) => {
              if (childItem.type === "folder") {
                idsToRemove.push(...getAllItemsToDelete(childItem.id));
              } else {
                idsToRemove.push(childItem.id);
              }
            });
          }

          return idsToRemove;
        };

        const idsToRemove = getAllItemsToDelete(item.id);
        const newFileSystem = fileSystem.filter(
          (i) => !idsToRemove.includes(i.id)
        );

        setFileSystem(newFileSystem);
        message.success(`"${item.name}" deleted successfully`);
      },
    });
  };

  // Mock upload function
  const handleUpload = (values) => {
    const fileType = values.name.split(".").pop().toLowerCase();

    const newFile = {
      id: Date.now().toString(), // In a real app, this would come from the server
      name: values.name,
      type: "file",
      fileType: fileType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      size: Math.floor(Math.random() * 5000000), // Random size for demo
      parent: currentFolder,
    };

    setFileSystem([...fileSystem, newFile]);
    setModalVisible(false);
    message.success(`File "${values.name}" uploaded successfully`);
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
        render: (type, record) =>
          type === "folder"
            ? "Folder"
            : record.fileType
            ? record.fileType.toUpperCase()
            : "File",
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
    ...breadcrumbPath.map((item, index) => ({
      title: <a onClick={() => navigateToBreadcrumb(item.id)}>{item.name}</a>,
      key: item.id,
    })),
  ];

  const currentItems = getCurrentItems();

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
              onClick={() => showModal("upload")}
            >
              Upload
            </Button>
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

          {/* Filters and Search Section - Responsive */}
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
              pagination={{
                position: ["bottomRight"],
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`,
                size: isMobile ? "small" : "default",
                locale: { items_per_page: "/ page" },
                itemRender: (page, type, originalElement) => {
                  if (type === "prev") {
                    return (
                      <Button
                        icon={<span>&lt;</span>}
                        type="text"
                        size="small"
                      />
                    );
                  }
                  if (type === "next") {
                    return (
                      <Button
                        icon={<span>&gt;</span>}
                        type="text"
                        size="small"
                      />
                    );
                  }
                  return originalElement;
                },
                onChange: (page, pageSize) => {
                  setPagination({
                    ...pagination,
                    current: page,
                    pageSize: pageSize,
                    total: currentItems.length,
                  });
                },
                onShowSizeChange: (current, size) => {
                  setPagination({
                    ...pagination,
                    current: 1, // Reset to first page when changing page size
                    pageSize: size,
                    total: currentItems.length,
                  });
                },
              }}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <div>
                        <p>No files or folders found</p>
                        <Space>
                          <Button
                            type="primary"
                            onClick={() => showModal("newFolder")}
                          >
                            Create Folder
                          </Button>
                          <Button onClick={() => showModal("upload")}>
                            Upload File
                          </Button>
                        </Space>
                      </div>
                    }
                  />
                ),
              }}
            />
          </div>

          {/* Mobile information note */}
          {isMobile && (
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Swipe left/right to see more details. Tap the menu icon to view
                actions.
              </Text>
            </div>
          )}
        </Card>

        {/* Modal for Create Folder / Rename / Upload */}
        <Modal
          title={
            modalType === "newFolder"
              ? "Create New Folder"
              : modalType === "rename"
              ? "Rename Item"
              : "Upload File"
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
              } else if (modalType === "upload") {
                handleUpload(values);
              }
            }}
          >
            <Form.Item
              name="name"
              label={modalType === "upload" ? "File Name" : "Name"}
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
                    : modalType === "rename"
                    ? "Enter new name"
                    : "Enter file name with extension (e.g., document.pdf)"
                }
              />
            </Form.Item>

            {modalType === "upload" && (
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary">
                  Note: In a real implementation, a file upload component would
                  be here. For this demo, just enter a file name with extension.
                </Text>
              </div>
            )}

            <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
              <Space>
                <Button onClick={() => setModalVisible(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit">
                  {modalType === "newFolder"
                    ? "Create"
                    : modalType === "rename"
                    ? "Rename"
                    : "Upload"}
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

          .file-manager .ant-pagination-options-size-changer.ant-select {
            margin-right: 0;
          }

          @media (max-width: ${breakpoints.md}px) {
            .file-manager .ant-table {
              font-size: 13px;
            }

            .file-manager .ant-btn-sm {
              font-size: 12px;
              padding: 0 8px;
            }

            .file-manager .ant-table-pagination {
              flex-wrap: wrap;
            }
          }

          @media (max-width: ${breakpoints.sm}px) {
            .file-manager .ant-pagination-options {
              display: none;
            }

            .file-manager .ant-table-pagination-right {
              justify-content: center;
            }
          }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default FileManagerList;
