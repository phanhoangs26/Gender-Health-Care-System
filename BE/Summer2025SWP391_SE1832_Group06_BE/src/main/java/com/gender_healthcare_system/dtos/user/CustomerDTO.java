package com.gender_healthcare_system.dtos.user;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.Period;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.gender_healthcare_system.dtos.todo.MenstrualCycleDTO;
import com.gender_healthcare_system.entities.enu.AccountStatus;
import com.gender_healthcare_system.entities.enu.Gender;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
@NoArgsConstructor
public class        CustomerDTO implements Serializable {

    private Integer accountId;

    private String userName;

    private String fullName;

    @Schema(type = "string", example = "05/06/2025")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    private LocalDate dateOfBirth;

    private Gender gender;

    private String phone;

    private String email;

    private String address;

    private String menstrualMedications; // Thông tin thuốc đã uống khi đến tháng

    private AccountStatus status;
    private MenstrualCycleDTO menstrualCycle;

    // Main constructor with all fields
    public CustomerDTO(Integer accountId, String userName, String fullName, LocalDate dateOfBirth, Gender gender, String phone, String email, String address, AccountStatus status) {
        this.accountId = accountId;
        this.userName = userName;
        this.fullName = fullName;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.status = status;
    }

    // Shorter constructor for some use cases
    public CustomerDTO(Integer accountId, String fullName, LocalDate dateOfBirth, Gender gender, String phone, String email, String address) {
        this.accountId = accountId;
        this.fullName = fullName;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.phone = phone;
        this.email = email;
        this.address = address;
    }

    public CustomerDTO(Integer accountId, String userName, String fullName, Gender gender, AccountStatus status) {
        this.accountId = accountId;
        this.userName = userName;
        this.fullName = fullName;
        this.gender = gender;
        this.status = status;
    }

    public Integer getAge() {
        if (dateOfBirth == null) return null;
        return Period.between(dateOfBirth, LocalDate.now()).getYears();
    }

    public boolean isPerimenopausalAge() {
        Integer age = getAge();
        return age != null && age >= 40 && age <= 50;
    }
}
