package com.gender_healthcare_system.payloads.todo;

import java.io.Serializable;

import org.hibernate.annotations.Nationalized;
import org.hibernate.validator.constraints.Length;

import com.gender_healthcare_system.entities.enu.BlogStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BlogUpdatePayload implements Serializable {

    @Nationalized
    @NotBlank(message = "Title is required")
    @Length(min = 5, max = 100, message = "Blog title by must be between 5 and 100 characters")
    private String title;

    @Nationalized
    @NotBlank(message = "Content is required")
    @Length(min = 10, message = "Blog content must be at least 10 characters")
    private String content;
}
