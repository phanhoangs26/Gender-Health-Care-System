package com.gender_healthcare_system.payloads.todo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TestingResultDetailsPayload implements Serializable {

    private List<TestingServiceResultCompletePayload> resultList;

    private String overallResult;
}
