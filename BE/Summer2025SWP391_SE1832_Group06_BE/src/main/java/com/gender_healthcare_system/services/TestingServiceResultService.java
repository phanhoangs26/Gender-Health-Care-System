package com.gender_healthcare_system.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.gender_healthcare_system.dtos.todo.TestingServiceResultDTO;
import com.gender_healthcare_system.exceptions.AppException;
import com.gender_healthcare_system.repositories.TestingServiceBookingRepo;
import com.gender_healthcare_system.repositories.TestingServiceRepo;
import com.gender_healthcare_system.repositories.TestingServiceResultRepo;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class TestingServiceResultService {

    private final TestingServiceResultRepo testingServiceResultRepo;

    private final TestingServiceBookingRepo testingServiceBookingRepo;

    private final TestingServiceRepo testingServiceRepo;

    public List<TestingServiceResultDTO> getAllServiceResultsByBookingId(int testingBookingId){
        boolean bookingExist = testingServiceBookingRepo.existsById(testingBookingId);
        if(!bookingExist){
            throw new AppException(404,
                    "No Testing Booking found with ID " +testingBookingId);
        }
        // Đã bỏ lọc genderType, chỉ lấy theo serviceId
        // Cần lấy serviceId từ booking
        Integer serviceId = testingServiceBookingRepo.findServiceIdByBookingId(testingBookingId);
        if(serviceId == null){
            throw new AppException(404, "No Testing Service found for booking ID " + testingBookingId);
        }
        return testingServiceResultRepo.getAllServiceResultsByServiceId(serviceId);
    }

    public List<TestingServiceResultDTO>
    getAllServiceResultsByServiceId(int testingServiceId){

        boolean serviceExist = testingServiceRepo.existsById(testingServiceId);

        if(!serviceExist){
            throw new AppException(404,
                    "No Testing Service found with ID " +testingServiceId);
        }

        return testingServiceResultRepo.
                getAllServiceResultsByServiceId(testingServiceId);

    }
    /*@Transactional
    public void updateTestingServiceResult
            (int id, TestingServiceResultPayload payload) {
        boolean serviceResultExists = testingServiceResultRepo.existsById(id);
        if (!serviceResultExists) {
            throw new AppException(404, "Testing Service result not found with ID: " + id);
        }

        testingServiceResultRepo.updateTestingServiceResult(id, payload);

    }*/

    public void deleteTestingServiceResult(int id) {
        boolean serviceResultExists = testingServiceResultRepo.existsById(id);
        if (!serviceResultExists) {
            throw new AppException(404, "Testing Service result not found with ID: " + id);
        }
        testingServiceResultRepo.deleteTestingServiceResultById(id);
    }
}
