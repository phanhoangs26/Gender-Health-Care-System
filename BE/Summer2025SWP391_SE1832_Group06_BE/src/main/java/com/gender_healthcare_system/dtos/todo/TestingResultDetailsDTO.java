package com.gender_healthcare_system.dtos.todo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TestingResultDetailsDTO implements Serializable {

    private List<TestingServiceResultDTO> resultList;

    private String overallResult;
}
