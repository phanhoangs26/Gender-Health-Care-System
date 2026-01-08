package com.gender_healthcare_system.repositories;

import com.gender_healthcare_system.dtos.report.StatisticResponseDTO;
import com.gender_healthcare_system.dtos.todo.TestingServiceBookingDTO;
import com.gender_healthcare_system.entities.enu.TestingServiceBookingStatus;
import com.gender_healthcare_system.entities.todo.TestingServiceBooking;
import com.gender_healthcare_system.payloads.todo.EvaluatePayload;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TestingServiceBookingRepo extends JpaRepository<TestingServiceBooking, Integer> {

    //get testingServiceHistoryDTO by id
    @Query("SELECT new com.gender_healthcare_system.dtos.todo.TestingServiceBookingDTO(" +
            "tsb.serviceBookingId, ts.serviceName, s.fullName, c.fullName, " +
            "tsb.result, tsb.rating, tsb.comment,tsb.createdAt, tsb.expectedStartTime, " +
            "tsb.realStartTime, tsb.expectedEndTime, tsb.realEndTime, tsb.status, " +
            "new com.gender_healthcare_system.dtos.todo.TestingServiceBookingPaymentDTO" +
            "(tsp.transactionId, tsp.amount, tsp.method, tsp.createdAt, " +
            "tsp.description, tsp.status)) " +
            "FROM TestingServiceBooking tsb " +
            "JOIN tsb.testingService ts " +
            "LEFT JOIN tsb.staff s " +
            "JOIN tsb.customer c " +
            "LEFT JOIN tsb.testingServicePayment tsp " +
            "WHERE tsb.serviceBookingId = :id")
    Optional<TestingServiceBookingDTO> getTestingBookingDetailsById(@Param("id") int id);

    @Query("SELECT new com.gender_healthcare_system.entities.todo.TestingServiceBooking(" +
            "tsb.serviceBookingId, tsb.result, tsb.rating, tsb.comment, " +
            "tsb.createdAt, tsb.expectedStartTime, tsb.realStartTime, tsb.expectedEndTime, " +
            "tsb.realEndTime, tsb.status) " +
            "FROM TestingServiceBooking tsb " +
            "WHERE tsb.serviceBookingId = :id")
    Optional<TestingServiceBooking> getTestingServiceBookingById(@Param("id") int id);

    // Get overall flag logic of a TestingService by Testing Booking ID
    @Query("SELECT ts.overallFlagLogic " +
            "FROM TestingServiceBooking tsb " +
            "JOIN tsb.testingService ts " +
            "WHERE tsb.serviceBookingId = :bookingId")
    String getTestingServiceFlagLogicByBookingId(int bookingId);

    //get all TestingServiceBooking (only entity)
    @Query("SELECT new com.gender_healthcare_system.dtos.todo.TestingServiceBookingDTO" +
            "(tsb.serviceBookingId, ts.serviceName, s.fullName, tsb.createdAt, " +
            "tsb.expectedStartTime, tsb.status) " +
            "FROM TestingServiceBooking tsb " +
            "JOIN tsb.testingService ts " +
            "LEFT JOIN tsb.staff s " +
            "JOIN tsb.customer c " +
            "WHERE c.accountId = :id")
    Page<TestingServiceBookingDTO> getAllTestingServiceBookingsByCustomerId
    (int id, Pageable pageable);

    //get all TestingServiceBooking (only entity)
    @Query("SELECT new com.gender_healthcare_system.dtos.todo.TestingServiceBookingDTO" +
            "(tsb.serviceBookingId, ts.serviceName, c.fullName, tsb.createdAt, " +
            "tsb.expectedStartTime, tsb.status) " +
            "FROM TestingServiceBooking tsb " +
            "JOIN tsb.testingService ts " +
            "LEFT JOIN tsb.staff s " +
            "JOIN tsb.customer c " +
            "WHERE s.accountId = :id")
    Page<TestingServiceBookingDTO> getAllTestingServiceBookingsByStaffId
    (int id, Pageable pageable);

    @Query("SELECT tsb.expectedStartTime " +
            "FROM TestingServiceBooking tsb " +
            "WHERE CAST(tsb.expectedStartTime AS DATE) = :date " +
            "AND tsb.status <> :status " +
            "GROUP BY tsb.expectedStartTime " +
            "HAVING COUNT(tsb) = 5 " +
            "ORDER BY tsb.expectedStartTime")
    List<LocalDateTime> getBookingScheduleInADate
            (LocalDate date, TestingServiceBookingStatus status);

    @Query("SELECT tsb.expectedStartTime " +
            "FROM TestingServiceBooking tsb " +
            "WHERE tsb.customer.accountId = :customerId " +
            "AND tsb.testingService.serviceId = :serviceId " +
            "AND CAST(tsb.expectedStartTime AS DATE) = :date " +
            "AND tsb.status <> :status " +
            "GROUP BY tsb.expectedStartTime " +
            "ORDER BY tsb.expectedStartTime")
    List<LocalDateTime> getCustomerBookedScheduleInADate
            (int serviceId, int customerId, LocalDate date,
             TestingServiceBookingStatus status);

    @Query("SELECT COUNT(tsb) AS numberOfBookings " +
            "FROM TestingServiceBooking tsb " +
            "WHERE tsb.expectedStartTime = :startTime " +
            "AND NOT tsb.status = :status")
    int getNumberOfBookingsInATime
            (LocalDateTime startTime,
             TestingServiceBookingStatus status);

    @Modifying
    @Query("UPDATE TestingServiceBooking tsb SET " +
            "tsb.result = :result, " +
            "tsb.realStartTime = :realStartTime, " +
            "tsb.realEndTime = :realEndTime, " +
            "tsb.status = :status " +
            "WHERE tsb.serviceBookingId = :id")
    void completeTestingServiceBooking(@Param("id") int id, 
                                      @Param("realStartTime") LocalDateTime realStartTime,
                                      @Param("realEndTime") LocalDateTime realEndTime,
                                      String result,
                                      TestingServiceBookingStatus status);

    @Modifying
    @Query("UPDATE TestingServiceBooking tsb SET " +
            "tsb.realStartTime = :realStartTime " +
            "WHERE tsb.serviceBookingId = :id")
    void startTestingServiceBooking(@Param("id") int id, @Param("realStartTime") LocalDateTime realStartTime);

    @Modifying
    @Query("UPDATE TestingServiceBooking tsb SET " +
            "tsb.comment = :#{#payload.comment}, " +
            "tsb.rating = :#{#payload.rating} " +
            "WHERE tsb.serviceBookingId = :bookingId")
    void updateServiceBookingCommentAndRatingById(int bookingId,
                                                @Param("payload") EvaluatePayload payload);

    @Modifying
    @Query("UPDATE TestingServiceBooking tsb " +
            "SET tsb.status = :status " +
            "WHERE tsb.serviceBookingId = :id")
    void cancelTestingServiceBooking(@Param("id") int id,
                                     TestingServiceBookingStatus status);

    @Modifying
    @Query("DELETE FROM TestingServiceBooking tsb WHERE tsb.serviceBookingId = :id")
    void deleteTestingServiceBooking(@Param("id") int id);

    //report
    @Query("SELECT new com.gender_healthcare_system.dtos.report.StatisticResponseDTO" +
            "(CAST(b.createdAt AS DATE), COUNT(b), SUM(p.amount)) " +
            "FROM TestingServiceBooking b " +
            "JOIN b.testingServicePayment p " +
            "WHERE b.status = :status " +
            "AND CAST( b.createdAt AS DATE) >= :from " +
            "GROUP BY CAST(b.createdAt AS DATE) " +
            "ORDER BY CAST(b.createdAt AS DATE)")
    List<StatisticResponseDTO> getTestingBookingsStatistics
    (@Param("status") TestingServiceBookingStatus status, @Param("from") LocalDate from);

    boolean existsByTestingService_ServiceIdAndCustomer_AccountIdAndExpectedStartTime(int testingServiceServiceId, int customerAccountId, LocalDateTime expectedStartTime);

    @Query("SELECT tsb.testingService.serviceId FROM TestingServiceBooking tsb WHERE tsb.serviceBookingId = :bookingId")
    Integer findServiceIdByBookingId(@Param("bookingId") int bookingId);
}