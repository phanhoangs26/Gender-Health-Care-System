package com.gender_healthcare_system.payloads.todo;

import com.gender_healthcare_system.entities.enu.GenderType;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;
import org.hibernate.validator.constraints.Length;

import java.io.Serializable;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestingServiceRegisterPayload implements Serializable {

    @Nationalized
    @NotBlank(message = "Service name is required")
    @Length(min = 5, max = 100, message = "Certificate name must be between 5 and 100 characters")
    private String serviceName;

    @Nationalized
    @Size(min = 5,max = 255, message = "Description must be empty " +
            "or between 5 and 255 characters")
    private String description;

    @NotNull(message = "Target gender is required")
    private GenderType targetGender;

    @NotNull(message = "Price Amount required")
    @Min(value = 50000, message = "Testing Service price amount must be at least 50 000 VND")
    @Max(value = 1000000, message = "Testing Service price amount must not exceed 1 000 000 VND")
    private Long priceAmount;

    @Nationalized
    @Size(min = 5,max = 255, message = "Price Description must be empty " +
            "or between 5 and 255 characters")
    private String priceDescription;

    @NotNull(message = "Service Type Id is required")
    private Integer serviceTypeId; // foreign key tới TestingServiceType

}
