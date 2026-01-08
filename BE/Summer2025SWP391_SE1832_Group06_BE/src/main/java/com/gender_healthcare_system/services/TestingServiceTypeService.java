package com.gender_healthcare_system.services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gender_healthcare_system.dtos.todo.TestingServiceTypeDTO;
import com.gender_healthcare_system.dtos.todo.TestingServiceTypeDetailsDTO;
import com.gender_healthcare_system.entities.todo.TestingServiceType;
import com.gender_healthcare_system.entities.enu.GenderType;
import com.gender_healthcare_system.exceptions.AppException;
import com.gender_healthcare_system.payloads.todo.TestingServiceTypeRegisterPayload;
import com.gender_healthcare_system.payloads.todo.TestingServiceTypeUpdatePayload;
import com.gender_healthcare_system.repositories.TestingServiceTypeRepo;
import com.gender_healthcare_system.utils.UtilFunctions;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class TestingServiceTypeService {

    private final TestingServiceTypeRepo testingServiceTypeRepo;

    public TestingServiceTypeDetailsDTO getTestingServiceTypeById(int id) {
        TestingServiceTypeDetailsDTO serviceTypeDetails = testingServiceTypeRepo.getTestingServiceDetailsById(id)
                .orElseThrow(() -> new AppException(404, "Testing Service type not found with ID: " + id));
        return serviceTypeDetails;
    }

    public Map<String, Object> getAllTestingServiceTypes(int page, String sortField, String sortOrder) {

        final int itemSize = 10;

        Sort sort = Sort.by(Sort.Direction.ASC, sortField);

        if (sortOrder.equals("desc")) {
            sort = Sort.by(Sort.Direction.DESC, sortField);
        }

        Pageable pageRequest = PageRequest
                .of(page, itemSize, sort);

        Page<TestingServiceTypeDTO> pageResult = testingServiceTypeRepo.getAllTestingServiceTypes(pageRequest);

        if (!pageResult.hasContent()) {

            throw new AppException(404, "No Testing Service Types found");
        }

        List<TestingServiceTypeDTO> serviceTypeList = pageResult.getContent();

        Map<String, Object> map = new HashMap<>();

        map.put("totalItems", pageResult.getTotalElements());
        map.put("serviceTypes", serviceTypeList);
        map.put("totalPages", pageResult.getTotalPages());
        map.put("currentPage", pageResult.getNumber());

        return map;
    }

    public Map<String, Object> getAllTestingServiceTypesForCustomerByGender(GenderType gender, int page, String sort, String order) {
        final int itemSize = 10;

        Sort sortObj = Sort.by(Sort.Direction.ASC, sort);

        if (order.equals("desc")) {
            sortObj = Sort.by(Sort.Direction.DESC, sort);
        }

        Pageable pageRequest = PageRequest.of(page, itemSize, sortObj);

        Page<TestingServiceTypeDTO> pageResult = testingServiceTypeRepo
                .getAllTestingServiceTypesForCustomerByGender(gender, pageRequest);

        if (!pageResult.hasContent()) {
            throw new AppException(404, "No Testing Service Types found for gender " + gender);
        }

        Map<String, Object> map = new HashMap<>();
        map.put("totalItems", pageResult.getTotalElements());
        map.put("serviceTypes", pageResult.getContent());
        map.put("totalPages", pageResult.getTotalPages());
        map.put("currentPage", pageResult.getNumber());
        return map;
    }

    // Create a new testing service type
    @Transactional(rollbackFor = Exception.class)
    public void createTestingServiceType(TestingServiceTypeRegisterPayload payload) {
        TestingServiceType newServiceType = new TestingServiceType();
        newServiceType.setTitle(payload.getTitle());
        newServiceType.setContent(payload.getContent());
        newServiceType.setCreatedAt(UtilFunctions.getCurrentDateTimeWithTimeZone());
        testingServiceTypeRepo.saveAndFlush(newServiceType);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateTestingServiceType(int id, TestingServiceTypeUpdatePayload payload) {
        boolean serviceTypeExists = testingServiceTypeRepo.existsById(id);
        if (!serviceTypeExists) {
            throw new AppException(404, "Testing Service type not found with ID: " + id);
        }

        testingServiceTypeRepo.updateTestingServiceType(id, payload);

    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteTestingServiceType(int id) {
        boolean serviceExists = testingServiceTypeRepo.existsById(id);
        if (!serviceExists) {
            throw new AppException(404, "Testing Service type not found with ID: " + id);
        }
        testingServiceTypeRepo.deleteTestingServiceTypeById(id);
    }
}
