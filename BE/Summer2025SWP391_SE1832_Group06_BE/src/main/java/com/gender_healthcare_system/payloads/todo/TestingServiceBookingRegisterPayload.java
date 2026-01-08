package com.gender_healthcare_system.payloads.todo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TestingServiceBookingRegisterPayload implements Serializable {

    @NotNull(message = "Service ID is required")
    private Integer serviceId;

    @NotNull(message = "Customer ID is required")
    private Integer customerId;

    @NotNull(message = "Expected Start time is required")
    @Schema(type = "string", example = "05/06/2025 07:00")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm")
    private LocalDateTime expectedStartTime;

    @Valid
    @NotNull(message = "Testing Booking Payment is required")
    private PaymentPayload payment;
}
