package com.gender_healthcare_system.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.gender_healthcare_system.dtos.todo.MenstrualCycleDTO;
import com.gender_healthcare_system.entities.todo.MenstrualCycle;
import com.gender_healthcare_system.payloads.todo.MenstrualCycleUpdatePayload;

import jakarta.transaction.Transactional;

@Repository
public interface MenstrualCycleRepo extends JpaRepository<MenstrualCycle, Integer> {

    // SELECT DTO by customerId
    @Query("SELECT new com.gender_healthcare_system.dtos.todo.MenstrualCycleDTO(" +
            "m.cycleId, m.startDate, m.cycleLength, m.isTrackingEnabled, " +
            "m.createdAt, m.updatedAt, m.endDate, m.severity, m.status, m.note, " +
            "m.flowVolume, m.ovulationDate, m.weight) " +
            "FROM MenstrualCycle m " +
            "WHERE m.customer.accountId = :customerId")
    List<MenstrualCycleDTO> getCyclesByCustomerId(@Param("customerId") int customerId);

    // UPDATE cycle using payload
    @Transactional
    @Modifying
    @Query("UPDATE MenstrualCycle m SET " +
            "m.startDate = :#{#payload.startDate}, " +
            "m.cycleLength = :#{#payload.cycleLength}, " +
            "m.isTrackingEnabled = :#{#payload.isTrackingEnabled}, " +
            "m.note = :#{#payload.note}, " +
            "m.updatedAt = CURRENT_TIMESTAMP, " +
            "m.endDate = :#{#payload.endDate}, " +
            "m.flowVolume = :#{#payload.flowVolume}, " +
            "m.ovulationDate = :#{#payload.ovulationDate}, " +
            "m.weight = :#{#payload.weight} " +
            "WHERE m.cycleId = :cycleId")
    void updateCycleById(@Param("cycleId") Integer cycleId,
                         @Param("payload") MenstrualCycleUpdatePayload payload);

    // Get active tracking cycles by customer ID
    @Query("SELECT new com.gender_healthcare_system.dtos.todo.MenstrualCycleDTO(" +
            "m.cycleId, m.startDate, m.cycleLength, m.isTrackingEnabled, " +
            "m.createdAt, m.updatedAt, m.endDate, m.severity, m.status, m.note, " +
            "m.flowVolume, m.ovulationDate, m.weight) " +
            "FROM MenstrualCycle m " +
            "WHERE m.customer.accountId = :customerId AND m.isTrackingEnabled = true")
    List<MenstrualCycleDTO> getActiveTrackingCyclesByCustomerId(@Param("customerId") int customerId);

    // Get cycles by flow volume range
    @Query("SELECT new com.gender_healthcare_system.dtos.todo.MenstrualCycleDTO(" +
            "m.cycleId, m.startDate, m.cycleLength, m.isTrackingEnabled, " +
            "m.createdAt, m.updatedAt, m.endDate, m.severity, m.status, m.note, " +
            "m.flowVolume, m.ovulationDate, m.weight) " +
            "FROM MenstrualCycle m " +
            "WHERE m.customer.accountId = :customerId " +
            "AND m.flowVolume >= :minVolume AND m.flowVolume <= :maxVolume " +
            "AND m.flowVolume IS NOT NULL")
    List<MenstrualCycleDTO> getCyclesByFlowVolumeRange(@Param("customerId") int customerId,
                                                       @Param("minVolume") Integer minVolume,
                                                       @Param("maxVolume") Integer maxVolume);
}
