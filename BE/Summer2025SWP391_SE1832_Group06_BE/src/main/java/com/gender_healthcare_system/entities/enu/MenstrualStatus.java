package com.gender_healthcare_system.entities.enu;

public enum MenstrualStatus {
    NORMAL,
    IRREGULAR,
    PAUSED;

    public String getStatus() {
        return this.name();
    }
} 