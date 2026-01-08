package com.gender_healthcare_system.dtos.todo;

import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.gender_healthcare_system.entities.enu.TestingServiceStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TestingServiceDTO implements Serializable {

    private Integer serviceId;

    private String serviceName;

    private String description;

    private String overallFlagLogic;

    private Long priceAmount;

    private String priceDescription;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private TestingServiceStatus status;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private TestingServiceTypeDTO testingServiceType;

    public TestingServiceDTO(Integer serviceId, String serviceName, String description,
                             String overallFlagLogic, TestingServiceStatus status) {
        this.serviceId = serviceId;
        this.serviceName = serviceName;
        this.description = description;
        this.overallFlagLogic = overallFlagLogic;
        this.status = status;
    }

    public TestingServiceDTO(Integer serviceId, String serviceName, String description,
                             String overallFlagLogic, TestingServiceStatus status,
                             Long priceAmount, String priceDescription,
                             TestingServiceTypeDTO testingServiceType) {
        this.serviceId = serviceId;
        this.serviceName = serviceName;
        this.description = description;
        this.overallFlagLogic = overallFlagLogic;
        this.status = status;
        this.testingServiceType = testingServiceType;
        this.priceAmount = priceAmount;
        this.priceDescription = priceDescription;
    }

    public TestingServiceDTO(Integer serviceId, String serviceName, String description,
                             Long priceAmount, String priceDescription,
                             TestingServiceStatus status) {
        this.serviceId = serviceId;
        this.serviceName = serviceName;
        this.description = description;
        this.priceAmount = priceAmount;
        this.priceDescription = priceDescription;
        this.status = status;
    }

    
    public TestingServiceDTO(Integer serviceId, String serviceName, String description, TestingServiceStatus status) {
        this.serviceId = serviceId;
        this.serviceName = serviceName;
        this.description = description;
        this.status = status;
    }

    public TestingServiceDTO(Integer serviceId, String serviceName, String description,
                             Long priceAmount, String priceDescription) {
        this.serviceId = serviceId;
        this.serviceName = serviceName;
        this.description = description;
        this.priceAmount = priceAmount;
        this.priceDescription = priceDescription;
    }

    public TestingServiceDTO(Integer serviceId,
                             String serviceName,
                             String description,
                             TestingServiceStatus status,
                             Long priceAmount,
                             String priceDescription,
                             TestingServiceTypeDTO testingServiceType) {
        this.serviceId = serviceId;
        this.serviceName = serviceName;
        this.description = description;
        this.status = status;
        this.priceAmount = priceAmount;
        this.priceDescription = priceDescription;
        this.testingServiceType = testingServiceType;
    }

}
