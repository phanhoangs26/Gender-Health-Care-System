package com.gender_healthcare_system.entities.todo;

import com.gender_healthcare_system.entities.enu.GenderType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.Nationalized;

import java.io.Serializable;
import java.util.List;

@Entity
@Table(name = "ConsultationType")
@ToString(exclude = "consultations")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConsultationType implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "type_id")
    private int typeId;

    @Nationalized
    @Column(name = "name", length = 50, unique = true, nullable = false)
    private String name;

    @Nationalized
    @Column(name = "description", length = 500, nullable = false)
    private String description;

    @Column(name = "target_gender", nullable = false, length = 15)
    @Enumerated(EnumType.STRING)
    private GenderType targetGender;

    @OneToMany(mappedBy = "consultationType")
    private List<Consultation> consultations;
}
