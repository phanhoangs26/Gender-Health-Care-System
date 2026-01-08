package com.gender_healthcare_system.repositories;

import com.gender_healthcare_system.entities.todo.ConsultationPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ConsultationPaymentRepo extends JpaRepository<ConsultationPayment, Integer> {

    //@Modifying
    /*@Query("UPDATE ConsultationPayment csp " +
            "SET csp.content = :newContent " +
            "WHERE csp.serviceFormId = :id")
    void updateConsultationPaymentById
            (int id, @Param("payload") ConsultationPaymentUpdatePayload payload);*/

    @Modifying
    @Query("DELETE FROM ConsultationPayment csp WHERE csp.consultationPaymentId = :id")
    void deleteByConsultationPaymentId(@Param("id") int id);
}
