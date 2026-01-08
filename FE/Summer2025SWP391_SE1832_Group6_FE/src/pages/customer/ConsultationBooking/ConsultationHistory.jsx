import React, { useState, useCallback, useEffect, useContext } from 'react'
import BookingList from '../../../components/common/UserBookingList';
import { message } from 'antd';
import api from '../../../api/axios';
import { fetchPaginatedData } from '../../../utils/apiUtils';
import { AuthContext } from '../../../context/AuthContext';
import ReviewModal from '../../../components/common/ReviewModal';


export default function ConsultationHistory() {
  const { user, authLoading, isAuthenticated } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({});

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

    const refreshBookings = useCallback(async () => {
      setLoading(true);
      try {
        const result = await fetchBookings(0);
        setBookings(result.data);
        setPagination({
          currentPage: 0,
          hasMore: result.data.length > 0 && result.data.length === 10, // Assuming 10 items per page
          totalItems: result.total
        });
      } catch (error) {
        console.error("Error refreshing bookings:", error);
        message.error("Không thể làm mới danh sách. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    }, [fetchBookings]);

    const loadMore = useCallback(async () => {
      if (loadingMore || !pagination.hasMore) return;
      
      setLoadingMore(true);
      try {
        const nextPage = (pagination.currentPage || 0) + 1;
        const result = await fetchBookings(nextPage);
        
        setBookings(prev => [...prev, ...result.data]);
        setPagination({
          currentPage: nextPage,
          hasMore: result.data.length > 0 && result.data.length === 10, // Assuming 10 items per page
          totalItems: result.total
        });
      } catch (error) {
        console.error("Error loading more bookings:", error);
        message.error("Không thể tải thêm lịch sử. Vui lòng thử lại sau.");
      } finally {
        setLoadingMore(false);
      }
    }, [fetchBookings, loadingMore, pagination.currentPage, pagination.hasMore]);

    const [currentReview, setCurrentReview] = useState(null);
    const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

  // Initial data fetch
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const result = await fetchBookings(0);
        setBookings(result.data);
        setPagination({
          currentPage: 0,
          hasMore: result.data.length > 0 && result.data.length === 10, // Assuming 10 items per page
          totalItems: result.total
        });
      } catch (error) {
        console.error("Error loading initial data:", error);
        message.error("Không thể tải lịch sử đặt lịch. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.id) {
      loadInitialData();
    }
  }, [fetchBookings, isAuthenticated, user?.id]);

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

  return (
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
      
      <ReviewModal
        isVisible={isReviewModalVisible}
        onClose={() => setIsReviewModalVisible(false)}
        onSubmit={handleSubmitReview}
        initialRating={currentReview?.rating || "GOOD"}
        initialComment={currentReview?.comment || ""}
      />
    </div>
  )
}
