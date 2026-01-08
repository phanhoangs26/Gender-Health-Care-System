package com.gender_healthcare_system.services;

import com.gender_healthcare_system.entities.enu.PaymentStatus;
import com.gender_healthcare_system.entities.todo.TestingServicePayment;
import com.gender_healthcare_system.repositories.TestingServicePaymentRepo;
import lombok.AllArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@AllArgsConstructor
public class TestingServicePaymentService {

    private final TestingServicePaymentRepo testingServicePaymentRepo;

    //getALlPayments
    public List<TestingServicePayment> getAllPayments() {
        return testingServicePaymentRepo.findAll();
    }

    //getPaymentById
    public TestingServicePayment getPaymentById(int id) {
        return testingServicePaymentRepo.findById(id).orElse(null);
    }

    //createPayment
    public TestingServicePayment createPayment(TestingServicePayment testingServicePayment) {
        return testingServicePaymentRepo.save(testingServicePayment);
    }

    //updatePayment
    @Transactional
    public TestingServicePayment updatePayment(int id, TestingServicePayment testingServicePayment) {
        if (testingServicePaymentRepo.existsById(id)) {
            //testingServicePayment.setPaymentId(id);
            return testingServicePaymentRepo.save(testingServicePayment);
        }
        return null;
    }

    //deletePayment
    public void deletePayment(int id) {
        if (testingServicePaymentRepo.existsById(id)) {
            testingServicePaymentRepo.deleteById(id);
        }
    }

    //getPaymentByStaffId
    /*public List<TestingServicePayment> getPaymentsByStaffId(int staffId) {
        return paymentRepo.findByStaff_StaffId(staffId);
    }*/

    //getPaymentsByStatus
    public List<TestingServicePayment> getPaymentsByStatus(PaymentStatus status) {
        return testingServicePaymentRepo.findByStatus(status);
    }

    //updatePaymentStatus
    public TestingServicePayment updatePaymentStatus(int id, PaymentStatus newStatus) {
        TestingServicePayment testingServicePayment = testingServicePaymentRepo.findById(id).orElse(null);
        if (testingServicePayment != null) {
            testingServicePayment.setStatus(newStatus);
            return testingServicePaymentRepo.save(testingServicePayment);
        }
        return null;
    }

}