package com.gender_healthcare_system.payloads.todo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;
import org.hibernate.validator.constraints.Length;

import java.io.Serializable;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CertificateRegisterPayload implements Serializable {

    @Nationalized
    @NotBlank(message = "CertificateName is required")
    @Length(min = 5, max = 100, message = "Certificate name must be between 5 and 100 characters")
    private String certificateName;

    @Nationalized
    @NotBlank(message = "IssuedBy is required")
    @Length(min = 3, max = 100, message = "Issued by must be between 3 and 100 characters")
    private String issuedBy;

    @NotNull(message = "Issue Date is required")
    @Schema(type = "string", example = "05/06/2025")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    private LocalDate issueDate;

    @Schema(type = "string", example = "05/06/2025")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    private LocalDate expiryDate;

    @Nationalized
    @NotBlank(message = "Description is required")
    @Length(min = 5, max = 255, message = "Description must be between 5 and 255 characters")
    private String description;

    @NotBlank(message = "Image URL is required")
    @Length(min = 5, max = 255, message = "Image Url must be between 5 and 255 characters")
    private String imageUrl;
}
