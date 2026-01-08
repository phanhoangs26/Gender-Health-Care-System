package com.gender_healthcare_system.dtos.todo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
public class TestingServiceTypeDTO implements Serializable {

    private Integer serviceTypeId;

    private String title;

    private String content;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm")
    @Schema(type = "string", example = "05/06/2025 07:00")
    private LocalDateTime createdAt;

    public TestingServiceTypeDTO(int serviceTypeId, String title, String content, LocalDateTime createdAt) {
        this.serviceTypeId = serviceTypeId;
        this.title = title;
        this.content = content;
        this.createdAt = createdAt;
    }
}
