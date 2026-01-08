package com.gender_healthcare_system.dtos.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StatisticResponseDTO implements Serializable {

    private Date date;
    private Long totalCount;
    private Long totalAmount;
}
