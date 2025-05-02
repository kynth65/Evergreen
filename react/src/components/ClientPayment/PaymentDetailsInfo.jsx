import React from "react";
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
 * Combined component for payment summary and transaction history
 */
const PaymentDetailsInfo = ({ payment, paymentStatus }) => {
  const progress = calculateProgress(payment);
  const { totalAmount, paidAmount, remainingAmount } =
    calculateTotalAmounts(payment);

  // Process next payment date information to display in a user-friendly format
  const getNextPaymentInfo = () => {
    // Return null if payment is completed or spot cash or no next_payment_date
    if (
      payment.payment_status === "COMPLETED" ||
      payment.payment_type === "spot_cash" ||
      !payment.next_payment_date
    ) {
      return null;
    }

    const nextPaymentDue = dayjs(payment.next_payment_date);
    const startDate = dayjs(payment.start_date);
    const nextPaymentNumber = payment.completed_payments + 1;
    const isOverdue = dayjs().isAfter(nextPaymentDue);

    return {
      date: nextPaymentDue,
      paymentNumber: nextPaymentNumber,
      startMonth: startDate.format("MMMM YYYY"),
      isOverdue: isOverdue,
    };
  };

  const nextPaymentInfo = getNextPaymentInfo();

  // Transaction columns
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
      filters: [
        { text: "Cash", value: "CASH" },
        { text: "Check", value: "CHECK" },
        { text: "Bank Transfer", value: "BANK_TRANSFER" },
        { text: "Online", value: "ONLINE" },
      ],
      onFilter: (value, record) => record.payment_method === value,
    },
    {
      title: "Reference #",
      dataIndex: "reference_number",
      key: "reference_number",
      render: (text) => text || <Text type="secondary">N/A</Text>,
    },
    {
      title: "Notes",
      dataIndex: "payment_notes",
      key: "payment_notes",
      render: (text) => text || <Text type="secondary">-</Text>,
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
    <Col xs={24} lg={16}>
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
              title="Total Amount"
              value={roundUpToWhole(totalAmount)}
              precision={0}
              formatter={(value) => `₱${formatCurrency(value)}`}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Total Paid"
              value={roundUpToWhole(paidAmount)}
              precision={0}
              valueStyle={{ color: "#3f8600" }}
              formatter={(value) => `₱${formatCurrency(value)}`}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Remaining Balance"
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
              <Col xs={24} md={12}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Payment Type">
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
                  <Descriptions.Item label="Start Date">
                    {payment.start_date
                      ? dayjs(payment.start_date).format("MMMM D, YYYY")
                      : "N/A"}
                  </Descriptions.Item>
                  {payment.payment_type !== "spot_cash" && (
                    <>
                      <Descriptions.Item label="Installment Period">
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
                          <Descriptions.Item label="Expected Monthly">
                            ₱{formatCurrency(roundedMonthly)}
                          </Descriptions.Item>
                        );
                      })()}
                    </>
                  )}
                </Descriptions>
              </Col>
              <Col xs={24} md={12}>
                {payment.payment_type !== "spot_cash" && (
                  <>
                    <div style={{ marginBottom: 8 }}>
                      <Text strong>Payment Progress</Text>
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
                      <Text>
                        {progress.completed} of {progress.total} payments
                        completed ({progress.percent}%)
                      </Text>
                    </div>

                    {/* Show next payment due date using the database provided next_payment_date */}
                    {nextPaymentInfo &&
                      paymentStatus?.status !== "COMPLETED" && (
                        <div style={{ marginTop: 16 }}>
                          <Text strong>Next Payment Due:</Text>{" "}
                          <div>
                            <Text
                              type={
                                nextPaymentInfo.isOverdue ? "danger" : undefined
                              }
                            >
                              {nextPaymentInfo.date.format("MMMM D, YYYY")}
                            </Text>
                          </div>
                          <div>
                            <Text
                              type={
                                nextPaymentInfo.isOverdue
                                  ? "danger"
                                  : "secondary"
                              }
                              style={{ fontSize: "0.9em" }}
                            >
                              Payment #{nextPaymentInfo.paymentNumber} (from{" "}
                              {nextPaymentInfo.startMonth})
                              {nextPaymentInfo.isOverdue && " (Overdue)"}
                            </Text>
                          </div>
                        </div>
                      )}
                  </>
                )}
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Transaction History Table */}
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
          <FileTextOutlined />
          <span style={{ marginLeft: 8, fontWeight: "bold" }}>
            Transaction History
          </span>
        </div>

        {payment.paymentTransactions &&
        payment.paymentTransactions.length > 0 ? (
          <Table
            columns={transactionColumns}
            dataSource={payment.paymentTransactions}
            rowKey={(record) =>
              record.id || `${record.payment_number}-${record.payment_date}`
            }
            pagination={{ pageSize: 10, showSizeChanger: true }}
            size="small"
            scroll={{ x: 800 }}
          />
        ) : (
          <Empty description="No transactions recorded yet" />
        )}
      </Card>

      {/* Payment Schedule Table (if applicable) */}
      {payment.payment_type !== "spot_cash" &&
        payment.paymentSchedules &&
        payment.paymentSchedules.length > 0 && (
          <Card style={{ marginTop: 16 }}>
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
            <Table
              columns={scheduleColumns}
              dataSource={payment.paymentSchedules}
              rowKey={(record) => record.id || record.payment_number}
              pagination={{ pageSize: 5, showSizeChanger: false }}
              size="small"
              scroll={{ x: 600 }}
            />
          </Card>
        )}
    </Col>
  );
};

export default PaymentDetailsInfo;
