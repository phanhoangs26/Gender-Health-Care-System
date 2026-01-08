package com.gender_healthcare_system.entities.todo;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

import com.gender_healthcare_system.entities.enu.GenderType;
import org.hibernate.annotations.Nationalized;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "TestingServiceType")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestingServiceType implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "service_type_id")
    private int serviceTypeId;

    @Nationalized
    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @Nationalized
    @Column(name = "content", length = 255)
    private String content;

    @Column(name = "target_gender", nullable = false, length = 15)
    @Enumerated(EnumType.STRING)
    private GenderType targetGender;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    //Relationship with TestingService.
    @OneToMany(mappedBy = "testingServiceType", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TestingService> testingServices;

    public TestingServiceType(int serviceTypeId, String title,
                              String content, LocalDateTime createdAt) {
        this.serviceTypeId = serviceTypeId;
        this.title = title;
        this.content = content;
        this.createdAt = createdAt;
    }
}
