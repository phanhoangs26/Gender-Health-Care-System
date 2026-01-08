import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  Form,
  Button,
  DatePicker,
  message,
  Card,
  Typography,
  TimePicker,
  Select,
  Modal,
} from "antd";
import { Formik } from "formik";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import api from "../../../api/axios";
import moment from "moment";
import { bookingSchema } from "../../../constants/commonSchemas";

const { Title } = Typography;

const ConsultantBooking = () => {
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [consultants, setConsultants] = useState([]);
  const [availableConsultants, setAvailableConsultants] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentBookingData, setCurrentBookingData] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [consultations, setConsultations] = useState([]);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);

  const fetchConsultations = useCallback(async () => {
    try {
      const response = await api.get(
        `/customer/consultations/consultation-types?gender=${user.gender}`
      );
      setConsultations(response.data);
      console.log("Fetched consultations:", response.data);
    } catch (error) {
      console.error("Error fetching consultations:", error);
    }
  }, [user.gender]);

  const fetchConsultant = useCallback(async () => {
    try {
      const response = await api.get("/customer/consultant-list/");
      setConsultants(response.data);
      console.log("Fetched consultants:", response.data);
    } catch (error) {
      console.error("Error fetching consultants:", error);
    }
  }, []);

  useEffect(() => {
    fetchConsultant();
    fetchConsultations();
  }, [fetchConsultant, fetchConsultations]);

  const checkSchedule = async (consultant, date) => {
    if (!consultant?.accountId || !date) return [];

    try {
      const response = await api.get(
        `/customer/consultations/consultant/${consultant.accountId}/check-schedule`,
        {
          params: {
            date: date.format("YYYY-MM-DD"),
          },
        }
      );

      // Return an array of unavailable slots with consultant info
      return response.data.schedule.map((dateTime) => {
        const [datePart, timePart] = dateTime.split(" ");
        return {
          accountId: response.data.accountId,
          consultantName: consultant.fullName,
          time: timePart,
          date: datePart,
        };
      });
    } catch (error) {
      console.error(
        `Error checking schedule for ${consultant.fullName}:`,
        error
      );
      return [];
    }
  };

  const checkAllConsultantsSchedule = useCallback(async () => {
    if (!selectedDate || !consultants.length) return;

    try {
      // Initialize availability map with all consultants as available
      const newAvailability = new Map();
      consultants.forEach((consultant) => {
        newAvailability.set(consultant.accountId, true);
      });

      // Check schedule for each consultant in parallel
      const schedulePromises = consultants.map((consultant) =>
        checkSchedule(consultant, selectedDate).catch((error) => {
          console.error(
            `Error checking schedule for consultant ${consultant.accountId}:`,
            error
          );
          return []; // Return empty array if error occurs
        })
      );

      const results = await Promise.all(schedulePromises);
      console.log("Schedule results:", results);

      // Check for overlapping schedules
      results.forEach((slots, index) => {
        const consultant = consultants[index];
        console.log(
          `Checking consultant ${consultant.accountId} with slots:`,
          slots
        );

        if (selectedTime && Array.isArray(slots)) {
          let hasOverlap = false;
          slots.forEach((slot) => {
            if (!slot) return;

            const slotHour = parseInt(slot.time.split(":")[0], 10);
            const slotDateTime = new Date(selectedDate);
            slotDateTime.setHours(slotHour, 0, 0, 0);

            const selectedHour = selectedTime.hour();
            const selectedDateTime = new Date(selectedDate);
            selectedDateTime.setHours(selectedHour, 0, 0, 0);

            console.log(slotDateTime, selectedDateTime);
            const timeDiffHours =
              Math.abs(slotDateTime - selectedDateTime) / (1000 * 60 * 60);

            if (timeDiffHours <= 1) {
              hasOverlap = true;
              return;
            }
          });

          if (hasOverlap) {
            newAvailability.set(consultant.accountId, false);
          }
        }
      });

      // Filter out unavailable consultants
      const available = consultants.filter(
        (consultant) => newAvailability.get(consultant.accountId) !== false
      );
      setAvailableConsultants(available);
    } catch (error) {
      console.error("Error checking consultant schedules:", error);
    }
  }, [consultants, selectedDate, selectedTime]);

  // Only run when date or time changes
  useEffect(() => {
    checkAllConsultantsSchedule();
  }, [checkAllConsultantsSchedule, selectedDate, selectedTime]);

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    // Reset time when date changes
    setSelectedTime(null);
    // Reset consultants to show all when date changes
    const response = await api.get(`/customer/consultant-list/`);
    setConsultants(response.data);
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);
  };

  const handleFormSubmit = async (values, { setSubmitting, resetForm }) => {
    if (paymentProcessing) {
      message.warning("Đang xử lý yêu cầu trước đó. Vui lòng đợi...");
      return;
    }

    if (!user) {
      message.warning("Vui lòng đăng nhập để đặt lịch hẹn");
      navigate("/login");
      return;
    }

    const selectedDate = values.date.format("DD/MM/YYYY");
    const startTime = values.time.format("HH:mm");
    const consultant = consultants.find(
      (c) => c.accountId === Number(values.accountId)
    );

    const bookingDateTime = `${selectedDate} ${startTime}`;
    
    const bookingData = {
      expectedStartTime: bookingDateTime,
      customerId: Number(user.id),
      consultationTypeId: values.consultationTypeId,
      consultantId: Number(values.accountId),
      payment: {
        amount: 100000,
        method: "BANKING",
        description: `Thanh toán cho buổi tư vấn với ${
          consultant?.fullName || "tư vấn viên"
        }`,
      },
      resetForm,
      setSubmitting,
    };

    // Clear any previous pending booking
    localStorage.removeItem("pendingBooking");

    // Set the new booking data and show payment modal
    setCurrentBookingData(bookingData);
    setIsPaymentModalVisible(true);
  };

  const handlePayment = async () => {
    if (!currentBookingData) return;

    if (paymentProcessing) {
      message.warning("Đang xử lý thanh toán. Vui lòng đợi...");
      return;
    }

    setLoading(true);
    setPaymentProcessing(true);

    try {
      const amount = currentBookingData.payment.amount;
      const redirectUrl = encodeURIComponent(
        "http://localhost:5173/consultation-booking"
      );

      // Construct the payment URL with query parameters
      const paymentUrl = `/vnpay/payment-transaction/create-payment-url?amount=${amount}&redirectUrl=${redirectUrl}`;

      console.log("Sending payment request to:", paymentUrl);

      // Send GET request with query parameters
      const paymentResponse = await api.post(paymentUrl, {
        headers: {
          Accept: "application/json",
        },
      });

      console.log("Payment response:", paymentResponse.data);

      if (paymentResponse.data) {
        // Save booking data to localStorage before redirecting
        const bookingData = {
          ...currentBookingData,
          payment: {
            ...currentBookingData.payment,
          },
        };

        // Clear any existing pending booking
        localStorage.removeItem("pendingBooking");
        // Set the new pending booking
        localStorage.setItem("pendingBooking", JSON.stringify(bookingData));

        // Clear any existing session flags
        sessionStorage.removeItem("consultantPaymentProcessed");

        console.log("Redirecting to payment URL:", paymentResponse.data);
        window.location.href = paymentResponse.data;
        return;
      } else {
        throw new Error("No payment URL received in response");
      }
    } catch (error) {
      console.error("Error during payment or booking:", error);

      // Clear the pending booking on error
      localStorage.removeItem("pendingBooking");

      message.error(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
      setPaymentProcessing(false);

      if (currentBookingData?.setSubmitting) {
        currentBookingData.setSubmitting(false);
      }
    }
  };

  const handleCancelPayment = () => {
    setIsPaymentModalVisible(false);
    if (currentBookingData?.setSubmitting) {
      currentBookingData.setSubmitting(false);
    }
  };

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const transNo = urlParams.get("vnp_TransactionNo");
      const transStatus = urlParams.get("vnp_TransactionStatus");
      const payDate = urlParams.get("vnp_PayDate");
      const description = urlParams.get("vnp_OrderInfo");
      const resultCode = urlParams.get("vnp_ResponseCode");
      const processedPayment = sessionStorage.getItem(
        "consultantPaymentProcessed"
      );

      // Prevent multiple submissions and check if already processed
      if (paymentProcessing || processedPayment === "true") return;

      // Handle failed transactions
      if (resultCode && resultCode !== "00") {
        message.error("Giao dịch thanh toán không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu cần giúp đỡ.");
        // Clear URL parameters
        window.history.replaceState({}, document.title, "/consultant-booking");
        return;
      }

      if (transNo && transStatus === "00" && resultCode === "00") {
        try {
          setPaymentProcessing(true);

          // Mark that we're processing this payment
          sessionStorage.setItem("consultantPaymentProcessed", "true");

          const pendingBooking = JSON.parse(
            localStorage.getItem("pendingBooking")
          );

          if (pendingBooking) {
            try {
              // Complete the booking with the transaction ID
              await api.post("/customer/consultations/register", {
                ...pendingBooking,
                payment: {
                  ...pendingBooking.payment,
                  transactionId: transNo,
                  createdAtTimeStamp: payDate,
                  description: description,
                },
              });

              // Clear the URL parameters without refreshing
              window.history.replaceState(
                {},
                document.title,
                "/consultant-booking"
              );

              message.success("Thanh toán và đặt lịch thành công!");
            } catch (error) {
              if (
                error.response?.status === 400 ||
                error.response?.status === 409
              ) {
                // Handle duplicate booking error
                console.warn("Booking already exists or time slot is taken");
                console.log(error.response?.data);
              } else {
                throw error; // Re-throw other errors to be caught by the outer catch
              }
            }
          }
        } catch (error) {
          console.error("Error completing booking:", error);
        } finally {
          window.history.replaceState(
            {},
            document.title,
            "/consultant-booking"
          );
          setPaymentProcessing(false);

          // Clear the pending booking from localStorage
          localStorage.removeItem("pendingBooking");

          // Clear the processing flag after a delay to allow for navigation
          setTimeout(() => {
            sessionStorage.removeItem("consultantPaymentProcessed");
          }, 5000);
        }
      }
    };

    checkPaymentStatus();
  }, [paymentProcessing]);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-12">
        <Title level={2}>Đặt lịch tư vấn</Title>
      </div>

      <Card className="shadow-lg">
        <Formik
          initialValues={{ date: null, time: null, accountId: "", consultationTypeId: "" }}
          validationSchema={bookingSchema}
          onSubmit={handleFormSubmit}
          enableReinitialize
        >
          {({
            values,
            errors,
            touched,
            handleSubmit,
            setFieldValue,
            setFieldTouched,
            isSubmitting,
          }) => (
            <Form
              layout="vertical"
              onFinish={handleSubmit}
              className="max-w-2xl mx-auto"
            >
              <Form.Item
                label="Ngày hẹn"
                validateStatus={touched.date && errors.date ? "error" : ""}
                help={touched.date && errors.date}
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  className="w-full"
                  value={values.date}
                  onChange={async (date) => {
                    await setFieldValue("date", date);
                    await handleDateChange(date, setFieldValue, values);
                  }}
                  onBlur={() => setFieldTouched("date", true)}
                  disabledDate={(current) => {
                    // Disable dates before today
                    if (current && current <= moment().startOf("day")) {
                      return true;
                    }
                  }}
                />
              </Form.Item>

              <Form.Item
                name="time"
                label="Giờ hẹn"
                validateStatus={touched.time && errors.time ? "error" : ""}
                help={touched.time && errors.time}
              >
                <TimePicker
                  format="HH:mm"
                  showNow={false}
                  minuteStep={60}
                  className="w-full"
                  value={values.time}
                  onChange={(time) => {
                    if (time) {
                      time.minute(0).second(0);
                    }
                    setFieldValue("time", time);
                    handleTimeChange(time);
                  }}
                  disabled={!values.date}
                  disabledTime={(current) => {
                    if (!current) return {};

                    const hours = [];
                    const minutes = [];

                    // Disable hours outside business hours (9-17)
                    for (let i = 0; i < 24; i++) {
                      if (i < 6 || i >= 18) {
                        hours.push(i);
                      }
                    }

                    // Disable all minutes except 00
                    for (let i = 1; i < 60; i++) {
                      minutes.push(i);
                    }

                    return {
                      disabledHours: () => hours,
                      disabledMinutes: () => minutes,
                    };
                  }}
                />
              </Form.Item>

              <Form.Item
                name="consultationType"
                label="Loại tư vấn"
                validateStatus={touched.consultationTypeId && errors.consultationTypeId ? "error" : ""}
                help={touched.consultationTypeId && errors.consultationTypeId}
              >
                <Select
                  placeholder="Chọn loại tư vấn"
                  value={values.consultationTypeId}
                  onChange={(value) => setFieldValue("consultationTypeId", value)}
                  onBlur={() => setFieldTouched("consultationTypeId", true)}
                  optionLabelProp="label"
                >
                  {consultations.map((consultation) => (
                    <Option 
                      key={consultation.consultationTypeId}
                      value={consultation.consultationTypeId}
                      label={consultation.name}
                    >
                      <div className="flex flex-col">
                        <div className="font-medium">{consultation.name}</div>
                        <div className="text-xs text-gray-500">
                          {consultation.description || 'Không có mô tả'}
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="accountId"
                label="Chọn người tư vấn"
                validateStatus={
                  touched.accountId && errors.accountId ? "error" : ""
                }
                help={touched.accountId && errors.accountId}
              >
                <Select
                  placeholder="Chọn người tư vấn"
                  showSearch
                  style={{ width: "100%" }}
                  value={values.accountId}
                  onChange={(value) => setFieldValue("accountId", value)}
                  onBlur={() => setFieldTouched("accountId", true)}
                  disabled={!values.date}
                >
                  {availableConsultants.map((consultant) => (
                    <Option
                      key={consultant.accountId}
                      value={consultant.accountId}
                    >
                      {consultant.fullName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting || loading}
                  className="w-full bg-green-600"
                  size="large"
                >
                  Đặt lịch
                </Button>
              </Form.Item>
            </Form>
          )}
        </Formik>
      </Card>

      <Modal
        title="Xác nhận thanh toán"
        open={isPaymentModalVisible}
        onCancel={handleCancelPayment}
        onOk={handlePayment}
        okText="Xác nhận thanh toán"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <div className="space-y-4">
          <div className="text-lg font-medium">Thông tin thanh toán</div>
          <div className="border-t border-b border-gray-200 py-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">ID tư vấn viên:</span>
              <span className="font-medium">
                {currentBookingData?.formValues?.accountId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ngày hẹn:</span>
              <span className="font-medium">
                {currentBookingData?.formValues?.date.format("DD/MM/YYYY")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Giờ hẹn:</span>
              <span className="font-medium">
                {currentBookingData?.formValues?.time.format("HH:mm")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Số tiền:</span>
              <span className="text-lg font-bold text-green-600">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(currentBookingData?.payment?.amount || 0)}
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Bằng cách xác nhận, bạn đồng ý thanh toán số tiền trên.
          </div>
        </div>
      </Modal>




    </div>
  );
};

export default ConsultantBooking;
