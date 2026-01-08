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

import com.gender_healthcare_system.dtos.login.LoginResponse;
import com.gender_healthcare_system.dtos.user.StaffDTO;
import com.gender_healthcare_system.entities.enu.AccountStatus;
import com.gender_healthcare_system.exceptions.AppException;
import com.gender_healthcare_system.payloads.user.StaffUpdatePayload;
import com.gender_healthcare_system.repositories.AccountRepo;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class StaffService  {

    private final AccountRepo accountRepo;

    public LoginResponse getStaffLoginDetails(int id){
        return accountRepo.getStaffLoginDetails(id);
    }

    //getStaffById
    public StaffDTO getStaffById(int id) {
        return accountRepo.getStaffDetailsById(id)
                .orElseThrow(() -> new AppException(404, "Staff not found"));
    }

    //getAllStaffs
    public Map<String, Object> getAllStaffs(int page, String sortField, String sortOrder) {

        final int itemSize = 10;

        Sort sort = Sort.by(Sort.Direction.ASC, sortField);

        if(sortOrder.equals("desc")){
            sort = Sort.by(Sort.Direction.DESC, sortField);
        }

        Pageable pageRequest = PageRequest
                .of(page, itemSize, sort);


        Page<StaffDTO> pageResult = accountRepo.getAllStaff(pageRequest);

        if(!pageResult.hasContent()){

            throw new AppException(404, "No Staffs found");
        }

        List<StaffDTO> staffList = pageResult.getContent();

        Map<String, Object> map = new HashMap<>();

        map.put("totalItems", pageResult.getTotalElements());
        map.put("staffs", staffList);
        map.put("totalPages", pageResult.getTotalPages());
        map.put("currentPage", pageResult.getNumber());

        return map;
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateStaffAccount(int staffId, StaffUpdatePayload payload) {
        boolean staffExist = accountRepo.existsByAccountIdAndRole_RoleName(staffId, "STAFF");

        if(!staffExist) {

                throw new AppException(404, "Staff not found");
        }

        boolean accountStatusIdentical = accountRepo
                .existsAccountByAccountIdAndStatus(staffId, payload.getStatus());

        if(!accountStatusIdentical){

            accountRepo.updateAccountStatus(staffId, payload.getStatus());
        }
        accountRepo.updateStaffById(staffId, payload);
    }
}
