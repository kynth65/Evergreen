// src/components/ClientPayment/PaymentModal.jsx
import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Radio,
  Button,
  Divider,
  Row,
  Col,
} from "antd";
import dayjs from "dayjs";

const PaymentModal = ({ visible, client, onCancel, onSubmit }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && client) {
      // Calculate monthly payment amount
      const monthlyAmount =
        client.total_payments > 0
          ? Math.round(
              (client.total_contract_price || 0) / client.total_payments
            )
          : 0;

      // Set default form values
      form.setFieldsValue({
        amount: monthlyAmount,
        payment_date: dayjs(),
        payment_method: "cash",
        payment_for: `Monthly Payment (${client.completed_payments + 1}/${
          client.total_payments
        })`,
        remarks: "",
      });
    }
  }, [visible, client, form]);

  const handleSubmit = (values) => {
    // Format the payment date
    const formattedValues = {
      ...values,
      payment_date: values.payment_date.format("YYYY-MM-DD"),
    };

    onSubmit(formattedValues);
  };

  return (
    <Modal
      title={`Process Payment - ${client?.client_name || ""}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose={true}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        preserve={false}
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              name="payment_for"
              label="Payment For"
              rules={[
                { required: true, message: "Please enter payment description" },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="payment_date"
              label="Payment Date"
              rules={[
                { required: true, message: "Please select payment date" },
              ]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="amount"
              label="Amount"
              rules={[{ required: true, message: "Please enter amount" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) =>
                  `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/₱\s?|(,*)/g, "")}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="payment_method"
              label="Payment Method"
              rules={[
                { required: true, message: "Please select payment method" },
              ]}
            >
              <Radio.Group>
                <Radio.Button value="cash">Cash</Radio.Button>
                <Radio.Button value="check">Check</Radio.Button>
                <Radio.Button value="bank">Bank Transfer</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="remarks" label="Remarks">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Col>
        </Row>
        <Divider />
        <div style={{ textAlign: "right" }}>
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit">
            Process Payment & Generate AR
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default PaymentModal;
