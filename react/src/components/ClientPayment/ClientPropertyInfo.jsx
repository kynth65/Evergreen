import React from "react";
import {
  Card,
  Space,
  Typography,
  Descriptions,
  Divider,
  Empty,
  Col,
  Row,
} from "antd";
import { UserOutlined, HomeOutlined } from "@ant-design/icons";
import { roundUpToWhole, formatCurrency } from "../../utils/numberFormatters";

const { Text } = Typography;

/**
 * Combined component for client and property information
 */
const ClientPropertyInfo = ({ payment }) => {
  return (
    <Col xs={24} lg={8}>
      {/* Client Information Card */}
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

      {/* Property Information Card */}
      <Card
        title={
          <Space>
            <HomeOutlined /> <span>Property Information</span>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        {payment.lots && payment.lots.length > 0 ? (
          <div>
            {payment.lots.map((lot, index) => (
              <div
                key={lot.id || index}
                style={{
                  marginBottom: index !== payment.lots.length - 1 ? 16 : 0,
                }}
              >
                <Descriptions column={1} size="small" bordered>
                  <Descriptions.Item label="Property Name">
                    {lot.property_name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Block & Lot No">
                    {lot.block_lot_no}
                  </Descriptions.Item>
                  <Descriptions.Item label="Lot Area">
                    {lot.lot_area} sqm
                  </Descriptions.Item>
                  <Descriptions.Item label="Contract Price">
                    ₱
                    {formatCurrency(
                      roundUpToWhole(lot.total_contract_price || 0)
                    )}
                  </Descriptions.Item>
                  {/* Display custom price if different */}
                  {lot.pivot?.custom_price &&
                    parseFloat(lot.pivot.custom_price) !==
                      parseFloat(lot.total_contract_price) && (
                      <Descriptions.Item label="Agreed Price">
                        <Text type="success">
                          ₱
                          {formatCurrency(
                            roundUpToWhole(lot.pivot.custom_price)
                          )}
                        </Text>
                      </Descriptions.Item>
                    )}
                </Descriptions>
                {index !== payment.lots.length - 1 && (
                  <Divider style={{ margin: "16px 0" }} />
                )}
              </div>
            ))}
          </div>
        ) : (
          <Empty description="No property information associated" />
        )}
      </Card>
    </Col>
  );
};

export default ClientPropertyInfo;
