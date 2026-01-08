package com.gender_healthcare_system.dtos.todo;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.gender_healthcare_system.entities.enu.Rating;
import com.gender_healthcare_system.entities.enu.TestingServiceBookingStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TestingServiceBookingDTO implements Serializable {

    /* ====== CÁC TRƯỜNG CHÍNH ====== */
    private Integer serviceBookingId;

    private String serviceName;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String staffName;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String customerName;

    private String result;

    private Rating rating;

    private String comment;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm")
    @Schema(type = "string", example = "05/06/2025 07:00")
    private LocalDateTime createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm")
    @Schema(type = "string", example = "05/06/2025 07:00")
    private LocalDateTime expectedStartTime;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm")
    @Schema(type = "string", example = "05/06/2025 07:00")
    private LocalDateTime realStartTime;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm")
    @Schema(type = "string", example = "05/06/2025 07:00")
    private LocalDateTime expectedEndTime;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm")
    @Schema(type = "string", example = "05/06/2025 07:00")
    private LocalDateTime realEndTime;

    private TestingServiceBookingStatus status;

    private TestingResultDetailsDTO results;

    private TestingServiceBookingPaymentDTO payment;

    public TestingServiceBookingDTO(int serviceBookingId, String serviceName, String staffName,
                                    String customerName, String result, Rating rating,
                                    String comment, LocalDateTime createdAt,
                                    LocalDateTime expectedStartTime,
                                    LocalDateTime realStartTime,
                                    LocalDateTime expectedEndTime,
                                    LocalDateTime realEndTime,
                                    TestingServiceBookingStatus status,
                                    TestingServiceBookingPaymentDTO payment) {

        this.serviceBookingId = serviceBookingId;
        this.serviceName = serviceName;
        this.staffName = staffName;
        this.customerName = customerName;
        this.result = result;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
        this.expectedStartTime = expectedStartTime;
        this.realStartTime = realStartTime;
        this.expectedEndTime = expectedEndTime;
        this.realEndTime = realEndTime;
        this.status = status;
        this.payment = payment;
    }

    public TestingServiceBookingDTO(Integer serviceBookingId, String serviceName,
                                    String name, LocalDateTime createdAt,
                                    LocalDateTime expectedStartTime,
                                    TestingServiceBookingStatus status) {
        this.serviceBookingId = serviceBookingId;
        this.serviceName = serviceName;
        this.staffName = name;
        this.customerName = name;
        this.createdAt = createdAt;
        this.expectedStartTime =expectedStartTime;
        this.status = status;
    }


}
