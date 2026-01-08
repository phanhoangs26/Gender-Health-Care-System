package com.gender_healthcare_system.repositories;

import com.gender_healthcare_system.entities.enu.PaymentStatus;
import com.gender_healthcare_system.entities.todo.TestingServicePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestingServicePaymentRepo extends JpaRepository<TestingServicePayment, Integer> {

    List<TestingServicePayment> findByStatus(PaymentStatus status);

    @Modifying
    @Query("DELETE FROM TestingServicePayment tsp " +
            "WHERE tsp.servicePaymentId = :id")
    void deleteServicePaymentById(int id);
}
