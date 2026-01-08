package com.gender_healthcare_system.entities.todo;

import com.gender_healthcare_system.entities.user.Account;
import com.gender_healthcare_system.entities.enu.Rating;
import com.gender_healthcare_system.entities.enu.TestingServiceBookingStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.Nationalized;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "TestingServiceBooking")
@ToString(exclude = { "testingService", "customer", "staff" })
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestingServiceBooking implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "service_booking_id")
    private int serviceBookingId;

    // One-to-One relationship with TestingServicePayment
    @OneToOne(mappedBy = "testingServiceBooking")
    private TestingServicePayment testingServicePayment;

    // Relationship with TestingService
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private TestingService testingService;

    // Relationship with Customer (Account)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Account customer;

    // Relationship with Staff (Account)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    private Account staff;

    @Nationalized
    @Column(columnDefinition = "nvarchar(MAX)", name = "result")
    private String result;

    @Enumerated(EnumType.STRING)
    @Column(name = "rating", length = 15)
    private Rating rating;

    @Nationalized
    @Column(name = "comment", length = 255)
    private String comment;

    @Column(name = "created_at", nullable = false, unique = true)
    private LocalDateTime createdAt;

    @Column(name = "expected_start_time", nullable = false)
    private LocalDateTime expectedStartTime;

    @Column(name = "real_start_time")
    private LocalDateTime realStartTime;

    @Column(name = "expected_end_time", nullable = false)
    private LocalDateTime expectedEndTime;

    @Column(name = "real_end_time")
    private LocalDateTime realEndTime;

    @Column(name = "status", nullable = false, length = 15)
    @Enumerated(EnumType.STRING)
    private TestingServiceBookingStatus status;

    public TestingServiceBooking(TestingServiceBookingStatus status) {
        this.status = status;
    }

    public TestingServiceBooking(int serviceBookingId, String result, Rating rating,
                                 String comment, LocalDateTime createdAt,
                                 LocalDateTime expectedStartTime,
                                 LocalDateTime realStartTime,
                                 LocalDateTime expectedEndTime,
                                 LocalDateTime realEndTime,
                                 TestingServiceBookingStatus status) {

        this.serviceBookingId = serviceBookingId;
        this.result = result;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
        this.expectedStartTime = expectedStartTime;
        this.realStartTime = realStartTime;
        this.expectedEndTime = expectedEndTime;
        this.realEndTime = realEndTime;
        this.status = status;
    }
}
