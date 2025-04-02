// src/components/ClientPayment/PaymentReceiptModal.jsx
import React from "react";
import {
  Modal,
  Button,
  Divider,
  Row,
  Col,
  Typography,
  Tag,
  Table,
  Progress,
  Spin,
} from "antd";
import {
  FileOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

const PaymentReceiptModal = ({ visible, paymentData, onCancel, onAction }) => {
  if (!paymentData && visible) {
    return (
      <Modal
        title="Accounts Receivable (AR) Receipt"
        open={visible}
        onCancel={onCancel}
        footer={[
          <Button key="close" onClick={onCancel}>
            Close
          </Button>,
        ]}
        width={800}
      >
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin />
          <div style={{ marginTop: "10px" }}>Loading receipt data...</div>
        </div>
      </Modal>
    );
  }

  const handlePrint = () => {
    onAction("print");
  };

  const handleDownload = () => {
    onAction("download");
  };

  return (
    <Modal
      title="Accounts Receivable (AR) Receipt"
      open={visible && !!paymentData}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Close
        </Button>,
        <Button
          key="download"
          type="primary"
          icon={<FileOutlined />}
          onClick={handleDownload}
        >
          Download PDF
        </Button>,
        <Button
          key="print"
          type="primary"
          icon={<PrinterOutlined />}
          onClick={handlePrint}
        >
          Print Receipt
        </Button>,
      ]}
      width={800}
    >
      {paymentData && (
        <div
          className="ar-receipt"
          style={{ padding: "20px", border: "1px solid #f0f0f0" }}
        >
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <Title level={3}>EVERGREEN DEVELOPMENT CORPORATION</Title>
            <div>123 Real Estate Avenue, Metro Manila, Philippines</div>
            <div>Tel: (02) 8123-4567 | Email: payments@evergreen.com</div>
            <Title level={4} style={{ marginTop: "20px" }}>
              ACCOUNTS RECEIVABLE RECEIPT
            </Title>
          </div>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div>
                <strong>Receipt No:</strong> {paymentData.receipt_number}
              </div>
              <div>
                <strong>Date:</strong> {paymentData.payment_date}
              </div>
              <div>
                <strong>Time:</strong> {paymentData.payment_time}
              </div>
            </Col>
            <Col span={12} style={{ textAlign: "right" }}>
              <div>
                <strong>Payment Status:</strong> <Tag color="success">PAID</Tag>
              </div>
              <div>
                <strong>Payment Method:</strong>{" "}
                {paymentData.payment_method.toUpperCase()}
              </div>
            </Col>
          </Row>

          <Divider />

          <Row gutter={[16, 16]}>
            <Col span={24}>
              <div>
                <strong>Client Name:</strong> {paymentData.client.client_name}
              </div>
              <div>
                <strong>Property:</strong>{" "}
                {paymentData.client.lot_details.property_name}
              </div>
              <div>
                <strong>Block & Lot No:</strong>{" "}
                {paymentData.client.lot_details.block_lot_no}
              </div>
            </Col>
          </Row>

          <Divider />

          <Table
            dataSource={[
              {
                key: "1",
                description: paymentData.payment_for,
                amount: paymentData.amount,
              },
            ]}
            columns={[
              {
                title: "Description",
                dataIndex: "description",
                key: "description",
              },
              {
                title: "Amount",
                dataIndex: "amount",
                key: "amount",
                render: (amount) =>
                  `₱ ${amount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}`,
              },
            ]}
            pagination={false}
            summary={() => (
              <Table.Summary>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}>
                    <strong>Total Amount Paid</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <strong>
                      ₱{" "}
                      {paymentData.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />

          <div style={{ marginTop: "30px" }}>
            <Row gutter={16}>
              <Col span={12}>
                <div
                  style={{
                    borderTop: "1px solid #000",
                    marginTop: "40px",
                    paddingTop: "8px",
                  }}
                >
                  Client Signature
                </div>
              </Col>
              <Col span={12}>
                <div
                  style={{
                    borderTop: "1px solid #000",
                    marginTop: "40px",
                    paddingTop: "8px",
                  }}
                >
                  Authorized Signature
                </div>
              </Col>
            </Row>
          </div>

          <div style={{ marginTop: "40px", textAlign: "center" }}>
            <div>
              <strong>
                Payment {paymentData.new_payment_number} of{" "}
                {paymentData.client.total_payments}
              </strong>
            </div>
            <Progress
              percent={Math.round(
                (paymentData.new_payment_number /
                  paymentData.client.total_payments) *
                  100
              )}
              size="small"
              style={{ maxWidth: "300px", margin: "0 auto" }}
            />
            <div style={{ marginTop: "20px", color: "#389e0d" }}>
              <CheckCircleOutlined
                style={{ fontSize: "18px", marginRight: "8px" }}
              />
              Thank you for your payment!
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PaymentReceiptModal;
