package com.gender_healthcare_system.repositories;

import com.gender_healthcare_system.dtos.todo.SymptomDTO;
import com.gender_healthcare_system.entities.todo.Symptom;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SymptomRepo extends JpaRepository<Symptom, Integer> {

    @Query("SELECT new com.gender_healthcare_system.dtos.todo.SymptomDTO(" +
            "s.symptomId, s.name, s.description, s.recordedAt, s.customer) " +
            "FROM Symptom s WHERE s.customer.accountId = :customerId")
    List<SymptomDTO> getSymptomsByCustomerId(@Param("customerId") int customerId);
}
