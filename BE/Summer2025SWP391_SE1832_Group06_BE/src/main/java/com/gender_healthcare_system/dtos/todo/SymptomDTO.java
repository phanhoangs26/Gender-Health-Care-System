package com.gender_healthcare_system.dtos.todo;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.gender_healthcare_system.entities.enu.SymptomSeverity;
import com.gender_healthcare_system.entities.enu.SymptomStatus;
import com.gender_healthcare_system.entities.user.Account;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SymptomDTO {
    private Integer symptomId;

    private String name;

    private String description;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm")
    @Schema(type = "string", example = "05/06/2025 07:00")
    private LocalDateTime recordedAt;

    private Account customer;

    private SymptomSeverity severity;

    private SymptomStatus status;

    private String note;

    public SymptomDTO(Integer symptomId, String name, String description, LocalDateTime recordedAt, Account customer) {
        this(symptomId, name, description, recordedAt, customer, null, null, null);
    }
}
