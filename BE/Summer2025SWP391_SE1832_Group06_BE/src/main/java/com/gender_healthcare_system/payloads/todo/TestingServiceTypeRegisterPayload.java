package com.gender_healthcare_system.payloads.todo;

import jakarta.annotation.Nullable;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;
import org.hibernate.validator.constraints.Length;

import java.io.Serializable;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TestingServiceTypeRegisterPayload implements Serializable {

    // Đã xóa serviceTypeName

    @Nationalized
    @NotBlank(message = "Title is required")
    @Length(min = 5, max = 100, message = "Service type title must be between 5 and 100 characters")
    private String title;

    @Nationalized
    @Size(min = 5,max = 255, message = "Service type content must be empty or between 5 and 255 characters")
    private String content;

    @Valid
    @NotNull(message = "Must have at leat one result template in Result list")
    private List<TestingServiceResultPayload> serviceResultList;

}
