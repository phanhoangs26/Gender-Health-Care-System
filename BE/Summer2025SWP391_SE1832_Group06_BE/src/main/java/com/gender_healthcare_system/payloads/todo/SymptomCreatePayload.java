package com.gender_healthcare_system.payloads.todo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SymptomCreatePayload {
    @NotBlank
    private String name;

    private String description;

    @NotNull
    private Integer customerId;
}
