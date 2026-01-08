package com.gender_healthcare_system.entities.todo;

import com.gender_healthcare_system.entities.enu.ResultType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.Nationalized;

import java.io.Serializable;
import java.math.BigDecimal;

@Entity
@Table(name = "TestingServiceResult")
@Data
@ToString(exclude = "testingService")
@NoArgsConstructor
@AllArgsConstructor
public class TestingServiceResult implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "service_result_id")
    private int serviceResultId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private TestingService testingService;

    @Nationalized
    @Column(name = "title", nullable = false, length = 50)
    private String title;

    @Nationalized
    @Column(name = "description", length = 500, nullable = false)
    private String description;

    @Column(name = "type", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private ResultType type;

    @Nationalized
    @Column(name = "measure_unit", length = 30)
    private String measureUnit;

    @Column(name = "min_value", precision = 5, scale = 2)
    private BigDecimal minValue;

    @Column(name = "max_value", precision = 5, scale = 2)
    private BigDecimal maxValue;

    @Column(name = "positive_threshold", precision = 5, scale = 2)
    private BigDecimal positiveThreshold;

}
