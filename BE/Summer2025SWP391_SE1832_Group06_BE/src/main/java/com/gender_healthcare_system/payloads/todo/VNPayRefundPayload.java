package com.gender_healthcare_system.payloads.todo;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VNPayRefundPayload implements Serializable {

    @NotBlank(message = "Transaction Reference is required")
    @Pattern(regexp = "^\\d{8}$", message = "Transaction Reference must be number and " +
            "has length of exactly 8 digits")
    private String transactionReference;

    @NotBlank(message = "Transaction ID is required")
    @Pattern(regexp = "^\\d{8}$", message = "Transaction ID must be number and " +
            "has length of exactly 8 digits")
    private String transactionId;

    @NotBlank(message = "Transaction Date is required")
    @Pattern(regexp = "^\\d{14}$", message = "Transaction Date must be number and " +
            "has length of exactly 14 digits")
    private String transactionDate;

    @NotNull(message = "Amount is required")
    @Min(value = 10000, message = "Amount must be at least 10 000 VND")
    @Max(value = 20000000, message = "Amount cannot exceed 20 000 000 VND")
    private Long amount;
}
