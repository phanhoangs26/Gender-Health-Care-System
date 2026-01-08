package com.gender_healthcare_system.entities.enu;

public enum MenstrualSeverity {
    LIGHT,
    MEDIUM,
    HEAVY;

    public String getStatus() {
        return this.name();
    }
}