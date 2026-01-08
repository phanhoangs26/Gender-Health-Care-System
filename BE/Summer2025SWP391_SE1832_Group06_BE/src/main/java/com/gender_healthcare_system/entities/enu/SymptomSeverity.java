package com.gender_healthcare_system.entities.enu;

public enum SymptomSeverity {
    LIGHT,
    MEDIUM,
    SEVERE;

    public String getStatus() {
        return this.name();
    }
} 