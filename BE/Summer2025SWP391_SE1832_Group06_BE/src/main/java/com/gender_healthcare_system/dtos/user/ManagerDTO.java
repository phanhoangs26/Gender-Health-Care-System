package com.gender_healthcare_system.dtos.user;

import com.gender_healthcare_system.entities.enu.AccountStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ManagerDTO implements Serializable {

    private Integer accountId;
    private String userName;
    private String password;
    private String fullName;
    private String phone;
    private String email;
    private String address;
    private AccountStatus status;
}
