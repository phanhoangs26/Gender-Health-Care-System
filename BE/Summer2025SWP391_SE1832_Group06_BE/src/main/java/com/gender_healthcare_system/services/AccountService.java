package com.gender_healthcare_system.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.gender_healthcare_system.entities.enu.AccountStatus;
import com.gender_healthcare_system.entities.todo.Certificate;
import com.gender_healthcare_system.entities.user.Account;
import com.gender_healthcare_system.entities.user.AccountInfoDetails;
import com.gender_healthcare_system.entities.user.Role;
import com.gender_healthcare_system.exceptions.AppException;
import com.gender_healthcare_system.payloads.todo.CertificateRegisterPayload;
import com.gender_healthcare_system.payloads.user.ConsultantRegisterPayload;
import com.gender_healthcare_system.payloads.user.CustomerPayload;
import com.gender_healthcare_system.payloads.user.ManagerRegisterPayload;
import com.gender_healthcare_system.payloads.user.StaffRegisterPayload;
import com.gender_healthcare_system.repositories.AccountRepo;
import com.gender_healthcare_system.repositories.CertificateRepo;
import com.gender_healthcare_system.repositories.RoleRepo;
import com.gender_healthcare_system.utils.UtilFunctions;
import lombok.AllArgsConstructor;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@AllArgsConstructor
public class AccountService implements UserDetailsService {

    private final AccountRepo accountRepo;
    private final RoleRepo roleRepo;
    private final CertificateRepo certificateRepo;

    @Override
    public UserDetails loadUserByUsername(String username) {
        Optional<Account> accountInfo = accountRepo.findActiveAccountByUsername(username);

        return accountInfo
                .map(AccountInfoDetails::new)
                .orElseThrow(() -> new UsernameNotFoundException("Invalid Username or Password"));
    }

    @Transactional(rollbackFor = Exception.class)
    public void createCustomerAccount(CustomerPayload payload) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());

        Account account = new Account();

        account.setUsername(payload.getUsername());
        account.setPassword(payload.getPassword());
        account.setStatus(AccountStatus.ACTIVE);

        Role role = roleRepo.findByRoleId(5); // CUSTOMER role
        account.setRole(role);

        account.setFullName(payload.getFullName());
        account.setGender(payload.getGender());

        account.setDateOfBirth(payload.getDateOfBirth());
        account.setPhone(payload.getPhone());
        account.setEmail(payload.getEmail());
        account.setAddress(payload.getAddress());

        accountRepo.saveAndFlush(account);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateCustomerStatus(int customerId, AccountStatus status) {
        boolean customerExist = accountRepo.existsByAccountIdAndRole_RoleName(customerId, "CUSTOMER");

        if (!customerExist) {
            throw new AppException(404, "Customer not found");
        }

        boolean accountStatusIdentical = accountRepo
                .existsAccountByAccountIdAndStatus(customerId, status);

        if (!accountStatusIdentical) {
            accountRepo.updateAccountStatus(customerId, status);
        }
    }

    /*
     * @Transactional
     * public void deleteCustomerById(int customerId) {
     * boolean customerExist =
     * accountRepo.existsByAccountIdAndRole_RoleName(customerId, "CUSTOMER");
     * 
     * if(!customerExist) {
     * throw new AppException(404, "Customer not found");
     * }
     * 
     * accountRepo.deleteAccountById(customerId);
     * }
     */

    @Transactional(rollbackFor = Exception.class)
    public void createConsultantAccount(ConsultantRegisterPayload payload) {
        Account account = new Account();
        Certificate certificate;

        account.setUsername(payload.getUsername());
        account.setPassword(payload.getPassword());
        account.setStatus(AccountStatus.ACTIVE);

        Role role = roleRepo.findByRoleId(4); // CONSULTANT role
        account.setRole(role);

        account.setFullName(payload.getFullName());
        account.setAvatarUrl(payload.getAvatarUrl());
        account.setPhone(payload.getPhone());
        account.setEmail(payload.getEmail());
        account.setAddress(payload.getAddress());

        accountRepo.saveAndFlush(account);

        for (CertificateRegisterPayload item : payload.getCertificates()) {
            UtilFunctions.validateIssueDateAndExpiryDate(item.getIssueDate(), item.getExpiryDate());

            certificate = new Certificate();
            certificate.setConsultant(account);

            certificate.setCertificateName(item.getCertificateName());
            certificate.setIssuedBy(item.getIssuedBy());
            certificate.setIssueDate(item.getIssueDate());
            certificate.setImageUrl(item.getImageUrl());
            certificate.setExpiryDate(item.getExpiryDate());
            certificate.setDescription(item.getDescription());

            certificateRepo.saveAndFlush(certificate);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateConsultantStatus(int consultantId, AccountStatus status) {
        boolean consultantExist = accountRepo.existsByAccountIdAndRole_RoleName(consultantId, "CONSULTANT");

        if (!consultantExist) {
            throw new AppException(404, "Consultant not found");
        }

        boolean accountStatusIdentical = accountRepo
                .existsAccountByAccountIdAndStatus(consultantId, status);

        if (!accountStatusIdentical) {
            accountRepo.updateAccountStatus(consultantId, status);
        }
    }

    /*
     * @Transactional
     * public void deleteConsultantById(int consultantId) {
     * boolean consultantExist =
     * accountRepo.existsByAccountIdAndRole_RoleName(consultantId, "CONSULTANT");
     * 
     * if(!consultantExist) {
     * throw new AppException(404, "Consultant not found");
     * }
     * 
     * accountRepo.deleteAccountById(consultantId);
     * }
     */

    // createManagerAccount by Admin

    @Transactional(rollbackFor = Exception.class)
    public void createManagerAccount(ManagerRegisterPayload payload) {
        createStaffOrManagerAccount(payload, 2); // MANAGER role
    }

    /*
     * @Transactional
     * public void deleteManagerById(int managerId) {
     * boolean managerExist =
     * accountRepo.existsByAccountIdAndRole_RoleName(managerId, "MANAGER");
     * 
     * if(!managerExist) {
     * throw new AppException(404, "Manager not found");
     * }
     * 
     * accountRepo.deleteAccountById(managerId);
     * }
     */

    // createStaffAccount by Manager

    @Transactional(rollbackFor = Exception.class)
    public void createStaffAccount(StaffRegisterPayload payload) {
        createStaffOrManagerAccount(payload, 3); // STAFF role
    }

    /*
     * @Transactional
     * public void deleteStaffById(int staffId) {
     * boolean staffExist = accountRepo.existsByAccountIdAndRole_RoleName(staffId,
     * "STAFF");
     * 
     * if(!staffExist) {
     * throw new AppException(404, "Staff not found");
     * }
     * 
     * accountRepo.deleteAccountById(staffId);
     * }
     */

    // Common method for creating Staff or Manager accounts
    private void createStaffOrManagerAccount(Object payload, int roleId) {
        Account account = new Account();
        Role role = roleRepo.findByRoleId(roleId);

        account.setUsername(getUsernameFromPayload(payload));
        account.setPassword(getPasswordFromPayload(payload));
        account.setStatus(AccountStatus.ACTIVE);
        account.setRole(role);
        account.setFullName(getFullNameFromPayload(payload));
        account.setPhone(getPhoneFromPayload(payload));
        account.setEmail(getEmailFromPayload(payload));
        account.setAddress(getAddressFromPayload(payload));

        accountRepo.saveAndFlush(account);
    }

    // Helper methods to extract data from different payload types
    private String getUsernameFromPayload(Object payload) {
        if (payload instanceof ManagerRegisterPayload) {
            return ((ManagerRegisterPayload) payload).getUsername();
        } else if (payload instanceof StaffRegisterPayload) {
            return ((StaffRegisterPayload) payload).getUsername();
        }
        throw new AppException(400, "Invalid payload type");
    }

    private String getPasswordFromPayload(Object payload) {
        if (payload instanceof ManagerRegisterPayload) {
            return ((ManagerRegisterPayload) payload).getPassword();
        } else if (payload instanceof StaffRegisterPayload) {
            return ((StaffRegisterPayload) payload).getPassword();
        }
        throw new AppException(400, "Invalid payload type");
    }

    private String getFullNameFromPayload(Object payload) {
        if (payload instanceof ManagerRegisterPayload) {
            return ((ManagerRegisterPayload) payload).getFullName();
        } else if (payload instanceof StaffRegisterPayload) {
            return ((StaffRegisterPayload) payload).getFullName();
        }
        throw new AppException(400, "Invalid payload type");
    }

    private String getPhoneFromPayload(Object payload) {
        if (payload instanceof ManagerRegisterPayload) {
            return ((ManagerRegisterPayload) payload).getPhone();
        } else if (payload instanceof StaffRegisterPayload) {
            return ((StaffRegisterPayload) payload).getPhone();
        }
        throw new AppException(400, "Invalid payload type");
    }

    private String getEmailFromPayload(Object payload) {
        if (payload instanceof ManagerRegisterPayload) {
            return ((ManagerRegisterPayload) payload).getEmail();
        } else if (payload instanceof StaffRegisterPayload) {
            return ((StaffRegisterPayload) payload).getEmail();
        }
        throw new AppException(400, "Invalid payload type");
    }

    private String getAddressFromPayload(Object payload) {
        if (payload instanceof ManagerRegisterPayload) {
            return ((ManagerRegisterPayload) payload).getAddress();
        } else if (payload instanceof StaffRegisterPayload) {
            return ((StaffRegisterPayload) payload).getAddress();
        }
        throw new AppException(400, "Invalid payload type");
    }
}
