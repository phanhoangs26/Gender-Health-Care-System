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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.gender_healthcare_system.dtos.login.LoginResponse;
import com.gender_healthcare_system.dtos.user.CustomerDTO;
import com.gender_healthcare_system.entities.user.Account;
import com.gender_healthcare_system.exceptions.AppException;
import com.gender_healthcare_system.payloads.user.CustomerUpdatePayload;
import com.gender_healthcare_system.repositories.AccountRepo;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CustomerService {

    private final AccountRepo accountRepo;
    private final MenstrualCycleService menstrualCycleService;

    public LoginResponse getCustomerLoginDetails(int id) {
        return accountRepo.getCustomerLoginDetails(id);
    }

    public CustomerDTO getCustomerById(int id) throws JsonProcessingException {
        CustomerDTO customerDetails = accountRepo.getCustomerDetailsById(id)
                .orElseThrow(() -> new AppException(404,
                        "Customer not found with ID " + id));
        // Lấy chu kỳ gần nhất nếu có
        try {
            List<com.gender_healthcare_system.dtos.todo.MenstrualCycleDTO> cycles = menstrualCycleService
                    .getCyclesByCustomerId(id);
            if (!cycles.isEmpty()) {
                // Giả sử cycles đã sort theo thời gian giảm dần, lấy chu kỳ mới nhất
                customerDetails.setMenstrualCycle(cycles.get(0));
            }
        } catch (Exception e) {
            // Không có chu kỳ hoặc lỗi, bỏ qua
        }
        Account account = accountRepo.findById(id).orElse(null);
        if (account != null) {
            customerDetails.setMenstrualMedications(account.getMenstrualMedications());
        }
        return customerDetails;
    }

    public CustomerDTO getCustomerForManagerById(int id) throws JsonProcessingException {

        return accountRepo.getCustomerDetailsById(id)
                .orElseThrow(() -> new AppException(404,
                        "Customer not found with ID " + id));
    }

    // public CustomerPeriodDetailsDTO getFemaleCustomerPeriodDetails
    // (int customerId) throws JsonProcessingException {
    //
    // Account account = accountRepo.findById(customerId)
    // .orElseThrow(() -> new AppException(400,
    // "No customer found with ID " + customerId));
    //
    // if (account.getGender() == Gender.MALE){
    //
    // throw new AppException(400, "Cannot get period details for MALE customer");
    // }
    //
    // // Return null since genderSpecificDetails has been removed
    // return null;
    // }

    public Map<String, Object> getAllCustomers(int page, String sortField, String sortOrder) {

        final int itemSize = 10;

        Sort sort = Sort.by(Sort.Direction.ASC, sortField);

        if (sortOrder.equals("desc")) {
            sort = Sort.by(Sort.Direction.DESC, sortField);
        }

        Pageable pageRequest = PageRequest
                .of(page, itemSize, sort);

        Page<CustomerDTO> pageResult = accountRepo.getAllCustomers(pageRequest);

        if (!pageResult.hasContent()) {

            throw new AppException(404, "No Customers found");
        }

        List<CustomerDTO> customerList = pageResult.getContent();

        Map<String, Object> map = new HashMap<>();

        map.put("totalItems", pageResult.getTotalElements());
        map.put("customers", customerList);
        map.put("totalPages", pageResult.getTotalPages());
        map.put("currentPage", pageResult.getNumber());

        return map;
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateCustomerDetails(int id, CustomerUpdatePayload payload) throws JsonProcessingException {
        Account account = accountRepo.findById(id)
                .orElseThrow(() -> new AppException(404, "Customer not found with ID " + id));

        account.setFullName(payload.getFullName());
        account.setDateOfBirth(payload.getDateOfBirth());
        account.setGender(payload.getGender());
        account.setPhone(payload.getPhone());
        account.setEmail(payload.getEmail());
        account.setAddress(payload.getAddress());
        account.setMenstrualMedications(payload.getMenstrualMedications());

        accountRepo.save(account);
    }

    // New methods for age calculation and perimenopausal check
    public Map<String, Object> getCustomerAgeInfo(int customerId) throws JsonProcessingException {
        CustomerDTO customer = getCustomerById(customerId);
        
        Map<String, Object> ageInfo = new HashMap<>();
        ageInfo.put("customerId", customer.getAccountId());
        ageInfo.put("fullName", customer.getFullName());
        ageInfo.put("dateOfBirth", customer.getDateOfBirth());
        ageInfo.put("age", customer.getAge());
        ageInfo.put("isPerimenopausalAge", customer.isPerimenopausalAge());
        
        return ageInfo;
    }

    public Map<String, Object> getPerimenopausalCustomers(int page, String sortField, String sortOrder) {
        final int itemSize = 10;
        Sort sort = Sort.by(Sort.Direction.ASC, sortField);
        
        if (sortOrder.equals("desc")) {
            sort = Sort.by(Sort.Direction.DESC, sortField);
        }
        
        Pageable pageRequest = PageRequest.of(page, itemSize, sort);
        Page<CustomerDTO> pageResult = accountRepo.getAllCustomers(pageRequest);
        
        if (!pageResult.hasContent()) {
            throw new AppException(404, "No Customers found");
        }
        
        List<CustomerDTO> allCustomers = pageResult.getContent();
        List<CustomerDTO> perimenopausalCustomers = allCustomers.stream()
                .filter(CustomerDTO::isPerimenopausalAge)
                .toList();
        
        Map<String, Object> result = new HashMap<>();
        result.put("perimenopausalCustomers", perimenopausalCustomers);
        result.put("totalPerimenopausalCustomers", perimenopausalCustomers.size());
        result.put("totalCustomers", pageResult.getTotalElements());
        result.put("currentPage", pageResult.getNumber());
        result.put("totalPages", pageResult.getTotalPages());
        
        return result;
    }

    public Map<String, Object> getCustomersByAgeRange(int minAge, int maxAge, int page, String sortField, String sortOrder) {
        if (minAge < 0 || maxAge < 0 || minAge > maxAge) {
            throw new AppException(400, "Invalid age range. minAge and maxAge must be positive and minAge <= maxAge");
        }
        
        final int itemSize = 10;
        Sort sort = Sort.by(Sort.Direction.ASC, sortField);
        
        if (sortOrder.equals("desc")) {
            sort = Sort.by(Sort.Direction.DESC, sortField);
        }
        
        Pageable pageRequest = PageRequest.of(page, itemSize, sort);
        Page<CustomerDTO> pageResult = accountRepo.getAllCustomers(pageRequest);
        
        if (!pageResult.hasContent()) {
            throw new AppException(404, "No Customers found");
        }
        
        List<CustomerDTO> allCustomers = pageResult.getContent();
        List<CustomerDTO> filteredCustomers = allCustomers.stream()
                .filter(customer -> {
                    Integer age = customer.getAge();
                    return age != null && age >= minAge && age <= maxAge;
                })
                .toList();
        
        Map<String, Object> result = new HashMap<>();
        result.put("customersInAgeRange", filteredCustomers);
        result.put("totalCustomersInRange", filteredCustomers.size());
        result.put("ageRange", minAge + "-" + maxAge);
        result.put("totalCustomers", pageResult.getTotalElements());
        result.put("currentPage", pageResult.getNumber());
        result.put("totalPages", pageResult.getTotalPages());
        
        return result;
    }
}
