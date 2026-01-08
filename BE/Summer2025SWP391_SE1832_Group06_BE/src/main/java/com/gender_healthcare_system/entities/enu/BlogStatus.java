package com.gender_healthcare_system.entities.enu;

public enum BlogStatus {
    ACTIVE,
    UNACTIVE,
    DELETED;

    public String getStatus() {
        return this.name();
    }
}
