package com.gender_healthcare_system.dtos.user;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.gender_healthcare_system.dtos.todo.CertificateDTO;
import com.gender_healthcare_system.entities.enu.AccountStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConsultantDTO implements Serializable {

    private Integer accountId;
    private String userName;
    private String password;
    private String fullName;
    private String avatarUrl;
    private String phone;
    private String email;
    private String address;
    private AccountStatus status;
    private List<CertificateDTO> certificateList;

    public ConsultantDTO(Integer accountId, String userName, String password,
                         String fullName, String avatarUrl, String phone,
                         String email, String address, AccountStatus status) {
        this.accountId = accountId;
        this.userName = userName;
        this.password = password;
        this.fullName = fullName;
        this.avatarUrl = avatarUrl;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.status = status;
    }

    public ConsultantDTO(Integer accountId, String userName,
                         String fullName, String avatarUrl, AccountStatus status) {
        this.accountId = accountId;
        this.userName = userName;
        this.fullName = fullName;
        this.avatarUrl = avatarUrl;
        this.status = status;
    }

    public ConsultantDTO(Integer accountId, String fullName, String avatarUrl,
                         String phone, String email) {
        this.accountId = accountId;
        this.fullName = fullName;
        this.avatarUrl = avatarUrl;
        this.phone = phone;
        this.email = email;
    }
}
