import React, { useState, useCallback, useContext, useEffect } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

// Demo mode configuration
const DEMO_MODE = false; // Set to false to use real timing
const DEMO_SETTINGS = {
  // Whether to auto-complete the booking in demo mode
  AUTO_COMPLETE: true,
  // Time in milliseconds to wait before auto-completing
  AUTO_COMPLETE_DELAY: 2000,
  // Whether to show demo indicators in the UI
  SHOW_DEMO_INDICATORS: true,
};

// Helper function to format time consistently
const formatTime = (time) =>
  dayjs.isDayjs(time) ? time.format("DD/MM/YYYY HH:mm") : time;

// Parse date from various formats to dayjs object
const parseDate = (date) => {
  if (!date) return dayjs();
  if (dayjs.isDayjs(date)) return date;
  if (typeof date === "string") return dayjs(date, "DD/MM/YYYY HH:mm");
  if (date._i) return dayjs(date._i);
  return dayjs(date);
};

// Get demo times for a booking
const getDemoTimes = (booking) => {
  const now = dayjs();
  const expectedStart = parseDate(booking.expectedStartTime);

  // For demo, set real start time to now or expected time, whichever is later
  const realStart = now.isAfter(expectedStart) ? now : expectedStart;
  const realEnd = realStart.add(20, "minute");

  return {
    realStartTime: formatTime(realStart),
    realEndTime: formatTime(realEnd),
  };
};

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
import { AuthContext } from "../../context/AuthContext";
import {
  Modal,
  Form,
  message,
  DatePicker,
  Button,
  Table,
  Tag,
  Input,
} from "antd";
import { Formik } from "formik";
import {
  timeUpdateSchema,
  completeFormSchema,
} from "../../constants/commonSchemas";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { StatusTag, ActionButtons } from "../../components/common/DataTable";
import { CONSULTATION_STATUS } from "../../constants/statusOptions";
import { fetchPaginatedData, handlePagination } from "../../utils/apiUtils";
import TextArea from "antd/es/input/TextArea";

// Validation Schema

const TimeUpdateForm = ({ initialValues, onFormSubmit, isSubmitting }) => {
  // Ensure we have a proper initial value
  const getInitialValues = () => {
    if (!initialValues) return { expectedStartTime: dayjs() };

    let initialTime = initialValues.expectedStartTime;
    if (!initialTime) return { expectedStartTime: dayjs() };

    // If it's already a dayjs object, use it directly
    if (dayjs.isDayjs(initialTime)) {
      return { expectedStartTime: initialTime };
    }

    // If it's a string, parse it
    if (typeof initialTime === "string") {
      return { expectedStartTime: dayjs(initialTime, "DD/MM/YYYY HH:mm") };
    }

    // If it's an object with _i (from moment), try to parse it
    if (initialTime._i) {
      return { expectedStartTime: dayjs(initialTime._i) };
    }

    // Default to now if we can't parse it
    return { expectedStartTime: dayjs() };
  };

  return (
    <Formik
      initialValues={getInitialValues()}
      validationSchema={timeUpdateSchema}
      onSubmit={onFormSubmit}
      enableReinitialize
      validateOnChange
      validateOnBlur
    >
      {({
        values,
        errors,
        touched,
        setFieldValue,
        handleSubmit,
        setFieldTouched,
      }) => {
        // Function to handle date/time change
        const handleDateTimeChange = (date) => {
          if (!date) return;

          // Ensure we have a valid dayjs object
          const newDate = dayjs.isDayjs(date) ? date : dayjs(date);
          if (!newDate.isValid()) return;

          // Round to nearest hour
          const roundedDate = newDate.minute(0).second(0).millisecond(0);
          setFieldValue("expectedStartTime", roundedDate);
        };

        return (
          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="Thời gian bắt đầu mới"
              validateStatus={
                touched.expectedStartTime && errors.expectedStartTime
                  ? "error"
                  : ""
              }
              help={touched.expectedStartTime && errors.expectedStartTime}
              required
            >
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                className="w-full"
                value={values.expectedStartTime}
                onChange={handleDateTimeChange}
                onBlur={() => setFieldTouched("expectedStartTime", true)}
                name="expectedStartTime"
                getPopupContainer={(trigger) => trigger.parentNode}
                disabledDate={(current) => {
                  // Disable past dates
                  return current && current < dayjs().startOf("day");
                }}
                showNow={false}
                minuteStep={60}
                disabledTime={(current) => {
                  if (!current) return {};

                  const hours = [];
                  const minutes = [];

                  // Only allow business hours (9:00 - 17:00)
                  for (let i = 0; i < 24; i++) {
                    if (i < 9 || i >= 18) {
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
            <Form.Item className="text-right">
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                disabled={!values.expectedStartTime}
              >
                Cập nhật
              </Button>
            </Form.Item>
          </Form>
        );
      }}
    </Formik>
  );
};

// Helper function to parse date string to dayjs
const parseDateString = (dateStr) => {
  if (!dateStr) return null;
  if (dayjs.isDayjs(dateStr)) return dateStr;
  if (
    typeof dateStr === "string" &&
    dateStr.match(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/)
  ) {
    return dayjs(dateStr, "DD/MM/YYYY HH:mm");
  }
  return dayjs(dateStr);
};

// Helper function to format date for display
const formatDisplayTime = (time) => {
  if (!time) return "Chưa ghi nhận";
  const date = parseDateString(time);
  return date.isValid() ? date.format("HH:mm - DD/MM/YYYY") : "Chưa ghi nhận";
};

const CompleteForm = ({ onFormSubmit, isSubmitting, initValues, onCancel }) => {
  // Calculate duration in minutes
  const calculateDuration = () => {
    if (!initValues?.realStartTime || !initValues?.realEndTime) return "N/A";

    const start = parseDateString(initValues.realStartTime);
    const end = parseDateString(initValues.realEndTime);

    if (!start.isValid() || !end.isValid()) return "N/A";

    const duration = end.diff(start, "minute");
    return `${duration} phút`;
  };

  return (
    <Formik
      initialValues={initValues || {}}
      validationSchema={completeFormSchema}
      onSubmit={onFormSubmit}
      enableReinitialize
      validateOnChange
      validateOnBlur
    >
      {({
        handleSubmit,
        errors,
        touched,
        values,
        handleChange,
        handleBlur,
      }) => (
        <Form layout="vertical" onFinish={handleSubmit}>
          <div className="mb-6 space-y-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium text-gray-700 mb-3">
                Thông tin thời gian thực tế
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Bắt đầu:</p>
                  <p className="font-medium">
                    {formatDisplayTime(initValues?.realStartTime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Kết thúc:</p>
                  <p className="font-medium">
                    {formatDisplayTime(initValues?.realEndTime)}
                  </p>
                </div>
              </div>

              {/* Display validation errors if any */}
              {(errors.realStartTime || errors.realEndTime) && (
                <div className="mt-2 p-2 bg-red-50 rounded-md">
                  {errors.realStartTime && (
                    <p className="text-red-600 text-sm">
                      {errors.realStartTime}
                    </p>
                  )}
                  {errors.realEndTime && (
                    <p className="text-red-600 text-sm">{errors.realEndTime}</p>
                  )}
                </div>
              )}

              <div className="mt-3 pt-3 border-t">
                <p className="text-sm text-gray-500">Tổng thời gian:</p>
                <p className="font-medium text-lg">{calculateDuration()}</p>
              </div>
            </div>

            <Form.Item
              label="Ghi chú"
              name="description"
              validateStatus={
                touched.description && errors.description ? "error" : ""
              }
              help={touched.description && errors.description}
            >
              <TextArea
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Nhập ghi chú"
              />
            </Form.Item>

            <div className="p-4 bg-green-50 rounded-md">
              <h4 className="font-medium text-green-700 mb-2">Lưu ý</h4>
              <ul className="text-sm text-green-700 space-y-1 list-disc pl-5">
                <li>
                  Thời gian đã được ghi nhận tự động khi bạn nhấn nút "Hoàn
                  thành"
                </li>
                <li>
                  Thời gian kết thúc phải sau thời gian bắt đầu ít nhất 20 phút
                </li>
                <li>
                  Thời gian kết thúc không được quá 60 phút so với thời gian bắt
                  đầu
                </li>
                <li>Nhấn "Xác nhận hoàn thành" để lưu thông tin</li>
              </ul>
            </div>
          </div>

          <Form.Item className="text-right space-x-3">
            <Button type="default" onClick={onCancel} className="mr-2">
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              Xác nhận hoàn thành
            </Button>
          </Form.Item>
        </Form>
      )}
    </Formik>
  );
};

const ManageSchedule = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  // State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isTimeUpdating, setIsTimeUpdating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalItems: 0,
    totalPages: 1,
    hasMore: false,
  });
  const [currentBooking, setCurrentBooking] = useState(null); // Track current booking being completed

  // State for search functionality
  const [searchText, setSearchText] = useState("");
  const [filteredBookings, setFilteredBookings] = useState([]);

  // Handle search input changes
  const handleSearch = (value) => {
    setSearchText(value);
  };

  // Filter bookings based on search text
  const filterBookings = useCallback(() => {
    if (!searchText.trim()) {
      setFilteredBookings(bookings);
      return;
    }

    const searchLower = searchText.toLowerCase();
    const filtered = bookings.filter((booking) => {
      // Check if any string field contains the search text
      const stringMatch = [
        booking.consultationId?.toString(),
        booking.status,
        booking.expectedStartTime,
        booking.expectedEndTime,
        booking.realStartTime,
        booking.realEndTime,
        booking.customerName,
        booking.customerEmail,
      ].some(
        (field) => field && field.toString().toLowerCase().includes(searchLower)
      );

      // Check if any date fields match the search text
      const dateMatch = [
        booking.expectedStartTime,
        booking.expectedEndTime,
        booking.realStartTime,
        booking.realEndTime,
      ].some((dateStr) => {
        if (!dateStr) return false;
        try {
          const date = dayjs(dateStr, "DD/MM/YYYY HH:mm");
          return (
            date.isValid() && date.format("DD/MM/YYYY").includes(searchText)
          );
        } catch (error) {
          console.error("Error parsing date:", error);
          return false;
        }
      });

      return stringMatch || dateMatch;
    });

    setFilteredBookings(filtered);
  }, [searchText, bookings]);

  // Update filtered bookings when search text or bookings change
  useEffect(() => {
    filterBookings();
  }, [filterBookings]);

  // Fetch bookings with pagination
  const fetchBookings = useCallback(
    async (page = 0) => {
      if (!user) {
        navigate("/login");
        return { data: [] };
      }
      try {
        const result = await fetchPaginatedData(
          `/consultant/consultations/consultantId/${user.id}`,
          "consultations",
          { page, sort: "consultationId", order: "desc" }
        );
        return result;
      } catch (error) {
        console.error("Error fetching bookings:", error);
        return { data: [] };
      }
    },
    [user, navigate]
  );

  // Load more handler
  const loadMore = useCallback(() => {
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
  }, [fetchBookings, loading, loadingMore, pagination]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchBookings(0);
      const bookingsData = result.data || [];
      setBookings(bookingsData);
      setFilteredBookings(bookingsData);
      setPagination((prev) => ({
        ...prev,
        totalItems: result.totalItems || 0,
        totalPages: result.totalPages || 1,
        hasMore: (result.currentPage || 0) < (result.totalPages || 1) - 1,
      }));
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchBookings]);

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const result = await fetchBookings(0);
        setBookings(result.data || []);
        setPagination((prev) => ({
          ...prev,
          totalItems: result.totalItems || 0,
          totalPages: result.totalPages || 1,
          hasMore: (result.currentPage || 0) < (result.totalPages || 1) - 1,
        }));
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [fetchBookings]);

  const fetchBookingsDetail = useCallback(
    async (id) => {
      if (!user) {
        navigate("/login");
        return;
      }
      try {
        setLoading(true);
        const response = await api.get(`/consultant/consultations/${id}`);
        setSelectedBooking(response.data || null);
      } catch (error) {
        console.error("Error fetching booking details:", error);
        setSelectedBooking(null);
      } finally {
        setLoading(false);
      }
    },
    [user, navigate]
  );

  if (!isAuthenticated && window.location.pathname !== "/login") {
    navigate("/login");
    return null;
  }

  // MODAL
  const showDetailModal = (booking) => {
    const bookingId = booking.consultationId || booking.id;
    if (bookingId) {
      fetchBookingsDetail(bookingId);
      setIsDetailModalVisible(true);
    } else {
      console.error("No valid booking ID found:", booking);
      message.error("Không tìm thấy ID lịch hẹn");
    }
  };

  const handleDetailModalClose = () => {
    setIsDetailModalVisible(false);
    setSelectedBooking(null);
  };

  // EVENT HANDLER
  const handleReschedule = (booking) => {
    if (booking.status === "COMPLETED") {
      return;
    }

    // Create a new object with the booking data
    const updatedBooking = {
      ...booking,
      // Parse the expectedStartTime to dayjs object
      expectedStartTime: (() => {
        if (!booking.expectedStartTime)
          return dayjs().add(1, "day").hour(9).minute(0);

        // Handle different possible formats
        try {
          // If it's already a dayjs object, use it
          if (dayjs.isDayjs(booking.expectedStartTime)) {
            return booking.expectedStartTime;
          }

          // If it's a string, parse it
          if (typeof booking.expectedStartTime === "string") {
            return dayjs(booking.expectedStartTime, "DD/MM/YYYY HH:mm");
          }

          // If it has _i property (from moment), try to parse it
          if (booking.expectedStartTime._i) {
            return dayjs(booking.expectedStartTime._i);
          }

          // Default to tomorrow at 9 AM if we can't parse it
          return dayjs().add(1, "day").hour(9).minute(0);
        } catch (error) {
          console.error("Error parsing date:", error);
          return dayjs().add(1, "day").hour(9).minute(0);
        }
      })(),
    };

    console.log("Rescheduling with booking:", updatedBooking);
    setEditingBooking(updatedBooking);
    setIsUpdating(true);
    setIsModalVisible(true);
  };

  const handleComplete = (booking) => {
    // Check if booking is already completed
    if (booking.status === "COMPLETED" || booking.status === "CANCELLED") {
      return;
    }

    // Check if there's an ongoing booking that's different from the current one
    if (
      currentBooking &&
      currentBooking.consultationId !== booking.consultationId
    ) {
      message.error(
        "Vui lòng hoàn thành lịch hẹn hiện tại trước khi bắt đầu lịch hẹn khác"
      );
      return;
    }

    // If we're already in the process of updating, ignore additional clicks
    if (isUpdating) return;

    // Set updating state to prevent multiple clicks
    setIsUpdating(true);

    // Create a new object with the booking data
    const completeBooking = {
      ...booking,
      expectedStartTime: formatTime(parseDate(booking.expectedStartTime)),
      expectedEndTime:
        booking.expectedEndTime ||
        formatTime(parseDate(booking.expectedStartTime).add(1, "hour")),
      // In demo mode, use demo times; these will be overridden in non-demo mode
      ...(DEMO_MODE && getDemoTimes(booking)),
    };

    console.log("Initial booking data:", completeBooking);

    console.log("Complete booking data:", completeBooking);

    // In demo mode with auto-complete, show the completion modal directly
    if (DEMO_MODE && DEMO_SETTINGS.AUTO_COMPLETE) {
      if (DEMO_SETTINGS.SHOW_DEMO_INDICATORS) {
        message.info("Đang hoàn thành lịch hẹn...");
      }

      setEditingBooking(completeBooking);
      setIsModalVisible(true);
      setIsUpdating(false);
      return;
    }

    // In non-demo mode or manual demo mode, use two-click flow
    if (!currentBooking) {
      // First click - record start time
      setCurrentBooking({
        ...completeBooking,
        realStartTime: dayjs().format("DD/MM/YYYY HH:mm"),
      });

      if (DEMO_MODE && DEMO_SETTINGS.SHOW_DEMO_INDICATORS) {
        message.info("Đang ghi nhận thời gian bắt đầu");
      } else {
        message.info(
          "Đã ghi nhận thời gian bắt đầu. Nhấn lại để ghi nhận thời gian kết thúc"
        );
      }
    } else {
      // Second click - show completion form
      const formattedBooking = {
        ...completeBooking,
        realStartTime: currentBooking.realStartTime,
        realEndTime: dayjs().format("DD/MM/YYYY HH:mm"),
      };

      console.log("Sending to complete modal:", {
        realStartTime: formattedBooking.realStartTime,
        realEndTime: formattedBooking.realEndTime,
        startTimeIsString: typeof formattedBooking.realStartTime === "string",
        endTimeIsString: typeof formattedBooking.realEndTime === "string",
      });

      setEditingBooking(formattedBooking);
      setIsModalVisible(true);
      setCurrentBooking(null);
    }

    // Reset updating state
    setIsUpdating(false);
  };

  const handleTimeUpdate = async (values) => {
    try {
      setIsTimeUpdating(true);
      await api.post(
        `/consultant/consultations/${editingBooking.consultationId}/reschedule/`,
        {
          consultantId: user.id,
          expectedStartTime:
            values.expectedStartTime.format("DD/MM/YYYY HH:mm"),
        }
      );
      message.success("Cập nhật thởi gian thành công");
      loadData();
      setIsModalVisible(false);
      setEditingBooking(null);
    } catch (error) {
      console.error("Error updating time:", error);
      message.error(
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật thởi gian"
      );
    } finally {
      setIsTimeUpdating(false);
      setLoading(false);
    }
  };

  const handleCompleteConsultation = async (values) => {
    try {
      // Parse input values to dayjs objects if they're strings
      const parseDate = (date) => {
        if (dayjs.isDayjs(date)) return date;
        if (typeof date === "string") return dayjs(date, "DD/MM/YYYY HH:mm");
        return dayjs(date);
      };

      const realStartTime = parseDate(values.realStartTime);
      const realEndTime = parseDate(values.realEndTime);

      // Validate the times
      if (!realStartTime.isValid() || !realEndTime.isValid()) {
        message.error("Thời gian không hợp lệ");
        return;
      }

      if (realEndTime.isBefore(realStartTime)) {
        message.error("Thời gian kết thúc phải sau thời gian bắt đầu");
        return;
      }

      // Format dates as strings in DD/MM/YYYY HH:mm format before sending to backend
      const updatedBooking = {
        consultationId: editingBooking.consultationId,
        realStartTime: realStartTime.format("DD/MM/YYYY HH:mm"),
        realEndTime: realEndTime.format("DD/MM/YYYY HH:mm"),
      };

      await api.post(`/consultant/consultations/complete`, updatedBooking);
      message.success("Lịch hẹn đã được hoàn thành thành công");
      setIsModalVisible(false);
      setEditingBooking(null);
      // Refresh the data
      loadData();
    } catch (error) {
      console.error("Error completing consultation:", error);
      message.error(
        error.response?.data?.message || "Có lỗi khi hoàn thành lịch hẹn"
      );
    }
  };

  // RENDER COLUMNS
  const columns = [
    {
      title: "ID",
      dataIndex: "consultationId",
      key: "consultationId",
    },
    {
      title: "Thời gian bắt đầu",
      dataIndex: "expectedStartTime",
      key: "expectedStartTime",
    },
    {
      title: "Thời gian kết thúc",
      dataIndex: "expectedEndTime",
      key: "expectedEndTime",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        return <StatusTag status={status} options={CONSULTATION_STATUS} />;
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <ActionButtons
          onView={() => showDetailModal(record)}
          onEdit={() => handleReschedule(record)}
          onComplete={() => handleComplete(record)}
        />
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Quản lý lịch hẹn</h1>
        <div className="w-full md:w-96">
          <Input.Search
            placeholder="Tìm kiếm theo mã, trạng thái, thời gian..."
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            value={searchText}
            allowClear
            enterButton
            className="w-full"
          />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <Table
          columns={columns}
          dataSource={searchText ? filteredBookings : bookings}
          rowKey="consultationId"
          loading={loading}
          pagination={false}
          scroll={{ x: "max-content" }}
          className="w-full"
          locale={{
            emptyText: searchText
              ? "Không tìm thấy lịch hẹn phù hợp"
              : "Không có dữ liệu lịch hẹn",
          }}
        />
        {pagination.hasMore && (
          <div className="text-center mt-4">
            <Button onClick={loadMore} loading={loadingMore} type="link">
              Tải thêm
            </Button>
          </div>
        )}
      </div>

      <Modal
        title="Cập nhật thởi gian tư vấn"
        open={isModalVisible && isUpdating}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingBooking(null);
        }}
        footer={null}
        destroyOnHidden
      >
        <TimeUpdateForm
          initialValues={{
            expectedStartTime: editingBooking?.expectedStartTime,
          }}
          onFormSubmit={handleTimeUpdate}
          isSubmitting={isTimeUpdating}
          key={editingBooking?.consultationId}
        />
      </Modal>

      <Modal
        title="Hoàn thành buổi tư vấn"
        open={isModalVisible && !isUpdating}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingBooking(null);
        }}
        footer={null}
        destroyOnHidden
      >
        <CompleteForm
          onFormSubmit={handleCompleteConsultation}
          isSubmitting={isUpdating}
          initValues={{
            expectedStartTime: editingBooking?.expectedStartTime,
            expectedEndTime: editingBooking?.expectedEndTime,
            realStartTime: editingBooking?.realStartTime,
            realEndTime: editingBooking?.realEndTime,
            description: editingBooking?.description,
          }}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingBooking(null);
            setCurrentBooking(null);
          }}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết lịch hẹn #${selectedBooking?.id || ""}`}
        open={isDetailModalVisible}
        onCancel={handleDetailModalClose}
        footer={[
          <Button key="close" onClick={handleDetailModalClose}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedBooking && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">ID của buổi tư vấn:</p>
                <p>{selectedBooking.consultationId}</p>
              </div>
              <div>
                <p className="font-semibold">ID Khách hàng:</p>
                <p>{selectedBooking.customerDetails?.customerId}</p>
              </div>
              <div>
                <p className="font-semibold">Tên khách hàng:</p>
                <p>{selectedBooking.customerDetails?.fullName}</p>
              </div>
              <div>
                <p className="font-semibold">Số điện thoại khách hàng:</p>
                <p>{selectedBooking.customerDetails?.phone}</p>
              </div>
              <div>
                <p className="font-semibold">Email khách hàng:</p>
                <p>{selectedBooking.customerDetails?.email}</p>
              </div>
              <div>
                <p className="font-semibold">Phương thức thanh toán:</p>
                <p>
                  {selectedBooking.payment?.method === "CASH"
                    ? "Tiền mặt"
                    : selectedBooking.payment?.method === "BANKING"
                    ? "Chuyển khoản"
                    : selectedBooking.payment?.method || "Chưa thanh toán"}
                </p>
              </div>
              <div>
                <p className="font-semibold">Trạng thái thanh toán:</p>
                <Tag
                  color={
                    selectedBooking.payment?.status === "PAID" ? "green" : "red"
                  }
                >
                  {selectedBooking.payment?.status === "PAID"
                    ? "Đã thanh toán"
                    : "Chưa thanh toán"}
                </Tag>
              </div>
              <div>
                <p className="font-semibold">Số tiền:</p>
                <p>
                  {selectedBooking.payment?.amount
                    ? new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(selectedBooking.payment.amount)
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="font-semibold">Thời gian thanh toán:</p>
                <p>{selectedBooking.payment?.createdAt || "N/A"}</p>
              </div>
              <div>
                <p className="font-semibold">Trạng thái:</p>
                <StatusTag
                  status={selectedBooking.status}
                  options={CONSULTATION_STATUS}
                />
              </div>
              <div className="col-span-2">
                <p className="font-semibold">Thời gian bắt đầu:</p>
                <p>{selectedBooking.expectedStartTime}</p>
              </div>
              <div className="col-span-2">
                <p className="font-semibold">Thời gian kết thúc:</p>
                <p>{selectedBooking.expectedEndTime}</p>
              </div>
              <div className="col-span-2">
                <p className="font-semibold">Thời gian bắt đầu thực tế:</p>
                <p>{selectedBooking.realStartTime || "Đang chờ cập nhật"}</p>
              </div>
              <div className="col-span-2">
                <p className="font-semibold">Thời gian kết thúc thực tế:</p>
                <p>{selectedBooking.realEndTime || "Đang chờ cập nhật"}</p>
              </div>
              {selectedBooking.notes && (
                <div className="col-span-2">
                  <p className="font-semibold">Ghi chú:</p>
                  <p className="whitespace-pre-line">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageSchedule;
