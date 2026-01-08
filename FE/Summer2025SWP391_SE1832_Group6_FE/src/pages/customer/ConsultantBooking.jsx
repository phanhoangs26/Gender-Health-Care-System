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
import BookingList from "../../components/common/BookingList";
import { Loading, NotAuthenticated } from "../../components/common/Loading";
import { Formik } from "formik";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axios";
import moment from "moment";
import { bookingSchema } from "../../constants/commonSchemas";
import { CONSULTATION_TYPES } from "../../constants/statusOptions";
import { fetchPaginatedData, handlePagination } from "../../utils/apiUtils";
import ReviewModal from "../../components/common/ReviewModal";

const { Title } = Typography;

const ConsultantBooking = () => {
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({});
  const navigate = useNavigate();
  const { user , authLoading, isAuthenticated } = useContext(AuthContext);
  const [consultants, setConsultants] = useState([]);
  const [availableConsultants, setAvailableConsultants] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [currentBookingData, setCurrentBookingData] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [currentReview, setCurrentReview] = useState({
    bookingId: null,
    rating: "GOOD",
    comment: "",
  });
  const [userGender, setUserGender] = useState('');

  const fetchBookings = useCallback(
    async (page = 0, retryCount = 0) => {
      // If auth is still loading, wait a bit and retry (max 5 times)
      if (authLoading && retryCount < 5) {
        console.log(`Auth still loading, retry ${retryCount + 1}/5`);
        await new Promise(resolve => setTimeout(resolve, 500));
        return fetchBookings(page, retryCount + 1);
      }

      try {
        console.log("Current user state:", { 
          user, 
          hasId: !!user?.id,
          isAuthenticated,
          authLoading 
        });
        
        if (!user?.id) {
          console.warn("User not authenticated or missing ID. Current user:", user);
          
          // If we have a token but no user, try to reinitialize auth
          const token = localStorage.getItem("token");
          if (token && retryCount < 3) {
            console.log("Token exists but user not loaded, retrying...");
            await new Promise(resolve => setTimeout(resolve, 1000));
            return fetchBookings(page, retryCount + 1);
          }
          
          return { data: [], total: 0 };
        }
        
        console.log("Fetching bookings for user:", user.id, "page:", page);
        const result = await fetchPaginatedData(
          `/customer/consultations/customer/${user.id}`,
          "consultations",
          { page, sort: "consultationId", order: "desc" }
        );

        console.log("Fetched bookings:", result);
        return { 
          data: Array.isArray(result?.data) ? result.data : [], 
          total: result?.totalItems || 0 
        };
      } catch (error) {
        console.error("Error fetching bookings:", error);
        return { data: [], total: 0 };
      }
    },
    [user, authLoading, isAuthenticated] // Only depend on currentUser.id
  );

  const getUserGender = useCallback(async () => {
    try {
      const res = await api.get(`/customer/profile/${user.id}`);
      return res.data.gender;
    } catch (error) {
      console.error("Error fetching user gender:", error);
      return "";
    }
  }, [user]);

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
      const processedPayment = sessionStorage.getItem(
        "consultantPaymentProcessed"
      );

      // Prevent multiple submissions and check if already processed
      if (paymentProcessing || processedPayment === "true") return;

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
            window.location.reload();
          }, 5000);
        }
      }
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      
      console.log("Refreshing bookings list after delay...");
      refreshBookings();
    };

    checkPaymentStatus();
  }, [paymentProcessing, refreshBookings, pagination.currentPage]);

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
    const fetchUserData = async () => {
      try {
        const gender = await getUserGender();
        setUserGender(gender);
      } catch (error) {
        console.error('Error fetching user gender:', error);
      }
    };
    
    fetchUserData();
    fetchConsultant();
  }, [fetchConsultant, getUserGender]);

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
      const availableConsultants = consultants.filter((consultant) =>
        newAvailability.get(consultant.accountId)
      );

      setAvailableConsultants(availableConsultants);
      console.log("Available consultants:", availableConsultants);
    } catch (error) {
      console.error("Error checking schedules:", error);
    }
  }, [selectedDate, selectedTime, consultants]);

  // Only run when date or time changes
  useEffect(() => {
    checkAllConsultantsSchedule();
  }, [checkAllConsultantsSchedule, selectedDate, selectedTime]);

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

  const handleReviewBooking = (bookingId) => {
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
        `/customer/consultations/${currentReview.bookingId}/evaluate`,
        {
          rating: reviewData.rating,
          comment: reviewData.comment,
        }
      );

      message.success("Đánh giá của bạn đã được gửi thành công!");
      await fetchBookings(pagination.currentPage || 0);
      setIsReviewModalVisible(false);
    } catch (error) {
      console.error("Error submitting review:", error);
      message.error("Gửi đánh giá thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!bookingId) return;

    try {
      setLoading(true);
      const response = await api.put(
        `/customer/consultations/cancel/${bookingId}`
      );

      if (response.data) {
        message.success("Hủy lịch tư vấn thành công!");
        refreshBookings();
      } else {
        throw new Error("Failed to cancel booking");
      }
    } catch (error) {
      console.error("Error canceling booking:", error);
    } finally {
      setLoading(false);
    }
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

    // Check if this time slot is already booked
    const bookingDateTime = `${selectedDate} ${startTime}`;
    const existingBooking = bookings.find(
      (booking) =>
        booking.expectedStartTime === bookingDateTime &&
        booking.accountId === Number(values.accountId)
    );

    if (existingBooking) {
      message.warning(
        "Khung giờ này đã được đặt. Vui lòng chọn khung giờ khác."
      );
      setSubmitting(false);
      return;
    }

    const bookingData = {
      expectedStartTime: bookingDateTime,
      customerId: Number(user.id),
      consultationType: values.consultationType,
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
        "http://localhost:5173/consultant-booking"
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
      <div className="mb-12">
        <Title level={2}>Đặt lịch tư vấn</Title>
      </div>

      <Card className="shadow-lg">
        <Formik
          initialValues={{ date: null, time: null, accountId: "", consultationType: "" }}
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
                    if (current && current < moment().startOf("day")) {
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
                validateStatus={touched.consultationType && errors.consultationType ? "error" : ""}
                help={touched.consultationType && errors.consultationType}
              >
                <Select
                  placeholder="Chọn loại tư vấn"
                  value={values.consultationType}
                  onChange={(value) => setFieldValue("consultationType", value)}
                  onBlur={() => setFieldTouched("consultationType", true)}
                >
                  {CONSULTATION_TYPES
                    .filter(type => type.gender === 'ALL' || type.gender === userGender)
                    .map((type) => (
                      <Option key={type.value} value={type.value}>
                        {type.label}
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

      <ReviewModal
        isVisible={isReviewModalVisible}
        onClose={() => setIsReviewModalVisible(false)}
        onSubmit={handleSubmitReview}
        initialRating={currentReview.rating}
        initialComment={currentReview.comment}
      />

      <div className="mt-8">
        <BookingList
          bookings={bookings}
          onReviewBooking={handleReviewBooking}
          onCancelBooking={handleCancelBooking}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={pagination.hasMore || false}
          onLoadMore={loadMore}
          title="Lịch sử đặt lịch tư vấn"
        />
      </div>
    </div>
  );
};

export default ConsultantBooking;
