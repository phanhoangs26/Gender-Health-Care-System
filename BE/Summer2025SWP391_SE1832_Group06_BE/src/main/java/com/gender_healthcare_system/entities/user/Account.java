package com.gender_healthcare_system.entities.user;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;

import org.hibernate.annotations.Nationalized;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.gender_healthcare_system.entities.enu.AccountStatus;
import com.gender_healthcare_system.entities.enu.Gender;
import com.gender_healthcare_system.entities.todo.Blog;
import com.gender_healthcare_system.entities.todo.Certificate;
import com.gender_healthcare_system.entities.todo.Comment;
import com.gender_healthcare_system.entities.todo.Consultation;
import com.gender_healthcare_system.entities.todo.TestingServiceBooking;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "Account")
@Data
@ToString(exclude = "comments")
@NoArgsConstructor
@AllArgsConstructor
public class Account implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_id")
    private int accountId;

    // ManyToOne relationship with Role
    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "password", nullable = false, length = 50)
    private String password;

    // Enum
    @Column(name = "status", nullable = false, length = 15)
    private AccountStatus status;

    // Common fields from all entities
    @Column(name = "full_name", nullable = false, length = 70)
    @Nationalized
    private String fullName;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "phone", nullable = false, unique = true, length = 15)
    private String phone;

    @Column(name = "address", nullable = false, length = 255)
    @Nationalized
    private String address;

    // Customer specific fields
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "menstrual_medications", length = 255)
    private String menstrualMedications; // Thông tin thuốc đã uống khi đến tháng

    @Column(name = "gender", length = 15)
    @Enumerated(EnumType.STRING)
    private Gender gender;

    // Consultant specific fields
    @Column(name = "avatar_url")
    private String avatarUrl;

    // Relationships
    // Manager relationships
    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "manager_id")
    @JsonManagedReference
    private List<Blog> blogs;

    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL)
    private List<Comment> comments;

    // Consultant relationships
    @OneToMany(mappedBy = "consultant", cascade = CascadeType.ALL)
    private List<Certificate> certificates;

    @OneToMany(mappedBy = "consultant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Consultation> consultantConsultations;

    // Customer relationships
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Consultation> customerConsultations;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TestingServiceBooking> customerTestingServiceBookings;

    // Staff relationships
    @OneToMany(mappedBy = "staff", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TestingServiceBooking> staffTestingServiceBookings;

    public Account(int accountId, String username, String password, Role role) {
        this.accountId = accountId;
        this.username = username;
        this.password = password;
        this.role = role;
    }

    // Constructor for Manager
    public Account(int accountId, String username, String password, Role role,
            String fullName, String email, String phone, String address) {
        this.accountId = accountId;
        this.username = username;
        this.password = password;
        this.role = role;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.address = address;
    }

    // Constructor for Customer
    public Account(int accountId, String username, String password, Role role,
            String fullName, LocalDate dateOfBirth, Gender gender,
            String email, String phone, String address) {
        this.accountId = accountId;
        this.username = username;
        this.password = password;
        this.role = role;
        this.fullName = fullName;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.email = email;
        this.phone = phone;
        this.address = address;
    }

    // Constructor for Consultant
    public Account(int accountId, String username, String password, Role role,
            String fullName, String avatarUrl, String phone, String email, String address) {
        this.accountId = accountId;
        this.username = username;
        this.password = password;
        this.role = role;
        this.fullName = fullName;
        this.avatarUrl = avatarUrl;
        this.phone = phone;
        this.email = email;
        this.address = address;
    }

    public Account(int accountId, Role role, String username, String password,
                   AccountStatus status, String fullName, String email,
                   String phone, String address, LocalDate dateOfBirth,
                   Gender gender, String avatarUrl) {
        this.accountId = accountId;
        this.role = role;
        this.username = username;
        this.password = password;
        this.status = status;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.avatarUrl = avatarUrl;
    }
}
