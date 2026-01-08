package com.gender_healthcare_system.entities.enu;

public enum ResultType {
    NUMERIC,
    POSITIVE_NEGATIVE,
    TEXT;

    public String getType(){
        return this.name();
    }
}
