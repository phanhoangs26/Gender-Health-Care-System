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
import com.gender_healthcare_system.dtos.todo.CertificateDTO;
import com.gender_healthcare_system.dtos.user.ConsultantDTO;
import com.gender_healthcare_system.entities.enu.AccountStatus;
import com.gender_healthcare_system.exceptions.AppException;
import com.gender_healthcare_system.payloads.user.ConsultantUpdatePayload;
import com.gender_healthcare_system.repositories.AccountRepo;
import com.gender_healthcare_system.repositories.CertificateRepo;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ConsultantService {

    private final AccountRepo accountRepo;

    private final CertificateRepo certificateRepo;

    public LoginResponse getConsultantLoginDetails(int id) {
        return accountRepo.getConsultantLoginDetails(id);
    }

    //get all consultant
    public List<ConsultantDTO> getAllConsultantsForCustomer() {
        List<ConsultantDTO> consultants = accountRepo
                .getAllConsultantsForCustomer(AccountStatus.ACTIVE);
        if (consultants.isEmpty()) {
            throw new AppException(404, "No Consultants found");
        }
        return consultants;
    }

    public Map<String, Object> getAllConsultants(int page, String sortField, String sortOrder) {

        final int itemSize = 10;

        Sort sort = Sort.by(Sort.Direction.ASC, sortField);

        if (sortOrder.equals("desc")) {
            sort = Sort.by(Sort.Direction.DESC, sortField);
        }

        Pageable pageRequest = PageRequest
                .of(page, itemSize, sort);


        Page<ConsultantDTO> pageResult = accountRepo.getAllConsultants(pageRequest);

        if (!pageResult.hasContent()) {

            throw new AppException(404, "No Consultants found");
        }

        List<ConsultantDTO> consultantList = pageResult.getContent();

        Map<String, Object> map = new HashMap<>();
        map.put("totalItems", pageResult.getTotalElements());
        map.put("consultants", consultantList);
        map.put("totalPages", pageResult.getTotalPages());
        map.put("currentPage", pageResult.getNumber());

        return map;
    }

    public ConsultantDTO getConsultantDetails(int consultantId) {
        ConsultantDTO consultantDetail =
                accountRepo.getConsultantDetailsById(consultantId)
                        .orElseThrow(() -> new AppException(404, "Consultant not found"));

        List<CertificateDTO> certificateList =
                certificateRepo.getCertificatesByConsultantId(consultantId);

        consultantDetail.setCertificateList(certificateList);
        consultantDetail.setPassword(null);

        return consultantDetail;
    }

    public ConsultantDTO getConsultantDetailsForManager(int consultantId) {
        ConsultantDTO consultantDetail =
                accountRepo.getConsultantDetailsById(consultantId)
                        .orElseThrow(() -> new AppException(404, "Consultant not found"));

        List<CertificateDTO> certificateList =
                certificateRepo.getCertificatesByConsultantId(consultantId);

        consultantDetail.setCertificateList(certificateList);

        return consultantDetail;
    }

    @Transactional
    public void updateConsultantDetails(int consultantId, ConsultantUpdatePayload payload) {
        boolean consultantExist = accountRepo.existsByAccountIdAndRole_RoleNameAndStatus(consultantId, "CONSULTANT", AccountStatus.ACTIVE);

        if (!consultantExist) {

            throw new AppException(404, "Consultant not found");
        }

        accountRepo.updateConsultantById(consultantId, payload);
    }
}
