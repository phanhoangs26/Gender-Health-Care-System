package com.gender_healthcare_system.dtos.login;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.gender_healthcare_system.entities.enu.Gender;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LoginResponse implements Serializable {

    private Integer id;
    private String username;
    private String fullname;
    private Gender gender;
    private String avatarUrl;
    private String email;
    private String token;

    public LoginResponse(Integer id, String fullname, String email) {
        this.id = id;
        this.fullname = fullname;
        this.email = email;
    }

    public LoginResponse(Integer id, String fullname, Gender gender, String email) {
        this.id = id;
        this.fullname = fullname;
        this.gender = gender;
        this.email = email;
    }
}
