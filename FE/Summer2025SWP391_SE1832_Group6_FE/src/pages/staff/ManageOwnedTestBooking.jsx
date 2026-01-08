import React, { useState, useEffect, useCallback, useContext } from "react";
import { message, Modal, Form, DatePicker, Button, Input, Select, Table, Space } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Formik } from "formik";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axios";
import { BOOKING_STATUS } from "../../constants/statusOptions";
import { StatusTag, ActionButtons } from "../../components/common/DataTable";
import { fetchPaginatedData, handlePagination } from "../../utils/apiUtils";
import {
  timeUpdateSchema,
} from "../../constants/commonSchemas";
import { testCompleteFormSchema } from "../../constants/testResultSchema";
import dayjs from "dayjs";

const { TextArea } = Input;

const TimeUpdateForm = ({ initialValues, onFormSubmit, isSubmitting }) => {
  // Ensure we have proper initial values
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

const CompleteForm = ({ onFormSubmit, initValues, onCancel }) => {
  // Format the times for display
  const formatTime = (time) => {
      if (!time) return "Chưa ghi nhận";
      const date = dayjs.isDayjs(time) ? time : dayjs(time);
      return date.isValid() ? date.format("HH:mm - DD/MM/YYYY") : "Chưa ghi nhận";
    };

  // Set default form values with proper structure
  const initialFormValues = {
    realStartTime: initValues?.realStartTime,
    realEndTime: initValues?.realEndTime,
    resultList: initValues?.resultList?.length > 0 ? initValues.resultList : [
      {
        title: "",
        description: "",
        resultType: "NUMERIC",
        genderType: "MALE",
        measureUnit: "MILIMOL_PER_LITER",
        minValue: "",
        maxValue: "",
        result: "",
      },
    ],
  };

  // Calculate duration in minutes
  const calculateDuration = () => {
    if (!initValues?.realStartTime || !initValues?.realEndTime) return "N/A";

    const start = dayjs.isDayjs(initValues.realStartTime)
      ? initValues.realStartTime
      : dayjs(initValues.realStartTime);

    const end = dayjs.isDayjs(initValues.realEndTime)
      ? initValues.realEndTime
      : dayjs(initValues.realEndTime);

    if (!start.isValid() || !end.isValid()) return "N/A";

    const duration = end.diff(start, "minute");
    return `${duration} phút`;
  };

  return (
    <Formik
      initialValues={initialFormValues}
      validationSchema={testCompleteFormSchema}
      onSubmit={onFormSubmit}
      enableReinitialize
      validateOnBlur
      validateOnChange
    >
      {({values, setFieldValue, errors, touched, handleBlur, handleChange, isSubmitting, handleSubmit }) => {
        return (
          <Form 
            layout="vertical" 
            onFinish={handleSubmit}
            className="space-y-4"
          >
            <div className="mb-6 space-y-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium text-gray-700 mb-3">
                  Thông tin thời gian thực tế
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Bắt đầu:</p>
                    <p className="font-medium">
                      {formatTime(initValues?.realStartTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Kết thúc:</p>
                    <p className="font-medium">
                      {formatTime(initValues?.realEndTime)}
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

              <div className="p-4 bg-green-50 rounded-md">
                <h4 className="font-medium text-green-700 mb-2">Lưu ý</h4>
                <ul className="text-sm text-green-700 space-y-1 list-disc pl-5">
                  <li>Thời gian đã được ghi nhận tự động khi bạn nhấn nút "Hoàn thành"</li>
                  <li>Thời gian kết thúc phải sau thời gian bắt đầu ít nhất 20 phút</li>
                  <li>Thời gian kết thúc không được quá 60 phút so với thời gian bắt đầu</li>
                  <li>Nhấn "Lưu kết quả" để lưu thông tin</li>
                </ul>
              </div>
            </div>
          {/* Test Results */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Kết quả xét nghiệm</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newResults = [
                    ...values.resultList,
                    {
                      title: "",
                      description: "",
                      resultType: "NUMERIC",
                      genderType: "MALE",
                      measureUnit: "MILIMOL_PER_LITER",
                      minValue: "",
                      maxValue: "",
                      result: "",
                    },
                  ];
                  setFieldValue("resultList", newResults);
                }}
              >
                <PlusOutlined />
                Thêm kết quả
              </Button>
            </div>

            <div className="space-y-6">
              {values.resultList.map((result, index) => (
                <div key={index} className="mb-6 p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-medium">Kết quả #{index + 1}</h3>
                    {values.resultList.length > 1 && (
                      <Button
                        type="text"
                        danger
                        onClick={() => {
                          const newResults = [...values.resultList];
                          newResults.splice(index, 1);
                          setFieldValue("resultList", newResults);
                        }}
                        icon={<DeleteOutlined />}
                      >
                        Xóa
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                      label="Tên xét nghiệm"
                      className="mb-4"
                      help={touched.resultList?.[index]?.title && errors.resultList?.[index]?.title}
                      validateStatus={touched.resultList?.[index]?.title && errors.resultList?.[index]?.title ? 'error' : ''}
                      required
                    >
                      <Input 
                        placeholder="Nhập tên xét nghiệm"
                        name={`resultList.${index}.title`}
                        value={values.resultList[index]?.title || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Loại kết quả"
                      className="mb-4"
                      help={touched.resultList?.[index]?.resultType && errors.resultList?.[index]?.resultType}
                      validateStatus={touched.resultList?.[index]?.resultType && errors.resultList?.[index]?.resultType ? 'error' : ''}
                      required
                    >
                      <Select
                        value={values.resultList[index]?.resultType}
                        onChange={(value) => setFieldValue(`resultList.${index}.resultType`, value)}
                        onBlur={handleBlur}
                        name={`resultList.${index}.resultType`}
                      >
                        <Select.Option value="NUMERIC">Số liệu</Select.Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label="Giới tính"
                      className="mb-4"
                      help={touched.resultList?.[index]?.genderType && errors.resultList?.[index]?.genderType}
                      validateStatus={touched.resultList?.[index]?.genderType && errors.resultList?.[index]?.genderType ? 'error' : ''}
                      required
                    >
                      <Select
                        value={values.resultList[index]?.genderType}
                        onChange={(value) => setFieldValue(`resultList.${index}.genderType`, value)}
                        onBlur={handleBlur}
                        name={`resultList.${index}.genderType`}
                      >
                        <Select.Option value="MALE">Nam</Select.Option>
                        <Select.Option value="FEMALE">Nữ</Select.Option>
                        <Select.Option value="OTHER">Khác</Select.Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label="Đơn vị đo"
                      className="mb-4"
                      help={touched.resultList?.[index]?.measureUnit && errors.resultList?.[index]?.measureUnit}
                      validateStatus={touched.resultList?.[index]?.measureUnit && errors.resultList?.[index]?.measureUnit ? 'error' : ''}
                      required
                    >
                      <Select
                        value={values.resultList[index]?.measureUnit}
                        onChange={(value) => setFieldValue(`resultList.${index}.measureUnit`, value)}
                        onBlur={handleBlur}
                        name={`resultList.${index}.measureUnit`}
                      >
                        <Select.Option value="NONE">Không</Select.Option>
                        <Select.Option value="INTERNATIONAL_UNITS_PER_LITER">IU/L</Select.Option>
                        <Select.Option value="MILIMETER_OF_MERCURY">mmHg</Select.Option>
                        <Select.Option value="PER_MICROLITER">/µL</Select.Option>
                        <Select.Option value="GRAM_PER_LITER">g/L</Select.Option>
                        <Select.Option value="MICROMOL_PER_LITER">µmol/L</Select.Option>
                        <Select.Option value="MILIMOL_PER_LITER">mmol/L</Select.Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label="Giá trị tối thiểu"
                      className="mb-4"
                      help={touched.resultList?.[index]?.minValue && errors.resultList?.[index]?.minValue}
                      validateStatus={touched.resultList?.[index]?.minValue && errors.resultList?.[index]?.minValue ? 'error' : ''}
                      required
                    >
                      <Input 
                        placeholder="Nhập giá trị tối thiểu" 
                        type="number"
                        name={`resultList.${index}.minValue`}
                        value={values.resultList[index]?.minValue || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Giá trị tối đa"
                      className="mb-4"
                      help={touched.resultList?.[index]?.maxValue && errors.resultList?.[index]?.maxValue}
                      validateStatus={touched.resultList?.[index]?.maxValue && errors.resultList?.[index]?.maxValue ? 'error' : ''}
                      required
                    >
                      <Input 
                        placeholder="Nhập giá trị tối đa" 
                        type="number"
                        name={`resultList.${index}.maxValue`}
                        value={values.resultList[index]?.maxValue || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Giá trị thực tế"
                      className="mb-4"
                      help={touched.resultList?.[index]?.result && errors.resultList?.[index]?.result}
                      validateStatus={touched.resultList?.[index]?.result && errors.resultList?.[index]?.result ? 'error' : ''}
                      required
                    >
                      <Input 
                        placeholder="Nhập giá trị thực tế" 
                        type="number"
                        name={`resultList.${index}.result`}
                        value={values.resultList[index]?.result || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Mô tả chi tiết"
                      className="mb-4 md:col-span-2"
                      help={touched.resultList?.[index]?.description && errors.resultList?.[index]?.description}
                      validateStatus={touched.resultList?.[index]?.description && errors.resultList?.[index]?.description ? 'error' : ''}
                      required
                    >
                      <Input.TextArea
                        rows={3}
                        name={`resultList.${index}.description`}
                        value={values.resultList[index]?.description || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Nhập mô tả chi tiết"
                      />
                    </Form.Item>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
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
              Lưu kết quả
            </Button>
          </Form.Item>
        </Form>
        );
      }}
    </Formik>
  );
};

const ManageOwnedTestBooking = () => {
  const { user } = useContext(AuthContext);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [currentBooking, setCurrentBooking] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalItems: 0,
    totalPages: 1,
    hasMore: false,
  });
  const navigate = useNavigate();

  // GET BOOKINGS
  const showDetailModal = (booking) => {
    api
      .get(`/staff/testing-service-bookings/${booking.serviceBookingId}`)
      .then((response) => {
        setSelectedBooking(response.data);
        setIsDetailModalVisible(true);
      })
      .catch((error) => {
        console.error("Error fetching booking details:", error);
        message.error("Failed to load booking details");
      });
  };

  const fetchBookings = useCallback(
    async (page = 0) => {
      if (!user) {
        message.warning("Vui lòng đăng nhập để đặt lịch hẹn");
        navigate("/login");
        return { data: [] };
      }
      try {
        const result = await fetchPaginatedData(
          `/staff/testing-service-bookings/staff/${user.id}`,
          "testingServiceBookings",
          {
            page,
            sort: "serviceBookingId",
            order: "desc",
          }
        );

        const paginationData = result.pagination || {
          currentPage: 0,
          totalItems: 0,
          totalPages: 1,
        };

        return {
          data: result.data || [],
          ...paginationData,
          hasMore: paginationData.currentPage < paginationData.totalPages,
        };
      } catch (error) {
        console.error("Error fetching bookings:", error);
        if (error.response) {
          if (error.response.status === 404) {
            message.error("Không tìm thấy lịch hẹn");
          } else {
            message.error(
              error.response.data?.message || "Không thể tải danh sách lịch hẹn"
            );
          }
        } else {
          message.error("Lỗi kết nối đến máy chủ");
        }
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
          currentPage: result.currentPage || 1,
          hasMore: result.currentPage < result.totalPages,
        }));
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [fetchBookings]);

  const handleDetailModalClose = () => {
    setIsDetailModalVisible(false);
    setSelectedBooking(null);
  };

  // EVENT HANDLER

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedBooking(null);
  };

  const handleTimeUpdate = async (values) => {
    try {
      setLoading(true);
      await api.put(
        `/staff/testing-service-bookings/${selectedBooking.serviceBookingId}/confirm`,
        {
          staffId: user.id,
          expectedStartTime:
            values.expectedStartTime.format("DD/MM/YYYY HH:mm"),
        }
      );
      message.success("Cập nhật lịch hẹn thành công");
      await fetchBookings();
      setIsModalVisible(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error("Error updating booking time:", error);
      message.error(
        error.response?.data?.message || "Cập nhật lịch hẹn thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = (booking) => {
    if (booking.status === "COMPLETED") {
      message.error("Lịch hẹn đã hoàn thành");
      return;
    }

    // Check if there's an ongoing booking that's different from the current one
    if (
      currentBooking &&
      currentBooking.serviceBookingId !== booking.serviceBookingId
    ) {
      message.error(
        "Vui lòng hoàn thành lịch hẹn hiện tại trước khi bắt đầu lịch hẹn khác"
      );
      return;
    }

    // For demo purposes - automatically set times
    // const now = dayjs();
    // console.log(now);
    // const startTime = now.add(20, "minute"); // 20 minutes
    // const endTime = startTime.add(20, "minute"); // 20 minutes from start time

    // Create a new object with the booking data
    const completeBooking = {
      ...booking,
      expectedStartTime: booking.expectedStartTime,
      expectedEndTime: booking.expectedEndTime,
    };

    // If this is the first click, record realStartTime
    if (!currentBooking) {
      completeBooking.realStartTime = dayjs().format("DD/MM/YYYY HH:mm");
      setCurrentBooking(completeBooking);
      console.log(completeBooking);

      message.info(
        "Đã ghi nhận thời gian bắt đầu. Nhấn lại để ghi nhận thời gian kết thúc"
      );
    } else {
      // Second click, record realEndTime and show completion form
      completeBooking.realEndTime = dayjs(completeBooking.realStartTime).add(20, "minute").format("DD/MM/YYYY HH:mm");
      setSelectedBooking(completeBooking);
      console.log(completeBooking)
      setIsUpdating(false);
      setIsModalVisible(true);
      setCurrentBooking(null); // Clear current booking
    }
  };

  const handleCompleteTest = async (values) => {
    try {
      setLoading(true);
      console.log('Raw form values:', values);

      const realStartTime = typeof values.realStartTime === 'string' 
        ? dayjs(values.realStartTime, 'DD/MM/YYYY HH:mm')
        : values.realStartTime;
            
      const realEndTime = typeof values.realEndTime === 'string'
        ? dayjs(values.realEndTime, 'DD/MM/YYYY HH:mm')
        : values.realEndTime;
      
      // Validate the times
      if (!realStartTime.isValid() || !realEndTime.isValid()) {
        message.error("Thời gian không hợp lệ");
        setLoading(false);
        return;
      }
      
      if (realEndTime.isBefore(realStartTime)) {
        message.error("Thời gian kết thúc phải sau thời gian bắt đầu");
        setLoading(false);
        return;
      }

      // Format the data for the API
      const formattedData = {
        realStartTime: realStartTime.format('DD/MM/YYYY HH:mm'),
        realEndTime: realEndTime.format('DD/MM/YYYY HH:mm'),
        resultList: values.resultList.map(item => ({
          title: item.title,
          description: item.description,
          resultType: item.resultType,
          genderType: item.genderType,
          measureUnit: item.measureUnit,
          minValue: item.minValue ? parseFloat(item.minValue) : null,
          maxValue: item.maxValue ? parseFloat(item.maxValue) : null,
          result: item.result ? parseFloat(item.result) : null,
        })),
      };

      console.log("Formatted submission data:", formattedData);

      const response = await api.put(
        `/staff/testing-service-bookings/${selectedBooking.serviceBookingId}/complete`,
        formattedData
      );

      console.log("API Response:", response);

      if (response.status === 200) {
        message.success("Đánh dấu hoàn thành lịch hẹn thành công");
        // Refresh the bookings list
        const result = await fetchBookings(0);
        setBookings(result.data || []);
        setPagination(prev => ({
          ...prev,
          currentPage: 0,
          totalItems: result.totalItems || 0,
          totalPages: result.totalPages || 1,
          hasMore: result.currentPage < result.totalPages
        }));
        setIsModalVisible(false);
        setSelectedBooking(null);
      } else {
        throw new Error(response.data?.message || "Có lỗi xảy ra khi gửi yêu cầu");
      }
    } catch (error) {
      console.error("Error completing booking:", error);
      message.error(
        error.response?.data?.message || "Hoàn thành lịch hẹn thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings based on search text
  const filterBookings = useCallback(() => {
    if (!searchText.trim()) {
      setFilteredBookings(bookings);
      return;
    }
    
    const searchLower = searchText.toLowerCase();
    const filtered = bookings.filter(booking => 
      (booking.serviceBookingId && booking.serviceBookingId.toString().includes(searchText)) ||
      (booking.customerName && booking.customerName.toLowerCase().includes(searchLower)) ||
      (booking.serviceName && booking.serviceName.toLowerCase().includes(searchLower)) ||
      (booking.staffName && booking.staffName.toLowerCase().includes(searchLower)) ||
      (booking.status && booking.status.toLowerCase().includes(searchLower))
    );
    
    setFilteredBookings(filtered);
  }, [searchText, bookings]);

  // Update filtered bookings when search text or bookings change
  useEffect(() => {
    filterBookings();
  }, [filterBookings]);

  const handleSearch = (value) => {
    setSearchText(value);
  };

  // RENDER COLUMN
  const columns = [
    {
      title: "Mã đặt lịch",
      dataIndex: "serviceBookingId",
      key: "serviceBookingId",
      width: 120,
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Dịch vụ",
      dataIndex: "serviceName",
      key: "serviceName",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <StatusTag status={status} options={BOOKING_STATUS} />
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 180,
      render: (_, record) => (
        <ActionButtons
          onView={() => showDetailModal(record)}
          onComplete={() => handleComplete(record)}
        />
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Quản lý lịch hẹn xét nghiệm</h1>
        <div className="w-full md:w-96">
          <Input.Search
            placeholder="Tìm kiếm theo mã, tên khách hàng, dịch vụ..."
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            value={searchText}
            allowClear
            enterButton
            className="w-full"
          />
        </div>
      </div>

      <div className="mt-4">
        <Table
          dataSource={searchText ? filteredBookings : bookings}
          columns={columns}
          loading={loading}
          rowKey="serviceBookingId"
          pagination={false}
          locale={{
            emptyText: searchText 
              ? 'Không tìm thấy lịch hẹn phù hợp' 
              : 'Không có dữ liệu lịch hẹn'
          }}
        />
        {pagination.hasMore && (
          <div className="text-center mt-4">
            <Button onClick={loadMore} loading={loadingMore} type="primary">
              Tải thêm
            </Button>
          </div>
        )}
      </div>

      <Modal
        title={
          isUpdating
            ? `Chỉnh sửa thời gian dự tính - Lịch hẹn #${
                selectedBooking?.serviceBookingId || ""
              }`
            : `Hoàn thành lịch hẹn #${selectedBooking?.serviceBookingId || ""}`
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnHidden
      >
        {isUpdating ? (
          <TimeUpdateForm
            initialValues={{
              expectedStartTime: selectedBooking?.expectedStartTime || "",
            }}
            onFormSubmit={handleTimeUpdate}
            isSubmitting={loading}
          />
        ) : (
          <CompleteForm
            initValues={{
              realStartTime: selectedBooking?.realStartTime || "",
              realEndTime: selectedBooking?.realEndTime || "",
              resultList: selectedBooking?.resultList || [],
              serviceBookingId: selectedBooking?.serviceBookingId,
              expectedStartTime: selectedBooking?.expectedStartTime || "",
            }}
            onCancel={handleCancel}
            onFormSubmit={handleCompleteTest}
            isSubmitting={loading}
          />
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết lịch hẹn ${
          selectedBooking?.serviceBookingId
            ? `#${selectedBooking.serviceBookingId}`
            : ""
        }`}
        open={isDetailModalVisible}
        onCancel={handleDetailModalClose}
        footer={null}
        width={800}
      >
        {selectedBooking && (
          <div className="space-y-4">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px space-x-8">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'details'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Thông tin chi tiết
                </button>
                {selectedBooking.resultList?.length > 0 && (
                  <button
                    onClick={() => setActiveTab('results')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'results'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Kết quả xét nghiệm
                  </button>
                )}
                {(selectedBooking.rating || selectedBooking.comment) && (
                  <button
                    onClick={() => setActiveTab('feedback')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'feedback'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Đánh giá
                  </button>
                )}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="py-4">
              {activeTab === 'details' && (
                <div className="grid grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold border-b pb-2">
                      Thông tin chung
                    </h3>
                    <p>
                      <span className="font-medium">Tên:</span>{" "}
                      {selectedBooking.customerName || "Chưa cập nhật"}
                    </p>
                    <p>
                      <span className="font-medium">Trạng thái:</span>{" "}
                      <StatusTag
                        status={selectedBooking.status}
                        options={BOOKING_STATUS}
                      />
                    </p>
                  </div>

                  {/* Service Information */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold border-b pb-2">
                      Thông tin dịch vụ
                    </h3>
                    <p>
                      <span className="font-medium">Tên dịch vụ:</span>{" "}
                      {selectedBooking.serviceName || "Chưa cập nhật"}
                    </p>
                    <p>
                      <span className="font-medium">Nhân viên phụ trách:</span>{" "}
                      {selectedBooking.staffName || "Chưa phân công"}
                    </p>
                  </div>

                  {/* Appointment Times */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold border-b pb-2">
                      Thời gian hẹn
                    </h3>
                    <p>
                      <span className="font-medium">Ngày tạo:</span>{" "}
                      {selectedBooking.createdAt || "Chưa cập nhật"}
                    </p>
                    <p>
                      <span className="font-medium">Dự kiến bắt đầu:</span>{" "}
                      {selectedBooking.expectedStartTime || "Chưa cập nhật"}
                    </p>
                    <p>
                      <span className="font-medium">Thực tế bắt đầu:</span>{" "}
                      {selectedBooking.realStartTime || "Chưa cập nhật"}
                    </p>
                    <p>
                      <span className="font-medium">Dự kiến kết thúc:</span>{" "}
                      {selectedBooking.expectedEndTime || "Chưa cập nhật"}
                    </p>
                    <p>
                      <span className="font-medium">Thực tế kết thúc:</span>{" "}
                      {selectedBooking.realEndTime || "Chưa cập nhật"}
                    </p>
                  </div>

                  {/* Payment Information */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold border-b pb-2">
                      Thanh toán
                    </h3>
                    {selectedBooking.payment ? (
                      <>
                        <p>
                          <span className="font-medium">Mã giao dịch:</span>{" "}
                          {selectedBooking.payment.transactionId || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Số tiền:</span>{" "}
                          {selectedBooking.payment.amount
                            ? `${selectedBooking.payment.amount.toLocaleString()} VNĐ`
                            : "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Phương thức:</span>{" "}
                          {selectedBooking.payment.method || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Trạng thái:</span>{" "}
                          {selectedBooking.payment.status || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Ngày thanh toán:</span>{" "}
                          {selectedBooking.payment.createdAt || "N/A"}
                        </p>
                      </>
                    ) : (
                      <p>Chưa có thông tin thanh toán</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'results' && selectedBooking.resultList?.length > 0 && (
                <div className="space-y-4">
                  {selectedBooking.resultList.map((result, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg border">
                      <h4 className="font-medium text-gray-800 text-lg mb-3">
                        {result.title || `Kết quả ${index + 1}`}
                      </h4>
                      {result.description && (
                        <p className="text-gray-600 mb-4">{result.description}</p>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Loại kết quả</p>
                          <p className="font-medium">
                            {result.resultType}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Giới tính</p>
                          <p className="font-medium">
                            {result.genderType === 'MALE' ? 'Nam' : 'Nữ'}
                          </p>
                        </div>
                        {result.resultType === 'NUMERIC' && (
                          <>
                            <div>
                              <p className="text-sm text-gray-500">Giá trị tối thiểu</p>
                              <p className="font-medium">{result.minValue || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Giá trị tối đa</p>
                              <p className="font-medium">{result.maxValue || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Đơn vị</p>
                              <p className="font-medium">
                                {result.measureUnit || 'N/A'}
                              </p>
                            </div>
                          </>
                        )}
                        <div className="col-span-2 mt-2">
                          <p className="text-sm text-gray-500">Kết quả</p>
                          <p className="font-medium text-xl text-blue-600">
                            {result.result || 'Chưa có kết quả'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'feedback' && (selectedBooking.rating || selectedBooking.comment) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Đánh giá của khách hàng
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">Đánh giá:</span>{" "}
                      <span className="text-gray-700">
                        {selectedBooking.rating
                          ? selectedBooking.rating.replace("_", " ")
                          : "Chưa đánh giá"}
                      </span>
                    </div>
                    {selectedBooking.comment && (
                      <div>
                        <p className="font-medium mb-1">Nhận xét:</p>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          {selectedBooking.comment}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageOwnedTestBooking;
