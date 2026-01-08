package com.gender_healthcare_system.services;

import com.gender_healthcare_system.dtos.todo.TestingServiceDTO;
import com.gender_healthcare_system.entities.enu.TestingServiceStatus;
import com.gender_healthcare_system.entities.todo.TestingService;
import com.gender_healthcare_system.entities.todo.TestingServiceType;
import com.gender_healthcare_system.exceptions.AppException;
import com.gender_healthcare_system.payloads.todo.TestingServiceRegisterPayload;
import com.gender_healthcare_system.payloads.todo.TestingServiceUpdatePayload;
import com.gender_healthcare_system.repositories.TestingServiceRepo;
import com.gender_healthcare_system.repositories.TestingServiceTypeRepo;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
public class TestingService_Service {

    private final TestingServiceRepo testingServiceRepo;

    private final TestingServiceTypeRepo testingServiceTypeRepo;

    public TestingServiceDTO getTestingServiceById(int id) {
        return testingServiceRepo.getTestingServiceById(id)
                .orElseThrow(() -> new AppException(404, "Testing Service not found with ID: " + id));
    }

    // SỬA: Bỏ tham số gender vì repository không còn nhận gender nữa
    public Map<String, Object> getAllTestingServicesForCustomerByGender
            (int page, String sortField, String sortOrder) {

        final int itemSize = 10;

        Sort sort = Sort.by(Sort.Direction.ASC, sortField);

        if (sortOrder.equals("desc")) {
            sort = Sort.by(Sort.Direction.DESC, sortField);
        }

        Pageable pageRequest = PageRequest
                .of(page, itemSize, sort);

        Page<TestingServiceDTO> pageResult = testingServiceRepo
                .getAllTestingServicesForCustomerByGender(pageRequest);

        if (!pageResult.hasContent()) {
            throw new AppException(404, "No Testing Services found");
        }

        List<TestingServiceDTO> serviceList = pageResult.getContent();

        Map<String, Object> map = new HashMap<>();

        map.put("totalItems", pageResult.getTotalElements());
        map.put("testingServices", serviceList);
        map.put("totalPages", pageResult.getTotalPages());
        map.put("currentPage", pageResult.getNumber());

        return map;
    }

    public Map<String, Object> getAllTestingServices(int page, String sortField, String sortOrder) {

        final int itemSize = 10;

        Sort sort = Sort.by(Sort.Direction.ASC, sortField);

        if (sortOrder.equals("desc")) {
            sort = Sort.by(Sort.Direction.DESC, sortField);
        }

        Pageable pageRequest = PageRequest
                .of(page, itemSize, sort);

        Page<TestingServiceDTO> pageResult = testingServiceRepo
                .getAllTestingServices(pageRequest);

        if (!pageResult.hasContent()) {

            throw new AppException(404, "No Testing Services found");
        }

        List<TestingServiceDTO> serviceList = pageResult.getContent();

        Map<String, Object> map = new HashMap<>();

        map.put("totalItems", pageResult.getTotalElements());
        map.put("testingServices", serviceList);
        map.put("totalPages", pageResult.getTotalPages());
        map.put("currentPage", pageResult.getNumber());

        return map;
    }

    public List<TestingServiceDTO> getAllTestingServicesForATestingTypes(int typeId) {
        List<TestingServiceDTO> list = testingServiceRepo
                .findByTestingServiceTypeId(typeId);

        if (list == null || list.isEmpty()) {
            throw new AppException(404, "No Testing Services found for typeId " + typeId);
        }
        return list;
    }

    // Create a new testing service
    @Transactional(rollbackFor = Exception.class)
    public void createTestingService(TestingServiceRegisterPayload payload) {

        TestingService newService = new TestingService();

        TestingServiceType service = testingServiceTypeRepo
                .findById(payload.getServiceTypeId())
                .orElseThrow(() -> new AppException(404, "No service type found with ID "
                                + payload.getServiceTypeId()));

        newService.setTestingServiceType(service);
        newService.setServiceName(payload.getServiceName());
        newService.setDescription(payload.getDescription());
        newService.setPriceAmount(payload.getPriceAmount());
        newService.setPriceDescription(payload.getPriceDescription());

        newService.setStatus(TestingServiceStatus.AVAILABLE);


        testingServiceRepo.saveAndFlush(newService);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateTestingService(int id, TestingServiceUpdatePayload payload) {
        boolean serviceExists = testingServiceRepo.existsById(id);
        if (!serviceExists) {
            throw new AppException(404, "Testing Service not found with ID: " + id);
        }
        testingServiceRepo.updateTestingService(id, payload);

    }

    public void deleteTestingService(int id) {
        boolean serviceExists = testingServiceRepo.existsById(id);
        if (!serviceExists) {
            throw new AppException(404, "Testing Service not found with ID: " + id);
        }
        testingServiceRepo.deleteById(id);
    }

}
