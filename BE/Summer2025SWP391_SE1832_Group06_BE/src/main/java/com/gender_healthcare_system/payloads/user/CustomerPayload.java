package com.gender_healthcare_system.payloads.user;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.Period;

import org.hibernate.annotations.Nationalized;
import org.hibernate.validator.constraints.Length;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.gender_healthcare_system.entities.enu.Gender;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerPayload implements Serializable {

    @NotBlank(message = "Username is required")
    @Length(min = 3, max = 50, message = "Username must be between 3 and 20 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Length(min = 3, max = 50, message = "Password must be between 3 and 50 characters")
    private String password;

    @NotBlank(message = "Full name is required")
    @Length(min = 3,max = 70, message = "Full name must be between 3 and 70 characters")
    @Nationalized
    private String fullName;

    @NotNull(message = "Date of birth is required")
    @Schema(type = "string", example = "05/06/2025")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    private LocalDate dateOfBirth;

    @NotNull(message = "Gender is required")
    private Gender gender; //Enum

    @NotBlank(message = "Phone is required")
    @Length(min = 10, max = 15, message = "Phone number must be between 10 and 15 digits")
    private String phone;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@gmail\\.com$", message = "Email must be a Gmail address")
    private String email;

    @NotBlank(message = "Address is required")
    @Length(min = 3, max = 100, message = "Address must be between 3 and 100 characters")
    @Nationalized
    private String address;

    private String menstrualMedications; // Thông tin thuốc đã uống khi đến tháng

    public Integer getAge() {
        if (dateOfBirth == null) return null;
        return Period.between(dateOfBirth, LocalDate.now()).getYears();
    }

    public boolean isPerimenopausalAge() {
        Integer age = getAge();
        return age != null && age >= 40 && age <= 50;
    }
}
