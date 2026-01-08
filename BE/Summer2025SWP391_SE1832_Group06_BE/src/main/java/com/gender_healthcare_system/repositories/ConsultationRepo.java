package com.gender_healthcare_system.repositories;

import com.gender_healthcare_system.dtos.report.StatisticResponseDTO;
import com.gender_healthcare_system.dtos.todo.ConsultationDTO;
import com.gender_healthcare_system.entities.enu.ConsultationStatus;
import com.gender_healthcare_system.entities.todo.Consultation;
import com.gender_healthcare_system.payloads.todo.ConsultationCompletePayload;
import com.gender_healthcare_system.payloads.todo.ConsultationConfirmPayload;
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
public interface ConsultationRepo extends JpaRepository<Consultation, Integer> {

    @Query("SELECT new com.gender_healthcare_system.dtos.todo" +
            ".ConsultationDTO(c.consultationId,c.consultant.fullName, c.consultationType.name, " +
            " c.createdAt, c.expectedStartTime, c.realStartTime, " +
            "c.expectedEndTime, c.realEndTime, c.description, c.status) " +
            "FROM Consultation c " +
            "JOIN c.customer " +
            "WHERE c.customer.accountId = :customerId")
    Page<ConsultationDTO> findByCustomerId(int customerId, Pageable pageable);

    @Query("SELECT new com.gender_healthcare_system.dtos.todo" +
            ".ConsultationDTO(c.consultationId, cs.fullName, c.consultationType.name, " +
            "c.createdAt, c.expectedStartTime, c.realStartTime, " +
            "c.expectedEndTime, c.realEndTime, c.description, c.status) " +
            "FROM Consultation c " +
            "JOIN c.consultant cs " +
            "WHERE cs.accountId = :consultantId")
    Page<ConsultationDTO> findByConsultantId(int consultantId, Pageable pageable);

    @Query("SELECT new com.gender_healthcare_system.entities.todo" +
            ".Consultation(c.consultationId, c.createdAt, " +
            "c.expectedStartTime, c.realStartTime, c.expectedEndTime, c.realEndTime, " +
            "c.status) " +
            "FROM Consultation c " +
            "WHERE c.consultationId = :id")
    Optional<Consultation> findConsultationById(int id);

    @Query("SELECT new com.gender_healthcare_system.dtos.todo" +
            ".ConsultationDTO(c.consultationId, c.consultationType.name, c.createdAt, " +
            "c.expectedStartTime, c.realStartTime, c.expectedEndTime, " +
            "c.realEndTime,c.description," +
            "c.status, " +
            "new com.gender_healthcare_system.dtos.user.CustomerDTO" +
            "(cu.accountId, cu.fullName, cu.dateOfBirth, cu.gender, " +
            "cu.phone, cu.email, cu.address), " +
            "new com.gender_healthcare_system.dtos.todo.ConsultationPaymentDTO" +
            "(cp.consultationPaymentId, cp.amount, cp.method, cp.description," +
            " cp.createdAt, cp.status)) " +
            "FROM Consultation c " +
            "JOIN c.customer cu " +
            "JOIN c.consultationPayment cp " +
            "WHERE c.consultationId = :id")
    Optional<ConsultationDTO> getConsultationDetailsById(int id);

    @Query("SELECT new com.gender_healthcare_system.dtos.todo" +
            ".ConsultationDTO(c.consultationId, c.consultationType.name, c.createdAt, " +
            "c.expectedStartTime, c.realStartTime, c.expectedEndTime, " +
            "c.realEndTime,c.description, c.status, " +
            "new com.gender_healthcare_system.dtos.todo.ConsultationPaymentDTO" +
            "(cp.consultationPaymentId, cp.transactionId, cp.amount, cp.method, " +
            "cp.description, cp.createdAt, cp.status)) " +
            "FROM Consultation c " +
            "JOIN c.customer cu " +
            "JOIN c.consultationPayment cp " +
            "WHERE c.consultationId = :id")
    Optional<ConsultationDTO> getConsultationDetailsByIdForCustomer(int id);

    @Query("SELECT c.expectedStartTime " +
            "FROM Consultation c " +
            "WHERE c.consultant.accountId = :id " +
            "AND CAST(c.expectedStartTime as date) = :date " +
            "AND c.status <> com.gender_healthcare_system.entities.enu.ConsultationStatus.CANCELLED")
    List<LocalDateTime> getConsultantScheduleByDate(int id, LocalDate date);


    @Modifying
    @Query("UPDATE Consultation c SET " +
            "c.expectedStartTime = :#{#payload.expectedStartTime}, " +
            "c.expectedEndTime = :expectedEndTime, " +
            "c.status = :status " +
            "WHERE c.consultationId = :consultationId")
    void updateConsultation(int consultationId,
                            @Param("payload") ConsultationConfirmPayload payload,
                            LocalDateTime expectedEndTime,
                            ConsultationStatus status);

    @Modifying
    @Query("UPDATE Consultation c SET " +
            "c.comment = :#{#payload.comment}, " +
            "c.rating = :#{#payload.rating} " +
            "WHERE c.consultationId = :consultationId")
    void updateConsultationCommentAndRatingById(int consultationId,
                                                @Param("payload") EvaluatePayload payload);

    @Modifying
    @Query("UPDATE Consultation c SET " +
            "c.realStartTime = :#{#payload.realStartTime}, " +
            "c.realEndTime = :#{#payload.realEndTime}, " +
            "c.description = :#{#payload.description}, " +
            "c.status = :status " +
            "WHERE c.consultationId = :#{#payload.consultationId}")
    void completeConsultation(@Param("payload") ConsultationCompletePayload payload,
                              ConsultationStatus status);

    @Modifying
    @Query("UPDATE Consultation c SET " +
            "c.status = com.gender_healthcare_system.entities.enu.ConsultationStatus.CANCELLED " +
            "WHERE c.consultationId = :id")
    void cancelConsultation(int id);

    boolean existsConsultationByConsultantAccountIdAndExpectedStartTimeAndStatusNot
            (int consultantAccountId, LocalDateTime expectedStartTime, ConsultationStatus status);

    //report
    @Query("SELECT new com.gender_healthcare_system.dtos.report.StatisticResponseDTO" +
            "(CAST(c.createdAt as date), COUNT(c), SUM(p.amount)) " +
            "FROM Consultation c " +
            "JOIN c.consultationPayment p " +
            "WHERE c.status = :status " +
            "AND CAST(c.createdAt as DATE) >= :from " +
            "GROUP BY CAST(c.createdAt as DATE) " +
            "ORDER BY CAST(c.createdAt as DATE)")
    List<StatisticResponseDTO> getConsultationsStatistics
    (@Param("status") ConsultationStatus status, @Param("from") LocalDate fromDate);

}
