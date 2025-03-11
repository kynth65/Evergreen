// src/pages/Admin/AdminLotList.jsx
import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../../axios.client";
import {
  Table,
  Button,
  Tag,
  Space,
  Tooltip,
  Popconfirm,
  Skeleton,
  message,
  Input,
  Select,
  Row,
  Col,
  Card,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from "@ant-design/icons";

const { Search } = Input;
const { Option } = Select;

const AdminLotList = () => {
  const [lots, setLots] = useState([]);
  const [filteredLots, setFilteredLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priceSort, setPriceSort] = useState(null);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const colors = {
    primary: "#1da57a", // Primary green
    secondary: "#52c41a", // Secondary lighter green
    warning: "#faad14",
    success: "#52c41a",
    error: "#f5222d",
    lightBg: "#f6ffed", // Light green background
  };

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchLots();
  }, []);

  // Effect to handle filtering and sorting
  useEffect(() => {
    if (lots.length > 0) {
      let result = [...lots];

      // Apply status filter
      if (statusFilter !== "ALL") {
        result = result.filter((lot) => lot.status === statusFilter);
      }

      // Apply search filter
      if (searchText) {
        const lowerSearchText = searchText.toLowerCase();
        result = result.filter(
          (lot) =>
            lot.property_name?.toLowerCase().includes(lowerSearchText) ||
            lot.block_lot_no?.toLowerCase().includes(lowerSearchText) ||
            lot.client?.toLowerCase().includes(lowerSearchText) ||
            String(lot.lot_area).includes(lowerSearchText) ||
            String(lot.total_contract_price).includes(lowerSearchText)
        );
      }

      // Apply price sorting
      if (priceSort === "asc") {
        result.sort((a, b) => {
          const priceA = a.total_contract_price || 0;
          const priceB = b.total_contract_price || 0;
          return priceA - priceB;
        });
      } else if (priceSort === "desc") {
        result.sort((a, b) => {
          const priceA = a.total_contract_price || 0;
          const priceB = b.total_contract_price || 0;
          return priceB - priceA;
        });
      }

      setFilteredLots(result);
    }
  }, [lots, statusFilter, priceSort, searchText]);

  const fetchLots = () => {
    setLoading(true);
    axiosClient
      .get("/lots")
      .then((response) => {
        setLots(response.data);
        setFilteredLots(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load lots data");
        setLoading(false);
        console.error("Error fetching lots:", err);
        message.error(
          "Failed to load lots: " + (err.response?.data?.message || err.message)
        );
      });
  };

  const deleteLot = (id) => {
    axiosClient
      .delete(`/lots/${id}`)
      .then(() => {
        message.success("Lot deleted successfully");
        fetchLots();
      })
      .catch((err) => {
        console.error("Error deleting lot:", err);
        message.error("Failed to delete lot");
      });
  };

  const showMainList = location.pathname === "/admin/lot-management";

  // Reset all filters
  const resetFilters = () => {
    setStatusFilter("ALL");
    setPriceSort(null);
    setSearchText("");
  };

  // Custom skeleton row for loading state
  const SkeletonRow = () => (
    <tr className="ant-table-row">
      <td>
        <Skeleton.Input active size="small" style={{ width: 40 }} />
      </td>
      <td>
        <Skeleton.Input active size="small" style={{ width: 150 }} />
      </td>
      <td>
        <Skeleton.Input active size="small" style={{ width: 80 }} />
      </td>
      <td>
        <Skeleton.Input active size="small" style={{ width: 100 }} />
      </td>
      <td>
        <Skeleton.Input active size="small" style={{ width: 100 }} />
      </td>
      <td>
        <Skeleton.Input active size="small" style={{ width: 80 }} />
      </td>
      <td>
        <Skeleton.Input active size="small" style={{ width: 100 }} />
      </td>
      <td>
        <Space>
          <Skeleton.Button active size="small" shape="square" />
          <Skeleton.Button active size="small" shape="square" />
          <Skeleton.Button active size="small" shape="square" />
        </Space>
      </td>
    </tr>
  );

  const columns = [
    {
      title: "#",
      key: "index",
      width: 60,
      render: (text, record, index) => {
        // Calculate the continuous row number based on pagination
        return (pagination.current - 1) * pagination.pageSize + index + 1;
      },
    },
    {
      title: "Property Name",
      dataIndex: "property_name",
      key: "property_name",
      render: (text, record) => (
        <Tooltip title="Click to view details">
          <a
            onClick={() => navigate(`/admin/lot-management/${record.id}/view`)}
          >
            {text}
          </a>
        </Tooltip>
      ),
    },
    {
      title: "Block & Lot No.",
      dataIndex: "block_lot_no",
      key: "block_lot_no",
    },
    {
      title: "Lot Area (Sqm)",
      dataIndex: "lot_area",
      key: "lot_area",
    },
    {
      title: "Total Contract Price",
      dataIndex: "total_contract_price",
      key: "total_contract_price",
      render: (price) => (price ? new Intl.NumberFormat().format(price) : "-"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        switch (status) {
          case "AVAILABLE":
            color = "success";
            break;
          case "SOLD":
            color = "error";
            break;
          case "EXCLUDED":
            color = "warning";
            break;
          default:
            break;
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Client",
      dataIndex: "client",
      key: "client",
      render: (client) => client || "-",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<FileOutlined />}
            size="small"
            onClick={() => navigate(`/admin/lot-management/${record.id}/view`)}
          >
            View
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => navigate(`/admin/lot-management/${record.id}/edit`)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this lot?"
            onConfirm={() => deleteLot(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-lot-management">
      <div
        className="header-section"
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 className="text-2xl">Lot Management</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{
            backgroundColor: colors.primary,
            borderColor: colors.primary,
          }}
          onClick={() => navigate("/admin/lot-management/new")}
        >
          Add Lot
        </Button>
      </div>

      {/* Display table of lots if on main list view */}
      {showMainList ? (
        <Card>
          {/* Filters and Search Section */}
          <div style={{ marginBottom: 20 }}>
            <Row gutter={16} align="middle">
              <Col xs={24} sm={24} md={8} lg={8}>
                <Search
                  placeholder="Search property, lot, client..."
                  allowClear
                  enterButton={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={(value) => setSearchText(value)}
                />
              </Col>
              <Col xs={12} sm={8} md={5} lg={4}>
                <Select
                  placeholder="Filter by Status"
                  style={{ width: "100%" }}
                  value={statusFilter}
                  onChange={setStatusFilter}
                >
                  <Option value="ALL">All Status</Option>
                  <Option value="AVAILABLE">Available</Option>
                  <Option value="SOLD">Sold</Option>
                  <Option value="EXCLUDED">Excluded</Option>
                </Select>
              </Col>
              <Col xs={12} sm={8} md={5} lg={4}>
                <Select
                  placeholder="Sort by Price"
                  style={{ width: "100%" }}
                  value={priceSort}
                  onChange={setPriceSort}
                >
                  <Option value={null}>Original Order</Option>
                  <Option value="asc">Price: Low to High</Option>
                  <Option value="desc">Price: High to Low</Option>
                </Select>
              </Col>
              <Col xs={24} sm={8} md={6} lg={4}>
                <Button onClick={resetFilters}>Reset Filters</Button>
              </Col>
            </Row>
          </div>

          <Table
            columns={columns}
            dataSource={filteredLots}
            rowKey="id"
            loading={false} // We're handling our own loading state with skeletons
            pagination={{
              position: ["bottomRight"],
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} lots`,
              onChange: (page, pageSize) => {
                setPagination({
                  ...pagination,
                  current: page,
                  pageSize: pageSize,
                  total: filteredLots.length,
                });
              },
              onShowSizeChange: (current, size) => {
                setPagination({
                  ...pagination,
                  current: 1, // Reset to first page when changing page size
                  pageSize: size,
                  total: filteredLots.length,
                });
              },
            }}
            components={{
              body: {
                wrapper: (props) => {
                  // Add skeleton rows if loading
                  if (loading) {
                    return (
                      <tbody {...props}>
                        {Array(5)
                          .fill(null)
                          .map((_, index) => (
                            <SkeletonRow key={index} />
                          ))}
                      </tbody>
                    );
                  }
                  return <tbody {...props} />;
                },
              },
            }}
          />
        </Card>
      ) : (
        // Outlet for child routes (AdminLotForm, AdminLotView)
        <Outlet context={{ refreshLots: fetchLots }} />
      )}
    </div>
  );
};

export default AdminLotList;
