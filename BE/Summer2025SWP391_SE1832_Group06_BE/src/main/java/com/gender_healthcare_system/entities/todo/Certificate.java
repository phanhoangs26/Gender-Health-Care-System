package com.gender_healthcare_system.entities.todo;

import com.gender_healthcare_system.entities.user.Account;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.Nationalized;

import java.io.Serializable;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Certificate")
public class Certificate implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "certificate_id")
    private int certificateId;

    @ManyToOne
    @JoinColumn(name = "consultant_id", nullable = false)
    private Account consultant;

    @Nationalized
    @Column(name = "certificate_name", nullable = false, length = 100)
    private String certificateName;

    @Column(name = "image_url", nullable = false, length = 255)
    private String imageUrl;

    @Nationalized
    @Column(name = "issued_by", nullable = false, length = 100)
    private String issuedBy;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Nationalized
    @Column(name = "description", length = 255)
    private String description;

}
