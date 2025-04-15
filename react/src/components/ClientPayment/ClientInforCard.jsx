import React from "react";
import { Card, Space, Typography, Descriptions } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Text } = Typography;

/**
 * Component to display client information
 * @param {object} props
 * @param {object} props.payment - Payment data containing client information
 */
const ClientInfoCard = ({ payment }) => {
  return (
    <Card
      title={
        <Space>
          <UserOutlined /> <span>Client Information</span>
        </Space>
      }
      style={{ marginBottom: 16 }}
    >
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label="Client Name">
          {payment.client_name}
        </Descriptions.Item>
        <Descriptions.Item label="Contact Number">
          {payment.contact_number}
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          {payment.email || <Text type="secondary">Not provided</Text>}
        </Descriptions.Item>
        <Descriptions.Item label="Address">
          {payment.address || <Text type="secondary">Not provided</Text>}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default ClientInfoCard;
