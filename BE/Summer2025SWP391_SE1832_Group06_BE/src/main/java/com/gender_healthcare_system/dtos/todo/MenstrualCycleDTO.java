package com.gender_healthcare_system.dtos.todo;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.gender_healthcare_system.entities.enu.MenstrualSeverity;
import com.gender_healthcare_system.entities.enu.MenstrualStatus;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenstrualCycleDTO {
    private Integer cycleId;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    @Schema(type = "string", example = "05/06/2025")
    private LocalDate startDate;

    private Integer cycleLength;

    private Boolean isTrackingEnabled;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm")
    @Schema(type = "string", example = "05/06/2025 07:00")
    private LocalDateTime createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm")
    @Schema(type = "string", example = "05/06/2025 07:00")
    private LocalDateTime updatedAt;

    private LocalDate endDate;

    private MenstrualSeverity severity;

    private MenstrualStatus status;

    private String note;

    private Integer flowVolume;
    private LocalDate ovulationDate;
    private Double weight;
}
