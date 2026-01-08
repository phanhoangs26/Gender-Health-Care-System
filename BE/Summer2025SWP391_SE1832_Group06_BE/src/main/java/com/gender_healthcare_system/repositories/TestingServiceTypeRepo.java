package com.gender_healthcare_system.repositories;

import com.gender_healthcare_system.dtos.todo.TestingServiceTypeDTO;
import com.gender_healthcare_system.dtos.todo.TestingServiceTypeDetailsDTO;
import com.gender_healthcare_system.entities.enu.GenderType;
import com.gender_healthcare_system.entities.todo.TestingServiceType;
import com.gender_healthcare_system.payloads.todo.TestingServiceTypeUpdatePayload;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TestingServiceTypeRepo extends JpaRepository<TestingServiceType, Integer> {

    @Query("SELECT new com.gender_healthcare_system.entities.todo.TestingServiceType" +
            "(tst.serviceTypeId, tst.title, tst.content, tst.createdAt) " +
            "FROM TestingServiceType tst " +
            "WHERE tst.serviceTypeId = :id")
    Optional<TestingServiceType> findById(int id);

    @Query("SELECT new com.gender_healthcare_system.dtos.todo.TestingServiceTypeDetailsDTO" +
            "(new com.gender_healthcare_system.dtos.todo.TestingServiceTypeDTO" +
            "(tst.serviceTypeId, tst.title, tst.content, tst.createdAt)) " +
            "FROM TestingServiceType tst " +
            "WHERE tst.serviceTypeId = :id")
    Optional<TestingServiceTypeDetailsDTO> getTestingServiceDetailsById(int id);

    @Query("SELECT new com.gender_healthcare_system.dtos.todo.TestingServiceTypeDTO" +
            "(tst.serviceTypeId, tst.title, tst.content, tst.createdAt) " +
            "FROM TestingServiceType tst")
    Page<TestingServiceTypeDTO> getAllTestingServiceTypes(Pageable pageable);

    @Modifying
    @Query("UPDATE TestingServiceType tst " +
            "SET tst.title = :#{#payload.title}, " +
            "tst.content = :#{#payload.content} " +
            "WHERE tst.serviceTypeId = :id")
    void updateTestingServiceType(int id,
                                  @Param("payload")TestingServiceTypeUpdatePayload payload);

    @Modifying
    @Query("DELETE FROM TestingServiceType tst " +
            "WHERE tst.serviceTypeId = :id")
    void deleteTestingServiceTypeById(int id);

    @Query("SELECT new com.gender_healthcare_system.dtos.todo.TestingServiceTypeDTO(" +
            "tst.serviceTypeId, tst.title, tst.content, tst.createdAt) " +
            "FROM TestingServiceType tst " +
            "WHERE tst.targetGender = :gender OR tst.targetGender = 'ANY'")
    Page<TestingServiceTypeDTO> getAllTestingServiceTypesForCustomerByGender
            (@Param("gender") GenderType gender, Pageable pageable);
}
