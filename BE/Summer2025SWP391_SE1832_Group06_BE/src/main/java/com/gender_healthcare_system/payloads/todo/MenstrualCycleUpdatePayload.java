package com.gender_healthcare_system.payloads.todo;

import java.time.LocalDate;

import org.hibernate.validator.constraints.Length;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.gender_healthcare_system.entities.enu.MenstrualSeverity;
import com.gender_healthcare_system.entities.enu.MenstrualStatus;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MenstrualCycleUpdatePayload {

    @NotNull(message = "Start Date is required")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    @Schema(type = "string", example = "05/06/2025")
    private LocalDate startDate;

    @NotNull(message = "Cycle length is required")
    @Min(value = 28, message = "Cycle length must be at least 28 days")
    @Max(value = 45, message = "Cycle length must not exceed 45 days")
    private Integer cycleLength;

    @NotNull(message = "Is Tracking Enabled is required")
    private Boolean isTrackingEnabled;

    private MenstrualSeverity severity;
    private MenstrualStatus status;

    @Length(min = 5, max = 255, message = "Note must be either empty or" +
            " between 5 and 255 characters")
    private String note;

    private Integer flowVolume;
    private LocalDate ovulationDate;
    private Double weight;

    private LocalDate endDate;
}
