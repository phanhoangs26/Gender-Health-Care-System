package com.gender_healthcare_system.entities.enu;

public enum SymptomStatus {
    ACTIVE,
    RESOLVED,
    IGNORED;

    public String getStatus() {
        return this.name();
    }
} 