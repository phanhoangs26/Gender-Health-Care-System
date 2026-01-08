package com.gender_healthcare_system.dtos.todo;

import com.gender_healthcare_system.entities.enu.GenderType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConsultationTypeDTO implements Serializable {

    private Integer consultationTypeId;

    @Nationalized
    private String name;

    @Nationalized
    private String description;

    private GenderType targetGender;

    public ConsultationTypeDTO(String name) {
        this.name = name;
    }
}
