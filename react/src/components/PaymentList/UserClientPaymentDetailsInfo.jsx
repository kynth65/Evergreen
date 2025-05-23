import React, { useEffect, useState } from "react";
import {
  Card,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Divider,
  Descriptions,
  Tag,
  Progress,
  Table,
  Empty,
} from "antd";
import {
  DollarOutlined,
  FileTextOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  roundUpToWhole,
  formatCurrency,
  calculateProgress,
  calculateTotalAmounts,
} from "../../utils/numberFormatters";

const { Text } = Typography;

/**
 * Client view for payment details and transaction history
 */
const UserClientPaymentDetailsInfo = ({ payment, paymentStatus }) => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const isMobile = screenWidth < 768;

  // Update screen width on resize
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const progress = calculateProgress(payment);
  const { totalAmount, paidAmount, remainingAmount } =
    calculateTotalAmounts(payment);

  // Transaction columns - simplified for client view
  const transactionColumns = [
    {
      title: "Payment #",
      dataIndex: "payment_number",
      key: "payment_number",
      sorter: (a, b) => a.payment_number - b.payment_number,
    },
    {
      title: "Date",
      dataIndex: "payment_date",
      key: "payment_date",
      render: (text) => (text ? dayjs(text).format("MMM D, YYYY") : "N/A"),
      sorter: (a, b) =>
        dayjs(a.payment_date).unix() - dayjs(b.payment_date).unix(),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text) => <Text>₱{formatCurrency(roundUpToWhole(text))}</Text>,
    },
    {
      title: "Method",
      dataIndex: "payment_method",
      key: "payment_method",
      responsive: ["md"],
      render: (text) => {
        const methodColors = {
          CASH: "green",
          CHECK: "blue",
          BANK_TRANSFER: "purple",
          ONLINE: "cyan",
          undefined: "default",
          null: "default",
        };
        return (
          <Tag color={methodColors[text] || "default"}>{text || "N/A"}</Tag>
        );
      },
    },
    {
      title: "Reference #",
      dataIndex: "reference_number",
      key: "reference_number",
      responsive: ["lg"],
      render: (text) => text || <Text type="secondary">N/A</Text>,
    },
  ];

  // Schedule columns
  const scheduleColumns = [
    {
      title: "Payment #",
      dataIndex: "payment_number",
      key: "payment_number",
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: (text) => dayjs(text).format("MMM D, YYYY"),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text) => <Text>₱{formatCurrency(roundUpToWhole(text))}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text, record) => {
        const correspondingTransaction = payment?.paymentTransactions?.find(
          (tx) => tx.payment_number === record.payment_number
        );
        const today = dayjs();
        const dueDate = dayjs(record.due_date);
        let color = "default";
        let statusText = "PENDING";

        if (correspondingTransaction) {
          statusText = "PAID";
          color = "success";
        } else if (today.isAfter(dueDate, "day")) {
          const daysDiff = today.diff(dueDate, "day");
          statusText = daysDiff > 30 ? "SUPER LATE" : "LATE";
          color = daysDiff > 30 ? "error" : "warning";
        }

        return <Tag color={color}>{statusText}</Tag>;
      },
    },
  ];

  return (
    <Col xs={24} lg={24}>
      {/* Payment Summary Card */}
      <Card
        title={
          <Space>
            <DollarOutlined /> <span>Payment Summary</span>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Statistic
              title={<span className="text-dark">Total Amount</span>}
              value={roundUpToWhole(totalAmount)}
              precision={0}
              formatter={(value) => `₱${formatCurrency(value)}`}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title={<span className="text-dark">Total Paid</span>}
              value={roundUpToWhole(paidAmount)}
              precision={0}
              valueStyle={{ color: "#3f8600" }}
              formatter={(value) => `₱${formatCurrency(value)}`}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title={<span className="text-dark">Remaining Balance</span>}
              value={roundUpToWhole(remainingAmount)}
              precision={0}
              valueStyle={{
                color: remainingAmount > 0 ? "#cf1322" : "#3f8600",
              }}
              formatter={(value) => `₱${formatCurrency(value)}`}
            />
          </Col>
          <Col xs={24}>
            <Divider style={{ margin: "8px 0 16px" }} />
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Descriptions
                  column={{ xs: 1, sm: 2, md: 4 }}
                  size="small"
                  className="text-dark"
                >
                  <Descriptions.Item
                    label={<span className="text-dark">Payment Type</span>}
                  >
                    <Tag
                      color={
                        payment.payment_type === "spot_cash" ? "green" : "blue"
                      }
                    >
                      {payment.payment_type === "spot_cash"
                        ? "Spot Cash"
                        : "Installment"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={<span className="text-dark">Start Date</span>}
                  >
                    {payment.start_date
                      ? dayjs(payment.start_date).format("MMMM D, YYYY")
                      : "N/A"}
                  </Descriptions.Item>
                  {payment.payment_type !== "spot_cash" && (
                    <>
                      <Descriptions.Item
                        label={
                          <span className="text-dark">Installment Period</span>
                        }
                      >
                        {payment.installment_years}{" "}
                        {payment.installment_years > 1 ? "years" : "year"} (
                        {payment.installment_years * 12} months)
                      </Descriptions.Item>
                      {/* Calculate monthly payment based on total amount and period */}
                      {(() => {
                        const totalInstallments =
                          payment.installment_years * 12;
                        const monthly =
                          totalInstallments > 0
                            ? payment.total_amount / totalInstallments
                            : 0;
                        // Round up the monthly payment
                        const roundedMonthly = roundUpToWhole(monthly);
                        return (
                          <Descriptions.Item
                            label={
                              <span className="text-dark">Monthly Payment</span>
                            }
                          >
                            ₱{formatCurrency(roundedMonthly)}
                          </Descriptions.Item>
                        );
                      })()}
                    </>
                  )}
                </Descriptions>
              </Col>
            </Row>

            {/* Payment Progress - Moved Below */}
            {payment.payment_type !== "spot_cash" && (
              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong className="text-dark" style={{ fontSize: 16 }}>
                      Payment Progress
                    </Text>
                  </div>
                  <Progress
                    percent={progress.percent}
                    status={
                      progress.percent === 100
                        ? "success"
                        : paymentStatus?.status === "LATE" ||
                          paymentStatus?.status === "SUPER LATE"
                        ? "exception"
                        : "active"
                    }
                    strokeColor={
                      progress.percent < 30
                        ? "#f5222d"
                        : progress.percent < 70
                        ? "#faad14"
                        : "#52c41a"
                    }
                  />
                  <div style={{ marginTop: 8 }}>
                    <Text className="text-dark">
                      {progress.completed} of {progress.total} payments
                      completed ({progress.percent}%)
                    </Text>
                  </div>

                  {/* Show next payment due date */}
                  {payment.next_payment_date &&
                    paymentStatus?.status !== "COMPLETED" && (
                      <div style={{ marginTop: 16 }}>
                        <Text strong className="text-dark">
                          Next Payment Due:
                        </Text>{" "}
                        <Text
                          className={
                            paymentStatus?.status === "LATE" ||
                            paymentStatus?.status === "SUPER LATE"
                              ? "text-danger"
                              : "text-dark"
                          }
                        >
                          {dayjs(payment.next_payment_date).format(
                            "MMMM D, YYYY"
                          )}
                          {(paymentStatus?.status === "LATE" ||
                            paymentStatus?.status === "SUPER LATE") && (
                            <Text className="text-danger"> (Overdue)</Text>
                          )}
                        </Text>
                      </div>
                    )}
                </Col>
              </Row>
            )}
          </Col>
        </Row>
      </Card>

      {/* Property Information */}
      {payment.lots && payment.lots.length > 0 && (
        <Card
          title={
            <Space>
              <span role="img" aria-label="home" className="anticon">
                🏠
              </span>
              <span>Property Information</span>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 16]}>
            {payment.lots.map((lot, index) => (
              <Col key={lot.id || index} xs={24}>
                <Descriptions
                  column={{ xs: 1, sm: 2, md: 3 }}
                  bordered
                  size="small"
                  className="text-dark"
                >
                  <Descriptions.Item
                    label={<span className="text-dark">Property Name</span>}
                  >
                    {lot.property_name || "—"}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={<span className="text-dark">Block & Lot</span>}
                  >
                    {lot.block_lot_no || "—"}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={<span className="text-dark">Lot Area</span>}
                  >
                    {lot.lot_area ? `${lot.lot_area} sqm` : "—"}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={<span className="text-dark">Subdivision</span>}
                  >
                    {lot.subdivision || "—"}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={<span className="text-dark">Status</span>}
                  >
                    <Tag color={lot.status === "SOLD" ? "green" : "blue"}>
                      {lot.status || "—"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={<span className="text-dark">Contract Price</span>}
                  >
                    ₱{formatCurrency(lot.total_contract_price || 0)}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Transaction History Table */}
      <Card style={{ marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid #f0f0f0",
            padding: "12px 0",
            marginBottom: 16,
          }}
        >
          <FileTextOutlined />
          <span style={{ marginLeft: 8, fontWeight: "bold" }}>
            Payment History
          </span>
        </div>

        {payment.paymentTransactions &&
        payment.paymentTransactions.length > 0 ? (
          <div className="table-responsive">
            <Table
              columns={transactionColumns}
              dataSource={payment.paymentTransactions}
              rowKey={(record) =>
                record.id || `${record.payment_number}-${record.payment_date}`
              }
              pagination={{
                pageSize: 5,
                showSizeChanger: !isMobile,
                size: isMobile ? "small" : "default",
              }}
              size={isMobile ? "small" : "middle"}
              scroll={{ x: "max-content" }}
            />
          </div>
        ) : (
          <Empty description="No payment history available" />
        )}
      </Card>

      {/* Payment Schedule Table (if applicable) */}
      {payment.payment_type !== "spot_cash" &&
        payment.paymentSchedules &&
        payment.paymentSchedules.length > 0 && (
          <Card>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                borderBottom: "1px solid #f0f0f0",
                padding: "12px 0",
                marginBottom: 16,
              }}
            >
              <CalendarOutlined />
              <span style={{ marginLeft: 8, fontWeight: "bold" }}>
                Payment Schedule
              </span>
            </div>
            <div className="table-responsive">
              <Table
                columns={scheduleColumns}
                dataSource={payment.paymentSchedules.sort(
                  (a, b) => a.payment_number - b.payment_number
                )}
                rowKey={(record) => record.id || record.payment_number}
                pagination={{
                  pageSize: isMobile ? 3 : 5,
                  showSizeChanger: !isMobile,
                  size: isMobile ? "small" : "default",
                }}
                size={isMobile ? "small" : "middle"}
                scroll={{ x: "max-content" }}
              />
            </div>
          </Card>
        )}

      {/* Add responsive styles */}
      <style jsx global>{`
        .text-dark {
          color: rgba(0, 0, 0, 0.85) !important;
        }

        .text-danger {
          color: #cf1322 !important;
        }

        .ant-descriptions-item-label {
          color: rgba(0, 0, 0, 0.85) !important;
          font-weight: 500;
        }

        .ant-descriptions-item-content {
          color: rgba(0, 0, 0, 0.85) !important;
        }

        .ant-statistic-title {
          color: rgba(0, 0, 0, 0.85) !important;
          font-weight: 500;
        }

        .table-responsive {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        @media (max-width: 768px) {
          .ant-card-body {
            padding: 12px;
          }

          .ant-descriptions-item-label,
          .ant-descriptions-item-content {
            padding: 8px;
          }

          .ant-statistic-title {
            font-size: 14px;
          }

          .ant-statistic-content {
            font-size: 20px;
          }
        }
      `}</style>
    </Col>
  );
};

export default UserClientPaymentDetailsInfo;
