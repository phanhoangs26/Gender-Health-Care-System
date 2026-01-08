package com.gender_healthcare_system.payloads.todo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;
import org.hibernate.validator.constraints.Length;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BlogRegisterPayload implements Serializable {

    @NotNull(message = "Manager ID is required")
    private Integer managerId;

    @Nationalized
    @NotBlank(message = "Author is required")
    @Length(min = 5, max = 50, message = "Blog author must be between 5 and 50 characters")
    private String author;

    @Nationalized
    @NotBlank(message = "Title is required")
    @Length(min = 5, max = 100, message = "Blog title must be between 5 and 100 characters")
    private String title;

    @Nationalized
    @NotBlank(message = "Content is required")
    @Length(min = 10, message = "Blog content must be at least 10 characters")
    private String content;

}
