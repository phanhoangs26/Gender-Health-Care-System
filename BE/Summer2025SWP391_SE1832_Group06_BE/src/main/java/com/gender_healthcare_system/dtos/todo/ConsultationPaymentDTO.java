package com.gender_healthcare_system.dtos.todo;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.gender_healthcare_system.entities.enu.PaymentMethod;
import com.gender_healthcare_system.entities.enu.PaymentStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;

import java.io.Serializable;
import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationPaymentDTO implements Serializable {

    private Integer consultationPaymentId;

    private String transactionId;

    private Long amount;

    private PaymentMethod method;

    @Nationalized
    private String description;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm")
    @Schema(type = "string", example = "05/06/2025 07:00")
    private LocalDateTime createdAt;

    private PaymentStatus status;

    public ConsultationPaymentDTO(Integer consultationPaymentId, Long amount,
                                  PaymentMethod method, String description, LocalDateTime createdAt,
                                  PaymentStatus status) {
        this.consultationPaymentId = consultationPaymentId;
        this.amount = amount;
        this.method = method;
        this.description = description;
        this.createdAt = createdAt;
        this.status = status;
    }
}
