package com.gender_healthcare_system.services;

import com.gender_healthcare_system.dtos.todo.CertificateDTO;
import com.gender_healthcare_system.exceptions.AppException;
import com.gender_healthcare_system.payloads.todo.CertificateUpdatePayload;
import com.gender_healthcare_system.repositories.CertificateRepo;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@AllArgsConstructor
public class CertificateService {

    private CertificateRepo certificateRepo;

    //get certificate by consultant id
    public List<CertificateDTO> getConsultantCertificates(int consultantId) {
        List<CertificateDTO> certificates = certificateRepo.getCertificatesByConsultantId(consultantId);
        if (certificates.isEmpty()) {
            throw new AppException(404, "No certificates found for this consultant");
        }
        return certificates;
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateConsultantCertificate(int certificateId, CertificateUpdatePayload payload) {
        boolean certificateExist = certificateRepo.existsById(certificateId);

        if (!certificateExist) {

            throw new AppException(404, "Certificate not found");
        }

        certificateRepo.updateCertificateById(certificateId, payload);

    }
}
