package com.gender_healthcare_system.payloads.todo;

import com.gender_healthcare_system.entities.enu.PaymentMethod;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;
import org.hibernate.validator.constraints.Length;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentPayload implements Serializable {

    @Pattern(regexp = "\\d{8}", message = "Transaction ID must be exactly 8 digits")
    private String transactionId;

    @NotNull
    @Min(value = 10000, message = "Value must be at least 10,000 VND")
    @Max(value = 20000000, message = "Value must not exceed 20,000,000 VND")
    private Long amount;

    @NotNull(message = "Method is required")
    private PaymentMethod method;

    @Nationalized
    @Nullable
    @Size(min = 5, max = 100, message = "Description must be either " +
            "empty or between 5 to 100 characters")
    private String description;

    @NotBlank(message = "Created at timestamp is required")
    @Pattern(regexp = "\\d{14}", message = "Created at timestamp must be exactly 14 digits")
    private String createdAtTimeStamp;
}
