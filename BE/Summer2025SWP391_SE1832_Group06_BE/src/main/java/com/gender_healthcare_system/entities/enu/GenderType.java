package com.gender_healthcare_system.entities.enu;

public enum GenderType {
    MALE,
    FEMALE,
    ANY;

    public String getType(){
        return this.name();
    }
}
