import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../axios.client";
import { useStateContext } from "../../context/ContextProvider";
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  InputNumber,
  Typography,
  Divider,
  Space,
  Spin,
  message,
  ConfigProvider,
  Tooltip,
  Progress,
  Tag,
} from "antd";
import {
  SaveOutlined,
  CloseOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined,
  DollarOutlined,
  UserOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ClientPaymentEditForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useStateContext();
  const userRole = user?.role;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lots, setLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [installmentYears, setInstallmentYears] = useState(1);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [paymentSchedule, setPaymentSchedule] = useState([]);
  const [clientData, setClientData] = useState(null);

  const colors = {
    primary: "#1da57a",
    secondary: "#52c41a",
    warning: "#faad14",
    success: "#52c41a",
    error: "#f5222d",
    lightBg: "#f6ffed",
  };

  const breakpoints = {
    xs: 480,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1600,
  };

  // Screen resize effect
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = screenWidth < breakpoints.md;

  // Fetch available lots
  useEffect(() => {
    const fetchLots = async () => {
      try {
        const response = await axiosClient.get("/lots");
        const availableLots = response.data.filter(
          (lot) => lot.status === "AVAILABLE" || lot.status === "SOLD"
        );
        setLots(availableLots);
      } catch (error) {
        console.error("Error fetching lots:", error);
        message.error("Failed to load available lots");
      }
    };
    fetchLots();
  }, []);

  // Load client payment data for edit
  useEffect(() => {
    const fetchClientPaymentData = async () => {
      try {
        const response = await axiosClient.get(`/client-payments/${id}`);
        const data = response.data;
        setClientData(data);
        setSelectedLot(data.lot_id);
        setInstallmentYears(data.installment_years);

        // Format data for form
        const formData = {
          ...data,
          start_date: data.start_date ? dayjs(data.start_date) : null,
          next_payment_date: data.next_payment_date
            ? dayjs(data.next_payment_date)
            : null,
        };

        form.setFieldsValue(formData);
        setLoading(false);

        // Generate payment schedule if all required data is available
        if (data.lot_id && data.installment_years && data.start_date) {
          generatePaymentSchedule(
            data.lot_id,
            data.installment_years,
            dayjs(data.start_date)
          );
        }
      } catch (error) {
        console.error("Error loading client payment data:", error);
        message.error("Failed to load client payment data");
        setLoading(false);
        navigate(`/${userRole}/client-payments`);
      }
    };

    fetchClientPaymentData();
  }, [id, form, navigate, userRole]);

  // Generate payment schedule
  const generatePaymentSchedule = (lotId, years, startDate) => {
    if (!lotId || !years || !startDate) return;
    const selectedLotData = lots.find((lot) => lot.id === lotId);
    if (!selectedLotData || !selectedLotData.total_contract_price) return;

    const totalMonths = years * 12;
    const monthlyPayment = selectedLotData.total_contract_price / totalMonths;
    const schedule = [];
    let currentDate = startDate.clone();

    for (let i = 0; i < totalMonths; i++) {
      schedule.push({
        payment_number: i + 1,
        due_date: currentDate.format("YYYY-MM-DD"),
        amount: monthlyPayment,
        status: i < (clientData?.completed_payments || 0) ? "PAID" : "PENDING",
      });
      currentDate = currentDate.add(1, "month");
    }
    setPaymentSchedule(schedule);
  };

  // Handle form submission
  const onFinish = (values) => {
    setSubmitting(true);
    const formattedValues = {
      ...values,
      start_date: values.start_date
        ? values.start_date.format("YYYY-MM-DD")
        : null,
      next_payment_date: values.next_payment_date
        ? values.next_payment_date.format("YYYY-MM-DD")
        : null,
      total_payments: installmentYears * 12,
      payment_schedule: paymentSchedule,
      payment_status:
        values.completed_payments === 0
          ? "NOT_STARTED"
          : values.completed_payments >= installmentYears * 12
          ? "COMPLETED"
          : "IN_PROGRESS",
    };

    axiosClient
      .put(`/client-payments/${id}`, formattedValues)
      .then((response) => {
        setSubmitting(false);
        message.success("Client payment record updated successfully");
        navigate(`/${userRole}/client-payments`);
      })
      .catch((error) => {
        setSubmitting(false);
        console.error("Error updating client payment data:", error);
        message.error(
          "Failed to update client payment data: " +
            (error.response?.data?.message || error.message)
        );
      });
  };

  // Lot change handler
  const handleLotChange = (lotId) => {
    setSelectedLot(lotId);
    form.setFieldValue("completed_payments", 0);
    const startDate = form.getFieldValue("start_date");
    if (lotId && installmentYears && startDate) {
      generatePaymentSchedule(lotId, installmentYears, startDate);
    }
  };

  // Installment years change handler
  const handleYearsChange = (years) => {
    setInstallmentYears(years);
    form.setFieldValue("completed_payments", 0);
    const lotId = form.getFieldValue("lot_id");
    const startDate = form.getFieldValue("start_date");
    if (lotId && years && startDate) {
      generatePaymentSchedule(lotId, years, startDate);
    }
  };

  // Start date change handler
  const handleStartDateChange = (date) => {
    const lotId = form.getFieldValue("lot_id");
    if (lotId && installmentYears && date) {
      generatePaymentSchedule(lotId, installmentYears, date);
    }
  };

  // Calculate monthly payment
  const calculateMonthlyPayment = () => {
    if (!selectedLot) return null;
    const selectedLotData = lots.find((lot) => lot.id === selectedLot);
    if (
      !selectedLotData ||
      !selectedLotData.total_contract_price ||
      !installmentYears
    )
      return null;
    return selectedLotData.total_contract_price / (installmentYears * 12);
  };

  const monthlyPayment = calculateMonthlyPayment();

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Loading client payment data...</div>
        </div>
      </Card>
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: colors.primary,
        },
      }}
    >
      <Card
        title={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(`/${userRole}/client-payments`)}
              style={{ marginRight: 16 }}
            >
              Back
            </Button>
            <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
              Edit Client Payment
            </Title>
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={[16, 16]}>
            {/* Client Information */}
            <Col xs={24} md={12}>
              <Card
                type="inner"
                title={
                  <span>
                    <UserOutlined style={{ marginRight: 8 }} />
                    Client Information
                  </span>
                }
                style={{ marginBottom: 16 }}
              >
                <Form.Item
                  name="client_name"
                  label="Client Name"
                  rules={[
                    {
                      required: true,
                      message: "Please enter client name",
                    },
                  ]}
                >
                  <Input placeholder="Full name of the client" />
                </Form.Item>
                <Form.Item
                  name="contact_number"
                  label="Contact Number"
                  rules={[
                    {
                      required: true,
                      message: "Please enter contact number",
                    },
                  ]}
                >
                  <Input placeholder="Client's contact number" />
                </Form.Item>
                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    {
                      type: "email",
                      message: "Please enter a valid email",
                    },
                  ]}
                >
                  <Input placeholder="Client's email address" />
                </Form.Item>
                <Form.Item name="address" label="Address">
                  <TextArea
                    placeholder="Client's address"
                    autoSize={{ minRows: 2, maxRows: 4 }}
                  />
                </Form.Item>
              </Card>
            </Col>

            {/* Property/Lot Information */}
            <Col xs={24} md={12}>
              <Card
                type="inner"
                title={
                  <span>
                    <HomeOutlined style={{ marginRight: 8 }} />
                    Property Information
                  </span>
                }
                style={{ marginBottom: 16 }}
              >
                <Form.Item
                  name="lot_id"
                  label="Select Property/Lot"
                  rules={[
                    {
                      required: true,
                      message: "Please select a property/lot",
                    },
                  ]}
                >
                  <Select
                    placeholder="Select a property/lot"
                    onChange={handleLotChange}
                    optionFilterProp="children"
                    showSearch
                  >
                    {lots.map((lot) => (
                      <Option key={lot.id} value={lot.id}>
                        {lot.property_name} - {lot.block_lot_no} ({lot.status})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {selectedLot && (
                  <div className="lot-details">
                    {lots
                      .filter((lot) => lot.id === selectedLot)
                      .map((lot) => (
                        <div key={lot.id}>
                          <Row gutter={[16, 8]}>
                            <Col span={12}>
                              <Text strong>Block & Lot No:</Text>
                            </Col>
                            <Col span={12}>
                              <Text>{lot.block_lot_no}</Text>
                            </Col>
                            <Col span={12}>
                              <Text strong>Lot Area:</Text>
                            </Col>
                            <Col span={12}>
                              <Text>{lot.lot_area} sqm</Text>
                            </Col>
                            <Col span={12}>
                              <Text strong>Total Contract Price:</Text>
                            </Col>
                            <Col span={12}>
                              <Text>
                                {new Intl.NumberFormat().format(
                                  lot.total_contract_price
                                )}
                              </Text>
                            </Col>
                          </Row>
                        </div>
                      ))}
                  </div>
                )}
              </Card>
            </Col>

            {/* Payment Information */}
            <Col xs={24}>
              <Card
                type="inner"
                title={
                  <span>
                    <DollarOutlined style={{ marginRight: 8 }} />
                    Payment Information
                  </span>
                }
                style={{ marginBottom: 16 }}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="installment_years"
                      label="Installment Period (Years)"
                      rules={[
                        {
                          required: true,
                          message: "Please specify installment years",
                        },
                      ]}
                    >
                      <InputNumber
                        min={1}
                        max={30}
                        style={{ width: "100%" }}
                        onChange={handleYearsChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="start_date"
                      label="Start Date"
                      rules={[
                        {
                          required: true,
                          message: "Please select start date",
                        },
                      ]}
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        format="YYYY-MM-DD"
                        onChange={handleStartDateChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="next_payment_date"
                      label="Next Payment Date"
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        format="YYYY-MM-DD"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label={
                        <span>
                          Total Payments
                          <Tooltip title="Total number of installments based on the years selected">
                            <InfoCircleOutlined style={{ marginLeft: 8 }} />
                          </Tooltip>
                        </span>
                      }
                    >
                      <Input
                        value={installmentYears * 12}
                        readOnly
                        addonAfter="months"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label={
                        <span>
                          Monthly Payment
                          <Tooltip title="Monthly payment amount based on the total contract price and installment period">
                            <InfoCircleOutlined style={{ marginLeft: 8 }} />
                          </Tooltip>
                        </span>
                      }
                    >
                      <Input
                        value={
                          monthlyPayment
                            ? new Intl.NumberFormat().format(
                                monthlyPayment.toFixed(2)
                              )
                            : "-"
                        }
                        readOnly
                        prefix="₱"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="completed_payments"
                      label={
                        <span>
                          Completed Payments
                          <Tooltip title="Number of payments already made">
                            <InfoCircleOutlined style={{ marginLeft: 8 }} />
                          </Tooltip>
                        </span>
                      }
                      rules={[
                        {
                          required: true,
                          message: "Please enter completed payments",
                        },
                      ]}
                    >
                      <InputNumber
                        min={0}
                        max={installmentYears * 12}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item
                      label="Payment Progress"
                      shouldUpdate={(prevValues, currentValues) =>
                        prevValues.completed_payments !==
                        currentValues.completed_payments
                      }
                    >
                      {({ getFieldValue }) => {
                        const completed =
                          getFieldValue("completed_payments") || 0;
                        const total = installmentYears * 12;
                        const percent = Math.round((completed / total) * 100);
                        let strokeColor = colors.success;
                        if (percent < 30) {
                          strokeColor = colors.error;
                        } else if (percent < 70) {
                          strokeColor = colors.warning;
                        }
                        let status = "Not Started";
                        if (percent === 100) {
                          status = "Completed";
                        } else if (percent > 0) {
                          status = "In Progress";
                        }
                        return (
                          <div>
                            <Progress
                              percent={percent}
                              strokeColor={strokeColor}
                              format={() => `${completed}/${total}`}
                            />
                            <div style={{ marginTop: 8 }}>
                              <Tag
                                color={
                                  percent === 100
                                    ? "success"
                                    : percent > 0
                                    ? "processing"
                                    : "default"
                                }
                              >
                                {status}
                              </Tag>
                              <Text style={{ marginLeft: 8 }}>
                                {completed} of {total} payments completed (
                                {percent}%)
                              </Text>
                            </div>
                          </div>
                        );
                      }}
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item name="payment_notes" label="Payment Notes">
                      <TextArea
                        placeholder="Additional notes about payment arrangements"
                        autoSize={{ minRows: 2, maxRows: 4 }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
          <Divider />
          <Row justify="end" gutter={[16, 16]}>
            <Col>
              <Button
                icon={<CloseOutlined />}
                onClick={() => navigate(`/${userRole}/client-payments`)}
              >
                Cancel
              </Button>
            </Col>
            <Col>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={submitting}
              >
                Update Client Payment
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </ConfigProvider>
  );
};

export default ClientPaymentEditForm;
