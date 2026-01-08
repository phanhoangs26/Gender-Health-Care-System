package com.gender_healthcare_system.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gender_healthcare_system.dtos.todo.TestingServiceResultDTO;
import com.gender_healthcare_system.entities.todo.TestingServiceResult;
import com.gender_healthcare_system.payloads.todo.TestingServiceResultPayload;

public interface TestingServiceResultRepo extends JpaRepository<TestingServiceResult, Integer> {

    @Query("SELECT new com.gender_healthcare_system.dtos.todo.TestingServiceResultDTO" +
            "(tst.serviceResultId, tst.title, tst.description, tst.type, tst.measureUnit, tst.minValue, tst.maxValue, tst.positiveThreshold) " +
            "FROM TestingServiceResult tst " +
            "WHERE tst.testingService.serviceId = :id")
    List<TestingServiceResultDTO> getAllServiceResultsByServiceId(int id);

    @Modifying
    @Query("UPDATE TestingServiceResult tsr " +
            "SET tsr.title = :#{#payload.title}, " +
            "tsr.description = :#{#payload.description}, " +
            "tsr.type = :#{#payload.type}, " +
            "tsr.measureUnit = :#{#payload.measureUnit}, " +
            "tsr.minValue = :#{#payload.minValue}, " +
            "tsr.maxValue = :#{#payload.maxValue}, " +
            "tsr.positiveThreshold = :#{#payload.positiveThreshold} " +
            "WHERE tsr.serviceResultId = :id")
    void updateTestingServiceResult(int id,
                                  @Param("payload") TestingServiceResultPayload payload);

    @Modifying
    @Query("DELETE FROM TestingServiceResult tsr " +
            "WHERE tsr.serviceResultId = :id")
    void deleteTestingServiceResultById(int id);

    @Modifying
    @Query("DELETE FROM TestingServiceResult tsr " +
            "WHERE tsr.testingService.serviceId = :id")
    void deleteTestingServiceResultByServiceId(int id);

}
