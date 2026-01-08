package com.gender_healthcare_system.payloads.login;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequest implements Serializable {

    @NotBlank(message = "Username is required")
    @Length(min = 3, max = 50, message = "User name must be between 3 to 50 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Length(min = 3, max = 50, message = "Password must be between 3 to 50 characters")
    private String password;

}
