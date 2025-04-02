import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  ConfigProvider,
  Tooltip,
  Progress,
  Tag,
  message,
  Radio,
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

const ClientPaymentAddForm = () => {
  const navigate = useNavigate();
  const { user } = useStateContext();
  const userRole = user?.role;

  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [lots, setLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [installmentYears, setInstallmentYears] = useState(1);
  const [paymentSchedule, setPaymentSchedule] = useState([]);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

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

  // Generate payment schedule
  const generatePaymentSchedule = (lotId, years, startDate) => {
    if (form.getFieldValue("payment_type") === "spot_cash") {
      const selectedLotData = lots.find((lot) => lot.id === lotId);
      if (!selectedLotData || !selectedLotData.total_contract_price) return;

      setPaymentSchedule([
        {
          payment_number: 1,
          due_date: startDate.format("YYYY-MM-DD"),
          amount: selectedLotData.total_contract_price,
          status: "PAID",
        },
      ]);

      // Set minimal values for installment-related fields
      setInstallmentYears(1);
      form.setFieldValue("installment_years", 1);
    } else {
      // Existing installment logic
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
          status: i === 0 ? "PAID" : "PENDING",
        });
        currentDate = currentDate.add(1, "month");
      }
      setPaymentSchedule(schedule);
    }
  };

  // Handle form submission
  const onFinish = (values) => {
    setSubmitting(true);
    const formattedValues = {
      ...values,
      start_date: values.start_date
        ? values.start_date.format("YYYY-MM-DD")
        : null,
      next_payment_date:
        values.payment_type === "spot_cash"
          ? values.start_date.format("YYYY-MM-DD")
          : values.next_payment_date
          ? values.next_payment_date.format("YYYY-MM-DD")
          : null,
      total_payments: 1, // Always 1 for spot cash
      completed_payments: 1, // Always completed for spot cash
      installment_years: 1, // Default to 1 for spot cash
      payment_schedule: paymentSchedule,
      payment_status: "COMPLETED", // Spot cash is always completed
    };

    axiosClient
      .post("/client-payments", formattedValues)
      .then((response) => {
        setSubmitting(false);
        message.success("Client payment record created successfully");
        navigate(`/${userRole}/client-payments`);
      })
      .catch((error) => {
        setSubmitting(false);
        console.error("Error saving client payment data:", error);
        message.error(
          "Failed to save client payment data: " +
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
              Add New Client Payment
            </Title>
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            completed_payments: 1, // Default to 1 for spot cash
            installment_years: 1, // Keep this, but make it optional
            start_date: dayjs(), // Default to current date
            payment_type: "spot_cash", // Default to spot cash
          }}
        >
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
                      name="payment_type"
                      label="Payment Type"
                      rules={[
                        {
                          required: true,
                          message: "Please select payment type",
                        },
                      ]}
                    >
                      <Radio.Group
                        onChange={(e) => {
                          const paymentType = e.target.value;
                          if (paymentType === "spot_cash") {
                            // Automatically set to completed for spot cash
                            form.setFieldsValue({
                              installment_years: 1,
                              completed_payments: 1,
                              next_payment_date:
                                form.getFieldValue("start_date"),
                            });
                          } else {
                            // Reset for installment
                            form.setFieldsValue({
                              installment_years: 1,
                              completed_payments: 0,
                              next_payment_date: null,
                            });
                          }
                        }}
                      >
                        <Radio.Button value="installment">
                          Installment
                        </Radio.Button>
                        <Radio.Button value="spot_cash">Spot Cash</Radio.Button>
                      </Radio.Group>
                    </Form.Item>
                  </Col>

                  {form.getFieldValue("payment_type") === "installment" && (
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="installment_years"
                        label="Installment Period (Years)"
                      >
                        <InputNumber
                          min={1}
                          max={30}
                          style={{ width: "100%" }}
                          onChange={handleYearsChange}
                        />
                      </Form.Item>
                    </Col>
                  )}

                  <Col xs={24} md={8}>
                    <Form.Item
                      name="installment_years"
                      label="Installment Period (Years)"
                      rules={[
                        {
                          required:
                            form.getFieldValue("payment_type") !== "spot_cash",
                          message: "Please specify installment years",
                        },
                      ]}
                    >
                      <InputNumber
                        min={1}
                        max={30}
                        style={{ width: "100%" }}
                        onChange={handleYearsChange}
                        disabled={
                          form.getFieldValue("payment_type") === "spot_cash"
                        }
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
                        onChange={(date) => {
                          handleStartDateChange(date);

                          // If spot cash, automatically set next payment date and completed payments
                          if (
                            form.getFieldValue("payment_type") === "spot_cash"
                          ) {
                            form.setFieldsValue({
                              next_payment_date: date,
                              completed_payments: 1,
                            });
                          }
                        }}
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
                      <Input
                        value={
                          form.getFieldValue("payment_type") === "spot_cash"
                            ? "1"
                            : `${installmentYears * 12}`
                        }
                        readOnly
                        addonAfter={
                          form.getFieldValue("payment_type") === "spot_cash"
                            ? "payment"
                            : "months"
                        }
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
                        const paymentType = getFieldValue("payment_type");
                        const completed =
                          paymentType === "spot_cash"
                            ? 1
                            : getFieldValue("completed_payments") || 0;
                        const total =
                          paymentType === "spot_cash"
                            ? 1
                            : installmentYears * 12;
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
                Save Client Payment
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </ConfigProvider>
  );
};

export default ClientPaymentAddForm;
