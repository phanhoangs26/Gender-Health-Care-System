package com.gender_healthcare_system.services;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gender_healthcare_system.dtos.todo.MenstrualCycleDTO;
import com.gender_healthcare_system.entities.todo.MenstrualCycle;
import com.gender_healthcare_system.entities.user.Account;
import com.gender_healthcare_system.exceptions.AppException;
import com.gender_healthcare_system.payloads.todo.MenstrualCreatePayload;
import com.gender_healthcare_system.payloads.todo.MenstrualCycleUpdatePayload;
import com.gender_healthcare_system.repositories.AccountRepo;
import com.gender_healthcare_system.repositories.MenstrualCycleRepo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MenstrualCycleService {

    private final MenstrualCycleRepo menstrualCycleRepo;
    private final AccountRepo accountRepo;

    public MenstrualCycleDTO createCycle(MenstrualCreatePayload payload, int customerId) {
        Account customer = accountRepo.findById(customerId)
                .orElseThrow(() -> new AppException(404, "Customer not found"));

        MenstrualCycle cycle = new MenstrualCycle();
        cycle.setStartDate(payload.getStartDate());
        cycle.setEndDate(payload.getEndDate());
        cycle.setCycleLength(payload.getCycleLength());
        cycle.setIsTrackingEnabled(payload.getIsTrackingEnabled());
        cycle.setCreatedAt(LocalDateTime.now());
        cycle.setUpdatedAt(LocalDateTime.now());
        cycle.setCustomer(customer);
        cycle.setFlowVolume(payload.getFlowVolume());
        cycle.setOvulationDate(payload.getOvulationDate());
        cycle.setWeight(payload.getWeight());

        MenstrualCycle saved = menstrualCycleRepo.save(cycle);

        return new MenstrualCycleDTO(
                saved.getCycleId(),
                saved.getStartDate(),
                saved.getCycleLength(),
                saved.getIsTrackingEnabled(),
                saved.getCreatedAt(),
                saved.getUpdatedAt(),
                saved.getEndDate(),
                saved.getSeverity(),
                saved.getStatus(),
                saved.getNote(),
                saved.getFlowVolume(),
                saved.getOvulationDate(),
                saved.getWeight()
        );
    }

    public List<MenstrualCycleDTO> getCyclesByCustomerId(int customerId) {
        List<MenstrualCycleDTO> cycles = menstrualCycleRepo.getCyclesByCustomerId(customerId);
        if (cycles.isEmpty()) {
            throw new AppException(404, "No menstrual cycles found for this customer");
        }
        return cycles;
    }

    @Transactional
    public void updateCycleById(Integer cycleId, MenstrualCycleUpdatePayload payload) {
        boolean exists = menstrualCycleRepo.existsById(cycleId);
        if (!exists) {
            throw new AppException(404, "Menstrual cycle not found");
        }
        // Fetch the entity, update all fields including endDate, and save
        MenstrualCycle cycle = menstrualCycleRepo.findById(cycleId)
                .orElseThrow(() -> new AppException(404, "Menstrual cycle not found"));
        cycle.setStartDate(payload.getStartDate());
        cycle.setEndDate(payload.getEndDate());
        cycle.setCycleLength(payload.getCycleLength());
        cycle.setIsTrackingEnabled(payload.getIsTrackingEnabled());
        cycle.setSeverity(payload.getSeverity());
        cycle.setStatus(payload.getStatus());
        cycle.setNote(payload.getNote());
        cycle.setUpdatedAt(LocalDateTime.now());
        cycle.setFlowVolume(payload.getFlowVolume());
        cycle.setOvulationDate(payload.getOvulationDate());
        cycle.setWeight(payload.getWeight());
        menstrualCycleRepo.save(cycle);
    }

    // New methods for isTrackingEnabled
    @Transactional
    public void toggleTrackingEnabled(Integer cycleId) {
        MenstrualCycle cycle = menstrualCycleRepo.findById(cycleId)
                .orElseThrow(() -> new AppException(404, "Menstrual cycle not found"));
        
        cycle.setIsTrackingEnabled(!cycle.getIsTrackingEnabled());
        cycle.setUpdatedAt(LocalDateTime.now());
        menstrualCycleRepo.save(cycle);
    }

    public List<MenstrualCycleDTO> getActiveTrackingCycles(int customerId) {
        List<MenstrualCycleDTO> cycles = menstrualCycleRepo.getActiveTrackingCyclesByCustomerId(customerId);
        if (cycles.isEmpty()) {
            throw new AppException(404, "No active tracking cycles found for this customer");
        }
        return cycles;
    }

    // New methods for flowVolume
    public MenstrualCycleDTO updateFlowVolume(Integer cycleId, Integer flowVolume) {
        if (flowVolume != null && (flowVolume < 0 || flowVolume > 500)) {
            throw new AppException(400, "Flow volume must be between 0 and 500 ml");
        }

        MenstrualCycle cycle = menstrualCycleRepo.findById(cycleId)
                .orElseThrow(() -> new AppException(404, "Menstrual cycle not found"));
        
        cycle.setFlowVolume(flowVolume);
        cycle.setUpdatedAt(LocalDateTime.now());
        
        MenstrualCycle saved = menstrualCycleRepo.save(cycle);
        
        return new MenstrualCycleDTO(
                saved.getCycleId(),
                saved.getStartDate(),
                saved.getCycleLength(),
                saved.getIsTrackingEnabled(),
                saved.getCreatedAt(),
                saved.getUpdatedAt(),
                saved.getEndDate(),
                saved.getSeverity(),
                saved.getStatus(),
                saved.getNote(),
                saved.getFlowVolume(),
                saved.getOvulationDate(),
                saved.getWeight()
        );
    }

    public Map<String, Object> getFlowVolumeStatistics(int customerId) {
        List<MenstrualCycleDTO> cycles = getCyclesByCustomerId(customerId);
        
        List<Integer> flowVolumes = cycles.stream()
                .map(MenstrualCycleDTO::getFlowVolume)
                .filter(volume -> volume != null)
                .toList();
        
        if (flowVolumes.isEmpty()) {
            throw new AppException(404, "No flow volume data found for this customer");
        }
        
        double average = flowVolumes.stream()
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0.0);
        
        int min = flowVolumes.stream()
                .mapToInt(Integer::intValue)
                .min()
                .orElse(0);
        
        int max = flowVolumes.stream()
                .mapToInt(Integer::intValue)
                .max()
                .orElse(0);
        
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("averageFlowVolume", Math.round(average * 100.0) / 100.0);
        statistics.put("minFlowVolume", min);
        statistics.put("maxFlowVolume", max);
        statistics.put("totalRecords", flowVolumes.size());
        
        return statistics;
    }

    public List<MenstrualCycleDTO> getCyclesByFlowVolumeRange(int customerId, Integer minVolume, Integer maxVolume) {
        if (minVolume == null) minVolume = 0;
        if (maxVolume == null) maxVolume = 500;
        
        if (minVolume < 0 || maxVolume > 500 || minVolume > maxVolume) {
            throw new AppException(400, "Invalid flow volume range. Must be between 0-500 ml and min <= max");
        }
        
        List<MenstrualCycleDTO> cycles = menstrualCycleRepo.getCyclesByFlowVolumeRange(customerId, minVolume, maxVolume);
        if (cycles.isEmpty()) {
            throw new AppException(404, "No cycles found with flow volume in the specified range");
        }
        return cycles;
    }
}
