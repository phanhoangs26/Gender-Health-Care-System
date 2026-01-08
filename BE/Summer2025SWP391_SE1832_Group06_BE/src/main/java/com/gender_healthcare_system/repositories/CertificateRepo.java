package com.gender_healthcare_system.repositories;

import com.gender_healthcare_system.dtos.todo.CertificateDTO;
import com.gender_healthcare_system.entities.todo.Certificate;
import com.gender_healthcare_system.payloads.todo.CertificateUpdatePayload;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CertificateRepo extends JpaRepository<Certificate, Integer> {

    @Query("SELECT new com.gender_healthcare_system.dtos.todo.CertificateDTO" +
            "(c.certificateId, c.certificateName, c.issuedBy, c.issueDate, " +
            "c.expiryDate, c.description, c.imageUrl)" +
            "FROM Certificate c " +
            "JOIN c.consultant " +
            "WHERE c.consultant.accountId = :id")
    List<CertificateDTO> getCertificatesByConsultantId(int id);

    @Modifying
    @Query("UPDATE Certificate c SET " +
            "c.certificateName = :#{#payload.certificateName}, " +
            "c.imageUrl = :#{#payload.imageUrl}, " +
            "c.issuedBy = :#{#payload.issuedBy}, " +
            "c.issueDate = :#{#payload.issueDate}, " +
            "c.expiryDate = :#{#payload.expiryDate}, " +
            "c.description = :#{#payload.description} " +
            "WHERE c.certificateId = :id")
    void updateCertificateById(int id, @Param("payload")CertificateUpdatePayload payload);
}
