package com.gender_healthcare_system.repositories;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gender_healthcare_system.dtos.login.LoginResponse;
import com.gender_healthcare_system.dtos.user.ConsultantDTO;
import com.gender_healthcare_system.dtos.user.CustomerDTO;
import com.gender_healthcare_system.dtos.user.ManagerDTO;
import com.gender_healthcare_system.dtos.user.StaffDTO;
import com.gender_healthcare_system.entities.enu.AccountStatus;
import com.gender_healthcare_system.entities.enu.Gender;
import com.gender_healthcare_system.entities.user.Account;
import com.gender_healthcare_system.payloads.user.ConsultantUpdatePayload;
import com.gender_healthcare_system.payloads.user.CustomerUpdatePayload;
import com.gender_healthcare_system.payloads.user.ManagerUpdatePayload;
import com.gender_healthcare_system.payloads.user.StaffUpdatePayload;


public interface AccountRepo extends JpaRepository<Account, Integer> {

    @Query("SELECT new com.gender_healthcare_system.entities.user.Account(" +
            "a.accountId, a.username, a.password, r) FROM Account AS a " +
             "JOIN a.role AS r " +
            "WHERE a.username = :username " +
            "AND a.status = " +
            "com.gender_healthcare_system.entities.enu.AccountStatus.ACTIVE")
    Optional<Account> findActiveAccountByUsername(String username);

    @Query("SELECT new com.gender_healthcare_system.entities.user.Account(" +
            "a.accountId, r, a.username, a.password, a.status, a.fullName, " +
            "a.email, a.phone, a.address, a.dateOfBirth, a.gender, a.avatarUrl ) " +
            "FROM Account AS a " +
            "JOIN a.role AS r " +
            "WHERE a.accountId = :accountID " +
            "AND a.status = :status " +
            "AND r.roleName IN ('Consultant', 'Customer')")
    Optional<Account> getActiveConsultantOrCustomerAccountById
            (int accountID, AccountStatus status);

    // Find accounts by role
    @Query("SELECT a FROM Account a WHERE a.role.roleName = :roleName")
    List<Account> findAccountsByRole(String roleName);

    @Query("SELECT a FROM Account a WHERE a.role.roleName = :roleName")
    Page<Account> findAccountsByRole(String roleName, Pageable pageable);

    // Manager specific queries
    @Query("SELECT new com.gender_healthcare_system.dtos.login.LoginResponse(" +
            "a.accountId, a.fullName, a.email) FROM Account a " +
            "WHERE a.accountId = :id AND a.role.roleName = 'MANAGER'")
    LoginResponse getManagerLoginDetails(int id);

    @Query("SELECT new com.gender_healthcare_system.dtos.user.ManagerDTO" +
            "(a.accountId, a.username, a.password, " +
            "a.fullName, a.phone, a.email, a.address, a.status) " +
            "FROM Account a " +
            "WHERE a.accountId = :id AND a.role.roleName = 'MANAGER'")
    Optional<ManagerDTO> getManagerDetailsById(int id);

    @Query("SELECT new com.gender_healthcare_system.dtos.user.ManagerDTO" +
            "(a.accountId, a.username, a.password, " +
            "a.fullName, a.phone, a.email, a.address, a.status) " +
            "FROM Account a " +
            "WHERE a.role.roleName = 'MANAGER'")
    Page<ManagerDTO> getAllManagers(Pageable pageable);

    // Staff specific queries
    @Query("SELECT new com.gender_healthcare_system.dtos.login.LoginResponse(" +
            "a.accountId, a.fullName, a.email) FROM Account a " +
            "WHERE a.accountId = :id AND a.role.roleName = 'STAFF'")
    LoginResponse getStaffLoginDetails(int id);

    @Query("SELECT new com.gender_healthcare_system.dtos.user.StaffDTO" +
            "(a.accountId, a.username, a.password, " +
            "a.fullName, a.phone, a.email, a.address, a.status) " +
            "FROM Account a " +
            "WHERE a.accountId = :id AND a.role.roleName = 'STAFF'")
    Optional<StaffDTO> getStaffDetailsById(int id);

    @Query("SELECT new com.gender_healthcare_system.dtos.user.StaffDTO" +
            "(a.accountId, a.username, a.password, " +
            "a.fullName, a.phone, a.email, a.address, a.status) " +
            "FROM Account a " +
            "WHERE a.role.roleName = 'STAFF'")
    Page<StaffDTO> getAllStaff(Pageable pageable);

    // Consultant specific queries
    @Query("SELECT new com.gender_healthcare_system.dtos.login.LoginResponse(" +
            "a.accountId, a.fullName, a.email) FROM Account a " +
            "WHERE a.accountId = :id AND a.role.roleName = 'CONSULTANT'")
    LoginResponse getConsultantLoginDetails(int id);

    @Query("SELECT new com.gender_healthcare_system.dtos.user.ConsultantDTO" +
            "(a.accountId, a.username, a.password, " +
            "a.fullName, a.avatarUrl, a.phone, a.email, a.address, a.status) " +
            "FROM Account a " +
            "WHERE a.accountId = :id AND a.role.roleName = 'CONSULTANT'")
    Optional<ConsultantDTO> getConsultantDetailsById(int id);

    @Query("SELECT new com.gender_healthcare_system.dtos.user.ConsultantDTO" +
            "(a.accountId, a.username, a.password, " +
            "a.fullName, a.avatarUrl, a.phone, a.email, a.address, a.status) " +
            "FROM Account a " +
            "WHERE a.role.roleName = 'CONSULTANT'")
    Page<ConsultantDTO> getAllConsultants(Pageable pageable);

    @Query("SELECT new com.gender_healthcare_system.dtos.user.ConsultantDTO" +
            "(a.accountId, a.username, a.password, " +
            "a.fullName, a.avatarUrl, a.phone, a.email, a.address, a.status) " +
            "FROM Account a " +
            "WHERE a.role.roleName = 'CONSULTANT' AND a.status = :status")
    List<ConsultantDTO> getAllConsultantsForCustomer(AccountStatus status);

    // Customer specific queries
    @Query("SELECT new com.gender_healthcare_system.dtos.login.LoginResponse(" +
            "a.accountId, a.fullName, a.gender, a.email) FROM Account a " +
            "WHERE a.accountId = :id AND a.role.roleName = 'CUSTOMER'")
    LoginResponse getCustomerLoginDetails(int id);

    @Query("SELECT new com.gender_healthcare_system.dtos.user.CustomerDTO(" +
            "a.accountId, a.username, a.fullName, a.dateOfBirth, a.gender, a.phone, a.email, a.address, a.status) " +
            "FROM Account a " +
            "WHERE a.accountId = :id AND a.role.roleName = 'CUSTOMER'")
    Optional<CustomerDTO> getCustomerDetailsById(int id);

    @Query("SELECT new com.gender_healthcare_system.dtos.user.CustomerDTO(" +
            "a.accountId, a.username, a.fullName, a.dateOfBirth, a.gender, a.phone, a.email, a.address, a.status) " +
            "FROM Account a " +
            "WHERE a.role.roleName = 'CUSTOMER'")
    Page<CustomerDTO> getAllCustomers(Pageable pageable);

    // Update methods
    @Modifying
    @Query("UPDATE Account a " +
            "SET a.fullName = :#{#payload.fullName}, " +
            "a.phone = :#{#payload.phone}, " +
            "a.email = :#{#payload.email}, " +
            "a.address = :#{#payload.address} " +
            "WHERE a.accountId = :id AND a.role.roleName = 'MANAGER'")
    void updateManagerById(int id, @Param("payload") ManagerUpdatePayload payload);

    @Modifying
    @Query("UPDATE Account a " +
            "SET a.fullName = :#{#payload.fullName}, " +
            "a.phone = :#{#payload.phone}, " +
            "a.email = :#{#payload.email}, " +
            "a.address = :#{#payload.address} " +
            "WHERE a.accountId = :id AND a.role.roleName = 'STAFF'")
    void updateStaffById(int id, @Param("payload") StaffUpdatePayload payload);

    @Modifying
    @Query("UPDATE Account a " +
            "SET a.fullName = :#{#payload.fullName}, " +
            "a.avatarUrl = :#{#payload.avatarUrl}, " +
            "a.phone = :#{#payload.phone}, " +
            "a.email = :#{#payload.email}, " +
            "a.address = :#{#payload.address} " +
            "WHERE a.accountId = :id AND a.role.roleName = 'CONSULTANT'")
    void updateConsultantById(int id, @Param("payload") ConsultantUpdatePayload payload);

    @Modifying
    @Query("UPDATE Account a " +
            "SET a.fullName = :#{#payload.fullName}, " +
            "a.dateOfBirth = :#{#payload.dateOfBirth}, " +
            "a.gender = :#{#payload.gender}, " +
            "a.email = :#{#payload.email}, " +
            "a.phone = :#{#payload.phone}, " +
            "a.address = :#{#payload.address} " +
            "WHERE a.accountId = :id AND a.role.roleName = 'CUSTOMER'")
    void updateCustomerById(int id, @Param("payload") CustomerUpdatePayload payload);

    //update password of an account
    @Modifying
    //@Transactional
    @Query("UPDATE Account a SET a.password = :password " +
            "WHERE a.accountId = :accountId")
    void updateAccountPassword(@Param("accountId") int accountId,
                                  @Param("password") String password);

    //update password of an account
    @Modifying
    //@Transactional
    @Query("UPDATE Account a SET a.status = :status " +
            "WHERE a.accountId = :accountId")
    void updateAccountStatus(@Param("accountId") int accountId,
                               @Param("status") AccountStatus status);

    //update password of an account
    @Modifying
    //@Transactional
    @Query("DELETE FROM Account a " +
            "WHERE a.accountId = :accountId")
    void deleteAccountById(@Param("accountId") int accountId);


    boolean existsAccountByAccountIdAndStatus(int accountId, AccountStatus status);

    boolean existsByAccountIdAndRole_RoleName(int accountId, String roleName);

    boolean existsByAccountIdAndRole_RoleNameAndStatus(int accountId, String roleName, AccountStatus status);

    // Get customer gender by booking ID
    @Query("SELECT a.gender FROM Account a " +
            "JOIN TestingServiceBooking b ON b.customer.accountId = a.accountId " +
            "WHERE b.serviceBookingId = :bookingId")
    Gender getCustomerGenderByBookingId(@Param("bookingId") int bookingId);

    // Find staff ordered by least tests for a specific date
    @Query("SELECT COUNT(b), a.accountId FROM Account a " +
            "LEFT JOIN TestingServiceBooking b ON b.staff.accountId = a.accountId " +
            "AND CAST(b.expectedStartTime AS DATE) = :date " +
            "WHERE a.role.roleName = 'STAFF' " +
            "AND a.status = :status " +
            "GROUP BY a.accountId " +
            "ORDER BY COUNT(b) ASC")
    List<Object[]> findStaffOrderedByLeastTests(@Param("date") LocalDate date, @Param("status") AccountStatus status);

    //report
    @Query("SELECT COUNT(a) FROM Account a")
    long countTotalAccounts();

}
