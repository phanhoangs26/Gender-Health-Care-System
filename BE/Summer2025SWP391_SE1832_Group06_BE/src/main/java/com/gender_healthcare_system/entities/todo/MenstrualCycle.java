package com.gender_healthcare_system.entities.todo;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.gender_healthcare_system.entities.enu.MenstrualSeverity;
import com.gender_healthcare_system.entities.enu.MenstrualStatus;
import com.gender_healthcare_system.entities.user.Account;

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
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "MenstrualCycle")
public class MenstrualCycle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cycle_id")
    private Integer cycleId;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "cycle_length", nullable = false)
    private Integer cycleLength = 28;

    @Column(name = "is_tracking_enabled", nullable = false)
    private Boolean isTrackingEnabled = true;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", length = 20)
    private MenstrualSeverity severity; // mức độ: LIGHT, MEDIUM, HEAVY

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 15)
    private MenstrualStatus status; // trạng thái: NORMAL, IRREGULAR, PAUSED

    @Column(name = "note")
    private String note;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Lượng máu kinh (ml)
    @Column(name = "flow_volume")
    private Integer flowVolume;

    // Ngày rụng trứng (có thể tính toán hoặc nhập tay)
    @Column(name = "ovulation_date")
    private LocalDate ovulationDate;

    // Cân nặng (nếu muốn theo dõi sức khỏe sinh sản)
    @Column(name = "weight")
    private Double weight;

    // mqh nhiều 1
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Account customer;
}
