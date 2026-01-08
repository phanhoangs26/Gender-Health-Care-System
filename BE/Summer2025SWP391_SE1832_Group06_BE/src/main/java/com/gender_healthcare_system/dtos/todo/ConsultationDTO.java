package com.gender_healthcare_system.dtos.todo;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.gender_healthcare_system.dtos.user.CustomerDTO;
import com.gender_healthcare_system.entities.enu.ConsultationStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationDTO implements Serializable {

    private Integer consultationId;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(type = "string", example = "Phan Hoang S")
    private String consultantName;

    private String consultationType;

    @Schema(type = "string", example = "05/06/2025 07:00")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm")
    private LocalDateTime createdAt;

    @Schema(type = "string", example = "05/06/2025 07:00")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm")
    private LocalDateTime expectedStartTime;

    @Schema(type = "string", example = "05/06/2025 07:00")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm")
    private LocalDateTime realStartTime;

    @Schema(type = "string", example = "05/06/2025 07:00")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm")
    private LocalDateTime expectedEndTime;

    @Schema(type = "string", example = "05/06/2025 07:00")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm")
    private LocalDateTime realEndTime;

    @Schema(type = "string", example = "Tư vấn sức khỏe sinh sản tổng quát")
    private String description;

    private ConsultationStatus status;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private CustomerDTO customerDetails;

    private ConsultationPaymentDTO payment;

    public ConsultationDTO(Integer consultationId, String consultationType,
                           LocalDateTime createdAt,
                           LocalDateTime expectedStartTime, LocalDateTime realStartTime,
                           LocalDateTime expectedEndTime, LocalDateTime realEndTime,
                           String description, ConsultationStatus status,
                           CustomerDTO customerDetails,
                           ConsultationPaymentDTO payment) {
        this.consultationId = consultationId;
        this.consultationType = consultationType;
        this.createdAt = createdAt;
        this.expectedStartTime = expectedStartTime;
        this.realStartTime = realStartTime;
        this.expectedEndTime = expectedEndTime;
        this.realEndTime = realEndTime;
        this.description = description;
        this.status = status;
        this.customerDetails = customerDetails;
        this.payment = payment;
    }

    public ConsultationDTO(Integer consultationId, String consultationType,
                           LocalDateTime createdAt,
                           LocalDateTime expectedStartTime,
                           LocalDateTime realStartTime,
                           LocalDateTime expectedEndTime,
                           LocalDateTime realEndTime, String description,
                           ConsultationStatus status,
                           ConsultationPaymentDTO payment) {
        this.consultationId = consultationId;
        this.consultationType = consultationType;
        this.createdAt = createdAt;
        this.expectedStartTime = expectedStartTime;
        this.realStartTime = realStartTime;
        this.expectedEndTime = expectedEndTime;
        this.realEndTime = realEndTime;
        this.description = description;
        this.status = status;
        this.payment = payment;
    }

    public ConsultationDTO(Integer consultationId, String consultantName,
                           String consultationType,
                           LocalDateTime createdAt, LocalDateTime expectedStartTime,
                           LocalDateTime realStartTime, LocalDateTime expectedEndTime,
                           LocalDateTime realEndTime, String description,
                           ConsultationStatus status) {
        this.consultationId = consultationId;
        this.consultantName = consultantName;
        this.consultationType = consultationType;
        this.createdAt = createdAt;
        this.expectedStartTime = expectedStartTime;
        this.realStartTime = realStartTime;
        this.expectedEndTime = expectedEndTime;
        this.realEndTime = realEndTime;
        this.description = description;
        this.status = status;
    }
}
