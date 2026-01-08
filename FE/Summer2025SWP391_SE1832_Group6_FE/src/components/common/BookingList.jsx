import React, { useRef, useEffect, useState } from "react";
import { Card, List, Button, Empty, Spin } from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  MessageOutlined,
  UpOutlined,
  DownOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { StatusTag } from "./DataTable";
import { BOOKING_STATUS } from "../../constants/statusOptions";

const BookingList = ({
  bookings = [],
  onCancelBooking,
  onReviewBooking,
  loading = false,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  title = "Lịch sử đặt lịch",
  emptyText = "Chưa có lịch hẹn nào",
  showButton = true,
  initialShowCount = 3, // Number of items to show initially
}) => {
  const [showAll, setShowAll] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  // Toggle expand/collapse for a specific booking
  const toggleExpand = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  // Handle scroll to load more
  const listRef = useRef(null);

  useEffect(() => {
    const currentList = listRef.current;
    if (!currentList || !onLoadMore || loading || loadingMore || !hasMore)
      return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(currentList.lastElementChild);
    return () => observer.disconnect();
  }, [bookings, loading, loadingMore, hasMore, onLoadMore]);

  // Determine which bookings to show based on showAll state
  const displayedBookings = showAll
    ? bookings
    : bookings.slice(0, initialShowCount);
  const hasMoreToShow = bookings.length > initialShowCount;

  // Show more/less button
  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  // Show load more button for pagination
  const loadMoreNode = hasMore && (
    <div className="text-center py-4">
      {loadingMore ? (
        <div className="py-2">
          <Spin size="small" />
          <span className="ml-2">Đang tải thêm...</span>
        </div>
      ) : (
        <Button type="link" onClick={onLoadMore}>
          Tải thêm lịch hẹn
        </Button>
      )}
    </div>
  );

  // Show more/less toggle button
  const showMoreLessButton = hasMoreToShow && !hasMore && (
    <div className="text-center py-2">
      <Button
        type="link"
        onClick={toggleShowAll}
        className="text-green-600 hover:text-green-800"
      >
        {showAll
          ? "Ẩn bớt"
          : `Xem thêm (${bookings.length - initialShowCount} lịch hẹn khác)`}
      </Button>
    </div>
  );

  return (
    <Card title={title} className="mt-6 shadow-lg" loading={loading}>
      {bookings.length > 0 ? (
        <>
          <List
            itemLayout="vertical"
            dataSource={displayedBookings}
            ref={listRef}
            renderItem={(booking) => {
              const consultantName = booking.consultantName;
              const bookingId = booking.consultationId || booking.serviceBookingId;
              const status = booking.status;
              const isExpanded = expandedItems[bookingId] || false;
              return (
                <List.Item
                  key={bookingId}
                  className={`border-b border-gray-100 last:border-0 transition-all duration-200 ${
                    isExpanded ? "bg-gray-50" : ""
                  }`}
                  onClick={() => {
                    // Only allow clicking if status is not cancelled
                    if (status !== "CANCELLED") {
                      toggleExpand(bookingId);
                    }
                  }}
                  style={{ 
                    cursor: status !== "CANCELLED" ? "pointer" : "default",
                    opacity: status === "CANCELLED" ? 0.7 : 1 
                  }}
                >
                  <div className="w-full">
                    <div className="flex justify-between items-start w-full">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium">
                            {consultantName ? "Tên tư vấn viên: " + consultantName : "Mã đặt dịch vụ: " + bookingId}
                          </h3>
                          <StatusTag status={status} options={BOOKING_STATUS} />
                        </div>

                        {booking.staffName && (
                            <p className="mb-1">
                              <UserOutlined className="mr-2" />
                              Quản lý bởi: {booking.staffName}
                            </p>
                          )
                        }

                        <div className="mt-2 text-gray-600">
                          <p className="mb-1">
                            {booking.expectedStartTime ? (
                              <>
                                <CalendarOutlined className="mr-2" />
                                {booking.expectedStartTime} -{" "}
                                {booking.expectedEndTime}
                              </>
                            ) : (
                              <span className="text-gray-500">
                                <CalendarOutlined className="mr-2" />
                                Chưa có thời gian dự kiến
                              </span>
                            )}

                            {booking.serviceName && (
                              <>
                                <FileTextOutlined className="mr-2 ml-2" />
                                {booking.serviceName}
                              </>
                            )}
                          </p>
                        </div>

                        {isExpanded && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            {booking.note && (
                              <p className="text-gray-600 mb-2">
                                <MessageOutlined className="mr-2" />
                                {booking.note}
                              </p>
                            )}
                            {showButton && status !== "CANCELLED" && (
                              <div className="mt-2 flex justify-end gap-2">
                                {status === "COMPLETED" ? (
                                  <Button
                                    type="primary"
                                    className="w-full bg-green-600 border-green-600 hover:bg-green-700 hover:border-green-700"
                                    size="middle"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onReviewBooking?.(bookingId);
                                    }}
                                  >
                                    Đánh giá
                                  </Button>
                                ) : (
                                  <Button
                                    type="primary"
                                    danger
                                    className="w-full bg-red-600 border-red-600 hover:bg-red-700 hover:border-red-700"
                                    size="middle"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onCancelBooking(bookingId);
                                    }}
                                  >
                                    Hủy đặt lịch
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="ml-4 flex-shrink-0">
                        <Button
                          type="text"
                          icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(bookingId);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </List.Item>
              );
            }}
          />
          {showMoreLessButton}
          {loadMoreNode}
        </>
      ) : (
        <Empty description={emptyText} />
      )}
    </Card>
  );
};

export default BookingList;
