package com.gender_healthcare_system.payloads.user;

import java.io.Serializable;
import java.util.List;

import org.hibernate.annotations.Nationalized;
import org.hibernate.validator.constraints.Length;

import com.gender_healthcare_system.payloads.todo.CertificateRegisterPayload;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConsultantRegisterPayload implements Serializable {

    @NotBlank(message = "Username is required")
    @Length(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Length(min = 3, max = 50, message = "Password must be between 3 and 50 characters")
    private String password;

    @NotBlank(message = "Full name is required")
    @Length(min = 3,max = 70, message = "Full name must be between 3 and 70 characters")
    @Nationalized
    private String fullName;

    @NotBlank(message = "Avatar URL is required")
    @Length(min =20, max = 255, message = "Avatar URL must be between 20 and 255 characters")
    private String avatarUrl;

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

    @Valid
    @NotNull(message = "Consultant must have at least one certificate")
    private List<CertificateRegisterPayload> certificates;
}
