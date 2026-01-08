package com.gender_healthcare_system.payloads.todo;

import com.gender_healthcare_system.entities.enu.GenderType;
import com.gender_healthcare_system.entities.enu.TestingServiceStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;
import org.hibernate.validator.constraints.Length;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestingServiceUpdatePayload implements Serializable {

/*    @NotNull
    private int serviceId; // ID của dịch vụ xét nghiệm, dùng để cập nhật*/

    @Nationalized
    @NotBlank(message = "Service name is required")
    @Length(min = 5, max = 100, message = "Certificate name must be between 5 and 100 characters")
    private String serviceName;

    @Nationalized
    @Length(min = 5, max = 255, message = "Description must be either" +
            "empty or between 5 and 255 characters")
    private String description;

    @NotNull(message = "Target Gender is required")
    private GenderType targetGender;

    @NotNull(message = "Price Amount is required")
    @Min(value = 50000, message = "Price Amount must be at least 50 000 VND")
    @Min(value = 1000000, message = "Price Amount must not exceed 1 000 000 VND")
    private String priceAmount;

    @Nationalized
    @Length(min = 5, max = 255, message = "Price Description must be either" +
            "empty or between 5 and 255 characters")
    private String priceDescription;

    @NotNull(message = "Status is required")
    private TestingServiceStatus status;


}
