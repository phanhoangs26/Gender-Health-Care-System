package com.gender_healthcare_system.entities.todo;

import java.time.LocalDateTime;

import org.hibernate.annotations.Nationalized;

import com.gender_healthcare_system.entities.user.Account;
import com.gender_healthcare_system.entities.enu.SymptomSeverity;
import com.gender_healthcare_system.entities.enu.SymptomStatus;

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
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "Symptom")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Symptom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "symptom_id")
    private Integer symptomId;

    @Nationalized
    @Column(name = "name", nullable = false, length = 100)
    private String name; // đau đầu, buồn nôn, chóng mặt, v.v.

    @Nationalized
    @Column(name = "description", length = 255)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", length = 20)
    private SymptomSeverity severity; // mức độ: LIGHT, MEDIUM, SEVERE

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 15)
    private SymptomStatus status; // trạng thái: ACTIVE, RESOLVED, IGNORED

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    @Column(name = "note")
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Account customer;
}
