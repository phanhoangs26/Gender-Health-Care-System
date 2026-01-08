import React, { useState, useEffect, useCallback } from "react";
import {
  Form,
  Button,
  message,
  Card,
  Typography,
  Radio,
  Divider,
  Modal,
  DatePicker,
  List,
  Row,
  Col,
  Select,
} from "antd";
import BookingList from "../../components/common/BookingList";
import ReviewModal from "../../components/common/ReviewModal";
import { Formik } from "formik";
import { fetchPaginatedData, handlePagination } from "../../utils/apiUtils";
import { Loading, NotAuthenticated } from "../../components/common/Loading";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import api from "../../api/axios";
import dayjs from "dayjs";
import { testBookingSchema as validationSchema } from "../../constants/commonSchemas";

const { Title } = Typography;

const TestServiceBooking = () => {
  const [loading, setLoading] = useState(false);
  const [_isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({});
  const navigate = useNavigate();
  const { user, authLoading, isAuthenticated } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [currentBookingData, setCurrentBookingData] = useState(null);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Debug effect for modal visibility
  useEffect(() => {
    console.log("Payment modal visibility changed:", isPaymentModalVisible);
  }, [isPaymentModalVisible]);
  const [currentReview, setCurrentReview] = useState({
    bookingId: null,
    rating: "GOOD",
    comment: "",
  });
  const [formInitialValues] = useState({
    serviceId: "",
    date: null,
    time: null,
  });
  const [bookedSlots, setBookedSlots] = useState({});
  const [_loadingSlots, setLoadingSlots] = useState(false);

  const fetchBookings = useCallback(
    async (page = 0, retryCount = 0) => {
      // If auth is still loading, wait a bit and retry (max 5 times)
      if (authLoading && retryCount < 5) {
        console.log(`Auth still loading, retry ${retryCount + 1}/5`);
        await new Promise((resolve) => setTimeout(resolve, 500));
        return fetchBookings(page, retryCount + 1);
      }

      try {
        console.log("Current user state:", {
          user,
          hasId: !!user?.id,
          isAuthenticated,
          authLoading,
        });

        if (!user?.id) {
          console.warn(
            "User not authenticated or missing ID. Current user:",
            user
          );

          // If we have a token but no user, try to reinitialize auth
          const token = localStorage.getItem("token");
          if (token && retryCount < 3) {
            console.log("Token exists but user not loaded, retrying...");
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return fetchBookings(page, retryCount + 1);
          }

          return { data: [], total: 0 };
        }

        console.log("Fetching bookings for user:", user.id, "page:", page);
        const result = await fetchPaginatedData(
          `/customer/testing-service-bookings/customer/${user.id}`,
          "testingServiceBookings",
          { page, sort: "serviceBookingId", order: "desc" }
        );

        console.log("Fetched bookings:", result);
        return {
          data: Array.isArray(result?.data) ? result.data : [],
          total: result?.totalItems || 0,
        };
      } catch (error) {
        console.error("Error fetching bookings:", error);
        message.error("Có lỗi xảy ra khi tải danh sách đặt lịch");
        return { data: [], total: 0 };
      }
    },
    [user, authLoading, isAuthenticated] // Only depend on currentUser.id
  );

  const loadMore = () => {
    if (!loading && !loadingMore && pagination.hasMore) {
      handlePagination({
        setData: setBookings,
        setLoading,
        setLoadingMore,
        setPagination,
        fetchFunction: fetchBookings,
        page: pagination.currentPage + 1,
      });
    }
  };

  const handleReviewBooking = (bookingId) => {
    console.log("Review button clicked with bookingId:", bookingId);
    setCurrentReview({
      bookingId,
      rating: "GOOD",
      comment: "",
    });
    setIsReviewModalVisible(true);
  };

  const handleSubmitReview = async (reviewData) => {
    if (!currentReview.bookingId) return;

    try {
      setLoading(true);
      await api.put(
        `/customer/testing-service-bookings/${currentReview.bookingId}/evaluate`,
        {
          rating: reviewData.rating,
          comment: reviewData.comment,
        }
      );

      message.success("Đánh giá của bạn đã được gửi thành công!");
      // Refresh the bookings list after successful review
      setIsReviewModalVisible(false);
    } catch (error) {
      console.error("Error submitting review:", error);
      message.error("Gửi đánh giá thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    setLoading(true);
    try {
      await api.put(`/customer/testing-service-bookings/cancel/${bookingId}`);
      message.success("Hủy lịch đặt hẹn thành công!");
      // Refresh the current page of bookings after cancellation
      await refreshBookings();
    } catch (error) {
      console.error("Error canceling booking:", error);
      message.error("Hủy lịch đặt hẹn thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsPaymentModalVisible(false);
  };

  // Function to fetch booked time slots
  const fetchBookedSlots = useCallback(
    async (date) => {
      if (!date || !selectedService) return;

      try {
        setLoadingSlots(true);
        const dateStr = dayjs(date).format("YYYY-MM-DD");

        // Send data in request body for POST request
        const response = await api.get(
          `/customer/testing-service-bookings/check-schedule?serviceId=${selectedService.serviceId}&customerId=${user.id}&checkDate=${dateStr}`
        );

        // Convert the response to a more usable format
        const slots = response.data || [];
        const bookedSlotsMap = {};

        console.log("Raw API response:", response.data);

        slots.forEach((slot) => {
          try {
            if (!slot) {
              console.warn("Empty slot data received");
              return;
            }

            // Parse the date string in DD/MM/YYYY HH:mm format
            // First, check if the slot is already a Day.js object
            let slotTime = dayjs.isDayjs(slot) ? slot : null;

            // If not, try to parse it with the expected format
            if (!slotTime) {
              // Try parsing with format string for DD/MM/YYYY HH:mm
              slotTime = dayjs(slot, "DD/MM/YYYY HH:mm", true);

              // If still not valid, try parsing as ISO string
              if (!slotTime.isValid()) {
                slotTime = dayjs(slot);
              }
            }

            if (!slotTime.isValid()) {
              console.warn("Invalid date format for slot:", slot);
              return;
            }

            const hour = slotTime.hour();
            const dateKey = slotTime.format("YYYY-MM-DD");

            if (!bookedSlotsMap[dateKey]) {
              bookedSlotsMap[dateKey] = new Set();
            }
            bookedSlotsMap[dateKey].add(hour);
          } catch (error) {
            console.error("Error processing slot:", slot, error);
          }
        });

        setBookedSlots(bookedSlotsMap);
        console.log("Processed booked slots:", bookedSlotsMap);
      } catch (error) {
        console.error("Error fetching booked slots:", error);
        message.error("Không thể tải thông tin khung giờ đã đặt");
      } finally {
        setLoadingSlots(false);
      }
    },
    [selectedService, user?.id]
  );

  // Handle date change to fetch booked slots
  const handleDateChange = async (date, setFieldValue) => {
    setFieldValue("date", date);
    setFieldValue("time", ""); // Reset time when date changes

    // If a service is selected, fetch available slots for the selected date
    if (selectedService) {
      try {
        setIsLoadingSlots(true);
        await fetchBookedSlots(date);
      } finally {
        setIsLoadingSlots(false);
      }
    }
  };

  const handleFormSubmit = async (values, { setSubmitting }) => {
    if (paymentProcessing) {
      message.warning("Đang xử lý yêu cầu trước đó. Vui lòng đợi...");
      return;
    }

    try {
      if (!user) {
        message.warning("Vui lòng đăng nhập để đặt lịch hẹn");
        navigate("/login");
        return;
      }

      const selected = services.find((s) => s.serviceId === values.serviceId);

      if (!selected) {
        message.warning("Vui lòng chọn một dịch vụ");
        return;
      }

      // Combine date and time
      const bookingDateTime = dayjs(values.date)
        .hour(parseInt(values.time.split(":")[0]))
        .minute(0)
        .second(0);

      // Check if the selected time is in the past
      if (bookingDateTime.isBefore(dayjs())) {
        message.warning("Không thể đặt lịch trong quá khứ");
        return;
      }

      // Check if the selected time is already booked
      const selectedHour = bookingDateTime.hour();
      const selectedDate = bookingDateTime.format("YYYY-MM-DD");

      if (bookedSlots[selectedDate]?.has(selectedHour)) {
        message.warning(
          "Khung giờ này đã được đặt. Vui lòng chọn khung giờ khác."
        );
        return;
      }

      // Format the booking data
      const bookingData = {
        expectedStartTime: bookingDateTime.format("DD/MM/YYYY HH:mm"),
        customerId: user.id,
        serviceId: values.serviceId,
        payment: {
          amount: selected.priceList?.[0]?.price || 10000,
          method: "BANKING",
          description: `Thanh toán cho dịch vụ ${selected.serviceName}`,
        },
      };

      // Clear any previous pending booking
      localStorage.removeItem("pendingBooking");

      // Set the new booking data and show payment modal
      setCurrentBookingData(bookingData);
      setIsPaymentModalVisible(true);
    } catch (error) {
      console.error("Error in form submission:", error);
      message.error("Có lỗi xảy ra khi xử lý yêu cầu");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBooking = async () => {
    if (!currentBookingData) {
      console.error("No booking data available");
      return;
    }

    if (paymentProcessing) {
      message.warning("Đang xử lý thanh toán. Vui lòng đợi...");
      return;
    }

    setLoading(true);
    setPaymentProcessing(true);

    try {
      console.log("Processing booking with data:", currentBookingData);

      const amount = currentBookingData.payment.amount;
      const redirectUrl = encodeURIComponent(
        "http://localhost:5173/test-booking"
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
        };

        // Clear any existing pending booking
        localStorage.removeItem("pendingBooking");
        // Set the new pending booking
        localStorage.setItem("pendingBooking", JSON.stringify(bookingData));

        // Clear any existing session flags
        sessionStorage.removeItem("paymentProcessed");

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

  const refreshBookings = useCallback(async () => {
    try {
      handlePagination({
        setData: setBookings,
        setLoading,
        setLoadingMore,
        setPagination,
        fetchFunction: fetchBookings,
        page: 0,
      });
    } catch (error) {
      console.error("Error refreshing bookings:", error);
      message.error("Có lỗi xảy ra khi tải danh sách đặt lịch");
    }
  }, [fetchBookings]);

  // Handle payment callback and complete booking
  useEffect(() => {
    const checkPaymentStatus = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const transNo = urlParams.get("vnp_TransactionNo");
      const transStatus = urlParams.get("vnp_TransactionStatus");
      const payDate = urlParams.get("vnp_PayDate");
      const description = urlParams.get("vnp_OrderInfo");
      const resultCode = urlParams.get("vnp_ResponseCode");
      const processedPayment = sessionStorage.getItem("paymentProcessed");

      // Prevent multiple submissions and check if already processed
      if (paymentProcessing || processedPayment === "true") return;

      if (transNo && transStatus === "00" && resultCode === "00") {
        try {
          setPaymentProcessing(true);

          // Mark that we're processing this payment
          sessionStorage.setItem("paymentProcessed", "true");

          const pendingBooking = JSON.parse(
            localStorage.getItem("pendingBooking")
          );

          if (pendingBooking) {
            try {
              // Complete the booking with the transaction ID
              await api.post("/customer/testing-service-bookings/register", {
                ...pendingBooking,
                payment: {
                  ...pendingBooking.payment,
                  transactionId: transNo,
                  createdAtTimeStamp: payDate,
                  description: description,
                },
              });

              // Clear the pending booking from localStorage
              localStorage.removeItem("pendingBooking");

              // Clear the URL parameters without refreshing
              window.history.replaceState({}, document.title, "/test-booking");

              await refreshBookings();
              message.success("Thanh toán và đặt lịch thành công!");
            } catch (error) {
              if (
                error.response?.status === 400 ||
                error.response?.status === 409
              ) {
                // Handle duplicate booking error
                console.log(error.response?.data);
                console.warn("Booking already exists or time slot is taken");
                message.warning(
                  "Lịch hẹn đã được tạo trước đó hoặc khung giờ đã được đặt."
                );
              } else {
                throw error; // Re-throw other errors to be caught by the outer catch
              }
            }
          }
        } catch (error) {
          console.error("Error completing booking:", error);
          message.error(
            error.response?.data?.message ||
              "Có lỗi xảy ra khi hoàn tất đặt lịch. Vui lòng kiểm tra lại lịch hẹn của bạn."
          );
        } finally {
          window.history.replaceState({}, document.title, "/test-booking");
          setPaymentProcessing(false);

          // Clear the processing flag after a delay to allow for navigation
          setTimeout(() => {
            sessionStorage.removeItem("paymentProcessed");
          }, 5000);
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay

      console.log("Refreshing bookings list after delay...");
      refreshBookings();
    };

    checkPaymentStatus();
  }, [paymentProcessing, refreshBookings, pagination.currentPage]);

  // Initial data fetch
  useEffect(() => {
    // Fetch services
    const fetchServices = async () => {
      try {
        console.log("Fetching services...");
        const response = await fetchPaginatedData(
          `/customer/testing-services/list`,
          "testingServices",
          { page: 0, order: "desc" }
        );
        console.log("Fetched services:", response);
        setServices(response.data);
      } catch (error) {
        console.error("Error fetching services:", error);
        message.error("Không thể tải danh sách dịch vụ");
      }
    };

    if (isAuthenticated) fetchServices();
  }, [isAuthenticated]);

  // Show loading state while checking authentication
  if (authLoading) {
    return <Loading />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <NotAuthenticated />;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <Title level={2}>Đặt dịch vụ xét nghiệm</Title>

        <Card className="shadow-lg">
          <Formik
            initialValues={formInitialValues}
            validationSchema={validationSchema}
            onSubmit={handleFormSubmit}
            enableReinitialize
          >
            {({
              values,
              errors,
              touched,
              handleSubmit,
              setFieldValue,
              isSubmitting,
            }) => (
              <Form
                layout="vertical"
                onFinish={handleSubmit}
                className="max-w-2xl mx-auto"
              >
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">Chọn dịch vụ</h3>
                  <List
                    itemLayout="horizontal"
                    dataSource={services}
                    renderItem={(service) => (
                      <List.Item
                        className="cursor-pointer hover:bg-gray-50 p-2 rounded"
                        onClick={() => {
                          setFieldValue("serviceId", service.serviceId);
                          setSelectedService(service);
                        }}
                      >
                        <div className="flex items-center w-full">
                          <Radio
                            checked={values.serviceId === service.serviceId}
                            className="mr-4 text-green-600"
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => {
                              setFieldValue("serviceId", service.serviceId);
                              setSelectedService(service);
                            }}
                          />
                          <div className="flex-1">
                            <div className="font-medium">
                              {service.serviceName}
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                              <span className="font-medium">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(service.priceAmount || 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="date"
                        label="Ngày hẹn"
                        validateStatus={
                          touched.date && errors.date ? "error" : ""
                        }
                        help={touched.date && errors.date}
                        required
                      >
                        <DatePicker
                          name="date"
                          format="DD/MM/YYYY"
                          className="w-full"
                          value={values.date}
                          onChange={(date) =>
                            handleDateChange(date, setFieldValue, values)
                          }
                          disabledDate={(current) => {
                            // Disable past dates
                            return current && current < dayjs().startOf("day");
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="time"
                        label="Giờ hẹn"
                        validateStatus={
                          touched.time && errors.time ? "error" : ""
                        }
                        help={touched.time && errors.time}
                        required
                      >
                        <Select
                          placeholder="Chọn giờ hẹn"
                          name="time"
                          disabled={!values.date}
                          value={values.time || undefined}
                          onChange={(value) => setFieldValue("time", value)}
                        >
                          {Array.from({ length: 10 }, (_, i) => {
                            const hour = i + 8; // 8 AM to 5 PM
                            const timeStr = `${hour
                              .toString()
                              .padStart(2, "0")}:00`;
                            const dateKey = dayjs(values.date).format(
                              "YYYY-MM-DD"
                            );
                            const isBooked =
                              bookedSlots[dateKey] &&
                              bookedSlots[dateKey].has(hour);

                            return (
                              <Select.Option
                                key={timeStr}
                                value={timeStr}
                                disabled={isBooked}
                              >
                                {timeStr} {isBooked ? "(Đã đầy)" : ""}
                              </Select.Option>
                            );
                          })}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  {errors.serviceId && touched.serviceId && (
                    <div className="ant-form-item-explain-error">
                      {errors.serviceId}
                    </div>
                  )}
                  <Divider />
                  {values.serviceId && selectedService && (
                    <div className="flex justify-between text-lg font-medium mt-4 p-4 bg-green-50 rounded-lg">
                      <span>Dịch vụ đã chọn:</span>
                      <div className="text-right">
                        <div className="font-semibold">
                          {selectedService.serviceName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(selectedService.priceAmount || 0)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Form.Item className="mt-6">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSubmitting || loading}
                    disabled={!values.serviceId || isSubmitting}
                    className="w-full text-white bg-green-600 hover:bg-green-700"
                    size="large"
                  >
                    {isSubmitting ? "Đang xử lý..." : "Đặt lịch ngay"}
                  </Button>
                </Form.Item>
              </Form>
            )}
          </Formik>
        </Card>

        <div className="bg-green-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-3 text-green-800">
            Thông tin về các loại xét nghiệm
          </h3>
          <p className="mb-3">
            Các xét nghiệm y tế giúp cung cấp thông tin quan trọng về tình trạng
            sức khỏe của bạn. Dưới đây là một số thông tin hữu ích:
          </p>

          <div className="space-y-4">
            <div className="bg-white p-3 rounded shadow-sm">
              <h4 className="font-medium mb-1">
                Ý nghĩa các chỉ số xét nghiệm máu
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                Các chỉ số xét nghiệm máu giúp đánh giá chức năng các cơ quan
                trong cơ thể và phát hiện các bất thường về sức khỏe.
              </p>
              <a
                href="https://www.vinmec.com/vie/bai-viet/y-nghia-cac-chi-so-trong-xet-nghiem-mau-vi/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:underline text-sm flex items-center"
              >
                <span>Xem thêm trên Vinmec</span>
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>

            <div className="bg-white p-3 rounded shadow-sm">
              <h4 className="font-medium mb-1">
                Các chỉ số xét nghiệm nước tiểu
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                Xét nghiệm nước tiểu giúp đánh giá chức năng thận và phát hiện
                các vấn đề về đường tiết niệu.
              </p>
              <a
                href="https://www.vinmec.com/vie/bai-viet/cac-chi-so-trong-xet-nghiem-tong-phan-tich-nuoc-tieu-vi/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:underline text-sm flex items-center"
              >
                <span>Xem thêm trên Vinmec</span>
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>

            <div className="bg-white p-3 rounded shadow-sm">
              <h4 className="font-medium mb-1">
                Ý nghĩa các chỉ số xét nghiệm phân
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                Các chỉ số xét nghiệm phân giúp đánh giá chức năng thận và phát
                hiện các vấn đề về đường tiết niệu.
              </p>
              <a
                href="https://www.vinmec.com/vie/bai-viet/cac-ket-qua-trong-xet-nghiem-phan-cho-biet-dieu-gi-vi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:underline text-sm flex items-center"
              >
                <span>Xem thêm trên Vinmec</span>
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            <p>
              <strong>Ghi chú:</strong> Thông tin được tham khảo từ Bệnh viện Đa
              khoa Quốc tế Vinmec. Để biết thêm chi tiết, vui lòng truy cập các
              liên kết trên hoặc tham khảo ý kiến bác sĩ chuyên môn.
            </p>
          </div>
        </div>
      </div>

      <Modal
        title="Xác nhận thanh toán"
        open={isPaymentModalVisible}
        onCancel={handleCancel}
        onOk={handleBooking}
        okText="Xác nhận thanh toán"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <div className="space-y-4">
          <div className="text-lg font-medium">Thông tin thanh toán</div>
          <div className="border-t border-b border-gray-200 py-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Dịch vụ:</span>
              <span className="font-medium">
                {selectedService?.serviceName}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Số tiền:</span>
              <span className="text-lg font-bold text-green-600">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(selectedService?.priceAmount || 0)}
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Bằng cách xác nhận, bạn đồng ý thanh toán số tiền trên.
          </div>
        </div>
      </Modal>

      <div className="mt-8">
        <BookingList
          bookings={bookings}
          onCancelBooking={handleCancelBooking}
          onReviewBooking={handleReviewBooking}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={pagination.hasMore}
          onLoadMore={loadMore}
          title="Lịch đặt hẹn dịch vụ xét nghiệm"
          emptyText="Bạn chưa có lịch hẹn nào"
        />
      </div>
      <ReviewModal
        isVisible={isReviewModalVisible}
        onClose={() => setIsReviewModalVisible(false)}
        onSubmit={handleSubmitReview}
        initialRating={currentReview.rating}
        initialComment={currentReview.comment}
      />
    </div>
  );
};

export default TestServiceBooking;
