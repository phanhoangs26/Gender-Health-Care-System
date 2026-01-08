package com.gender_healthcare_system.repositories;

import com.gender_healthcare_system.dtos.todo.TestingServiceDTO;
import com.gender_healthcare_system.entities.todo.TestingService;
import com.gender_healthcare_system.payloads.todo.TestingServiceUpdatePayload;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TestingServiceRepo extends JpaRepository<TestingService, Integer> {

    // Get a single TestingServiceDTO by ID
    @Query("SELECT new com.gender_healthcare_system.dtos.todo.TestingServiceDTO(" +
            "ts.serviceId, ts.serviceName, ts.description, ts.status, " +
            "ts.priceAmount, ts.priceDescription, " +
            "new com.gender_healthcare_system.dtos.todo.TestingServiceTypeDTO" +
            "(tst.serviceTypeId, tst.title, tst.content, tst.createdAt)) " +
            "FROM TestingService ts " +
            "LEFT JOIN ts.testingServiceType tst " +
            "WHERE ts.serviceId = :id")
    Optional<TestingServiceDTO> getTestingServiceById(@Param("id") int id);

    // Get all TestingServices (only entity)
    @Query("SELECT new com.gender_healthcare_system.dtos.todo.TestingServiceDTO" +
            "(ts.serviceId, ts.serviceName, ts.description, ts.status) " +
            "FROM TestingService ts " +
            "JOIN ts.testingServiceType tst")
    Page<TestingServiceDTO> getAllTestingServices(Pageable pageable);

    // Get all TestingServices for customer (bỏ targetGender)
    @Query("SELECT new com.gender_healthcare_system.dtos.todo.TestingServiceDTO" +
            "(ts.serviceId, ts.serviceName, ts.description, ts.priceAmount, ts.priceDescription) " +
            "FROM TestingService ts")
    Page<TestingServiceDTO> getAllTestingServicesForCustomerByGender(Pageable pageable);

    // Update TestingService (bỏ targetGender)
    @Modifying
    //@Transactional
    @Query("UPDATE TestingService ts SET ts.serviceName = :#{#payload.serviceName}, " +
            "ts.description = :#{#payload.description}, " +
            "ts.priceAmount = :#{#payload.priceAmount}, " +
            "ts.priceDescription = :#{#payload.priceDescription}, " +
            "ts.status = :#{#payload.status} " +
            "WHERE ts.serviceId = :id")
    void updateTestingService(@Param("id") int id,
                              @Param("payload") TestingServiceUpdatePayload payload);

    @Query("SELECT new com.gender_healthcare_system.dtos.todo.TestingServiceDTO(" +
            "ts.serviceId, ts.serviceName, ts.description," +
            " ts.priceAmount, ts.priceDescription, ts.status) " +
            "FROM TestingService ts " +
            "JOIN ts.testingServiceType tst " +
            "WHERE tst.serviceTypeId = :typeId")
    List<TestingServiceDTO> findByTestingServiceTypeId(@Param("typeId") int typeId);

}
