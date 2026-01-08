package com.gender_healthcare_system.payloads.todo;
import java.time.LocalDate;

import lombok.Data;

@Data
public class MenstrualCreatePayload {

    private LocalDate startDate;
    private Integer cycleLength;
    private Boolean isTrackingEnabled;
    private LocalDate endDate;

    private Integer flowVolume;
    private LocalDate ovulationDate;
    private Double weight;
}
