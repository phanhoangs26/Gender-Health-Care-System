package com.gender_healthcare_system.payloads.user;

import java.io.Serializable;

import org.hibernate.annotations.Nationalized;
import org.hibernate.validator.constraints.Length;

import com.gender_healthcare_system.entities.enu.AccountStatus;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ManagerUpdatePayload implements Serializable {

    @NotBlank(message = "Full name is required")
    @Length(min = 3,max = 70, message = "Full name must be between 3 and 70 characters")
    @Nationalized
    private String fullName;

    @NotBlank(message = "Phone is required")
    @Length(min = 10, max = 15, message = "Phone number must be between 10 and 15 digits")
    private String phone;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Address is required")
    @Length(min = 3, max = 100, message = "Address must be between 3 and 100 characters")
    @Nationalized
    private String address;

    @NotNull(message = "Status is required")
    private AccountStatus status;
}
