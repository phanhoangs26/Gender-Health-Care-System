package com.gender_healthcare_system.entities.todo;

import java.io.Serializable;
import java.util.List;

import org.hibernate.annotations.Nationalized;

import com.gender_healthcare_system.entities.enu.TestingServiceStatus;

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

@Entity
@Table(name = "TestingService")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestingService implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "service_id")
    private int serviceId;


    //Relationship with TestingServiceType
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_type_id", nullable = false)
    private TestingServiceType testingServiceType;

    @Nationalized
    @Column(name = "service_name", nullable = false, length = 100)
    private String serviceName;

    @Nationalized
    @Column(name = "description")
    private String description;

    @Column(name = "overall_flag_logic", length = 255)
    private String overallFlagLogic;

    @Column(name = "price_amount", nullable = false)
    private long priceAmount;

    @Nationalized
    @Column(name = "price_description")
    private String priceDescription;

    @Column(name = "status", nullable = false, length = 15)
    @Enumerated(EnumType.STRING)
    private TestingServiceStatus status;

    // Relationship with TestingServiceBooking
    @OneToMany(mappedBy = "testingService", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TestingServiceBooking> testingServiceHistories;

    public TestingService(int serviceId, String serviceName,
                          String description, TestingServiceStatus status) {
        this.serviceId = serviceId;
        this.serviceName = serviceName;
        this.description = description;
        this.status = status;
    }

}
