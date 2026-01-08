package com.gender_healthcare_system.repositories;

import com.gender_healthcare_system.dtos.todo.ConsultationTypeDTO;
import com.gender_healthcare_system.entities.enu.GenderType;
import com.gender_healthcare_system.entities.todo.ConsultationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ConsultationTypeRepo extends JpaRepository<ConsultationType, Integer> {

    @Query("SELECT new com.gender_healthcare_system.dtos.todo.ConsultationTypeDTO" +
            "(ct.typeId, ct.name, ct.description, ct.targetGender) " +
            "FROM ConsultationType ct " +
            "WHERE ct.targetGender IN (:gender, 'ANY')")
    List<ConsultationTypeDTO> getAllConsultationTypesForCustomerByGender(GenderType gender);
}
