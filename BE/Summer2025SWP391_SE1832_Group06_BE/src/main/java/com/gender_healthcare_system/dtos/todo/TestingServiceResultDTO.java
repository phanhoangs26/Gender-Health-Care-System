package com.gender_healthcare_system.dtos.todo;

import java.io.Serializable;
import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.gender_healthcare_system.entities.enu.ResultType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TestingServiceResultDTO implements Serializable {

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Integer serviceResultId;

    private String title;

    private String description;

    private ResultType resultType;

    private String measureUnit;

    private BigDecimal positiveThreshold;

    private BigDecimal minValue;

    private BigDecimal maxValue;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String result;

    public TestingServiceResultDTO(Integer serviceResultId, String title,
                                   String description, ResultType resultType,
                                   String measureUnit, BigDecimal minValue, BigDecimal maxValue, BigDecimal positiveThreshold) {
        this.serviceResultId = serviceResultId;
        this.title = title;
        this.description = description;
        this.resultType = resultType;
        this.measureUnit = measureUnit;
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.positiveThreshold = positiveThreshold;
    }
}
