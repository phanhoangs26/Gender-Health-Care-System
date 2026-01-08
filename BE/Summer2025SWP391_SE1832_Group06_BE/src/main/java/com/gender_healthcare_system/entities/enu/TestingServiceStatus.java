package com.gender_healthcare_system.entities.enu;

public enum TestingServiceStatus {
    REMOVED,
    UNAVAILABLE,
    AVAILABLE;

    public String getTestingServiceStatus() {
        return this.name();
    }
}
