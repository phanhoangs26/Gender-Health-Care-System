package com.gender_healthcare_system.entities.todo;

import com.gender_healthcare_system.entities.enu.PaymentMethod;
import com.gender_healthcare_system.entities.enu.PaymentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "TestingServicePayment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestingServicePayment implements Serializable {

    @Id
    @Column(name = "service_payment_id")
    private int servicePaymentId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "service_payment_id")
    private TestingServiceBooking testingServiceBooking;

    @Column(name = "transaction_id", nullable = false, unique = true, length = 30)
    private String transactionId;


    @Column(name = "amount", nullable = false)
    private long amount;

    @Column(name = "method", nullable = false, length = 15)
    @Enumerated(EnumType.STRING)
    private PaymentMethod method;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Nationalized
    @Column(name = "description", length = 100)
    private String description;

    @Column(name = "status", nullable = false, length = 15)
    @Enumerated(EnumType.STRING)
    private PaymentStatus status;


    //Many-to-One relationship with Staff
    /*@ManyToOne
    @JoinColumn(name = "staff_id", nullable = false)
    private Staff staff;
*/

}
