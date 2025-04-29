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
  Table,
  Empty,
  Spin,
} from "antd";
import {
  SaveOutlined,
  CloseOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined,
  DollarOutlined,
  UserOutlined,
  HomeOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ClientPaymentAddForm = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { user } = useStateContext();
  const userRole = user?.role;

  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [lots, setLots] = useState([]);
  const [selectedLots, setSelectedLots] = useState([]);
  const [installmentYears, setInstallmentYears] = useState(1);
  const [paymentSchedule, setPaymentSchedule] = useState([]);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [customPrices, setCustomPrices] = useState({});
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);

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

  // Fetch client users
  useEffect(() => {
    const fetchClients = async () => {
      setLoadingClients(true);
      try {
        const response = await axiosClient.get("/client-payments/clients");
        setClients(response.data);
      } catch (error) {
        console.error("Error fetching clients:", error);
        message.error("Failed to load client users");
      } finally {
        setLoadingClients(false);
      }
    };
    fetchClients();
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

  // Calculate total price of selected lots
  const calculateTotalPrice = () => {
    return selectedLots.reduce((total, lotId) => {
      const lot = lots.find((l) => l.id === lotId);
      // Use custom price if set, otherwise use the lot's contract price
      const price = customPrices[lotId] || (lot ? lot.total_contract_price : 0);
      return total + parseInt(price || 0);
    }, 0);
  };

  // Generate payment schedule
  const generatePaymentSchedule = () => {
    const paymentType = form.getFieldValue("payment_type");
    const startDate = form.getFieldValue("start_date");

    if (!startDate || selectedLots.length === 0) return;

    const totalPrice = calculateTotalPrice();

    if (paymentType === "spot_cash") {
      // For spot cash, just one payment
      setPaymentSchedule([
        {
          payment_number: 1,
          due_date: startDate.format("YYYY-MM-DD"),
          amount: totalPrice,
          status: "PAID",
        },
      ]);

      // Set minimal values for installment-related fields
      setInstallmentYears(1);
      form.setFieldValue("installment_years", 1);
      form.setFieldValue("completed_payments", 1);
    } else {
      // For installment
      const years = form.getFieldValue("installment_years") || 1;
      const totalMonths = years * 12;
      const monthlyPayment = Math.floor(totalPrice / totalMonths);

      const schedule = [];
      let currentDate = startDate.clone();
      let remainingAmount = totalPrice;

      for (let i = 0; i < totalMonths; i++) {
        // For the last payment, use the remaining amount to avoid rounding issues
        const paymentAmount =
          i === totalMonths - 1 ? remainingAmount : monthlyPayment;

        remainingAmount -= monthlyPayment;

        schedule.push({
          payment_number: i + 1,
          due_date: currentDate.format("YYYY-MM-DD"),
          amount: paymentAmount,
          status: i === 0 ? "PAID" : "PENDING",
        });

        currentDate = currentDate.add(1, "month");
      }

      setPaymentSchedule(schedule);
      form.setFieldValue("completed_payments", 1); // Default to first payment completed
    }
  };

  // Effect to regenerate payment schedule when relevant fields change
  useEffect(() => {
    if (selectedLots.length > 0 && form.getFieldValue("start_date")) {
      generatePaymentSchedule();
    }
  }, [
    selectedLots,
    installmentYears,
    customPrices,
    form.getFieldValue("payment_type"),
  ]);

  // Handle client user selection
  const handleClientSelect = (value) => {
    const selectedClient = clients.find((client) => client.id === value);
    if (selectedClient) {
      form.setFieldsValue({
        client_name: selectedClient.name,
        email: selectedClient.email,
      });
    }
  };

  // Handle form submission
  const onFinish = (values) => {
    if (selectedLots.length === 0) {
      message.error("Please select at least one property/lot");
      return;
    }

    setSubmitting(true);

    // Prepare lot details with custom prices if applicable
    const lotDetails = selectedLots.map((lotId) => {
      const lot = lots.find((l) => l.id === lotId);
      return {
        lot_id: lotId,
        custom_price: customPrices[lotId] || lot.total_contract_price,
      };
    });

    const formattedValues = {
      ...values,
      lots: lotDetails,
      start_date: values.start_date
        ? values.start_date.format("YYYY-MM-DD")
        : null,
      next_payment_date:
        values.payment_type === "spot_cash"
          ? values.start_date.format("YYYY-MM-DD")
          : paymentSchedule.length > 1
          ? paymentSchedule[1].due_date
          : null,
      completed_payments:
        values.payment_type === "spot_cash"
          ? 1
          : values.completed_payments || 1,
      installment_years:
        values.payment_type === "spot_cash" ? 1 : values.installment_years,
      total_amount: calculateTotalPrice(),
    };

    // Make the actual API call to save the client payment
    axiosClient
      .post("/client-payments", formattedValues)
      .then((response) => {
        setSubmitting(false);
        message.success("Client payment record created successfully");

        if (onSuccess) {
          onSuccess();
        } else if (navigate) {
          navigate(`/${userRole}/client-payments`);
        }
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

  // Handle lot selection
  const handleLotSelect = (lotId) => {
    setSelectedLots((prev) => {
      const newSelection = [...prev, lotId];

      // Update form and regenerate schedule with the new selection
      setTimeout(() => {
        generatePaymentSchedule();
      }, 0);

      return newSelection;
    });
  };

  // Handle lot// Handle lot removal
  const handleLotRemove = (lotId) => {
    setSelectedLots((prev) => {
      const newSelection = prev.filter((id) => id !== lotId);

      // Clean up custom price if exists
      if (customPrices[lotId]) {
        const newCustomPrices = { ...customPrices };
        delete newCustomPrices[lotId];
        setCustomPrices(newCustomPrices);
      }

      // Update form and regenerate schedule with the new selection
      setTimeout(() => {
        generatePaymentSchedule();
      }, 0);

      return newSelection;
    });
  };

  // Handle custom price change
  const handleCustomPriceChange = (lotId, value) => {
    setCustomPrices((prev) => {
      const newPrices = { ...prev, [lotId]: value };

      // Regenerate payment schedule with new prices
      setTimeout(() => {
        generatePaymentSchedule();
      }, 0);

      return newPrices;
    });
  };

  // Installment years change handler
  const handleYearsChange = (years) => {
    setInstallmentYears(years);
    form.setFieldValue("completed_payments", 1); // Reset completed payments

    // Regenerate payment schedule
    setTimeout(() => {
      generatePaymentSchedule();
    }, 0);
  };

  // Start date change handler
  const handleStartDateChange = (date) => {
    if (date && selectedLots.length > 0) {
      setTimeout(() => {
        generatePaymentSchedule();
      }, 0);
    }
  };

  // Calculate monthly payment
  const calculateMonthlyPayment = () => {
    const totalPrice = calculateTotalPrice();
    if (totalPrice <= 0 || !installmentYears) return null;
    return Math.floor(totalPrice / (installmentYears * 12));
  };

  const monthlyPayment = calculateMonthlyPayment();

  // Selected lots columns for the table
  const selectedLotsColumns = [
    {
      title: "Property Name",
      dataIndex: "property_name",
      key: "property_name",
    },
    {
      title: "Block & Lot No",
      dataIndex: "block_lot_no",
      key: "block_lot_no",
    },
    {
      title: "Lot Area",
      dataIndex: "lot_area",
      key: "lot_area",
      render: (text) => `${text} sqm`,
    },
    {
      title: "Default Price",
      dataIndex: "total_contract_price",
      key: "total_contract_price",
      render: (text) => new Intl.NumberFormat().format(text),
    },
    {
      title: "Custom Price",
      key: "custom_price",
      render: (_, record) => (
        <InputNumber
          style={{ width: "100%" }}
          value={customPrices[record.id] || undefined}
          onChange={(value) => handleCustomPriceChange(record.id, value)}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          placeholder="Enter custom price"
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleLotRemove(record.id)}
        />
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: colors.primary,
        },
      }}
    >
      <div style={{ padding: "20px", maxWidth: "100%" }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            completed_payments: 1,
            installment_years: 1,
            start_date: dayjs(),
            payment_type: "spot_cash",
          }}
          style={{ width: "100%" }}
        >
          <Row gutter={[24, 24]}>
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
              >
                {/* Client User Selection - NEW */}
                <Form.Item
                  name="user_id"
                  label="Select Client User"
                  extra="Connect this payment to a registered client user account"
                >
                  <Select
                    placeholder="Select a client user"
                    onChange={handleClientSelect}
                    loading={loadingClients}
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {clients.map((client) => (
                      <Option key={client.id} value={client.id}>
                        {client.name} ({client.email})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

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

                {/* Added email field */}
                <Form.Item name="email" label="Email">
                  <Input placeholder="Client's email address" />
                </Form.Item>

                {/* Added address field */}
                <Form.Item name="address" label="Address">
                  <TextArea rows={2} placeholder="Client's address" />
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
              >
                <Form.Item
                  label="Select Property/Lot"
                  extra="You can select multiple lots for a single payment plan"
                >
                  <Select
                    placeholder="Select a property/lot to add"
                    optionFilterProp="children"
                    showSearch
                    value={null}
                    onChange={handleLotSelect}
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                    style={{ width: "100%" }}
                  >
                    {lots
                      .filter((lot) => !selectedLots.includes(lot.id))
                      .map((lot) => (
                        <Option key={lot.id} value={lot.id}>
                          {lot.property_name} - {lot.block_lot_no} ({lot.status}
                          )
                        </Option>
                      ))}
                  </Select>
                </Form.Item>

                <Card
                  title="Selected Properties/Lots"
                  size="small"
                  extra={
                    <Tooltip title="You can select multiple lots and customize the price for each">
                      <QuestionCircleOutlined />
                    </Tooltip>
                  }
                >
                  {selectedLots.length === 0 ? (
                    <Empty description="No properties selected yet" />
                  ) : (
                    <Table
                      columns={selectedLotsColumns}
                      dataSource={lots.filter((lot) =>
                        selectedLots.includes(lot.id)
                      )}
                      rowKey="id"
                      pagination={false}
                      size="small"
                    />
                  )}
                </Card>

                <Divider />

                <div style={{ marginTop: 16 }}>
                  <Text strong>Total Selected Properties: </Text>
                  <Text>{selectedLots.length}</Text>
                </div>
                <div>
                  <Text strong>Total Contract Price: </Text>
                  <Text>
                    ₱{new Intl.NumberFormat().format(calculateTotalPrice())}
                  </Text>
                </div>
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
              >
                <Row gutter={[24, 16]}>
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
                              completed_payments: 1,
                              next_payment_date: null,
                            });
                          }
                          setTimeout(() => {
                            generatePaymentSchedule();
                          }, 0);
                        }}
                      >
                        <Radio.Button value="installment">
                          Installment
                        </Radio.Button>
                        <Radio.Button value="spot_cash">Spot Cash</Radio.Button>
                      </Radio.Group>
                    </Form.Item>
                  </Col>

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
                        max={6} // Max 6 years as per updated requirement
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

                  {form.getFieldValue("payment_type") === "installment" && (
                    <>
                      <Col xs={24} md={8}>
                        <Form.Item
                          name="next_payment_date"
                          label="Next Payment Date"
                        >
                          <DatePicker
                            style={{ width: "100%" }}
                            format="YYYY-MM-DD"
                            disabled // Auto-calculated based on start date + 1 month
                            value={
                              paymentSchedule.length > 1
                                ? dayjs(paymentSchedule[1].due_date)
                                : null
                            }
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
                                ? new Intl.NumberFormat().format(monthlyPayment)
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
                            addonAfter="payments"
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24}>
                        <Form.Item label="Payment Progress">
                          {({ getFieldValue }) => {
                            const completed =
                              getFieldValue("completed_payments") || 0;
                            const total = installmentYears * 12;
                            const percent = Math.round(
                              (completed / total) * 100
                            );

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
                    </>
                  )}

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
                onClick={() => {
                  if (onSuccess) {
                    onSuccess();
                  }
                }}
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
                disabled={selectedLots.length === 0}
              >
                Save Client Payment
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    </ConfigProvider>
  );
};

export default ClientPaymentAddForm;
