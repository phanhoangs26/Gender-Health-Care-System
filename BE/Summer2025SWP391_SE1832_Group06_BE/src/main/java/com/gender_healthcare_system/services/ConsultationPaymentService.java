package com.gender_healthcare_system.services;

import com.gender_healthcare_system.repositories.ConsultationPaymentRepo;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class ConsultationPaymentService {

    private final ConsultationPaymentRepo consultationPaymentRepo;

    //updateTestingServiceFormById
    /*@Transactional
    public void updateTestingServiceFormById(int id, String newContent){
        boolean formExists = testingServiceFormRepo.existsById(id);
        if (!formExists) {
            throw new AppException(404, "Testing Service Form not found with ID: " + id);
        }
        testingServiceFormRepo.updateContentById(id, newContent);
    }

    //deleteTestingServiceFormById
    public void deleteTestingServiceFormById(int id){
        boolean formExists = testingServiceFormRepo.existsById(id);
        if (!formExists) {
            throw new AppException(404, "Testing Service Form not found with ID: " + id);
        }
        testingServiceFormRepo.deleteByServiceFormId(id);
    }*/
}
