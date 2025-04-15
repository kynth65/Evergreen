import React from "react";
import { Card, Space, Typography } from "antd";
import { FileTextOutlined } from "@ant-design/icons";

const { Paragraph } = Typography;

/**
 * Component to display payment notes
 * @param {object} props
 * @param {string} props.notes - Payment notes text
 */
const PaymentNotesCard = ({ notes }) => {
  return (
    <Card
      title={
        <Space>
          <FileTextOutlined /> <span>General Payment Notes</span>
        </Space>
      }
      style={{ marginTop: 16 }}
    >
      <Paragraph style={{ whiteSpace: "pre-wrap" }}>{notes}</Paragraph>
    </Card>
  );
};

export default PaymentNotesCard;
