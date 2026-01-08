package com.gender_healthcare_system.payloads.todo;

import com.gender_healthcare_system.entities.enu.SymptomSeverity;
import com.gender_healthcare_system.entities.enu.SymptomStatus;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SymptomUpdatePayload {
    @NotBlank
    private String name;

    private String description;
    private SymptomSeverity severity;
    private SymptomStatus status;
    private String note;
}
