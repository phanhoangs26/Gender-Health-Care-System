package com.gender_healthcare_system.payloads.todo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO nhận dữ liệu cập nhật cho TestingServiceBooking.
 * Dùng kèm @Validated ở tầng Service/Controller để đảm bảo dữ liệu hợp lệ trước khi gọi repo.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestingServiceBookingCompletePayload implements Serializable {

    @NotNull(message = "Real Start time is required")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm")
    @Schema(type = "string", example = "05/06/2025 07:00")
    private LocalDateTime realStartTime;

    @NotNull(message = "Real End time is required")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm")
    @Schema(type = "string", example = "05/06/2025 07:00")
    private LocalDateTime realEndTime;

    @Valid
    @NotNull(message = "Result List is required")
    private List<TestingServiceResultCompletePayload> resultList;

    @NotNull(message = "Overall Result is required")
    @Pattern(
            regexp = "^(POSITIVE|NEGATIVE|INDETERMINATE)$",
            message = "Overall Result must be one of these values:" +
                    " POSITIVE, NEGATIVE, INDETERMINATE"
    )
    private String overallResult;


}
