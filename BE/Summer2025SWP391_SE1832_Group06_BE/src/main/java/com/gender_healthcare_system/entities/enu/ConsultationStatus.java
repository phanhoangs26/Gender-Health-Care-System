package com.gender_healthcare_system.entities.enu;

public enum ConsultationStatus {
    CANCELLED,
    COMPLETED,
    RESCHEDULED,
    CONFIRMED;

    public String getStatus() {
        return this.name();
    }
}
